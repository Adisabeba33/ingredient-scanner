-- Express Mode: the worklist for products captured in two seconds.
--
-- APPLY THIS ONE BY HAND in the Supabase SQL editor. Unlike
-- shared-barcode_cache.reference.sql, this table is the scanner's own and does
-- not exist yet.
--
-- Safe to run more than once, and safe to run against a half-applied earlier
-- version: every statement is guarded, and the ALTERs at the bottom add any
-- column a previous run of this file predates. Paste the whole thing, run it,
-- and the schema is correct whatever state it was in.
--
-- ── Why this is not a column on barcode_cache ─────────────────────────────
--
-- An express capture has no ingredient list. `barcode_cache` is the table the
-- consumer app reads on every scan, and a row there without a readable
-- composition fails `servableRow()` — which does NOT mean "ignored", it means
-- the code is treated as a recent miss and Open Food Facts is not asked again
-- for a week. Filing half-finished work in the serving table would make those
-- products worse than they were before anybody photographed them.
--
-- So this is a worklist: rows arrive here from the shop, get finished at a
-- desk, and MOVE to barcode_cache as ordinary verified products. Nothing reads
-- this table but the scanner.

create table if not exists public.express_capture (
  -- canonicalBarcode(code) — the same key barcode_cache uses, so a finished
  -- row lands under exactly the code the shopper will scan.
  code text primary key,
  -- Pack sizes. One recipe is sold as a 3 kg bag and a 12 kg bag with two
  -- different barcodes, and a shop trip photographs the front once. Each code
  -- gets its own row (that is what the catalog stores) but they share this
  -- group, so the desk types the composition once and all of them graduate
  -- together. Defaults to the row's own code for a product with a single code.
  capture_group text,
  mode text,                          -- human | pet | cosmetics
  brands text,
  product_name text,
  product_line text,                  -- the range: "Shreds", "Prime Filets"
  variant text,                       -- "Chicken & Brown Rice", "Large Breed"
  -- Everything below is read off the FRONT of the pack. None of it needs a
  -- second trip, and each field is one the desk would otherwise pick by hand
  -- or the catalog would go without.
  species text,                       -- cat | dog | both | unknown
  life_stage text,                    -- kitten | puppy | adult | senior | all
  proteins text[],                    -- ["salmon"] — what the pack sells on
  texture text,                       -- "pate", "shreds", "flaked" — the CUT
  -- What it is suspended in: "in gravy", "in sauce", "in broth". A separate
  -- column from texture on purpose. "Flaked Salmon in Gravy" is a flaked
  -- texture in a gravy, and one column for both meant a capture kept whichever
  -- word the model happened to write — after which "have I done Shreds in
  -- Gravy as well as Shreds in Sauce?" has no answer, and those are two
  -- different products on a shelf. It also predicts the composition: a gravy
  -- is thickened, nearly always with carrageenan, guar or xanthan.
  presentation text,
  food_form text,                     -- dry | wet | semi-moist, derived
  -- Is it dinner? complete | complementary | topper | treat | supplement |
  -- unknown, from the AAFCO feeding statement the pack is required to carry.
  --
  -- Not a catalog nicety. The consumer app judges a pet food by whether real
  -- named meat leads the list — the right question about a meal and nonsense
  -- about a lickable broth, which is mostly water on purpose, and unfair about
  -- a bag of treats, which never claimed to be a diet. "unknown" keeps the
  -- everyday standard, so a missing answer can only leave a report as it is
  -- today, never make it worse.
  nutrition_role text,
  -- A vet-channel therapeutic diet. A renal formula is DELIBERATELY low in
  -- protein and phosphorus; measured against "more named meat is better" it
  -- reads as a cynically cheap food, and the report would say so about
  -- something a vet prescribed to keep an animal alive.
  requires_vet boolean,
  -- Claims printed on the front, verbatim. The consumer app weighs marketing
  -- against the composition and until now had only the back of the pack.
  front_claims text[],
  multipack_count int,                -- 12 from "12 x 5.5 oz"
  net_weight text,                    -- as printed: "12.5 oz", "3 kg"
  container text,                     -- can | pouch | bag | tray | box | bottle
  -- Path inside the product-photos bucket, not a URL: the bucket can be made
  -- public or private later without rewriting every row.
  photo_path text,
  -- What the model could not read off the front, so the desk knows to look at
  -- the photo rather than trusting an empty field.
  read_error text,
  captured_at timestamptz not null default now()
);

-- Same posture as every other table here: RLS on, no public policies, so only
-- the service-role key (server-side) can read or write it.
alter table public.express_capture enable row level security;

-- Oldest first is how the desk works through them.
create index if not exists express_capture_captured_at_idx
  on public.express_capture (captured_at);

-- The desk reads a group at a time.
create index if not exists express_capture_group_idx
  on public.express_capture (capture_group);


-- ── The photo bucket ──────────────────────────────────────────────────────
--
-- Create it once in Storage → New bucket:
--
--   name:   product-photos
--   public: YES
--
-- Public on purpose. The consumer app already renders `barcode_cache.image_url`
-- in its report, so a finished express product shows its own photograph with no
-- change to that app at all — but only if the URL can be fetched without a key.
-- Nothing private goes in here: it is a picture of the front of a retail pack,
-- taken in a shop.
--
-- Writes still require the service-role key, because the bucket has no INSERT
-- policy for anon. If you would rather create it in SQL:
--
--   insert into storage.buckets (id, name, public)
--   values ('product-photos', 'product-photos', true)
--   on conflict (id) do nothing;


-- ── Catching up an earlier version of this file ───────────────────────────
--
-- These do nothing on a fresh database — the CREATE above already has every
-- column. They exist so that a database where an earlier version of this file
-- was applied comes up to date from the same paste, without anybody having to
-- remember which version that was.

alter table public.express_capture
  add column if not exists capture_group text,
  add column if not exists product_line text,
  add column if not exists species text,
  add column if not exists life_stage text,
  add column if not exists proteins text[],
  add column if not exists texture text,
  add column if not exists presentation text,
  add column if not exists food_form text,
  add column if not exists nutrition_role text,
  add column if not exists requires_vet boolean,
  add column if not exists front_claims text[],
  add column if not exists multipack_count int;

-- Rows written before capture_group existed are each their own group. The
-- reading code already treats a null that way, so this is tidiness rather than
-- a fix — but it keeps the column honest for anything that queries it directly.
update public.express_capture
  set capture_group = code
  where capture_group is null;
