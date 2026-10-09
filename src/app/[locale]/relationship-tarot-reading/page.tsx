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
  const config = getReadingTypeBySlug("relationship-tarot-reading")!;
  const title = `Relationship Tarot Reading | Gain Clarity on Connection | Arcana 3D`;
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
      canonical: `/${locale}/relationship-tarot-reading`,
    },
  };
}

export default async function RelationshipTarotPage({ params }: PageProps) {
  const { locale } = await params;
  const activeLocale = (locale || "en") as Locale;
  const config = getReadingTypeBySlug("relationship-tarot-reading")!;

  return <DedicatedReadingRoom config={config} locale={activeLocale} />;
}
