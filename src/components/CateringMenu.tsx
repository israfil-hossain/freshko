"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface Menu {
  id: string;
  title: string;
  name: string;
  desc: string;
  description: string;
  price: string;
  per: string;
  image: string;
}

const defaultMenus: Menu[] = [
  {
    id: "royal",
    title: "Royal Dawat Package",
    name: "Royal Dawat Package",
    desc: "Kacchi biryani, 4 curries, raita, shahi tukra, and unlimited drinks. Perfect for weddings.",
    description: "Kacchi biryani, 4 curries, raita, shahi tukra, and unlimited drinks. Perfect for weddings.",
    price: "From ৳850",
    per: "head",
    image: "/catering_hero.jpg",
  },
  {
    id: "garden",
    title: "Garden Fresh Buffet",
    name: "Garden Fresh Buffet",
    desc: "Mezze, grilled vegetables, pasta salad, fish fillet, and seasonal fruit desserts.",
    description: "Mezze, grilled vegetables, pasta salad, fish fillet, and seasonal fruit desserts.",
    price: "From ৳550",
    per: "head",
    image: "/catering_food.jpg",
  },
  {
    id: "corporate",
    title: "Corporate Lunch Box",
    name: "Corporate Lunch Box",
    desc: "Rice, protein, vegetable, salad, and dessert — individually packed, on time, every time.",
    description: "Rice, protein, vegetable, salad, and dessert — individually packed, on time, every time.",
    price: "From ৳280",
    per: "head",
    image: "/catering_hero.jpg",
  },
  {
    id: "custom",
    title: "Custom Curated Menu",
    name: "Custom Curated Menu",
    desc: "Tell us your vision — cuisine, dietary needs, theme — and we'll build it from scratch.",
    description: "Tell us your vision — cuisine, dietary needs, theme — and we'll build it from scratch.",
    price: "Custom",
    per: "pricing",
    image: "/catering_food.jpg",
  },
];

export default function CateringMenu() {
  const [menus, setMenus] = useState<Menu[]>(defaultMenus);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/catering/content`);
        const data = await res.json();
        if (data.success && data.menus && data.menus.length > 0) {
          setMenus(data.menus);
        }
      } catch {}
    };
    fetchMenus();
  }, []);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % menus.length);
  }, [lightboxIndex, menus.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + menus.length) % menus.length);
  }, [lightboxIndex, menus.length]);

  return (
    <section id="menu" className="py-20 border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            Sample menus
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Crafted with <span className="text-amber-600">care</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            Each menu is built around seasonal produce and your guests&apos; preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {menus.map((m, index) => (
            <div
              key={m.id || m.name}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/80"
            >
              {/* Image */}
              <div
                className="relative h-52 sm:h-56 overflow-hidden cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={m.image || "/catering_hero.jpg"}
                  alt={m.title || m.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                {/* Index number */}
                <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
                </div>

                {/* Price badge */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm text-foreground rounded-2xl px-4 py-2 shadow-xl shadow-black/10 flex items-baseline gap-1">
                    <span className="text-base font-extrabold">{m.price}</span>
                    <span className="text-[10px] text-muted font-medium">/ {m.per}</span>
                  </div>
                </div>

                {/* Hover zoom icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 pt-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold text-foreground group-hover:text-amber-600 transition-colors leading-snug">
                    {m.title || m.name}
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4">
                  {m.description || m.desc}
                </p>
                <button
                  onClick={() => openLightbox(index)}
                  className="w-full py-2.5 rounded-xl bg-gray-50 text-foreground text-sm font-semibold hover:bg-amber-500 hover:text-white transition-all duration-300 border border-gray-100 hover:border-amber-500 cursor-pointer"
                >
                  View Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/60 hover:text-white z-10 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 transition-all hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 sm:left-6 text-white/60 hover:text-white z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 transition-all hover:bg-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Image */}
          <div
            className="relative w-[92vw] h-[75vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={menus[lightboxIndex].image || "/catering_hero.jpg"}
              alt={menus[lightboxIndex].title || menus[lightboxIndex].name}
              fill
              className="object-contain rounded-2xl"
              sizes="92vw"
              priority
            />
            {/* Info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-16 rounded-b-2xl">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">
                    {menus[lightboxIndex].title || menus[lightboxIndex].name}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {menus[lightboxIndex].description || menus[lightboxIndex].desc}
                  </p>
                </div>
                <div className="bg-amber-500 text-white rounded-xl px-4 py-2 shadow-lg shadow-amber-500/30 flex items-baseline gap-1 shrink-0 ml-4">
                  <span className="text-sm font-bold">{menus[lightboxIndex].price}</span>
                  <span className="text-[10px] text-white/70">/ {menus[lightboxIndex].per}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 sm:right-6 text-white/60 hover:text-white z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 transition-all hover:bg-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {menus.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === lightboxIndex ? "bg-white w-7" : "bg-white/30 w-1.5 hover:bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
