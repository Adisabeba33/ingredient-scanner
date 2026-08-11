import Anthropic from "@anthropic-ai/sdk";
import { isLabelCategory, type LabelCategory } from "@/lib/extract";
import { isPetSpecies } from "@/lib/pet-species";

/**
 * Read who a product is off one photograph of its front.
 *
 * ── Why this is separate from extractLabel ────────────────────────────────
 *
 * That one reads a composition and refuses when it can't — correctly, since a
 * half-read ingredient list is worse than none. Express Mode has no ingredients
 * photo at all, so every one of those refusals would fire on every capture. The
 * question here is a different one: not "what is in it" but "which product is
 * this", and the front of a pack answers that on its own.
 *
 * ── Read at full resolution, on purpose ───────────────────────────────────
 *
 * The caller hands over the ORIGINAL photo and shrinks it only afterwards. Net
 * weight is the smallest print on a pack and the first thing to dissolve under
 * compression, and it is read once, here, while the pixels are still there.
 */

export interface LabelIdentity {
  /** Brand line, e.g. "Blue Buffalo". */
  brands: string | null;
  /** Product name without the variant, e.g. "Life Protection Formula". */
  product_name: string | null;
  /**
   * The sub-brand or range within the brand: "Shreds", "Pate", "Prime Filets".
   * Not the flavour. Kept apart from the name because it is often the texture
   * word that settles wet vs dry, and because two ranges of one brand are
   * different products that a search must not merge.
   */
  product_line: string | null;
  /** The variant/flavour, e.g. "With Salmon in Sauce". */
  variant: string | null;
  /** Pet food: which animal the front says it is for. */
  species: "cat" | "dog" | "both" | "unknown";
  /** "kitten" | "puppy" | "adult" | "senior" | "all" | null. */
  life_stage: string | null;
  /** The named protein(s) on the front: ["salmon"], ["chicken", "liver"]. */
  proteins: string[];
  /**
   * The TEXTURE as printed — what the meat is cut or shaped into: "shreds",
   * "pate", "flaked", "chunks", "kibble". The strongest wet/dry signal a front
   * carries.
   *
   * Kept apart from `presentation` on purpose. "Flaked Salmon in Gravy" is a
   * flaked texture in a gravy, and storing both words in one field means a
   * capture keeps whichever the model happened to write — after which "have I
   * done Shreds in Gravy as well as Shreds in Sauce?" has no answer, and they
   * are different products on a shelf. See lib/presentation.ts.
   */
  texture: string | null;
  /**
   * What it is suspended in, as printed: "in gravy", "in sauce", "in broth".
   *
   * Not a texture. It also predicts the composition — a gravy or a sauce is
   * thickened, nearly always with carrageenan, guar gum or xanthan — so it is
   * the difference between "this has carrageenan in it" and "this has
   * carrageenan in it, as every gravy does".
   */
  presentation: string | null;
  /**
   * Front-of-pack claims, verbatim: "Complete & Balanced", "No artificial
   * colors", "With real salmon". The consumer app has a section that weighs
   * marketing against the composition, and until now it had only the back of
   * the pack to work from.
   */
  front_claims: string[];
  /** "12" from "12 x 5.5 oz", when the pack is a multipack. */
  multipack_count: number | null;
  /** Net weight or volume, transcribed exactly as printed. */
  net_weight: string | null;
  /** What it is sold in. */
  container: string | null;
  /** Pet food, human food, or cosmetics — same question as the full read. */
  category: LabelCategory;
  /** What could not be read, so the desk knows to look at the photo itself. */
  unreadable: string[];
}

const LIFE_STAGES = ["kitten", "puppy", "adult", "senior", "all"];

const CONTAINERS = [
  "can",
  "pouch",
  "bag",
  "tray",
  "box",
  "bottle",
  "jar",
  "tub",
  "carton",
  "other",
];

