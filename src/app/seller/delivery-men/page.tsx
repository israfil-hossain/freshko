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
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Delivery Men</h2>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); }}
            className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer">
            {showForm ? "Cancel" : "+ Add Delivery Man"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-md mb-6 p-4 border rounded-lg space-y-3">
            <h3 className="font-medium text-sm">{editId ? "Edit Delivery Man" : "New Delivery Man"}</h3>
            <input type="text" placeholder="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" required />
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" required />
            <input type="text" placeholder="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
            <input type="password" placeholder={editId ? "New password (leave blank to keep)" : "Password"} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary"
              required={!editId} />
            <button type="submit" disabled={saving}
              className="bg-primary text-white px-5 py-2 rounded text-sm cursor-pointer disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update" : "Create"}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : deliveryMen.length === 0 ? (
          <p className="text-gray-400">No delivery men yet</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-5xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="py-3 px-4 font-medium">#</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Phone</th>
                    <th className="py-3 px-4 font-medium">Deliveries</th>
                    <th className="py-3 px-4 font-medium">Earnings</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryMen.map((dm, i) => (
                    <tr key={dm._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                      <td className="py-3 px-4 font-medium">{dm.name}</td>
                      <td className="py-3 px-4 text-gray-600">{dm.email}</td>
                      <td className="py-3 px-4">{dm.phone || "—"}</td>
                      <td className="py-3 px-4">{dm.totalDeliveries || 0}</td>
                      <td className="py-3 px-4">${dm.totalEarnings || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${dm.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {dm.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={() => handleEdit(dm)}
                          className="text-xs border border-primary text-primary px-2 py-1 rounded cursor-pointer">Edit</button>
                        <button onClick={() => toggleActive(dm)}
                          className="text-xs border border-yellow-400 text-yellow-600 px-2 py-1 rounded cursor-pointer">
                          {dm.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteId(dm._id)}
                          className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {deliveryMen.map((dm, i) => (
                <div key={dm._id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{dm.name}</p>
                      <p className="text-xs text-gray-500">{dm.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${dm.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {dm.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <span>Phone: {dm.phone || "—"}</span>
                    <span>Deliveries: {dm.totalDeliveries || 0}</span>
                    <span>Earnings: ${dm.totalEarnings || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(dm)}
                      className="text-xs border border-primary text-primary px-3 py-1.5 rounded cursor-pointer flex-1">Edit</button>
                    <button onClick={() => toggleActive(dm)}
                      className="text-xs border border-yellow-400 text-yellow-600 px-3 py-1.5 rounded cursor-pointer flex-1">
                      {dm.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => setDeleteId(dm._id)}
                      className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded cursor-pointer flex-1">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete confirmation */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-medium mb-2">Delete Delivery Man</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded text-sm cursor-pointer">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-500 text-white rounded text-sm cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
