"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useWalletStore } from "@/stores/walletStore";
import { useEffect, useRef, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const balance = useWalletStore((s) => s.balance);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchBalance();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    router.push("/");
  };

  if (pathname.includes("seller")) return null;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm" : "bg-white/95 backdrop-blur-sm"} border-b border-border-light`}>
      <div className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 h-14 md:h-16">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3 flex-1 md:flex-none justify-start">
          <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 hover:bg-primary/5 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <img className="cursor-pointer w-20 md:w-28 transition-transform duration-300 group-hover:scale-105" src={assets.logo} alt="Freshko" />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {[
            { href: "/", label: "Home" },
            { href: "/monthly-bazar", label: "Monthly Bazar" },
            { href: "/catering", label: "Catering" },
            { href: "/support", label: "Support" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                pathname === link.href
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "text-gray-600 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-50 border border-border-light rounded-xl px-3 py-2 hover:border-primary/20 focus-within:border-primary focus-within:bg-white transition-all duration-200 focus-within:shadow-sm">
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              onChange={handleSearch}
              type="text"
              placeholder="Search products..."
              className="outline-none text-sm ml-2 bg-transparent w-32 lg:w-48 placeholder:text-muted/60"
            />
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative p-2.5 hover:bg-primary/5 rounded-xl transition-all duration-200 group">
            <svg className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-bounce-subtle shadow-sm shadow-accent/30">
                {cartCount}
              </span>
            )}
          </Link>

          {user && (
            <>
              {/* Wallet */}
              <Link href="/wallet" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-success/5 hover:bg-success/10 text-success rounded-xl text-sm font-semibold transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                ৳{balance.toFixed(0)}
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 hover:bg-primary/5 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-2xl shadow-2xl z-50 animate-fade-in-down overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => { markAllAsRead(); setShowNotifications(false); }}
                          className="text-xs text-primary font-medium hover:text-primary-light transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <svg className="mx-auto w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p className="text-sm text-muted">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notification, i) => (
                          <div
                            key={notification._id}
                            onClick={() => { markAsRead(notification._id); setShowNotifications(false); }}
                            className={`px-5 py-3.5 hover:bg-surface-hover cursor-pointer border-b border-border-light last:border-0 transition-colors animate-fade-in-up delay-${Math.min(i + 1, 10)} ${
                              !notification.isRead ? "bg-primary/[0.03]" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {!notification.isRead && (
                                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                                <p className="text-xs text-muted mt-0.5 line-clamp-2">{notification.message}</p>
                                <p className="text-[11px] text-muted/60 mt-1.5">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* User Menu / Login */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-primary/5 rounded-xl px-2 py-1.5 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm shadow-primary/20">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.name?.split(" ")[0]}</span>
                <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-2xl shadow-2xl z-50 animate-scale-in overflow-hidden">
                  <div className="px-5 py-4 border-b border-border-light bg-surface-hover">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    {[
                      { href: "/my-orders", label: "My Orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                      { href: "/my-subscriptions", label: "Subscriptions", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                      { href: "/wallet", label: `Wallet (৳${balance.toFixed(0)})`, icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", mobile: true },
                      { href: "/support", label: "Support", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", mobile: true },
                      { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-primary/[0.03] transition-colors ${item.mobile ? "md:hidden" : ""}`}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border-light py-1.5">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowUserLogin(true)}
              className="text-sm font-medium border border-primary/20 text-primary rounded-xl px-4 py-2 hover:bg-primary hover:text-white transition-all duration-200 hidden md:block btn-press"
            >
              Login
            </button>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-primary/5 rounded-xl transition-colors">
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
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-light bg-white animate-fade-in-down">
          <div className="flex flex-col p-4 gap-1">
            <div className="flex items-center bg-gray-50 border border-border-light rounded-xl px-3 py-2.5 mb-2">
              <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                onChange={handleSearch}
                type="text"
                placeholder="Search products..."
                className="outline-none text-sm ml-2 bg-transparent flex-1"
              />
            </div>

            {[
              { href: "/", label: "Home" },
              { href: "/monthly-bazar", label: "Monthly Bazar" },
              { href: "/catering", label: "Catering" },
              { href: "/support", label: "Support" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium py-3 px-3 rounded-xl transition-all ${
                  pathname === link.href
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-primary hover:bg-primary/5"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                href="/wallet"
                className="text-sm font-semibold text-success py-3 px-3 rounded-xl hover:bg-success/5 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wallet: ৳{balance.toFixed(0)}
              </Link>
            )}

            {!user && (
              <button
                onClick={() => { setShowUserLogin(true); setMobileMenuOpen(false); }}
                className="text-sm font-medium bg-primary text-white rounded-xl px-4 py-3 mt-2 btn-press"
              >
                Login / Sign Up
              </button>
            )}

            {user && (
              <div className="flex flex-col gap-0.5 pt-2 mt-2 border-t border-border-light">
                {[
                  { href: "/my-orders", label: "My Orders" },
                  { href: "/my-subscriptions", label: "My Subscriptions" },
                  { href: "/settings", label: "Settings" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-primary py-2.5 px-3 rounded-xl hover:bg-primary/5 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-sm text-danger hover:bg-danger/5 py-2.5 px-3 rounded-xl text-left transition-all"
                >
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
