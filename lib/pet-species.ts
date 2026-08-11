/**
 * Which animal a pet product is for.
 *
 * This decides more than wording. Cats are obligate carnivores, so grain bulk is
 * a real shortcoming in a cat food and unremarkable in a dog food — the same
 * ingredient list deserves different scores. Several ingredients are also toxic
 * to one species and not the other, so a warning aimed at the wrong animal is
 * noise at best.
 *
 * "both" is a genuine answer for treats sold for cats AND dogs; forcing one
 * species onto those would be a lie. "unknown" means say nothing species-
 * specific rather than guess.
 */
export type PetSpecies = "cat" | "dog" | "both" | "unknown";

export function isPetSpecies(value: unknown): value is PetSpecies {
  return (
    value === "cat" || value === "dog" || value === "both" || value === "unknown"
  );
}

/** Words that only appear on one animal's packaging. */
const CAT_WORDS = [
  "cat",
  "cats",
  "kitten",
  "kittens",
  "feline",
  "felines",
];
const DOG_WORDS = [
  "dog",
  "dogs",
  "puppy",
  "puppies",
  "canine",
  "canines",
];

function hasWord(haystack: string, words: string[]): boolean {
  return words.some((w) => new RegExp(`\\b${w}\\b`).test(haystack));
}

/**
 * Best guess from a product's name/brand text — the fallback for rows captured
 * before the species was recorded, and for photo scans that never went through
 * the scanner.
 *
 * Deliberately conservative: it reads names, not ingredients. "Taurine present"
 * would point at cat food, but dog foods add taurine too, and a wrong confident
 * answer here is worse than "unknown" — that at least keeps the report neutral.
 */
export function detectSpeciesFromText(
  ...parts: (string | null | undefined)[]
): PetSpecies {
  const text = parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    // Same fold as lib/food-form.ts: strip the accents as accents, not as
    // punctuation, so a name written with them still reads.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!text) return "unknown";

  const cat = hasWord(text, CAT_WORDS);
  const dog = hasWord(text, DOG_WORDS);
  if (cat && dog) return "both";
  if (cat) return "cat";
  if (dog) return "dog";
  return "unknown";
}

/** Human wording for the audience a report should address. */
export function speciesAudience(species: PetSpecies): string {
  if (species === "cat") return "cats";
  if (species === "dog") return "dogs";
  if (species === "both") return "cats and dogs";
  return "pets";
}
