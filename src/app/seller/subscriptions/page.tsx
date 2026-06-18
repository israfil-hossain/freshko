"use client";

import { useDelete } from "@/hooks/useDelete";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { usePut } from "@/hooks/usePut";
import { useUIStore } from "@/stores/uiStore";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  ToggleLeft,
  Save,
  X,
  Inbox,
} from "lucide-react";

export default function SellerSubscriptionsPage() {
  const currency = useUIStore((s) => s.currency);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    type: "free",
    maxItems: 5,
    isActive: true,
  });

  const { data, isLoading, refetch } = useGet<{
    success: boolean;
    plans: any[];
  }>(["admin-plans"], "/api/subscription/admin/plans");

  const plans = data?.plans || [];

  const createPlan = usePost("/api/subscription/create", {
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success(d.message);
        setShowForm(false);
        resetForm();
        refetch();
      } else toast.error(d.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePlan = usePut(`/api/subscription/plan/${editId}`, {
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success(d.message);
        setShowForm(false);
        setEditId(null);
        resetForm();
        refetch();
      } else toast.error(d.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const deletePlan = useDelete("/api/subscription/plan/:id", {
    onSuccess: (d: any) => {
      if (d.success) {
        toast.success(d.message);
        refetch();
      } else toast.error(d.message);
    },
  });

  const resetForm = () =>
    setForm({
      name: "",
      description: "",
      price: "",
      type: "free",
      maxItems: 5,
      isActive: true,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    if (editId) {
      updatePlan.mutate(payload as any);
    } else {
      createPlan.mutate(payload as any);
    }
  };

  const handleEdit = (plan: any) => {
    setEditId(plan._id);
    setForm({
      name: plan.name,
      description: plan.description,
      price: String(plan.price),
      type: plan.type,
      maxItems: plan.maxItems,
      isActive: plan.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4 space-y-6">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Subscription Plans
              </h1>
              <p className="text-sm text-muted mt-0.5">
                {plans.length} plan{plans.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              resetForm();
            }}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Plan
              </>
            )}
          </button>
        </div>

        {/* ─── Form ─── */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl bg-white rounded-2xl border border-border-light p-6 space-y-4 animate-fade-in"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {editId ? (
                  <Edit className="w-4 h-4 text-primary" />
                ) : (
                  <Plus className="w-4 h-4 text-primary" />
                )}
              </div>
              <h3 className="font-semibold text-foreground">
                {editId ? "Edit Plan" : "New Plan"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Plan Name
                </label>
                <input
                  placeholder="e.g. Premium Plan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Describe what this plan includes..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none resize-none"
                required
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Price (0 for free)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full border border-border rounded-xl pl-9 pr-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Max Items
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={form.maxItems}
                    onChange={(e) =>
                      setForm({ ...form, maxItems: Number(e.target.value) })
                    }
                    className="w-full border border-border rounded-xl pl-9 pr-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl">
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, isActive: !form.isActive })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  form.isActive ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform mt-0.5 ${
                    form.isActive ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {form.isActive ? "Active" : "Inactive"}
                </p>
                <p className="text-xs text-muted">
                  {form.isActive
                    ? "Plan is visible to customers"
                    : "Plan is hidden from customers"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={createPlan.isPending || updatePlan.isPending}
                className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {createPlan.isPending || updatePlan.isPending
                  ? "Saving..."
                  : editId
                    ? "Update Plan"
                    : "Create Plan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  resetForm();
                }}
                className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ─── Loading ─── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted mt-3 animate-pulse">
              Loading plans...
            </p>
          </div>
        ) : plans.length === 0 ? (
          /* ─── Empty State ─── */
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <Inbox className="w-8 h-8 text-muted" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No plans yet
            </h3>
            <p className="text-sm text-muted max-w-xs mx-auto">
              Create your first subscription plan to start offering recurring
              services to your customers.
            </p>
          </div>
        ) : (
          <>
            {/* ─── Desktop Table ─── */}
            <div className="hidden md:block bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden animate-fade-in-up">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border-light bg-surface-hover/50">
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">
                      Price
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">
                      Max Items
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan: any, i: number) => (
                    <tr
                      key={plan._id}
                      className="border-b border-border-light/60 hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <CalendarCheck className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {plan.name}
                            </p>
                            {plan.description && (
                              <p className="text-xs text-muted truncate max-w-[200px]">
                                {plan.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="capitalize text-foreground">
                          {plan.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-foreground">
                        {plan.price === 0
                          ? "Free"
                          : `${currency}${plan.price}`}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-hover text-xs font-medium text-muted">
                          {plan.maxItems || 5} items
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                            plan.isActive
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="text-xs border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deletePlan.mutate({ id: plan._id } as any)
                            }
                            className="text-xs border border-danger/30 text-danger px-3 py-1.5 rounded-lg hover:bg-danger/5 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── Mobile Cards ─── */}
            <div className="md:hidden space-y-3">
              {plans.map((plan: any) => (
                <div
                  key={plan._id}
                  className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all card-hover"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground truncate">
                          {plan.name}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium shrink-0 ${
                            plan.isActive
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-muted truncate mt-0.5">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-surface-hover rounded-xl p-2.5 text-center">
                      <DollarSign className="w-3.5 h-3.5 text-muted mx-auto mb-1" />
                      <p className="text-sm font-semibold text-foreground">
                        {plan.price === 0
                          ? "Free"
                          : `${currency}${plan.price}`}
                      </p>
                      <p className="text-[10px] text-muted">Price</p>
                    </div>
                    <div className="bg-surface-hover rounded-xl p-2.5 text-center">
                      <Package className="w-3.5 h-3.5 text-muted mx-auto mb-1" />
                      <p className="text-sm font-semibold text-foreground">
                        {plan.maxItems || 5}
                      </p>
                      <p className="text-[10px] text-muted">Max Items</p>
                    </div>
                    <div className="bg-surface-hover rounded-xl p-2.5 text-center">
                      <ToggleLeft className="w-3.5 h-3.5 text-muted mx-auto mb-1" />
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {plan.type}
                      </p>
                      <p className="text-[10px] text-muted">Type</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-xs border border-primary/30 text-primary px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-primary/5 transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        deletePlan.mutate({ id: plan._id } as any)
                      }
                      className="text-xs border border-danger/30 text-danger px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-danger/5 transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
