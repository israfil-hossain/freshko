"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { useGet } from "@/hooks/useGet";
import type { Address } from "@/types";

type Tab = "profile" | "addresses" | "password";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <main className="py-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      <div className="flex gap-4 mb-8 border-b pb-2">
        {([{ key: "profile", label: "Profile" }, { key: "addresses", label: "Addresses" }, { key: "password", label: "Password" }] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-sm font-medium border-b-2 transition cursor-pointer ${tab === key ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab user={user} fetchUser={fetchUser} />}
      {tab === "addresses" && <AddressesTab />}
      {tab === "password" && <PasswordTab userEmail={user?.email} />}
    </main>
  );
}

function ProfileTab({ user, fetchUser }: { user: any; fetchUser: () => Promise<void> }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/api/user/update-profile", { name, phone });
      if (data.success) {
        toast.success("Profile updated!");
        fetchUser();
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="text-sm font-medium text-gray-600">Email</label>
        <input type="email" value={user?.email || ""} disabled className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-1" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 01712345678" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-1" />
      </div>
      <button type="submit" className="bg-primary text-white px-6 py-2 rounded text-sm font-medium hover:opacity-90 cursor-pointer">
        Save Changes
      </button>
    </form>
  );
}

function AddressesTab() {
  const { data, refetch } = useGet<{ success: boolean; addresses: Address[] }>(["addresses"], "/api/address/get");

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const { data: res } = await api.delete(`/api/address/delete/${id}`);
      if (res.success) {
        toast.success("Address deleted");
        refetch();
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const addresses = data?.addresses || [];

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <p className="text-sm text-gray-500">No addresses saved yet.</p>
      ) : (
        addresses.map((addr) => (
          <div key={addr._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start">
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-black/80">{addr.firstName} {addr.lastName}</p>
              <p>House {addr.houseNumber}, Road {addr.roadNumber}, Floor {addr.floorNumber}</p>
              <p>{addr.city}, {addr.state}, {addr.zipcode}</p>
              <p>{addr.phone}</p>
            </div>
            <button onClick={() => handleDelete(addr._id)} className="text-red-500 text-sm hover:underline cursor-pointer">Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

function PasswordTab({ userEmail }: { userEmail?: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    try {
      const { data } = await api.put("/api/user/change-password", { currentPassword, newPassword });
      if (data.success) {
        toast.success("Password changed!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  const handleForgotPassword = async () => {
    if (!userEmail) return;
    try {
      const { data } = await api.post("/api/user/forgot-password", { email: userEmail });
      if (data.success) {
        toast.success("Reset link sent to your email!");
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    }
  };

  return (
    <div className="max-w-md space-y-8">
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="font-medium text-base">Change Password</h3>
        <div>
          <label className="text-sm font-medium text-gray-600">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-1" required />
        </div>
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded text-sm font-medium hover:opacity-90 cursor-pointer">
          Change Password
        </button>
      </form>

      <div className="border-t pt-6">
        <h3 className="font-medium text-base mb-2">Forgot Password?</h3>
        <p className="text-sm text-gray-500 mb-3">A reset link will be sent to {userEmail}</p>
        <button onClick={handleForgotPassword} className="text-primary text-sm font-medium hover:underline cursor-pointer">
          Send Reset Link
        </button>
      </div>
    </div>
  );
}
