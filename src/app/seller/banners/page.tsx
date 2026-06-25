"use client";

import { useState, ChangeEvent } from "react";
import { useGet } from "@/hooks/useGet";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Image, Plus, Trash2, Edit, Eye, EyeOff, Upload, X } from "lucide-react";

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function BannersPage() {
  const { data, isLoading, refetch } = useGet<{ success: boolean; banners: Banner[] }>(
    ["banners"], "/api/banner/list"
  );

  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("Shop Now");
  const [buttonLink, setButtonLink] = useState("/products");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const banners = data?.banners || [];

  const resetForm = () => {
    setTitle(""); setSubtitle(""); setDescription("");
    setButtonText("Shop Now"); setButtonLink("/products");
    setIsActive(true); setOrder("0");
    setImageFile(null); setImagePreview("");
    setEditBanner(null);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setDescription(banner.description);
    setButtonText(banner.buttonText);
    setButtonLink(banner.buttonLink);
    setIsActive(banner.isActive);
    setOrder(String(banner.order));
    setImagePreview(banner.image);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("description", description);
      formData.append("buttonText", buttonText);
      formData.append("buttonLink", buttonLink);
      formData.append("isActive", String(isActive));
      formData.append("order", order);
      if (imageFile) formData.append("image", imageFile);

      if (editBanner) {
        const { data: res } = await api.put(`/api/banner/${editBanner._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Banner updated");
        else toast.error(res.message);
      } else {
        const { data: res } = await api.post("/api/banner/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.success) toast.success("Banner added");
        else toast.error(res.message);
      }
      refetch();
      setShowForm(false);
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: res } = await api.delete(`/api/banner/${id}`);
      if (res.success) { toast.success("Banner deleted"); refetch(); }
      else toast.error(res.message);
      setDeleteId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { data: res } = await api.put(`/api/banner/${banner._id}`, {
        isActive: !banner.isActive,
      });
      if (res.success) { refetch(); }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Banners</h2>
              <p className="text-sm text-muted mt-0.5">{banners.length} banners</p>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); resetForm(); }}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Banner"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-2xl border border-border-light p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{editBanner ? "Edit Banner" : "New Banner"}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter banner title"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subtitle</label>
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Farm-Fresh & Organic"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter banner description"
                rows={3}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Shop Now"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Button Link</label>
                <input type="text" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="/products"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Display Order</label>
                <input type="number" value={order} onChange={(e) => setOrder(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <button type="button" onClick={() => setIsActive(!isActive)}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-border bg-surface-hover text-muted'
                  }`}>
                  {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Banner Image</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white file:cursor-pointer file:hover:bg-primary/90 file:transition-all" />
              </div>
              {imagePreview && (
                <div className="mt-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-xl border border-border-light" />
                  <button type="button" onClick={() => { setImagePreview(""); setImageFile(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer flex items-center gap-2">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {editBanner ? "Update Banner" : "Create Banner"}
                  </>
                )}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="px-6 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer">
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl skeleton" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <Image className="w-8 h-8 text-muted" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No banners yet</h3>
            <p className="text-sm text-muted">Create your first banner to showcase promotions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div key={banner._id} className={`bg-white rounded-2xl border border-border-light p-5 hover:shadow-sm transition-all animate-fade-in ${!banner.isActive ? 'opacity-60' : ''}`}>
                <div className="flex flex-col sm:flex-row gap-4">
                  {banner.image && (
                    <div className="relative flex-shrink-0">
                      <img src={banner.image} alt={banner.title}
                        className="w-full sm:w-48 h-32 object-cover rounded-xl border border-border-light" />
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold ${
                        banner.isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{banner.title}</h3>
                          <span className="text-[10px] text-muted bg-surface-hover px-2 py-0.5 rounded-lg">
                            Order: {banner.order}
                          </span>
                        </div>
                        {banner.subtitle && <p className="text-sm text-muted mb-1">{banner.subtitle}</p>}
                        {banner.description && <p className="text-xs text-muted/70 truncate">{banner.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted/60 mt-2">
                      <span className="font-medium text-primary">{banner.buttonText}</span>
                      <span>→</span>
                      <span>{banner.buttonLink}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <button onClick={() => handleToggleActive(banner)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        banner.isActive
                          ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                          : 'bg-surface-hover text-muted border border-border hover:bg-border-light'
                      }`}>
                      {banner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => handleEdit(banner)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-primary/30 text-primary hover:bg-primary/5 transition-all cursor-pointer">
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button onClick={() => setDeleteId(banner._id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-danger/30 text-danger hover:bg-danger/5 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-50 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-danger" />
                </div>
                <h3 className="font-bold text-foreground">Delete Banner</h3>
                <p className="text-sm text-muted mt-1">Are you sure? This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
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
