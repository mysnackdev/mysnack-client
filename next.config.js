export default {}
;
export async function rewrites() {
  return [
    { source: "/loja/:id*", destination: "/loja" },
  ];
}
