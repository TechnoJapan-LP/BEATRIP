/**
 * curated hotel の安定 slug を生成する。
 * name は日本語/英語混在のため URL safe にはせず、識別キー専用。
 * Server Component からも import 可能 ("use client" 無し)。
 */
export function buildHotelSlug(citySlug: string, name: string): string {
  return `${citySlug}:${name}`;
}
