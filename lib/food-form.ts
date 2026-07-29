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
  // Squeeze-tube and topper formats — the fastest-growing wet category, and
  // named for their texture rather than their tin.
  "puree",
  "purée",
  "hydrating",
  "lickable",
  "creamy",
  "broth",
  "bisque",
  "soup",
  "topper",
  "in sauce",
  "in jelly",
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
 * Read the form out of the COMPOSITION alone — deterministic, no model, and
 * deliberately blind to the product name.
 *
 * The blindness is the point. This is one of two signals that must agree before
 * the catalog treats the form as settled, and the other one is the model
 * reading the pack — which sees the name too. If this function also read the
 * name, a product called "Chunks in Gravy" would produce two "wet" answers off
 * ONE piece of evidence and be recorded as independently confirmed. Two
 * readings of the same words are not two confirmations.
 *
 * Conservative in the same way the species reader is: it answers only when the
 * list contains something belonging to one form and not the other, and says
 * "unknown" the moment both kinds of marker appear (a "chicken broth" line
 * beside "chicken meal" means one was misread, and guessing helps nobody).
 */
export function detectFormFromText(
  ingredientsText: string | null | undefined
): FoodForm {
  const text = normalize(ingredientsText ?? "");
  if (!text) return "unknown";
  const wet = WET_MARKERS.some((m) => hasWord(text, m));
  const dry = DRY_MARKERS.some((m) => hasWord(text, m));
  if (wet === dry) return "unknown";
  return wet ? "wet" : "dry";
}

/**
 * Read the form out of the pack's own words — "Chunks in Gravy", "Crunchy
 * Biscuits". The maker saying it outright.
 *
 * Kept apart from the composition reader on purpose (see above). It's used
 * where there is no model reading the pack at all — a photo scan in the
 * consumer app, or a catalog row that predates the column — and where the goal
 * is simply the best available guess rather than a second opinion.
 */
export function detectFormFromName(
  productName: string | null | undefined
): FoodForm {
  const name = normalize(productName ?? "");
  if (!name) return "unknown";
  const wet = WET_NAME_WORDS.some((w) => hasWord(name, w));
  const dry = DRY_NAME_WORDS.some((w) => hasWord(name, w));
  if (wet === dry) return "unknown";
  return wet ? "wet" : "dry";
}

/**
 * Best guess with no model in the picture: the name if it's decisive, else the
 * composition. NOT for the two-signal check — this deliberately mixes the
 * evidence that check keeps apart.
 */
export function guessFoodForm(
  ingredientsText: string | null | undefined,
  productName?: string | null
): FoodForm {
  const byName = detectFormFromName(productName);
  return byName !== "unknown" ? byName : detectFormFromText(ingredientsText);
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
