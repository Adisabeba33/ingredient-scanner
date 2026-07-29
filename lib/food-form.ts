/**
 * Dry food or wet food — the other half of "what am I actually looking at".
 *
 * This is not a label detail. It changes how the ingredient list must be READ:
 *
 *  · A wet food's list is ordered by weight AS PACKED, water included. "Chicken,
 *    Chicken Broth, Chicken Liver" is an ordinary pâté, not a product padded
 *    with broth — but read with dry-food instincts it looks like the meat is
 *    being stretched. The reverse error is worse: a dry food whose first
 *    ingredient is a grain is genuinely grain-led, and a report that shrugs
 *    because "water is always first in these" would be excusing it.
 *  · Extrusion needs starch to hold a kibble together, so SOME carbohydrate in
 *    dry food is structural rather than a corner cut. In a wet food there's no
 *    such excuse for it.
 *  · Moisture is the point of wet food and impossible in dry — a cat on kibble
 *    drinks the difference or doesn't. Marking either as a flaw of the product
 *    rather than of the form is just noise.
 *
 * So the form is read once, at capture, and stored — and it's read from two
 * independent places (the pack, and the composition) so a single bad reading
 * can't decide it on its own. See `reconcileFoodForm`.
 */
export type FoodForm = "dry" | "wet" | "semi-moist" | "unknown";

export function isFoodForm(value: unknown): value is FoodForm {
  return (
    value === "dry" ||
    value === "wet" ||
    value === "semi-moist" ||
    value === "unknown"
  );
}

