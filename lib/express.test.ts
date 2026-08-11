import { describe, expect, it } from "vitest";
import {
  decodeDataUrl,
  expressTitle,
  missingForFinish,
  photoPathFor,
  type ExpressRow,
} from "./express";

function row(over: Partial<ExpressRow> = {}): ExpressRow {
  return {
    code: "00040000000000",
    mode: "pet",
    brands: null,
    productName: null,
    variant: null,
    netWeight: null,
    container: null,
    photoPath: null,
    readError: null,
    capturedAt: null,
    ...over,
  };
}

describe("photoPathFor", () => {
  // One product, one picture. A unique name per upload would quietly
  // accumulate every re-capture with nothing pointing at the old ones.
  it("is stable for a code, so a re-capture replaces the photo", () => {
    expect(photoPathFor("00040000000000", "jpg")).toBe(
      photoPathFor("00040000000000", "jpg")
    );
    expect(photoPathFor("00040000000000", "jpg")).toBe(
      "express/00040000000000.jpg"
    );
  });

  it("keeps express photos in their own folder", () => {
    expect(photoPathFor("123", "png").startsWith("express/")).toBe(true);
  });
});

describe("decodeDataUrl", () => {
  // 1×1 white JPEG-ish payload — only the framing matters here.
  const PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  it("splits a data URL into bytes, type and extension", () => {
    const out = decodeDataUrl(PNG);
    expect(out).not.toBeNull();
    expect(out!.contentType).toBe("image/png");
    expect(out!.extension).toBe("png");
    expect(out!.bytes.length).toBeGreaterThan(10);
  });

  it("writes jpeg as jpg, so paths look like paths", () => {
    expect(decodeDataUrl("data:image/jpeg;base64,AAAA")?.extension).toBe("jpg");
  });

  // A photo that won't decode costs the row its picture. The identity read off
  // it is still worth keeping, so this returns null rather than throwing.
  it("returns null for anything that isn't an image data URL", () => {
    expect(decodeDataUrl("")).toBeNull();
    expect(decodeDataUrl("https://example.com/a.jpg")).toBeNull();
    expect(decodeDataUrl("data:text/plain;base64,AAAA")).toBeNull();
  });
});

describe("missingForFinish", () => {
  // The composition is the whole reason the product is on the worklist.
  it("blocks on the ingredient list and nothing else", () => {
    expect(missingForFinish({ ingredientsText: "" })).toEqual([
      "the ingredient list",
    ]);
    expect(missingForFinish({ ingredientsText: "   " })).toHaveLength(1);
    expect(missingForFinish({ ingredientsText: "Chicken, Rice" })).toEqual([]);
  });
});

describe("expressTitle", () => {
  it("reads brand, product and variant as one line", () => {
    expect(
      expressTitle(
        row({
          brands: "Blue Buffalo",
          productName: "Life Protection",
          variant: "Chicken & Brown Rice",
        })
      )
    ).toBe("Blue Buffalo · Life Protection · Chicken & Brown Rice");
  });

  it("skips whatever the front didn't say", () => {
    expect(expressTitle(row({ brands: "Weruva", variant: "Paw Lickin'" }))).toBe(
      "Weruva · Paw Lickin'"
    );
  });

  // A row that read nothing at all is still a row somebody has to work through,
  // and the barcode is the one thing it always has.
  it("falls back to the barcode", () => {
    expect(expressTitle(row())).toBe("00040000000000");
    expect(expressTitle(row({ brands: "   " }))).toBe("00040000000000");
  });
});
