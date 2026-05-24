"use client";

import Image from "next/image";
import { assets, features } from "@/assets/assets";

export default function BottomBanner() {
  return (
    <section className="my-12">
      <div className="relative w-full h-96 rounded-2xl">
        <Image
          src={assets.bottom_banner_image}
          alt="Why choose us"
          fill
          className="object-cover hidden md:block bg-green-100"
        />
        <Image
          src={assets.bottom_banner_image_sm}
          alt="Why choose us"
          fill
          className="object-cover md:hidden bg-green-100"
        />
        <div className='absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-16 md:pt-0 md:pr-24'>
          <div>
            <h1 className='text-2xl md:text-3xl font-semibold text-primary mb-5'>
              Why we are the best?
            </h1>
            <div className="grid grid-cols-1 gap-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4 ">
                  <Image src={f.icon} alt={f.title} className="w-10 h-10" />
                  <div>
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{f.description}</p>
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
