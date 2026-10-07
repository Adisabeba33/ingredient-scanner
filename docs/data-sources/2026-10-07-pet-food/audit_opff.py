#!/usr/bin/env python3
"""Audit the official Open Pet Food Facts dump; export unverified cat/dog leads.

Python 3.10+, standard library only. No accounts, paid APIs or production writes.
Data: Open Pet Food Facts contributors, ODbL 1.0 / DbCL 1.0.
"""
import argparse
import collections
import datetime
import gzip
import hashlib
import json
import pathlib
import re
import urllib.request

DUMP_URL = 'https://static.openpetfoodfacts.org/data/openpetfoodfacts-products.jsonl.gz'
PET_TAGS = {'en:cat-food', 'en:dog-food', 'en:dog-and-cat-food'}
NA_TAGS = {'en:united-states', 'en:canada'}


def valid_gtin(code):
    if not isinstance(code, str) or not code.isascii() or not code.isdigit():
        return False
    if len(code) not in (8, 12, 13, 14):
        return False
    total = sum(int(c) * (3 if i % 2 == 0 else 1)
                for i, c in enumerate(code[-2::-1]))
    return (total + int(code[-1])) % 10 == 0


def ingredient_fields(product):
    return {k: v for k, v in product.items()
            if (k == 'ingredients_text' or re.fullmatch(
                r'ingredients_text_[a-z]{2,3}(?:-[a-z0-9]{2,8})*', k))
            and isinstance(v, str) and v.strip()}


def has_text(product, key):
    return isinstance(product.get(key), str) and bool(product[key].strip())


def image_kind(product, kind):
    images = product.get('images') or {}
    return bool((images.get('selected') or {}).get(kind)) or any(
        k == kind or k.startswith(kind + '_') for k in images)


def accumulate(counter, product):
    counter['records'] += 1
    counter['valid_gtin_check_digit'] += valid_gtin(product.get('code'))
    counter['named_default_language'] += has_text(product, 'product_name')
    counter['with_brand'] += has_text(product, 'brands')
    counter['with_ingredients_text_any_language'] += bool(ingredient_fields(product))
    counter['with_any_photo_metadata'] += bool(product.get('images'))
    counter['with_selected_ingredients_photo'] += image_kind(product, 'ingredients')
    counter['with_selected_nutrition_photo'] += image_kind(product, 'nutrition')
    counter['with_nonempty_nutriments_field'] += bool(product.get('nutriments'))
    counter['name_brand_ingredients_and_valid_gtin'] += (
        valid_gtin(product.get('code')) and has_text(product, 'product_name')
        and has_text(product, 'brands') and bool(ingredient_fields(product)))


