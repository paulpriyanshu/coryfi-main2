// ProductsGrid.tsx
import ProductsList from "./products-list";

export default async function ProductsGrid({ pageId, businessId }) {
  // Fetch once on the server
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/business?businessPageId=${pageId}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const products = await res.json();

  return (
    <ProductsList 
      initialProducts={products} 
      pageId={pageId} 
      businessId={businessId} 
    />
  );
}