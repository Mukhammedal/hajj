import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "HajjCRM",
  description: "SaaS-платформа для хадж-операторов Казахстана: кабинет паломника, CRM, админ-панель и Supabase backend.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