const IDENTITY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    brands: {
      type: ["string", "null"],
      description:
        "The brand, as printed — usually the largest or topmost name (e.g. 'Blue Buffalo', 'Weruva', 'Purina'). Null if no brand is legible.",
    },
    product_name: {
      type: ["string", "null"],
      description:
        "The product name WITHOUT the range or the flavour (e.g. 'Life Protection Formula', 'Classic Loaf'). Null if the pack shows only a brand and a flavour, which is common.",
    },
    product_line: {
      type: ["string", "null"],
      description:
        "The sub-brand or range within the brand, usually set in its own banner or badge: 'Shreds', 'Pate', 'Prime Filets', 'Gravy Lovers', 'Tastefuls'. NOT the flavour and NOT the brand. Null if the pack has no such range.",
    },
    variant: {
      type: ["string", "null"],
      description:
        "The flavour, recipe or life-stage that distinguishes this pack from its siblings (e.g. 'Chicken & Brown Rice', 'Kitten', 'Large Breed', 'Salmon Dinner'). This is what separates two barcodes of the same product line, so copy it exactly. Null if the pack has no variant.",
    },
    net_weight: {
      type: ["string", "null"],
      description:
        "Net weight or volume EXACTLY as printed, with its unit and no conversion: '12.5 oz', '3 kg', '85 g', '1.5 L', '24 x 100g'. It is often the smallest print on the pack. Null if you cannot read it — do NOT estimate from the pack's size.",
    },
    species: {
      type: "string",
      enum: ["cat", "dog", "both", "unknown"],
      description:
        "Pet products only: which animal the FRONT says it is for — 'Cat Food', 'For Dogs', a kitten or puppy named, the animal pictured as the one eating it. 'both' only if the pack really is sold for cats AND dogs. 'unknown' for anything that isn't pet food, and for a pet pack whose front doesn't say. Do NOT infer it from the brand you happen to recognise: read the pack.",
    },
    life_stage: {
      type: ["string", "null"],
      enum: ["kitten", "puppy", "adult", "senior", "all", null],
      description:
        "The life stage printed on the front: 'Kitten', 'Puppy', 'Adult', 'Senior'/'7+'/'Mature', or 'all' for 'All Life Stages'. Null when the front doesn't say.",
    },
    proteins: {
      type: "array",
      items: { type: "string" },
      description:
        "The protein(s) named on the front, lowercase and singular: ['salmon'], ['chicken', 'liver'], ['beef']. This is what the pack SELLS itself on, not the full composition. Empty when no protein is named.",
    },
    texture: {
      type: ["string", "null"],
      description:
        "The TEXTURE only — what the food has been cut, ground or shaped into: 'pate', 'shreds', 'flaked', 'minced', 'chunks', 'cuts', 'slices', 'filets', 'morsels', 'loaf', 'mousse', 'stew', 'kibble', 'biscuits'. Copy it as printed. Do NOT put 'in gravy', 'in sauce' or 'in broth' here — those go in `presentation`. For 'Flaked Salmon in Gravy' the texture is 'Flaked'. Null when the pack names no texture.",
    },
    presentation: {
      type: ["string", "null"],
      description:
        "What the food is suspended in, as printed: 'in gravy', 'extra gravy', 'in sauce', 'in broth', 'in jelly', 'in water', 'in its own juices'. NOT the texture. For 'Flaked Salmon in Gravy' this is 'in Gravy'. Null when the pack doesn't say — a pate usually doesn't.",
    },
    front_claims: {
      type: "array",
      items: { type: "string" },
      description:
        "Claims printed on the front, VERBATIM and each as its own string: 'Complete & Balanced', 'No artificial colors, flavors or preservatives', 'With real salmon', 'Grain Free', 'High Protein', '100% Complete Nutrition'. Copy what is written — do not summarise, rephrase or judge. INCLUDE the feeding statement if the front carries it — 'Complete & Balanced Nutrition', 'For intermittent or supplemental feeding only', 'A complement to your cat's regular meal' — that sentence decides whether the product is a meal at all, so never leave it out. Empty when the front carries none.",
    },
    multipack_count: {
      type: ["integer", "null"],
      description:
        "How many units are in the pack, when it is sold as several: 12 from '12 x 5.5 oz', 24 from '24 count'. Null for a single unit — do NOT put 1 here.",
    },
    container: {
      type: "string",
      enum: CONTAINERS,
      description:
        "What the product is sold in, judged from the photograph: a can, a foil pouch, a bag, a plastic tray, a box, a bottle, a jar, a tub, a carton. 'other' when it is none of these or you cannot tell.",
    },
    category: {
      type: "string",
      enum: ["pet", "human", "cosmetics", "unknown"],
      description:
        "What kind of product this is, from the PACK — who it is sold to feed or be used on. 'pet' for an animal (a cat or dog pictured as the consumer, 'Cat Food', feeding guidelines by body weight). 'human' for food or drink for people. 'cosmetics' for something applied to the body rather than eaten. 'unknown' when the front genuinely does not say.",
    },
    unreadable: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "brands",
          "product_name",
          "product_line",
          "variant",
          "net_weight",
          "container",
          "species",
          "life_stage",
          "proteins",
          "texture",
          "presentation",
        ],
      },
      description:
        "Name every field above you had to answer null (or 'other') because the photograph was blurry, glared, cropped or too small to read — as opposed to the pack genuinely not printing it. Empty when the photo was legible throughout.",
    },
  },
  required: [
    "brands",
    "product_name",
    "product_line",
    "variant",
    "species",
    "life_stage",
    "proteins",
    "texture",
    "presentation",
    "front_claims",
    "multipack_count",
    "net_weight",
    "container",
    "category",
    "unreadable",
  ],
} as const;

