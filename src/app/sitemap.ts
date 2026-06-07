import type { MetadataRoute } from "next";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { airlines } from "@/data/airlines";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";
import { AIRPORTS } from "@/data/airports";

const BASE_URL = "https://beatrip.jp";

// ISR: 3600秒キャッシュ (1時間)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, deals] = await Promise.all([
    getAllArticles(),
    getActiveDeals(),
  ]);

  // 日英両対応のページ（UI＋静的ページ）。hreflangで関連付ける。
  const bilingual = (
    path: string,
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly",
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
    ...bilingual("/airlines", "weekly", 0.8),
    ...bilingual("/articles", "daily", 0.8),
    ...bilingual("/about", "monthly", 0.4),
    ...bilingual("/faq", "monthly", 0.4),
    ...bilingual("/terms", "yearly", 0.2),
    ...bilingual("/privacy", "yearly", 0.2),
    ...bilingual("/disclosure", "yearly", 0.3),
    // 特集ランディング
    ...bilingual("/cruise", "monthly", 0.7),
    ...bilingual("/hawaii", "monthly", 0.7),
    ...bilingual("/esim", "monthly", 0.7),
    ...bilingual("/package-tour", "monthly", 0.7),
    ...bilingual("/okinawa", "monthly", 0.7),
    ...bilingual("/ota-sales", "weekly", 0.7),
    // 空港ハブ + 地方便特集
    ...bilingual("/airports", "weekly", 0.7),
    ...bilingual("/local-flights", "weekly", 0.7),
  ];

  // 動的ルートも hreflang 付きで日英両対応に。
  // ja を主、en を補助 (priority を 0.9 倍) とし、alternates.languages で相互リンク。
  const dynamicBilingual = (
    path: string,
    lastModified: Date,
    changeFrequency: "daily" | "weekly" | "monthly",
    priority: number
  ): MetadataRoute.Sitemap => {
    const jaUrl = `${BASE_URL}${path}`;
    const enUrl = `${BASE_URL}/en${path}`;
    const languages = { ja: jaUrl, en: enUrl };
    return [
      {
        url: jaUrl,
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages },
      },
      {
        url: enUrl,
        lastModified,
        changeFrequency,
        priority: Math.round(priority * 90) / 100,
        alternates: { languages },
      },
    ];
  };

  const dealPages: MetadataRoute.Sitemap = deals.flatMap((deal) =>
    dynamicBilingual(
      `/deals/${deal.id}`,
      new Date(deal.updated_at),
      "daily",
      0.7
    )
  );

  // 路線ページ（/routes/NRT-BKK 等）— ロングテールSEOの柱
  const routeKeys = new Set<string>();
  for (const d of deals) {
    routeKeys.add(`${d.origin_code}-${d.destination_code}`);
  }
  const routePages: MetadataRoute.Sitemap = Array.from(routeKeys).flatMap(
    (route) =>
      dynamicBilingual(`/routes/${route}`, new Date(), "daily", 0.8)
  );

  const airlinePages: MetadataRoute.Sitemap = airlines.flatMap((airline) => [
    ...dynamicBilingual(
      `/airlines/${airline.code}`,
      new Date(),
      "weekly",
      0.6
    ),
    // /sales サブルートは日本語のみ（英語版未提供）
    {
      url: `${BASE_URL}/airlines/${airline.code}/sales`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]);

  const articlePages: MetadataRoute.Sitemap = articles.flatMap((article) =>
    dynamicBilingual(
      `/articles/${article.slug}`,
      new Date(article.published_at),
      "monthly",
      0.6
    )
  );

  // ホテル特集（インデックス + 目的地別 + 都市別ベストシーズン）— 日英両対応
  const hotelPages: MetadataRoute.Sitemap = [
    ...bilingual("/hotels", "weekly", 0.8),
    ...HOTEL_DESTINATIONS.flatMap((d) =>
      dynamicBilingual(`/hotels/${d.slug}`, new Date(), "weekly", 0.7)
    ),
    // 都市別ベストシーズン — 「{都市} ベストシーズン」「{都市} 何月」等の long-tail
    ...HOTEL_DESTINATIONS.flatMap((d) =>
      dynamicBilingual(
        `/hotels/${d.slug}/best-season`,
        new Date(),
        "monthly",
        0.6
      )
    ),
    // 都市別アクティビティ — 「{都市} ツアー」「{都市} 観光」等
    ...HOTEL_DESTINATIONS.flatMap((d) =>
      dynamicBilingual(
        `/hotels/${d.slug}/activities`,
        new Date(),
        "monthly",
        0.6
      )
    ),
    // 都市別 eSIM (海外のみ) — 「{都市} eSIM」「{都市} Wi-Fi」等
    ...HOTEL_DESTINATIONS.filter((d) => d.region !== "国内").flatMap((d) =>
      dynamicBilingual(
        `/hotels/${d.slug}/esim`,
        new Date(),
        "monthly",
        0.55
      )
    ),
    // 空港別ハブ — 「{空港} 発 セール」「{IATA} 空港 航空券」等の地方検索
    ...AIRPORTS.flatMap((a) =>
      dynamicBilingual(
        `/airports/${a.iata}`,
        new Date(),
        "weekly",
        a.size === "major" ? 0.7 : a.size === "regional" ? 0.6 : 0.5
      )
    ),
    // 航空会社 × 空港 — 「{航空会社} {空港} セール」のプログラマティック SEO
    // 実際に就航している組合せのみ (232 組 × 日英 = 464 URL)
    ...airlines.flatMap((airline) =>
      AIRPORTS.filter((a) =>
        a.airlines.includes(airline.code)
      ).flatMap((a) =>
        dynamicBilingual(
          `/airlines/${airline.code.toLowerCase()}/airports/${a.iata}`,
          new Date(),
          "weekly",
          0.5
        )
      )
    ),
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
