"use client";

import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import type { Category } from "@/types";

const categoryColors = [
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
  "from-gray-100 to-gray-50",
];

const categoryBorders = [
  "hover:border-gray-300",
  "hover:border-gray-300",
  "hover:border-gray-300",
  "hover:border-gray-300",
  "hover:border-gray-300",
  "hover:border-gray-300",
  "hover:border-gray-300",
  "hover:border-gray-300",
  "hover:border-gray-300",
];

export default function ShopByCategory() {
  const { data: categoriesData, isLoading } = useGet<{
    success: boolean;
    categories: Category[];
  }>(["categories"], "/api/category/list");

  const categories = categoriesData?.categories || [];

  return (
    <section className="mt-10 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
        <p className="text-muted text-sm mt-1">Find exactly what you need</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted text-sm">No categories available</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map((cat, index) => (
            <Link
              key={cat._id}
              href={`/products/${encodeURIComponent(cat.name)}`}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-transparent bg-gradient-to-br ${categoryColors[index % categoryColors.length]} ${categoryBorders[index % categoryBorders.length]} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group`}
            >
              {cat.image ? (
                <div className="w-14 h-14 mb-2 overflow-hidden rounded-xl bg-white/60 p-1">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
