# Data provenance and reuse
Prepared 2026-10-07.

## Open Pet Food Facts

Source: Open Pet Food Facts contributors.
Data page: https://world.openpetfoodfacts.org/data
Downloaded snapshot: https://static.openpetfoodfacts.org/data/openpetfoodfacts-products.jsonl.gz
Last-Modified: Wed, 07 Oct 2026 00:15:57 GMT
SHA-256: cbfda4eaa686476c7254545e1fa0768873153569d7154bcfc15bbd02dbe55c4c

The original database and the derived candidate databases in this archive are made available under the Open Database License (ODbL) 1.0:
https://opendatacommons.org/licenses/odbl/1-0/

Individual database contents are subject to the Database Contents License (DbCL) 1.0:
https://opendatacommons.org/licenses/dbcl/1-0/

Source photographs are separately licensed under Creative Commons Attribution-ShareAlike 3.0:
https://creativecommons.org/licenses/by-sa/3.0/
No image binaries have been downloaded or included. Metadata and original product-page references are included. Retrieve source attribution and applicable licence with any later photo download.

Licensing guidance:
https://openfoodfacts.github.io/openfoodfacts-server/api/tutorials/license-be-on-the-legal-side/

Modifications in the derived JSONL files: filter by explicit cat/dog categories; exclude codes that fail the implemented GTIN length/check-digit check; select source fields; add provisional GTIN-14 normalization, source URL, snapshot hash, pending verification status and review requirements. The North American file additionally filters contributor-supplied country tags. Original ingredient statements are not rewritten. Ingredient debug and rendered-allergen helper fields are excluded from the ingredient-text count.

The original snapshot is retained to permit reproduction and further classification. Data may be incomplete, obsolete, duplicated, misclassified or incorrect. These are source observations, not verified new products for any recipient database. Checksum validity does not establish ownership, barcode symbology, retail pack scope or current availability. Eight-digit identifiers are provisionally treated as GTIN-8, not expanded UPC-E.

Before publishing a combined or derived database, apply the relevant ODbL attribution/share-alike requirements to the intended arrangement. Public availability of a source does not grant unrelated rights in trademarks or imagery.

## Washington State Department of Agriculture

The registration sample preserves the public response from:
https://agr.wa.gov/LookupTypes/GetPetFoodList?productName=&companyName=Fromm
Agency page:
https://agr.wa.gov/departments/animals-livestock-and-pets/animal-feed/product-look-up

Retrieved 2026-10-07. It contains 319 registration rows. No UPC or ingredient fields were present in the tested response. Product names can repeat and a registration does not establish present retail sale. This research sample does not assert an ODbL licence over Washington State data.

## Other sources

sources.json and README.md contain original source descriptions and links, not licensed vendor catalog exports. Access conditions and coverage are identified as documented, observed or unconfirmed. No subscription dataset was purchased, no vendor account was created, and no email request was sent.

## Original work

audit_opff.py, the research commentary and the aggregate audit are original work provided for this project. The database licences above continue to apply to the source and derivative data. The script makes no production writes and has no paid-API dependencies.

