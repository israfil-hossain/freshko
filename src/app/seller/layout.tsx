"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { assets } from "@/assets/assets";
import toast from "react-hot-toast";
import api from "@/lib/axios";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSeller = useAuthStore((s) => s.isSeller);
  const sellerLogout = useAuthStore((s) => s.sellerLogout);
  const [checking, setChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await api.get("/api/seller/is-auth");
        useAuthStore.setState({ isSeller: data.success });
      } catch {
        useAuthStore.setState({ isSeller: false });
      }
      setChecking(false);
    };
    check();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSeller) {
    return <SellerLoginPage />;
  }

  const sidebarLinks = [
    { name: "Dashboard", path: "/seller", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    { name: "Customers", path: "/seller/users", icon: assets.profile_icon },
    { name: "Categories", path: "/seller/categories", icon: assets.box_icon },
    { name: "Delivery Men", path: "/seller/delivery-men", icon: assets.delivery_truck_icon },
    { name: "Sub Plans", path: "/seller/subscriptions", icon: assets.box_icon },
    { name: "Subscribers", path: "/seller/subscribers", icon: assets.profile_icon },
    { name: "Sub Orders", path: "/seller/subscription-orders", icon: assets.order_icon },
    { name: "Newsletter", path: "/seller/newsletter", icon: assets.profile_icon },
  ];

  const handleLogout = async () => {
    await sellerLogout();
    toast.success("Logged out");
    router.push("/");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-8 border-b border-gray-300 py-3 bg-white sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-600 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <Link href="/">
            <img className="cursor-pointer w-30 md:w-38" src={assets.logo} alt="Logo" />
          </Link>
        </div>
        <div className="flex items-center gap-3 md:gap-5 text-gray-500">
          <p className="text-sm md:text-base hidden md:block">Hi! Admin</p>
          <button onClick={handleLogout} className="border rounded-full text-xs md:text-sm px-3 md:px-4 py-1 cursor-pointer">Logout</button>
        </div>
      </div>

      <div className="flex">
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'fixed left-0 top-0 z-30 w-64 pt-16' : 'hidden md:flex md:w-64'} border-r h-[calc(100vh-57px)] text-base border-gray-300 pt-4 flex-col bg-white overflow-y-auto`}>
          {sidebarLinks.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center py-3 px-4 gap-3 ${
                pathname === item.path
                  ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                  : "hover:bg-gray-100/90 border-white text-gray-600"
              }`}
            >
              <img src={item.icon.src} alt="icon" className="w-7 h-7" />
              <p className="text-sm">{item.name}</p>
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function SellerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fetchSeller = useAuthStore((s) => s.fetchSeller);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/seller/login", { email, password });
      if (data.success) {
        await fetchSeller();
        toast.success("Welcome Admin!");
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <img src={assets.logo} alt="Freshko" className="w-28 mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-primary" required
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm outline-none focus:border-primary" required
          />
          <button type="submit" className="w-full bg-primary text-white py-2.5 rounded text-sm font-medium hover:opacity-90 cursor-pointer">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
