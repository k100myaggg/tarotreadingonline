import React from "react";
import { Metadata } from "next";
import { Locale } from "@/types/tarot";
import { getReadingTypeBySlug } from "@/lib/tarot/readingTypes";
import { DedicatedReadingRoom } from "@/components/reading/DedicatedReadingRoom";

import { supportedLocales } from "@/lib/i18n/dictionaries";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const config = getReadingTypeBySlug("career-tarot-reading")!;
  const title = `Career & Purpose Tarot Reading | Work, Wealth & Calling | Arcana 3D`;
  const description = config.description[locale as Locale] || config.description.en;

  return {
    title,
    description,
    keywords: ["career tarot reading", "job tarot", "tarot for career decisions", "money tarot reading", "life purpose tarot"],
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}/career-tarot-reading`,
    },
  };
}

export default async function CareerTarotPage({ params }: PageProps) {
  const { locale } = await params;
  const activeLocale = (locale || "en") as Locale;
  const config = getReadingTypeBySlug("career-tarot-reading")!;

  return <DedicatedReadingRoom config={config} locale={activeLocale} />;
}
