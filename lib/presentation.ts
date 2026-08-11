import { deaccent } from "./fold";

/**
 * Two different things a pack says about itself, kept apart.
 *
 * ── The conflation this exists to undo ────────────────────────────────────
 *
 * "Flaked Salmon in Gravy" carries three separate facts:
 *
 *   texture      = flaked        — what the meat has been cut into
 *   flavour      = salmon        — which is `proteins` / `variant`, elsewhere
 *   presentation = in_gravy      — what it is suspended in
 *
 * We were storing the first and third in ONE `texture` field, so "shreds" and
 * "in sauce" landed in the same box and a capture kept whichever the model
 * happened to write. That makes two real questions unanswerable: "have I done
 * Shreds in Gravy as well as Shreds in Sauce?" — they are different products on
 * a shelf — and "does this list have thickeners in it because it is a gravy?".
 *
 * ── Why the second one is not cosmetic ────────────────────────────────────
 *
 * Presentation predicts composition. A gravy or a sauce is thickened, and the
 * thickener is nearly always carrageenan, guar gum or xanthan — the additives
 * the consumer app is asked about most. A pâté has none of that and a broth is
 * mostly water. Knowing which of the three a tin is tells you what SHOULD be in
 * the list, which is the difference between "this has carrageenan in it" and
 * "this has carrageenan in it, as every gravy does".
 *
 * ── Controlled vocabularies, not free text ────────────────────────────────
 *
 * Both are normalised to a fixed set. The pack's own wording is kept too — the
 * caller stores what was printed — but grouping needs one spelling per thing,
 * or "Pate", "Pâté" and "PATE" are three textures.
 */

/** What the meat has been cut, ground or shaped into. */
export type Texture =
  | "pate"
  | "loaf"
  | "mousse"
  | "minced"
  | "ground"
  | "chopped_ground"
  | "flaked"
  | "shredded"
  | "morsels"
  | "chunks"
  | "cuts"
  | "choice_cuts"
  | "slices"
  | "filets"
  | "bits"
  | "stew"
  | "medley"
  | "kibble"
  | "biscuit"
  | "freeze_dried"
  | "air_dried"
  | "dehydrated"
  | "fresh"
  | "raw"
  | "unknown";

/** What it is suspended in. NOT a texture — see the note above. */
export type Presentation =
  | "in_gravy"
  | "extra_gravy"
  | "in_sauce"
  | "in_broth"
  | "in_jelly"
  | "in_water"
  | "plain"
  | "unknown";

const TEXTURES = new Set<string>([
  "pate", "loaf", "mousse", "minced", "ground", "chopped_ground", "flaked",
  "shredded", "morsels", "chunks", "cuts", "choice_cuts", "slices", "filets",
  "bits", "stew", "medley", "kibble", "biscuit", "freeze_dried", "air_dried",
  "dehydrated", "fresh", "raw", "unknown",
]);

const PRESENTATIONS = new Set<string>([
  "in_gravy", "extra_gravy", "in_sauce", "in_broth", "in_jelly", "in_water",
  "plain", "unknown",
]);

export function isTexture(value: unknown): value is Texture {
  return typeof value === "string" && TEXTURES.has(value);
}

export function isPresentation(value: unknown): value is Presentation {
  return typeof value === "string" && PRESENTATIONS.has(value);
}

/**
 * How a pack writes each texture. Longest phrase first inside each entry, and
 * the whole list is searched most-specific-first — "chopped ground" must beat
 * "ground", and "choice cuts" must beat "cuts", or Pedigree's two wet ranges
 * collapse into one.
 */
const TEXTURE_WORDS: [Texture, string[]][] = [
  ["chopped_ground", ["chopped ground", "chopped grnd", "chopped dinner"]],
  ["choice_cuts", ["choice cuts"]],
  ["freeze_dried", ["freeze dried", "freeze-dried", "freezedried"]],
  ["air_dried", ["air dried", "air-dried"]],
  ["dehydrated", ["dehydrated"]],
  ["pate", ["pate", "premium pate", "classic pate"]],
  ["loaf", ["loaf", "meatloaf"]],
  ["mousse", ["mousse", "mouse texture", "velvet mousse"]],
  ["minced", ["minced", "mince", "finely minced", "savory minced"]],
  ["ground", ["ground dinner", "ground"]],
  ["flaked", ["flaked", "flakes"]],
  ["shredded", ["shredded", "shreds", "shred"]],
  ["morsels", ["morsels", "morsel", "meaty morsels", "tender morsels"]],
  ["chunks", ["chunks", "chunk", "chunky"]],
  // No "cuts in gravy" here, tempting as it is: the gravy is the presentation,
  // and a texture phrase that swallows one would put Blue Buffalo's ordinary
  // "Cuts in Gravy" under Pedigree's Choice Cuts range.
  ["cuts", ["cuts", "tender cuts"]],
  ["slices", ["thin slices", "slices", "sliced"]],
  ["filets", ["filets", "fillets", "filet", "prime filets"]],
  ["bits", ["meaty bits", "bits"]],
  ["stew", ["stew", "stews"]],
  ["medley", ["medley", "medleys"]],
  ["kibble", ["kibble", "crunchy bites", "crunchy", "dry food", "biscuits and kibble"]],
  ["biscuit", ["biscuit", "biscuits"]],
  ["fresh", ["fresh", "refrigerated"]],
  ["raw", ["raw frozen", "frozen raw", "raw"]],
];

