"use client";

import { Shield, Clock, Users, Sparkles } from "lucide-react";

const items = [
  { icon: Shield, label: "Quality Guaranteed", desc: "100% fresh ingredients" },
  { icon: Clock, label: "On-Time Delivery", desc: "Never late, guaranteed" },
  { icon: Users, label: "Expert Team", desc: "Professional service" },
  { icon: Sparkles, label: "Custom Menus", desc: "Tailored to your taste" },
];

export default function CateringTrustBar() {
  return (
    <section className="border-b border-border bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
