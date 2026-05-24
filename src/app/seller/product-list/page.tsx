"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function ProductListPage() {
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading, refetch } = useGet<{ success: boolean; products: Product[] }>(
    ["products"],
    "/api/product/list"
  );

  const updateStock = usePost(
    "/api/product/stock",
    {
      onSuccess: (data: any) => {
        if (data.success) { toast.success("Stock updated"); refetch(); }
        else toast.error(data.message);
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const products = data?.products || [];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Product List</h2>
          <button onClick={() => { setShowAddModal(true); setEditProduct(null); }}
            className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer">
            + Add Product
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-6xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="py-3 px-4 font-medium">#</th>
                    <th className="py-3 px-4 font-medium">Image</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Category</th>
                    <th className="py-3 px-4 font-medium">Price</th>
                    <th className="py-3 px-4 font-medium">Offer</th>
                    <th className="py-3 px-4 font-medium">Stock</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      index={index}
                      currency={currency}
                      onUpdateStock={(id, quantity) => updateStock.mutate({ id, quantity })}
                      onEdit={() => { setEditProduct(product); setShowAddModal(true); }}
                      onView={() => setViewProduct(product)}
                      onDelete={() => setDeleteId(product._id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {products.map((product, index) => (
                <MobileProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  currency={currency}
                  onUpdateStock={(id, quantity) => updateStock.mutate({ id, quantity })}
                  onEdit={() => { setEditProduct(product); setShowAddModal(true); }}
                  onView={() => setViewProduct(product)}
                  onDelete={() => setDeleteId(product._id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal) && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowAddModal(false); setEditProduct(null); }}
          onSuccess={() => { setShowAddModal(false); setEditProduct(null); refetch(); }}
        />
      )}

      {/* View Modal */}
      {viewProduct && (
        <ProductViewModal product={viewProduct} currency={currency} onClose={() => setViewProduct(null)} />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <DeleteConfirmModal
          productId={deleteId}
          onClose={() => setDeleteId(null)}
          onSuccess={() => { setDeleteId(null); refetch(); }}
        />
      )}
    </div>
  );
}

function ProductRow({
  product, index, currency, onUpdateStock, onEdit, onView, onDelete,
}: {
  product: Product; index: number; currency: string;
  onUpdateStock: (id: string, quantity: number) => void;
  onEdit: () => void; onView: () => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(product.quantity);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4 text-gray-500">{index + 1}</td>
      <td className="py-3 px-4">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt="" width={40} height={40} className="rounded object-cover w-10 h-10" />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded" />
        )}
      </td>
      <td className="py-3 px-4 font-medium">{product.name}</td>
      <td className="py-3 px-4 text-gray-600">{product.category}</td>
      <td className="py-3 px-4">{currency}{product.price}</td>
      <td className="py-3 px-4 text-primary">{currency}{product.offerPrice}</td>
      <td className="py-3 px-4">
        {editing ? (
          <div className="flex items-center gap-1">
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className="w-16 border rounded px-2 py-1 text-sm outline-none" min="0" />
            <button onClick={() => { onUpdateStock(product._id, qty); setEditing(false); }}
              className="text-xs bg-primary text-white px-2 py-1 rounded cursor-pointer">Save</button>
            <button onClick={() => { setEditing(false); setQty(product.quantity); }}
              className="text-xs border px-2 py-1 rounded cursor-pointer">X</button>
          </div>
        ) : (
          <span className={product.inStock ? "text-green-600" : "text-red-500"}>
            {product.quantity} {product.inStock ? "(In Stock)" : "(Out)"}
          </span>
        )}
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-blue-600 ml-2 cursor-pointer">Edit Stock</button>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button onClick={onView} className="text-xs border border-blue-300 text-blue-600 px-2 py-1 rounded cursor-pointer">View</button>
          <button onClick={onEdit} className="text-xs border border-primary text-primary px-2 py-1 rounded cursor-pointer">Edit</button>
          <button onClick={onDelete} className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded cursor-pointer">Delete</button>
        </div>
      </td>
    </tr>
  );
}

function MobileProductCard({
  product, index, currency, onUpdateStock, onEdit, onView, onDelete,
}: {
  product: Product; index: number; currency: string;
  onUpdateStock: (id: string, quantity: number) => void;
  onEdit: () => void; onView: () => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(product.quantity);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex gap-3 mb-2">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt="" width={56} height={56} className="rounded object-cover w-14 h-14" />
        ) : (
          <div className="w-14 h-14 bg-gray-100 rounded flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <p className="text-xs text-gray-500">{product.category}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs text-gray-500 line-through">{currency}{product.price}</span>
            <span className="text-xs text-primary font-medium">{currency}{product.offerPrice}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        {editing ? (
          <div className="flex items-center gap-1">
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className="w-16 border rounded px-2 py-1 text-sm outline-none" min="0" />
            <button onClick={() => { onUpdateStock(product._id, qty); setEditing(false); }}
              className="text-xs bg-primary text-white px-2 py-1 rounded cursor-pointer">Save</button>
            <button onClick={() => { setEditing(false); setQty(product.quantity); }}
              className="text-xs border px-2 py-1 rounded cursor-pointer">X</button>
          </div>
        ) : (
          <span className={`text-xs ${product.inStock ? "text-green-600" : "text-red-500"}`}>
            Stock: {product.quantity} {product.inStock ? "(In Stock)" : "(Out)"}
            <button onClick={() => setEditing(true)} className="text-blue-600 ml-2 cursor-pointer">Edit</button>
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onView} className="text-xs border border-blue-300 text-blue-600 px-3 py-1.5 rounded cursor-pointer flex-1">View</button>
        <button onClick={onEdit} className="text-xs border border-primary text-primary px-3 py-1.5 rounded cursor-pointer flex-1">Edit</button>
        <button onClick={onDelete} className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded cursor-pointer flex-1">Delete</button>
      </div>
    </div>
  );
}

function ProductFormModal({ product, onClose, onSuccess }: { product: Product | null; onClose: () => void; onSuccess: () => void }) {
  const { data: catData } = useGet<{ success: boolean; categories: any[] }>(
    ["categories"], "/api/category/list"
  );
  const categories = catData?.categories || [];
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState<string[]>(product?.description || [""]);
  const [category, setCategory] = useState(product?.category || (categories[0]?.name || "Vegetables"));
  const [price, setPrice] = useState(String(product?.price || ""));
  const [offerPrice, setOfferPrice] = useState(String(product?.offerPrice || ""));
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 4);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (!product) {
        formData.append("productData", JSON.stringify({
          name, description: description.filter(Boolean), category,
          price: Number(price), offerPrice: Number(offerPrice),
        }));
        files.forEach((f) => formData.append("images", f));
        const { data } = await api.post("/api/product/add", formData);
        if (data.success) { toast.success("Product added!"); onSuccess(); }
        else toast.error(data.message);
      } else {
        if (files.length > 0) files.forEach((f) => formData.append("images", f));
        formData.append("name", name);
        formData.append("description", JSON.stringify(description.filter(Boolean)));
        formData.append("category", category);
        formData.append("price", String(price));
        formData.append("offerPrice", String(offerPrice));
        const { data } = await api.put(`/api/product/${product._id}`, formData);
        if (data.success) { toast.success("Product updated!"); onSuccess(); }
        else toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">{product ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose} className="text-gray-400 text-xl cursor-pointer">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Description</label>
            {description.map((desc, i) => (
              <div key={i} className="flex gap-2 mt-0.5">
                <input type="text" value={desc} onChange={(e) => {
                  const copy = [...description]; copy[i] = e.target.value; setDescription(copy);
                }} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary" />
                {i === description.length - 1 && (
                  <button type="button" onClick={() => setDescription([...description, ""])} className="text-primary text-sm cursor-pointer">+</button>
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5">
              {categories.map((c: any) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" required />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Offer Price</label>
              <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-0.5" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Images (up to 4)</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-0.5" />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {previews.map((src, i) => (
                  <Image key={i} src={src} alt="" width={48} height={48} className="rounded object-cover" />
                ))}
              </div>
            )}
            {product && product.images && previews.length === 0 && (
              <div className="flex gap-2 mt-2">
                {product.images.map((src, i) => (
                  <Image key={i} src={src} alt="" width={48} height={48} className="rounded object-cover" />
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting}
            className="bg-primary text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50">
            {submitting ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductViewModal({ product, currency, onClose }: { product: Product; currency: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">{product.name}</h3>
          <button onClick={onClose} className="text-gray-400 text-xl cursor-pointer">&times;</button>
        </div>
        {product.images && product.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {product.images.map((src, i) => (
              <Image key={i} src={src} alt="" width={80} height={80} className="rounded object-cover" />
            ))}
          </div>
        )}
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-500">Category:</span> {product.category}</p>
          <p><span className="text-gray-500">Price:</span> {currency}{product.price}</p>
          <p><span className="text-gray-500">Offer Price:</span> <span className="text-primary">{currency}{product.offerPrice}</span></p>
          <p><span className="text-gray-500">Stock:</span> {product.quantity} ({product.inStock ? "In Stock" : "Out of Stock"})</p>
          <div>
            <span className="text-gray-500">Description:</span>
            <ul className="list-disc list-inside ml-2 mt-1 text-gray-700">
              {product.description.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
          <p className="text-xs text-gray-400">Added: {new Date(product.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ productId, onClose, onSuccess }: { productId: string; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data } = await api.delete(`/api/product/${productId}`);
      if (data.success) { toast.success("Product deleted"); onSuccess(); }
      else toast.error(data.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium mb-2">Delete Product</h3>
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm cursor-pointer">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-4 py-2 bg-red-500 text-white rounded text-sm cursor-pointer disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
