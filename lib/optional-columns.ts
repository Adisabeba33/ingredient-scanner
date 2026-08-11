/**
 * Surviving a column that isn't there yet.
 *
 * ── The gap this covers ───────────────────────────────────────────────────
 *
 * Code ships by pushing; migrations are applied by hand, in the Supabase SQL
 * editor, by a person who may be in a shop at the time. So there is always a
 * window — minutes or days — where the deployed build knows about a column the
 * database doesn't have.
 *
 * Postgres does not shrug at that. Asking for one missing column fails the
 * WHOLE statement, so a select comes back empty and an insert writes nothing.
 * A capture tool that silently stops storing anything is far worse than one
 * that stores a row without its newest field: the shop trip is gone either way,
 * and only one of the two leaves you with the product.
 *
 * So every write of a just-added column is tried once and, if the database says
 * it doesn't know that column, tried again without it. The row lands, minus the
 * field, and the field starts landing by itself once the migration is run.
 * Nothing has to be re-captured and nothing has to be remembered.
 */

/**
 * Postgres's undefined_column, and PostgREST's own code for the same thing.
 *
 * Two codes because there are two ways to hit it. A SELECT naming a column the
 * table doesn't have reaches Postgres and comes back 42703; an INSERT naming
 * one is rejected earlier, by PostgREST's cached view of the schema, as
 * PGRST204 — and the two carry different wording as well as different codes.
 */
const UNDEFINED_COLUMN = new Set(["42703", "PGRST204"]);

/**
 * Did this fail because the database has never heard of a column?
 *
 * Checks the SQLSTATE first and the message only as a fallback: PostgREST
 * normally passes the code through, but a proxy or an older client can lose it,
 * and the retry is harmless when it isn't needed.
 */
export function isUndefinedColumn(
  error: { code?: string | null; message?: string | null } | null | undefined
): boolean {
  if (!error) return false;
  if (error.code && UNDEFINED_COLUMN.has(error.code)) return true;
  const message = (error.message ?? "").toLowerCase();
  // "column" in both branches on purpose: "relation ... does not exist" is a
  // missing TABLE, which retrying without a field would not fix, and treating
  // it as this would hide a real failure behind a pointless second attempt.
  if (message.includes("schema cache") && message.includes("column")) return true;
  return message.includes("does not exist") && message.includes("column");
}

/** The same rows with the named keys removed. */
// `object` rather than `Record<string, unknown>`: the rows these routes build
// are typed interfaces (VerifiedRow and friends), and an interface has no index
// signature, so the stricter constraint would reject exactly the callers this
// exists for.
export function withoutColumns<T extends object>(
  rows: T[],
  columns: string[]
): Record<string, unknown>[] {
  const drop = new Set(columns);
  return rows.map((row) => {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (!drop.has(key)) copy[key] = value;
    }
    return copy;
  });
}

/** A select list with the named columns removed. */
export function columnsWithout(columns: string, drop: string[]): string {
  const gone = new Set(drop);
  return columns
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c && !gone.has(c))
    .join(", ");
}
