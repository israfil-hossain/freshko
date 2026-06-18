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
    <section className="py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {!searchQuery && !selectedCategory && (
            <p className="text-muted text-sm mt-1">Top-rated products this season</p>
          )}
        </div>
        {!searchQuery && !selectedCategory && (
          <a href="/products" className="text-accent text-sm font-semibold hover:text-accent-dark flex items-center gap-1 transition-colors group">
            View All
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border-light overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="aspect-square bg-gray-100 animate-shimmer" />
              <div className="p-3.5 space-y-2.5">
                <div className="h-3.5 bg-gray-100 rounded-lg w-3/4 animate-shimmer" />
                <div className="h-3 bg-gray-50 rounded-lg w-1/2 animate-shimmer" />
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-100 rounded-lg w-16 animate-shimmer" />
                  <div className="h-9 w-9 bg-gray-100 rounded-xl animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">No products found</h3>
          <p className="text-muted mt-1 text-sm">
            {searchQuery
              ? "Try a different search term"
              : "Try selecting a different category"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((product, i) => (
            <div key={product._id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
