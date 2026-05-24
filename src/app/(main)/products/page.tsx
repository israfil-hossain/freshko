"use client";

import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function AllProductsPage() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const { data, isLoading } = useGet<{ success: boolean; products: Product[] }>(
    ["products"],
    "/api/product/list"
  );

  const products = (data?.products || []).filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="py-8">
      <h2 className="text-2xl font-semibold mb-6">
        {searchQuery ? `Search: "${searchQuery}"` : "All Products"}
      </h2>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
