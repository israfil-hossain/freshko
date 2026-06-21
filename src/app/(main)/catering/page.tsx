"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  CalendarDays,
  Users,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ChefHat,
  PartyPopper,
  Building2,
  Heart,
  Clock,
  Phone,
  Star,
  Leaf,
  Award,
  Headphones,
  Quote,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function CateringPage() {
  const user = useAuthStore((s) => s.user);
  const currency = useUIStore((s) => s.currency);
  const [activeTab, setActiveTab] = useState<"all" | "corporate" | "wedding" | "party">("all");

  const stats = [
    { value: "500+", label: "Events Catered" },
    { value: "50K+", label: "Happy Guests" },
    { value: "4.9", label: "Avg Rating", icon: Star },
    { value: "100%", label: "Fresh Ingredients" },
  ];

  const steps = [
    { icon: UtensilsCrossed, title: "Choose Menu", desc: "Pick from our curated catering menus or customize your own." },
    { icon: Users, title: "Set Guest Count", desc: "Tell us how many guests — we'll handle the portions." },
    { icon: CalendarDays, title: "Pick a Date", desc: "Select your event date and preferred delivery time." },
    { icon: Truck, title: "We Deliver & Setup", desc: "Fresh food delivered hot, on time, with full setup." },
  ];

  const services = [
    {
      icon: Building2,
      title: "Corporate Events",
      desc: "Office meetings, conferences, and corporate gatherings. Professional presentation and timely delivery.",
      color: "bg-primary/10",
      iconColor: "text-primary",
      tag: "corporate" as const,
    },
    {
      icon: Heart,
      title: "Wedding & Reception",
      desc: "Make your special day unforgettable with our premium wedding catering packages.",
      color: "bg-pink-500/10",
      iconColor: "text-pink-600",
      tag: "wedding" as const,
    },
    {
      icon: PartyPopper,
      title: "Birthday & Parties",
      desc: "From intimate gatherings to grand celebrations — food that brings joy to every party.",
      color: "bg-purple-500/10",
      iconColor: "text-purple-600",
      tag: "party" as const,
    },
    {
      icon: ChefHat,
      title: "Custom Menu",
      desc: "Have a specific cuisine or dietary need? We'll create a custom menu just for you.",
      color: "bg-accent/10",
      iconColor: "text-accent",
      tag: "all" as const,
    },
  ];

  const packages = [
    {
      title: "Essential",
      subtitle: "Perfect for small gatherings",
      guests: "10 – 30 guests",
      price: "2,500",
      per: "per person",
      features: [
        "Choice of 2 main dishes",
        "Rice & bread included",
        "2 side dishes",
        "Soft drinks for all",
        "Basic table setup",
      ],
      highlight: false,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Premium",
      subtitle: "Most popular for events",
      guests: "30 – 100 guests",
      price: "4,500",
      per: "per person",
      features: [
        "Choice of 4 main dishes",
        "Rice, bread & naan",
        "4 side dishes & salads",
        "Full beverage package",
        "Elegant table setup",
        "Dedicated service staff",
      ],
      highlight: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Royal",
      subtitle: "For grand celebrations",
      guests: "100+ guests",
      price: "7,000",
      per: "per person",
      features: [
        "Unlimited main courses",
        "Live cooking stations",
        "Premium desserts bar",
        "Full beverage & juice bar",
        "Complete venue decoration",
        "Event coordinator included",
        "Post-event cleanup",
      ],
      highlight: false,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  const testimonials = [
    {
      name: "Rahim Ahmed",
      role: "Corporate Event Manager",
      text: "Freshko catered our annual conference for 200+ people. The food was exceptional and the service was flawless. Highly recommended!",
      rating: 5,
    },
    {
      name: "Fatima Khan",
      role: "Bride",
      text: "They made our wedding reception absolutely perfect. Every guest complimented the food. The live cooking stations were a huge hit!",
      rating: 5,
    },
    {
      name: "Sakib Hassan",
      role: "Birthday Celebration",
      text: "Ordered the Premium package for my daughter's birthday. Everything was fresh, delicious, and beautifully presented.",
      rating: 5,
    },
  ];

  const whyUs = [
    { icon: ChefHat, title: "Expert Chefs", desc: "Professional chefs prepare every dish with fresh, quality ingredients." },
    { icon: Clock, title: "On-Time Delivery", desc: "We guarantee timely delivery so your event runs smoothly." },
    { icon: ShieldCheck, title: "Quality Guaranteed", desc: "ISO-certified kitchen with strict hygiene and quality standards." },
    { icon: Leaf, title: "Fresh & Organic", desc: "Sourced directly from trusted local farms and suppliers." },
    { icon: Headphones, title: "24/7 Support", desc: "Dedicated event coordinator and round-the-clock customer support." },
    { icon: Award, title: "Best in Town", desc: "Award-winning catering service trusted by 500+ happy clients." },
  ];

  return (
    <main>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden text-white min-h-[520px] md:min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/catering_hero.jpg"
            alt="Catering background"
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
                Premium Catering Service
              </motion.span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.15] tracking-tight"
            >
              Delicious Food for
              <br />
              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="inline-block text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FF8A00, #FFA533, #FFB366, #FFA533, #FF8A00)",
                  backgroundSize: "200% auto",
                }}
              >
                Every Occasion
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            >
              From corporate events to dream weddings — fresh, delicious food delivered hot, served with care.
              Let us handle the food while you enjoy the moment.
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
                  href="#packages"
                  className="group inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all btn-press"
                >
                  View Packages
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all border border-white/20"
              >
                How It Works
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

      {/* ─── Services ─── */}
      <section className="relative overflow-hidden py-20">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />

        <div className="relative max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              Our Services
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Catering for <span className="text-gradient">Every Occasion</span>
            </h2>
            <p className="text-muted text-sm max-w-md mx-auto">
              Whether it&apos;s a boardroom meeting or a dream wedding, we&apos;ve got the perfect menu for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative p-6 rounded-2xl border border-border bg-surface overflow-hidden group cursor-pointer card-hover"
                >
                  {/* Hover gradient accent */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <Icon className={`w-6 h-6 ${service.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-sm mb-2">{service.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{service.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Packages ─── */}
      <section className="max-w-6xl mx-auto px-4 py-20" id="packages">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Transparent Pricing
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Choose Your <span className="text-gradient">Package</span>
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            No hidden fees. Pick the package that fits your event and budget.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`relative rounded-2xl bg-surface overflow-hidden card-hover ${
                pkg.highlight
                  ? "border-2 border-primary md:scale-105 md:-my-2 shadow-xl shadow-primary/10"
                  : "border border-border shadow-sm"
              }`}
            >
              {/* Top accent bar */}
              <div className={`h-1.5 ${pkg.highlight ? "gradient-accent" : "bg-gradient-to-r from-primary/20 to-primary/5"}`} />

              {pkg.highlight && (
                <div className="absolute top-5 right-4">
                  <span className="inline-flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md shadow-accent/20">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                </div>
              )}

              <div className="p-6 pb-0">
                <div className={`w-12 h-12 rounded-2xl ${pkg.bgColor} flex items-center justify-center mb-4`}>
                  <UtensilsCrossed className={`w-5 h-5 ${pkg.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-0.5">{pkg.title}</h3>
                <p className="text-xs text-muted mb-4">{pkg.subtitle}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-bold ${pkg.highlight ? "text-primary" : "text-foreground"}`}>
                    {currency}{pkg.price}
                  </span>
                  <span className="text-xs text-muted">/{pkg.per}</span>
                </div>
                <p className="text-xs text-muted mb-5">{pkg.guests}</p>
              </div>

              <div className="px-6 pb-6">
                <div className="h-px bg-border mb-5" />
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-xs text-muted">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${pkg.highlight ? "text-primary" : "text-success"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={user ? "/support" : "#"}
                  className={`block text-center rounded-xl py-3 text-sm font-semibold transition btn-press ${
                    pkg.highlight
                      ? "gradient-primary text-white hover:opacity-90 shadow-lg shadow-primary/20"
                      : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
              Why Choose <span className="text-gradient-accent">Our Catering</span>
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

      {/* ─── Testimonials ─── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative p-6 rounded-2xl border border-border bg-surface overflow-hidden group card-hover"
            >
              {/* Gradient accent top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Quote icon background */}
              <div className="absolute -top-2 -right-2 opacity-[0.04]">
                <Quote className="w-24 h-24 text-primary" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6 relative z-10">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border-light">
                  <div className="w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-md shadow-primary/20">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="relative rounded-3xl overflow-hidden min-h-[320px] flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/catering_food.jpg"
              alt="Catering food"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-primary/20" />
          </div>

          {/* Decorative */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          </div>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }} />

          <div className="relative z-10 px-8 md:px-14 py-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm text-accent text-xs font-semibold px-5 py-2 rounded-full mb-6 border border-accent/30 shadow-lg shadow-accent/10"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Phone className="w-3.5 h-3.5" />
                </motion.span>
                Get In Touch
              </motion.span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to{" "}
                <motion.span
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="inline-block text-transparent bg-clip-text"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #FF8A00, #FFA533, #FFB366, #FFA533, #FF8A00)",
                    backgroundSize: "200% auto",
                  }}
                >
                  Book
                </motion.span>{" "}
                Your Event?
              </h2>
              <p className="text-white/70 max-w-lg mx-auto text-sm md:text-base mb-10 leading-relaxed">
                Contact us today for a free consultation and custom quote. Let&apos;s make your event delicious.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  animate={{ boxShadow: ["0 10px 25px -5px rgba(0,0,0,0.1)", "0 10px 35px -5px rgba(0,0,0,0.2)", "0 10px 25px -5px rgba(0,0,0,0.1)"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full"
                >
                  <Link
                    href="/support"
                    className="group inline-flex items-center justify-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all btn-press"
                  >
                    <Phone className="w-4 h-4" />
                    Contact Us
                  </Link>
                </motion.div>
                <a
                  href="#packages"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-7 py-3.5 rounded-full text-sm font-semibold transition-all border border-white/20"
                >
                  View Packages
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
