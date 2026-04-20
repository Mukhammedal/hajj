import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { DesignIconSprite } from "@/components/shell/design-icons";
import { amiri, fraunces, onest } from "@/app/fonts";

export const metadata: Metadata = {
  title: "HajjCRM",
  description: "SaaS-платформа для хадж-операторов Казахстана: кабинет паломника, CRM, админ-панель и Supabase backend.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${fraunces.variable} ${amiri.variable}`}>
      <body>
        <DesignIconSprite />
        {children}
      </body>
    </html>
  );
}
