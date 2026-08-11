import { describe, expect, it } from "vitest";
import {
  columnsWithout,
  isUndefinedColumn,
  withoutColumns,
} from "./optional-columns";

describe("isUndefinedColumn", () => {
  // The one that matters: a build that knows about a column the database
  // hasn't been given yet, because migrations are applied by hand.
  it("recognises Postgres's undefined_column", () => {
    expect(isUndefinedColumn({ code: "42703" })).toBe(true);
  });

  it("recognises it from the message when the code is lost in transit", () => {
    expect(
      isUndefinedColumn({
        message: "column express_capture.nutrition_role does not exist",
      })
    ).toBe(true);
    expect(
      isUndefinedColumn({
        message: "Could not find the 'requires_vet' column of 'barcode_cache' in the schema cache",
      })
    ).toBe(true);
  });

  // A retry without the column would not help any of these, and treating a real
  // failure as "just a missing column" would hide it.
  it("does not fire on other failures", () => {
    expect(isUndefinedColumn({ code: "23505", message: "duplicate key" })).toBe(false);
    expect(isUndefinedColumn({ message: "permission denied for table" })).toBe(false);
    expect(isUndefinedColumn({ message: "relation does not exist" })).toBe(false);
    expect(isUndefinedColumn(null)).toBe(false);
    expect(isUndefinedColumn(undefined)).toBe(false);
  });
});

describe("withoutColumns", () => {
  it("drops the named keys and keeps the rest", () => {
    expect(
      withoutColumns(
        [{ code: "1", brands: "Friskies", nutrition_role: "treat" }],
        ["nutrition_role"]
      )
    ).toEqual([{ code: "1", brands: "Friskies" }]);
  });

  it("leaves a row alone when it has none of them", () => {
    const rows = [{ code: "1" }];
    expect(withoutColumns(rows, ["nutrition_role"])).toEqual(rows);
  });

  it("does not mutate what it was given", () => {
    const rows = [{ code: "1", nutrition_role: "treat" }];
    withoutColumns(rows, ["nutrition_role"]);
    expect(rows[0].nutrition_role).toBe("treat");
  });

  // A false value is still an answer, and dropping only the named keys means a
  // `requires_vet: false` survives while an unrelated undefined does not become
  // interesting.
  it("keeps falsy values that weren't named", () => {
    expect(
      withoutColumns([{ requires_vet: false, presentation: null }], ["presentation"])
    ).toEqual([{ requires_vet: false }]);
  });
});

describe("columnsWithout", () => {
  it("removes the named columns from a select list", () => {
    expect(
      columnsWithout("code, brands, nutrition_role, requires_vet", [
        "nutrition_role",
        "requires_vet",
      ])
    ).toBe("code, brands");
  });

  it("tolerates the spacing people actually write", () => {
    expect(columnsWithout("code,brands ,  presentation", ["presentation"])).toBe(
      "code, brands"
    );
  });
});
