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
  const config = getReadingTypeBySlug("two-choices-tarot-reading")!;
  const title = `Two Choices Tarot Reading | Compare Path A vs Path B | Arcana 3D`;
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
      canonical: `/${locale}/two-choices-tarot-reading`,
    },
  };
}

export default async function TwoChoicesPage({ params }: PageProps) {
  const { locale } = await params;
  const activeLocale = (locale || "en") as Locale;
  const config = getReadingTypeBySlug("two-choices-tarot-reading")!;

  return <DedicatedReadingRoom config={config} locale={activeLocale} />;
}
