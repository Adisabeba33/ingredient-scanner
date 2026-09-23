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
  // What Mars prints on the front where the AAFCO sentence is in the small
  // print. Sheba's Selections range is sold as "Cat Meal Complement" and its
  // own page says "intended for intermittent or supplemental feeding only" —
  // the phrase above, which a photographed front may never show while this one
  // is the headline.
  //
  // Tight on purpose: the bigram, not the word. A complete food describing
  // itself as "the perfect complement to your cat's meal" says those words in
  // the other order and is not matched — the Cesar "Loaf & Topper" trap, which
  // this module has already sprung on itself once.
  "meal complement",
  "meal complements",
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
  // Sheba's stick treats. The name carries no word TREAT_PHRASES holds, so a
  // 0.71 oz pouch of sticks would be judged as a cat's whole diet. The Sheba
  // brief flagged it before any was seeded; batch 044 is the first that is.
  "meaty tender sticks",
  // Beneful's biscuit range — Hugs and Snackers. Neither name contains a word
  // TREAT_PHRASES holds, so without this line the report reads a bag of
  // biscuits as a complete diet and marks it down for not being one. Found by
  // the batch-040 campaign and checked against the detector before seeding.
  "baked delights",
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
  // Ziwi Peak's snack ranges. "Air-Dried Chews" is a trachea, an ear, a lung
  // — single dried organs sold to be chewed, and the range name says chews.
  // Getting this wrong is the §2.4 error in its purest form: a lamb trachea
  // is 81% protein on a dry-matter basis and would otherwise be judged, and
  // praised, as an extraordinary complete diet.
  "air-dried chews",
  "air dried chews",
  "good dog rewards",
  // I and love and you names its snack ranges the way other makers name
  // flavours, so none of them contain the words "treat" or "chew" and every
  // one of them would otherwise be judged as dinner. They are the §2.4 error
  // in the same form Ziwi's chews were: a beef pizzle is 79% protein and a
  // beef ear 83%, and both would be read as extraordinary complete foods.
  //
  // "bully stick" and "bully stix" are both here because the maker prints
  // both, on packs sold beside each other.
  "bully stick",
  "bully sticks",
  "bully stix",
  "gullet stix",
  "ear candy",
  // Two ranges of soft-baked snacks, cat and dog, that share the word.
  "hearties",
  // Freeze-dried cat snacks. "Fillin" is the maker's spelling.
  "fillin good",
  // Blue Buffalo's kitten snack, and the one record in that ledger whose deck
  // word did not survive into the name: its sibling is "Kitten Crunchy TREAT
  // Chicken" and this one is "Kitten Crunchy Grain-Free Salmon Recipe", so
  // every other signal says snack and the name says nothing.
  //
  // Narrow on purpose — two words, adjacent, both required. Blue Buffalo's
  // kitten DIET is "Tastefuls Kitten", and no maker has ever called a
  // complete food "Kitten Crunchy". Without this the pack is judged as a
  // kitten's whole diet, which is the §2.4 error about a bag of snacks.
  "kitten crunchy",
  // Reveal's two snack ranges, and the same failure as Ziwi's chews in both
  // directions. "Bone Broth" is a 3 oz pouch of 95%-water broth with a
  // collagen boost, sold as a topper or a drink — judged as dinner it is the
  // worst food ever measured. "Whole Loin" is one salmon loin and nothing
  // else; the pack calls it a treat, but the range name alone does not, and
  // the range name is what survives into `line` once `variant` is the fish.
  //
  // Both are compounds a complete food would not carry: no maker calls a
  // dinner "Bone Broth", and "in bone broth" — the phrase that could have
  // been a problem — is a presentation, not a range, and is stored in
  // `presentation` rather than in a name.
  "bone broth",
  "whole loin",
  // Sheba's snack range. Not one of the words this detector looks for — no
  // treat, snack, chew, biscuit or jerky — and a bag of forty dried sticks
  // judged as a complete diet is the same error as Ziwi's chews. The Sheba
  // brief named it in advance as the thing that would go wrong on this brand,
  // and it was right.
  "meaty tender sticks",
  // Wellness's snack ranges, and the reason the brand was briefed before a
  // single barcode of it was researched: "Soft Puppy Bites" is in the seed's
  // own `lines` list for this brand, so without this a bag of training treats
  // is judged as a puppy's entire diet. The maker's current pages settle it
  // outright — Puppy Bites and Kittles both print "intended for intermittent
  // or supplemental feeding only", quoted with their URLs in
  // research/WELLNESS-HANDOFF.md §1.
  //
  // Both spellings of the puppy range are here because the maker prints both:
  // the product page heads it "Wellness Puppy Bites" and the marketing copy
  // calls it "Soft Puppy Bites". Neither is bare "puppy bites", which would be
  // the guess this list refuses — a complete food may well carry those two
  // words, and a range guessed wrong here excuses a real food.
  "wellness puppy bites",
  "soft puppy bites",
  "kittles",
  "rewarding life",
];

/**
 * Ranges the maker itself declares are NOT a diet.
 *
 * `complementary` already existed as a value and could only ever be reached
 * from a `claims` string — the AAFCO sentence "for intermittent or
 * supplemental feeding only" read off the front of a pack. The seed does not
 * carry claims; it carries a brand, a range and a variant, so a range that
 * declares itself supplemental was unreachable and came out `unknown`, which
 * means "judge it as dinner".
 *
 * Weruva Wx is what made that a real problem rather than a gap. It is a
 * phosphorus-restricted food sold for cats with kidney disease, its own pages
 * state intermittent or supplemental feeding only AND that its phosphorus is
 * inadequate for the AAFCO profiles at any life stage — and it is sold off a
 * shelf, so `isVeterinaryDiet` does not fire and should not. Judged as an
 * everyday complete diet it would be marked down for exactly the restriction
 * it is bought for, to somebody who is very likely feeding it on a vet's
 * advice.
 *
 * Two letters is a short phrase to match on, and safe here: `hasPhrase`
 * requires word boundaries, no other range in this catalog is called Wx, and
 * the alternative is telling a renal patient's owner their food is bad.
 */
