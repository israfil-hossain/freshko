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
    <div className="bg-emerald-50 px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16 lg:py-20 flex flex-col items-center justify-center mt-6">
      <p className="text-gray-600 font-bold text-xl sm:text-2xl lg:text-3xl">
        Get Updated!
      </p>
      <h1 className="max-w-lg font-semibold text-2xl sm:text-3xl lg:text-4xl leading-snug sm:leading-snug lg:leading-[44px] mt-3 px-2">
        Subscribe to our Newsletter & Get the Latest News
      </h1>
      <form
        onSubmit={handleSubmit}
        className="relative mt-8 sm:mt-10 flex w-full max-w-3xl flex-col gap-3 px-1 md:block md:px-0"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-full border border-slate-600 bg-transparent px-5 text-base text-gray-700 outline-none placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-14 sm:px-7 sm:text-lg md:pr-64"
          placeholder="Enter your email address"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-medium text-white transition-colors hover:bg-primary-dull disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:text-lg md:absolute md:right-0 md:top-0 md:w-60"
        >
          {loading ? "Subscribing..." : "Subscribe Now"}
        </button>
      </form>
    </div>
  );
}
