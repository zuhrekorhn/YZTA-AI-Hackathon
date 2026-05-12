"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kurumAdi");
    if (!saved && pathname !== "/login") {
      router.push("/login");
    } else {
      setIsReady(true);
    }
  }, [pathname, router]);

  const isLoginPage = pathname === "/login";

  return (
    <html lang="tr">
      <body className={`${inter.className} bg-warm-bg text-bal-primary antialiased`}>
        {isLoginPage ? (
          children
        ) : !isReady ? (
          <div className="min-h-screen flex items-center justify-center font-black text-bal-primary">
            Yükleniyor...
          </div>
        ) : (
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-4 pb-24 md:pb-4 md:p-8 overflow-x-hidden">
              <Navbar />
              <div className="mt-8">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
