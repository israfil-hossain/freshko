"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { assets } from "@/assets/assets";

export default function LoginModal() {
  const [state, setState] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const showUserLogin = useUIStore((s) => s.showUserLogin);
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = state === "login" ? "/api/user/login" : "/api/user/register";
      const payload = state === "login" ? { email, password } : { name, email, password };
      const { data } = await api.post(endpoint, payload);

      if (data.success) {
        await fetchUser();
        toast.success(state === "login" ? "Logged in!" : "Registered!");
        setShowUserLogin(false);
        router.refresh();
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (!showUserLogin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-8 relative">
        <button
          onClick={() => setShowUserLogin(false)}
          className="absolute top-4 right-4 cursor-pointer"
        >
          <img src={assets.remove_icon.src} alt="close" className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-semibold mb-6">{state === "login" ? "Login" : "Sign Up"}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {state === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-primary"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-primary"
            required
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded text-sm font-medium hover:opacity-90 cursor-pointer"
          >
            {state === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          {state === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setState(state === "login" ? "register" : "login")}
            className="text-primary underline cursor-pointer"
          >
            {state === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
