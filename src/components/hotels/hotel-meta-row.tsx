import { Star, Users, Wifi, Coffee, Waves, Dumbbell, Sparkles, Utensils, Wine, Car, Plane, Baby, PawPrint, Briefcase, Mountain, Bell } from "lucide-react";
import type { CuratedHotel } from "@/data/hotel-curated";

/**
 * curated hotel カードの「メタ情報行」：星評価 / 客室数 / レビュースコア / アメニティアイコン群。
 * 新しい CuratedHotel 拡張フィールドを使い、ホテル選びの判断材料を増やす。
 */

const AMENITY_META: Record<NonNullable<CuratedHotel["amenities"]>[number], { Icon: typeof Star; label: string }> = {
  pool: { Icon: Waves, label: "プール" },
  spa: { Icon: Sparkles, label: "スパ" },
  gym: { Icon: Dumbbell, label: "ジム" },
  restaurant: { Icon: Utensils, label: "館内レストラン" },
  bar: { Icon: Wine, label: "バー" },
  "free-wifi": { Icon: Wifi, label: "無料 Wi-Fi" },
  parking: { Icon: Car, label: "駐車場" },
  "airport-shuttle": { Icon: Plane, label: "空港送迎" },
  "kids-friendly": { Icon: Baby, label: "ファミリー向け" },
  "pet-friendly": { Icon: PawPrint, label: "ペット可" },
  onsen: { Icon: Waves, label: "温泉" },
  view: { Icon: Mountain, label: "眺望" },
  breakfast: { Icon: Coffee, label: "朝食" },
  concierge: { Icon: Bell, label: "コンシェルジュ" },
  business: { Icon: Briefcase, label: "ビジネス" },
};

const BEST_FOR_LABEL: Record<NonNullable<CuratedHotel["bestFor"]>[number], string> = {
  couple: "カップル",
  family: "ファミリー",
  business: "ビジネス",
  solo: "ひとり旅",
  luxury: "ラグジュアリー",
  budget: "コスパ重視",
  "long-stay": "長期滞在",
};

export function HotelMetaRow({
  hotel,
  hideReviewScore = false,
}: {
  hotel: CuratedHotel;
  /** Pack D: カード冒頭に大きな review highlight を別配置する場合は省略 */
  hideReviewScore?: boolean;
}) {
  return (
    <div className="mt-2 space-y-2 text-[11px] text-zinc-600 dark:text-zinc-400">
      {/* 星評価 + 客室数 + レビュースコア */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {hotel.star && (
          <span className="inline-flex items-center gap-0.5">
            {Array.from({ length: hotel.star }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </span>
        )}
        {!hideReviewScore && hotel.reviewScore != null && (
          <span className="inline-flex items-center gap-1">
            <span className="rounded bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-200">
              {hotel.reviewScore.toFixed(1)}
            </span>
            {hotel.reviewCount != null && (
              <span className="text-zinc-400">
                / {hotel.reviewCount.toLocaleString()}件
              </span>
            )}
          </span>
        )}
        {hotel.rooms != null && (
          <span className="inline-flex items-center gap-0.5 text-zinc-500">
            <Users className="h-3 w-3" />
            {hotel.rooms}室
          </span>
        )}
      </div>

      {/* アメニティアイコン群 */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {hotel.amenities.slice(0, 4).map((a) => {
            const meta = AMENITY_META[a];
            if (!meta) return null;
            return (
              <span
                key={a}
                title={meta.label}
                aria-label={meta.label}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-600 dark:text-zinc-300"
              >
                <meta.Icon className="h-3 w-3" />
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* 推奨利用シーン */}
      {hotel.bestFor && hotel.bestFor.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-zinc-500">
          <span className="font-bold">おすすめ:</span>
          {hotel.bestFor.map((b) => (
            <span key={b} className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5">
              {BEST_FOR_LABEL[b]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
