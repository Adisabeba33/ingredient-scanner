import Anthropic from "@anthropic-ai/sdk";

/**
 * Read a pet-food label from photos with Claude vision.
 *
 * The ingredients photo is the ground truth for `ingredients_text`; the brand
 * photo gives `product_name` + `brands`. We transcribe VERBATIM — the whole
 * point of this catalog is that our composition is the real one off the bag,
 * not the truncated/wrong text in the open databases.
 *
 * Follows the Anthropic conventions ingredients.help uses in
 * `app/api/report/route.ts`: `messages.stream(...).finalMessage()`, structured
 * outputs with a plain-JSON fallback, and NO `thinking` block (claude-haiku-4-5
 * 400s on it). Haiku is plenty for label transcription and costs ~$0.005/label.
 */

export interface LabelExtraction {
  /** Full product name incl. variant, e.g. "Life Protection Adult Chicken & Brown Rice". */
  product_name: string | null;
  /** Brand line, e.g. "Blue Buffalo". */
  brands: string | null;
  /** The ingredient list, transcribed verbatim from the label. */
  ingredients_text: string;
  /** False when the ingredients photo was too blurry / cropped / low-res to read. */
  ingredients_readable: boolean;
}

const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    product_name: {
      type: ["string", "null"],
      description:
        "Full product name including the variant/flavor/life-stage (e.g. 'Life Protection Adult Chicken & Brown Rice', 'Small Bite', 'Large Breed'). Null if no brand/name photo was legible.",
    },
    brands: {
      type: ["string", "null"],
      description: "Brand only (e.g. 'Blue Buffalo', 'Purina'). Null if not legible.",
    },
    ingredients_text: {
      type: "string",
      description:
        "The ingredient list transcribed VERBATIM from the label — same order, same words, commas as printed. Do NOT invent, reorder, translate, or complete a cut-off list. Empty string if unreadable.",
    },
    ingredients_readable: {
      type: "boolean",
      description:
        "true only if the ingredient list was clearly legible and transcribed in full. false if the photo was blurry, cropped mid-list, glare-washed, or too low-resolution to trust.",
    },
  },
  required: ["product_name", "brands", "ingredients_text", "ingredients_readable"],
} as const;

const SYSTEM =
  "You transcribe pet-food (or human/cosmetic) product labels from photos for a catalog. " +
  "You copy text exactly as printed — you never guess, complete, translate, or 'clean up' an " +
  "ingredient list. If the ingredients photo is not clearly legible in full, you say so " +
  "(ingredients_readable=false) rather than returning a partial or invented list.";

const USER_INSTRUCTION =
  "Read this product label. The first image (if present) is the brand/name; the ingredients " +
  "image is the composition. Return the product name (with its full variant), the brand, and " +
  "the ingredient list transcribed verbatim. If the ingredient list is blurry, cut off, or " +
  "otherwise not fully legible, set ingredients_readable to false and leave ingredients_text empty.";

/** A data: URL like `data:image/jpeg;base64,AAAA` → the SDK's image block. */
function toImageBlock(dataUrl: string): Anthropic.Messages.ImageBlockParam {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!match) {
    throw new Error("image must be a base64 data URL (data:image/…;base64,…)");
  }
  const mediaType = match[1] as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";
  return {
    type: "image",
    source: { type: "base64", media_type: mediaType, data: match[2] },
  };
}

/** Concatenate the text blocks of a message (the JSON lives there). */
function firstText(msg: Anthropic.Messages.Message): string {
  const text = msg.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) throw new Error("No content returned from the model.");
  return text;
}

/** Drop a ```json … ``` fence if the model wrapped its JSON (fallback path). */
function stripFence(s: string): string {
  const t = s.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (m ? m[1] : t).trim();
}

export interface ExtractInput {
  apiKey: string;
  model: string;
  /** Data URL of the ingredients photo — required. */
  ingredientsImage: string;
  /** Data URL of the brand/name photo — optional. */
  brandImage?: string | null;
}

export interface ExtractResult {
  extraction: LabelExtraction;
  usage: { input: number; output: number };
}

export async function extractLabel({
  apiKey,
  model,
  ingredientsImage,
  brandImage,
}: ExtractInput): Promise<ExtractResult> {
  const client = new Anthropic({ apiKey });

  const content: Anthropic.Messages.ContentBlockParam[] = [];
  if (brandImage) {
    content.push({ type: "text", text: "Brand / name photo:" });
    content.push(toImageBlock(brandImage));
  }
  content.push({ type: "text", text: "Ingredients photo:" });
  content.push(toImageBlock(ingredientsImage));
  content.push({ type: "text", text: USER_INSTRUCTION });

  let final: Anthropic.Messages.Message;
  try {
    // Structured outputs first.
    const stream = client.messages.stream({
      model,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content }],
      output_config: {
        format: { type: "json_schema", schema: EXTRACTION_SCHEMA },
      },
    });
    final = await stream.finalMessage();
  } catch {
    // Fall back to a plain JSON prompt if output_config is rejected.
    const stream = client.messages.stream({
      model,
      max_tokens: 2000,
      system: `${SYSTEM}\n\nReturn ONLY a single JSON object matching this schema, with no prose and no markdown fences:\n${JSON.stringify(EXTRACTION_SCHEMA)}`,
      messages: [{ role: "user", content }],
    });
    final = await stream.finalMessage();
  }

  const raw = stripFence(firstText(final));
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  const ingredientsText =
    typeof parsed.ingredients_text === "string" ? parsed.ingredients_text.trim() : "";
  const extraction: LabelExtraction = {
    product_name:
      typeof parsed.product_name === "string" && parsed.product_name.trim()
        ? parsed.product_name.trim()
        : null,
    brands:
      typeof parsed.brands === "string" && parsed.brands.trim()
        ? parsed.brands.trim()
        : null,
    ingredients_text: ingredientsText,
    // Trust the model's own flag, but never call a too-short list readable.
    ingredients_readable:
      parsed.ingredients_readable === true && ingredientsText.length >= 12,
  };

  return {
    extraction,
    usage: {
      input: final.usage.input_tokens,
      output: final.usage.output_tokens,
    },
  };
}
