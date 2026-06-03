import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BEATRIP ブランドアセット",
  description: "SNS 用のアバター画像・バナー画像など、BEATRIP のブランド画像を配布",
  robots: { index: false }, // 検索結果には出さない（社内用ページ）
};

/**
 * ブランド画像配布ページ
 *
 * Bluesky / X / Threads / LINE 等のプロフィール設定で使用する画像を
 * プレビュー + ダウンロードする。SSR で動的に PNG が生成される。
 */
export default function BrandPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-4xl tracking-wide uppercase mb-2">
        Brand Assets
      </h1>
      <p className="text-sm text-zinc-500 mb-10">
        画像を右クリックして「画像を保存」、またはダウンロードリンクから取得して各SNSにアップロード。
      </p>

      <section className="mb-12">
        <h2 className="font-heading text-2xl tracking-wide uppercase mb-3">
          1. プロフィール画像（アバター）
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          1000×1000 PNG · Bluesky / X / Threads / LINE / Instagram の丸型・四角プロフィールに対応
        </p>
        <div className="rounded-2xl overflow-hidden ring-1 ring-zinc-200 bg-zinc-100 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/avatar"
            alt="BEATRIP avatar"
            width={400}
            height={400}
            style={{ display: "block", width: 400, height: 400 }}
          />
        </div>
        <div className="mt-3">
          <a
            href="/brand/avatar"
            download="beatrip-avatar.png"
            className="inline-block rounded-lg bg-zinc-900 text-white text-sm font-bold px-4 py-2 hover:bg-zinc-800 transition-colors"
          >
            ダウンロード →
          </a>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl tracking-wide uppercase mb-3">
          2. ヘッダー / バナー
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          1500×500 PNG · Twitter/Bluesky のヘッダー画像（自動リサイズで Bluesky の 3:1 ヘッダーにも収まる構図）
        </p>
        <div className="rounded-2xl overflow-hidden ring-1 ring-zinc-200 bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/banner"
            alt="BEATRIP banner"
            width={1500}
            height={500}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>
        <div className="mt-3">
          <a
            href="/brand/banner"
            download="beatrip-banner.png"
            className="inline-block rounded-lg bg-zinc-900 text-white text-sm font-bold px-4 py-2 hover:bg-zinc-800 transition-colors"
          >
            ダウンロード →
          </a>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-2xl tracking-wide uppercase mb-3">
          3. OG画像（参考）
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          サイトURLを SNS に貼ると自動でこの画像が展開される。ページ別の動的OGは各ページで自動生成。
        </p>
        <div className="rounded-2xl overflow-hidden ring-1 ring-zinc-200 bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/opengraph-image"
            alt="BEATRIP OG"
            width={1200}
            height={630}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>
      </section>

      <p className="text-xs text-zinc-400 leading-relaxed">
        このページは <code>robots: noindex</code> でクロール除外しています。
        ブランドアセットの追加が必要になったら <code>src/app/brand/</code> 配下のルートを増やしてください。
      </p>
    </main>
  );
}
