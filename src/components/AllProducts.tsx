"use client";

import { useGet } from "@/hooks/useGet";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

interface AllProductsProps {
  selectedCategory: string;
  searchQuery?: string;
}

export default function AllProducts({ selectedCategory, searchQuery = "" }: AllProductsProps) {
  const { data: productsData, isLoading } = useGet<{
    success: boolean;
    products: Product[];
  }>(["products"], "/api/product/list");

  const allProducts = productsData?.products || [];

  const filtered = allProducts.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery
      || p.name.toLowerCase().includes(query)
      || p.category.toLowerCase().includes(query)
      || p.subcategory?.toLowerCase().includes(query)
      || p.tags?.some((tag) => tag.toLowerCase().includes(query));

    const decodedCategory = decodeURIComponent(selectedCategory).toLowerCase();
    const matchesCategory = !selectedCategory
      || p.category.toLowerCase() === decodedCategory
      || p.subcategory?.toLowerCase() === decodedCategory;

    return matchesSearch && matchesCategory;
  });

  const title = searchQuery
    ? `Search: "${searchQuery}"`
    : selectedCategory
      ? decodeURIComponent(selectedCategory)
      : "Popular Products";

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {!searchQuery && !selectedCategory && (
            <p className="text-gray-400 text-sm mt-1">Top-rated products this season</p>
          )}
        </div>
        {!searchQuery && !selectedCategory && (
          <a href="/products" className="text-accent text-sm font-semibold hover:underline flex items-center gap-1">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-square mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500 mt-2 text-sm">
            {searchQuery
              ? "Try a different search term"
              : "Try selecting a different category"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}