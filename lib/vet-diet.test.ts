import { describe, expect, it } from "vitest";
import { isVeterinaryDiet } from "./vet-diet";

describe("isVeterinaryDiet", () => {
  it("recognises the vet-channel ranges", () => {
    expect(isVeterinaryDiet("Hill's Prescription Diet", "k/d Kidney Care")).toBe(true);
    expect(isVeterinaryDiet("Royal Canin Veterinary Diet", "Urinary SO")).toBe(true);
    expect(isVeterinaryDiet("Purina Pro Plan", "Veterinary Diets", "HA")).toBe(true);
    expect(isVeterinaryDiet("Farmina", "Vet Life", "Renal")).toBe(true);
    expect(isVeterinaryDiet("Blue Buffalo", "Natural Veterinary Diet", "KM")).toBe(true);
  });

  it("reads it out of whichever field it landed in", () => {
    expect(isVeterinaryDiet(null, null, "Prescription Diet i/d Digestive Care")).toBe(true);
    expect(isVeterinaryDiet("hills prescription diet")).toBe(true);
  });

  // The error in the other direction, and it is just as bad: pushing an
  // ordinary supermarket food out of the ordinary standard.
  it("leaves retail health formulas alone", () => {
    expect(isVeterinaryDiet("Purina Pro Plan", "Urinary Tract Health", "Chicken")).toBe(false);
    expect(isVeterinaryDiet("Hill's Science Diet", "Perfect Weight", "Chicken")).toBe(false);
    expect(isVeterinaryDiet("Hill's Science Diet", "Sensitive Stomach & Skin")).toBe(false);
    expect(isVeterinaryDiet("Blue Buffalo", "True Solutions", "Weight Control")).toBe(false);
    expect(isVeterinaryDiet("Wellness", "CORE Digestive Health", "Turkey")).toBe(false);
  });

  // The reason the letter codes are brand-scoped. Farmina N&D folds to "n d",
  // which is also a Hill's code — and Farmina is sold in pet shops to healthy
  // animals. Matching codes on any brand would file every bag of it as
  // prescription-only.
  it("does not read Farmina N&D as a Hill's code", () => {
    expect(isVeterinaryDiet("Farmina", "N&D Prime", "Chicken & Pomegranate")).toBe(false);
    expect(isVeterinaryDiet("Farmina N&D Quinoa", "Skin & Coat")).toBe(false);
  });

  it("only reads the codes as codes, not inside words", () => {
    expect(isVeterinaryDiet("Hill's Science Diet", "Adult Indoor")).toBe(false);
    expect(isVeterinaryDiet("Hill's Science Diet", "Chicken & Barley")).toBe(false);
  });

  it("says no to an ordinary food and to nothing at all", () => {
    expect(isVeterinaryDiet("Purina Friskies", "Shreds", "With Salmon in Sauce")).toBe(false);
    expect(isVeterinaryDiet(null, undefined, "")).toBe(false);
    expect(isVeterinaryDiet()).toBe(false);
  });
});
