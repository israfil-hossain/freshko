import { Suspense } from "react";
import HomeContent from "@/components/HomeContent";

export default function HomePage() {
  return (
    <main className="px-3 md:px-5 lg:px-8 py-5">
      <Suspense fallback={<div className="py-8"><div className="h-32 bg-gray-100 rounded-lg animate-pulse" /></div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
