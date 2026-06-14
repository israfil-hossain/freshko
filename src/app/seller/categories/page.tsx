"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import type { Category, Subcategory } from "@/types";
import api from "@/lib/axios";

export default function CategoriesPage() {
  const { data, isLoading, refetch } = useGet<{ success: boolean; categories: Category[] }>(
    ["categories"], "/api/category/list"
  );

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [subForm, setSubForm] = useState<{ categoryId: string; name: string; image: File | null; preview: string } | null>(null);
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [savingSub, setSavingSub] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && subForm) {
      setSubForm({ ...subForm, image: file, preview: URL.createObjectURL(file) });
    }
  };

  const categories = data?.categories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Category name is required"); return; }
    if (!editId && !image) { toast.error("Image is required for new categories"); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      if (editId) {
        const { data: res } = await api.put(`/api/category/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Category updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post("/api/category/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Category added");
        else toast.error(res.message);
      }
      refetch();
      setShowForm(false);
      setEditId(null);
      setName("");
      setImage(null);
      setImagePreview("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
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
    setImagePreview(cat.image || "");
    setImage(null);
    setShowForm(true);
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm || !subForm.name.trim()) { toast.error("Subcategory name is required"); return; }

    setSavingSub(true);
    try {
      const formData = new FormData();
      formData.append("name", subForm.name);
      if (subForm.image) formData.append("image", subForm.image);

      if (editSubId) {
        const { data: res } = await api.put(`/api/category/${subForm.categoryId}/subcategory/${editSubId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Subcategory updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post(`/api/category/${subForm.categoryId}/subcategory`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Subcategory added");
        else toast.error(res.message);
      }
      refetch();
      setSubForm(null);
      setEditSubId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSavingSub(false); }
  };

  const handleDeleteSub = async (categoryId: string, subId: string) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      const { data: res } = await api.delete(`/api/category/${categoryId}/subcategory/${subId}`);
      if (res.success) { toast.success("Subcategory deleted"); refetch(); }
      else toast.error(res.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const openSubForm = (categoryId: string, sub?: Subcategory) => {
    if (sub) {
      setEditSubId(sub._id);
      setSubForm({ categoryId, name: sub.name, image: null, preview: sub.image || "" });
    } else {
      setEditSubId(null);
      setSubForm({ categoryId, name: "", image: null, preview: "" });
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Categories</h2>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setName(""); setImage(null); setImagePreview(""); }}
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
            <div>
              <label className="block text-sm font-medium mb-2">Category Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                </div>
              )}
            </div>
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
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="py-3 px-4 font-medium w-8"></th>
                    <th className="py-3 px-4 font-medium">#</th>
                    <th className="py-3 px-4 font-medium">Image</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Subcategories</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => (
                    <>
                      <tr key={cat._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <button onClick={() => setExpandedCategory(expandedCategory === cat._id ? null : cat._id)}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer text-lg">
                            {expandedCategory === cat._id ? "−" : "+"}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                        <td className="py-3 px-4">
                          {cat.image && (
                            <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded border" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">{cat.name}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {cat.subcategories?.length ?? 0} subcategories
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <button onClick={() => handleEdit(cat)}
                            className="text-xs border border-primary text-primary px-3 py-1 rounded cursor-pointer">Edit</button>
                          <button onClick={() => setDeleteId(cat._id)}
                            className="text-xs border border-red-300 text-red-500 px-3 py-1 rounded cursor-pointer">Delete</button>
                        </td>
                      </tr>
                      {expandedCategory === cat._id && (
                        <tr key={`${cat._id}-subs`}>
                          <td colSpan={6} className="bg-gray-50 px-4 py-3">
                            <div className="pl-6 space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-500 uppercase">Subcategories</span>
                                <button onClick={() => { openSubForm(cat._id); }}
                                  className="text-xs bg-primary text-white px-3 py-1 rounded cursor-pointer">
                                  + Add Subcategory
                                </button>
                              </div>
                              {subForm && subForm.categoryId === cat._id && (
                                <form onSubmit={handleSubSubmit} className="flex items-center gap-2 mb-2 bg-white p-2 rounded border">
                                  <input type="text" placeholder="Subcategory name" value={subForm.name}
                                    onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                                    className="border rounded px-2 py-1 text-xs flex-1 outline-none" required />
                                  <input type="file" accept="image/*" onChange={handleSubImageChange}
                                    className="text-xs w-28" />
                                  {subForm.preview && (
                                    <img src={subForm.preview} alt="" className="w-8 h-8 object-cover rounded" />
                                  )}
                                  <button type="submit" disabled={savingSub}
                                    className="bg-primary text-white px-3 py-1 rounded text-xs cursor-pointer disabled:opacity-50">
                                    {savingSub ? "..." : editSubId ? "Update" : "Add"}
                                  </button>
                                  <button type="button" onClick={() => { setSubForm(null); setEditSubId(null); }}
                                    className="text-xs text-gray-500 px-2 py-1 cursor-pointer">Cancel</button>
                                </form>
                              )}
                              {(!cat.subcategories || cat.subcategories.length === 0) ? (
                                <p className="text-xs text-gray-400 italic">No subcategories</p>
                              ) : (
                                cat.subcategories.map((sub) => (
                                  <div key={sub._id} className="flex items-center gap-2 bg-white px-3 py-2 rounded border text-xs">
                                    {sub.image && (
                                      <img src={sub.image} alt={sub.name} className="w-8 h-8 object-cover rounded" />
                                    )}
                                    <span className="flex-1">{sub.name}</span>
                                    <button onClick={() => openSubForm(cat._id, sub)}
                                      className="text-primary hover:underline cursor-pointer">Edit</button>
                                    <button onClick={() => handleDeleteSub(cat._id, sub._id)}
                                      className="text-red-500 hover:underline cursor-pointer">Delete</button>
                                  </div>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {categories.map((cat, i) => (
                <div key={cat._id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    {cat.image && (
                      <img src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded border" />
                    )}
                    <p className="font-medium text-sm flex-1">{cat.name}</p>
                    <span className="text-xs text-gray-400">{cat.subcategories?.length ?? 0} subs</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => handleEdit(cat)}
                      className="text-xs border border-primary text-primary px-3 py-1.5 rounded cursor-pointer flex-1">Edit</button>
                    <button onClick={() => setDeleteId(cat._id)}
                      className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded cursor-pointer flex-1">Delete</button>
                  </div>
                  <button onClick={() => setExpandedCategory(expandedCategory === cat._id ? null : cat._id)}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                    {expandedCategory === cat._id ? "− Hide subcategories" : `+ ${cat.subcategories?.length ?? 0} subcategories`}
                  </button>
                  {expandedCategory === cat._id && (
                    <div className="mt-2 pl-4 space-y-1 border-l-2 border-gray-200">
                      {subForm && subForm.categoryId === cat._id && (
                        <form onSubmit={handleSubSubmit} className="flex items-center gap-2 mb-2">
                          <input type="text" placeholder="Name" value={subForm.name}
                            onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                            className="border rounded px-2 py-1 text-xs flex-1 outline-none" required />
                          <button type="submit" disabled={savingSub}
                            className="bg-primary text-white px-2 py-1 rounded text-xs cursor-pointer">
                            {savingSub ? "..." : editSubId ? "Upd" : "Add"}
                          </button>
                        </form>
                      )}
                      {cat.subcategories?.map((sub) => (
                        <div key={sub._id} className="flex items-center gap-2 text-xs py-1">
                          {sub.image && <img src={sub.image} alt="" className="w-6 h-6 object-cover rounded" />}
                          <span className="flex-1">{sub.name}</span>
                          <button onClick={() => openSubForm(cat._id, sub)}
                            className="text-primary cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteSub(cat._id, sub._id)}
                            className="text-red-500 cursor-pointer">Del</button>
                        </div>
                      ))}
                      <button onClick={() => { openSubForm(cat._id); }}
                        className="text-xs text-primary mt-1 cursor-pointer">+ Add Subcategory</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

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