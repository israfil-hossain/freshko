"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; product: Product }>(
    ["product", productId],
    `/api/product/${productId}`
  );

  const { data: allData } = useGet<{ success: boolean; products: Product[] }>(
    ["products"],
    "/api/product/list",
    { enabled: !!data?.product }
  );

  const product = data?.product || null;
  const relatedProducts = (allData?.products || [])
    .filter((p) => p.category === product?.category && p._id !== productId)
    .slice(0, 4);

  if (isLoading) {
    return (
      <main className="py-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="py-8">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Product not found</p>
          <Link href="/products" className="text-primary text-sm mt-2 inline-block">Browse all products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/2">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <p className="text-xs text-gray-400 uppercase">{product.category}</p>
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-primary text-2xl font-bold">
              {currency}{product.offerPrice}
            </span>
            <span className="text-gray-400 line-through text-lg">
              {currency}{product.price}
            </span>
          </div>

          <div className="space-y-2">
            {product.description.map((desc, i) => (
              <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-primary mt-1">•</span> {desc}
              </p>
            ))}
          </div>

          <AddToCartButton productId={product._id} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function AddToCartButton({ productId }: { productId: string }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);

  const quantity = items[productId] || 0;

  const handleAdd = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    addToCart(productId);
  };

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-primary rounded">
          <button onClick={() => removeFromCart(productId)} className="w-10 h-10 flex items-center justify-center text-primary font-medium hover:bg-primary/10 cursor-pointer">-</button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <button onClick={() => addToCart(productId)} className="w-10 h-10 flex items-center justify-center text-primary font-medium hover:bg-primary/10 cursor-pointer">+</button>
        </div>
        <Link href="/cart" className="bg-primary text-white px-6 py-2.5 rounded text-sm font-medium hover:opacity-90">
          Buy Now
        </Link>
      </div>
    );
  }

  return (
    <button onClick={handleAdd} className="bg-primary text-white px-8 py-2.5 rounded text-sm font-medium hover:opacity-90 w-fit cursor-pointer">
      Add to Cart
    </button>
  );
}
