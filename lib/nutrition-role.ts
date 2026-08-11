import { foldWords } from "./fold";

/**
 * Is this a meal, or something you put on top of one?
 *
 * ── The wrong answer this exists to stop ──────────────────────────────────
 *
 * The report asks one question of a pet food: is there real named meat near the
 * top, or is it bulked out with grain, by-product and filler? That is the right
 * question about dinner.
 *
 * Applied to a lickable broth topper it is nonsense. A Friskies Lil' Soup is
 * mostly water and a little chicken, on purpose, and it is not trying to feed
 * an animal — it goes over the food. Applied to a bag of Temptations it is
 * worse: a treat is judged for not being a balanced diet, which no treat has
 * ever claimed to be, and the owner is told their cat's snack is a bad food.
 *
 * The pack itself draws this line and always has. American pet food carries one
 * of two AAFCO statements: "complete and balanced nutrition for…" or "for
 * intermittent or supplemental feeding only". The second sentence IS this
 * field.
 *
 * ── Unknown is the safe answer, and it is the default ─────────────────────
 *
 * A misread here would create exactly the class of error it is meant to remove
 * — a real dinner excused as "only a treat". So detection fires only on
 * unambiguous evidence, and everything else stays `unknown`.
 *
 * `unknown` must mean "say nothing", not "assume complete". That keeps the
 * change monotone: a report can only get better than it is today, never worse,
 * because the everyday standard still applies everywhere it applied before and
 * is withdrawn only where the pack says it should be.
 */
export type NutritionRole =
  /** A meal. "Complete and balanced" — the everyday standard applies. */
  | "complete"
  /** Real food, but not a diet: "for intermittent or supplemental feeding". */
  | "complementary"
  /** Goes on top of a meal: mixers, boosters, broths, gravies. */
  | "topper"
  /** A snack or a chew. Never a diet, never claimed to be. */
  | "treat"
  /** Vitamins, oils, powders — fed by the spoonful, not by the bowl. */
  | "supplement"
  | "unknown";

const ROLES = new Set<string>([
  "complete", "complementary", "topper", "treat", "supplement", "unknown",
]);

export function isNutritionRole(value: unknown): value is NutritionRole {
  return typeof value === "string" && ROLES.has(value);
}

/**
 * The AAFCO sentence, in the wordings it actually gets printed in.
 *
 * The "supplemental feeding" one is the strongest signal on any American pack
 * and beats everything else: a maker printing it is telling you outright that
 * the product is not a diet.
 */
const COMPLEMENTARY_PHRASES = [
  "intermittent or supplemental feeding",
  "intermittent and supplemental feeding",
  "supplemental feeding only",
  "not intended for use as a sole source of nutrition",
  "not a complete and balanced",
  "complementary pet food",
  "complementary food",
];

const COMPLETE_PHRASES = [
  "complete and balanced",
  "complete balanced",
  "100 complete nutrition",
  "100 complete and balanced",
  "complete nutrition for",
  "sole source of nutrition",
];

/**
 * Words a maker uses when the product goes ON food rather than being it.
 *
 * Compounds only — never a bare "topper". Cesar sells "Loaf & Topper in Sauce",
 * a complete and balanced dog food where the topper is the garnish ON the loaf,
 * and a bare match would file a real dinner as a garnish. That is precisely the
 * error this module exists to prevent, committed by the module itself.
 */
const TOPPER_PHRASES = [
  "meal mixer",
  "meal mixers",
  "bowl booster",
  "bowl boosters",
  "food topper",
  "meal topper",
  "gravy topper",
  "broth topper",
  "lickable topper",
  "dinner dust",
];

const TREAT_PHRASES = [
  "treat",
  "treats",
  "snack",
  "snacks",
  "biscuit",
  "biscuits",
  "chew",
  "chews",
  "dental stick",
  "dental sticks",
  "dental chew",
  "dental chews",
  "jerky",
  "training reward",
  "crunchy treats",
  "lickable treat",
  "lickable treats",
];

