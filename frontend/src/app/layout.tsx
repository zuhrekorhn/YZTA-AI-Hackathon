import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RouteShell from "@/components/RouteShell";
import AuthGate from "@/components/AuthGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KoopAI | Yönetim Paneli",
  description: "Yapay Zeka Destekli Operasyon Asistanı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-warm-bg text-primary-plum`}>
        <RouteShell>
          <AuthGate>{children}</AuthGate>
        </RouteShell>
      </body>
    </html>
  );
}
