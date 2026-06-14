"use client";

import Image from "next/image";

export default function AppPromoBanner() {
  return (
    <div className="relative bg-primary rounded-3xl overflow-hidden mt-10">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 md:px-14 py-12 md:py-0 md:h-[320px]">
        <div className="max-w-md text-center md:text-left">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Get fresh groceries in minutes
          </h2>
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Download the Grocika app for exclusive deals, real-time tracking, and the freshest selection delivered right to your door.
          </p>
          <div className="flex items-center gap-3 mt-6 justify-center md:justify-start">
            <button className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </button>
            <button className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302L15.39 12l2.308-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
              </svg>
              Google Play
            </button>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block">
        <div className="relative w-full h-full">
          <svg viewBox="0 0 400 320" className="w-full h-full opacity-20" fill="none">
            <circle cx="200" cy="160" r="120" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="160" r="80" stroke="white" strokeWidth="0.5" />
            <path d="M150 200 L200 140 L250 200 Z" stroke="white" strokeWidth="1" fill="none" />
            <rect x="170" y="100" width="60" height="80" rx="4" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="185" cy="120" r="5" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="215" cy="120" r="5" stroke="white" strokeWidth="1" fill="none" />
            <path d="M185 145 Q200 155 215 145" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
