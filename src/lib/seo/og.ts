/**
 * サイト共通の OG 画像 (SNS シェア時のカード画像)。
 *
 * Next.js の metadata は同一ルート上のセグメント間で **浅く** マージされ、
 * `openGraph` のようなネストしたフィールドは「後のセグメントが定義すると丸ごと
 * 上書きされる」。そのため root の `app/opengraph-image.tsx` が注入した images は、
 * `[lang]/layout.tsx` や各ページが `openGraph` を定義した時点で失われる。
 *
 * 公式ドキュメントが推奨する回避策どおり、共有定数を各 `openGraph` に spread する。
 * (generate-metadata.md「Overwriting fields」参照)
 *
 * 自セグメントに `opengraph-image.tsx` を持つページ (hotels / articles / airlines /
 * hotels/[city] / routes/[route] / deals/[id]) は Next が同セグメントで images を
 * 注入するため、この定数を入れる必要はない (入れると個別 OG 画像を潰しかねない)。
 *
 * URL は相対のままでよい。`[lang]/layout.tsx` の metadataBase により絶対 URL に解決される。
 */
export const OG_IMAGES = [
  {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "BEATRIP — 航空券セール情報ポータル",
  },
];
