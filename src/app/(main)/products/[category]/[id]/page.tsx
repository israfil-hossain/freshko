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
import { useState } from "react";
import { ThumbsUp } from "lucide-react";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; product: Product }>(
    ["product", productId], `/api/product/${productId}`
  );

  const { data: allData } = useGet<{ success: boolean; products: Product[] }>(
    ["products"], "/api/product/list", { enabled: !!data?.product }
  );

  const product = data?.product || null;
  const relatedProducts = (allData?.products || [])
    .filter((p) => p.category === product?.category && p._id !== productId)
    .slice(0, 4);

  const { data: reviewsData } = useGet<{ success: boolean; reviews: any[]; ratingDistribution: any[] }>(
    ["reviews", productId], `/api/reviews/product/${productId}`, { enabled: !!productId }
  );

  const reviews = reviewsData?.reviews || [];
  const ratingDistribution = reviewsData?.ratingDistribution || [];
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <main className="py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted animate-pulse">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="py-8">
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <h3 className="font-semibold text-foreground mb-1">Product not found</h3>
          <Link href="/" className="text-primary text-sm font-medium mt-2 inline-block hover:underline">Browse all products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Images */}
        <div className="w-full md:w-1/2">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-border-light mb-3">
            <Image src={product.images[selectedImage] || product.images[0]} alt={product.name} fill className="object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === i ? "border-primary" : "border-border-light hover:border-primary/50"
                  }`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-hover text-xs font-medium text-muted w-fit uppercase tracking-wider">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-primary text-2xl font-bold">{currency}{product.offerPrice}</span>
            <span className="text-muted line-through text-lg">{currency}{product.price}</span>
          </div>

          <div className="flex items-center gap-2">
            {!product.inStock || product.quantity <= 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-danger bg-red-50 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-danger" /> Out of Stock
              </span>
            ) : product.quantity <= 5 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Only {product.quantity} left in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> In Stock ({product.quantity} available)
              </span>
            )}
          </div>

          {product.subcategory && (
            <p className="text-xs text-muted uppercase">Subcategory: {product.subcategory}</p>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span key={tag} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-lg">{tag}</span>
              ))}
            </div>
          )}

          <div className="space-y-2 bg-surface-hover rounded-xl p-4">
            {product.description.map((desc, i) => (
              <p key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-primary mt-1">•</span> {desc}
              </p>
            ))}
          </div>

          <AddToCartButton productId={product._id} inStock={product.inStock} stockQuantity={product.quantity} />
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-12 border-t border-border-light pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-5 h-5 ${star <= (product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <span className="text-sm text-muted">{product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {ratingDistribution.length > 0 && (
          <div className="mb-8 space-y-2 max-w-md bg-white rounded-2xl border border-border-light p-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const dist = ratingDistribution.find((d: any) => d._id === rating);
              const count = dist?.count || 0;
              const total = reviews.length || 1;
              const percentage = (count / total) * 100;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-8 font-medium text-foreground">{rating} ★</span>
                  <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm text-muted w-12">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-8 text-center">
              <p className="text-muted text-sm">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((review: any) => (
              <div key={review._id} className="bg-white border border-border-light rounded-2xl p-5 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.userId?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.title && <p className="text-sm font-semibold text-foreground mb-1">{review.title}</p>}
                <p className="text-sm text-foreground/80">{review.comment}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer">
                    <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpful || 0})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-6">Related Products</h2>
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

function AddToCartButton({ productId, inStock, stockQuantity }: { productId: string; inStock: boolean; stockQuantity: number }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);

  const quantity = items[productId] || 0;
  const isOutOfStock = !inStock || stockQuantity <= 0;

  const handleAdd = () => {
    if (!user) { setShowUserLogin(true); return; }
    if (isOutOfStock) return;
    addToCart(productId);
  };

  if (isOutOfStock) {
    return (
      <button disabled className="bg-gray-200 text-muted px-8 py-3 rounded-xl text-sm font-medium w-fit cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-primary/30 rounded-xl overflow-hidden">
          <button onClick={() => removeFromCart(productId)}
            className="w-11 h-11 flex items-center justify-center text-primary font-medium hover:bg-primary/5 cursor-pointer transition-colors">-</button>
          <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
          <button onClick={() => addToCart(productId)}
            className="w-11 h-11 flex items-center justify-center text-primary font-medium hover:bg-primary/5 cursor-pointer transition-colors">+</button>
        </div>
        <Link href="/cart"
          className="gradient-primary text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press">
          Buy Now
        </Link>
      </div>
    );
  }

  return (
    <button onClick={handleAdd}
      className="gradient-primary text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all w-fit cursor-pointer btn-press">
      Add to Cart
    </button>
  );
}
