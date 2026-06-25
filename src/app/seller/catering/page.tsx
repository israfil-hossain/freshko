"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useGet } from "@/hooks/useGet";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, Upload, X, UtensilsCrossed, ChefHat } from "lucide-react";

interface Service {
  id: string;
  title: string;
  tag: string;
  description: string;
  fullDescription: string;
  image: string;
}

interface Menu {
  id: string;
  title: string;
  description: string;
  price: string;
  per: string;
  image: string;
}

interface CateringData {
  success: boolean;
  services: Service[];
  menus: Menu[];
}

export default function CateringPage() {
  const { data, isLoading, refetch } = useGet<CateringData>(
    ["catering-content"],
    "/api/catering/content"
  );

  const [activeTab, setActiveTab] = useState<"services" | "menus">("services");
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"service" | "menu" | null>(null);
  const [editItem, setEditItem] = useState<Service | Menu | null>(null);
  const [saving, setSaving] = useState(false);

  // Service form
  const [sTitle, setSTitle] = useState("");
  const [sTag, setSTag] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sFullDesc, setSFullDesc] = useState("");
  const [sImageFile, setSImageFile] = useState<File | null>(null);
  const [sImagePreview, setSImagePreview] = useState("");

  // Menu form
  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mPrice, setMPrice] = useState("");
  const [mPer, setMPer] = useState("head");
  const [mImageFile, setMImageFile] = useState<File | null>(null);
  const [mImagePreview, setMImagePreview] = useState("");

  const services = data?.services || [];
  const menus = data?.menus || [];

  const resetServiceForm = () => {
    setSTitle(""); setSTag(""); setSDesc(""); setSFullDesc("");
    setSImageFile(null); setSImagePreview(""); setEditItem(null);
  };

  const resetMenuForm = () => {
    setMTitle(""); setMDesc(""); setMPrice(""); setMPer("head");
    setMImageFile(null); setMImagePreview(""); setEditItem(null);
  };

  const handleEditService = (s: Service) => {
    setEditItem(s);
    setSTitle(s.title); setSTag(s.tag); setSDesc(s.description); setSFullDesc(s.fullDescription);
    setSImagePreview(s.image); setSImageFile(null); setShowForm(true);
  };

  const handleEditMenu = (m: Menu) => {
    setEditItem(m);
    setMTitle(m.title); setMDesc(m.description); setMPrice(m.price); setMPer(m.per);
    setMImagePreview(m.image); setMImageFile(null); setShowForm(true);
  };

  const handleServiceImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSImageFile(file); setSImagePreview(URL.createObjectURL(file)); }
  };

  const handleMenuImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setMImageFile(file); setMImagePreview(URL.createObjectURL(file)); }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sTitle.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", sTitle);
      fd.append("tag", sTag);
      fd.append("description", sDesc);
      fd.append("fullDescription", sFullDesc);
      if (sImageFile) fd.append("image", sImageFile);

      if (editItem && "tag" in editItem) {
        const { data: res } = await api.put(`/api/catering/services/${editItem.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Service updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post("/api/catering/services", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Service added");
        else toast.error(res.message);
      }
      refetch(); setShowForm(false); resetServiceForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", mTitle);
      fd.append("description", mDesc);
      fd.append("price", mPrice);
      fd.append("per", mPer);
      if (mImageFile) fd.append("image", mImageFile);

      if (editItem && "per" in editItem) {
        const { data: res } = await api.put(`/api/catering/menus/${editItem.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Menu updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post("/api/catering/menus", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Menu added");
        else toast.error(res.message);
      }
      refetch(); setShowForm(false); resetMenuForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      const url = deleteType === "service"
        ? `/api/catering/services/${deleteId}`
        : `/api/catering/menus/${deleteId}`;
      const { data: res } = await api.delete(url);
      if (res.success) { toast.success("Deleted"); refetch(); }
      else toast.error(res.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
    setDeleteId(null); setDeleteType(null);
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Catering</h2>
              <p className="text-sm text-muted mt-0.5">{services.length} services · {menus.length} menus</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); activeTab === "services" ? resetServiceForm() : resetMenuForm(); }}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : activeTab === "services" ? "Add Service" : "Add Menu"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => { setActiveTab("services"); setShowForm(false); resetServiceForm(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "services" ? "bg-primary text-white shadow-md" : "bg-surface-hover text-muted hover:bg-surface"}`}>
            <UtensilsCrossed className="w-4 h-4" /> Services
          </button>
          <button onClick={() => { setActiveTab("menus"); setShowForm(false); resetMenuForm(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "menus" ? "bg-primary text-white shadow-md" : "bg-surface-hover text-muted hover:bg-surface"}`}>
            <ChefHat className="w-4 h-4" /> Menus
          </button>
        </div>

        {/* Service Form */}
        {showForm && activeTab === "services" && (
          <form onSubmit={handleServiceSubmit} className="bg-white rounded-2xl border border-border-light p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{editItem && "tag" in editItem ? "Edit Service" : "New Service"}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                <input type="text" value={sTitle} onChange={(e) => setSTitle(e.target.value)}
                  placeholder="e.g. Weddings & Receptions"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tag</label>
                <input type="text" value={sTag} onChange={(e) => setSTag(e.target.value)}
                  placeholder="e.g. 50–1000 guests"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Short Description</label>
              <textarea value={sDesc} onChange={(e) => setSDesc(e.target.value)}
                placeholder="Brief description for the card"
                rows={2}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Description</label>
              <textarea value={sFullDesc} onChange={(e) => setSFullDesc(e.target.value)}
                placeholder="Detailed description for the details page"
                rows={4}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Image</label>
              <input type="file" accept="image/*" onChange={handleServiceImage}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white file:cursor-pointer" />
              {sImagePreview && (
                <div className="mt-3 relative inline-block">
                  <img src={sImagePreview} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-xl border border-border-light" />
                  <button type="button" onClick={() => { setSImagePreview(""); setSImageFile(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer flex items-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Upload className="w-4 h-4" /> {editItem && "tag" in editItem ? "Update" : "Create"}</>}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetServiceForm(); }}
                className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Menu Form */}
        {showForm && activeTab === "menus" && (
          <form onSubmit={handleMenuSubmit} className="bg-white rounded-2xl border border-border-light p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{editItem && "per" in editItem ? "Edit Menu" : "New Menu"}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                <input type="text" value={mTitle} onChange={(e) => setMTitle(e.target.value)}
                  placeholder="e.g. Royal Dawat Package"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Price</label>
                  <input type="text" value={mPrice} onChange={(e) => setMPrice(e.target.value)}
                    placeholder="From ৳850"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Per</label>
                  <select value={mPer} onChange={(e) => setMPer(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none">
                    <option value="head">Head</option>
                    <option value="package">Package</option>
                    <option value="pricing">Custom</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea value={mDesc} onChange={(e) => setMDesc(e.target.value)}
                placeholder="Menu description"
                rows={3}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Image</label>
              <input type="file" accept="image/*" onChange={handleMenuImage}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white file:cursor-pointer" />
              {mImagePreview && (
                <div className="mt-3 relative inline-block">
                  <img src={mImagePreview} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-xl border border-border-light" />
                  <button type="button" onClick={() => { setMImagePreview(""); setMImageFile(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer flex items-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Upload className="w-4 h-4" /> {editItem && "per" in editItem ? "Update" : "Create"}</>}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetMenuForm(); }}
                className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
          </div>
        ) : activeTab === "services" ? (
          services.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-muted" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No services yet</h3>
              <p className="text-sm text-muted">Add your first catering service</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-border-light p-5 hover:shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {s.image && (
                      <div className="relative flex-shrink-0">
                        <img src={s.image} alt={s.title} className="w-full sm:w-48 h-32 object-cover rounded-xl border border-border-light" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">{s.title}</h3>
                          {s.tag && <span className="text-[10px] text-muted bg-surface-hover px-2 py-0.5 rounded-lg">{s.tag}</span>}
                        </div>
                      </div>
                      {s.description && <p className="text-sm text-muted truncate mt-1">{s.description}</p>}
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => handleEditService(s)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-primary/30 text-primary hover:bg-primary/5 transition-all cursor-pointer">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => { setDeleteId(s.id); setDeleteType("service"); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-danger/30 text-danger hover:bg-danger/5 transition-all cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          menus.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-muted" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No menus yet</h3>
              <p className="text-sm text-muted">Add your first catering menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {menus.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-border-light p-5 hover:shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {m.image && (
                      <div className="relative flex-shrink-0">
                        <img src={m.image} alt={m.title} className="w-full sm:w-48 h-32 object-cover rounded-xl border border-border-light" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">{m.title}</h3>
                          {m.price && <span className="text-xs text-primary font-medium">{m.price} / {m.per}</span>}
                        </div>
                      </div>
                      {m.description && <p className="text-sm text-muted truncate mt-1">{m.description}</p>}
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => handleEditMenu(m)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-primary/30 text-primary hover:bg-primary/5 transition-all cursor-pointer">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => { setDeleteId(m.id); setDeleteType("menu"); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-danger/30 text-danger hover:bg-danger/5 transition-all cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Delete Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => { setDeleteId(null); setDeleteType(null); }}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-50 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-danger" />
                </div>
                <h3 className="font-bold text-foreground">Delete {deleteType === "service" ? "Service" : "Menu"}</h3>
                <p className="text-sm text-muted mt-1">Are you sure? This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setDeleteId(null); setDeleteType(null); }}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-danger/90 transition-all btn-press cursor-pointer">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
