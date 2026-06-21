"use client";

import { useGet } from "@/hooks/useGet";
import api from "@/lib/axios";
import type { Category, Subcategory } from "@/types";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const { data, isLoading, refetch } = useGet<{
    success: boolean;
    categories: Category[];
  }>(["categories"], "/api/category/list");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [subForm, setSubForm] = useState<{
    categoryId: string; name: string; image: File | null; preview: string;
  } | null>(null);
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
        const { data: res } = await api.put(`/api/category/${editId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        if (res.success) toast.success("Category updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post("/api/category/add", formData, { headers: { "Content-Type": "multipart/form-data" } });
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
        const { data: res } = await api.put(`/api/category/${subForm.categoryId}/subcategory/${editSubId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        if (res.success) toast.success("Subcategory updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post(`/api/category/${subForm.categoryId}/subcategory`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        if (res.success) toast.success("Subcategory added");
        else toast.error(res.message);
      }
      refetch();
      setSubForm(null);
      setEditSubId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSavingSub(false);
    }
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
      <div className="md:p-8 p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Categories</h2>
            <p className="text-sm text-muted mt-0.5">{categories.length} categories</p>
          </div>
          <button onClick={() => {
            setShowForm(!showForm); setEditId(null); setName(""); setImage(null); setImagePreview("");
          }}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {showForm ? "Cancel" : "Add Category"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-md mb-6 p-5 bg-white rounded-2xl border border-border-light space-y-3 animate-fade-in">
            <h3 className="font-semibold text-foreground">{editId ? "Edit Category" : "New Category"}</h3>
            <input type="text" placeholder="Category name" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover transition-all" />
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-border-light" />
                </div>
              )}
            </div>
            <button type="submit" disabled={saving}
              className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
              {saving ? "Saving..." : editId ? "Update" : "Create"}
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No categories yet</h3>
            <p className="text-sm text-muted">Create your first category to organize products</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-border-light shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider w-8"></th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">#</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Image</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Name</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Subcategories</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => (
                    <Fragment key={cat._id || cat.name}>
                      <tr className="border-b border-border-light/60 hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3 px-4">
                          <button onClick={() => setExpandedCategory(expandedCategory === cat._id ? null : cat._id)}
                            className="w-7 h-7 rounded-lg bg-surface-hover flex items-center justify-center text-muted hover:text-foreground hover:bg-border-light transition-all cursor-pointer">
                            {expandedCategory === cat._id ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-muted">{i + 1}</td>
                        <td className="py-3 px-4">
                          {cat.image && (
                            <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-xl border border-border-light" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{cat.name}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-hover text-xs font-medium text-muted">
                            {cat.subcategories?.length ?? 0} subcategories
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-1.5">
                          <button onClick={() => handleEdit(cat)}
                            className="text-xs border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all cursor-pointer">Edit</button>
                          <button onClick={() => setDeleteId(cat._id)}
                            className="text-xs border border-danger/30 text-danger px-3 py-1.5 rounded-lg hover:bg-danger/5 transition-all cursor-pointer">Delete</button>
                        </td>
                      </tr>
                      {expandedCategory === cat._id && (
                        <tr key={`${cat._id}-subs`}>
                          <td colSpan={6} className="bg-surface-hover/30 px-6 py-4">
                            <div className="pl-6 space-y-2">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Subcategories</span>
                                <button onClick={() => openSubForm(cat._id)}
                                  className="text-xs gradient-primary text-white px-3 py-1.5 rounded-lg cursor-pointer btn-press">+ Add</button>
                              </div>
                              {subForm && subForm.categoryId === cat._id && (
                                <form onSubmit={handleSubSubmit} className="flex items-center gap-2 mb-3 bg-white p-3 rounded-xl border border-border-light animate-fade-in">
                                  <input type="text" placeholder="Subcategory name" value={subForm.name}
                                    onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                                    className="border border-border rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-primary transition-all bg-surface-hover" required />
                                  <input type="file" accept="image/*" onChange={handleSubImageChange} className="text-xs w-28" />
                                  {subForm.preview && (
                                    <img src={subForm.preview} alt="" className="w-8 h-8 object-cover rounded-lg border border-border-light" />
                                  )}
                                  <button type="submit" disabled={savingSub}
                                    className="gradient-primary text-white px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 btn-press">
                                    {savingSub ? "..." : editSubId ? "Update" : "Add"}
                                  </button>
                                  <button type="button" onClick={() => { setSubForm(null); setEditSubId(null); }}
                                    className="text-xs text-muted px-2 py-2 cursor-pointer hover:text-foreground transition-colors">Cancel</button>
                                </form>
                              )}
                              {!cat.subcategories || cat.subcategories.length === 0 ? (
                                <p className="text-xs text-muted italic py-2">No subcategories</p>
                              ) : (
                                cat.subcategories.map((sub) => (
                                  <div key={sub._id} className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-border-light text-xs hover:shadow-sm transition-all">
                                    {sub.image && (
                                      <img src={sub.image} alt={sub.name} className="w-8 h-8 object-cover rounded-lg" />
                                    )}
                                    <span className="flex-1 font-medium text-foreground">{sub.name}</span>
                                    <button onClick={() => openSubForm(cat._id, sub)}
                                      className="text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors">Edit</button>
                                    <button onClick={() => handleDeleteSub(cat._id, sub._id)}
                                      className="text-danger hover:text-danger/80 font-medium cursor-pointer transition-colors">Delete</button>
                                  </div>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    {cat.image && (
                      <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-xl border border-border-light" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{cat.name}</p>
                      <span className="text-xs text-muted">{cat.subcategories?.length ?? 0} subcategories</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => handleEdit(cat)}
                      className="text-xs border border-primary/30 text-primary px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-primary/5 transition-all">Edit</button>
                    <button onClick={() => setDeleteId(cat._id)}
                      className="text-xs border border-danger/30 text-danger px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-danger/5 transition-all">Delete</button>
                  </div>
                  <button onClick={() => setExpandedCategory(expandedCategory === cat._id ? null : cat._id)}
                    className="text-xs text-muted hover:text-foreground cursor-pointer transition-colors font-medium">
                    {expandedCategory === cat._id ? "Hide subcategories" : `${cat.subcategories?.length ?? 0} subcategories`}
                  </button>
                  {expandedCategory === cat._id && (
                    <div className="mt-3 pl-4 space-y-2 border-l-2 border-border-light">
                      {subForm && subForm.categoryId === cat._id && (
                        <form onSubmit={handleSubSubmit} className="flex items-center gap-2 mb-2">
                          <input type="text" placeholder="Name" value={subForm.name}
                            onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                            className="border border-border rounded-lg px-3 py-2 text-xs flex-1 outline-none" required />
                          <button type="submit" disabled={savingSub}
                            className="gradient-primary text-white px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer btn-press">
                            {savingSub ? "..." : editSubId ? "Upd" : "Add"}
                          </button>
                        </form>
                      )}
                      {cat.subcategories?.map((sub) => (
                        <div key={sub._id} className="flex items-center gap-2 text-xs py-1.5">
                          {sub.image && <img src={sub.image} alt="" className="w-6 h-6 object-cover rounded-lg" />}
                          <span className="flex-1 font-medium text-foreground">{sub.name}</span>
                          <button onClick={() => openSubForm(cat._id, sub)} className="text-primary cursor-pointer font-medium">Edit</button>
                          <button onClick={() => handleDeleteSub(cat._id, sub._id)} className="text-danger cursor-pointer font-medium">Del</button>
                        </div>
                      ))}
                      <button onClick={() => openSubForm(cat._id)} className="text-xs text-primary mt-1 cursor-pointer font-medium">+ Add Subcategory</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="font-bold text-foreground">Delete Category</h3>
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
