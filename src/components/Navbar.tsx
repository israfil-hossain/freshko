"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useWalletStore } from "@/stores/walletStore";
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.getCartCount());
  const setShowUserLogin = useUIStore((s) => s.setShowUserLogin);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const balance = useWalletStore((s) => s.balance);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchBalance();
    }
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    router.push("/");
  };

  if (pathname.includes("seller")) return null;

  return (
    <nav className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 h-12 py-3 border-b border-gray-300 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-3 flex-1 md:flex-none justify-start">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/">
          <img className="cursor-pointer w-20 md:w-28 lg:w-28" src={assets.logo} alt="Grocika" />
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <Link href="/monthly-bazar" className="hover:text-primary transition">Monthly Bazar</Link>
        <Link href="/support" className="hover:text-primary transition">Support</Link>
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

        {user && (
          <>
            {/* Wallet */}
            <Link href="/wallet" className="hidden md:flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              ৳{balance.toFixed(0)}
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => { markAllAsRead(); setShowNotifications(false); }}
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => { markAsRead(notification._id); setShowNotifications(false); }}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${
                            !notification.isRead ? "bg-green-50" : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {user ? (
          <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user.name?.split(" ")[0]}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link href="/my-orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </Link>
                  <Link href="/my-subscriptions" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Subscriptions
                  </Link>
                  <Link href="/wallet" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors md:hidden">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Wallet (৳{balance.toFixed(0)})
                  </Link>
                  <Link href="/support" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors md:hidden">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Support
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
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
            <Link href="/monthly-bazar" className="text-sm font-medium text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
              Monthly Bazar
            </Link>
            <Link href="/support" className="text-sm font-medium text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
              Support
            </Link>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-primary py-2" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>

            {user && (
              <Link href="/wallet" className="text-sm font-medium text-green-600 hover:text-green-700 py-2" onClick={() => setMobileMenuOpen(false)}>
                Wallet: ৳{balance.toFixed(0)}
              </Link>
            )}

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
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-red-600 hover:text-red-700 py-2 text-left">
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
