import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { classifyMiss } from "@/lib/miss-verdict";
import { isHit, outcomeOf, type ScanOutcome } from "@/lib/scan-test";

/**
 * One barcode, asked the way a shopper's phone asks it.
 *
 * ── Why this route calls another app instead of reading our database ──────
 *
 * Because the number being measured is the shopper's, and only the consumer
 * app can produce it. A row in `barcode_cache` is not the same thing as an
 * answer: it can hold a name with no ingredient list, a negative cache, a
 * guaranteed analysis somebody deposited off a photographed panel, or a
 * decision that the code is a box. The consumer app refuses to serve every one
 * of those, using a parser and a dictionary of foods that live in that repo.
 *
 * And where we hold nothing at all, that app asks the open databases itself —
 * so a shopper often gets an answer we had no hand in. Measuring against our
 * own table would miss that in both directions at once.
 *
 * Copying the rule here would be the same fact written twice, and the copy
 * that went stale would be the one nobody was looking at. So the question goes
 * where the answer lives: `GET /api/barcode?code=…`, the public endpoint the
 * app itself calls, and whatever comes back IS what the shopper would get.
 *
 * ── What this does add ───────────────────────────────────────────────────
 *
 * The seed's opinion of a code the app could not serve. "Nobody has it" from
 * an aisle covers four different kinds of work — one of them a button press on
 * this very desk — and `lib/miss-verdict.ts` tells them apart from files
 * alone, without asking anything else.
 *
 * ── On writing ───────────────────────────────────────────────────────────
 *
 * This route writes nothing. The consumer app may cache its own lookup, which
 * is exactly what a shopper's scan does and the reason a test walk shows up
 * later in the miss list — that is a feature, not a side effect to suppress.
 * What matters here is that the desk is not inventing rows to flatter itself.
 *
 * Gated by ADMIN_TOKEN like every other desk route.
 */

export const runtime = "nodejs";

/**
 * Where the shopper's app lives.
 *
 * Configurable because a staging deploy has to be testable against its own
 * catalog, and defaulted because the overwhelmingly common case is production
 * and an unset variable should not silently report a 0% hit rate.
 */
const CONSUMER_URL = (
  process.env.CONSUMER_APP_URL ?? "https://ingredients.help"
).replace(/\/+$/, "");

/**
 * Somebody is standing in an aisle holding a can.
 *
 * Longer than the seven seconds `/api/open-lookup` allows itself, because this
 * request can be the one that goes out to the open databases and back. Still
 * finite: a lookup that has not answered in fifteen seconds has answered.
 */
const TIMEOUT_MS = 15_000;

interface ConsumerBody {
  found?: boolean;
  code?: string;
  source?: string | null;
  reason?: string | null;
  productName?: string | null;
  brands?: string | null;
  searches?: number | null;
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const clean = sanitizeBarcode(typeof body.code === "string" ? body.code : "");
  if (!clean) {
    // Not a barcode at all. Answered from here rather than sent onward: the
    // consumer app would refuse it too, and a misread is not a shelf product.
    return Response.json({
      code: canonicalBarcode(
        typeof body.code === "string" ? body.code.replace(/\D+/g, "") : ""
      ),
      outcome: "not-found" satisfies ScanOutcome,
      hit: false,
      name: null,
      source: null,
      miss: classifyMiss(typeof body.code === "string" ? body.code : ""),
      askedAt: CONSUMER_URL,
      unreadable: true,
    });
  }

  const key = canonicalBarcode(clean);

  let answer: ConsumerBody | null = null;
  let reachError: string | null = null;
  try {
    const res = await fetch(
      `${CONSUMER_URL}/api/barcode?code=${encodeURIComponent(clean)}`,
      {
        headers: { Accept: "application/json" },
        // The catalog is editable and a miss becomes a hit the moment somebody
        // presses import. A cached copy would report yesterday's hit rate.
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    // 404 is an ANSWER here — it is how the app says it has nothing — so it is
    // read like any other body rather than treated as a failure.
    if (res.ok || res.status === 404) {
      answer = (await res.json()) as ConsumerBody;
    } else {
      reachError = `consumer_app_status_${res.status}`;
    }
  } catch (err) {
    reachError = err instanceof Error ? err.name : "fetch_failed";
  }

  if (reachError) {
    // Refused rather than counted. A run that silently scores an unreachable
    // app at 0% would be the most misleading output this tool could produce.
    return Response.json(
      { error: "consumer_unreachable", message: reachError, askedAt: CONSUMER_URL },
      { status: 502 }
    );
  }

  const outcome = outcomeOf(answer);
  return Response.json({
    code: key,
    outcome,
    hit: isHit(outcome),
    name: answer?.productName ?? null,
    brands: answer?.brands ?? null,
    source: answer?.source ?? null,
    /** How many people had already reached for this and left empty-handed. */
    searches: answer?.searches ?? null,
    // The seed's opinion, and only where it decides something: for a code the
    // app already serves there is nothing to do and a verdict would be noise.
    miss: isHit(outcome) ? null : classifyMiss(clean),
    askedAt: CONSUMER_URL,
  });
}
