"use client";

import { useGet } from "@/hooks/useGet";
import type { User } from "@/types";

export default function SellerUsersPage() {
  const { data, isLoading } = useGet<{ success: boolean; users: User[] }>(
    ["users"],
    "/api/seller/users"
  );

  const users = data?.users || [];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <h2 className="text-lg font-medium mb-6">All Customers</h2>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No customers found.</p>
        ) : (
          <div className="max-w-5xl overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500">
                  <th className="py-3 px-4 font-medium">#</th>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Email</th>
                  <th className="py-3 px-4 font-medium">Cart Items</th>
                  <th className="py-3 px-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">{Object.keys(user.cartItems || {}).length}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
