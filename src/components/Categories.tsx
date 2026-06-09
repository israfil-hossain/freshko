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

const categoryColors = ["#FEF6DA", "#FEE0E0", "#F0F5DE", "#E1F5EC", "#FEE6CD", "#E0F6FE", "#F1E3F9"];

export default function Categories() {
  const { data, isLoading } = useGet<{ success: boolean; categories: Category[] }>(
    ["categories"],
    "/api/category/list"
  );
  const categories = data?.success && data.categories.length > 0 ? data.categories : fallbackCategories;

  return (
    <section className="my-12">
      <h2 className="text-2xl font-semibold mb-8 text-center">
        Shop by <span className="text-primary">Category</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {categories.map((cat, index) => (
          <Link
            key={cat.name}
            href={`/products/${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center p-4 rounded-xl hover:scale-105 transition-transform"
            style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
          >
            <Image
              src={cat.image || assets.box_icon}
              alt={cat.name}
              width={64}
              height={64}
              className={`w-16 h-16 object-contain mb-2 ${isLoading ? "opacity-70" : ""}`}
            />
            <p className="text-xs font-medium text-center">{cat.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
