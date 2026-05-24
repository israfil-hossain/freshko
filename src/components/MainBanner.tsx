"use client";

import Link from "next/link";
import { assets } from "@/assets/assets";

export default function MainBanner() {
  return (
    <div className="relative max-h-[50vh] md:max-h-none overflow-hidden mt-10">
      <img src={assets.main_banner_bg.src} alt="Main Banner" className="w-full hidden md:block" />
      <img src={assets.main_banner_bg_sm.src} alt="Main Banner" className="w-full md:hidden" />
      <div className="absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-16 md:pb-0 px-4 md:pl-18 lg:pl-24">
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-60 sm:max-w-72 md:max-w-80 lg:max-w-105 leading-snug lg:leading-15 text-black">
          Freshness you can trust, Savings you will love!
        </h1>
        <div className="flex items-center mt-4 md:mt-6 font-medium">
          <Link href="/products" className="group flex items-center gap-2 px-5 sm:px-7 md:px-9 py-2.5 md:py-3 bg-primary hover:bg-primary-dull transition rounded text-black cursor-pointer text-sm md:text-base">
            Shop Now
            <img className="md:hidden transition group-focus:translate-x-1 w-4 h-4" src={assets.white_arrow_icon.src} alt="arrow" />
          </Link>
          <Link href="/products" className="group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer">
            Explore Deals
            <img className="transition group-hover:translate-x-1" src={assets.black_arrow_icon.src} alt="arrow" />
          </Link>
        </div>
      </div>
    </div>
  );
}
