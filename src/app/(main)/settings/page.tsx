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

  const tabs = [
    { key: "profile" as Tab, label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { key: "addresses" as Tab, label: "Addresses", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { key: "password" as Tab, label: "Password", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  ];

  return (
    <main className="py-8 max-w-2xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>

      <div className="flex gap-2 mb-8 bg-white rounded-2xl border border-border-light p-1.5">
        {tabs.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              tab === key ? "gradient-primary text-white shadow-sm shadow-primary/20" : "text-muted hover:bg-surface-hover"
            }`}>
            <svg className={`w-4 h-4 ${tab === key ? "text-white" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} /></svg>
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
      if (data.success) { toast.success("Profile updated!"); fetchUser(); }
      else toast.error(data.message);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to update profile"); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light p-6 space-y-4 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
        <input type="email" value={user?.email || ""} disabled
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 01712345678"
          className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" />
      </div>
      <button type="submit"
        className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press cursor-pointer">
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
      if (res.success) { toast.success("Address deleted"); refetch(); }
      else toast.error(res.message);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to delete"); }
  };

  const addresses = data?.addresses || [];

  return (
    <div className="space-y-3 animate-fade-in">
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
          </div>
          <h3 className="font-semibold text-foreground mb-1">No addresses saved</h3>
          <p className="text-sm text-muted">Add your delivery address to get started</p>
        </div>
      ) : (
        addresses.map((addr) => (
          <div key={addr._id} className="bg-white border border-border-light rounded-2xl p-4 flex justify-between items-start hover:shadow-sm transition-all">
            <div className="text-sm space-y-0.5">
              <p className="font-semibold text-foreground">{addr.firstName} {addr.lastName}</p>
              <p className="text-muted">House {addr.houseNumber}, Road {addr.roadNumber}, Floor {addr.floorNumber}</p>
              <p className="text-muted">{addr.city}, {addr.state}, {addr.zipcode}</p>
              <p className="text-muted">{addr.phone}</p>
            </div>
            <button onClick={() => handleDelete(addr._id)}
              className="text-danger text-sm font-medium hover:text-danger/80 cursor-pointer transition-colors">Delete</button>
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
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      const { data } = await api.put("/api/user/change-password", { currentPassword, newPassword });
      if (data.success) { toast.success("Password changed!"); setCurrentPassword(""); setNewPassword(""); }
      else toast.error(data.message);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to change password"); }
  };

  const handleForgotPassword = async () => {
    if (!userEmail) return;
    try {
      const { data } = await api.post("/api/user/forgot-password", { email: userEmail });
      if (data.success) toast.success("Reset link sent to your email!");
      else toast.error(data.message);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed to send reset email"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-border-light p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Change Password</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white focus:border-primary transition-all outline-none" required />
        </div>
        <button type="submit"
          className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press cursor-pointer">
          Change Password
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-border-light p-6">
        <h3 className="font-semibold text-foreground mb-2">Forgot Password?</h3>
        <p className="text-sm text-muted mb-3">A reset link will be sent to {userEmail}</p>
        <button onClick={handleForgotPassword}
          className="text-primary text-sm font-semibold hover:text-primary/80 cursor-pointer transition-colors">
          Send Reset Link
        </button>
      </div>
    </div>
  );
}
