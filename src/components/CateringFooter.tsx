"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
}

const defaultContact: ContactInfo = {
  phone: "+880 1700-000000",
  email: "info@freshko.com.bd",
  address: "Gulshan-2, Dhaka 1212",
  whatsapp: "+880 1700-000000",
};

export default function CateringFooter() {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/catering/content`);
        const data = await res.json();
        if (data.success && data.contact && (data.contact.phone || data.contact.email || data.contact.address)) {
          setContact(data.contact);
        }
      } catch {}
    };
    fetchContact();
  }, []);

  const items = [
    { icon: Phone, label: "Call us", value: contact.phone, href: `tel:${contact.phone}`, color: "amber" },
    { icon: MessageCircle, label: "WhatsApp", value: contact.whatsapp, href: `https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, "")}`, color: "emerald" },
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}`, color: "blue" },
    { icon: MapPin, label: "Visit us", value: contact.address, href: null, color: "rose" },
  ];

  const colorMap: Record<string, { bg: string; icon: string; hover: string }> = {
    amber: { bg: "bg-amber-50", icon: "text-amber-600", hover: "hover:bg-amber-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", hover: "hover:bg-emerald-100" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", hover: "hover:bg-blue-100" },
    rose: { bg: "bg-rose-50", icon: "text-rose-600", hover: "hover:bg-rose-100" },
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-amber-50/30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Get in <span className="text-amber-600">touch</span>
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Ready to make your event unforgettable? Contact us today for a free consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            const c = colorMap[item.color];
            const Wrapper = item.href ? "a" : "div";
            const wrapperProps = item.href ? { href: item.href, target: item.href.startsWith("http") ? "_blank" : undefined, rel: item.href.startsWith("http") ? "noopener noreferrer" : undefined } : {};

            return (
              <Wrapper
                key={item.label}
                {...wrapperProps}
                className={`group flex flex-col items-center text-center p-6 rounded-2xl ${c.bg} ${c.hover} border border-transparent hover:border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${item.href ? "cursor-pointer" : ""}`}
              >
                <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.icon} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] text-muted font-medium mb-1">{item.label}</p>
                <p className="text-sm font-bold text-foreground leading-snug">{item.value}</p>
              </Wrapper>
            );
          })}
        </div>

        <div className="text-center mt-10 pt-8 border-t border-gray-200/60">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Freshko Catering. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
