# TODO — planned work

> Source disagreements about individual products do NOT go here. They live in
> [CATALOG-CONFLICTS.md](CATALOG-CONFLICTS.md), which is the working list for
> everything two sources say differently about one barcode — including the one
> piece of work this file would otherwise own, the missing calcium field.


## Soft delete + audit log for catalog changes

**Why.** Deleting a catalog row is currently permanent: the row is stripped from
`barcode_cache` and its cached report with it. A password prompt now guards the
action, but a prompt only stops someone using a session they didn't open — it
does nothing about a leaked `ADMIN_TOKEN`, since that can drive the API
directly. Recoverability is the control that actually limits damage, and it
matters more as the catalog grows past a handful of hand-checked products.

**Soft delete.** Add `deleted_at timestamptz` (null = live) to `barcode_cache`.

- Deleting sets `deleted_at = now()` instead of removing the row.
- Every read path filters `deleted_at is null` — the consumer app's
  `/api/barcode`, the product search, and the scanner's duplicate check — so a
  deleted product disappears for users immediately.
- Restoring clears the column. The ingredient text was never lost.
- Re-capturing a deleted product upserts on the same `code`, which overwrites
  the row and clears `deleted_at`, so it comes back live. Make sure the written
  row includes `deleted_at: null` explicitly, or a stale timestamp survives the
  upsert and the "restored" product stays invisible.
- Retention: purge rows whose `deleted_at` is older than ~30 days, otherwise the
  table accumulates dead weight indefinitely. Without this step soft delete just
  defers the problem.

**Audit log.** A separate append-only table: who, what, when.

- Columns roughly: `id`, `at`, `actor`, `action` (write / delete / restore),
  `code`, `before`, `after`.
- Written by the routes that mutate the catalog (`/api/process`,
  `/api/delete-barcode`).
- `actor` is only meaningful once the shared `ADMIN_TOKEN` becomes per-person
  credentials — until then every entry reads "admin", which records what
  happened but not who did it.

**Order to build.** Soft delete first (it makes damage reversible on its own),
then the log, then per-person credentials. Rate limiting on the destructive
routes is worth adding alongside, so a compromised token can't sweep the catalog
faster than the log can be noticed.
