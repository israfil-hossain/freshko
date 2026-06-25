"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { CheckCircle2, Info } from "lucide-react";
import type { Product } from "@/types";

const MAX_ITEMS = 5;
const WEEKS = [1, 2, 3] as const;

export default function FreeCustomPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const currency = useUIStore((s) => s.currency);

  const { data: productsData } = useGet<{ success: boolean; products: Product[] }>(
    ["products"],
    "/api/product/list"
  );
  const { data: addressesData } = useGet<{ success: boolean; addresses: any[] }>(
    ["addresses"],
    "/api/address/get",
    { enabled: !!user }
  );

  const [schedule, setSchedule] = useState<"monthly" | "weekly">("monthly");
  const [activeWeek, setActiveWeek] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [weeklySelected, setWeeklySelected] = useState<Record<number, Record<string, number>>>({
    1: {}, 2: {}, 3: {},
  });
  const [selectedAddress, setSelectedAddress] = useState("");
  const [deliveryDay, setDeliveryDay] = useState(1);

  const products = productsData?.products || [];
  const addresses = addressesData?.addresses || [];

  const subscribe = usePost("/api/subscription/subscribe", {
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success("Subscribed to free pack!");
        router.push("/my-subscriptions");
      } else toast.error(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const monthlyCount = Object.keys(selected).filter((k) => selected[k] > 0).length;
  const weeklyCountFor = (w: number) =>
    Object.keys(weeklySelected[w]).filter((k) => weeklySelected[w][k] > 0).length;
  const activeWeeklyCount = weeklyCountFor(activeWeek);

  const handleToggleMonthly = (productId: string) => {
    if (selected[productId]) {
      const copy = { ...selected };
      delete copy[productId];
      setSelected(copy);
    } else {
      if (monthlyCount >= MAX_ITEMS) {
        toast.error(`Max ${MAX_ITEMS} items allowed`);
        return;
      }
      setSelected({ ...selected, [productId]: 1 });
    }
  };

  const handleQtyMonthly = (productId: string, qty: number) => {
    if (qty <= 0) {
      const copy = { ...selected };
      delete copy[productId];
      setSelected(copy);
    } else {
      setSelected({ ...selected, [productId]: qty });
    }
  };

  const handleToggleWeekly = (productId: string) => {
    const weekCopy = { ...weeklySelected[activeWeek] };
    if (weekCopy[productId]) {
      delete weekCopy[productId];
    } else {
      if (activeWeeklyCount >= MAX_ITEMS) {
        toast.error(`Max ${MAX_ITEMS} items per week`);
        return;
      }
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
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (schedule === "weekly") {
      const weeklyItems = WEEKS.map((week) => ({
        week,
        items: Object.entries(weeklySelected[week])
          .filter(([, q]) => q > 0)
          .map(([product, quantity]) => ({ product, quantity })),
      })).filter((w) => w.items.length > 0);
      if (weeklyItems.length === 0) return toast.error("Add items to at least one week");
      if (!selectedAddress) return toast.error("Select delivery address");
      subscribe.mutate({ type: "free-custom", schedule: "weekly", weeklyItems, addressId: selectedAddress, paymentType: "COD" } as any);
    } else {
      const items = Object.entries(selected)
        .filter(([, q]) => q > 0)
        .map(([product, quantity]) => ({ product, quantity }));
      if (items.length === 0) return toast.error("Select at least 1 item");
      if (!selectedAddress) return toast.error("Select delivery address");
      subscribe.mutate({ type: "free-custom", schedule: "monthly", items, deliveryDay, addressId: selectedAddress, paymentType: "COD" } as any);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 pb-20">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-1">Free custom pack</h1>
          <p className="text-sm text-muted">
            {currency}0 / month — pick up to {MAX_ITEMS} items, delivered free
          </p>
        </div>

        {/* Schedule toggle */}
        <div className="flex border border-border rounded-lg overflow-hidden text-sm">
          <button
            onClick={() => setSchedule("monthly")}
            className={`px-5 py-2 font-medium transition-colors cursor-pointer ${
              schedule === "monthly"
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-muted/10"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSchedule("weekly")}
            className={`px-5 py-2 font-medium transition-colors border-l border-border cursor-pointer ${
              schedule === "weekly"
                ? "bg-purple-500/10 text-purple-600"
                : "text-muted hover:bg-muted/10"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* ─── Monthly progress bar ─── */}
      {schedule === "monthly" && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-[3px] bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(monthlyCount / MAX_ITEMS) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted whitespace-nowrap">
            {monthlyCount} / {MAX_ITEMS} items
          </span>
        </div>
      )}

      {/* ─── Weekly tabs ─── */}
      {schedule === "weekly" && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted border border-border rounded-lg px-3 py-2 bg-surface mb-4 w-fit">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Deliveries on the 1st, 8th, and 15th of each month
          </div>
          <div className="flex gap-2">
            {WEEKS.map((week) => {
              const count = weeklyCountFor(week);
              return (
                <button
                  key={week}
                  onClick={() => setActiveWeek(week)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    activeWeek === week
                      ? "bg-purple-500/10 text-purple-600 border-purple-300"
                      : "border-border text-muted hover:bg-muted/10"
                  }`}
                >
                  Week {week}{count > 0 ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Products grid ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-8">
        {products.map((product) => {
          if (schedule === "monthly") {
            const qty = selected[product._id] || 0;
            const isSelected = qty > 0;
            const atLimit = monthlyCount >= MAX_ITEMS && !isSelected;

            return (
              <div
                key={product._id}
                onClick={() => !atLimit && handleToggleMonthly(product._id)}
                className={`p-3 border rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : atLimit
                      ? "opacity-35 cursor-not-allowed"
                      : "border-border hover:border-border/80 hover:bg-surface"
                }`}
              >
                <p className="text-[13px] font-medium text-foreground truncate mb-0.5">
                  {product.name}
                </p>
                <p className="text-xs text-muted">{currency}{product.offerPrice}</p>

                {isSelected && (
                  <div
                    className="flex items-center gap-1.5 mt-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleQtyMonthly(product._id, qty - 1)}
                      className="w-6 h-6 border border-border rounded-md text-xs font-medium text-foreground hover:bg-muted/10 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-xs font-medium text-foreground min-w-[14px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQtyMonthly(product._id, qty + 1)}
                      className="w-6 h-6 border border-border rounded-md text-xs font-medium text-foreground hover:bg-muted/10 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
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
            <div
              key={product._id}
              onClick={() => !atLimit && handleToggleWeekly(product._id)}
              className={`p-3 border rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? "border-purple-400 bg-purple-500/5"
                  : atLimit
                    ? "opacity-35 cursor-not-allowed"
                    : "border-border hover:border-border/80 hover:bg-surface"
              }`}
            >
              <p className="text-[13px] font-medium text-foreground truncate mb-0.5">
                {product.name}
              </p>
              <p className="text-xs text-muted">{currency}{product.offerPrice}</p>

              {isSelected && (
                <div
                  className="flex items-center gap-1.5 mt-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleQtyWeekly(product._id, qty - 1)}
                    className="w-6 h-6 border border-border rounded-md text-xs font-medium text-foreground hover:bg-muted/10 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-xs font-medium text-foreground min-w-[14px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => handleQtyWeekly(product._id, qty + 1)}
                    className="w-6 h-6 border border-border rounded-md text-xs font-medium text-foreground hover:bg-muted/10 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Bottom form ─── */}
      <div className="max-w-lg space-y-4">

        {schedule === "monthly" && (
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Delivery day of month
            </label>
            <input
              type="number"
              min={1}
              max={28}
              value={deliveryDay}
              onChange={(e) => setDeliveryDay(Number(e.target.value))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              placeholder="1 – 28"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            Delivery address
          </label>
          {addresses.length > 0 ? (
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
            >
              <option value="">Select address</option>
              {addresses.map((a: any) => (
                <option key={a._id} value={a._id}>
                  {a.firstName} {a.lastName} — House {a.houseNumber}, Road {a.roadNumber}, {a.city}
                </option>
              ))}
            </select>
          ) : (
            <Link
              href="/add-address"
              className="text-xs text-primary underline underline-offset-2"
            >
              Add a new address
            </Link>
          )}
        </div>

        {/* Price summary */}
        <div className="flex items-center gap-2.5 text-sm border border-border rounded-lg px-3 py-2.5 bg-surface">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <span className="text-muted">
            You pay:{" "}
            <span className="font-medium text-success">{currency}0 / month</span>
            {" "}— this is a free plan
          </span>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={subscribe.isPending}
          className="bg-primary text-white text-sm font-medium px-8 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          {subscribe.isPending ? "Subscribing..." : "Subscribe free"}
        </button>

      </div>
    </main>
  );
}