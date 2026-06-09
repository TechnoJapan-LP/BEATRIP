import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import Link from "next/link";
import { Palmtree, Sun, Waves, Car, Plane, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { getDestinationImage } from "@/lib/deals/destination-images";

// ISR: 21600秒キャッシュ (6時間)
export const revalidate = 21600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "Okinawa travel guide — main island, Miyako, Ishigaki and beyond | BEATRIP"
    : "沖縄旅行ガイド｜本島・宮古・石垣の予約・比較 | BEATRIP";
  const description = isEn
    ? "Book Okinawa at the lowest fare. From the main island's resort coast to the outer islands of Miyako, Ishigaki, Iriomote and Kume — with the best time to visit, what to pack, rental car tips, and Naha airport access. Compare across BEATRIP's curated Okinawa booking partners."
    : "沖縄旅行を最安値で予約。本島の王道リゾートから、宮古島・石垣島・西表島・久米島の離島まで、ベストシーズン・必需品・レンタカー・那覇空港アクセスのガイドつき。BEATRIP厳選の沖縄専門予約サイトから比較できます。";
  const path = isEn ? "/en/okinawa" : "/okinawa";
  return {
    title,
    description,
    keywords: isEn
      ? ["Okinawa travel", "Okinawa from Tokyo", "Miyako Island", "Ishigaki", "Iriomote", "Naha", "Okinawa best season", "Okinawa rental car"]
      : ["沖縄 旅行", "沖縄 ツアー", "沖縄 格安", "沖縄本島", "宮古島", "石垣島", "西表島", "久米島", "沖縄 ベストシーズン", "沖縄 レンタカー"],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/okinawa",
        en: "https://beatrip.jp/en/okinawa",
        "x-default": "https://beatrip.jp/okinawa",
      },
    },
  };
}

const ISLANDS: { name: string; tagline: string; spots: string[] }[] = [
  {
    name: "沖縄本島",
    tagline: "王道・初心者向け。那覇〜恩納〜美ら海まで王道リゾートが集結",
    spots: ["国際通り", "首里城", "美ら海水族館", "古宇利島", "恩納村ビーチ"],
  },
  {
    name: "宮古島",
    tagline: "海の透明度No.1。ビーチ目当てなら迷わずここ",
    spots: ["与那覇前浜ビーチ", "伊良部大橋", "砂山ビーチ", "下地島", "東平安名崎"],
  },
  {
    name: "石垣島",
    tagline: "離島巡りの拠点。八重山ブルーの玄関口",
    spots: ["川平湾", "御神崎", "底地ビーチ", "玉取崎展望台", "離島ターミナル"],
  },
  {
    name: "西表島",
    tagline: "ジャングルと滝。世界自然遺産のアドベンチャー",
    spots: ["仲間川マングローブ", "由布島", "ピナイサーラの滝", "星砂の浜"],
  },
  {
    name: "久米島",
    tagline: "球美の島。ハテの浜のシュノーケルとリゾート静寂",
    spots: ["はての浜", "イーフビーチ", "ミーフガー", "畳石"],
  },
];

const SEASONS = [
  { label: "ベストシーズン", months: "4-6月, 10-11月", note: "梅雨明け前後と秋口。海水温暖かく台風リスクも低めで料金も抑えめ" },
  { label: "ハイシーズン", months: "7-8月", note: "夏休み・お盆で料金は最高値。海は最高だが台風直撃リスクあり" },
  { label: "梅雨", months: "5月中旬-6月下旬", note: "本土より早く雨多め。ただし晴れ間も多く、料金面ではむしろ狙い目" },
  { label: "台風シーズン", months: "8-10月", note: "進路次第で欠航リスクあり。航空券のフレキシブル運賃や早めの帰島を" },
  { label: "オフシーズン", months: "12-2月", note: "海水浴は不向きだが、ホエールウォッチング・最安値旅行・桜（1月下旬-2月）" },
];

const ESSENTIALS: { icon: typeof Sun; title: string; body: string }[] = [
  {
    icon: Sun,
    title: "日焼け対策（reef-safe）",
    body: "亜熱帯の紫外線は本土の数倍。SPF 50+ 必須。沖縄ではサンゴ礁保護のため reef-safe（オキシベンゾン・オクチノキサート不使用）の日焼け止め選びを推奨。ラッシュガード長袖がさらに安心。",
  },
  {
    icon: Waves,
    title: "マリンシューズ・水着",
    body: "ビーチの多くがサンゴ片・岩場混じり。マリンシューズで足元保護を。シュノーケル・マスクは現地レンタル可だが、フィット重視なら持参が無難。",
  },
  {
    icon: Car,
    title: "レンタカー（ほぼ必須）",
    body: "本島・宮古・石垣ともに公共交通が限られ、観光地巡りはレンタカー前提。繁忙期は2〜3ヶ月前から在庫が枯れるため早期予約必須。那覇空港隣接の営業所が便利。",
  },
  {
    icon: Plane,
    title: "那覇空港アクセス",
    body: "那覇空港はゆいレール（モノレール）で那覇市街と直結。所要15分・往復券もあり。離島へは那覇からの乗継便（JTA・RAC）か、東京・大阪からの直行便（宮古・石垣）も選択肢に。",
  },
  {
    icon: Waves,
    title: "雨具・羽織もの",
    body: "スコールが突然降る亜熱帯気候。折りたたみ傘か速乾ポンチョを。冷房の効いた室内・夜の屋外には薄手の羽織を1枚。",
  },
];

