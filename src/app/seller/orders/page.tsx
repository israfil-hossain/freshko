"use client";

import { useState } from "react";
import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import { assets } from "@/assets/assets";
import type { Order, Product, DeliveryMan, Address } from "@/types";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const statusColors: Record<string, string> = {
  "unassigned": "bg-gray-100 text-gray-600",
  "assigned": "bg-blue-100 text-blue-700",
  "picked-up": "bg-yellow-100 text-yellow-700",
  "in-transit": "bg-purple-100 text-purple-700",
  "delivered": "bg-green-100 text-green-700",
  "cancelled": "bg-red-100 text-red-600",
};

export default function SellerOrdersPage() {
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading, refetch } = useGet<{ success: boolean; orders: Order[] }>(
    ["orders", "seller"],
    "/api/order/seller"
  );

  const { data: productsData } = useGet<{ success: boolean; products: Product[] }>(["products"], "/api/product/list");
  const { data: deliveryMenData } = useGet<{ success: boolean; deliveryMen: DeliveryMan[] }>(["delivery-men"], "/api/delivery-man/list");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const orders = data?.orders || [];
  const products = productsData?.products || [];
  const deliveryMen = deliveryMenData?.deliveryMen || [];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Orders List</h2>
          <button onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer">
            + Create Order
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400">No orders yet</p>
        ) : (
          orders.map((order) => (
            <OrderCard key={order._id} order={order} currency={currency}
              deliveryMen={deliveryMen} onAssigned={() => refetch()} />
          ))
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

function OrderCard({ order, currency, deliveryMen, onAssigned }: {
  order: Order; currency: string; deliveryMen: DeliveryMan[]; onAssigned: () => void;
}) {
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async (deliveryManId: string) => {
    if (!deliveryManId || deliveryManId === "none") return;
    setAssigning(true);
    try {
      const { data } = await api.post("/api/order/assign-delivery", { orderId: order._id, deliveryManId });
      if (data.success) { toast.success("Delivery man assigned"); onAssigned(); }
      else toast.error(data.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAssigning(false);
    }
  };

  const assignedDM = order.deliveryAssignment?.deliveryManId as DeliveryMan | undefined;

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between p-5 max-w-5xl rounded-md border border-gray-300">
      <div className="flex gap-4 max-w-72">
        <img className="w-12 h-12 object-cover" src={assets.box_icon.src} alt="" />
        <div>
          {order.items.map((item) => (
            <p key={item._id} className="font-medium text-sm">
              {item.product?.name} <span className="text-primary">x {item.quantity}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="text-sm text-black/60 max-w-52">
        <p className="text-black/80 font-medium">{order.address?.firstName} {order.address?.lastName}</p>
        <p>House {order.address?.houseNumber}, Road {order.address?.roadNumber}</p>
        <p>{order.address?.city}, {order.address?.state}</p>
        <p>{order.address?.phone}</p>
      </div>

      <div className="text-sm text-black/60">
        <p>Method: {order.paymentType}</p>
        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
        <p className="font-medium text-base mt-1">{currency}{order.amount}</p>
      </div>

      <div className="flex flex-col gap-2 min-w-[140px]">
        <span className={`text-xs px-2 py-0.5 rounded-full text-center ${statusColors[order.deliveryStatus] || ""}`}>
          {order.deliveryStatus || "unassigned"}
        </span>

        {assignedDM ? (
          <div className="text-xs text-gray-600">
            <p>Delivery: {assignedDM.name}</p>
            <p className="text-gray-400">{assignedDM.phone}</p>
          </div>
        ) : (
          order.deliveryStatus !== "delivered" && order.deliveryStatus !== "cancelled" && deliveryMen.length > 0 && (
            <select
              onChange={(e) => handleAssign(e.target.value)}
              disabled={assigning}
              className="text-xs border rounded px-2 py-1 outline-none"
              defaultValue="none"
            >
              <option value="none" disabled>Assign...</option>
              {deliveryMen.filter(dm => dm.isActive).map((dm) => (
                <option key={dm._id} value={dm._id}>{dm.name}</option>
              ))}
            </select>
          )
        )}
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Create Order</h3>
          <button onClick={onClose} className="text-gray-400 text-xl cursor-pointer">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Customer Name</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full border rounded px-3 py-2 text-sm outline-none mt-0.5" required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Phone Number</label>
            <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full border rounded px-3 py-2 text-sm outline-none mt-0.5" required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Email <span className="text-gray-400">(optional)</span></label>
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full border rounded px-3 py-2 text-sm outline-none mt-0.5" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Address ID</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address ID"
              className="w-full border rounded px-3 py-2 text-sm outline-none mt-0.5" required />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-gray-600">Items</label>
              <button type="button" onClick={addItem} className="text-primary text-xs cursor-pointer">+ Add Item</button>
            </div>
            {selectedItems.map((item, i) => (
              <div key={i} className="flex gap-2 mt-1">
                <select value={item.product} onChange={(e) => updateItem(i, "product", e.target.value)}
                  className="flex-1 border rounded px-2 py-1.5 text-sm outline-none" required>
                  <option value="">Select product...</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} - ${p.offerPrice}</option>)}
                </select>
                <input type="number" min={1} value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1.5 text-sm outline-none" required />
                <button type="button" onClick={() => removeItem(i)} className="text-red-400 text-sm cursor-pointer">X</button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Payment Type</label>
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm outline-none mt-0.5">
              <option value="COD">COD</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <button type="submit" disabled={creating}
            className="bg-primary text-white px-6 py-2.5 rounded text-sm font-medium cursor-pointer disabled:opacity-50">
            {creating ? "Creating..." : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
