import React from "react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
