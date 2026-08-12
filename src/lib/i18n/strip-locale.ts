/**
 * パス先頭のロケール片 (/ja, /en) を剥がす。
 *
 * usePathname は環境で返り値が揺れる: dev はブラウザの表示パス
 * (/airlines/BC/sales) だが、本番は middleware のリライト後の内部パス
 * (/ja/airlines/BC/sales) を返す。パスで現在地判定するコンポーネント
 * (ボトムナビ等) は必ずこれを通してから比較すること。
 * 実際にこの差でボトムナビの active が本番だけ全滅した (2026-07-30)。
 */
export function stripLocale(p: string): string {
  const stripped = p.replace(/^\/(ja|en)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}
