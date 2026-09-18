import { describe, expect, it } from "vitest";
import { seedButtonLabel } from "./seed-button-label";

const label = (toWrite: number, boxesToMark: number, panelsToFill: number) =>
  seedButtonLabel({ toWrite, boxesToMark, panelsToFill });

describe("seedButtonLabel", () => {
  it("says nothing to write only when there is nothing to do", () => {
    expect(label(0, 0, 0)).toBe("Nothing to write");
  });

  // The everyday case, and the wording this button has always had.
  it("keeps the plain wording when formulas are the only work", () => {
    expect(label(20, 0, 0)).toBe("Write 20 to the catalog");
  });

  // The bug this file exists for. Every one-item case went through the
  // three-item join, which builds "<all but last>, and <last>" — so with one
  // item the first half was empty and the button read " and fill 16 panels",
  // leading with a space and a conjunction. It was caught by running the
  // function over its cases rather than by reading it.
  it("does not lead with a conjunction when there is one kind of work", () => {
    expect(label(0, 0, 16)).toBe("Fill 16 panels");
    expect(label(0, 5, 0)).toBe("Mark 5 variety packs");
    for (const text of [label(0, 0, 16), label(0, 5, 0), label(0, 0, 1)]) {
      expect(text).toBe(text.trim());
      expect(text.startsWith("and")).toBe(false);
    }
  });

  it("counts one of each thing as one", () => {
    expect(label(0, 1, 0)).toBe("Mark 1 variety pack");
    expect(label(0, 0, 1)).toBe("Fill 1 panel");
  });

  it("joins two with 'and' and three with a comma", () => {
    expect(label(5, 0, 1)).toBe("Write 5 and fill 1 panel");
    expect(label(0, 3, 1)).toBe("Fill 1 panel and mark 3 variety packs");
    expect(label(20, 5, 16)).toBe("Write 20, fill 16 panels and mark 5 variety packs");
  });

  // A button that says "Nothing to write" while sixteen reports stay thin is
  // lying, and that is exactly what it said before panels were counted.
  it("never claims there is nothing to do while there is", () => {
    for (const [w, b, p] of [
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [0, 2, 3],
    ] as const) {
      expect({ w, b, p, text: label(w, b, p) }).not.toEqual({
        w,
        b,
        p,
        text: "Nothing to write",
      });
    }
  });
});