const FAQS = [
  {
    q: "沖縄旅行のベストシーズンはいつですか？",
    a: "観光に最適なのは4-6月（梅雨明け前後）と10-11月。海水温が暖かく、台風リスクも比較的低く、料金もハイシーズンより抑えめです。7-8月は海は最高ですが、夏休み・お盆で料金は最高値、台風直撃リスクもあるため要注意。12-2月は海水浴は不向きですが、ホエールウォッチングと1月下旬-2月の桜（カンヒザクラ）が楽しめます。",
  },
  {
    q: "沖縄旅行は何泊くらいが目安？",
    a: "本島のみなら3泊4日、本島＋離島1つで4-5泊が定番。宮古・石垣だけを満喫するなら3-4泊で十分です。離島巡り（石垣＋西表＋竹富）をするなら5-6泊取って高速船移動の予備日を確保すると安心。日帰り・1泊2日は移動だけで終わるためおすすめしません。",
  },
  {
    q: "沖縄旅行にレンタカーは必要？",
    a: "本島・宮古・石垣はレンタカーがほぼ必須です。公共交通（バス・モノレール）は那覇市街以外は本数が少なく、主要観光地はバスでは効率的に回れません。離島の竹富島・西表島・久米島はレンタサイクルや路線バスでも代替可。繁忙期（GW・お盆・年末年始）は2-3ヶ月前から在庫が枯れるため、早期予約が必須です。",
  },
  {
    q: "宮古島と石垣島、初めてならどちら？",
    a: "ビーチの透明度・白砂を最優先するなら宮古島。与那覇前浜・砂山ビーチなど日本トップクラスの海が広がり、レンタカーで島内を完結できます。離島巡り（竹富・西表・小浜・波照間）をしたいなら石垣島。離島ターミナルから高速船で30-50分でアクセスでき、1拠点で複数島を楽しめます。",
  },
  {
    q: "沖縄旅行の費用相場はどれくらい？",
    a: "東京発3泊4日で航空券＋ホテルのパッケージで1人¥40,000〜¥90,000が目安。ハイシーズン（GW・お盆・年末年始）は¥120,000を超えることも。航空券単体なら往復¥20,000〜¥60,000、本島ホテルは1泊¥8,000〜¥30,000程度。離島は本島より1-2割高め。BEATRIP掲載の沖縄ツーリスト・エアトリ国内ツアー・ニーズツアーで最新セール価格を確認できます。",
  },
];

export default async function OkinawaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "沖縄旅行ガイド｜本島・宮古・石垣の予約・比較",
    description:
      "沖縄本島の王道リゾートから宮古・石垣・西表・久米まで、沖縄旅行のベストシーズン・必需品・レンタカー・予約サイト比較のガイド。",
    inLanguage: "ja-JP",
    datePublished: "2026-06-01",
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/okinawa",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const heroImage = getDestinationImage("OKA");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[320px] sm:h-[400px] overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage}
            alt="沖縄"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER_DARK}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-900/85 via-emerald-900/40 to-sky-700/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-8">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "沖縄" },
            ]}
          />
          <div className="mt-4 flex items-center gap-3 mb-2">
            <Palmtree className="h-7 w-7 text-emerald-300" />
            <Sun className="h-6 w-6 text-sky-200" />
            <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-200">
              Okinawa Travel Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
            沖縄旅行
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl">
            本島・宮古・石垣・西表・久米。航空券・ホテル・レンタカー・離島ツアーまで一括で比較・予約。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 本島 vs 離島 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                沖縄本島 vs 離島
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                初めてなら本島、海の透明度なら宮古、離島巡りなら石垣を起点に
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ISLANDS.map((island) => (
                  <div
                    key={island.name}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {island.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                      {island.tagline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {island.spots.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* シーズン情報 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                沖縄のシーズン
              </h2>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {SEASONS.map((s) => (
                    <div key={s.label} className="flex items-start gap-4 px-5 py-3">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {s.label}
                        </p>
                        <p className="text-xs text-sky-600 dark:text-sky-300 font-mono mt-0.5">
                          {s.months}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {s.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 必需品 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                沖縄の必需品
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ESSENTIALS.map((e) => (
                  <div
                    key={e.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <e.icon className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {e.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {e.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                沖縄旅行のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* おすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["okinawa"]}
              title="沖縄のおすすめホテル"
              subtitle="リゾート派から離島派まで、編集者が選ぶ代表的なホテル。"
              maxHotels={4}
            />

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/hotels/okinawa"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    沖縄のホテル詳細
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    エリア別の代表的ホテルを比較
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    沖縄のホテル一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hotels/okinawa/best-season"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    沖縄のベストシーズン詳細
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    月別のおすすめ度と気候
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    月別カレンダーを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hawaii"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors sm:col-span-2"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    姉妹特集: ハワイ旅行ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    オアフ・マウイ・ハワイ島のリゾート総合ガイド
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ハワイ特集を見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー: 沖縄 partner */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="沖縄旅行の予約・比較"
              subtitle="沖縄特化サイトからツアー・ホテルまで"
              categories={["tour-okinawa", "tour-package", "hotel-domestic"]}
              destinationCode="OKA"
              source="okinawa-landing"
            />

            <JapanesePartnersPanel
              title="現地で楽しむ・移動する"
              subtitle="航空券・レンタカー・現地アクティビティ"
              categories={["flight-domestic", "rental-car", "activity-domestic"]}
              destinationCode="OKA"
              source="okinawa-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
