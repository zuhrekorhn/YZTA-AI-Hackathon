"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export default function RouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.has(pathname) || pathname.startsWith("/musteri/");

  if (isPublicPath) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">{children}</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 pb-24 md:pb-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </>
  );
}
