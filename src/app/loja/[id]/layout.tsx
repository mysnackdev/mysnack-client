/**
 * Static layout for this dynamic route to allow `output: "export"`.
 */
import React from "react";

export const dynamic = "force-dynamic";



export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
