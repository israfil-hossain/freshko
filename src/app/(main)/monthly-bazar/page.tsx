"use client";

import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import { useAuthStore } from "@/stores/authStore";

export default function MonthlyBazarPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useGet<{ success: boolean; plans: any[] }>(
    ["subscription-plans"],
    "/api/subscription/plans"
  );

  const plans = data?.plans || [];

  return (
    <main className="py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Monthly Bazar</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Subscribe to monthly or weekly grocery packs. Free and premium plans available.
          Customize each week with your own items.
        </p>
      </div>

      {!user && (
        <div className="text-center mb-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <Link href="/" className="underline font-medium">Login</Link> to subscribe to a plan.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Custom — Monthly */}
          <div className="border border-gray-200 rounded-xl p-6 flex flex-col hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🛒</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Monthly</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Free Custom Pack</h3>
            <p className="text-sm text-gray-500 mb-1">₹0 / month</p>
            <p className="text-xs text-gray-400 mb-4">Pick up to 5 items. One monthly delivery.</p>
            <div className="mt-auto">
              <Link href="/monthly-bazar/free-custom" className="block text-center border border-primary text-primary rounded px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition">
                Build Free Pack
              </Link>
            </div>
          </div>

          {/* Premium Custom — Monthly */}
          <div className="border border-gray-200 rounded-xl p-6 flex flex-col hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">📦</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Monthly</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Custom Monthly Pack</h3>
            <p className="text-sm text-gray-500 mb-1">Pay as you pick</p>
            <p className="text-xs text-gray-400 mb-4">Unlimited items, one monthly delivery.</p>
            <div className="mt-auto">
              <Link href="/monthly-bazar/custom" className="block text-center bg-primary text-white rounded px-4 py-2 text-sm font-medium hover:opacity-90 transition">
                Build Monthly Pack
              </Link>
            </div>
          </div>

          {/* Premium Custom — Weekly */}
          <div className="border border-gray-200 rounded-xl p-6 flex flex-col hover:shadow-lg transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">📅</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Weekly</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Custom Weekly Pack</h3>
            <p className="text-sm text-gray-500 mb-1">Pay as you pick</p>
            <p className="text-xs text-gray-400 mb-4">Customize Week 1, 2 & 3. 3 deliveries/month.</p>
            <div className="mt-auto">
              <Link href="/monthly-bazar/custom?schedule=weekly" className="block text-center border border-purple-500 text-purple-600 rounded px-4 py-2 text-sm font-medium hover:bg-purple-500 hover:text-white transition">
                Build Weekly Pack
              </Link>
            </div>
          </div>

          {/* Predefined Plans */}
          {plans.map((plan) => (
            <div key={plan._id} className="border border-gray-200 rounded-xl p-6 flex flex-col hover:shadow-lg transition">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">{plan.type === "free" ? "🎁" : "⭐"}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  plan.schedule === "weekly" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {plan.schedule === "weekly" ? "Weekly" : "Monthly"}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-1">
                {plan.price === 0 ? "₹0 / month" : `₹${plan.price} / month`}
              </p>
              <p className="text-xs text-gray-400 mb-3">{plan.description}</p>
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                {plan.schedule === "weekly"
                  ? (plan.weeklyItems || []).map((w: any, i: number) => (
                      <p key={i}>Week {w.week}: {(w.items || []).length} items</p>
                    ))
                  : (plan.items || []).slice(0, 4).map((item: any, i: number) => (
                      <p key={i}>• {item.product?.name} x {item.quantity}</p>
                    ))
                }
                {plan.schedule !== "weekly" && (plan.items?.length || 0) > 4 && (
                  <p className="text-primary">+{plan.items.length - 4} more</p>
                )}
              </div>
              <div className="mt-auto">
                <Link href={`/monthly-bazar/${plan._id}`} className="block text-center border border-primary text-primary rounded px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition">
                  {plan.price === 0 ? "Subscribe Free" : "View & Subscribe"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
