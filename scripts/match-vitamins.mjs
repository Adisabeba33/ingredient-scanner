#!/usr/bin/env node
/**
 * Match a vitamin block from an incoming deck against every constant already in
 * data/known-formulas.ts, and say how far each one is.
 *
 * ── Why this is a script ──────────────────────────────────────────────────
 *
 * There are twelve vitamin constants for one premix, and the rule is that a new
 * deck reuses one only on an EXACT match. Nearly right is a label nobody
 * printed: reusing `V_MEDLEYS` for a deck that glosses biotin would silently
 * strip two glosses off every product in the batch.
 *
 * That check was being retyped by hand each time, and the hand-written version
 * got it wrong. `V_NO_K` is the one constant whose string does not end at its
 * closing bracket — it lists menadione AFTER the group, because that is where
 * its deck prints it — so a regex anchored on `]";` ran past it and swallowed
 * the NEXT declaration. The comparison then ran against eleven constants
 * believing it had twelve, and named the wrong nearest neighbour: it reported
 * `V_MEDLEYS` at five differences when `V_PLAIN` was one away.
 *
 * A check that silently examines less than it claims is worse than no check,
 * because it is trusted. So it lives here, where the parsing is written once.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *
 *   node scripts/match-vitamins.mjs "thiamine mononitrate, Vitamin E supplement, …"
 *   echo "VITAMINS [thiamine mononitrate, …]" | node scripts/match-vitamins.mjs
 *
 * The input may be the bare comma list or the whole `VITAMINS [...]` group;
 * either is accepted, and case and spacing are ignored on both sides.
 *
 * Exit code 0 on an exact match, 1 when none matches — so it can gate a script.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const FORMULAS = join(HERE, "..", "data", "known-formulas.ts");

/**
 * Every `const V… = "…";` declaration, then the bracketed group inside it.
 *
 * Two steps rather than one pattern, which is the whole point: the declaration
 * is matched to its own terminating `";`, and the group is found inside that.
 * Anything a deck prints outside the brackets — see `V_NO_K` — stays with its
 * own constant instead of being read as part of the next one.
 */
function constants() {
  const src = readFileSync(FORMULAS, "utf8");
  const out = new Map();
  for (const m of src.matchAll(/^const (V\w*) =\n {2}"(.*?)";$/gms)) {
    const group = /Vitamins \[(.*?)\]/s.exec(m[2]);
    if (group) out.set(m[1], split(group[1]));
  }
  return out;
}

function split(list) {
  return list
    .replace(/^.*?VITAMINS?\s*\[/is, "")
    .replace(/\].*$/s, "")
    .split(",")
    .map((s) => s.replace(/\s+/g, " ").trim().toLowerCase())
    .filter(Boolean);
}

const input = process.argv[2] ?? readFileSync(0, "utf8");
const want = split(input);
if (want.length === 0) {
  console.error("Nothing to match. Pass the vitamin list as an argument or on stdin.");
  process.exit(1);
}

const all = constants();
console.log(`\n${want.length} entries against ${all.size} constants\n`);

const scored = [...all].map(([name, body]) => {
  const positional = body.filter((x, i) => x !== want[i]).length;
  return { name, body, diff: positional + Math.abs(body.length - want.length) };
});
scored.sort((a, b) => a.diff - b.diff);

const exact = scored.find((s) => s.diff === 0);
if (exact) {
  console.log(`EXACT MATCH — reuse \`${exact.name}\`\n`);
  process.exit(0);
}

for (const s of scored.slice(0, 3)) {
  console.log(`${s.name} — differs in ${s.diff} of ${want.length}`);
  const n = Math.max(s.body.length, want.length);
  for (let i = 0; i < n; i += 1) {
    if (s.body[i] !== want[i]) {
      console.log(`   [${i}] ours: ${s.body[i] ?? "—"}`);
      console.log(`        deck: ${want[i] ?? "—"}`);
    }
  }
  console.log("");
}

console.log(
  "No exact match. Add a new constant rather than reusing the nearest — and\n" +
    "name it for what distinguishes it, since the next person will be reading\n" +
    "this same list.\n"
);
process.exit(1);
