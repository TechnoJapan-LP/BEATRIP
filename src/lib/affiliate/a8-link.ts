/**
 * A8.net (バリューエージェント A8 ASP) リンクビルダー
 *
 * A8 のテキストリンク基本形:
 *   https://px.a8.net/svt/ejp?a8mat={MEDIA_ID}+{PROGRAM_ID}+{MATERIAL_TYPE}+{MATERIAL_ID}
 *
 * MEDIA_ID は BEATRIP のメディア固有 ID (全広告主で共通)。
 * a8mat 全体は広告素材ごとに発行され、A8 管理画面からコピーする。
 *
 * 拡張機能:
 *   - 通常リンク: a8mat のみで広告主の指定 LP に飛ばす
 *   - カスタムリダイレクト: a8ejpredirect で広告主サイト内の任意 URL に飛ばす
 *     (広告主が許可している場合のみ。許可してない場合は無視される)
 *
 * トラッキング:
 *   A8 のテキストリンクには通常 1x1 トラッキング画像 (https://www15.a8.net/0.gif?a8mat=...)
 *   が付随するが、これは「インプレッション計測」用で必須ではない。クリック計測は
 *   px.a8.net 経由のクリックで自動的に走るため、BEATRIP では画像 pixel は省略する
 *   (1x1 でも数十リクエストになるとパフォーマンス影響あり)。
 */

/** A8 a8mat (例: "4B5OO6+C9ROEY+AD2+2N9S82") からリンクを生成 */
export function buildA8Link(a8mat: string, options?: { redirectUrl?: string }): string {
  const base = `https://px.a8.net/svt/ejp?a8mat=${a8mat}`;
  if (options?.redirectUrl) {
    return `${base}&a8ejpredirect=${encodeURIComponent(options.redirectUrl)}`;
  }
  return base;
}

/** A8 トラッキング画像 URL (任意で使う。BEATRIP では通常使わない) */
export function buildA8TrackingPixel(a8mat: string): string {
  return `https://www15.a8.net/0.gif?a8mat=${a8mat}`;
}

/** a8mat が有効っぽい形式かの簡易バリデーション (4 セグメント、+区切り、英数字) */
export function isValidA8Mat(a8mat: string | undefined | null): a8mat is string {
  if (!a8mat) return false;
  const parts = a8mat.split("+");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^[A-Z0-9]+$/.test(p));
}
