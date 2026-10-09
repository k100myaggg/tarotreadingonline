import React from "react";
import { Metadata } from "next";
import { Locale } from "@/types/tarot";
import { READING_TYPES, getReadingTypeBySlug } from "@/lib/tarot/readingTypes";
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
  const config = getReadingTypeBySlug("card-of-the-day")!;
  const title = `${config.name[locale as Locale] || config.name.en} | Free Daily Oracle | Arcana 3D Tarot`;
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
      canonical: `/${locale}/card-of-the-day`,
    },
  };
}

export default async function CardOfTheDayPage({ params }: PageProps) {
  const { locale } = await params;
  const activeLocale = (locale || "en") as Locale;
  const config = getReadingTypeBySlug("card-of-the-day")!;

  return <DedicatedReadingRoom config={config} locale={activeLocale} />;
}
