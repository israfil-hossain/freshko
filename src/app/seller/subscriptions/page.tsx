"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { usePut } from "@/hooks/usePut";
import { useDelete } from "@/hooks/useDelete";
import { useUIStore } from "@/stores/uiStore";

export default function SellerSubscriptionsPage() {
  const currency = useUIStore((s) => s.currency);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", type: "free", maxItems: 5, isActive: true,
  });

  const { data, isLoading, refetch } = useGet<{ success: boolean; plans: any[] }>(
    ["admin-plans"],
    "/api/subscription/admin/plans"
  );

  const plans = data?.plans || [];

  const createPlan = usePost("/api/subscription/plans", {
    onSuccess: (d: any) => {
      if (d.success) { toast.success(d.message); setShowForm(false); resetForm(); refetch(); }
      else toast.error(d.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePlan = usePut("/api/subscription/plans/:id", {
    onSuccess: (d: any) => {
      if (d.success) { toast.success(d.message); setShowForm(false); setEditId(null); resetForm(); refetch(); }
      else toast.error(d.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const deletePlan = useDelete("/api/subscription/plans/:id", {
    onSuccess: (d: any) => {
      if (d.success) { toast.success(d.message); refetch(); }
      else toast.error(d.message);
    },
  });

  const resetForm = () => setForm({ name: "", description: "", price: "", type: "free", maxItems: 5, isActive: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    if (editId) {
      updatePlan.mutate({ ...payload, id: editId } as any);
    } else {
      createPlan.mutate(payload as any);
    }
  };

  const handleEdit = (plan: any) => {
    setEditId(plan._id);
    setForm({
      name: plan.name, description: plan.description,
      price: String(plan.price), type: plan.type,
      maxItems: plan.maxItems, isActive: plan.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Subscription Plans</h2>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); }}
            className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer">
            {showForm ? "Cancel" : "Add Plan"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-lg mb-8 p-6 border rounded-lg space-y-4">
            <h3 className="font-medium">{editId ? "Edit Plan" : "New Plan"}</h3>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm outline-none" required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm outline-none" required rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Price (0 for free)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm outline-none" required />
              </div>
              <div>
                <label className="text-xs text-gray-500">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm outline-none">
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded text-sm cursor-pointer">
              {editId ? "Update" : "Create"}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto max-w-5xl">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Items</th>
                  <th className="py-3 px-4 font-medium">Active</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{plan.name}</td>
                    <td className="py-3 px-4 capitalize">{plan.type}</td>
                    <td className="py-3 px-4">{plan.price === 0 ? "Free" : `${currency}${plan.price}`}</td>
                    <td className="py-3 px-4">{plan.items?.length || 0}</td>
                    <td className="py-3 px-4">{plan.isActive ? "✅" : "❌"}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={() => handleEdit(plan)} className="text-xs border px-3 py-1 rounded cursor-pointer">Edit</button>
                      <button onClick={() => deletePlan.mutate({ id: plan._id } as any)} className="text-xs border border-red-300 text-red-500 px-3 py-1 rounded cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-gray-400">No plans yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