/**
 * How a pack writes each presentation.
 *
 * "extra gravy" before "in gravy": Friskies sells both and they are different
 * products. "plain" is a real answer, not a missing one — a tin that says "in
 * its own juices" or nothing at all is not in gravy, and knowing that is what
 * makes the absence of a thickener unremarkable.
 */
const PRESENTATION_WORDS: [Presentation, string[]][] = [
  ["extra_gravy", ["extra gravy", "extra-gravy"]],
  ["in_gravy", ["in gravy", "in a gravy", "gravy", "with gravy", "in savory gravy"]],
  ["in_sauce", ["in sauce", "in a sauce", "in savory sauce", "sauce", "with sauce"]],
  ["in_broth", ["in broth", "in a broth", "silky broth", "broth", "consomme"]],
  ["in_jelly", ["in jelly", "in jelle", "in gelee", "jelly", "aspic"]],
  ["in_water", ["in water", "in spring water", "in its own juices", "in natural juices"]],
];

function fold(text: string | null | undefined): string {
  return deaccent(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasPhrase(haystack: string, phrase: string): boolean {
  return new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`).test(haystack);
}

/**
 * Find whichever of a vocabulary appears in the text, most specific first.
 *
 * Specificity is measured in words, not in list order, so the tables above can
 * be written in whatever order reads best without quietly changing behaviour.
 */
function match<T extends string>(
  text: string,
  table: [T, string[]][],
  fallback: T
): T {
  const candidates: { value: T; words: number; length: number }[] = [];
  for (const [value, phrases] of table) {
    for (const phrase of phrases) {
      if (!hasPhrase(text, phrase)) continue;
      candidates.push({
        value,
        words: phrase.split(" ").length,
        length: phrase.length,
      });
    }
  }
  if (candidates.length === 0) return fallback;
  candidates.sort((a, b) => b.words - a.words || b.length - a.length);
  return candidates[0].value;
}

/**
 * The texture named anywhere in this text.
 *
 * Deliberately does NOT look at gravy/sauce/broth words: those are the
 * presentation, and answering "gravy" to "what texture is it?" is the exact
 * mistake this module exists to stop.
 */
export function normalizeTexture(...parts: (string | null | undefined)[]): Texture {
  const text = fold(parts.filter(Boolean).join(" "));
  if (!text) return "unknown";
  return match<Texture>(text, TEXTURE_WORDS, "unknown");
}

/** What it is suspended in, named anywhere in this text. */
export function normalizePresentation(
  ...parts: (string | null | undefined)[]
): Presentation {
  const text = fold(parts.filter(Boolean).join(" "));
  if (!text) return "unknown";
  return match<Presentation>(text, PRESENTATION_WORDS, "unknown");
}

/** Human wording for a chip or a prompt. */
export function textureLabel(texture: Texture): string {
  if (texture === "unknown") return "";
  return texture.replace(/_/g, " ");
}

export function presentationLabel(presentation: Presentation): string {
  if (presentation === "unknown") return "";
  if (presentation === "plain") return "plain";
  return presentation.replace(/^in_/, "in ").replace(/_/g, " ");
}

/**
 * Does this presentation imply a thickener in the list?
 *
 * A gravy or a sauce is thickened, nearly always with carrageenan, guar gum or
 * xanthan. That does not excuse the additive — it is still worth telling
 * somebody about — but it is the difference between an ingredient that is there
 * because the product is a gravy and one that is there for no reason the pack
 * explains.
 */
export function impliesThickener(presentation: Presentation): boolean {
  return (
    presentation === "in_gravy" ||
    presentation === "extra_gravy" ||
    presentation === "in_sauce" ||
    presentation === "in_jelly"
  );
}
