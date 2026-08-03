/**
 * The one check that stands between a request and the operator's controls.
 *
 * Server-only. It was written out seven times across two repositories, each a
 * copy of `(req.headers.get("x-admin-token") ?? "") !== adminToken`, and seven
 * copies of a security check is a place where behaviour eventually diverges
 * without anyone deciding that it should.
 *
 * ── Why the comparison is not `!==` ───────────────────────────────────────
 *
 * String comparison stops at the first byte that differs, so how long it takes
 * says something about how much of the token was right. Over the public
 * internet the signal is buried under jitter and this is close to
 * unexploitable — but "close to" is doing a lot of work in that sentence, the
 * correct version costs one line, and it removes the argument entirely.
 *
 * Lengths are hashed to a fixed width first: `timingSafeEqual` throws on
 * mismatched lengths, and catching that throw would leak the length as surely
 * as comparing the strings would have.
 */

import { createHash, timingSafeEqual } from "node:crypto";

/** Fixed-width digest, so the comparison never sees two different lengths. */
function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Constant-time string equality. */
export function secretsMatch(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export type AdminAuth =
  /** The caller is an operator. */
  | { ok: true }
  /** No ADMIN_TOKEN configured — the feature does not exist on this deployment. */
  | { ok: false; status: 501; error: "admin_not_configured" }
  /** Wrong token, or none. */
  | { ok: false; status: 401; error: "unauthorized" };

/**
 * Is this request from the operator?
 *
 * The three outcomes are deliberately distinguishable to the caller and
 * deliberately identical to anybody guessing: a wrong token and a missing one
 * both answer 401, and neither says which.
 */
export function checkAdmin(req: Request): AdminAuth {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) {
    return { ok: false, status: 501, error: "admin_not_configured" };
  }
  const provided = req.headers.get("x-admin-token") ?? "";
  if (!secretsMatch(provided, configured)) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  return { ok: true };
}

/** The response for a refused caller, in the vocabulary every admin route uses. */
export function adminRefusal(auth: Extract<AdminAuth, { ok: false }>): Response {
  return Response.json({ error: auth.error }, { status: auth.status });
}
