/**
 * The Guaranteed Analysis panel — read whole, instead of one figure out of it.
 *
 * ── What the panel is ─────────────────────────────────────────────────────
 *
 * A legally required block on American pet food (AAFCO's model regulations, as
 * adopted by the states). Four figures are compulsory — crude protein, crude
 * fat, crude fibre, moisture — and packs commonly add ash and, for cats,
 * taurine. The calorie content statement sits alongside it.
 *
 * They are GUARANTEES, not measurements. "Crude Protein 11.0% min" means the
 * food contains at least 11%; "Moisture 80.0% max" means at most 80. Nothing
 * derived from them is exact, and anything shown to a reader has to say so.
 *
 * "Crude" is the laboratory method, not a quality claim: crude protein is
 * inferred from nitrogen content, which is why it is a number about chemistry
 * rather than about meat.
 *
 * ── Why read all of it ────────────────────────────────────────────────────
 *
 * The panel photo was already being taken, already being uploaded, and already
 * being put in front of the model — and one number was asked for. The other six
 * went past and were dropped.
 *
 * They are worth more than the one. Moisture alone settles dry-vs-wet; moisture
 * WITH the rest settles the question a shopper actually gets wrong, which is
 * that an 11%-protein wet food and a 30%-protein dry food cannot be compared as
 * printed, because four fifths of the first one is water. And ash makes
 * carbohydrate calculable by difference — a figure pet food labels never print.
 *
 * ── Reading discipline ────────────────────────────────────────────────────
 *
 * The model copies; it does not compute. Everything here is a percentage as
 * printed on the pack, and the conversions happen later, in code, where they
 * can be checked. A panel whose figures cannot all be true together is dropped
 * entirely rather than partially trusted — the same rule the app's nutrition
 * reader uses, for the same reason: a plausible wrong number is worse than a
 * missing one.
 *
 * SHAPE MIRROR: `lib/guaranteed-analysis.ts` in ingredients.help reads what
 * this writes. Field names must match; add to both or neither.
 */

export interface GuaranteedAnalysis {
  /** Crude protein %, a MINIMUM as printed. */
  crudeProteinMin: number | null;
  /** Crude fat %, a MINIMUM as printed. */
  crudeFatMin: number | null;
  /** Crude fibre %, a MAXIMUM as printed. */
  crudeFiberMax: number | null;
  /** Moisture %, a MAXIMUM as printed. The denominator of every conversion. */
  moistureMax: number | null;
  /** Ash %, a MAXIMUM as printed. Without it carbohydrate can't be derived. */
  ashMax: number | null;
  /** Taurine %, a MINIMUM. Essential for cats; its absence is itself a signal. */
  taurineMin: number | null;
  /** Calorie content per kilogram, as printed. */
  kcalPerKg: number | null;
  /** Calories per serving as printed — e.g. 71 and "can" from "71 kcal/can". */
  kcalPerServing: number | null;
  /** What that serving is called on the pack: "can", "cup", "pouch". */
  servingName: string | null;
}

export const NO_ANALYSIS: GuaranteedAnalysis = {
  crudeProteinMin: null,
  crudeFatMin: null,
  crudeFiberMax: null,
  moistureMax: null,
  ashMax: null,
  taurineMin: null,
  kcalPerKg: null,
  kcalPerServing: null,
  servingName: null,
};

/**
 * The fractions that share one pack. Protein, fat, fibre, moisture and ash are
 * disjoint parts of the same 100 g, so their total cannot exceed it. A real
 * panel lands well under — the maxima are ceilings, not contents — so a total
 * over 100 means something was misread, not that the food is unusual.
 */
const SHARE_ONE_HUNDRED = [
  "crudeProteinMin",
  "crudeFatMin",
  "crudeFiberMax",
  "moistureMax",
  "ashMax",
] as const;

/** A single point of slack for rounding, not for a wrong reading. */
const TOTAL_CEILING = 101;

/**
 * Bounds on the calorie statement. Wet food runs around 800–1200 kcal/kg and
 * dry around 3000–4500; anything outside this by a wide margin is a misplaced
 * decimal or a per-serving figure copied into the per-kilogram field.
 */
const KCAL_PER_KG = { min: 100, max: 8000 };

/** A serving is a can, a cup, a pouch or a tray — never a paragraph. */
const SERVING_NAME_MAX = 16;

function percent(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
    ? value
    : null;
}

function positive(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}

/** The raw object as the model returns it, before anything is believed. */
export interface RawAnalysis {
  crude_protein_min?: unknown;
  crude_fat_min?: unknown;
  crude_fiber_max?: unknown;
  moisture_max?: unknown;
  ash_max?: unknown;
  taurine_min?: unknown;
  kcal_per_kg?: unknown;
  kcal_per_serving?: unknown;
  serving_name?: unknown;
}

export function readGuaranteedAnalysis(raw: unknown): GuaranteedAnalysis {
  if (!raw || typeof raw !== "object") return NO_ANALYSIS;
  const r = raw as RawAnalysis;

  const analysis: GuaranteedAnalysis = {
    crudeProteinMin: percent(r.crude_protein_min),
    crudeFatMin: percent(r.crude_fat_min),
    crudeFiberMax: percent(r.crude_fiber_max),
    moistureMax: percent(r.moisture_max),
    ashMax: percent(r.ash_max),
    taurineMin: percent(r.taurine_min),
    kcalPerKg: positive(r.kcal_per_kg, KCAL_PER_KG.min, KCAL_PER_KG.max),
    kcalPerServing: positive(r.kcal_per_serving, 1, 5000),
    servingName: null,
  };

  const name =
    typeof r.serving_name === "string" ? r.serving_name.trim().toLowerCase() : "";
  // A serving figure without a name for the serving is unusable — "71 kcal per
  // what?" — so the two stand or fall together.
  if (name && name.length <= SERVING_NAME_MAX && analysis.kcalPerServing !== null) {
    analysis.servingName = name;
  } else {
    analysis.kcalPerServing = null;
  }

  const total = SHARE_ONE_HUNDRED.reduce(
    (sum, key) => sum + (analysis[key] ?? 0),
    0
  );
  if (total > TOTAL_CEILING) {
    // The panel contradicts itself. Keep the calories, which are measured on a
    // different axis and can't be wrong because these are — everything that
    // shares the hundred goes.
    return {
      ...NO_ANALYSIS,
      kcalPerKg: analysis.kcalPerKg,
      kcalPerServing: analysis.kcalPerServing,
      servingName: analysis.servingName,
    };
  }

  return analysis;
}

/** Whether anything at all was read — a panel of nothing isn't worth storing. */
export function hasAnyFigure(analysis: GuaranteedAnalysis): boolean {
  return Object.values(analysis).some((v) => v !== null);
}
