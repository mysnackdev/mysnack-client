import StoresByCategoryClient from "./ClientPage";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Params = { categoria?: string };

export default async function Page(props: { params?: Promise<Params> }) {
  const p = props.params ? await props.params : undefined;
  const categoria = p?.categoria ?? "";
  return <StoresByCategoryClient categoria={categoria} />;
}
