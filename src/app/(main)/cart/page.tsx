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
import type { Product, Address } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const setItems = useCartStore((s) => s.setItems);
  const currency = useUIStore((s) => s.currency);

  const { data: productsData } = useGet<{ success: boolean; products: Product[] }>(["products"], "/api/product/list");
  const { data: addressesData, refetch: refetchAddresses } = useGet<{ success: boolean; addresses: Address[] }>(["addresses"], "/api/address/get", { enabled: !!user });

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"COD" | "Online">("COD");

  const products = productsData?.products || [];
  const addresses = addressesData?.addresses || [];

  const cartItems = Object.entries(items)
    .map(([id, qty]) => {
      const product = products.find((p) => p._id === id);
      return product ? { ...product, quantity: qty } : null;
    })
    .filter(Boolean) as (Product & { quantity: number })[];

  const subtotal = cartItems.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);
  const tax = Math.floor(subtotal * 0.02);
  const total = subtotal + tax;

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

  const placeOrderStripe = usePost(
    "/api/order/stripe",
    {
      onSuccess: (data: any) => {
        if (data.success) {
          setItems({});
          window.location.replace(data.url);
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
    };

    if (paymentOption === "COD") {
      placeOrderCOD.mutate(payload);
    } else {
      placeOrderStripe.mutate(payload);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <Link href="/products" className="text-primary underline">Continue Shopping</Link>
      </main>
    );
  }

  return (
    <main className="py-8">
      <h2 className="text-2xl font-semibold mb-6">Shopping Cart</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
              <Image src={item.images[0]} alt={item.name} width={80} height={80} className="rounded object-cover" />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-primary font-semibold mt-1">{currency}{item.offerPrice}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => removeFromCart(item._id)} className="w-8 h-8 border rounded hover:bg-gray-50 cursor-pointer">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => {
                    const current = items[item._id] || 0;
                    updateCartItem(item._id, current + 1);
                  }} className="w-8 h-8 border rounded hover:bg-gray-50 cursor-pointer">+</button>
                </div>
              </div>
              <p className="font-medium">{currency}{item.offerPrice * item.quantity}</p>
            </div>
          ))}
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

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="payment" checked={paymentOption === "COD"} onChange={() => setPaymentOption("COD")} />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="payment" checked={paymentOption === "Online"} onChange={() => setPaymentOption("Online")} />
                Online Payment (Stripe)
              </label>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{currency}{subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
            <div className="flex justify-between"><span>Tax (2%)</span><span>{currency}{tax}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t"><span>Total</span><span>{currency}{total}</span></div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placeOrderCOD.isPending || placeOrderStripe.isPending}
            className="w-full bg-primary text-white py-3 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </main>
  );
}
