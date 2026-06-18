"use client";

import { assets } from "@/assets/assets";
import { useGet } from "@/hooks/useGet";
import api from "@/lib/axios";
import { useUIStore } from "@/stores/uiStore";
import Image from "next/image";
import type { DeliveryMan, Order, Product } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  unassigned: "bg-gray-100 text-gray-600",
  assigned: "bg-blue-100 text-blue-700",
  "picked-up": "bg-yellow-100 text-yellow-700",
  "in-transit": "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function SellerOrdersPage() {
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading, refetch } = useGet<{
    success: boolean;
    orders: Order[];
  }>(["orders", "seller"], "/api/order/seller");

  const { data: productsData } = useGet<{
    success: boolean;
    products: Product[];
  }>(["products"], "/api/product/list");
  const { data: deliveryMenData } = useGet<{
    success: boolean;
    deliveryMen: DeliveryMan[];
  }>(["delivery-men"], "/api/delivery-man/list");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const orders = data?.orders || [];
  const products = productsData?.products || [];
  const deliveryMen = deliveryMenData?.deliveryMen || [];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Orders</h2>
            <p className="text-sm text-muted mt-0.5">{orders.length} total orders</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Order
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 rounded-2xl skeleton" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No orders yet</h3>
            <p className="text-sm text-muted">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                currency={currency}
                deliveryMen={deliveryMen}
                onAssigned={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateOrderModal
          products={products}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); refetch(); }}
        />
      )}
    </div>
  );
}

function OrderCard({
  order, currency, deliveryMen, onAssigned,
}: {
  order: Order; currency: string; deliveryMen: DeliveryMan[]; onAssigned: () => void;
}) {
  const [assigning, setAssigning] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  const handleAssign = async (deliveryManId: string) => {
    if (!deliveryManId || deliveryManId === "none") return;
    setAssigning(true);
    try {
      const { data } = await api.post("/api/order/assign-delivery", {
        orderId: order._id, deliveryManId,
      });
      if (data.success) { toast.success("Delivery man assigned"); onAssigned(); }
      else toast.error(data.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAssigning(false);
    }
  };

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    try {
      const { data } = await api.post("/api/order/auto-assign", { orderId: order._id });
      if (data.success) { toast.success(`Auto-assigned to ${data.rider?.name || "rider"}!`); onAssigned(); }
      else toast.error(data.message || "Auto-assignment failed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Auto-assignment failed");
    } finally {
      setAutoAssigning(false);
    }
  };

  const assignedDM = order.deliveryAssignment?.deliveryManId as DeliveryMan | undefined;

  return (
    <div className="bg-white rounded-2xl border border-border-light p-5 hover:shadow-sm transition-all animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        {/* Items */}
        <div className="flex gap-4 max-w-sm">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-2.5">
                {item.product?.images?.[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name} width={40} height={40}
                    className="w-10 h-10 object-cover rounded-xl border border-border-light" />
                ) : (
                  <img className="w-10 h-10 object-cover rounded-xl border border-border-light" src={assets.box_icon.src} alt="" />
                )}
                <div>
                  <p className="font-medium text-sm text-foreground">{item.product?.name}</p>
                  <p className="text-xs text-primary font-medium">x {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="text-sm max-w-xs">
          <p className="font-semibold text-foreground">
            {order.address?.firstName} {order.address?.lastName}
          </p>
          <p className="text-muted mt-0.5">
            House {order.address?.houseNumber}, Road {order.address?.roadNumber}
          </p>
          <p className="text-muted">{order.address?.city}, {order.address?.state}</p>
          <p className="text-muted">{order.address?.phone}</p>
        </div>

        {/* Payment */}
        <div className="text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted">Method:</span>
              <span className="font-medium text-foreground">{order.paymentType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">Date:</span>
              <span className="text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">Payment:</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${order.isPaid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
          <p className="text-lg font-bold text-foreground mt-2">{currency}{order.amount}</p>
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col gap-2 min-w-[160px]">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-lg text-center ${statusColors[order.deliveryStatus] || ""}`}>
            {order.deliveryStatus || "unassigned"}
          </span>

          {assignedDM ? (
            <div className="bg-surface-hover rounded-xl p-3">
              <p className="text-sm font-medium text-foreground">{assignedDM.name}</p>
              <p className="text-xs text-muted">{assignedDM.phone}</p>
            </div>
          ) : (
            order.deliveryStatus !== "delivered" &&
            order.deliveryStatus !== "cancelled" &&
            deliveryMen.length > 0 && (
              <div className="space-y-2">
                <select
                  onChange={(e) => handleAssign(e.target.value)}
                  disabled={assigning || autoAssigning}
                  className="text-sm border border-border rounded-xl px-3 py-2 outline-none w-full bg-surface-hover focus:bg-white focus:border-primary transition-all cursor-pointer"
                  defaultValue="none"
                >
                  <option value="none" disabled>Assign rider...</option>
                  {deliveryMen.filter((dm) => dm.isActive).map((dm) => (
                    <option key={dm._id} value={dm._id}>{dm.name}</option>
                  ))}
                </select>
                <button onClick={handleAutoAssign} disabled={autoAssigning || assigning}
                  className="w-full text-sm bg-primary/5 text-primary border border-primary/20 rounded-xl px-3 py-2 hover:bg-primary/10 transition-all disabled:opacity-50 btn-press cursor-pointer font-medium">
                  {autoAssigning ? "Assigning..." : "Auto Assign"}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function CreateOrderModal({ products, onClose, onSuccess }: {
  products: Product[]; onClose: () => void; onSuccess: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ product: string; quantity: number }[]>([]);
  const [paymentType, setPaymentType] = useState("COD");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);

  const addItem = () => setSelectedItems([...selectedItems, { product: "", quantity: 1 }]);
  const updateItem = (i: number, field: string, value: string | number) => {
    const copy = [...selectedItems];
    copy[i] = { ...copy[i], [field]: value };
    setSelectedItems(copy);
  };
  const removeItem = (i: number) => setSelectedItems(selectedItems.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || selectedItems.length === 0 || !address) {
      toast.error("Please fill all required fields");
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post("/api/order/admin-create", {
        customer: { name: customerName, phone: customerPhone, email: customerEmail || undefined },
        address,
        items: selectedItems.filter((i) => i.product),
        paymentType,
      });
      if (data.success) { toast.success("Order created!"); onSuccess(); }
      else toast.error(data.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-foreground">Create Order</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-muted hover:text-foreground hover:bg-border-light transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Customer Name</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-muted">(optional)</span></label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Address ID</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address ID"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-foreground">Items</label>
              <button type="button" onClick={addItem}
                className="text-primary text-sm font-medium hover:text-primary/80 transition-colors cursor-pointer">+ Add Item</button>
            </div>
            {selectedItems.map((item, i) => (
              <div key={i} className="flex gap-2 mt-2">
                <select value={item.product} onChange={(e) => updateItem(i, "product", e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required>
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} - ${p.offerPrice}</option>
                  ))}
                </select>
                <input type="number" min={1} value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  className="w-16 border border-border rounded-xl px-3 py-2.5 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
                <button type="button" onClick={() => removeItem(i)}
                  className="w-10 h-10 rounded-xl border border-danger/30 text-danger flex items-center justify-center hover:bg-danger/5 transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Payment Type</label>
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none">
              <option value="COD">Cash on Delivery</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>
          <button type="submit" disabled={creating}
            className="w-full gradient-primary text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-50 btn-press cursor-pointer">
            {creating ? "Creating..." : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
