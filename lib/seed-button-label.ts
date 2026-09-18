/**
 * What the one button is about to do, in the order it does it.
 *
 * Three kinds of work now hang off one press — formulas, panels, boxes — and
 * the label has to name whichever ones are real without ever reading
 * "Nothing to write" while something is still waiting.
 */
export function seedButtonLabel({
  toWrite,
  boxesToMark,
  panelsToFill,
}: {
  toWrite: number;
  boxesToMark: number;
  panelsToFill: number;
}): string {
  const parts: string[] = [];
  if (toWrite > 0) parts.push(`write ${toWrite}`);
  if (panelsToFill > 0) {
    parts.push(`fill ${panelsToFill} panel${panelsToFill === 1 ? "" : "s"}`);
  }
  if (boxesToMark > 0) {
    parts.push(`mark ${boxesToMark} variety pack${boxesToMark === 1 ? "" : "s"}`);
  }
  if (parts.length === 0) return "Nothing to write";
  // The everyday case keeps the wording it has always had.
  if (parts.length === 1 && toWrite > 0) return `Write ${toWrite} to the catalog`;
  // "a" for one, "a and b" for two, "a, b and c" for three — the serial comma
  // would read as a fourth thing on a button this short.
  const joined =
    parts.length === 1
      ? parts[0]
      : parts.length === 2
        ? parts.join(" and ")
        : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return joined[0].toUpperCase() + joined.slice(1);
}

