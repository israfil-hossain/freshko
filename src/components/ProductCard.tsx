"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";
import { useState } from "react";

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? "text-accent" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[10px] text-muted ml-1">({rating})</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const currency = useUIStore((s) => s.currency);
  const quantity = items[product._id] || 0;
  const isOutOfStock = !product.inStock || product.quantity <= 0;
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (isOutOfStock) return;
    setIsAdding(true);
    addToCart(product._id);
    setTimeout(() => setIsAdding(false), 400);
  };

  return (
    <div className={`group bg-white rounded-2xl border border-border-light overflow-hidden card-hover ${isOutOfStock ? "opacity-60" : ""}`}>
      <Link href={`/products/${product.category}/${product._id}`}>
        <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <span className="badge bg-danger text-white">OUT OF STOCK</span>
            ) : discount > 0 ? (
              <span className="badge badge-accent shadow-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {discount}% OFF
              </span>
            ) : null}
          </div>

          {product.inStock && product.quantity > 0 && product.quantity <= 5 && (
            <span className="absolute top-2.5 right-2.5 badge bg-accent/90 text-white backdrop-blur-sm">
              Only {product.quantity} left
            </span>
          )}
        </div>
      </Link>

      <div className="p-3.5">
        <Link href={`/products/${product.category}/${product._id}`}>
          <h3 className="font-semibold text-[13px] text-foreground truncate mb-1 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <StarRating />

        <div className="flex items-end justify-between mt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-primary font-bold text-lg leading-none">
              {currency}{product.offerPrice}
            </span>
            {discount > 0 && (
              <span className="text-muted text-xs line-through">
                {currency}{product.price}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="text-danger text-[11px] font-semibold">Sold Out</span>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-0 rounded-xl border border-primary bg-primary text-white overflow-hidden shadow-sm shadow-primary/15">
              <button
                onClick={() => removeFromCart(product._id)}
                className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-xs font-bold w-6 text-center">{quantity}</span>
              <button
                onClick={() => addToCart(product._id)}
                className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer btn-press ${
                isAdding
                  ? "bg-primary text-white scale-95"
                  : "bg-accent hover:bg-accent-dark text-white shadow-sm shadow-accent/20 hover:shadow-md hover:shadow-accent/30"
              }`}
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${isAdding ? "scale-110" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
