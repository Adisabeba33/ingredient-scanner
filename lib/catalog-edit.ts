import type { BarcodeSource } from "./barcode";

/**
 * What a row's source becomes when somebody corrects it by hand.
 *
 * ── Why this can't just be left alone ─────────────────────────────────────
 *
 * A product the open databases know but barely describe — a barcode, an
 * ingredient list, no name, no brand — gets cached under `openfoodfacts`. Fix
 * the name by hand and leave the source as it was, and the correction survives
 * exactly until the next person scans that code: the consumer app compares
 * ranks, sees openfoodfacts is not better than openfoodfacts, and writes the
 * fresh (nameless) result straight over the top. The edit would vanish with
 * nothing to show for it, which is worse than not offering the edit at all.
 *
 * So a hand-corrected row has to outrank the database it came from.
 *
 * ── Why `community` and not `verified` ────────────────────────────────────
 *
 * `verified` means one specific thing in this project: we photographed that
 * label with the scanner and read it. Somebody typing a brand onto a row whose
 * ingredients still came from Open Food Facts has not done that, and marking it
 * verified would put a claim on the row that nobody made. `community` is the
 * honest rank — our own reading, better than an open database, and still worth
 * replacing when the pack is properly captured one day.
 *
 * A row that IS already verified stays verified: an edit to our own capture is
 * still our own capture.
 */
export function sourceAfterEdit(current: string | null): BarcodeSource {
  return current === "verified" ? "verified" : "community";
}

/** Whether an edit will change how the row is labelled, so the UI can say so. */
export function editPromotes(current: string | null): boolean {
  return sourceAfterEdit(current) !== current;
}

/** How to name a source in the interface. */
export function sourceLabel(source: string | null): string {
  switch (source) {
    case "verified":
      return "Our capture";
    case "community":
      return "Corrected by hand";
    case "openfoodfacts":
      return "Open Food Facts";
    case "openpetfoodfacts":
      return "Open Pet Food Facts";
    case "openbeautyfacts":
      return "Open Beauty Facts";
    default:
      return "Unknown source";
  }
}
