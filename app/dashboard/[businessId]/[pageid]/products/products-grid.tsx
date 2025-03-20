"use client";

import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductsList from "./products-list";
import { useEffect } from "react";

// SWR fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  console.log("Data fetched:", data); // Log the fetched data
  return data;
};

export default function ProductsGrid({ pageId, businessId }) {
  const router = useRouter();

  // Fetch data with SWR with proper caching disabled to ensure fresh data
  const { data: products, error, isLoading, mutate } = useSWR(
    `/api/business?businessPageId=${pageId}`,
    fetcher,
    { 
      refreshInterval: 1000, // Refresh every second
      revalidateOnFocus: true,
      dedupingInterval: 0, // Disable deduping to ensure fresh requests
      compareSize: false // Don't skip updates based on response size
    }
  );

  // Force a revalidation whenever products change
  useEffect(() => {
    if (products) {
      console.log("Products updated:", products);
    }
  }, [products]);

  // Add a manual refresh option if needed
  useEffect(() => {
    const interval = setInterval(() => {
      mutate(); // Force refresh
    }, 3000);
    
    return () => clearInterval(interval);
  }, [mutate]);

  if (error) {
    console.error("Error loading products:", error);
    return <p>Error loading products</p>;
  }
  
  if (isLoading) return (
    <>
    <div className="flex justify-center items-center h-screen w-full">
    <Loader2 className="h-10 w-10 animate-spin" />
    </div>
    </>
  
)

  // Keep the initialProducts prop name as requested
  return <ProductsList 
    key={JSON.stringify(products)} // Force re-render when data changes
    initialProducts={products} 
    pageId={pageId} 
    businessId={businessId} 
  />;
}