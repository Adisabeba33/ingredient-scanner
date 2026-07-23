"use client";

import { AdminGate } from "@/components/AdminGate";
import { CaptureTool } from "@/components/CaptureTool";

/**
 * The whole tool lives on one page: an admin gate wrapping the capture +
 * process UI. Admin-only, mobile-first, offline capable (spec §5). This is a
 * client component so the gate can hand its verified token to the tool via a
 * render prop (a function child can't cross a server→client boundary).
 */
export default function Page() {
  return <AdminGate>{(token) => <CaptureTool adminToken={token} />}</AdminGate>;
}
