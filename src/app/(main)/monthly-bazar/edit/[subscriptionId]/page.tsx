"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePut } from "@/hooks/usePut";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";

const WEEKS = [1, 2, 3];

export default function EditSubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const currency = useUIStore((s) => s.currency);

  const { data: subData, isLoading: subLoading } = useGet<any>(
    ["subscription", params.subscriptionId as string],
    `/api/subscription/my/${params.subscriptionId}`
  );

  const { data: productsData } = useGet<{ success: boolean; products: Product[] }>(
    ["products"], "/api/product/list"
  );

  const updateItems = usePut(
    `/api/subscription/${params.subscriptionId}/items`,
    {
      onSuccess: (data: any) => {
        if (data.success) { toast.success("Items updated!"); router.push("/my-subscriptions"); }
        else toast.error(data.message);
      },
      onError: (err) => toast.error(err.message),
    },
    [["my-subscriptions"]]
  );

  const sub = subData?.subscription;
  const products = productsData?.products || [];
  const isWeekly = sub?.schedule === "weekly";
  const isFree = sub?.type === "free-custom";

  // Build initial state from subscription data
  const [selected, setSelected] = useState<Record<string, number>>(() => {
    if (!sub || sub.schedule === "weekly") return {};
    const map: Record<string, number> = {};
    (sub.items || []).forEach((item: any) => { map[item.product?._id || item.product] = item.quantity; });
    return map;
  });

  const [activeWeek, setActiveWeek] = useState(1);
  const [weeklySelected, setWeeklySelected] = useState<Record<number, Record<string, number>>>(() => {
    if (!sub || sub.schedule !== "weekly") return { 1: {}, 2: {}, 3: {} };
    const map: Record<number, Record<string, number>> = { 1: {}, 2: {}, 3: {} };
    (sub.weeklyItems || []).forEach((w: any) => {
      (w.items || []).forEach((item: any) => {
        map[w.week] = map[w.week] || {};
        map[w.week][item.product?._id || item.product] = item.quantity;
      });
    });
    return map;
  });

  if (subLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!sub) return <p className="py-20 text-center text-gray-500">Subscription not found.</p>;

  const categories = [...new Set(products.map((p) => p.category))];

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

  const handleSave = () => {
    if (isWeekly) {
      const weeklyItems = WEEKS.map((week) => ({
        week,
        items: Object.entries(weeklySelected[week])
          .filter(([, q]) => q > 0)
          .map(([product, quantity]) => ({ product, quantity })),
      })).filter((w) => w.items.length > 0);

      if (weeklyItems.length === 0) return toast.error("Add items to at least one week");
      updateItems.mutate({ schedule: "weekly", weeklyItems } as any);
    } else {
      const items = Object.entries(selected).filter(([, q]) => q > 0).map(([product, quantity]) => ({ product, quantity }));
      if (items.length === 0) return toast.error("Select at least 1 item");
      if (isFree && items.length > 5) return toast.error("Max 5 items for free plan");
      updateItems.mutate({ schedule: "monthly", items } as any);
    }
  };

  const monthlyCount = Object.keys(selected).filter((k) => selected[k] > 0).length;
  const weeklyCounts = WEEKS.map((w) => Object.keys(weeklySelected[w]).filter((k) => weeklySelected[w][k] > 0).length);

  const calcTotal = () => {
    if (isWeekly) {
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

  return (
    <main className="py-8 max-w-6xl mx-auto">
      <Link href="/my-subscriptions" className="text-sm text-primary underline mb-4 inline-block">
        &larr; Back to Subscriptions
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Edit Subscription</h1>
          <p className="text-sm text-gray-500 capitalize">
            {isWeekly ? "Weekly Pack" : "Monthly Pack"} &middot; {sub.type.replace("-", " ")}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500">{isWeekly ? weeklyCounts.join(", ") : monthlyCount} items selected</span>
          {!isFree && <span className="font-semibold text-primary">{currency}{calcTotal()}/mo</span>}
        </div>
      </div>

      {/* Weekly tabs */}
      {isWeekly && (
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
                const qty = isWeekly
                  ? (weeklySelected[activeWeek]?.[product._id] || 0)
                  : (selected[product._id] || 0);
                const handleQty = isWeekly ? handleQtyWeekly : handleQtyMonthly;
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
                      <button onClick={() => handleQty(product._id, 1)}
                        className="w-full text-xs border border-primary text-primary rounded py-1 hover:bg-primary hover:text-white transition cursor-pointer">
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-8 p-6 border border-gray-200 rounded-lg max-w-md">
        <h3 className="font-medium mb-2">Summary</h3>
        {isWeekly ? (
          <p className="text-sm text-gray-500 mb-3">Week 1: {weeklyCounts[0]} items &middot; Week 2: {weeklyCounts[1]} items &middot; Week 3: {weeklyCounts[2]} items</p>
        ) : (
          <p className="text-sm text-gray-500 mb-3">{monthlyCount} items</p>
        )}
        {!isFree && (
          <p className="text-sm font-semibold mb-4">Total: {currency}{calcTotal()}/month</p>
        )}

        <button onClick={handleSave} disabled={updateItems.isPending}
          className="w-full bg-primary text-white py-2.5 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
          {updateItems.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </main>
  );
}
