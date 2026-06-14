"use client";

import { useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import LeftSidebar from "@/components/LeftSidebar";
import { usePathname } from "next/navigation";

function SidebarWrapper({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  return (
    <Suspense fallback={<aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 bg-white"><div className="sticky top-20 h-[calc(100vh-80px)] p-4"><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div></div></aside>}>
      <LeftSidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />
    </Suspense>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSellerPath = pathname.includes("seller");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {isSellerPath ? null : <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
      <LoginModal />
      {isSellerPath ? (
        <div>{children}</div>
      ) : (
        <div className="flex min-h-[calc(100vh-80px)]">
          <SidebarWrapper mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      )}
      {!isSellerPath && <Footer />}
    </>
  );
}