const SYSTEM =
  "You identify retail products from a photograph of the front of the pack, for a catalog. " +
  "You copy what is printed and never invent: an unreadable field is null, not a guess. " +
  "You are not asked for the ingredient list and must not attempt one.";

const USER_INSTRUCTION =
  "This is the front of a product. Read everything off it that the schema asks for: the " +
  "brand, the range, the product name, the flavour, the animal it is for, the life stage, " +
  "the protein it is sold on, the texture, what it is suspended in, the claims printed on it, " +
  "the pack count, the net weight and what it is sold in. " +
  "Keep the texture and what it is suspended in APART. 'Flaked Salmon in Gravy' is texture " +
  "'Flaked', flavour 'Salmon', presentation 'in Gravy' — three answers, not one phrase. " +
  "The flavour and the weight matter most — they are what tell two barcodes of one product " +
  "line apart. Copy the weight with its unit and do not convert it. " +
  "Copy the claims word for word: they are compared against the ingredient list later, and a " +
  "paraphrase makes that comparison meaningless. " +
  "A round can or a bag photographed at an angle shows only part of its front, so some of " +
  "this will genuinely not be in the picture. That is fine and expected. Answer null (or an " +
  "empty list) and, if the reason is that the photograph was blurry, glared or cropped rather " +
  "than the pack not printing it, name the field in `unreadable`. Never guess a field from a " +
  "brand you recognise — read this pack.";

function toImageBlock(dataUrl: string): Anthropic.Messages.ImageBlockParam {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!match) {
    throw new Error("image must be a base64 data URL (data:image/…;base64,…)");
  }
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: match[1] as "image/jpeg" | "image/png" | "image/webp",
      data: match[2],
    },
  };
}

function firstText(msg: Anthropic.Messages.Message): string {
  const text = msg.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) throw new Error("No content returned from the model.");
  return text;
}

function stripFence(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (m ? m[1] : t).trim();
}

const clean = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

export async function extractIdentity({
  apiKey,
  model,
  frontImage,
}: {
  apiKey: string;
  model: string;
  /** Data URL of the front-of-pack photo, at its ORIGINAL resolution. */
  frontImage: string;
}): Promise<{
  identity: LabelIdentity;
  usage: { input: number; output: number };
}> {
  const client = new Anthropic({ apiKey });
  const content: Anthropic.Messages.ContentBlockParam[] = [
    { type: "text", text: "Front of the pack:" },
    toImageBlock(frontImage),
    { type: "text", text: USER_INSTRUCTION },
  ];

  let final: Anthropic.Messages.Message;
  try {
    final = await client.messages
      .stream({
        model,
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: "user", content }],
        output_config: {
          format: { type: "json_schema", schema: IDENTITY_SCHEMA },
        },
      })
      .finalMessage();
  } catch {
    // Same fallback shape as lib/extract.ts: a model that rejects output_config
    // still answers a plain JSON prompt.
    final = await client.messages
      .stream({
        model,
        max_tokens: 1000,
        system: `${SYSTEM}\n\nReturn ONLY a single JSON object matching this schema, with no prose and no markdown fences:\n${JSON.stringify(IDENTITY_SCHEMA)}`,
        messages: [{ role: "user", content }],
      })
      .finalMessage();
  }

  const parsed = JSON.parse(stripFence(firstText(final))) as Record<
    string,
    unknown
  >;
  const container = clean(parsed.container);
  const life = clean(parsed.life_stage)?.toLowerCase() ?? null;
  const strings = (v: unknown): string[] =>
    Array.isArray(v)
      ? v
          .filter((x): x is string => typeof x === "string")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];
  const count =
    typeof parsed.multipack_count === "number" &&
    Number.isFinite(parsed.multipack_count) &&
    // 1 is not a multipack, and a pack of a thousand is a misread.
    parsed.multipack_count > 1 &&
    parsed.multipack_count <= 200
      ? Math.round(parsed.multipack_count)
      : null;
  return {
    identity: {
      brands: clean(parsed.brands),
      product_name: clean(parsed.product_name),
      product_line: clean(parsed.product_line),
      variant: clean(parsed.variant),
      species: isPetSpecies(parsed.species) ? parsed.species : "unknown",
      life_stage: life && LIFE_STAGES.includes(life) ? life : null,
      proteins: strings(parsed.proteins).map((p) => p.toLowerCase()),
      texture: clean(parsed.texture),
      presentation: clean(parsed.presentation),
      front_claims: strings(parsed.front_claims),
      multipack_count: count,
      net_weight: clean(parsed.net_weight),
      container:
        container && CONTAINERS.includes(container) ? container : null,
      category: isLabelCategory(parsed.category) ? parsed.category : "unknown",
      unreadable: Array.isArray(parsed.unreadable)
        ? parsed.unreadable.filter((x): x is string => typeof x === "string")
        : [],
    },
    usage: {
      input: final.usage.input_tokens,
      output: final.usage.output_tokens,
    },
  };
}
