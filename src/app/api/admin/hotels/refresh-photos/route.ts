import { NextRequest, NextResponse } from "next/server";
import { CURATED_HOTELS } from "@/data/hotel-curated";
import { getHotelDestinationBySlug } from "@/data/hotel-destinations";
import {
  findPlaceId,
  getPlacePhotoName,
  isPlacesEnabled,
  diagnosePlaces,
} from "@/lib/google/places-client";
import {
  getCachedPlace,
  setCachedPlace,
  listAllCachedPlaces,
} from "@/lib/google/place-cache";

/**
 * /api/admin/hotels/refresh-photos
 *
 * Google Places API (New) を叩いてキュレートホテルの placeId + photoName を
 * KV にキャッシュするバッチ。CURATED_HOTELS のうち imageUrl 未設定の項目を
 * 対象とする (Wikimedia 既出ホテルは触らない)。
 *
 * 認証: Bearer ${ADMIN_API_KEY} or ?token=${ADMIN_API_KEY}
 *
 * クエリ:
 *   ?city=tokyo  ... 1 都市のみ処理
 *   ?all=1       ... 全 154 件処理 (1 リクエストあたり最大 MAX_PER_RUN 件で打ち切り)
 *   ?force=1     ... キャッシュ済みでも再取得
 *   ?dump=1      ... 取得は行わず、現在の KV キャッシュ全件を JSON で返す
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 1 リクエスト内の上限 (rate limit / コスト管理)
const MAX_PER_RUN = 50;
// 各 API 呼び出し間のディレイ (Google Places は QPS 制限有)
const DELAY_MS = 120;

function isAuthorized(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const header = req.headers.get("authorization") ?? "";
  if (header === `Bearer ${adminKey}`) return true;
  if (req.nextUrl.searchParams.get("token") === adminKey) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type Target = {
  citySlug: string;
  cityNameJa: string;
  hotelName: string;
};

function collectTargets(
  citySlugFilter: string | null
): { targets: Target[]; totalHotels: number; skippedWithImage: number } {
  const targets: Target[] = [];
  let totalHotels = 0;
  let skippedWithImage = 0;

  for (const [citySlug, hotels] of Object.entries(CURATED_HOTELS)) {
    if (citySlugFilter && citySlug !== citySlugFilter) continue;
    const dest = getHotelDestinationBySlug(citySlug);
    if (!dest) continue;
    for (const h of hotels) {
      totalHotels++;
      // Wikimedia 等が既に当てられている hotel は触らない
      if (h.imageUrl) {
        skippedWithImage++;
        continue;
      }
      targets.push({
        citySlug,
        cityNameJa: dest.nameJa,
        hotelName: h.name,
      });
    }
  }
  return { targets, totalHotels, skippedWithImage };
}

/**
 * GET: 読み取り専用の diag / dump のみ。ブラウザで URL を直接開いて確認できる
 * (シェルの & エスケープ問題を回避)。取得 (副作用あり) は POST のみ。
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }
  const sp = req.nextUrl.searchParams;
  if (sp.get("diag") === "1") {
    const diag = await diagnosePlaces();
    return NextResponse.json({ success: true, diagnostic: diag });
  }
  if (sp.get("dump") === "1") {
    const items = await listAllCachedPlaces();
    return NextResponse.json({ success: true, count: items.length, items });
  }
  return NextResponse.json(
    {
      success: false,
      error:
        "GET は ?diag=1 または ?dump=1 のみ対応。写真取得は POST ?all=1 / ?city=<slug> を使用。",
    },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const cityFilter = sp.get("city");
  const all = sp.get("all") === "1";
  const force = sp.get("force") === "1";
  const dump = sp.get("dump") === "1";

  if (dump) {
    const items = await listAllCachedPlaces();
    return NextResponse.json({ success: true, count: items.length, items });
  }

  // 診断モード: Google Places API の生レスポンスを返す (key 権限/有効化の切り分け)
  if (sp.get("diag") === "1") {
    const diag = await diagnosePlaces();
    return NextResponse.json({ success: true, diagnostic: diag });
  }

  if (!cityFilter && !all) {
    return NextResponse.json(
      { success: false, error: "specify ?city=<slug> or ?all=1" },
      { status: 400 }
    );
  }

  if (!isPlacesEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: "GOOGLE_PLACES_API_KEY is not set",
      },
      { status: 503 }
    );
  }

  const { targets, totalHotels, skippedWithImage } = collectTargets(cityFilter);
  const slice = targets.slice(0, MAX_PER_RUN);

  let processed = 0;
  let cachedSkip = 0;
  let lookupFailed = 0;
  let succeeded = 0;
  let apiCalls = 0;
  const failures: Array<{ citySlug: string; hotelName: string; reason: string }> = [];

  for (const t of slice) {
    processed++;

    if (!force) {
      const cached = await getCachedPlace(t.citySlug, t.hotelName);
      if (cached) {
        cachedSkip++;
        continue;
      }
    }

    const placeId = await findPlaceId(t.hotelName, t.cityNameJa);
    apiCalls++;
    if (!placeId) {
      lookupFailed++;
      failures.push({
        citySlug: t.citySlug,
        hotelName: t.hotelName,
        reason: "placeId not found",
      });
      // 学習エントリも残す (短期間の再試行を抑える)
      await setCachedPlace(t.citySlug, t.hotelName, {
        placeId: null,
        photoName: null,
        fetchedAt: new Date().toISOString(),
      });
      await sleep(DELAY_MS);
      continue;
    }

    await sleep(DELAY_MS);
    const photoName = await getPlacePhotoName(placeId);
    apiCalls++;

    await setCachedPlace(t.citySlug, t.hotelName, {
      placeId,
      photoName,
      fetchedAt: new Date().toISOString(),
    });

    if (photoName) {
      succeeded++;
    } else {
      lookupFailed++;
      failures.push({
        citySlug: t.citySlug,
        hotelName: t.hotelName,
        reason: "no photo on place",
      });
    }
    await sleep(DELAY_MS);
  }

  return NextResponse.json({
    success: true,
    summary: {
      total_curated_hotels: totalHotels,
      already_have_imageUrl: skippedWithImage,
      candidates_without_image: targets.length,
      processed_in_this_run: processed,
      cached_skipped: cachedSkip,
      newly_succeeded: succeeded,
      lookup_failed: lookupFailed,
      api_calls: apiCalls,
      remaining: Math.max(0, targets.length - processed),
    },
    failures: failures.slice(0, 20),
    note:
      targets.length > MAX_PER_RUN
        ? `1 リクエスト上限 ${MAX_PER_RUN} 件。残り ${targets.length - MAX_PER_RUN} 件は再度 POST してください。`
        : undefined,
  });
}
