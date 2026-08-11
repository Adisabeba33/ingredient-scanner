import Anthropic from "@anthropic-ai/sdk";
import { isLabelCategory, type LabelCategory } from "@/lib/extract";

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
  /** The variant/flavour/life-stage, e.g. "Chicken & Brown Rice". */
  variant: string | null;
  /** Net weight or volume, transcribed exactly as printed. */
  net_weight: string | null;
  /** What it is sold in. */
  container: string | null;
  /** Pet food, human food, or cosmetics — same question as the full read. */
  category: LabelCategory;
  /** What could not be read, so the desk knows to look at the photo itself. */
  unreadable: string[];
}

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
        "The product line WITHOUT the flavour or variant (e.g. 'Life Protection Formula', 'Cesar Classic Loaf'). Null if not legible.",
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
        enum: ["brands", "product_name", "variant", "net_weight", "container"],
      },
      description:
        "Name every field above you had to answer null (or 'other') because the photograph was blurry, glared, cropped or too small to read — as opposed to the pack genuinely not printing it. Empty when the photo was legible throughout.",
    },
  },
  required: [
    "brands",
    "product_name",
    "variant",
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
  "This is the front of a product. Read off it: the brand, the product line, the variant " +
  "(flavour / recipe / life-stage), the net weight or volume exactly as printed, what it is " +
  "sold in, and what kind of product it is. The variant and the weight matter most — they " +
  "are what tell two barcodes of the same product line apart. Copy the weight with its unit " +
  "and do not convert it. If a field is unreadable in this photograph, answer null and name " +
  "it in `unreadable`; if the pack simply does not print it, answer null and leave it out of " +
  "that list.";

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
  return {
    identity: {
      brands: clean(parsed.brands),
      product_name: clean(parsed.product_name),
      variant: clean(parsed.variant),
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
