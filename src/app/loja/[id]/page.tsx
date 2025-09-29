import ClientPage from "./ClientPage";

// Always dynamic: fetches data from Cloud Functions at runtime
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function Page() {
  return <ClientPage />;
}
