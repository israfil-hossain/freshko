"use client";

import { MessageSquare, ChefHat, ClipboardCheck, Sparkles } from "lucide-react";

const steps = [
  { num: "01", icon: MessageSquare, title: "Tell us your event", desc: "Date, guest count, venue, and any special requirements." },
  { num: "02", icon: ChefHat, title: "We design your menu", desc: "A tailored proposal within 24 hours." },
  { num: "03", icon: ClipboardCheck, title: "Confirm & relax", desc: "Approve the menu, sign, and leave the rest to us." },
  { num: "04", icon: Sparkles, title: "Enjoy your event", desc: "We set up, serve, and clean up — all handled." },
];

export default function CateringHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-amber-100">
            How it works
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Four steps to a <span className="text-amber-600">perfect event</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            We keep it simple so you can focus on enjoying the day.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-[60px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-amber-500/25 z-10">
                    {step.num}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-amber-100 group-hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm mb-2 text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
