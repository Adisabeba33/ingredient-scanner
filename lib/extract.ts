import Anthropic from "@anthropic-ai/sdk";
import { isUsableIngredients } from "@/lib/ingredients-text";
import {
  detectSpeciesFromText,
  isPetSpecies,
  type PetSpecies,
} from "@/lib/pet-species";
import { isFoodForm, type FoodForm } from "@/lib/food-form";
import {
  readGuaranteedAnalysis,
  type GuaranteedAnalysis,
} from "@/lib/guaranteed-analysis";

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

/** What the pack is: the three catalog modes, plus "can't tell". */
export type LabelCategory = "pet" | "human" | "cosmetics" | "unknown";

const CATEGORIES: LabelCategory[] = ["pet", "human", "cosmetics", "unknown"];

export function isLabelCategory(x: unknown): x is LabelCategory {
  return typeof x === "string" && CATEGORIES.includes(x as LabelCategory);
}

export interface LabelExtraction {
  /** Full product name incl. variant, e.g. "Life Protection Adult Chicken & Brown Rice". */
  product_name: string | null;
  /** Brand line, e.g. "Blue Buffalo". */
  brands: string | null;
  /** The ingredient list, transcribed verbatim from the label. */
  ingredients_text: string;
  /** False when the ingredients photo was too blurry / cropped / low-res to read. */
  ingredients_readable: boolean;
  /** Language of the transcribed list, e.g. "English", "French". */
  language: string;
  /**
   * What kind of product this is, read off the pack.
   *
   * The operator picks a mode before shooting and forgets to change it — which
   * used to mean a human food filed as pet food, and the only cure was deleting
   * the row and starting again. The model is already looking at the pack, so it
   * may as well say. "unknown" is an honest answer and leaves the operator's
   * pick standing.
   */
  category: LabelCategory;
  /** Which animal the product is for — decides how the report is written. */
  species: PetSpecies;
  /** Dry or wet, as read off the PACK. One of the two signals; see lib/food-form.ts. */
  food_form: FoodForm;
  /** Moisture % from the Guaranteed Analysis, when that panel was legible. */
  moisture_percent: number | null;
  /** The whole Guaranteed Analysis panel, as printed. See lib/guaranteed-analysis.ts. */
  guaranteed_analysis: GuaranteedAnalysis;
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
        "true only if the ingredient list was clearly legible and transcribed in full. false if the photo was blurry, cropped mid-list, glare-washed, too low-resolution to trust, or if no English list is present.",
    },
    language: {
      type: "string",
      description:
        "The language of the list you transcribed, capitalised in English (e.g. 'English', 'French', 'Spanish'). Labels often print several languages side by side — always transcribe the ENGLISH one when it is present, and report 'English' here. Only report another language if NO English list is visible at all.",
    },
    category: {
      type: "string",
      enum: ["pet", "human", "cosmetics", "unknown"],
      description:
        "What kind of product this is, judged from the PACK — who it is sold to feed or be used on, not from the ingredients (people and pets eat much the same things). 'pet' when the pack is for an animal: 'Cat Food', 'For Dogs', a Guaranteed Analysis panel, feeding guidelines by body weight, an animal pictured as the consumer. 'human' when it is food or drink for people: a Nutrition Facts / nutrition information panel, serving suggestions, 'best before'. 'cosmetics' when it is applied to the body rather than eaten: shampoo, cream, lotion, balm, soap, make-up — an INCI list is the giveaway (it opens with 'Aqua' or 'Water' and names things like 'Sodium Laureth Sulfate', 'Cetearyl Alcohol', 'Parfum'). 'unknown' when the photos genuinely do not say — do not guess between them.",
    },
    species: {
      type: "string",
      enum: ["cat", "dog", "both", "unknown"],
      description:
        "Which animal this product is for, read from the pack — it usually says so plainly ('Cat Food', 'For Dogs', 'Kitten', 'Puppy'), and the animal pictured is a strong hint. Use 'both' only when the pack really is sold for cats AND dogs (some treats are). Use 'unknown' when the pack doesn't say — do NOT infer it from the ingredients, since cats and dogs share most of them.",
    },
    guaranteed_analysis: {
      type: "object",
      additionalProperties: false,
      description:
        "The Guaranteed Analysis panel and the calorie statement beside it, COPIED as printed. Every field is null when that figure is not on the pack, and ALL are null when no such panel is visible in any photo. Copy percentages as numbers without the % sign. Do not convert, average, or calculate anything.",
      properties: {
        crude_protein_min: {
          type: ["number", "null"],
          description: "Crude Protein, the 'min' percentage (e.g. 11.0 from 'Crude Protein 11.0% min').",
        },
        crude_fat_min: {
          type: ["number", "null"],
          description: "Crude Fat, the 'min' percentage.",
        },
        crude_fiber_max: {
          type: ["number", "null"],
          description: "Crude Fiber (or Fibre), the 'max' percentage.",
        },
        moisture_max: {
          type: ["number", "null"],
          description: "Moisture, the 'max' percentage.",
        },
        ash_max: {
          type: ["number", "null"],
          description: "Ash, the 'max' percentage. Many packs list it; null when this one doesn't.",
        },
        taurine_min: {
          type: ["number", "null"],
          description: "Taurine, the 'min' percentage — usually a small figure like 0.05. Common on cat food, absent on most dog food.",
        },
        kcal_per_kg: {
          type: ["number", "null"],
          description: "Calorie content per kilogram, e.g. 843 from '843 kcal/kg'.",
        },
        kcal_per_serving: {
          type: ["number", "null"],
          description: "Calories per serving as printed, e.g. 71 from '71 kcal/can'.",
        },
        serving_name: {
          type: ["string", "null"],
          description: "What that serving is called on the pack: 'can', 'cup', 'pouch', 'tray'. One word.",
        },
      },
      required: [
        "crude_protein_min",
        "crude_fat_min",
        "crude_fiber_max",
        "moisture_max",
        "ash_max",
        "taurine_min",
        "kcal_per_kg",
        "kcal_per_serving",
        "serving_name",
      ],
    },
  },
  required: [
    "product_name",
    "brands",
    "ingredients_text",
    "ingredients_readable",
    "language",
    "category",
    "species",
    "food_form",
    "moisture_percent",
    "guaranteed_analysis",
  ],
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
  "otherwise not fully legible, set ingredients_readable to false and leave ingredients_text empty. " +
  "Packaging often prints the same list in several languages (English / French / Spanish) in " +
  "parallel columns or blocks: always transcribe the ENGLISH one. If the photo shows only a " +
  "non-English list, do NOT translate it — set ingredients_readable to false, leave " +
  "ingredients_text empty, and report the language you saw. " +
  "Say what kind of product it is (category): for an animal, for people to eat, or applied " +
  "to the body. Judge that from the PACK — who it is sold for — and not from the " +
  "ingredients, which overlap heavily; answer 'unknown' rather than guessing between two. " +
  "Also say whether the pack is dry food or wet food, judging by the container and the " +
  "words on it \u2014 not by the ingredients. If a Guaranteed Analysis panel is visible in " +
  "any of the photos, copy its Moisture percentage; otherwise leave it null. " +
  "Fill guaranteed_analysis from that same panel and the calorie statement printed with it, " +
  "COPYING each figure exactly as shown. Leave a field null when the pack doesn't print it, " +
  "and leave every field null when no such panel is visible. Do NOT convert between units, " +
  "do NOT work anything out on a dry-matter basis, and do NOT estimate a figure that is " +
  "absent \u2014 the calculations are done elsewhere and a guessed input would poison them.";

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
  /** Data URL of the guaranteed-analysis panel — optional, but it settles dry vs wet. */
  nutritionImage?: string | null;
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
  nutritionImage,
}: ExtractInput): Promise<ExtractResult> {
  const client = new Anthropic({ apiKey });

  const content: Anthropic.Messages.ContentBlockParam[] = [];
  if (brandImage) {
    content.push({ type: "text", text: "Brand / name photo:" });
    content.push(toImageBlock(brandImage));
  }
  content.push({ type: "text", text: "Ingredients photo:" });
  content.push(toImageBlock(ingredientsImage));
  if (nutritionImage) {
    content.push({ type: "text", text: "Guaranteed analysis / nutrition panel:" });
    content.push(toImageBlock(nutritionImage));
  }
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
  const analysis = readGuaranteedAnalysis(parsed.guaranteed_analysis);
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
    // Trust the model's own flag, but never call a stub readable. Length is not
    // the test — plenty of products list a single short item ("Black Tea").
    ingredients_readable:
      parsed.ingredients_readable === true &&
      isUsableIngredients(ingredientsText),
    language:
      typeof parsed.language === "string" && parsed.language.trim()
        ? parsed.language.trim()
        : "Unknown",
    // An unreadable or missing answer is "unknown", never a guess: the caller
    // treats unknown as "keep what the operator picked", which is the safe
    // direction when the model didn't actually see what kind of pack this is.
    category: isLabelCategory(parsed.category) ? parsed.category : "unknown",
    // Fall back to the product name when the model didn't answer — a pack
    // called "Kitten Chicken Recipe" tells us plenty on its own.
    food_form: isFoodForm(parsed.food_form) ? parsed.food_form : "unknown",
    // A percentage only — anything else means the panel wasn't really read.
    // Falls back to the panel's own moisture: the two are the same figure off
    // the same photograph, and the panel is now the more careful reading of it
    // (a panel that contradicts itself is discarded whole).
    moisture_percent:
      typeof parsed.moisture_percent === "number" &&
      Number.isFinite(parsed.moisture_percent) &&
      parsed.moisture_percent >= 0 &&
      parsed.moisture_percent <= 100
        ? parsed.moisture_percent
        : analysis.moistureMax,
    guaranteed_analysis: analysis,
    species: isPetSpecies(parsed.species)
      ? parsed.species
      : detectSpeciesFromText(
          typeof parsed.product_name === "string" ? parsed.product_name : "",
          typeof parsed.brands === "string" ? parsed.brands : ""
        ),
  };

  return {
    extraction,
    usage: {
      input: final.usage.input_tokens,
      output: final.usage.output_tokens,
    },
  };
}
