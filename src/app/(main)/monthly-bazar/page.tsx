"use client";

import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import {
  ShoppingCart,
  CalendarDays,
  Package,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function MonthlyBazarPage() {
  const user = useAuthStore((s) => s.user);
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; plans: any[] }>(
    ["subscription-plans"],
    "/api/subscription/plans"
  );

  const plans = data?.plans || [];

  const steps = [
    { icon: ShoppingCart, title: "Pick Your Items", desc: "Browse products and add what you need to your pack." },
    { icon: CalendarDays, title: "Choose Schedule", desc: "Select monthly or weekly delivery — your choice." },
    { icon: Truck, title: "We Deliver", desc: "Fresh groceries delivered right to your doorstep." },
    { icon: CheckCircle2, title: "Enjoy & Repeat", desc: "Your pack renews automatically each cycle." },
  ];

  return (
    <main>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float delay-5" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center animate-fade-in-up">
          <span className="badge badge-accent mb-4 inline-flex animate-bounce-subtle">
            <Sparkles className="w-3 h-3" />
            Smart Grocery Shopping
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Monthly <span className="text-gradient-accent">Bazar</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-base md:text-lg mb-8">
            Subscribe to weekly or monthly grocery packs. Free and premium plans available.
            Customize each week with your favorite items.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/monthly-bazar/free-custom"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition btn-press"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#plans"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/10 transition btn-press"
            >
              View All Plans
            </a>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="badge badge-primary mb-3 inline-flex">How It Works</span>
          <h2 className="text-2xl md:text-3xl font-bold">
            Simple as <span className="text-gradient">1-2-3-4</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`text-center p-6 rounded-2xl border border-border bg-surface card-hover animate-fade-in-up delay-${i + 1}`}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-accent mb-1">Step {i + 1}</p>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Custom Packs ─── */}
      <section className="max-w-6xl mx-auto px-4 pb-16" id="plans">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="badge badge-accent mb-3 inline-flex">Build Your Pack</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Choose Your <span className="text-gradient">Plan</span>
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            Start free or go premium — customize exactly what you want, when you want it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Custom */}
          <div className="relative group rounded-2xl border border-border bg-surface overflow-hidden card-hover animate-fade-in-up delay-1">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-success" />
                </div>
                <span className="badge badge-success">Free</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Free Custom Pack</h3>
              <p className="text-2xl font-bold text-success mb-1">{currency}0<span className="text-sm font-normal text-muted">/month</span></p>
              <p className="text-xs text-muted mb-4">Pick up to 5 items. One monthly delivery.</p>
            </div>
            <div className="px-6 pb-6">
              <ul className="space-y-2 mb-6">
                {["Up to 5 items", "Monthly delivery", "Choose your products", "Free subscription"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/monthly-bazar/free-custom"
                className="block text-center border-2 border-primary text-primary rounded-xl py-2.5 text-sm font-semibold hover:bg-primary hover:text-white transition btn-press"
              >
                Build Free Pack
              </Link>
            </div>
          </div>

          {/* Premium Monthly — Featured */}
          <div className="relative group rounded-2xl border-2 border-primary bg-surface overflow-hidden card-hover animate-fade-in-up delay-2 md:scale-105 md:-my-2">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-accent" />
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <span className="badge badge-primary">Popular</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Custom Monthly Pack</h3>
              <p className="text-2xl font-bold text-primary mb-1">Pay as you pick</p>
              <p className="text-xs text-muted mb-4">Unlimited items, one monthly delivery.</p>
            </div>
            <div className="px-6 pb-6">
              <ul className="space-y-2 mb-6">
                {["Unlimited items", "Monthly delivery", "Any product you want", "Flexible payment"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/monthly-bazar/custom"
                className="block text-center gradient-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition btn-press"
              >
                Build Monthly Pack
              </Link>
            </div>
          </div>

          {/* Premium Weekly */}
          <div className="relative group rounded-2xl border border-border bg-surface overflow-hidden card-hover animate-fade-in-up delay-3">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                </div>
                <span className="badge" style={{ background: "color-mix(in srgb, #7c3aed 10%, transparent)", color: "#7c3aed" }}>Weekly</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Custom Weekly Pack</h3>
              <p className="text-2xl font-bold text-purple-600 mb-1">Pay as you pick</p>
              <p className="text-xs text-muted mb-4">Customize Week 1, 2 & 3. 3 deliveries/month.</p>
            </div>
            <div className="px-6 pb-6">
              <ul className="space-y-2 mb-6">
                {["Unlimited items", "3x deliveries/month", "Weekly customization", "Fresh every week"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/monthly-bazar/custom?schedule=weekly"
                className="block text-center border-2 border-purple-500 text-purple-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-purple-500 hover:text-white transition btn-press"
              >
                Build Weekly Pack
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Predefined Plans ─── */}
      {plans.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="badge badge-primary mb-3 inline-flex">Curated Plans</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Predefined <span className="text-gradient">Plans</span>
            </h2>
            <p className="text-muted text-sm max-w-md mx-auto">
              Handpicked grocery bundles ready for subscription. Pick one and start saving.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan: any, i: number) => {
                const isWeekly = plan.schedule === "weekly";
                const isFree = plan.price === 0;
                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-2xl border bg-surface overflow-hidden card-hover animate-fade-in-up delay-${Math.min(i + 1, 10)}`}
                  >
                    {isFree && <div className="absolute top-0 left-0 right-0 h-1 bg-success" />}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{isFree ? "🎁" : "⭐"}</span>
                        <span className={`badge ${isWeekly ? "" : "badge-primary"}`}
                          style={isWeekly ? { background: "color-mix(in srgb, #7c3aed 10%, transparent)", color: "#7c3aed" } : {}}>
                          {isWeekly ? "Weekly" : "Monthly"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                      <p className={`text-xl font-bold mb-2 ${isFree ? "text-success" : "text-primary"}`}>
                        {isFree ? "Free" : `${currency}${plan.price}`}
                        {!isFree && <span className="text-sm font-normal text-muted">/month</span>}
                      </p>
                      <p className="text-xs text-muted mb-4">{plan.description}</p>

                      <div className="text-xs text-muted mb-5 space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                        {isWeekly
                          ? (plan.weeklyItems || []).map((w: any, wi: number) => (
                              <div key={wi} className="flex items-center gap-2">
                                <Clock className="w-3 h-3 shrink-0 text-purple-500" />
                                <span>Week {w.week}: {(w.items || []).length} items</span>
                              </div>
                            ))
                          : (plan.items || []).slice(0, 5).map((item: any, ii: number) => (
                              <div key={ii} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 shrink-0 text-primary/50" />
                                <span>{item.product?.name} × {item.quantity}</span>
                              </div>
                            ))
                        }
                        {!isWeekly && (plan.items?.length || 0) > 5 && (
                          <p className="text-primary font-medium pl-5">+{plan.items.length - 5} more items</p>
                        )}
                      </div>

                      <Link
                        href={`/monthly-bazar/${plan._id}`}
                        className="block text-center border-2 border-primary text-primary rounded-xl py-2.5 text-sm font-semibold hover:bg-primary hover:text-white transition btn-press"
                      >
                        {isFree ? "Subscribe Free" : "View & Subscribe"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ─── Trust Banner ─── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="glass rounded-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-fade-in-up">
          {[
            { icon: ShieldCheck, title: "Quality Guaranteed", desc: "Fresh products sourced directly from trusted suppliers." },
            { icon: Truck, title: "Free Delivery", desc: "All subscription packs delivered at no extra cost." },
            { icon: CreditCard, title: "Flexible Payment", desc: "Pay online or cash on delivery — your choice." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-11 h-11 rounded-xl gradient-primary text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
