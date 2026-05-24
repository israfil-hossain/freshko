"use client";

import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

const categoryData = [
  { text: "Organic veggies", path: "Vegetables", image: assets.organic_vegitable_image, bgColor: "#FEF6DA" },
  { text: "Fresh Fruits", path: "Fruits", image: assets.fresh_fruits_image, bgColor: "#FEE0E0" },
  { text: "Cold Drinks", path: "Drinks", image: assets.bottles_image, bgColor: "#F0F5DE" },
  { text: "Instant Food", path: "Instant", image: assets.maggi_image, bgColor: "#E1F5EC" },
  { text: "Dairy Products", path: "Dairy", image: assets.dairy_product_image, bgColor: "#FEE6CD" },
  { text: "Bakery & Breads", path: "Bakery", image: assets.bakery_image, bgColor: "#E0F6FE" },
  { text: "Grains & Cereals", path: "Grains", image: assets.grain_image, bgColor: "#F1E3F9" },
];

export default function Categories() {
  return (
    <section className="my-12">
      <h2 className="text-2xl font-semibold mb-8 text-center">
        Shop by <span className="text-primary">Category</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {categoryData.map((cat) => (
          <Link
            key={cat.path}
            href={`/products/${cat.path}`}
            className="flex flex-col items-center p-4 rounded-xl hover:scale-105 transition-transform"
            style={{ backgroundColor: cat.bgColor }}
          >
            <Image src={cat.image} alt={cat.text} className="w-16 h-16 object-contain mb-2" />
            <p className="text-xs font-medium text-center">{cat.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
