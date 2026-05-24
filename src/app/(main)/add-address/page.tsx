"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import { assets } from "@/assets/assets";

const BD_PHONE_REGEX = /^(01[3-9]\d{8})$/;
const BD_ZIP_REGEX = /^\d{4}$/;

export default function AddAddressPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    houseNumber: "", floorNumber: "", roadNumber: "",
    city: "", state: "", zipcode: "", phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!BD_PHONE_REGEX.test(form.phone)) {
      errs.phone = "Enter a valid Bangladeshi phone number (e.g. 017xxxxxxxx)";
    }
    if (!BD_ZIP_REGEX.test(form.zipcode)) {
      errs.zipcode = "Enter a valid 4-digit Bangladeshi postal code";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!validate()) return;

    const payload = {
      firstName: user.name?.split(" ")[0] || "",
      lastName: user.name?.split(" ").slice(1).join(" ") || "",
      email: user.email,
      ...form,
      country: "Bangladesh",
    };

    try {
      const { data } = await api.post("/api/address/add", payload);
      if (data.success) {
        toast.success("Address added!");
        router.push("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add address");
    }
  };

  const fields = [
    { key: "houseNumber", label: "House Number", type: "text", required: true, placeholder: "e.g. 12" },
    { key: "floorNumber", label: "Floor Number", type: "text", required: true, placeholder: "e.g. 3rd Floor" },
    { key: "roadNumber", label: "Road Number", type: "text", required: true, placeholder: "e.g. Road 5, Block C" },
    { key: "city", label: "City", type: "text", required: true, placeholder: "e.g. Dhaka" },
    { key: "state", label: "District", type: "text", required: true, placeholder: "e.g. Dhaka" },
    { key: "zipcode", label: "Postal Code", type: "text", required: true, placeholder: "e.g. 1205" },
    { key: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "e.g. 01712345678" },
  ] as const;

  return (
    <main className="py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Image src={assets.add_address_iamge} alt="address" className="w-10 h-10" />
        <h2 className="text-xl font-semibold">Add Shipping Address</h2>
      </div>

      {user && (
        <div className="mb-6 p-3 bg-gray-50 rounded text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Name:</span> {user.name}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p className="text-xs text-gray-400">(Auto-filled from your account)</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label, type, required, placeholder }) => (
          <div key={key}>
            <label className="text-sm font-medium text-gray-600">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={(e) => {
                setForm({ ...form, [key]: e.target.value });
                if (errors[key]) setErrors({ ...errors, [key]: "" });
              }}
              placeholder={placeholder}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary mt-1"
              required={required}
            />
            {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
          </div>
        ))}

        <button type="submit" className="w-full bg-primary text-white py-2.5 rounded text-sm font-medium hover:opacity-90 cursor-pointer">
          Add Address
        </button>
      </form>
    </main>
  );
}
