"use client";

import { AdminGate } from "@/components/AdminGate";
import { BrandCoverage } from "@/components/BrandCoverage";

/**
 * A page of its own rather than another panel on the capture screen.
 *
 * This is the screen you open while standing in an aisle deciding what to
 * pick up, and the capture screen is the one you use once you have decided.
 * Folding one into the other would mean scrolling past a camera to answer
 * "have I done this?".
 *
 * The gate is the same one the scanner uses and the token is the same token,
 * so opening this from the scanner does not ask for the password again.
 */
export default function Page() {
  return <AdminGate>{(token) => <BrandCoverage adminToken={token} />}</AdminGate>;
}
