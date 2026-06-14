"use client";

import Image from "next/image";
import { assets, features } from "@/assets/assets";

export default function BottomBanner() {
  return (
    <section className="my-12">
      <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden">
        <Image
          src={assets.bottom_banner_image}
          alt="Why choose us"
          fill
          className="object-cover hidden md:block bg-primary/5"
        />
        <Image
          src={assets.bottom_banner_image_sm}
          alt="Why choose us"
          fill
          className="object-cover md:hidden bg-primary/5"
        />
        <div className='absolute inset-0 flex flex-col items-center justify-center px-4 md:items-end md:justify-center md:pr-24'>
          <div className="w-full max-w-md">
            <h1 className='text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-4 md:mb-5 text-center md:text-left'>
              Why we are the best?
            </h1>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 md:gap-4">
                  <Image src={f.icon} alt={f.title} className="w-8 h-8 md:w-10 md:h-10" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-xs md:text-sm">{f.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
