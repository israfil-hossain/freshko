"use client";

import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";
import { useGet } from "@/hooks/useGet";
import type { Category } from "@/types";

const fallbackCategories = [
  { name: "Organic Veggies", image: assets.organic_vegitable_image },
  { name: "Fresh Fruits", image: assets.fresh_fruits_image },
  { name: "Cold Drinks", image: assets.bottles_image },
  { name: "Instant Food", image: assets.maggi_image },
  { name: "Dairy Products", image: assets.dairy_product_image },
  { name: "Bakery & Breads", image: assets.bakery_image },
  { name: "Grains & Cereals", image: assets.grain_image },
];

export default function Categories() {
  const { data, isLoading } = useGet<{ success: boolean; categories: Category[] }>(
    ["categories"],
    "/api/category/list"
  );
  const categories = data?.success && data.categories.length > 0 ? data.categories : fallbackCategories;

  return (
    <section className="my-10">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-900">
        Shop by <span className="text-primary">Category</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat, index) => (
          <Link
            key={cat.name}
            href={`/products/${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all bg-white"
          >
            <Image
              src={cat.image || assets.box_icon}
              alt={cat.name}
              width={56}
              height={56}
              className={`w-14 h-14 object-contain mb-2 ${isLoading ? "opacity-70" : ""}`}
            />
            <p className="text-xs font-medium text-center text-gray-700">{cat.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
