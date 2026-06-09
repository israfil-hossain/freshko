"use client";

import { useState } from "react";
import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function AllProductsPage() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: productsData, isLoading: productsLoading } = useGet<{
    success: boolean;
    products: Product[];
  }>(["products"], "/api/product/list");

  const { data: categoriesData, isLoading: categoriesLoading } = useGet<{
    success: boolean;
    categories: Category[];
  }>(["categories"], "/api/category/list");

  const allProducts = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLoading = productsLoading || categoriesLoading;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Sidebar Toggle Button - Mobile Only */}
        <div className="lg:hidden mb-4 w-full">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>
        </div>

        {/* Left Sidebar - Categories Filter */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block fixed inset-0 z-40 lg:relative lg:z-auto lg:inset-auto w-full lg:w-64 bg-white lg:bg-transparent pt-16 lg:pt-0 lg:border-r border-gray-200`}
        >
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="lg:sticky lg:top-20 p-6 lg:p-0 lg:pr-6">
            {/* Categories Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categories
              </h3>

              {categoriesLoading ? (
                <p className="text-sm text-gray-500">Loading categories...</p>
              ) : (
                <div className="space-y-2">
                  {/* All Products Option */}
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      selectedCategory === null
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Products
                  </button>

                  {/* Category Items */}
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories</p>
                  ) : (
                    categories.map((category) => {
                      const categoryProductCount = allProducts.filter(
                        (p) => p.category === category._id
                      ).length;

                      return (
                        <button
                          key={category._id}
                          onClick={() => {
                            setSelectedCategory(category._id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                            selectedCategory === category._id
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-6 h-6 object-cover rounded"
                            />
                          )}
                          <span className="flex-1 text-left">
                            {category.name}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              selectedCategory === category._id
                                ? "bg-blue-200 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {categoryProductCount}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-6 w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery
                ? `Search: "${searchQuery}"`
                : selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)?.name ||
                    "Products"
                  : "All Products"}
            </h2>
            <span className="text-sm text-gray-600">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-96">
              <div className="space-y-4">
                <div className="animate-spin">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-center">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your filters or search
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
