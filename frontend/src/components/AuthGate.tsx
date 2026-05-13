"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/api";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublicPath = PUBLIC_PATHS.has(pathname) || pathname.startsWith("/musteri/");

    if (isPublicPath) {
      const token = getStoredToken();
      if (token && PUBLIC_PATHS.has(pathname)) {
        router.replace("/");
        return;
      }
      setReady(true);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  const isPublicPath = PUBLIC_PATHS.has(pathname) || pathname.startsWith("/musteri/");

  if (!ready && !isPublicPath) {
    return <div className="p-8 text-sm text-bal-text-muted">Yönlendiriliyor...</div>;
  }

  return <>{children}</>;
}
