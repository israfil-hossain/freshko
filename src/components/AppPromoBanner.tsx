"use client";

export default function AppPromoBanner() {
  return (
    <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl overflow-hidden mt-10 group">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 md:px-14 py-12 md:py-0 md:h-[320px]">
        <div className="max-w-md text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Mobile App
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Get fresh groceries in minutes
          </h2>
          <p className="text-white/70 text-sm mt-3 leading-relaxed">
            Download the Freshko app for exclusive deals, real-time tracking, and the freshest selection delivered right to your door.
          </p>
          <div className="flex items-center gap-3 mt-6 justify-center md:justify-start">
            <button className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg shadow-black/10 btn-press cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </button>
            <button className="flex items-center gap-2 bg-white text-primary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg shadow-black/10 btn-press cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302L15.39 12l2.308-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
              </svg>
              Google Play
            </button>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary/20" />
      </div>
    </div>
  );
}
