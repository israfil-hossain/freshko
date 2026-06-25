"use client";

import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  CalendarDays,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Route,
  SlidersHorizontal,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const steps = [
  {
    icon: ShoppingCart,
    num: "01",
    title: "Pick your items",
    desc: "Browse and add what you need to your pack.",
  },
  {
    icon: CalendarDays,
    num: "02",
    title: "Choose a schedule",
    desc: "Monthly or weekly delivery — your call.",
  },
  {
    icon: Truck,
    num: "03",
    title: "We deliver",
    desc: "Fresh groceries to your doorstep on time.",
  },
  {
    icon: RefreshCw,
    num: "04",
    title: "Auto-renews",
    desc: "Your pack repeats every cycle, hands-free.",
  },
];

export default function MonthlyBazarPage() {
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; plans: any[] }>(
    ["subscription-plans"],
    "/api/subscription/plans"
  );

  const plans = data?.plans || [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 pb-20">

      {/* ─── Predefined Plans ─── */}
      {(isLoading || plans.length > 0) && (
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-muted border border-border rounded-full px-3 py-1 mb-4">
              <Package className="w-3 h-3" />
              Curated plans
            </span>
            <h2 className="text-2xl font-medium text-foreground mb-1.5">
              Ready-made bundles
            </h2>
            <p className="text-sm text-muted max-w-md leading-relaxed">
              Handpicked grocery packs. Subscribe and we'll handle the rest.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan: any, i: number) => {
                const isWeekly = plan.schedule === "weekly";
                const isFree = plan.price === 0;
                const colorClass = isFree
                  ? "text-success"
                  : isWeekly
                    ? "text-purple-600"
                    : "text-primary";
                const bgClass = isFree
                  ? "bg-success/10 text-success"
                  : isWeekly
                    ? "text-purple-600"
                    : "bg-primary/10 text-primary";
                const iconBg = isFree
                  ? "bg-success/10"
                  : isWeekly
                    ? "bg-purple-500/10"
                    : "bg-primary/10";
                const iconColor = isFree
                  ? "text-success"
                  : isWeekly
                    ? "text-purple-600"
                    : "text-primary";

                return (
                  <motion.div
                    key={plan._id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="border border-border rounded-xl bg-surface overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                          {isFree ? (
                            <ShoppingCart className={`w-4 h-4 ${iconColor}`} />
                          ) : isWeekly ? (
                            <CalendarDays className={`w-4 h-4 ${iconColor}`} />
                          ) : (
                            <Package className={`w-4 h-4 ${iconColor}`} />
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full ${bgClass}`}
                          style={
                            isWeekly
                              ? { background: "color-mix(in srgb, #7c3aed 10%, transparent)" }
                              : undefined
                          }
                        >
                          {isFree ? "Free" : isWeekly ? "Weekly" : "Monthly"}
                        </span>
                      </div>

                      <h3 className="text-[15px] font-medium text-foreground mb-0.5">
                        {plan.name}
                      </h3>
                      <p className={`text-xl font-medium mb-1 ${colorClass}`}>
                        {isFree ? "Free" : `${currency}${plan.price}`}
                        {!isFree && (
                          <span className="text-xs font-normal text-muted ml-1">/month</span>
                        )}
                      </p>
                      <p className="text-xs text-muted mb-4 leading-relaxed">{plan.description}</p>

                      <div className="space-y-1.5 mb-5 max-h-28 overflow-y-auto no-scrollbar">
                        {isWeekly
                          ? (plan.weeklyItems || []).map((w: any, wi: number) => (
                              <div key={wi} className="flex items-center gap-2 text-xs text-muted">
                                <Clock className="w-3 h-3 shrink-0 text-purple-400" />
                                Week {w.week}: {(w.items || []).length} items
                              </div>
                            ))
                          : (plan.items || []).slice(0, 5).map((item: any, ii: number) => (
                              <div key={ii} className="flex items-center gap-2 text-xs text-muted">
                                <CheckCircle2 className="w-3 h-3 shrink-0 text-muted/40" />
                                {item.product?.name} × {item.quantity}
                              </div>
                            ))}
                        {!isWeekly && (plan.items?.length || 0) > 5 && (
                          <p className={`text-xs font-medium pl-5 ${colorClass}`}>
                            +{plan.items.length - 5} more items
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/monthly-bazar/${plan._id}`}
                        className="block text-center border border-border text-foreground rounded-lg py-2.5 text-xs font-medium hover:bg-muted/10 transition-colors"
                      >
                        {isFree ? "Subscribe free" : "View & subscribe"}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ─── Divider ─── */}
      <div className="border-t border-border mb-16" />

      {/* ─── How It Works ─── */}
      <section className="mb-16" id="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-muted border border-border rounded-full px-3 py-1 mb-4">
            <Route className="w-3 h-3" />
            How it works
          </span>
          <h2 className="text-2xl font-medium text-foreground">
            Four steps, zero hassle
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border border border-border rounded-xl overflow-hidden">
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
                className="p-5 bg-surface"
              >
                <p className="text-[11px] font-medium tracking-widest text-muted/50 uppercase mb-3">
                  {step.num}
                </p>
                <Icon className="w-5 h-5 text-foreground mb-3" />
                <h3 className="text-[13px] font-medium text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="border-t border-border mb-16" />

      {/* ─── Custom Packs ─── */}
      <section id="plans">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-muted border border-border rounded-full px-3 py-1 mb-4">
            <SlidersHorizontal className="w-3 h-3" />
            Build your pack
          </span>
          <h2 className="text-2xl font-medium text-foreground mb-1.5">
            Custom plans
          </h2>
          <p className="text-sm text-muted max-w-md leading-relaxed">
            Start free or go full custom — build exactly what you want.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

          {/* Free Custom */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="border border-border rounded-xl bg-surface overflow-hidden"
          >
            <div className="p-5 pb-0">
              <span className="inline-block text-[10px] font-medium tracking-wide uppercase bg-success/10 text-success px-2.5 py-1 rounded-full mb-4">
                Free
              </span>
              <h3 className="text-[15px] font-medium text-foreground mb-1">
                Free custom pack
              </h3>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Pick up to 5 items. One monthly delivery, no cost.
              </p>
              <p className="text-xl font-medium text-success mb-0.5">
                {currency}0{" "}
                <span className="text-xs font-normal text-muted">/month</span>
              </p>
            </div>
            <div className="p-5">
              <div className="border-t border-border mb-4" />
              <ul className="space-y-2 mb-5">
                {["Up to 5 items", "Monthly delivery", "Choose your products", "Always free"].map(
                  (f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/monthly-bazar/free-custom"
                className="block text-center border border-border text-foreground rounded-lg py-2.5 text-xs font-medium hover:bg-muted/10 transition-colors"
              >
                Build free pack
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
            className="border-[1.5px] border-primary rounded-xl bg-surface overflow-hidden md:scale-[1.02] md:-my-1 shadow-sm shadow-primary/10"
          >
            <div className="p-5 pb-0">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block text-[10px] font-medium tracking-wide uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  Monthly
                </span>
                <span className="text-[10px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  Popular
                </span>
              </div>
              <h3 className="text-[15px] font-medium text-foreground mb-1">
                Custom monthly pack
              </h3>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Unlimited items, one monthly delivery. Pay per product.
              </p>
              <p className="text-xl font-medium text-primary mb-0.5">Pay as you pick</p>
            </div>
            <div className="p-5">
              <div className="border-t border-border mb-4" />
              <ul className="space-y-2 mb-5">
                {["Unlimited items", "Monthly delivery", "Any product you want", "Flexible payment"].map(
                  (f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/monthly-bazar/custom"
                className="block text-center bg-primary text-white rounded-lg py-2.5 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Build monthly pack
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
            className="border border-border rounded-xl bg-surface overflow-hidden"
          >
            <div className="p-5 pb-0">
              <span
                className="inline-block text-[10px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full mb-4"
                style={{
                  background: "color-mix(in srgb, #7c3aed 10%, transparent)",
                  color: "#7c3aed",
                }}
              >
                Weekly
              </span>
              <h3 className="text-[15px] font-medium text-foreground mb-1">
                Custom weekly pack
              </h3>
              <p className="text-xs text-muted mb-3 leading-relaxed">
                Set Week 1, 2 & 3 differently. 3 deliveries per month.
              </p>
              <p className="text-xl font-medium text-purple-600 mb-0.5">Pay as you pick</p>
            </div>
            <div className="p-5">
              <div className="border-t border-border mb-4" />
              <ul className="space-y-2 mb-5">
                {["Unlimited items", "3 deliveries/month", "Week-by-week control", "Always fresh"].map(
                  (f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/monthly-bazar/custom?schedule=weekly"
                className="block text-center border border-border text-foreground rounded-lg py-2.5 text-xs font-medium hover:bg-muted/10 transition-colors"
              >
                Build weekly pack
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

    </main>
  );
}