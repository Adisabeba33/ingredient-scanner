import glob
import json
from pathlib import Path

TARGET = Path('research/deep-research-ziwi-peak.json')
APPENDS = sorted(
    glob.glob('research/.ziwi-peak-cats-append-*.json')
    + glob.glob('research/.ziwi-peak-append-*.json')
)

if not TARGET.exists():
    raise SystemExit(f'missing target: {TARGET}')
if not APPENDS:
    raise SystemExit('no ZIWI append files found')

with TARGET.open(encoding='utf-8') as f:
    target = json.load(f)

records = list(target.get('records', []))
seen_upc = {}
seen_gtin = {}

for i, record in enumerate(records):
    upc = record.get('upc')
    gtin = record.get('canonical_gtin14')
    if upc in seen_upc:
        raise SystemExit(f'duplicate UPC already in canonical ledger: {upc}')
    if gtin in seen_gtin:
        raise SystemExit(f'duplicate GTIN already in canonical ledger: {gtin}')
    seen_upc[upc] = f'canonical[{i}]'
    seen_gtin[gtin] = f'canonical[{i}]'

added = 0
for path in APPENDS:
    with open(path, encoding='utf-8') as f:
        batch = json.load(f)
    batch_records = batch.get('records')
    if not isinstance(batch_records, list):
        raise SystemExit(f'{path}: records is not a list')
    for i, record in enumerate(batch_records):
        if record.get('brand') != 'ZIWI Peak':
            raise SystemExit(f'{path}[{i}]: wrong brand {record.get("brand")!r}')
        upc = record.get('upc')
        gtin = record.get('canonical_gtin14')
        if not isinstance(upc, str) or not upc:
            raise SystemExit(f'{path}[{i}]: missing UPC')
        if not isinstance(gtin, str) or len(gtin) != 14 or not gtin.isdigit():
            raise SystemExit(f'{path}[{i}]: invalid canonical_gtin14 {gtin!r}')
        if upc in seen_upc:
            raise SystemExit(f'{path}[{i}]: duplicate UPC {upc}; first seen at {seen_upc[upc]}')
        if gtin in seen_gtin:
            raise SystemExit(f'{path}[{i}]: duplicate GTIN {gtin}; first seen at {seen_gtin[gtin]}')
        records.append(record)
        seen_upc[upc] = f'{path}[{i}]'
        seen_gtin[gtin] = f'{path}[{i}]'
        added += 1

if len(records) != 116:
    raise SystemExit(f'expected 116 total ZIWI records after merge, got {len(records)} (added {added})')
if len(seen_upc) != 116 or len(seen_gtin) != 116:
    raise SystemExit('uniqueness count mismatch')

statuses = {}
for record in records:
    status = record.get('research_status')
    statuses[status] = statuses.get(status, 0) + 1

target['updated_at'] = '2026-08-28'
target['records'] = records
TARGET.write_text(json.dumps(target, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

print('append files:')
for path in APPENDS:
    print(' -', path)
print('added:', added)
print('total:', len(records))
print('statuses:', json.dumps(statuses, sort_keys=True))
