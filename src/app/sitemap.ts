import type { MetadataRoute } from "next";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { airlines } from "@/data/airlines";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";

const BASE_URL = "https://beatrip.jp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, deals] = await Promise.all([
    getAllArticles(),
    getActiveDeals(),
  ]);

  // 日英両対応のページ（UI＋静的ページ）。hreflangで関連付ける。
  const bilingual = (
    path: string,
    changeFrequency: "daily" | "monthly" | "yearly",
    priority: number
  ): MetadataRoute.Sitemap => {
    const jaUrl = `${BASE_URL}${path}`;
    const enUrl = `${BASE_URL}/en${path}`;
    const languages = { ja: jaUrl, en: enUrl };
    return [
      {
        url: jaUrl,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: { languages },
      },
      {
        url: enUrl,
        lastModified: new Date(),
        changeFrequency,
        priority: Math.round(priority * 90) / 100,
        alternates: { languages },
      },
    ];
  };

  const staticPages: MetadataRoute.Sitemap = [
    ...bilingual("", "daily", 1),
    {
      url: `${BASE_URL}/airlines`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...bilingual("/about", "monthly", 0.4),
    ...bilingual("/faq", "monthly", 0.4),
    ...bilingual("/terms", "yearly", 0.2),
    ...bilingual("/privacy", "yearly", 0.2),
  ];

  const dealPages: MetadataRoute.Sitemap = deals.map((deal) => ({
    url: `${BASE_URL}/deals/${deal.id}`,
    lastModified: new Date(deal.updated_at),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 路線ページ（/routes/NRT-BKK 等）— ロングテールSEOの柱
  const routeKeys = new Set<string>();
  for (const d of deals) {
    routeKeys.add(`${d.origin_code}-${d.destination_code}`);
  }
  const routePages: MetadataRoute.Sitemap = Array.from(routeKeys).map(
    (route) => ({
      url: `${BASE_URL}/routes/${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })
  );

  const airlinePages: MetadataRoute.Sitemap = airlines.flatMap((airline) => [
    {
      url: `${BASE_URL}/airlines/${airline.code}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/airlines/${airline.code}/sales`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]);

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ホテル特集（インデックス + 目的地別）
  const hotelPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/hotels`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...HOTEL_DESTINATIONS.map((d) => ({
      url: `${BASE_URL}/hotels/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [
    ...staticPages,
    ...dealPages,
    ...routePages,
    ...airlinePages,
    ...articlePages,
    ...hotelPages,
  ];
}
