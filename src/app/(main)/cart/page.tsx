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
  const outOfStockItems = cartItems.filter((item) => item.isOutOfStock);

  const subtotal = cartItems
    .filter((item) => !item.isOutOfStock)
    .reduce((sum, item) => sum + item.offerPrice * Math.min(item.quantity, item.quantity), 0);
  const tax = Math.floor(subtotal * 0.02);
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + tax - discount);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    
    setIsApplyingCoupon(true);
    try {
      const { data } = await api.post("/api/promotions/apply", {
        code: couponCode,
        orderAmount: subtotal,
        productIds: cartItems.map((item) => item._id),
        categoryIds: cartItems.map((item) => item.category),
      });
      
      if (data.success) {
        setAppliedCoupon(data.promotion);
        toast.success(`Coupon applied! You saved ${currency}${data.promotion.discount}`);
      } else {
        toast.error(data.message || "Invalid coupon");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const placeOrderCOD = usePost(
    "/api/order/cod",
    {
      onSuccess: (data: any) => {
        if (data.success) {
          setItems({});
          toast.success("Order placed successfully!");
          router.push("/my-orders");
        } else {
          toast.error(data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    },
    [["orders"]]
  );

  const placeOrderBkash = usePost(
    "/api/order/bkash-payment",
    {
      onSuccess: (data: any) => {
        if (data.success) {
          setItems({});
          window.location.replace(data.bkashURL);
        } else {
          toast.error(data.message);
        }
      },
      onError: (err) => toast.error(err.message),
    },
    [["orders"]]
  );

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    const payload = {
      userId: user._id,
      items: cartItems.map((item) => ({ product: item._id, quantity: item.quantity })),
      address: selectedAddress,
      deliveryInstructions,
      couponCode: appliedCoupon?.code || undefined,
    };

    if (paymentOption === "COD") {
      placeOrderCOD.mutate(payload);
    } else if (paymentOption === "bKash") {
      placeOrderBkash.mutate(payload);
    } else if (paymentOption === "Wallet") {
      if (walletBalance < total) {
        toast.error("Insufficient wallet balance");
        return;
      }
      placeOrderCOD.mutate({ ...payload, paymentType: "Wallet" });
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="px-5 py-2 text-center">
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <Link href="/" className="text-primary underline">Continue Shopping</Link>
      </main>
    );
  }

  return (
    <main className="px-5 py-2">
      <h2 className="text-2xl font-semibold mb-6">Shopping Cart</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className={`flex gap-4 p-4 border rounded-lg ${item.isOutOfStock ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
              <Image src={item.images[0]} alt={item.name} width={80} height={80} className="rounded object-cover" />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-primary font-semibold mt-1">{currency}{item.offerPrice}</p>
                {item.isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                ) : item.exceedsStock ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Only {item.quantity} available — quantity adjusted
                  </span>
                ) : item.quantity <= 5 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Only {item.quantity} left
                  </span>
                ) : null}
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => removeFromCart(item._id)} className="w-8 h-8 border rounded hover:bg-gray-50 cursor-pointer" disabled={item.isOutOfStock}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => {
                    const current = items[item._id] || 0;
                    updateCartItem(item._id, current + 1);
                  }} className="w-8 h-8 border rounded hover:bg-gray-50 cursor-pointer" disabled={item.isOutOfStock}>+</button>
                </div>
              </div>
              <p className="font-medium">{currency}{item.offerPrice * item.quantity}</p>
            </div>
          ))}

          {/* Coupon Code */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Coupon Code</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-900">{appliedCoupon.code}</p>
                    <p className="text-xs text-green-700">You saved {currency}{appliedCoupon.discount}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-600"
                />
                <button
                  onClick={applyCoupon}
                  disabled={isApplyingCoupon}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
            )}
          </div>

        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Delivery Address</h3>
            {addresses.length > 0 ? (
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full border rounded p-2 text-sm outline-none"
              >
                <option value="">Select address</option>
                {addresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.firstName} {addr.lastName} - House {addr.houseNumber}, Road {addr.roadNumber}, {addr.city}
                  </option>
                ))}
              </select>
            ) : (
              <Link href="/add-address" className="text-primary text-sm underline">Add a new address</Link>
            )}
          </div>

          {/* Delivery Instructions */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Delivery Instructions</h3>
            <textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g., Leave at gate, Call before delivery, Don't ring bell"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-600 resize-none"
              rows={3}
            />
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="payment" checked={paymentOption === "COD"} onChange={() => setPaymentOption("COD")} />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cash on Delivery
                </div>
              </label>
              <label className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="payment" checked={paymentOption === "bKash"} onChange={() => setPaymentOption("bKash")} />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  bKash
                </div>
              </label>
              <label className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="payment" checked={paymentOption === "Wallet"} onChange={() => setPaymentOption("Wallet")} />
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Wallet (৳{walletBalance.toFixed(0)})
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{currency}{subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
            <div className="flex justify-between"><span>Tax (2%)</span><span>{currency}{tax}</span></div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-{currency}{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>{currency}{total}</span>
            </div>
            {paymentOption === "Wallet" && walletBalance < total && (
              <p className="text-red-500 text-xs">Insufficient wallet balance</p>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placeOrderCOD.isPending || placeOrderBkash.isPending || hasStockIssues || (paymentOption === "Wallet" && walletBalance < total)}
            className="w-full bg-primary text-white py-3 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {hasStockIssues
              ? "Remove out-of-stock items to continue"
              : paymentOption === "COD"
                ? "Place Order"
                : paymentOption === "bKash"
                  ? "Pay with bKash"
                  : "Pay with Wallet"}
          </button>
          {hasStockIssues && (
            <p className="text-red-500 text-xs text-center mt-2">
              Please remove out-of-stock items before placing your order.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
