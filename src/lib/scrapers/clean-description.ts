/**
 * スクレイプ由来のセール説明文から、RSS/WordPress の定型ノイズを取り除く。
 *
 * Traicy 等の RSS 抜粋は本文の後ろに
 *   「[…] 投稿 <記事タイトル> は TRAICY（トライシー） に最初に表示されました。」
 *   "The post <title> appeared first on <site>."
 * という配信フッターが連結されており、そのまま画面に出すと
 * ユーザーには意味不明の文になる (実際に /airlines/SJO で発生)。
 *
 * 表示側で除去する理由: KV に保存済みの過去データにもノイズが含まれており、
 * スクレイパー側だけ直しても既存データが直らないため。
 */
export function cleanScrapedDescription(text: string): string {
  return (
    text
      // RSS の省略マーカー以降は全てフッター (本文が [] を含むことはまず無い)
      .replace(/\s*\[…\][\s\S]*$/u, "…")
      .replace(/\s*\[&hellip;\][\s\S]*$/u, "…")
      // マーカー無しでフッターだけ残っているケース
      .replace(/\s*投稿\s+[\s\S]*?に最初に表示されました。?\s*$/u, "")
      .replace(/\s*The post\s[\s\S]*?appeared first on[\s\S]*$/iu, "")
      .trim()
  );
}
