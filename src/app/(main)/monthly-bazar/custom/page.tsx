"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";

const WEEKS = [1, 2, 3];

function CustomBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSchedule = searchParams.get("schedule") === "weekly" ? "weekly" : "monthly";

  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const currency = useUIStore((s) => s.currency);

  const { data: productsData } = useGet<{ success: boolean; products: Product[] }>(["products"], "/api/product/list");
  const { data: addressesData } = useGet<{ success: boolean; addresses: any[] }>(["addresses"], "/api/address/get", { enabled: !!user });

  const [schedule, setSchedule] = useState<"monthly" | "weekly">(defaultSchedule);
  const [activeWeek, setActiveWeek] = useState(1);

  // Monthly state
  const [selected, setSelected] = useState<Record<string, number>>({});

  // Weekly state: { week: { productId: quantity } }
  const [weeklySelected, setWeeklySelected] = useState<Record<number, Record<string, number>>>({
    1: {}, 2: {}, 3: {},
  });

  const [selectedAddress, setSelectedAddress] = useState("");
  const [deliveryDay, setDeliveryDay] = useState(1);
  const [paymentOption, setPaymentOption] = useState<"COD" | "Online">("COD");

  const products = productsData?.products || [];
  const addresses = addressesData?.addresses || [];
  const categories = [...new Set(products.map((p) => p.category))];

  const subscribe = usePost("/api/subscription/subscribe", {
    onSuccess: (data: any) => {
      if (data.success) { toast.success("Subscribed!"); router.push("/my-subscriptions"); }
      else toast.error(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleQtyMonthly = (productId: string, qty: number) => {
    if (qty <= 0) { const copy = { ...selected }; delete copy[productId]; setSelected(copy); }
    else setSelected({ ...selected, [productId]: qty });
  };

  const handleQtyWeekly = (productId: string, qty: number) => {
    const weekCopy = { ...weeklySelected[activeWeek] };
    if (qty <= 0) delete weekCopy[productId];
    else weekCopy[productId] = qty;
    setWeeklySelected({ ...weeklySelected, [activeWeek]: weekCopy });
  };

  const handleSubscribe = () => {
    if (!user) { setShowUserLogin(true); return; }

    if (schedule === "weekly") {
      const weeklyItems = WEEKS.map((week) => {
        const items = Object.entries(weeklySelected[week])
          .filter(([, q]) => q > 0)
          .map(([product, quantity]) => ({ product, quantity }));
        return { week, items };
      }).filter((w) => w.items.length > 0);

      if (weeklyItems.length === 0) return toast.error("Add items to at least one week");
      if (!selectedAddress) return toast.error("Select delivery address");

      subscribe.mutate({ type: "premium-custom", schedule: "weekly", weeklyItems, addressId: selectedAddress, paymentType: paymentOption } as any);
    } else {
      const items = Object.entries(selected).filter(([, q]) => q > 0).map(([product, quantity]) => ({ product, quantity }));
      if (items.length === 0) return toast.error("Select at least 1 item");
      if (!selectedAddress) return toast.error("Select delivery address");

      subscribe.mutate({ type: "premium-custom", schedule: "monthly", items, deliveryDay, addressId: selectedAddress, paymentType: paymentOption } as any);
    }
  };

  const calcTotal = () => {
    if (schedule === "weekly") {
      let total = 0;
      for (const week of WEEKS) {
        for (const [id, qty] of Object.entries(weeklySelected[week])) {
          const p = products.find((p) => p._id === id);
          if (p) total += p.offerPrice * qty;
        }
      }
      return total;
    }
    return Object.entries(selected).reduce((sum, [id, qty]) => {
      const p = products.find((p) => p._id === id);
      return sum + (p ? p.offerPrice * qty : 0);
    }, 0);
  };

  const total = calcTotal();
  const monthlyCount = Object.keys(selected).filter((k) => selected[k] > 0).length;
  const weeklyCounts = WEEKS.map((w) => Object.keys(weeklySelected[w]).filter((k) => weeklySelected[w][k] > 0).length);

  return (
    <main className="py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Build Your Custom Pack</h1>
          <p className="text-sm text-gray-500">Choose monthly or weekly delivery</p>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setSchedule("monthly")} className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${schedule === "monthly" ? "bg-white shadow" : "text-gray-500"}`}>Monthly</button>
          <button onClick={() => setSchedule("weekly")} className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${schedule === "weekly" ? "bg-white shadow" : "text-gray-500"}`}>Weekly (3 deliveries)</button>
        </div>
      </div>

      <div className="flex gap-4 mb-4 text-sm text-gray-500">
        <span>{schedule === "weekly" ? `Week items: ${weeklyCounts.join(", ")}` : `${monthlyCount} items selected`}</span>
        <span className="text-primary font-semibold">{currency}{total}/month</span>
      </div>

      {/* Weekly tabs */}
      {schedule === "weekly" && (
        <div className="flex gap-2 mb-6">
          {WEEKS.map((week) => (
            <button key={week} onClick={() => setActiveWeek(week)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeWeek === week ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              Week {week} {weeklyCounts[week - 1] > 0 && `(${weeklyCounts[week - 1]})`}
            </button>
          ))}
        </div>
      )}

      {/* Products by category */}
      {categories.map((category) => {
        const catProducts = products.filter((p) => p.category === category);
        return (
          <div key={category} className="mb-6">
            <h3 className="font-medium text-sm text-gray-600 mb-3 uppercase">{category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {catProducts.map((product) => {
                const qty = schedule === "weekly" ? (weeklySelected[activeWeek]?.[product._id] || 0) : (selected[product._id] || 0);
                const handleQty = schedule === "weekly" ? handleQtyWeekly : handleQtyMonthly;
                return (
                  <div key={product._id} className={`p-3 border rounded-lg transition ${qty > 0 ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 mb-2">{currency}{product.offerPrice}</p>
                    {qty > 0 ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleQty(product._id, qty - 1)} className="w-7 h-7 border rounded text-sm cursor-pointer">-</button>
                        <span className="text-sm w-6 text-center">{qty}</span>
                        <button onClick={() => handleQty(product._id, qty + 1)} className="w-7 h-7 border rounded text-sm cursor-pointer">+</button>
                      </div>
                    ) : (
                      <button onClick={() => handleQty(product._id, 1)} className="w-full text-xs border border-primary text-primary rounded py-1 hover:bg-primary hover:text-white transition cursor-pointer">Add</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-8 p-6 border border-gray-200 rounded-lg max-w-md space-y-4">
        <h3 className="font-medium">Subscription Details</h3>

        {schedule === "monthly" && (
          <div>
            <label className="text-sm font-medium text-gray-600">Delivery Day (1-28)</label>
            <input type="number" min={1} max={28} value={deliveryDay} onChange={(e) => setDeliveryDay(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-1" />
          </div>
        )}
        {schedule === "weekly" && (
          <p className="text-sm text-gray-500">Deliveries on 1st, 8th, and 15th of each month</p>
        )}

        <div>
          <label className="text-sm font-medium text-gray-600">Delivery Address</label>
          {addresses.length > 0 ? (
            <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm outline-none mt-1">
              <option value="">Select address</option>
              {addresses.map((a: any) => (
                <option key={a._id} value={a._id}>{a.firstName} {a.lastName} — House {a.houseNumber}, Road {a.roadNumber}, {a.city}</option>
              ))}
            </select>
          ) : (
            <Link href="/add-address" className="text-primary text-sm underline mt-1 block">Add a new address</Link>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Payment Method</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="payment" checked={paymentOption === "COD"} onChange={() => setPaymentOption("COD")} /> COD</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="payment" checked={paymentOption === "Online"} onChange={() => setPaymentOption("Online")} /> Online</label>
          </div>
        </div>

        <div className="text-sm pt-2 border-t">
          <p>Total: <span className="font-semibold">{currency}{total}/month</span></p>
          {schedule === "weekly" && <p className="text-xs text-gray-400">3 deliveries per month</p>}
        </div>

        <button onClick={handleSubscribe} disabled={(schedule === "monthly" ? monthlyCount : weeklyCounts.reduce((a, b) => a + b, 0)) === 0 || subscribe.isPending}
          className="w-full bg-primary text-white py-2.5 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
          {subscribe.isPending ? "Subscribing..." : `Subscribe — ${currency}${total}/month`}
        </button>
      </div>
    </main>
  );
}

export default function CustomMonthlyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <CustomBuilderContent />
    </Suspense>
  );
}
