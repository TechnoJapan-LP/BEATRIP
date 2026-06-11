/**
 * サイト運営者情報の一元管理 (E-E-A-T 基盤)。
 *
 * 後日このファイルの値を書き換えるだけで、以下のすべてに反映される:
 *   - /about の運営者情報セクション
 *   - /editorial-policy のお問い合わせ窓口
 *   - layout.tsx の Organization JSON-LD (contactPoint / sameAs / foundingDate)
 *
 * 値が未設定 ("") の項目は、画面では「準備中」表記になり、
 * 構造化データには出力されない (空文字を schema に載せない)。
 */

export const SITE_NAME = "BEATRIP";
export const SITE_URL = "https://beatrip.jp";

/** 運営者名 (正式名称が決まり次第ここを更新) */
export const SITE_OPERATOR = {
  ja: "BEATRIP 運営事務局",
  en: "BEATRIP Editorial Team",
} as const;

/** お問い合わせメールアドレス。未設定 ("") の間は「準備中」表示 + schema 非出力 */
export const CONTACT_EMAIL = "";

/** 運営開始年 (Organization schema の foundingDate にも使用) */
export const ESTABLISHED = "2026";

/**
 * Bluesky 公式アカウントのプロフィール URL。
 * 自動投稿 (src/lib/social/bluesky.ts) と同じ BLUESKY_HANDLE env から導出する。
 * env 未設定の間は "" となり、sameAs には出力されない。
 * handle 確定後は直接文字列を書いてもよい: "https://bsky.app/profile/<handle>"
 */
export const BLUESKY_PROFILE_URL = process.env.BLUESKY_HANDLE
  ? `https://bsky.app/profile/${process.env.BLUESKY_HANDLE}`
  : "";

/** Organization schema の sameAs に載せる外部プロフィール一覧 (空文字は除外) */
export const ORGANIZATION_SAME_AS: string[] = [BLUESKY_PROFILE_URL].filter(
  Boolean
);
