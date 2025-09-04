// src/app/produto/[id]/page.tsx
import ProdutoClient from "./ProdutoClient";

export const dynamic = "error";
export const dynamicParams = false;
export const revalidate = false;

function getSeedIds(): string[] {
  const env = process.env.NEXT_PUBLIC_STATIC_PRODUCT_IDS;
  if (env && env.trim().length > 0) {
    return env.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["cf::1::mcdonald-s::b3"];
}

export function generateStaticParams(): Array<{ id: string }> {
  const ids = getSeedIds();
  return ids.map((id) => ({ id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProdutoClient id={id} />;
}
