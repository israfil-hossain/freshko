"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    try {
      const { data } = await api.post("/api/user/reset-password", { token, password });
      if (data.success) {
        toast.success("Password reset successfully! Please login.");
        router.push("/");
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  return (
    <main className="py-16 max-w-md mx-auto text-center">
      <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
          required
        />
        <button type="submit" className="w-full bg-primary text-white py-2.5 rounded text-sm font-medium hover:opacity-90 cursor-pointer">
          Reset Password
        </button>
      </form>
    </main>
  );
}
