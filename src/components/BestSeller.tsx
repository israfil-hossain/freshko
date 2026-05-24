"use client";

import { useGet } from "@/hooks/useGet";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";

export default function BestSeller() {
  const { data, isLoading } = useGet<{ success: boolean; products: Product[] }>(
    ["products"],
    "/api/product/list"
  );

  if (isLoading) return null;

  const bestSellers = (data?.products || []).filter((p) => p.inStock).slice(0, 5);

  if (bestSellers.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="text-2xl font-semibold mb-8 text-center">
        Best <span className="text-primary">Sellers</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {bestSellers.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
