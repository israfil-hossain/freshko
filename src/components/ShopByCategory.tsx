"use client";

import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import type { Category } from "@/types";

const creamColors = ["#FFF8ED", "#FFF0F0", "#F0F7E6", "#E8F5F0", "#FFF3E6", "#E8F0FE", "#F5EEFF"];

export default function ShopByCategory() {
  const { data: categoriesData, isLoading } = useGet<{
    success: boolean;
    categories: Category[];
  }>(["categories"], "/api/category/list");

  const categories = categoriesData?.categories || [];

  return (
    <section className="mt-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
        <p className="text-gray-400 text-sm mt-1">Find exactly what you need using</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-gray-400 text-sm">No categories available</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map((cat, index) => (
            <Link
              key={cat._id}
              href={`/products/${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center justify-center p-4 rounded-2xl hover:shadow-md transition-all group"
              style={{ backgroundColor: creamColors[index % creamColors.length] }}
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-14 h-14 object-contain mb-2 group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/60 flex items-center justify-center mb-2">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
