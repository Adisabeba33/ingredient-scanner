-- Express Mode: the worklist for products captured in two seconds.
--
-- APPLY THIS ONE BY HAND in the Supabase SQL editor. Unlike
-- shared-barcode_cache.reference.sql, this table is the scanner's own and does
-- not exist yet.
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
  mode text,                          -- human | pet | cosmetics
  brands text,
  product_name text,
  variant text,                       -- "Chicken & Brown Rice", "Large Breed"
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
