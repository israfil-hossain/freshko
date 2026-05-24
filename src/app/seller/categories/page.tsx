"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import type { Category } from "@/types";
import api from "@/lib/axios";

export default function CategoriesPage() {
  const { data, isLoading, refetch } = useGet<{ success: boolean; categories: Category[] }>(
    ["categories"], "/api/category/list"
  );

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = data?.categories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const { data: res } = await api.put(`/api/category/${editId}`, { name });
        if (res.success) toast.success("Category updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post("/api/category/add", { name });
        if (res.success) toast.success("Category added");
        else toast.error(res.message);
      }
      refetch();
      setShowForm(false);
      setEditId(null);
      setName("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: res } = await api.delete(`/api/category/${id}`);
      if (res.success) { toast.success("Category deleted"); refetch(); }
      else toast.error(res.message);
      setDeleteId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat._id);
    setName(cat.name);
    setShowForm(true);
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Categories</h2>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setName(""); }}
            className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer">
            {showForm ? "Cancel" : "+ Add Category"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-md mb-6 p-4 border rounded-lg space-y-3">
            <h3 className="font-medium text-sm">{editId ? "Edit Category" : "New Category"}</h3>
            <input type="text" placeholder="Category name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" required />
            <button type="submit" disabled={saving}
              className="bg-primary text-white px-5 py-2 rounded text-sm cursor-pointer disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update" : "Create"}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-400">No categories yet</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-md">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="py-3 px-4 font-medium">#</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => (
                    <tr key={cat._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                      <td className="py-3 px-4 font-medium">{cat.name}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={() => handleEdit(cat)}
                          className="text-xs border border-primary text-primary px-3 py-1 rounded cursor-pointer">Edit</button>
                        <button onClick={() => setDeleteId(cat._id)}
                          className="text-xs border border-red-300 text-red-500 px-3 py-1 rounded cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {categories.map((cat, i) => (
                <div key={cat._id} className="border rounded-lg p-4 bg-white flex items-center justify-between">
                  <p className="font-medium text-sm">{cat.name}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cat)}
                      className="text-xs border border-primary text-primary px-3 py-1.5 rounded cursor-pointer">Edit</button>
                    <button onClick={() => setDeleteId(cat._id)}
                      className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded cursor-pointer">Delete</button>
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
              <h3 className="font-medium mb-2">Delete Category</h3>
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
