"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import api from "@/lib/axios";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useWalletStore } from "@/stores/walletStore";
import type { Product, Address } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const setItems = useCartStore((s) => s.setItems);
  const currency = useUIStore((s) => s.currency);
  const walletBalance = useWalletStore((s) => s.balance);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);

  const { data: productsData } = useGet<{ success: boolean; products: Product[] }>(["products"], "/api/product/list");
  const { data: addressesData, refetch: refetchAddresses } = useGet<{ success: boolean; addresses: Address[] }>(["addresses"], "/api/address/get", { enabled: !!user });

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"COD" | "bKash" | "Wallet">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const products = productsData?.products || [];
  const addresses = addressesData?.addresses || [];

  const cartItems = Object.entries(items)
    .map(([id, qty]) => {
      const product = products.find((p) => p._id === id);
      if (!product) return null;
      const isOutOfStock = !product.inStock || product.quantity <= 0;
      const exceedsStock = qty > product.quantity;
      return { ...product, quantity: qty, isOutOfStock, exceedsStock };
    })
    .filter(Boolean) as (Product & { quantity: number; isOutOfStock: boolean; exceedsStock: boolean })[];

  const hasStockIssues = cartItems.some((item) => item.isOutOfStock || item.exceedsStock);

  const subtotal = cartItems
    .filter((item) => !item.isOutOfStock)
    .reduce((sum, item) => sum + item.offerPrice * Math.min(item.quantity, item.quantity), 0);
  const tax = Math.floor(subtotal * 0.02);
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + tax - discount);

  useEffect(() => {
    if (user) fetchBalance();
  }, [user]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast.error("Please enter a coupon code"); return; }
    setIsApplyingCoupon(true);
    try {
      const { data } = await api.post("/api/promotions/apply", {
        code: couponCode, orderAmount: subtotal,
        productIds: cartItems.map((item) => item._id),
        categoryIds: cartItems.map((item) => item.category),
      });
      if (data.success) { setAppliedCoupon(data.promotion); toast.success(`Coupon applied! You saved ${currency}${data.promotion.discount}`); }
      else toast.error(data.message || "Invalid coupon");
    } catch (error: any) { toast.error(error.message || "Failed to apply coupon"); }
    finally { setIsApplyingCoupon(false); }
  };

  const placeOrderCOD = usePost("/api/order/cod", {
    onSuccess: (data: any) => { if (data.success) { setItems({}); toast.success("Order placed successfully!"); router.push("/my-orders"); } else toast.error(data.message); },
    onError: (err) => toast.error(err.message),
  }, [["orders"]]);

  const placeOrderBkash = usePost("/api/order/bkash-payment", {
    onSuccess: (data: any) => { if (data.success) { setItems({}); window.location.replace(data.bkashURL); } else toast.error(data.message); },
    onError: (err) => toast.error(err.message),
  }, [["orders"]]);

  const handlePlaceOrder = async () => {
    if (!user) { toast.error("Please login first"); return; }
    if (!selectedAddress) { toast.error("Please select a delivery address"); return; }
    const payload = {
      userId: user._id, items: cartItems.map((item) => ({ product: item._id, quantity: item.quantity })),
      address: selectedAddress, deliveryInstructions, couponCode: appliedCoupon?.code || undefined,
    };
    if (paymentOption === "COD") placeOrderCOD.mutate(payload);
    else if (paymentOption === "bKash") placeOrderBkash.mutate(payload);
    else if (paymentOption === "Wallet") {
      if (walletBalance < total) { toast.error("Insufficient wallet balance"); return; }
      placeOrderCOD.mutate({ ...payload, paymentType: "Wallet" });
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="px-5 py-8">
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-sm text-muted mb-4">Add some fresh groceries to get started</p>
          <Link href="/" className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-5 py-2">
      <h2 className="text-2xl font-bold text-foreground mb-6">Shopping Cart</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${item.isOutOfStock ? 'border-danger/30 bg-red-50' : 'border-border-light bg-white hover:shadow-sm'}`}>
              <Image src={item.images[0]} alt={item.name} width={80} height={80} className="rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">{item.name}</h3>
                <p className="text-primary font-semibold mt-1">{currency}{item.offerPrice}</p>
                {item.isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-danger mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger" /> Out of Stock
                  </span>
                ) : item.exceedsStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Only {item.quantity} available — quantity adjusted
                  </span>
                ) : item.quantity <= 5 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Only {item.quantity} left
                  </span>
                ) : null}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => removeFromCart(item._id)} disabled={item.isOutOfStock}
                    className="w-9 h-9 border border-border rounded-xl flex items-center justify-center hover:bg-surface-hover transition-all cursor-pointer disabled:opacity-40">-</button>
                  <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                  <button onClick={() => { const current = items[item._id] || 0; updateCartItem(item._id, current + 1); }}
                    disabled={item.isOutOfStock}
                    className="w-9 h-9 border border-border rounded-xl flex items-center justify-center hover:bg-surface-hover transition-all cursor-pointer disabled:opacity-40">+</button>
                </div>
              </div>
              <p className="font-semibold text-foreground">{currency}{item.offerPrice * item.quantity}</p>
            </div>
          ))}

          {/* Coupon Code */}
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="font-semibold text-foreground mb-3">Coupon Code</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-sm font-medium text-green-900">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-700">You saved {currency}{appliedCoupon.discount}</p>
                  </div>
                </div>
                <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                  className="text-sm text-danger hover:text-danger/80 font-medium cursor-pointer transition-colors">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
                <button onClick={applyCoupon} disabled={isApplyingCoupon}
                  className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-4">
          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="font-semibold text-foreground mb-3">Delivery Address</h3>
            {addresses.length > 0 ? (
              <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none">
                <option value="">Select address</option>
                {addresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.firstName} {addr.lastName} - House {addr.houseNumber}, Road {addr.roadNumber}, {addr.city}
                  </option>
                ))}
              </select>
            ) : (
              <Link href="/add-address" className="text-primary text-sm font-medium hover:underline">Add a new address</Link>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="font-semibold text-foreground mb-3">Delivery Instructions</h3>
            <textarea value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g., Leave at gate, Call before delivery"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none resize-none" rows={3} />
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-5">
            <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
            <div className="space-y-2">
              {[
                { key: "COD" as const, label: "Cash on Delivery", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "text-green-600" },
                { key: "bKash" as const, label: "bKash", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-pink-600" },
                { key: "Wallet" as const, label: `Wallet (৳${walletBalance.toFixed(0)})`, icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "text-blue-600" },
              ].map(({ key, label, icon, color }) => (
                <label key={key} className={`flex items-center gap-3 text-sm p-3 rounded-xl cursor-pointer transition-all ${paymentOption === key ? "bg-primary/5 border border-primary/20" : "border border-border-light hover:bg-surface-hover"}`}>
                  <input type="radio" name="payment" checked={paymentOption === key} onChange={() => setPaymentOption(key)} className="accent-primary" />
                  <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
                  <span className="font-medium text-foreground">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light p-5 space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-medium text-foreground">{currency}{subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="text-green-600 font-medium">Free</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax (2%)</span><span className="font-medium text-foreground">{currency}{tax}</span></div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code})</span><span className="font-medium">-{currency}{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2.5 border-t border-border-light">
              <span className="text-foreground">Total</span><span className="text-foreground">{currency}{total}</span>
            </div>
            {paymentOption === "Wallet" && walletBalance < total && (
              <p className="text-danger text-xs">Insufficient wallet balance</p>
            )}
          </div>

          <button onClick={handlePlaceOrder}
            disabled={placeOrderCOD.isPending || placeOrderBkash.isPending || hasStockIssues || (paymentOption === "Wallet" && walletBalance < total)}
            className="w-full gradient-primary text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
            {hasStockIssues ? "Remove out-of-stock items" : paymentOption === "COD" ? "Place Order" : paymentOption === "bKash" ? "Pay with bKash" : "Pay with Wallet"}
          </button>
          {hasStockIssues && (
            <p className="text-danger text-xs text-center">Please remove out-of-stock items before placing your order.</p>
          )}
        </div>
      </div>
    </main>
  );
}
