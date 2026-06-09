"use client";

import { assets, features } from "@/assets/assets";

export default function Footer() {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 py-12 border-t border-gray-300">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-xs">
          <img src={assets.logo} alt="Freshko" className="w-28 mb-4" />
          <p className="text-sm text-gray-500">
            Fresh groceries delivered to your doorstep. Quality you can trust, savings you will love.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-medium mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-700">Home</a></li>
              <li><a href="#" className="hover:text-gray-700">Best Sellers</a></li>
              <li><a href="#" className="hover:text-gray-700">Offers & Deals</a></li>
              <li><a href="#" className="hover:text-gray-700">Contact Us</a></li>
              <li><a href="#" className="hover:text-gray-700">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Need help?</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-700">Delivery Info</a></li>
              <li><a href="#" className="hover:text-gray-700">Returns & Refund</a></li>
              <li><a href="#" className="hover:text-gray-700">Payment Methods</a></li>
              <li><a href="#" className="hover:text-gray-700">Track Order</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Follow Us</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-700">Instagram</a></li>
              <li><a href="#" className="hover:text-gray-700">Twitter</a></li>
              <li><a href="#" className="hover:text-gray-700">Facebook</a></li>
              <li><a href="#" className="hover:text-gray-700">YouTube</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400">© 2026 Freshko. All rights reserved.</p>
        <div className="flex gap-4">
          {["Facebook", "Instagram", "LinkedIn", "Twitter", "GitHub"].map((name) => (
            <a key={name} href="#" className="text-gray-400 hover:text-gray-600 text-sm">{name}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