const SUPPLEMENT_PHRASES = [
  "supplement",
  "supplements",
  "nutritional supplement",
  "vitamin supplement",
  "for supplemental use",
];

/**
 * Ranges whose whole purpose is not being dinner.
 *
 * A short list on purpose, and every entry is one where the maker sells the
 * range as a snack or a topper outright. Borderline ranges are deliberately
 * missing: a range guessed wrong here excuses a real food, which is the error
 * this module exists to prevent, so the desk answers those instead.
 */
const KNOWN_TREAT_LINES = [
  "temptations",
  "greenies",
  "milk bone",
  "milkbone",
  "pup peroni",
  "beggin strips",
  "dentastix",
  "dentalife",
  "whimzees",
  "party mix",
  "savory cravings",
  "zukes",
  "nudges",
  "true chews",
  "waggin train",
  "busy bone",
  "t bonz",
  "variety snaps",
  "marosnacks",
  "wild weenies",
  "tricky trainers",
  "pill pockets",
  "snacky mouse",
];

const KNOWN_TOPPER_LINES = [
  "meal mixers",
  "bowl boosters",
  "lil soups",
  "squeeze up",
  "dinner dust",
  "purrfect broths",
  "broths",
  "appetizers",
  "raw toppers",
];

function hasPhrase(haystack: string, phrase: string): boolean {
  return new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`).test(haystack);
}

function anyPhrase(haystack: string, phrases: string[]): boolean {
  return phrases.some((p) => hasPhrase(haystack, p));
}

/**
 * What this product is, from what the pack says about itself.
 *
 * `claims` are the front-of-pack lines copied verbatim — that is where the
 * AAFCO sentence turns up when it is on the front at all. `parts` are the
 * brand, range, name and variant.
 *
 * Order matters and is not arbitrary. The AAFCO statement comes first in both
 * its forms — "for intermittent or supplemental feeding only" and "complete and
 * balanced" — because that sentence is what the maker is legally declaring the
 * product to be, and it settles the question against anything a range name
 * merely suggests. Only when the pack made no such declaration do the names
 * get a say.
 */
export function detectNutritionRole(input: {
  claims?: string[] | null;
  parts?: (string | null | undefined)[];
}): NutritionRole {
  const claims = foldWords((input.claims ?? []).join(" "));
  const names = foldWords((input.parts ?? []).filter(Boolean).join(" "));
  const all = `${claims} ${names}`.trim();
  if (!all) return "unknown";

  // The pack saying outright that it is not a diet. Nothing overrides this.
  if (anyPhrase(all, COMPLEMENTARY_PHRASES)) return "complementary";

  // The other half of the same declaration, and it outranks anything read out
  // of a NAME for the same reason: it is what the maker is legally saying the
  // product is. Only from `claims` — "complete nutrition" inside a product name
  // is marketing copy, and treats print marketing copy too.
  if (anyPhrase(claims, COMPLETE_PHRASES)) return "complete";

  if (anyPhrase(all, SUPPLEMENT_PHRASES)) return "supplement";
  if (anyPhrase(names, KNOWN_TOPPER_LINES) || anyPhrase(all, TOPPER_PHRASES)) {
    return "topper";
  }
  if (anyPhrase(names, KNOWN_TREAT_LINES) || anyPhrase(all, TREAT_PHRASES)) {
    return "treat";
  }

  return "unknown";
}

/** Human wording, for a chip or a prompt. */
export function roleLabel(role: NutritionRole): string {
  if (role === "complete") return "complete food";
  if (role === "complementary") return "complementary food";
  if (role === "topper") return "topper";
  if (role === "treat") return "treat";
  if (role === "supplement") return "supplement";
  return "";
}

/**
 * Should the everyday "is this a good diet?" standard be applied?
 *
 * True for a meal and for anything we could not identify — withdrawing the
 * standard on a guess is how a real food gets excused. False only where the
 * pack itself says the product is not dinner.
 */
export function judgeAsDiet(role: NutritionRole): boolean {
  return role === "complete" || role === "unknown";
}
