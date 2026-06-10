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
    // 高単価 ASP ランディング (クレカ / 海外旅行保険)
    ...bilingual("/credit-cards", "monthly", 0.75),
    ...bilingual("/insurance", "monthly", 0.75),
    // OTA 比較記事 (都市別) — 「{都市} ホテル Booking vs Agoda」の高 CTR ロングテール
    ...bilingual("/articles/ota-compare/tokyo", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/osaka", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/honolulu", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/seoul", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/bangkok", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/singapore", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/taipei", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/okinawa", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/sapporo", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/fukuoka", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/paris", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/hong-kong", "weekly", 0.75),
    ...bilingual("/articles/ota-compare/busan", "weekly", 0.75),
    // 旅行 Tips / ハウツーガイド — 「LCC コツ」「航空券 安い時期」等の汎用 long-tail
    ...bilingual("/articles/guides/lcc-tips", "monthly", 0.65),
    ...bilingual("/articles/guides/best-booking-timing", "monthly", 0.65),
    ...bilingual("/articles/guides/first-overseas-checklist", "monthly", 0.65),
    ...bilingual("/articles/guides/miles-complete-guide", "monthly", 0.65),
    ...bilingual("/articles/guides/baggage-rules", "monthly", 0.65),
    ...bilingual("/articles/guides/transit-guide", "monthly", 0.65),
    ...bilingual("/articles/guides/esim-setup-guide", "monthly", 0.65),
    ...bilingual("/articles/guides/family-travel-tips", "monthly", 0.65),
    // 旅行用語集 — 「旅行 用語」「LCC とは」等の辞書系 long-tail
    ...bilingual("/glossary", "monthly", 0.6),
    // セグメント別ホテルランキング — 「カップル ホテル」「家族 ホテル ランキング」等
    ...bilingual("/articles/rankings/couples", "weekly", 0.7),
    ...bilingual("/articles/rankings/family", "weekly", 0.7),
    ...bilingual("/articles/rankings/solo", "weekly", 0.7),
    // シーズン特集 — 年末年始 / GW / 夏休みの大型休暇需要
    ...bilingual("/seasons/year-end", "monthly", 0.7),
    ...bilingual("/seasons/golden-week", "monthly", 0.7),
    ...bilingual("/seasons/summer", "monthly", 0.7),
    // 月別シーズナル特集 — 2026 秋 / 冬の月別ガイド (年末年始除く狙い目時期)
    ...bilingual("/articles/seasonal/autumn-2026", "monthly", 0.7),
    ...bilingual("/articles/seasonal/winter-2026", "monthly", 0.7),
    // 高検索ボリュームランディング — セール予測 / マイル予約ガイド
    ...bilingual("/articles/sale-prediction-2027", "weekly", 0.75),
    ...bilingual("/articles/miles-booking-guide", "monthly", 0.75),
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
  // deal 由来に加えて AIRPORTS.popularRoutes からも生成 (deal 不在の地方便もインデックス対象)
  const routeKeys = new Set<string>();
  for (const d of deals) {
    routeKeys.add(`${d.origin_code}-${d.destination_code}`);
  }
  for (const ap of AIRPORTS) {
    for (const dst of ap.popularRoutes ?? []) {
      if (/^[A-Z]{3}$/.test(dst) && dst !== ap.iata) {
        routeKeys.add(`${ap.iata}-${dst}`);
      }
    }
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
    // 地方便 region 別深掘り (9 region × 日英 = 18 URL)
    ...["hokkaido", "tohoku", "kanto", "chubu", "kinki", "chugoku", "shikoku", "kyushu", "okinawa"].flatMap(
      (region) =>
        dynamicBilingual(
          `/local-flights/${region}`,
          new Date(),
          "weekly",
          0.65
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
