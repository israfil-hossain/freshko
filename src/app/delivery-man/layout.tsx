"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDeliveryManStore } from "@/stores/deliveryManStore";
import { assets } from "@/assets/assets";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function DeliveryManLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isLoading, checkAuth, logout } = useDeliveryManStore();
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setChecking(false);
    };
    init();
  }, [checkAuth]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (checking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <DeliveryManLoginPage />;
  }

  const sidebarLinks = [
    { name: "Dashboard", path: "/delivery-man/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Orders", path: "/delivery-man/orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/delivery-man");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-border-light py-3 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-primary/5 rounded-xl transition-colors cursor-pointer">
            {mobileMenuOpen ? (
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link href="/delivery-man/dashboard" className="flex items-center gap-2">
            <img className="cursor-pointer w-24 md:w-32 transition-transform hover:scale-105" src={assets.logo} alt="Freshko" />
            <span className="hidden md:inline text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-lg">Rider</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {isLoggedIn ? "R" : "?"}
            </div>
            <span className="font-medium text-foreground">Rider</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium border border-danger/20 text-danger rounded-xl px-4 py-2 hover:bg-danger/5 transition-all btn-press cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'fixed left-0 top-0 z-30 w-64 pt-16 animate-slide-in' : 'hidden md:flex md:w-64'} border-r border-border-light h-[calc(100vh-57px)] flex-col bg-white overflow-y-auto`}>
          <nav className="p-3 space-y-0.5">
            {sidebarLinks.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-gray-600 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <svg className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function DeliveryManLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsLoggedIn, setDeliveryMan, checkAuth } = useDeliveryManStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/api/delivery-man/login", { email, password });
      if (data.success) {
        setIsLoggedIn(true);
        setDeliveryMan(data.deliveryMan);
        await checkAuth();
        toast.success("Welcome!");
        router.push("/delivery-man/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border-light">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Rider Portal</h2>
            <p className="text-sm text-muted mt-1.5">Sign in to start delivering</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" placeholder="rider@freshko.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-surface-hover focus:bg-white transition-all outline-none"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 pr-11 text-sm bg-surface-hover focus:bg-white transition-all outline-none"
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1 cursor-pointer">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.034-3.362M9.88 9.88A3 3 0 0114.12 14.12M3 3l18 18" /></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full gradient-primary text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all disabled:opacity-50 btn-press">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