const KNOWN_COMPLEMENTARY_LINES = [
  "wx",
  // Sheba's meal-complement range, and the seed's route to the same fact the
  // phrase list reaches from a photographed pack. A box of these carries no
  // claims string at all, so without this it would be judged as dinner — and a
  // 1.3 oz tray of filets in broth judged as a cat's whole diet is marked down
  // for everything a complement was never meant to supply.
  //
  // Four words, so it needs no brand scope: nothing else on any shelf is
  // called this, and the bare word "filets" — which IS in this catalog's
  // texture vocabulary — never matches on its own.
  "selections filets in broth",
];

/**
 * The same declaration, where the range name is too ordinary to match on.
 *
 * Reveal is what made this necessary. Its 2.47 oz tins — the tuna and chicken
 * in broth that are most of what the brand sells — are the **Limited
 * Ingredient** range, PetSmart files them under food TOPPERS, and Reveal's own
 * packs print "complementary pet food … INTENDED FOR INTERMITTENT OR
 * SUPPLEMENTAL FEEDING ONLY". Reveal's Entrées, kitten patés and dry bags are
 * complete and balanced; the Limited Ingredient tins beside them are not, and
 * nothing in the range name says so.
 *
 * It cannot go in the list above. "Limited ingredient" is one of the most
 * common phrases in this industry and it usually describes a COMPLETE food.
 * Merrick has three seeded dog products under "Limited Ingredient Diet Grain
 * Free" and "Limited Ingredient Diet Healthy Grains" — complete diets, in this
 * catalog today — and Natural Balance's flagship range is "L.I.D. Limited
 * Ingredient Diets". An unscoped match would declare all of them supplemental:
 * the same error this table exists to prevent, aimed at the wrong brands, and
 * it would ship silently because nothing in the seed records adequacy.
 *
 * So it is scoped to the maker, for the reason `HILLS_CODES` is scoped in
 * `lib/vet-diet.ts`: a token too small to carry a claim on its own can still
 * carry one under a brand that prints it.
 */
const BRAND_COMPLEMENTARY_LINES: Record<string, string[]> = {
  reveal: ["limited ingredient"],
  // Cesar's own page calls Simply Crafted "a simple and tasty meal complement"
  // to "add to any complete and balanced meal as a healthy topper", and the
  // panels bear it out: 0.1–0.5% fat in a 1.3 oz tray. Scoped to Cesar because
  // "simply crafted" is ordinary marketing copy anywhere else.
  cesar: ["simply crafted"],
};

/**
 * A brand listed in KNOWN_TREAT_LINES that also sells real dinners.
 *
 * "temptations" is a treat word on its own, and for twenty years was right:
 * the brand WAS the treat. Mars now sells complete-and-balanced Temptations
 * dry food and wet trays ("Paté in Gravy", "Bites in Gravy"), and read by the
 * brand alone those would be excused from every everyday standard — a real
 * food waved through, the error this module exists to prevent. These ranges,
 * under this brand, are dinner. Found by the batch 043 campaign.
 */
const BRAND_MEAL_LINES: Record<string, string[]> = {
  temptations: [
    "pate in gravy",
    "bites in gravy",
    "dry cat food",
    "dry kitten food",
    "wet cat food",
  ],
};

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
  // I and love and you's functional pouches — "Top That Move", "Top That
  // Tummy". A three-ounce pouch of stew poured over dinner, and the range
  // name is the instruction. Safe as a compound in the way a bare "topper" is
  // not: two words, and the maker's own range name.
  "top that",
  // Blue Buffalo's Wild Cuts range. "Tasty Toppers" is the range name on the
  // pouch, and it is the compound the bare word could not be — the Cesar
  // "Loaf & Topper in Sauce" trap needs "topper" standing alone to spring.
  "tasty toppers",
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
  // The same declaration reached from the range name, for the seed, which has
  // no claims to read. Ranked with the phrase above rather than below the
  // complete check, because it IS that phrase — just printed somewhere this
  // catalog stores and the claims list does not reach.
  if (anyPhrase(names, KNOWN_COMPLEMENTARY_LINES)) return "complementary";
  // And the ranges whose names only mean "supplemental" under their own maker.
  for (const [brand, lines] of Object.entries(BRAND_COMPLEMENTARY_LINES)) {
    if (hasPhrase(names, brand) && anyPhrase(names, lines)) return "complementary";
  }

  // The other half of the same declaration, and it outranks anything read out
  // of a NAME for the same reason: it is what the maker is legally saying the
  // product is. Only from `claims` — "complete nutrition" inside a product name
  // is marketing copy, and treats print marketing copy too.
  if (anyPhrase(claims, COMPLETE_PHRASES)) return "complete";

  if (anyPhrase(all, SUPPLEMENT_PHRASES)) return "supplement";
  if (anyPhrase(names, KNOWN_TOPPER_LINES) || anyPhrase(all, TOPPER_PHRASES)) {
    return "topper";
  }
  for (const [brand, lines] of Object.entries(BRAND_MEAL_LINES)) {
    if (hasPhrase(names, brand) && anyPhrase(names, lines)) return "unknown";
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
