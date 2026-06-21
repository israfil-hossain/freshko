"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUIStore } from "@/stores/uiStore";
import type { Category, Product } from "@/types";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const PRODUCTS_PER_PAGE = 8;

type ProductListResponse = {
  success: boolean;
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export default function ProductListPage() {
  const currency = useUIStore((s) => s.currency);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGet<ProductListResponse>(
    ["products", String(page), String(PRODUCTS_PER_PAGE)],
    `/api/product/list?page=${page}&limit=${PRODUCTS_PER_PAGE}`
  );

  const updateStock = usePost<{ id: string; quantity: number }, { success: boolean; message?: string }>(
    "/api/product/stock",
    {
      onSuccess: (data) => {
        if (data.success) { toast.success("Stock updated"); refetch(); }
        else toast.error(data.message || "Failed");
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const products = data?.products || [];
  const pagination = data?.pagination;
  const totalProducts = pagination?.total ?? products.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;
  const fromProduct = totalProducts === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const toProduct = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);
  const pageOffset = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  const handleDeleteSuccess = () => {
    setDeleteId(null);
    if (products.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      refetch();
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Product List</h2>
            <p className="text-sm text-muted mt-0.5">{totalProducts} products in your store</p>
          </div>
          <button onClick={() => { setShowAddModal(true); setEditProduct(null); }}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 rounded-xl skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No products yet</h3>
            <p className="text-sm text-muted">Add your first product to get started</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-6xl bg-white rounded-2xl border border-border-light shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">#</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Product</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Category</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Price</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Stock</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      index={pageOffset + index}
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
              {products.map((product) => (
                <MobileProductCard
                  key={product._id}
                  product={product}
                  currency={currency}
                  onUpdateStock={(id, quantity) => updateStock.mutate({ id, quantity })}
                  onEdit={() => { setEditProduct(product); setShowAddModal(true); }}
                  onView={() => setViewProduct(product)}
                  onDelete={() => setDeleteId(product._id)}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              from={fromProduct}
              to={toProduct}
              total={totalProducts}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {(showAddModal) && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowAddModal(false); setEditProduct(null); }}
          onSuccess={() => { setShowAddModal(false); setEditProduct(null); refetch(); }}
        />
      )}

      {viewProduct && (
        <ProductViewModal product={viewProduct} currency={currency} onClose={() => setViewProduct(null)} />
      )}

      {deleteId && (
        <DeleteConfirmModal
          productId={deleteId}
          onClose={() => setDeleteId(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage, totalPages, from, to, total, onPageChange,
}: {
  currentPage: number; totalPages: number; from: number; to: number; total: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return (
      <p className="mt-5 text-sm text-muted">
        Showing {from}-{to} of {total} products
      </p>
    );
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Showing {from}-{to} of {total} products
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 rounded-xl border border-border px-3 text-sm text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          Prev
        </button>
        {pageNumbers.map((pageNumber) => (
          <button key={pageNumber} type="button" onClick={() => onPageChange(pageNumber)}
            className={`h-9 min-w-9 rounded-xl px-3 text-sm font-medium transition-all cursor-pointer ${
              pageNumber === currentPage
                ? "gradient-primary text-white shadow-sm shadow-primary/20"
                : "border border-border text-muted hover:border-primary hover:text-primary"
            }`}>
            {pageNumber}
          </button>
        ))}
        <button type="button" onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 rounded-xl border border-border px-3 text-sm text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          Next
        </button>
      </div>
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
    <tr className="border-b border-border-light/60 hover:bg-surface-hover/50 transition-colors">
      <td className="py-3 px-4 text-muted">{index + 1}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt="" width={40} height={40} className="rounded-xl object-cover w-10 h-10 border border-border-light" />
          ) : (
            <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          )}
          <span className="font-medium text-foreground">{product.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-hover text-xs font-medium text-muted">{product.category}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-muted line-through text-xs">{currency}{product.price}</span>
          <span className="font-semibold text-foreground">{currency}{product.offerPrice}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary transition-colors" min="0" />
            <button onClick={() => { onUpdateStock(product._id, qty); setEditing(false); }}
              className="text-xs gradient-primary text-white px-2.5 py-1.5 rounded-lg cursor-pointer btn-press">Save</button>
            <button onClick={() => { setEditing(false); setQty(product.quantity); }}
              className="text-xs border border-border text-muted px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-surface-hover transition-colors">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${product.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {product.quantity} {product.inStock ? "In Stock" : "Out"}
            </span>
            <button onClick={() => setEditing(true)} className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors">Edit</button>
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-1.5">
          <button onClick={onView} className="text-xs border border-border text-muted px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-all cursor-pointer">View</button>
          <button onClick={onEdit} className="text-xs border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all cursor-pointer">Edit</button>
          <button onClick={onDelete} className="text-xs border border-danger/30 text-danger px-3 py-1.5 rounded-lg hover:bg-danger/5 transition-all cursor-pointer">Delete</button>
        </div>
      </td>
    </tr>
  );
}

function MobileProductCard({
  product, currency, onUpdateStock, onEdit, onView, onDelete,
}: {
  product: Product; currency: string;
  onUpdateStock: (id: string, quantity: number) => void;
  onEdit: () => void; onView: () => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(product.quantity);

  return (
    <div className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all">
      <div className="flex gap-3 mb-3">
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt="" width={56} height={56} className="rounded-xl object-cover w-14 h-14 border border-border-light" />
        ) : (
          <div className="w-14 h-14 bg-surface-hover rounded-xl flex-shrink-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate text-foreground">{product.name}</p>
          <p className="text-xs text-muted">{product.category}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted line-through">{currency}{product.price}</span>
            <span className="text-sm font-semibold text-primary">{currency}{product.offerPrice}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))}
              className="w-16 border border-border rounded-lg px-2 py-1.5 text-sm outline-none" min="0" />
            <button onClick={() => { onUpdateStock(product._id, qty); setEditing(false); }}
              className="text-xs gradient-primary text-white px-2.5 py-1.5 rounded-lg cursor-pointer">Save</button>
            <button onClick={() => { setEditing(false); setQty(product.quantity); }}
              className="text-xs border border-border px-2.5 py-1.5 rounded-lg cursor-pointer">Cancel</button>
          </div>
        ) : (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${product.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            Stock: {product.quantity}
            <button onClick={() => setEditing(true)} className="text-primary ml-2 font-semibold cursor-pointer">Edit</button>
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onView} className="text-xs border border-border text-muted px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-surface-hover transition-all">View</button>
        <button onClick={onEdit} className="text-xs border border-primary/30 text-primary px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-primary/5 transition-all">Edit</button>
        <button onClick={onDelete} className="text-xs border border-danger/30 text-danger px-3 py-2 rounded-xl cursor-pointer flex-1 hover:bg-danger/5 transition-all">Delete</button>
      </div>
    </div>
  );
}

function ProductFormModal({ product, onClose, onSuccess }: { product: Product | null; onClose: () => void; onSuccess: () => void }) {
  const { data: catData } = useGet<{ success: boolean; categories: Category[] }>(
    ["categories"], "/api/category/list"
  );
  const categories = catData?.categories || [];
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState<string[]>(product?.description || [""]);
  const [category, setCategory] = useState(product?.category || (categories[0]?.name || "Vegetables"));
  const [subcategory, setSubcategory] = useState(product?.subcategory || "");
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [price, setPrice] = useState(String(product?.price || ""));
  const [offerPrice, setOfferPrice] = useState(String(product?.offerPrice || ""));
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = categories.find((c) => c.name === category);
  const subcategories = selectedCategory?.subcategories || [];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 4);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (!product) {
        formData.append("productData", JSON.stringify({
          name, description: description.filter(Boolean), category, subcategory,
          tags,
          price: Number(price), offerPrice: Number(offerPrice),
        }));
        files.forEach((f) => formData.append("images", f));
        const { data } = await api.post("/api/product/add", formData);
        if (data.success) { toast.success("Product added!"); onSuccess(); }
        else toast.error(data.message || "Failed");
      } else {
        if (files.length > 0) files.forEach((f) => formData.append("images", f));
        formData.append("name", name);
        formData.append("description", JSON.stringify(description.filter(Boolean)));
        formData.append("category", category);
        formData.append("subcategory", subcategory);
        formData.append("tags", JSON.stringify(tags));
        formData.append("price", String(price));
        formData.append("offerPrice", String(offerPrice));
        const { data } = await api.put(`/api/product/${product._id}`, formData);
        if (data.success) { toast.success("Product updated!"); onSuccess(); }
        else toast.error(data.message || "Failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-foreground">{product ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-muted hover:text-foreground hover:bg-border-light transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            {description.map((desc, i) => (
              <div key={i} className="flex gap-2 mt-1.5">
                <input type="text" value={desc} onChange={(e) => {
                  const copy = [...description]; copy[i] = e.target.value; setDescription(copy);
                }} className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
                {i === description.length - 1 && (
                  <button type="button" onClick={() => setDescription([...description, ""])} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-primary hover:bg-primary/5 transition-all cursor-pointer">+</button>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none">
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subcategory</label>
                <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none">
                  <option value="">None</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type and press Enter"
                className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
              <button type="button" onClick={addTag}
                className="border border-border rounded-xl px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition-all cursor-pointer">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-lg">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}
                      className="hover:text-danger cursor-pointer ml-0.5">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Offer Price</label>
              <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Images (up to 4)</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white transition-all" />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3">
                {previews.map((src, i) => (
                  <Image key={i} src={src} alt="" width={48} height={48} className="rounded-xl object-cover border border-border-light" />
                ))}
              </div>
            )}
            {product && product.images && previews.length === 0 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((src, i) => (
                  <Image key={i} src={src} alt="" width={48} height={48} className="rounded-xl object-cover border border-border-light" />
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting}
            className="w-full gradient-primary text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
            {submitting ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductViewModal({ product, currency, onClose }: { product: Product; currency: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-muted hover:text-foreground hover:bg-border-light transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {product.images && product.images.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {product.images.map((src, i) => (
              <Image key={i} src={src} alt="" width={80} height={80} className="rounded-xl object-cover border border-border-light" />
            ))}
          </div>
        )}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border-light/60">
            <span className="text-muted">Category</span>
            <span className="font-medium text-foreground">{product.category}</span>
          </div>
          {product.subcategory && (
            <div className="flex items-center justify-between py-2 border-b border-border-light/60">
              <span className="text-muted">Subcategory</span>
              <span className="font-medium text-foreground">{product.subcategory}</span>
            </div>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="py-2 border-b border-border-light/60">
              <span className="text-muted">Tags</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-lg">{tag}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-border-light/60">
            <span className="text-muted">Price</span>
            <span className="font-medium text-foreground">{currency}{product.price}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border-light/60">
            <span className="text-muted">Offer Price</span>
            <span className="font-semibold text-primary">{currency}{product.offerPrice}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border-light/60">
            <span className="text-muted">Stock</span>
            <span className={`font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
              {product.quantity} ({product.inStock ? "In Stock" : "Out of Stock"})
            </span>
          </div>
          <div className="py-2">
            <span className="text-muted">Description</span>
            <ul className="list-disc list-inside mt-2 text-foreground/80 space-y-0.5">
              {product.description.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
          <p className="text-xs text-muted pt-2">Added: {new Date(product.createdAt).toLocaleDateString()}</p>
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
      else toast.error(data.message || "Failed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <h3 className="font-bold text-foreground">Delete Product</h3>
          <p className="text-sm text-muted mt-1">Are you sure? This action cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-surface-hover transition-all cursor-pointer">Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-danger/90 transition-all disabled:opacity-50 btn-press cursor-pointer">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