def download(destination, user_agent):
    request = urllib.request.Request(DUMP_URL, headers={'User-Agent': user_agent})
    temporary = destination.with_suffix(destination.suffix + '.part')
    try:
        with urllib.request.urlopen(request, timeout=60) as response, temporary.open('wb') as out:
            metadata = {'url': response.url, 'last_modified': response.headers.get('Last-Modified')}
            total = 0
            while chunk := response.read(1024 * 1024):
                total += len(chunk)
                if total > 250 * 1024 * 1024:
                    raise ValueError('Dump exceeds the 250 MiB audit download limit')
                out.write(chunk)
        temporary.replace(destination)
        return metadata
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=pathlib.Path, help='Previously downloaded official JSONL.gz')
    parser.add_argument('--download', action='store_true', help='Download the official dump once')
    parser.add_argument('--out', type=pathlib.Path, required=True)
    parser.add_argument('--user-agent', default='PetFoodSourceAudit/1.0')
    parser.add_argument('--source-last-modified', default=None)
    args = parser.parse_args()
    if bool(args.input) == bool(args.download):
        parser.error('Choose exactly one of --input or --download')
    args.out.mkdir(parents=True, exist_ok=True)
    metadata = {'url': DUMP_URL, 'last_modified': args.source_last_modified}
    path = args.input
    if args.download:
        path = args.out / 'openpetfoodfacts-products.jsonl.gz'
        metadata = download(path, args.user_agent)
    digest = hashlib.sha256()
    with path.open('rb') as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    metadata.update({'sha256': digest.hexdigest(), 'compressed_bytes': path.stat().st_size})
    groups = {k: collections.Counter() for k in (
        'global_all_species', 'us_all_species', 'canada_all_species',
        'us_or_canada_all_species', 'global_cat_dog_tagged', 'us_or_canada_cat_dog_tagged')}
    names = ['opff-cat-dog-candidates.jsonl', 'opff-us-ca-cat-dog-candidates.jsonl']
    temp_paths = [args.out / (name + '.part') for name in names]
    seen_codes, seen_gtins = set(), set()
    duplicates, exported, na_exported, invalid_pet_codes = 0, 0, 0, 0
    try:
        with gzip.open(path, 'rt', encoding='utf-8') as source, \
                temp_paths[0].open('w', encoding='utf-8') as global_out, \
                temp_paths[1].open('w', encoding='utf-8') as na_out:
            for line in source:
                if not line.strip():
                    continue
                product = json.loads(line)
                code = product.get('code')
                if code in seen_codes:
                    duplicates += 1
                seen_codes.add(code)
                markets = set(product.get('countries_tags') or [])
                categories = set(product.get('categories_tags') or [])
                pet = bool(categories & PET_TAGS)
                north_america = bool(markets & NA_TAGS)
                accumulate(groups['global_all_species'], product)
                if 'en:united-states' in markets:
                    accumulate(groups['us_all_species'], product)
                if 'en:canada' in markets:
                    accumulate(groups['canada_all_species'], product)
                if north_america:
                    accumulate(groups['us_or_canada_all_species'], product)
                if pet:
                    accumulate(groups['global_cat_dog_tagged'], product)
                    if north_america:
                        accumulate(groups['us_or_canada_cat_dog_tagged'], product)
                if not pet:
                    continue
                if not valid_gtin(code):
                    invalid_pet_codes += 1
                    continue
                gtin14 = code.zfill(14)
                # Keep all source observations, including conflicting GTIN aliases.
                seen_gtins.add(gtin14)
                selected = (product.get('images') or {}).get('selected') or {}
                fields = {k: product[k] for k in (
                    'product_name', 'brands', 'quantity', 'categories_tags', 'countries_tags',
                    'lang', 'last_modified_t', 'last_updated_t', 'nutriments') if k in product}
                fields.update(ingredient_fields(product))
                observation = {
                    'source': 'Open Pet Food Facts', 'source_code': code,
                    'canonical_gtin14': gtin14, 'barcode_scope': 'unknown',
                    'barcode_format_assumption': 'GTIN-' + str(len(code)),
                    'status': 'source_candidate_not_verified',
                    'source_product_url': 'https://world.openpetfoodfacts.org/product/' + code,
                    'source_snapshot_sha256': metadata['sha256'],
                    'source_fields': fields, 'selected_image_metadata': selected,
                    'verification_required': [
                        'exact_product_and_species', 'retail_unit_and_pack_size',
                        'current_market_and_formula', 'complete_label',
                        'deduplicate_against_all_repository_ledgers'],
                }
                serialized = json.dumps(observation, ensure_ascii=False) + '\n'
                global_out.write(serialized)
                exported += 1
                if north_america:
                    na_out.write(serialized)
                    na_exported += 1
        for temporary, name in zip(temp_paths, names):
            temporary.replace(args.out / name)
    except Exception:
        for temporary in temp_paths:
            temporary.unlink(missing_ok=True)
        raise
    report = {
        'audited_at_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'source': metadata, 'groups': groups,
        'unique_source_codes': len(seen_codes), 'repeated_source_codes': duplicates,
        'exports': {'global_cat_dog_observations': exported,
                    'global_unique_canonical_gtin14': len(seen_gtins),
                    'us_or_canada_cat_dog_observations': na_exported,
                    'invalid_cat_dog_codes_excluded': invalid_pet_codes},
        'method': {
            'cat_dog_filter': sorted(PET_TAGS), 'north_america_filter': sorted(NA_TAGS),
            'warning': 'Categories and markets are contributor labels, not verified availability. '
                       'The restrictive category filter misses uncategorized cat/dog products. '
                       'Nonempty ingredients are not necessarily complete or current. '
                       'An empty nutriments field does not rule out nutrition in photos. '
                       'A valid check digit is not proof of a registered or correctly assigned GTIN. '
                       'Eight-digit codes are provisionally treated as GTIN-8; UPC-E is not expanded. '
                       'Exports have not been deduplicated against the user project.',
        },
    }
    (args.out / 'opff-audit.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
