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
import { Star, ThumbsUp } from "lucide-react";

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

  const { data: reviewsData } = useGet<{ success: boolean; reviews: any[]; ratingDistribution: any[] }>(
    ["reviews", productId],
    `/api/reviews/product/${productId}`,
    { enabled: !!productId }
  );

  const reviews = reviewsData?.reviews || [];
  const ratingDistribution = reviewsData?.ratingDistribution || [];

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
          <Link href="/" className="text-primary text-sm mt-2 inline-block">Browse all products</Link>
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

          <div className="flex items-center gap-2">
            {!product.inStock || product.quantity <= 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Out of Stock
              </span>
            ) : product.quantity <= 5 ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Only {product.quantity} left in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                In Stock ({product.quantity} available)
              </span>
            )}
          </div>

          {product.subcategory && (
            <p className="text-xs text-gray-400 uppercase">Subcategory: {product.subcategory}</p>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span key={tag} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {product.description.map((desc, i) => (
              <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-primary mt-1">•</span> {desc}
              </p>
            ))}
          </div>

          <AddToCartButton productId={product._id} inStock={product.inStock} stockQuantity={product.quantity} />
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-12 border-t pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Customer Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= (product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {ratingDistribution.length > 0 && (
          <div className="mb-8 space-y-2 max-w-md">
            {[5, 4, 3, 2, 1].map((rating) => {
              const dist = ratingDistribution.find((d: any) => d._id === rating);
              const count = dist?.count || 0;
              const total = reviews.length || 1;
              const percentage = (count / total) * 100;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-8">{rating} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review: any) => (
              <div key={review._id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                    {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.userId?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {review.title && (
                  <p className="text-sm font-medium text-gray-900 mb-1">{review.title}</p>
                )}
                <p className="text-sm text-gray-600">{review.comment}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful || 0})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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

function AddToCartButton({ productId, inStock, stockQuantity }: { productId: string; inStock: boolean; stockQuantity: number }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);

  const quantity = items[productId] || 0;
  const isOutOfStock = !inStock || stockQuantity <= 0;

  const handleAdd = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    if (isOutOfStock) return;
    addToCart(productId);
  };

  if (isOutOfStock) {
    return (
      <button disabled className="bg-gray-300 text-gray-500 px-8 py-2.5 rounded text-sm font-medium w-fit cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

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
