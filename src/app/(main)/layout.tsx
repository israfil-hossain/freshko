"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSellerPath = pathname.includes("seller");

  return (
    <>
      {isSellerPath ? null : <Navbar />}
      <LoginModal />
      <div className={isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}>
        {children}
      </div>
      {!isSellerPath && <Footer />}
    </>
  );
}
