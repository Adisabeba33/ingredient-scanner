/**
 * Which animal, at which point in its life, this food is declared to feed.
 *
 * ── Where the answer comes from, and why it is free ───────────────────────
 *
 * American pet food is required to carry one AAFCO statement beside the
 * guaranteed analysis, and that one sentence answers two questions at once:
 *
 *   "…formulated to meet the nutritional levels established by the AAFCO Cat
 *    Food Nutrient Profiles for GROWTH."
 *   "Animal feeding tests…substantiate that X provides complete and balanced
 *    nutrition for MAINTENANCE of adult dogs."
 *   "…for ALL LIFE STAGES, including growth of large size dogs (70 lbs or more
 *    as an adult)."
 *   "Intended for intermittent or supplemental feeding only."
 *
 * The first half — is this dinner at all — is already read (lib/nutrition-role).
 * The second half is the life stage, and it has been going to waste: the
 * scanner copies the sentence verbatim from a photograph it already takes, uses
 * it to derive the role, and drops it. Nothing new has to be photographed, and
 * no model has to be asked, for this module to answer.
 *
 * ── Why this is not lib/dietary-intent.ts ─────────────────────────────────
 *
 * That module reads the pack's NAME: "Kitten", "7+", "Indoor". This one reads
 * the regulatory sentence. They are different claims by different authors — one
 * is marketing, the other is what the maker formally declares to a regulator —
 * and the interesting case is precisely where they disagree. A bag that says
 * KITTEN across the front whose statement says "for maintenance" is telling two
 * different stories, and merging the two fields into one would be throwing away
 * the only thing that makes that visible.
 *
 * ── Why a stage is never inferred ─────────────────────────────────────────
 *
 * Not from the ingredients, not from the name, not from the protein figure. The
 * feeding statement is not derivable from an ingredient list — that is written
 * into migration 0024 for the role and it is just as true here. Where the
 * sentence does not say, this returns "unknown", which keeps every downstream
 * screen silent. A wrong stage would tell somebody their kitten's food is
 * unsuitable, or worse, tell them an adult formula is fine for a kitten.
 *
 * ── Kept byte-identical across the two repositories ───────────────────────
 *
 * `ingredient-scanner` writes the column and this app reads it, so the two must
 * agree about what the words mean. Diff them; they should produce no output.
 *
 * PURE. No network, no model, no database.
 */

/** What the AAFCO sentence declares, when it declares anything. */
export type LifeStage =
  /** Growth — kittens, puppies. AAFCO's growth profile covers reproduction too. */
  | "growth"
  /** Adult maintenance, and nothing beyond it. */
  | "maintenance"
  /** All life stages: growth and maintenance under one statement. */
  | "all"
  /** Gestation and lactation, declared without growth alongside. Rare. */
  | "reproduction"
  /**
   * The sentence declares the product is NOT a diet ("intermittent or
   * supplemental feeding only"), so there is no life stage to read. Different
   * from "unknown": here the pack answered, and the answer was "not dinner".
   */
  | "supplemental"
  /** A statement is present and does not say, or says something we don't parse. */
  | "unknown";

/**
 * Large-breed puppies are the one sub-clause worth keeping, because the two
 * wordings are opposites and they differ by a single word:
 *
 *   "…including growth of large size dogs (70 lbs or more as an adult)"
 *   "…except for growth of large size dogs (70 lbs or more as an adult)"
 *
 * A food carrying the second is formally declared UNSUITABLE for a Labrador
 * puppy while still saying "all life stages" in the same breath. Collapsing
 * them would lose the only sentence on the pack that says so.
 */
export type LargeBreedGrowth = "included" | "excluded";

export interface LifeStageRead {
  stage: LifeStage;
  /** null when the sentence says nothing either way, which is the usual case. */
  largeBreedGrowth: LargeBreedGrowth | null;
}

