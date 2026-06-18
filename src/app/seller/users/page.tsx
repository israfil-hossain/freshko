"use client";

import { useState, useMemo } from "react";
import { useGet } from "@/hooks/useGet";
import { Users, Mail, ShoppingCart, Calendar, Search } from "lucide-react";
import type { User } from "@/types";

export default function SellerUsersPage() {
  const { data, isLoading } = useGet<{ success: boolean; users: User[] }>(
    ["users"],
    "/api/seller/users"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const users = data?.users || [];

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">All Customers</h1>
              <p className="text-sm text-muted mt-0.5">
                {users.length} {users.length === 1 ? "customer" : "customers"} registered
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-border-light rounded-2xl pl-11 pr-4 py-3 text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
          />
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted font-medium">Loading customers...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <Users className="w-8 h-8 text-muted" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {searchQuery ? "No matching customers" : "No customers yet"}
            </h3>
            <p className="text-sm text-muted">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Customers will appear here once they register"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-border-light shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">#</th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">Customer</th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">Email</th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">Cart Items</th>
                    <th className="py-3.5 px-5 font-semibold text-muted text-xs uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className="border-b border-border-light/60 hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-muted">{index + 1}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-muted">{user.email}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5 text-muted" />
                          <span className="text-foreground font-medium">
                            {Object.keys(user.cartItems || {}).length}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-muted">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          <span>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all animate-fade-in"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white text-base font-bold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <span className="ml-auto text-xs text-muted font-medium">#{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-hover rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-3.5 h-3.5 text-muted" />
                      <span className="text-muted">Cart:</span>
                      <span className="font-medium text-foreground">
                        {Object.keys(user.cartItems || {}).length} items
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted" />
                      <span className="text-muted">Joined:</span>
                      <span className="font-medium text-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
