"use client";

import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/api/newsletter/subscribe", { email });
      if (data.success) {
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/5 rounded-3xl px-6 sm:px-8 lg:px-12 text-center py-12 sm:py-16 flex flex-col items-center justify-center mt-10">
      <p className="text-accent font-semibold text-sm uppercase tracking-wider">
        Stay Updated
      </p>
      <h2 className="max-w-lg font-bold text-2xl sm:text-3xl text-gray-900 mt-3 leading-snug">
        Subscribe to our Newsletter & Get the Latest News
      </h2>
      <form
        onSubmit={handleSubmit}
        className="relative mt-8 flex w-full max-w-xl flex-col gap-3 sm:block"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-full border border-gray-200 bg-white px-5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:h-14 sm:px-7 sm:text-base sm:pr-56"
          placeholder="Enter your email address"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:text-base sm:absolute sm:right-1 sm:top-1 sm:w-52"
        >
          {loading ? "Subscribing..." : "Subscribe Now"}
        </button>
      </form>
    </div>
  );
}
