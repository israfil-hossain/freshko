"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const testimonials = [
  { initials: "SA", name: "Sabrina Ahmed", role: "Wedding, Gulshan", quote: "The food was exceptional — every guest asked for the caterer's number. Kacchi biryani was perfection.", bg: "from-amber-500 to-orange-500" },
  { initials: "RK", name: "Rafiqul Karim", role: "Corporate event, Banani", quote: "Reliable, professional, and delicious. Our annual company dinner has never gone so smoothly.", bg: "from-emerald-500 to-teal-500" },
  { initials: "NJ", name: "Nusrat Jahan", role: "Private party, Dhanmondi", quote: "Booked them last minute for my parents' anniversary. They pulled off a stunning spread — truly grateful.", bg: "from-violet-500 to-purple-500" },
  { initials: "MH", name: "Mahbub Hossain", role: "Eid gathering, Uttara", quote: "Custom menu, timely delivery, zero stress. Will book again for our next event without a second thought.", bg: "from-rose-500 to-pink-500" },
];

const perSlide = 3;

export default function CateringTestimonials() {
  const [active, setActive] = useState(0);
  const total = Math.ceil(testimonials.length / perSlide);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % total), 4000);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section id="reviews" className="py-20 border-b border-border bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-amber-100">
            Client reviews
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            What our clients <span className="text-amber-600">say</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            Over 1,200 events, and the feedback speaks for itself.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {Array.from({ length: total }).map((_, si) => (
              <div key={si} className="w-full shrink-0 grid grid-cols-1 md:grid-cols-3 gap-5 px-1">
                {testimonials.slice(si * perSlide, si * perSlide + perSlide).map((t) => (
                  <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed mb-6 font-serif italic min-h-[80px]">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.bg} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                active === i ? "bg-amber-500 w-7" : "bg-gray-300 hover:bg-gray-400 w-2.5"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
