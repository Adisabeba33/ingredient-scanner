import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
/**
 * Admin gate check. The capture UI keeps the admin token in localStorage and
 * calls this once on load to decide whether to show the tool. Every real write
 * (`/api/process`) re-checks the token itself — this endpoint is only the UX
 * gate, not the security boundary.
 *
 * Mirrors ingredients.help's `x-admin-token` pattern:
 *   - 501 when ADMIN_TOKEN isn't configured on the server.
 *   - 401 on a wrong/absent token.
 *   - 200 { ok: true } when it matches.
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  return Response.json({ ok: true });
}
