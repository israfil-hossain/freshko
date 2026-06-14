"use client";

import { useSearchParams } from "next/navigation";
import MainBanner from "@/components/MainBanner";
import FeaturesBar from "@/components/FeaturesBar";
import ShopByCategory from "@/components/ShopByCategory";
import AllProducts from "@/components/AllProducts";
import AppPromoBanner from "@/components/AppPromoBanner";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  if (selectedCategory) {
    return (
      <div>
        <AllProducts selectedCategory={selectedCategory} />
      </div>
    );
  }

  return (
    <div>
      <MainBanner />
      <FeaturesBar />
      <ShopByCategory />
      <AllProducts selectedCategory="" />
      <AppPromoBanner />
      <NewsletterSubscribe />
    </div>
  );
}
