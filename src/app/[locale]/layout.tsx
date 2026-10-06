import React from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { Locale } from "@/types/tarot";
import { isValidLocale } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const activeLocale = locale as Locale;

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-b from-[#06050b] via-[#090714] to-[#06050b]">
      {/* Background celestial glow particles */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,80,220,0.15),rgba(255,255,255,0))]" />
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.06),transparent_50%)]" />

      <Header locale={activeLocale} />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer locale={activeLocale} />
    </div>
  );
}
