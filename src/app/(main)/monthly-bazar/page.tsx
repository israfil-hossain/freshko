"use client";

import Link from "next/link";
import Image from "next/image";
import { useGet } from "@/hooks/useGet";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { motion } from "framer-motion";
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
  Leaf,
  Headphones,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function MonthlyBazarPage() {
  const user = useAuthStore((s) => s.user);
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; plans: any[] }>(
    ["subscription-plans"],
    "/api/subscription/plans"
  );

  const plans = data?.plans || [];

  const stats = [
    { value: "10K+", label: "Happy Subscribers" },
    { value: "50K+", label: "Packs Delivered" },
    { value: "4.8", label: "Avg Rating", icon: Star },
    { value: "100%", label: "Fresh Products" },
  ];

  const steps = [
    { icon: ShoppingCart, title: "Pick Your Items", desc: "Browse products and add what you need to your pack." },
    { icon: CalendarDays, title: "Choose Schedule", desc: "Select monthly or weekly delivery — your choice." },
    { icon: Truck, title: "We Deliver", desc: "Fresh groceries delivered right to your doorstep." },
    { icon: CheckCircle2, title: "Enjoy & Repeat", desc: "Your pack renews automatically each cycle." },
  ];

  const whyUs = [
    { icon: ShieldCheck, title: "Quality Guaranteed", desc: "Fresh products sourced directly from trusted suppliers." },
    { icon: Truck, title: "Free Delivery", desc: "All subscription packs delivered at no extra cost." },
    { icon: CreditCard, title: "Flexible Payment", desc: "Pay online or cash on delivery — your choice." },
    { icon: Leaf, title: "Fresh & Organic", desc: "Farm-fresh produce straight to your doorstep." },
    { icon: Headphones, title: "24/7 Support", desc: "Customer support whenever you need assistance." },
    { icon: Package, title: "Custom Packs", desc: "Build your own pack with exactly what you want." },
  ];

  return (
    <main>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden text-white min-h-[520px] md:min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/monthly_bazar_hero.jpg"
            alt="Monthly Bazar background"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        </div>

        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float delay-5" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm text-accent text-xs font-semibold px-5 py-2 rounded-full mb-6 border border-accent/30 shadow-lg shadow-accent/10"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.span>
                Smart Grocery Shopping
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.15] tracking-tight"
            >
              Monthly{" "}
              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="inline-block text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FF8A00, #FFA533, #FFB366, #FFA533, #FF8A00)",
                  backgroundSize: "200% auto",
                }}
              >
                Bazar
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            >
              Subscribe to weekly or monthly grocery packs. Free and premium plans available.
              Customize each week with your favorite items.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                animate={{ boxShadow: ["0 10px 25px -5px rgba(255,138,0,0.3)", "0 10px 35px -5px rgba(255,138,0,0.5)", "0 10px 25px -5px rgba(255,138,0,0.3)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-full"
              >
                <Link
                  href="/monthly-bazar/free-custom"
                  className="group inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all btn-press"
                >
                  Start Free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
              <a
                href="#plans"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all border border-white/20"
              >
                View All Plans
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="max-w-6xl mx-auto px-4 -mt-7 relative z-10">
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                {stat.icon ? (
                  <stat.icon className="w-5 h-5 text-accent" />
                ) : (
                  <span className="text-lg font-bold text-primary">{stat.value.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-6xl mx-auto px-4 py-20" id="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">
            Simple as <span className="text-gradient">1-2-3-4</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative text-center p-6 rounded-2xl border border-border bg-surface card-hover group"
                >
                  {/* Step number badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-accent/20 z-10">
                    {i + 1}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Custom Packs ─── */}
      <section className="max-w-6xl mx-auto px-4 py-20" id="plans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Build Your Pack
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Choose Your <span className="text-gradient">Plan</span>
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            Start free or go premium — customize exactly what you want, when you want it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {/* Free Custom */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-2xl bg-surface overflow-hidden card-hover border border-border shadow-sm"
          >
            <div className="h-1.5 bg-gradient-to-r from-success/40 to-success/10" />
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-success" />
                </div>
                <span className="inline-flex items-center gap-1 bg-success/10 text-success text-[10px] font-bold px-3 py-1 rounded-full">
                  Free
                </span>
              </div>
              <h3 className="text-lg font-bold mb-0.5">Free Custom Pack</h3>
              <p className="text-xs text-muted mb-4">Pick up to 5 items. One monthly delivery.</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-success">{currency}0</span>
                <span className="text-xs text-muted">/month</span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="h-px bg-border my-5" />
              <ul className="space-y-3 mb-6">
                {["Up to 5 items", "Monthly delivery", "Choose your products", "Free subscription"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-muted">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/monthly-bazar/free-custom"
                className="block text-center border-2 border-primary text-primary rounded-xl py-3 text-sm font-semibold hover:bg-primary hover:text-white transition btn-press"
              >
                Build Free Pack
              </Link>
            </div>
          </motion.div>

          {/* Premium Monthly — Featured */}
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-2xl bg-surface overflow-hidden card-hover border-2 border-primary md:scale-105 md:-my-2 shadow-xl shadow-primary/10"
          >
            <div className="h-1.5 gradient-accent" />
            <div className="absolute top-5 right-4">
              <span className="inline-flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md shadow-accent/20">
                <Sparkles className="w-3 h-3" />
                Popular
              </span>
            </div>
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-0.5">Custom Monthly Pack</h3>
              <p className="text-xs text-muted mb-4">Unlimited items, one monthly delivery.</p>
              <p className="text-3xl font-bold text-primary mb-1">Pay as you pick</p>
            </div>
            <div className="px-6 pb-6">
              <div className="h-px bg-border my-5" />
              <ul className="space-y-3 mb-6">
                {["Unlimited items", "Monthly delivery", "Any product you want", "Flexible payment"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-muted">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/monthly-bazar/custom"
                className="block text-center gradient-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition btn-press shadow-lg shadow-primary/20"
              >
                Build Monthly Pack
              </Link>
            </div>
          </motion.div>

          {/* Premium Weekly */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-2xl bg-surface overflow-hidden card-hover border border-border shadow-sm"
          >
            <div className="h-1.5 bg-gradient-to-r from-purple-500/40 to-purple-500/10" />
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: "color-mix(in srgb, #7c3aed 10%, transparent)", color: "#7c3aed" }}>
                  Weekly
                </span>
              </div>
              <h3 className="text-lg font-bold mb-0.5">Custom Weekly Pack</h3>
              <p className="text-xs text-muted mb-4">Customize Week 1, 2 & 3. 3 deliveries/month.</p>
              <p className="text-3xl font-bold text-purple-600 mb-1">Pay as you pick</p>
            </div>
            <div className="px-6 pb-6">
              <div className="h-px bg-border my-5" />
              <ul className="space-y-3 mb-6">
                {["Unlimited items", "3x deliveries/month", "Weekly customization", "Fresh every week"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-muted">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/monthly-bazar/custom?schedule=weekly"
                className="block text-center border-2 border-purple-500 text-purple-600 rounded-xl py-3 text-sm font-semibold hover:bg-purple-500 hover:text-white transition btn-press"
              >
                Build Weekly Pack
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Predefined Plans ─── */}
      {plans.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              Curated Plans
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Predefined <span className="text-gradient">Plans</span>
            </h2>
            <p className="text-muted text-sm max-w-md mx-auto">
              Handpicked grocery bundles ready for subscription. Pick one and start saving.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan: any, i: number) => {
                const isWeekly = plan.schedule === "weekly";
                const isFree = plan.price === 0;
                return (
                  <motion.div
                    key={plan._id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="relative rounded-2xl bg-surface overflow-hidden card-hover border border-border shadow-sm"
                  >
                    {/* Top accent bar */}
                    <div className={`h-1.5 ${isFree ? "bg-gradient-to-r from-success/40 to-success/10" : isWeekly ? "bg-gradient-to-r from-purple-500/40 to-purple-500/10" : "bg-gradient-to-r from-primary/40 to-primary/10"}`} />

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isFree ? "bg-success/10" : isWeekly ? "bg-purple-500/10" : "bg-primary/10"}`}>
                          {isFree ? (
                            <ShoppingCart className="w-5 h-5 text-success" />
                          ) : isWeekly ? (
                            <CalendarDays className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Package className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full ${
                            isFree
                              ? "bg-success/10 text-success"
                              : isWeekly
                                ? "text-purple-600"
                                : "bg-primary/10 text-primary"
                          }`}
                          style={isWeekly ? { background: "color-mix(in srgb, #7c3aed 10%, transparent)" } : undefined}
                        >
                          {isFree ? "Free" : isWeekly ? "Weekly" : "Monthly"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-0.5">{plan.name}</h3>
                      <p className={`text-2xl font-bold mb-2 ${isFree ? "text-success" : isWeekly ? "text-purple-600" : "text-primary"}`}>
                        {isFree ? "Free" : `${currency}${plan.price}`}
                        {!isFree && <span className="text-sm font-normal text-muted">/month</span>}
                      </p>
                      <p className="text-xs text-muted mb-4">{plan.description}</p>

                      <div className="text-xs text-muted mb-5 space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                        {isWeekly
                          ? (plan.weeklyItems || []).map((w: any, wi: number) => (
                              <div key={wi} className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                                <span>Week {w.week}: {(w.items || []).length} items</span>
                              </div>
                            ))
                          : (plan.items || []).slice(0, 5).map((item: any, ii: number) => (
                              <div key={ii} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-primary/50" />
                                <span>{item.product?.name} × {item.quantity}</span>
                              </div>
                            ))
                        }
                        {!isWeekly && (plan.items?.length || 0) > 5 && (
                          <p className="text-primary font-medium pl-5.5">+{plan.items.length - 5} more items</p>
                        )}
                      </div>

                      <Link
                        href={`/monthly-bazar/${plan._id}`}
                        className="block text-center border-2 border-primary text-primary rounded-xl py-3 text-sm font-semibold hover:bg-primary hover:text-white transition btn-press"
                      >
                        {isFree ? "Subscribe Free" : "View & Subscribe"}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ─── Why Choose Us ─── */}
      <section className="relative overflow-hidden py-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/10">
              Why Freshko
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Why Choose <span className="text-gradient-accent">Monthly Bazar</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/10 hover:bg-white/[0.12] transition-all duration-300 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
