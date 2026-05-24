"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";

const MAX_ITEMS = 5;
const WEEKS = [1, 2, 3];

export default function FreeCustomPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const currency = useUIStore((s) => s.currency);

  const { data: productsData } = useGet<{ success: boolean; products: Product[] }>(["products"], "/api/product/list");
  const { data: addressesData } = useGet<{ success: boolean; addresses: any[] }>(["addresses"], "/api/address/get", { enabled: !!user });

  const [schedule, setSchedule] = useState<"monthly" | "weekly">("monthly");
  const [activeWeek, setActiveWeek] = useState(1);

  // Monthly: { productId: quantity }
  const [selected, setSelected] = useState<Record<string, number>>({});
  // Weekly: { week: { productId: quantity } }
  const [weeklySelected, setWeeklySelected] = useState<Record<number, Record<string, number>>>({ 1: {}, 2: {}, 3: {} });

  const [selectedAddress, setSelectedAddress] = useState("");
  const [deliveryDay, setDeliveryDay] = useState(1);

  const products = productsData?.products || [];
  const addresses = addressesData?.addresses || [];

  const subscribe = usePost("/api/subscription/subscribe", {
    onSuccess: (data: any) => {
      if (data.success) { toast.success("Subscribed to free pack!"); router.push("/my-subscriptions"); }
      else toast.error(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const monthlyCount = Object.keys(selected).filter((k) => selected[k] > 0).length;
  const weeklyCounts = WEEKS.map((w) => Object.keys(weeklySelected[w]).filter((k) => weeklySelected[w][k] > 0).length);

  const handleToggleMonthly = (productId: string) => {
    if (selected[productId]) {
      const copy = { ...selected }; delete copy[productId]; setSelected(copy);
    } else {
      if (monthlyCount >= MAX_ITEMS) { toast.error(`Max ${MAX_ITEMS} items allowed`); return; }
      setSelected({ ...selected, [productId]: 1 });
    }
  };

  const handleQtyMonthly = (productId: string, qty: number) => {
    if (qty <= 0) { const copy = { ...selected }; delete copy[productId]; setSelected(copy); }
    else setSelected({ ...selected, [productId]: qty });
  };

  const handleToggleWeekly = (productId: string) => {
    const weekCopy = { ...weeklySelected[activeWeek] };
    if (weekCopy[productId]) {
      delete weekCopy[productId];
    } else {
      const currentWeekCount = Object.keys(weeklySelected[activeWeek]).filter((k) => weeklySelected[activeWeek][k] > 0).length;
      if (currentWeekCount >= MAX_ITEMS) { toast.error(`Max ${MAX_ITEMS} items per week`); return; }
      weekCopy[productId] = 1;
    }
    setWeeklySelected({ ...weeklySelected, [activeWeek]: weekCopy });
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
      const weeklyItems = WEEKS.map((week) => ({
        week,
        items: Object.entries(weeklySelected[week]).filter(([, q]) => q > 0).map(([product, quantity]) => ({ product, quantity })),
      })).filter((w) => w.items.length > 0);
      if (weeklyItems.length === 0) return toast.error("Add items to at least one week");
      if (!selectedAddress) return toast.error("Select delivery address");
      subscribe.mutate({ type: "free-custom", schedule: "weekly", weeklyItems, addressId: selectedAddress, paymentType: "COD" } as any);
    } else {
      const items = Object.entries(selected).filter(([, q]) => q > 0).map(([product, quantity]) => ({ product, quantity }));
      if (items.length === 0) return toast.error("Select at least 1 item");
      if (!selectedAddress) return toast.error("Select delivery address");
      subscribe.mutate({ type: "free-custom", schedule: "monthly", items, deliveryDay, addressId: selectedAddress, paymentType: "COD" } as any);
    }
  };

  const activeWeeklyCount = Object.keys(weeklySelected[activeWeek]).filter((k) => weeklySelected[activeWeek][k] > 0).length;

  return (
    <main className="py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Free Custom Pack</h1>
          <p className="text-sm text-gray-500">₹0 subscription. Choose monthly or weekly.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setSchedule("monthly")} className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${schedule === "monthly" ? "bg-white shadow" : "text-gray-500"}`}>Monthly</button>
          <button onClick={() => setSchedule("weekly")} className={`px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${schedule === "weekly" ? "bg-white shadow" : "text-gray-500"}`}>Weekly</button>
        </div>
      </div>

      {/* Progress bar */}
      {schedule === "monthly" && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${(monthlyCount / MAX_ITEMS) * 100}%` }} />
          </div>
          <span className="text-sm font-medium text-gray-600">{monthlyCount}/{MAX_ITEMS}</span>
        </div>
      )}

      {/* Weekly tabs */}
      {schedule === "weekly" && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Max {MAX_ITEMS} items per week</span>
          </div>
          <div className="flex gap-2 mb-6">
            {WEEKS.map((week) => {
              const count = Object.keys(weeklySelected[week]).filter((k) => weeklySelected[week][k] > 0).length;
              return (
                <button key={week} onClick={() => setActiveWeek(week)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeWeek === week ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  Week {week} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {products.map((product) => {
          if (schedule === "monthly") {
            const qty = selected[product._id] || 0;
            const isSelected = qty > 0;
            const atLimit = monthlyCount >= MAX_ITEMS && !isSelected;
            return (
              <div key={product._id} onClick={() => !atLimit && handleToggleMonthly(product._id)}
                className={`p-3 border rounded-lg cursor-pointer transition ${isSelected ? "border-primary bg-primary/5" : atLimit ? "opacity-40 cursor-not-allowed" : "border-gray-200 hover:border-gray-300"}`}>
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{currency}{product.offerPrice}</p>
                {isSelected && (
                  <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleQtyMonthly(product._id, qty - 1)} className="w-6 h-6 border rounded text-xs cursor-pointer">-</button>
                    <span className="text-xs font-medium">{qty}</span>
                    <button onClick={() => handleQtyMonthly(product._id, qty + 1)} className="w-6 h-6 border rounded text-xs cursor-pointer">+</button>
                  </div>
                )}
              </div>
            );
          }

          // Weekly mode
          const qty = weeklySelected[activeWeek]?.[product._id] || 0;
          const isSelected = qty > 0;
          const atLimit = activeWeeklyCount >= MAX_ITEMS && !isSelected;
          return (
            <div key={product._id} onClick={() => !atLimit && handleToggleWeekly(product._id)}
              className={`p-3 border rounded-lg cursor-pointer transition ${isSelected ? "border-purple-500 bg-purple-50" : atLimit ? "opacity-40 cursor-not-allowed" : "border-gray-200 hover:border-gray-300"}`}>
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-xs text-gray-400">{currency}{product.offerPrice}</p>
              {isSelected && (
                <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleQtyWeekly(product._id, qty - 1)} className="w-6 h-6 border rounded text-xs cursor-pointer">-</button>
                  <span className="text-xs font-medium">{qty}</span>
                  <button onClick={() => handleQtyWeekly(product._id, qty + 1)} className="w-6 h-6 border rounded text-xs cursor-pointer">+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-4 max-w-md">
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
            <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} className="w-full border rounded px-3 py-2 text-sm outline-none mt-1">
              <option value="">Select address</option>
              {addresses.map((a: any) => (
                <option key={a._id} value={a._id}>{a.firstName} {a.lastName} — House {a.houseNumber}, Road {a.roadNumber}, {a.city}</option>
              ))}
            </select>
          ) : (
            <Link href="/add-address" className="text-primary text-sm underline mt-1 block">Add a new address</Link>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <p>You pay: <span className="text-green-600 font-semibold">₹0 / month</span> (Free plan)</p>
        </div>

        <button onClick={handleSubscribe} disabled={subscribe.isPending}
          className="bg-primary text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
          {subscribe.isPending ? "Subscribing..." : "Subscribe Free"}
        </button>
      </div>
    </main>
  );
}
