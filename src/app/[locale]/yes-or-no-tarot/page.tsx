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
  const config = getReadingTypeBySlug("yes-or-no-tarot")!;
  const title = `Yes or No Tarot Reading | Instant Direct Answer | Arcana 3D`;
  const description = config.description[locale as Locale] || config.description.en;

  return {
    title,
    description,
    keywords: ["yes or no tarot", "yes no tarot reading", "instant tarot yes no", "free tarot yes no"],
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}/yes-or-no-tarot`,
    },
  };
}

export default async function YesNoTarotPage({ params }: PageProps) {
  const { locale } = await params;
  const activeLocale = (locale || "en") as Locale;
  const config = getReadingTypeBySlug("yes-or-no-tarot")!;

  return <DedicatedReadingRoom config={config} locale={activeLocale} />;
}
