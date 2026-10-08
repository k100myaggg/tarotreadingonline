import { MetadataRoute } from "next";
import { allCards, allSpreads } from "@/lib/tarot/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://arcana3d.com";
  const locales = ["en", "hi", "ja"];
  const staticRoutes = [
    "",
    "/reading",
    "/card-of-the-day",
    "/yes-or-no-tarot",
    "/love-tarot-reading",
    "/career-tarot-reading",
    "/relationship-tarot-reading",
    "/two-choices-tarot-reading",
    "/question-tarot-reading",
    "/month-ahead-tarot-reading",
    "/daily",
    "/cards",
    "/spreads",
    "/dashboard",
  ];

  const urls: MetadataRoute.Sitemap = [];

  // 1. Static Routes for each locale
  for (const locale of locales) {
    for (const route of staticRoutes) {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  // 2. All 78 Cards for each locale
  for (const locale of locales) {
    for (const card of allCards) {
      urls.push({
        url: `${baseUrl}/${locale}/cards/${card.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // 3. Spreads for each locale
  for (const locale of locales) {
    for (const spread of allSpreads) {
      urls.push({
        url: `${baseUrl}/${locale}/spreads/${spread.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return urls;
}
