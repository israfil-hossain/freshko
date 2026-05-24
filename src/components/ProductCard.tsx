"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const currency = useUIStore((s) => s.currency);
  const quantity = items[product._id] || 0;

  const handleAdd = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    addToCart(product._id);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition group">
      <Link href={`/products/${product.category}/${product._id}`}>
        <div className="relative w-full aspect-square mb-3 overflow-hidden rounded">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        </div>
      </Link>

      <p className="text-xs text-gray-400 uppercase mb-1">{product.category}</p>
      <Link href={`/products/${product.category}/${product._id}`}>
        <h3 className="font-medium text-sm mb-2 truncate">{product.name}</h3>
      </Link>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary font-semibold text-sm">
          {currency}{product.offerPrice}
        </span>
        <span className="text-gray-400 text-xs line-through">
          {currency}{product.price}
        </span>
      </div>

      {quantity > 0 ? (
        <div className="flex items-center gap-3 border border-primary rounded">
          <button
            onClick={() => removeFromCart(product._id)}
            className="w-8 h-8 flex items-center justify-center text-primary font-medium hover:bg-primary/10 cursor-pointer"
          >
            -
          </button>
          <span className="text-sm font-medium">{quantity}</span>
          <button
            onClick={() => addToCart(product._id)}
            className="w-8 h-8 flex items-center justify-center text-primary font-medium hover:bg-primary/10 cursor-pointer"
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          className="w-full py-2 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition cursor-pointer"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
