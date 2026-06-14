"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-accent" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-400 ml-0.5">({rating})</span>
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

  const discount = product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (isOutOfStock) return;
    addToCart(product._id);
  };

  return (
    <div className={`bg-white rounded-2xl p-3 hover:shadow-lg transition-shadow group border border-gray-100 ${isOutOfStock ? 'opacity-70' : ''}`}>
      <Link href={`/products/${product.category}/${product._id}`}>
        <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-xl bg-gray-50">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
          {isOutOfStock ? (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              OUT OF STOCK
            </span>
          ) : discount > 0 ? (
            <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          ) : null}
          {product.inStock && product.quantity > 0 && product.quantity <= 5 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Only {product.quantity} left
            </span>
          )}
        </div>
      </Link>

      <div className="px-1">
        <Link href={`/products/${product.category}/${product._id}`}>
          <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">{product.name}</h3>
        </Link>

        <StarRating />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-primary font-bold text-base">
              {currency}{product.offerPrice}
            </span>
            {discount > 0 && (
              <span className="text-gray-300 text-xs line-through">
                {currency}{product.price}
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="text-red-500 text-xs font-semibold">Out of Stock</span>
          ) : quantity > 0 ? (
            <div className="flex items-center gap-0 rounded-full border border-primary bg-primary text-white overflow-hidden">
              <button
                onClick={() => removeFromCart(product._id)}
                className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition"
              >
                -
              </button>
              <span className="text-xs font-semibold w-5 text-center">{quantity}</span>
              <button
                onClick={() => addToCart(product._id)}
                className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-9 h-9 flex items-center justify-center bg-accent hover:bg-accent/90 text-white rounded-full transition shadow-sm shadow-accent/25 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
