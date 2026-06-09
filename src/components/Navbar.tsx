"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { assets } from "@/assets/assets";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.getCartCount());
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    router.push("/products");
  };

  if (pathname.includes("seller")) return null;

  return (
    <nav className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 py-3 md:py-4 border-b border-gray-300 bg-white sticky top-0 z-50">
      <Link href="/">
        <img className="cursor-pointer w-20 md:w-28 lg:w-28" src={assets.logo} alt="Freshko" />
      </Link>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <Link href="/products" className="hover:text-primary transition">All Products</Link>
        <Link href="/monthly-bazar" className="hover:text-primary transition">Monthly Bazar</Link>
        <a href="#contact" className="hover:text-primary transition">Contact</a>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden md:flex items-center border border-gray-300 rounded px-3 py-1.5">
          <input
            onChange={handleSearch}
            type="text"
            placeholder="Search..."
            className="outline-none text-sm w-28"
          />
          <img src={assets.search_icon.src} alt="search" className="w-4 h-4" />
        </div>

        <Link href="/cart" className="relative">
          <img src={assets.nav_cart_icon.src} alt="cart" className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <div className="relative group">
            <img src={assets.profile_icon.src} alt="profile" className="w-6 h-6 rounded-full cursor-pointer" />
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition text-sm">
              <Link href="/my-orders" className="block px-4 py-2 hover:bg-gray-50">My Orders</Link>
              <Link href="/my-subscriptions" className="block px-4 py-2 hover:bg-gray-50">My Subscriptions</Link>
              <Link href="/settings" className="block px-4 py-2 hover:bg-gray-50">Settings</Link>
              <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-50">Logout</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowUserLogin(true)} className="text-sm border rounded-full px-3 md:px-4 py-1.5 hover:bg-gray-50 cursor-pointer hidden md:block">
            Login
          </button>
        )}

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
          <img src={assets.menu_icon.src} alt="menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 md:hidden shadow-lg">
          <div className="flex flex-col p-4 gap-4">
            <div className="flex items-center border border-gray-300 rounded px-3 py-2">
              <input
                onChange={handleSearch}
                type="text"
                placeholder="Search..."
                className="outline-none text-sm flex-1"
              />
              <img src={assets.search_icon.src} alt="search" className="w-4 h-4 ml-2" />
            </div>

            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
              All Products
            </Link>
            <Link href="/monthly-bazar" className="text-sm font-medium text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
              Monthly Bazar
            </Link>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>

            {!user && (
              <button onClick={() => { setShowUserLogin(true); setMobileMenuOpen(false); }} className="text-sm border rounded-full px-4 py-2 hover:bg-gray-50 cursor-pointer">
                Login
              </button>
            )}

            {user && (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                <Link href="/my-orders" className="text-sm text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                  My Orders
                </Link>
                <Link href="/my-subscriptions" className="text-sm text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                  My Subscriptions
                </Link>
                <Link href="/settings" className="text-sm text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
                  Settings
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-gray-600 hover:text-primary py-2 text-left">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
