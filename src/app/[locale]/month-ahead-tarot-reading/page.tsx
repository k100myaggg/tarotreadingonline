import React from "react";
import { Metadata } from "next";
import { Locale } from "@/types/tarot";
import { getReadingTypeBySlug } from "@/lib/tarot/readingTypes";
import { DedicatedReadingRoom } from "@/components/reading/DedicatedReadingRoom";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "hi" }, { locale: "ja" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = getReadingTypeBySlug("month-ahead-tarot-reading")!;
  const title = `Month-Ahead Tarot Reading | 4-Week Future Forecast | Arcana 3D`;
  const description = config.description[locale as Locale] || config.description.en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}/month-ahead-tarot-reading`,
    },
  };
}

export default async function MonthAheadTarotPage({ params }: PageProps) {
  const { locale } = await params;
  const activeLocale = (locale || "en") as Locale;
  const config = getReadingTypeBySlug("month-ahead-tarot-reading")!;

  return <DedicatedReadingRoom config={config} locale={activeLocale} />;
}
