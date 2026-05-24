"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; plan: any }>(
    ["subscription-plan", params.planId as string],
    `/api/subscription/plans/${params.planId}`
  );

  const { data: addressesData } = useGet<{ success: boolean; addresses: any[] }>(
    ["addresses"], "/api/address/get", { enabled: !!user }
  );

  const subscribe = usePost("/api/subscription/subscribe", {
    onSuccess: (data: any) => {
      if (data.success) { toast.success("Subscribed!"); router.push("/my-subscriptions"); }
      else toast.error(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const plan = data?.plan;
  const addresses = addressesData?.addresses || [];

  const handleSubscribe = async () => {
    if (!user) { setShowUserLogin(true); return; }
    subscribe.mutate({
      planId: params.planId,
      type: "plan",
      deliveryDay: 1,
      addressId: addresses[0]?._id,
      paymentType: "COD",
    } as any);
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!plan) return <p className="py-20 text-center text-gray-500">Plan not found.</p>;

  const isWeekly = plan.schedule === "weekly";

  return (
    <main className="py-8 max-w-3xl mx-auto">
      <Link href="/monthly-bazar" className="text-sm text-primary underline mb-4 inline-block">&larr; Back to plans</Link>

      <div className="border border-gray-200 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{plan.type === "free" ? "🎁" : "⭐"}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isWeekly ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {isWeekly ? "Weekly (3 deliveries/month)" : "Monthly"}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-2">{plan.name}</h1>
        <p className={`text-lg font-semibold mb-4 ${plan.price === 0 ? "text-green-600" : "text-primary"}`}>
          {plan.price === 0 ? "Free" : `${currency}${plan.price} / month`}
        </p>
        <p className="text-sm text-gray-500 mb-6">{plan.description}</p>

        {isWeekly ? (
          <div className="mb-8 space-y-6">
            <h3 className="font-medium">Weekly Breakdown:</h3>
            {(plan.weeklyItems || []).map((w: any) => (
              <div key={w.week}>
                <h4 className="text-sm font-semibold text-purple-700 mb-2">Week {w.week}</h4>
                <div className="space-y-1">
                  {(w.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-purple-50 rounded">
                      <span>{item.product?.name || "Unknown"}</span>
                      <span className="text-gray-500">x {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="font-medium mb-3">What&apos;s included:</h3>
            <div className="space-y-2">
              {(plan.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                  <span>{item.product?.name || "Unknown"}</span>
                  <span className="text-gray-500">x {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSubscribe} disabled={subscribe.isPending}
          className="w-full bg-primary text-white py-3 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
          {subscribe.isPending ? "Subscribing..." : plan.price === 0 ? "Subscribe Free" : `Subscribe — ${currency}${plan.price}/month`}
        </button>

        {!user && (
          <p className="text-xs text-gray-400 text-center mt-2">
            <button onClick={() => setShowUserLogin} className="underline cursor-pointer">Login</button> to subscribe
          </p>
        )}
      </div>
    </main>
  );
}
