"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useGet } from "@/hooks/useGet";
import type { Category } from "@/types";

interface LeftSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function LeftSidebar({ mobileOpen, onMobileClose }: LeftSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  const { data: categoriesData, isLoading } = useGet<{
    success: boolean;
    categories: Category[];
  }>(["categories"], "/api/category/list");

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    return new Set<string>();
  });

  const categories = categoriesData?.categories || [];

  const isActive = (name: string) => {
    return decodeURIComponent(activeCategory).toLowerCase() === name.toLowerCase();
  };

  const handleCategoryClick = (name: string) => {
    if (pathname === "/") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", name);
      router.push(`/?${params.toString()}`);
    } else {
      router.push(`/?category=${encodeURIComponent(name)}`);
    }
    onMobileClose();
  };

  const handleAllProducts = () => {
    router.push("/");
    onMobileClose();
  };

  const toggleExpand = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 pb-3">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">Categories</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-3 space-y-0.5">
          <button
            onClick={handleAllProducts}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              !activeCategory
                ? "gradient-primary text-white shadow-sm shadow-primary/20"
                : "text-muted hover:bg-surface-hover"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All Products
          </button>

          {isLoading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-surface-hover rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">No categories yet</p>
          ) : (
            categories.map((cat) => {
              const hasSubs = (cat.subcategories?.length ?? 0) > 0;
              const expanded = expandedCategories.has(cat._id);
              const active = isActive(cat.name);

              return (
                <div key={cat._id}>
                  <button
                    onClick={() => {
                      if (hasSubs) toggleExpand(cat._id);
                      handleCategoryClick(cat.name);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "gradient-primary text-white shadow-sm shadow-primary/20"
                        : "text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {cat.image && (
                      <img src={cat.image} alt="" className="w-5 h-5 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <span className="flex-1 text-left truncate">{cat.name}</span>
                    {hasSubs && (
                      <svg
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${active ? "text-white/70" : "text-muted/50"} ${expanded ? "rotate-90" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  {hasSubs && expanded && (
                    <div className="ml-3 pl-3 border-l-2 border-border-light space-y-0.5 mt-0.5">
                      {cat.subcategories!.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => handleCategoryClick(sub.name)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive(sub.name)
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted hover:bg-surface-hover hover:text-foreground"
                          }`}
                        >
                          {sub.image && (
                            <img src={sub.image} alt="" className="w-4 h-4 object-cover rounded flex-shrink-0" />
                          )}
                          <span className="truncate">{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border-light bg-white">
        <div className="sticky top-20 h-[calc(100vh-80px)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-xl z-50 animate-slide-in">
            <div className="p-4 border-b border-border-light">
              <button onClick={onMobileClose} className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
