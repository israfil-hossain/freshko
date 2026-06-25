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
    <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl overflow-hidden px-6 sm:px-8 lg:px-12 text-center py-14 sm:py-16 mt-10">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Newsletter
        </div>

        <h2 className="max-w-lg mx-auto font-bold text-2xl sm:text-3xl text-white leading-snug">
          Stay Updated with Freshko
        </h2>
        <p className="text-white/70 text-sm mt-2 max-w-md mx-auto">
          Get the latest deals, new products, and grocery tips delivered to your inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className="relative mt-8 flex w-full max-w-xl mx-auto flex-col gap-3 sm:block"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-13 w-full rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 text-sm text-white outline-none placeholder:text-white/60 focus:bg-white/25 focus:border-white/40 transition-all sm:h-14 sm:px-7 sm:text-base sm:pr-52"
            placeholder="Enter your email address"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-13 w-full items-center justify-center rounded-2xl bg-white text-primary px-6 text-sm font-semibold transition-all hover:bg-gray-50 hover:shadow-lg hover:shadow-black/10 disabled:cursor-not-allowed disabled:opacity-60 btn-press sm:h-14 sm:text-base sm:absolute sm:right-1.5 sm:top-1.5 sm:w-48"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Subscribe Now"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
