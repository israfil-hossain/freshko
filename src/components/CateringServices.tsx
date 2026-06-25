"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Service {
  id: string;
  title: string;
  tag: string;
  description: string;
  fullDescription: string;
  image: string;
}

const defaultServices: Service[] = [
  {
    id: "weddings",
    title: "Weddings & Receptions",
    tag: "50–1000 guests",
    description: "Full-day catering with customized menu, live stations, and a dedicated service team.",
    fullDescription: "Make your special day truly unforgettable with our premium wedding catering service. From intimate nikah ceremonies to grand reception feasts, we handle every detail — menu customization, live cooking stations, elegant table setups, and a professional service team that ensures your guests are taken care of from start to finish.\n\nOur experienced chefs craft dishes that blend traditional flavors with modern presentation, making every bite memorable.",
    image: "/catering_hero.jpg",
  },
  {
    id: "corporate",
    title: "Corporate Events",
    tag: "Any size",
    description: "Breakfast, lunch, and dinner packages for meetings, seminars, and company parties.",
    fullDescription: "Impress your colleagues and clients with our professional corporate catering. Whether it's a board meeting, annual seminar, product launch, or company celebration — we deliver timely, well-presented meals that match the tone of your event.\n\nChoose from curated breakfast platters, working lunches, evening high-tea, or full dinner spreads. Flexible packages for 10 to 500+ guests.",
    image: "/catering_food.jpg",
  },
  {
    id: "private",
    title: "Private Parties",
    tag: "10–200 guests",
    description: "Birthdays, anniversaries, Eid gatherings — we make every occasion special.",
    fullDescription: "From birthday bashes to anniversary dinners and Eid gatherings — we bring the flavor to your private celebrations. Our team works closely with you to design a menu that fits your theme, dietary needs, and budget.\n\nEnjoy stress-free hosting while we take care of cooking, serving, and cleanup. Indoor or outdoor — we adapt to any venue.",
    image: "/catering_hero.jpg",
  },
];

export default function CateringServices() {
  const [services, setServices] = useState<Service[]>(defaultServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/catering/content`);
        const data = await res.json();
        if (data.success && data.services && data.services.length > 0) {
          setServices(data.services);
        }
      } catch {}
    };
    fetchServices();
  }, []);

  return (
    <section id="services" className="py-20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-amber-100">
            What we do
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Services for every <span className="text-amber-600">occasion</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            Weddings, corporate events, private gatherings — we cater them all with excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((s) => (
            <div key={s.id} className="group relative rounded-bl-4xl rounded-tr-4xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col min-h-[420px]">
              <div className="relative h-[280px] overflow-hidden">
                <Image
                  src={s.image || "/catering_hero.jpg"}
                  alt={s.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-full">
                    {s.tag}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-600 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
                  {s.description}
                </p>
                <Link
                  href={`/catering/${s.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-100 transition-all border border-amber-200"
                >
                  View Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
