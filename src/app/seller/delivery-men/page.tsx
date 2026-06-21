"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import type { DeliveryMan } from "@/types";
import api from "@/lib/axios";

export default function DeliveryMenPage() {
  const { data, isLoading, refetch } = useGet<{ success: boolean; deliveryMen: DeliveryMan[] }>(
    ["delivery-men"], "/api/delivery-man/list"
  );

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const deliveryMen = data?.deliveryMen || [];

  const resetForm = () => setForm({ name: "", email: "", password: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const payload: any = { name: form.name, email: form.email, phone: form.phone };
        if (form.password) payload.password = form.password;
        const { data: res } = await api.put(`/api/delivery-man/${editId}`, payload);
        if (res.success) toast.success("Delivery man updated");
        else toast.error(res.message);
      } else {
        if (!form.password) { toast.error("Password is required"); setSaving(false); return; }
        const { data: res } = await api.post("/api/delivery-man/add", form);
        if (res.success) toast.success("Delivery man added");
        else toast.error(res.message);
      }
      refetch();
      setShowForm(false);
      setEditId(null);
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dm: DeliveryMan) => {
    setEditId(dm._id);
    setForm({ name: dm.name, email: dm.email, password: "", phone: dm.phone || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: res } = await api.delete(`/api/delivery-man/${id}`);
      if (res.success) { toast.success("Delivery man deleted"); refetch(); }
      else toast.error(res.message);
      setDeleteId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const toggleActive = async (dm: DeliveryMan) => {
    try {
      const { data: res } = await api.put(`/api/delivery-man/${dm._id}`, { isActive: !dm.isActive });
      if (res.success) { toast.success(res.message); refetch(); }
      else toast.error(res.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Delivery Men</h2>
            <p className="text-sm text-muted mt-0.5">{deliveryMen.length} riders</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); }}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {showForm ? "Cancel" : "Add Rider"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-md mb-6 p-5 bg-white rounded-2xl border border-border-light space-y-3 animate-fade-in">
            <h3 className="font-semibold text-foreground">{editId ? "Edit Delivery Man" : "New Delivery Man"}</h3>
            <input type="text" placeholder="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
            <input type="text" placeholder="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
            <input type="password" placeholder={editId ? "New password (leave blank to keep)" : "Password"} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none"
              required={!editId} />
            <button type="submit" disabled={saving}
              className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
              {saving ? "Saving..." : editId ? "Update" : "Create"}
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
          </div>
        ) : deliveryMen.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No delivery men yet</h3>
            <p className="text-sm text-muted">Add your first rider to start deliveries</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-5xl bg-white rounded-2xl border border-border-light shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">#</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Name</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Email</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Phone</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Deliveries</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Earnings</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryMen.map((dm, i) => (
                    <tr key={dm._id} className="border-b border-border-light/60 hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-4 text-muted">{i + 1}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{dm.name}</td>
                      <td className="py-3 px-4 text-muted">{dm.email}</td>
                      <td className="py-3 px-4 text-foreground">{dm.phone || "—"}</td>
                      <td className="py-3 px-4 text-foreground">{dm.totalDeliveries || 0}</td>
                      <td className="py-3 px-4 font-medium text-foreground">${dm.totalEarnings || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${dm.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                          {dm.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-1.5">
                        <button onClick={() => handleEdit(dm)}
                          className="text-xs border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all cursor-pointer">Edit</button>
                        <button onClick={() => toggleActive(dm)}
                          className="text-xs border border-yellow-400/50 text-yellow-600 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-all cursor-pointer">
                          {dm.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteId(dm._id)}
                          className="text-xs border border-danger/30 text-danger px-3 py-1.5 rounded-lg hover:bg-danger/5 transition-all cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {deliveryMen.map((dm) => (
                <div key={dm._id} className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold">
                        {dm.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{dm.name}</p>
                        <p className="text-xs text-muted">{dm.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${dm.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {dm.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3 bg-surface-hover rounded-xl p-3">
                    <div className="text-center">
                      <p className="text-muted">Phone</p>
                      <p className="font-medium text-foreground mt-0.5">{dm.phone || "—"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted">Deliveries</p>
                      <p className="font-medium text-foreground mt-0.5">{dm.totalDeliveries || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted">Earnings</p>
                      <p className="font-medium text-foreground mt-0.5">${dm.totalEarnings || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(dm)}
                      className="text-xs border border-primary/30 text-primary px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-primary/5 transition-all font-medium">Edit</button>
                    <button onClick={() => toggleActive(dm)}
                      className="text-xs border border-yellow-400/50 text-yellow-600 px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-yellow-50 transition-all font-medium">
                      {dm.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => setDeleteId(dm._id)}
                      className="text-xs border border-danger/30 text-danger px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-danger/5 transition-all font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete confirmation */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="font-bold text-foreground">Delete Delivery Man</h3>
                <p className="text-sm text-muted mt-1">Are you sure? This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-danger/90 transition-all btn-press cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
