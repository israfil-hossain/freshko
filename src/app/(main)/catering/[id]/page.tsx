"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, ArrowLeft, Mail, MapPin, MessageCircle } from "lucide-react";

interface Service {
  id: string;
  title: string;
  tag: string;
  description: string;
  fullDescription: string;
  image: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
}

const defaultServices: Service[] = [
  {
    id: "weddings",
    title: "Weddings & Receptions",
    tag: "50–1000 guests",
    description: "Full-day catering with customized menu, live stations, and a dedicated service team.",
    fullDescription: "Make your special day truly unforgettable with our premium wedding catering service. From intimate nikah ceremonies to grand reception feasts, we handle every detail — menu customization, live cooking stations, elegant table setups, and a professional service team that ensures your guests are taken care of from start to finish.\n\nOur experienced chefs craft dishes that blend traditional flavors with modern presentation, making every bite memorable.",
    image: "/catering_hero.jpg",
  },
  {
    id: "corporate",
    title: "Corporate Events",
    tag: "Any size",
    description: "Breakfast, lunch, and dinner packages for meetings, seminars, and company parties.",
    fullDescription: "Impress your colleagues and clients with our professional corporate catering. Whether it's a board meeting, annual seminar, product launch, or company celebration — we deliver timely, well-presented meals that match the tone of your event.\n\nChoose from curated breakfast platters, working lunches, evening high-tea, or full dinner spreads. Flexible packages for 10 to 500+ guests.",
    image: "/catering_food.jpg",
  },
  {
    id: "private",
    title: "Private Parties",
    tag: "10–200 guests",
    description: "Birthdays, anniversaries, Eid gatherings — we make every occasion special.",
    fullDescription: "From birthday bashes to anniversary dinners and Eid gatherings — we bring the flavor to your private celebrations. Our team works closely with you to design a menu that fits your theme, dietary needs, and budget.\n\nEnjoy stress-free hosting while we take care of cooking, serving, and cleanup. Indoor or outdoor — we adapt to any venue.",
    image: "/catering_hero.jpg",
  },
];

const defaultContact: ContactInfo = {
  phone: "+880 1700-000000",
  email: "info@freshko.com.bd",
  address: "Gulshan-2, Dhaka 1212",
  whatsapp: "+880 1700-000000",
};

export default function CateringServiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<ContactInfo>(defaultContact);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/catering/content`);
        const data = await res.json();
        if (data.success) {
          if (data.contact && (data.contact.phone || data.contact.email || data.contact.address)) {
            setContact(data.contact);
          }
          const apiServices = data.services || [];
          const merged = apiServices.length > 0 ? apiServices : defaultServices;
          const found = merged.find((s: Service) => s.id === id);
          setService(found || null);
        } else {
          const found = defaultServices.find((s) => s.id === id);
          setService(found || null);
        }
      } catch {
        const found = defaultServices.find((s) => s.id === id);
        setService(found || null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted">Service not found</p>
        <Link href="/catering" className="text-amber-600 font-medium hover:underline">
          Back to Catering
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <Image
          src={service.image || "/catering_hero.jpg"}
          alt={service.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-6 left-6">
          <Link
            href="/catering"
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
        <div className="absolute bottom-8 left-6 right-6 md:left-12 md:right-auto">
          <span className="inline-flex items-center bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            {service.tag}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white max-w-lg">
            {service.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">About this service</h2>
          <p className="text-muted leading-relaxed whitespace-pre-line">
            {service.fullDescription || service.description}
          </p>
        </div>

        {/* Contact Info */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted">Call us</p>
                  <p className="text-sm font-bold text-foreground">{contact.phone}</p>
                </div>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted">Email</p>
                  <p className="text-sm font-bold text-foreground">{contact.email}</p>
                </div>
              </a>
            )}
            {contact.address && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted">Address</p>
                  <p className="text-sm font-bold text-foreground">{contact.address}</p>
                </div>
              </div>
            )}
            {contact.whatsapp && (
              <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted">WhatsApp</p>
                  <p className="text-sm font-bold text-foreground">{contact.whatsapp}</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Ready to book this service?</h3>
          <p className="text-sm text-muted mb-6">
            Contact us now and we&apos;ll get back to you within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            )}
            {contact.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
