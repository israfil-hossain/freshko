"use client";

import Image from "next/image";
import { assets, features } from "@/assets/assets";

export default function BottomBanner() {
  return (
    <section className="my-12">
      <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden group">
        <Image
          src={assets.bottom_banner_image}
          alt="Why choose us"
          fill
          className="object-cover hidden md:block bg-primary/5 transition-transform duration-700 group-hover:scale-105"
        />
        <Image
          src={assets.bottom_banner_image_sm}
          alt="Why choose us"
          fill
          className="object-cover md:hidden bg-primary/5"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className='absolute inset-0 flex flex-col items-center justify-center px-6 md:items-end md:justify-center md:pr-24'>
          <div className="w-full max-w-md">
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-5 text-center md:text-left'>
              Why we are the best?
            </h1>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 md:gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 transition-all hover:bg-white/20">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Image src={f.icon} alt={f.title} className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xs md:text-sm text-white">{f.title}</h3>
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">{f.description}</p>
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