function fold(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

const has = (folded: string, phrase: string): boolean =>
  folded.includes(` ${phrase} `);

/** Any of these phrases present. */
const hasAny = (folded: string, phrases: string[]): boolean =>
  phrases.some((p) => has(folded, p));

const SUPPLEMENTAL = [
  "intermittent or supplemental feeding",
  "intermittent and supplemental feeding",
  "supplemental feeding only",
  "not intended for use as a complete",
];

const ALL_STAGES = ["all life stages", "all lifestages", "every life stage"];

const GROWTH = [
  "for growth",
  "growth and reproduction",
  "growth reproduction",
  "growth of kittens",
  "growth of puppies",
  "growing kittens",
  "growing puppies",
];

const REPRODUCTION = ["gestation", "lactation", "reproduction"];

const MAINTENANCE = [
  "for maintenance",
  "adult maintenance",
  "maintenance of adult",
  "for the maintenance",
  "maintenance of cats",
  "maintenance of dogs",
];

/** The large-breed clause, in the wordings packs actually print. */
const LARGE_BREED = [
  "growth of large size dogs",
  "growth of large breed dogs",
  "large size dogs 70 lbs or more as an adult",
  "large breed puppies",
];

/**
 * Is the large-breed clause an inclusion or an exclusion?
 *
 * Read from the words immediately BEFORE the clause, because that is where the
 * one word that inverts the meaning lives, and because "except" appearing
 * somewhere else in a long sentence must not flip a statement that includes.
 */
function largeBreedSense(folded: string): LargeBreedGrowth | null {
  for (const clause of LARGE_BREED) {
    const at = folded.indexOf(` ${clause} `);
    if (at < 0) continue;
    const before = folded.slice(Math.max(0, at - 40), at + 1);
    if (/\b(except|excepting|excluding|other than|not including)\b/.test(before)) {
      return "excluded";
    }
    if (/\b(including|include|includes)\b/.test(before)) return "included";
    // The clause is there and neither word is. Saying nothing beats guessing,
    // and the stage itself is unaffected.
    return null;
  }
  return null;
}

/**
 * Read the life stage out of an AAFCO feeding statement.
 *
 * `null` in, `null` out: no sentence is not the same as a sentence that does not
 * say. The first means nobody has read the pack yet; the second is a fact about
 * the pack. Every screen downstream needs to tell them apart.
 */
export function readLifeStage(
  statement: string | null | undefined
): LifeStageRead | null {
  if (typeof statement !== "string") return null;
  const folded = fold(statement);
  if (folded.trim().length === 0) return null;

  const largeBreedGrowth = largeBreedSense(folded);

  // Order matters. "All life stages, including growth of large size dogs" holds
  // the word "growth" and is not a growth food; the broader declaration wins.
  if (hasAny(folded, SUPPLEMENTAL)) {
    return { stage: "supplemental", largeBreedGrowth: null };
  }
  if (hasAny(folded, ALL_STAGES)) return { stage: "all", largeBreedGrowth };
  if (hasAny(folded, GROWTH)) return { stage: "growth", largeBreedGrowth };
  // Reproduction alone, with no growth beside it. AAFCO's growth profile covers
  // gestation and lactation, so the pair nearly always appears together and is
  // caught above; this is the remainder.
  if (hasAny(folded, REPRODUCTION)) {
    return { stage: "reproduction", largeBreedGrowth };
  }
  if (hasAny(folded, MAINTENANCE)) {
    return { stage: "maintenance", largeBreedGrowth };
  }
  return { stage: "unknown", largeBreedGrowth };
}

/** Is this a stage a growing animal may be fed on? */
export function feedsGrowth(stage: LifeStage | null | undefined): boolean {
  return stage === "growth" || stage === "all";
}

/** Plain wording for a reader, or null where there is nothing to say. */
export function lifeStageLabel(
  stage: LifeStage | null | undefined,
  species: "cat" | "dog" | "unknown" = "unknown"
): string | null {
  const young = species === "dog" ? "puppies" : species === "cat" ? "kittens" : "young animals";
  const adult = species === "dog" ? "adult dogs" : species === "cat" ? "adult cats" : "adults";
  switch (stage) {
    case "growth":
      return `Declared for growth — ${young}`;
    case "maintenance":
      return `Declared for adult maintenance — ${adult}`;
    case "all":
      return "Declared for all life stages";
    case "reproduction":
      return "Declared for gestation and lactation";
    default:
      return null;
  }
}

/** Values the database column is allowed to hold. */
export function isLifeStage(value: unknown): value is LifeStage {
  return (
    value === "growth" ||
    value === "maintenance" ||
    value === "all" ||
    value === "reproduction" ||
    value === "supplemental" ||
    value === "unknown"
  );
}