/** Human wording, for chips and prompts. */
export function formLabel(form: FoodForm): string {
  if (form === "dry") return "dry food";
  if (form === "wet") return "wet food";
  if (form === "semi-moist") return "semi-moist food";
  return "pet food";
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasWord(haystack: string, phrase: string): boolean {
  return new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`).test(haystack);
}

/**
 * Things that only ever appear in a canned/pouched food. Water is the giveaway:
 * a kibble's water is driven off in the oven, so it is never an ingredient.
 */
const WET_MARKERS = [
  "water sufficient for processing",
  "sufficient water for processing",
  "water",
  "broth",
  "bouillon",
  "consomme",
  "gravy",
  "aspic",
  "jelly",
  "meat juices",
  "natural juices",
];

/**
 * Rendered "meals" are a dry-food ingredient — the rendering IS the drying — and
 * fats in kibble need an antioxidant to survive the shelf, which a retorted can
 * doesn't. Neither shows up in wet food.
 */
const DRY_MARKERS = [
  "chicken meal",
  "turkey meal",
  "lamb meal",
  "beef meal",
  "fish meal",
  "salmon meal",
  "menhaden fish meal",
  "poultry meal",
  "pork meal",
  "duck meal",
  "meat meal",
  "meat and bone meal",
  "corn gluten meal",
  "preserved with mixed tocopherols",
  "brewers rice",
  "brewers dried yeast",
];

/** Words on the front of the pack that name the form outright. */
const WET_NAME_WORDS = [
  "wet",
  "canned",
  "can",
  "pate",
  "pâté",
  "loaf",
  "stew",
  "gravy",
  "chunks",
  "shreds",
  "shredded",
  "minced",
  "morsels",
  "mousse",
  "terrine",
  "flaked",
  "tender bites",
];
const DRY_NAME_WORDS = [
  "dry",
  "kibble",
  "crunchy",
  "biscuit",
  "biscuits",
  "baked",
  "crisps",
];

/**
 * Read the form out of the composition alone — deterministic, no model.
 *
 * This is the second opinion. Deliberately conservative in the same way the
 * species reader is: it answers only when the text contains something that
 * belongs to one form and not the other, and says "unknown" the moment both
 * kinds of marker show up (a "chicken broth" line beside "chicken meal" means
 * one of them was misread, and guessing between them helps nobody).
 */
export function detectFormFromText(
  ingredientsText: string | null | undefined,
  productName?: string | null
): FoodForm {
  const text = normalize(ingredientsText ?? "");
  const name = normalize(productName ?? "");

  // The pack's own words come first when they're unambiguous — "Chunks in
  // Gravy" is the maker telling you outright.
  const nameWet = WET_NAME_WORDS.some((w) => hasWord(name, w));
  const nameDry = DRY_NAME_WORDS.some((w) => hasWord(name, w));
  if (nameWet !== nameDry) return nameWet ? "wet" : "dry";

  if (!text) return "unknown";
  const wet = WET_MARKERS.some((m) => hasWord(text, m));
  const dry = DRY_MARKERS.some((m) => hasWord(text, m));
  if (wet === dry) return "unknown";
  return wet ? "wet" : "dry";
}

/**
 * Moisture off the Guaranteed Analysis, when the panel was photographed. This
 * is the only signal that's a measurement rather than a reading: canned food is
 * water by weight, kibble can't hold more than about a tenth and stay shelf
 * stable, and the gap between them is wide enough that nothing lands in it by
 * accident.
 */
export function formFromMoisture(percent: number | null | undefined): FoodForm {
  if (typeof percent !== "number" || !Number.isFinite(percent)) return "unknown";
  if (percent < 0 || percent > 100) return "unknown";
  if (percent >= 60) return "wet";
  if (percent <= 16) return "dry";
  return "semi-moist";
}

export interface FormVerdict {
  form: FoodForm;
  /** Did a second, independent signal back this up? */
  confirmed: boolean;
  /** One line for the operator — why it landed here, or what disagreed. */
  why: string;
}

/**
 * Decide the form from everything we have, and say how sure we are.
 *
 * Two signals must agree before the catalog treats the form as settled. They're
 * genuinely independent: one is the pack read by the model (the tin, the words
 * "Dry Food"), the other is the composition read by the rules above. A third,
 * the moisture percentage, outranks both when it's there — it's measured, not
 * inferred.
 *
 * When the two disagree the answer is "unknown", not a coin toss. A wrong form
 * makes the report read the ingredient list the wrong way round, which is worse
 * than a report that stays neutral until someone looks.
 */
export function reconcileFoodForm(input: {
  /** What the model read off the pack. */
  fromPack: FoodForm;
  /** What the composition says (detectFormFromText). */
  fromText: FoodForm;
  /** Moisture % from the guaranteed analysis, if it was legible. */
  moisturePercent?: number | null;
}): FormVerdict {
  const { fromPack, fromText } = input;
  const fromMoisture = formFromMoisture(input.moisturePercent);

  // A measurement beats two readings. It still needs a second voice to count as
  // confirmed, but it decides WHICH answer we keep.
  if (fromMoisture !== "unknown") {
    const backed = fromPack === fromMoisture || fromText === fromMoisture;
    const disputed =
      (fromPack !== "unknown" && fromPack !== fromMoisture) ||
      (fromText !== "unknown" && fromText !== fromMoisture);
    return {
      form: fromMoisture,
      confirmed: backed,
      why: disputed
        ? `Guaranteed analysis says ${input.moisturePercent}% moisture, which the pack reading disagrees with — trusting the measurement.`
        : `Guaranteed analysis: ${input.moisturePercent}% moisture.`,
    };
  }

  if (fromPack !== "unknown" && fromPack === fromText) {
    return {
      form: fromPack,
      confirmed: true,
      why: "The pack and the ingredients agree.",
    };
  }

  if (fromPack !== "unknown" && fromText !== "unknown") {
    return {
      form: "unknown",
      confirmed: false,
      why: `The pack reads ${formLabel(fromPack)} but the ingredients read ${formLabel(fromText)} — set it by hand.`,
    };
  }

  const single = fromPack !== "unknown" ? fromPack : fromText;
  if (single !== "unknown") {
    return {
      form: single,
      confirmed: false,
      why:
        fromPack !== "unknown"
          ? "Read off the pack only — the ingredients don't settle it."
          : "Read from the ingredients only — the pack doesn't say.",
    };
  }

  return {
    form: "unknown",
    confirmed: false,
    why: "Neither the pack nor the ingredients say whether this is dry or wet.",
  };
}
