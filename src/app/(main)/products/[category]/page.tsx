"use client";

import { useGet } from "@/hooks/useGet";
import { useParams } from "next/navigation";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

const categoryTitles: Record<string, string> = {
  Vegetables: "Vegetables",
  Fruits: "Fresh Fruits",
  Drinks: "Cold Drinks",
  Instant: "Instant Food",
  Dairy: "Dairy Products",
  Bakery: "Bakery & Breads",
  Grains: "Grains & Cereals",
};

export default function ProductCategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const { data, isLoading } = useGet<{ success: boolean; products: Product[] }>(
    ["products"],
    "/api/product/list"
  );

  const products = (data?.products || []).filter(
    (p) => p.category === category
  );

  return (
    <main className="py-8">
      <h2 className="text-2xl font-semibold mb-6">
        {categoryTitles[category] || category}
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
