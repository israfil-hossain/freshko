"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useGet } from "@/hooks/useGet";
import api from "@/lib/axios";
import toast from "react-hot-toast";

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
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Banners</h2>
          <button onClick={() => { setShowForm(!showForm); resetForm(); }}
            className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer">
            {showForm ? "Cancel" : "+ Add Banner"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="max-w-lg mb-6 p-4 border rounded-lg space-y-3">
            <h3 className="font-medium text-sm">{editBanner ? "Edit Banner" : "New Banner"}</h3>
            <div>
              <label className="text-xs font-medium text-gray-600">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" required />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Subtitle</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Farm-Fresh & Organic"
                className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Button Link</label>
                <input type="text" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Display Order</label>
                <input type="number" value={order} onChange={(e) => setOrder(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-primary" />
                  Active
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Banner Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" />
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Preview" className="w-full max-w-md h-40 object-cover rounded border" />
                </div>
              )}
            </div>
            <button type="submit" disabled={saving}
              className="bg-primary text-white px-5 py-2 rounded text-sm cursor-pointer disabled:opacity-50">
              {saving ? "Saving..." : editBanner ? "Update" : "Create"}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : banners.length === 0 ? (
          <p className="text-gray-400">No banners yet</p>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => (
              <div key={banner._id} className={`border rounded-lg p-4 bg-white ${!banner.isActive ? 'opacity-60' : ''}`}>
                <div className="flex gap-4">
                  {banner.image && (
                    <img src={banner.image} alt={banner.title}
                      className="w-40 h-24 object-cover rounded border flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{banner.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] text-gray-400">Order: {banner.order}</span>
                    </div>
                    {banner.subtitle && <p className="text-xs text-gray-500 mb-1">{banner.subtitle}</p>}
                    {banner.description && <p className="text-xs text-gray-400 truncate">{banner.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">Button: {banner.buttonText} → {banner.buttonLink}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => handleToggleActive(banner)}
                      className="text-xs border px-2 py-1 rounded cursor-pointer hover:bg-gray-50">
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleEdit(banner)}
                      className="text-xs border border-primary text-primary px-2 py-1 rounded cursor-pointer hover:bg-gray-50">Edit</button>
                    <button onClick={() => setDeleteId(banner._id)}
                      className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded cursor-pointer hover:bg-gray-50">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-medium mb-2">Delete Banner</h3>
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
