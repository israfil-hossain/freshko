"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChefHat, Sparkles, ArrowRight } from "lucide-react";

const slides = [
  { src: "/catering_hero.jpg", tag: "Wedding & Receptions" },
  { src: "/catering_food.jpg", tag: "Corporate Events" },
  { src: "/catering_hero.jpg", tag: "Private Parties" },
];

export default function CateringHero() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative h-[420px] md:h-[480px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image src={s.src} alt={s.tag} fill className="object-cover" sizes="100vw" priority={i === 0} />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

      <div className="relative h-full max-w-6xl mx-auto px-4 flex items-center">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-4">
            <ChefHat className="w-3.5 h-3.5" />
            Premium Catering Service
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
            Food that makes your event{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              unforgettable
            </span>
          </h1>

          <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6 max-w-md">
            From intimate dinner parties to large corporate events — we craft menus, handle logistics, and deliver an experience your guests will remember.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-7 py-3 text-sm font-semibold rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 btn-press"
            >
              Book Your Event
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-7 py-3 text-sm font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Browse Menus
            </a>
          </div>

          <div className="flex items-center gap-8">
            {[
              { value: "1,200+", label: "Events served" },
              { value: "98%", label: "Satisfaction" },
              { value: "8 yrs", label: "Experience" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-1/2 md:mr-[480px]">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {slides[active].tag}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`transition-all duration-300 rounded-full ${
              i === active ? "w-8 h-2.5 bg-amber-500" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
