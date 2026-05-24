"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

export default function MySubscriptionsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const currency = useUIStore((s) => s.currency);

  const { data, refetch } = useGet<{ success: boolean; subscriptions: any[] }>(
    ["my-subscriptions"],
    "/api/subscription/my",
    { enabled: !!user }
  );

  const updateStatus = usePost(
    "/api/subscription/:id/status",
    {
      onSuccess: (data: any) => {
        if (data.success) {
          toast.success(`Subscription ${data.message}`);
          refetch();
        }
      },
    }
  );

  useEffect(() => {
    if (!isLoading && !user) router.push("/");
  }, [user, isLoading, router]);

  const subs = data?.subscriptions || [];

  return (
    <main className="py-8">
      <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>

      {subs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No subscriptions yet.</p>
          <Link href="/monthly-bazar" className="text-primary underline">Browse Monthly Plans</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subs.map((sub) => (
            <div key={sub._id} className="border border-gray-200 rounded-lg p-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sub.status === "active" ? "bg-green-100 text-green-700" :
                      sub.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>{sub.status}</span>
                    {sub.schedule === "weekly" && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Weekly</span>
                    )}
                    {sub.isFree && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Free</span>}
                    <span className="text-xs text-gray-400 capitalize">{sub.type.replace("-", " ")}</span>
                  </div>

                  {sub.schedule === "weekly" ? (
                    <div className="space-y-3">
                      {(sub.weeklyItems || []).map((w: any) => (
                        <div key={w.week}>
                          <p className="text-xs font-semibold text-purple-700 mb-1">Week {w.week}</p>
                          <div className="space-y-1">
                            {(w.items || []).map((item: any, i: number) => (
                              <p key={i} className="text-sm">
                                {item.product?.name || "Unknown"} <span className="text-primary">x {item.quantity}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      {sub.items?.map((item: any, i: number) => (
                        <p key={i}>
                          {item.product?.name || "Unknown"} <span className="text-primary">x {item.quantity}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Next delivery: {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{sub.isFree ? "Free" : `${currency}${sub.price}/mo`}</p>
                  <p className="text-xs text-gray-400">{sub.paymentType}</p>
                  {sub.schedule === "weekly" ? (
                    <p className="text-xs text-gray-400">Deliveries on 1st, 8th, 15th</p>
                  ) : (
                    <p className="text-xs text-gray-400">Day {sub.deliveryDay} of month</p>
                  )}

                  <div className="flex gap-2 mt-3 justify-end">
                    {sub.status === "active" && (
                      <>
                        <Link
                          href={`/monthly-bazar/edit/${sub._id}`}
                          className="text-xs border px-3 py-1 rounded cursor-pointer inline-block"
                        >
                          Edit Items
                        </Link>
                        <button
                          onClick={() => updateStatus.mutate({ id: sub._id, status: "paused" } as any)}
                          className="text-xs border px-3 py-1 rounded cursor-pointer"
                        >
                          Pause
                        </button>
                      </>
                    )}
                    {sub.status === "paused" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: sub._id, status: "active" } as any)}
                        className="text-xs border border-primary text-primary px-3 py-1 rounded cursor-pointer"
                      >
                        Resume
                      </button>
                    )}
                    {sub.status !== "cancelled" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: sub._id, status: "cancelled" } as any)}
                        className="text-xs border border-red-300 text-red-500 px-3 py-1 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
