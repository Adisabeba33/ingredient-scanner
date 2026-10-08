/**
 * What the one button is about to do, in the order it does it.
 *
 * Four kinds of work now hang off one press — compositions, identity-only
 * rows, panels, boxes — and the label has to name whichever ones are real
 * without ever reading "Nothing to write" while something is still waiting.
 *
 * Compositions and identity-only rows are both "write", and are said together
 * with their counts apart ("Write 92 compositions + 150 identity-only"): the
 * operator is deciding to put two different claims into the catalog with one
 * press, and should see both numbers before pressing it.
 */
export function seedButtonLabel({
  toWrite,
  boxesToMark,
  panelsToFill,
  identitiesToWrite = 0,
}: {
  toWrite: number;
  boxesToMark: number;
  panelsToFill: number;
  /** Identity-only rows: a name and a barcode, composition pending. */
  identitiesToWrite?: number;
}): string {
  const parts: string[] = [];
  if (toWrite > 0 && identitiesToWrite > 0) {
    parts.push(
      `write ${toWrite} composition${toWrite === 1 ? "" : "s"} + ${identitiesToWrite} identity-only`
    );
  } else if (toWrite > 0) {
    parts.push(`write ${toWrite}`);
  } else if (identitiesToWrite > 0) {
    parts.push(`write ${identitiesToWrite} identity-only`);
  }
  if (panelsToFill > 0) {
    parts.push(`fill ${panelsToFill} panel${panelsToFill === 1 ? "" : "s"}`);
  }
  if (boxesToMark > 0) {
    parts.push(`mark ${boxesToMark} variety pack${boxesToMark === 1 ? "" : "s"}`);
  }
  if (parts.length === 0) return "Nothing to write";
  // The everyday case keeps the wording it has always had, and a write of
  // either kind on its own reads the same way.
  if (parts.length === 1 && (toWrite > 0 || identitiesToWrite > 0)) {
    return `${parts[0][0].toUpperCase()}${parts[0].slice(1)} to the catalog`;
  }
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
