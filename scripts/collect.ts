/**
 * データ収集スクリプト (GitHub Actions から直接実行)
 *
 *   npx tsx scripts/collect.ts           … 収集を1回実行
 *   npx tsx scripts/collect.ts --check   … 最終収集の鮮度を確認 (番犬用)
 *
 * なぜ存在するか:
 *   以前は GitHub Actions → beatrip.jp/api/cron/scrape (Vercel) → 収集、という
 *   経路だったため、サイトのホスティングが止まるとデータ収集まで止まった
 *   (2026-11-12〜 Vercel の課金停止で丸5日分のセール/価格観測が欠測)。
 *   BEATRIP の資産は「観測した事実の蓄積」なので、収集はサイトの生死と
 *   切り離してここで直接回す。保存先は従来と同じ Upstash KV (REST)。
 *
 * やること (データの核だけ):
 *   1. 全社スクレイプ → セール情報を保存 (sale-store)
 *   2. 告知セールの開催実績をアーカイブ (sale-records) … 来年使う一次データ
 *   3. 実測運賃の観測を蓄積 (price-observations)
 *   4. 価格急落 (超お買い得) の検出 (hot-deals)
 *
 * やらないこと (意図的に除外):
 *   メール配信・価格アラート・X/Bluesky 投稿・記事生成・IndexNow。
 *   サイトが止まっている間にこれらを撒くと、死んだリンクを読者に送ることになる。
 *   サイト復帰後に配信を再開するときは /api/cron/scrape を別途叩けばよい
 *   (ただしこのスクリプトが先に保存済みなら、route 側は「新着なし」と判定する)。
 */

// sale-store の unstable_cache を素通りさせる (Next.js の外では必ず落ちるため)。
// 判定は呼び出し時なので import より前に立てておけば確実に効く。
process.env.BEATRIP_STANDALONE = "1";

const LAST_RUN_KEY = "beatrip:collector:last-run";
/** これより古ければ番犬が失敗させる (3時間おき実行 × 取りこぼし許容) */
const STALE_HOURS = 28;

function fail(msg: string): never {
  console.error(`::error::${msg}`);
  process.exit(1);
}

function guardEnvironment(): void {
  // 安全装置1: KV 必須。未設定だと各ストアがローカル FS にフォールバックし、
  // Actions の使い捨てディスクに書いて消える = 収集したつもりで全損する。
  const hasKv =
    (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!hasKv) {
    fail(
      "KV_REST_API_URL / KV_REST_API_TOKEN が未設定です。保存先が無いため中止します " +
        "(Settings → Secrets and variables → Actions に登録)"
    );
  }

  // 安全装置2: mock 禁止。SCRAPER_MODE の既定は "mock" で、その場合は
  // 架空のセールが本番 KV に書き込まれる (= データ捏造)。明示が無ければ
  // 本番と同じ hybrid を使い、mock が指定されていたら止める。
  if (!process.env.SCRAPER_MODE) process.env.SCRAPER_MODE = "hybrid";
  if (process.env.SCRAPER_MODE === "mock") {
    fail("SCRAPER_MODE=mock では実行しません (架空データが本番に入るため)");
  }

  if (!process.env.TRAVELPAYOUTS_API_TOKEN) {
    // 価格観測が丸ごと空になるが、セール実績の収集は続けられるので警告に留める
    console.warn(
      "::warning::TRAVELPAYOUTS_API_TOKEN が未設定のため、実測運賃の観測はスキップされます"
    );
  }
}

async function collect(): Promise<void> {
  guardEnvironment();

  const { scrapeAllAirlines } = await import("../src/lib/scrapers/index");
  const { saveSalesAndDetectChanges } = await import("../src/lib/store/sale-store");
  const { recordObservedSales } = await import("../src/lib/deals/sale-records");
  const { fetchBusinessWatchSales } = await import("../src/lib/flights/travelpayouts-prices");
  const { recordPriceObservations } = await import("../src/lib/deals/price-observations");
  const { scanHotDeals } = await import("../src/lib/deals/hot-deals");
  const { getKV } = await import("../src/lib/store/kv");

  const started = Date.now();
  const errors: string[] = [];

  // 1. スクレイプ + 保存
  const results = await scrapeAllAirlines();
  let newSales = 0;
  for (const result of results) {
    try {
      const change = await saveSalesAndDetectChanges(result);
      newSales += change.newSales.length;
    } catch (e) {
      errors.push(`save ${result.airlineCode}: ${(e as Error).message}`);
    }
  }
  const failedScrapes = results.filter((r) => !r.success).map((r) => r.airlineCode);

  // 2. 告知セールの開催実績 (TP は価格ウォッチであって告知セールではないので除外)
  let saleRecords = { added: 0, updated: 0, total: 0 };
  try {
    saleRecords = await recordObservedSales(
      results.filter((r) => r.airlineCode !== "TP").flatMap((r) => r.sales)
    );
  } catch (e) {
    errors.push(`sale-records: ${(e as Error).message}`);
  }

  // 3 + 4. 実測運賃の蓄積と急落検出 (エコノミー=TP ウォッチ + ビジネス)
  let observations = { routes: 0, points: 0 };
  let hotDeals = { detected: 0, active: 0, gone: 0 };
  try {
    const economy = results.filter((r) => r.airlineCode === "TP").flatMap((r) => r.sales);
    const business = await fetchBusinessWatchSales();
    const watched = [...economy, ...business];
    observations = await recordPriceObservations(watched);
    const scan = await scanHotDeals(watched);
    hotDeals = { detected: scan.detected.length, active: scan.active, gone: scan.wentGone };
  } catch (e) {
    errors.push(`observations/hot-deals: ${(e as Error).message}`);
  }

  const summary = {
    at: new Date().toISOString(),
    durationSec: Math.round((Date.now() - started) / 1000),
    airlines: results.length,
    failedScrapes,
    newSales,
    saleRecords,
    observations,
    hotDeals,
    errors,
  };

  // 安全装置3: 最終収集の記録 (番犬が見る)。保存処理が全滅した回は書かない
  // (書くと「収集できている」と誤認させるため)。
  const anySaved = results.length > errors.filter((e) => e.startsWith("save ")).length;
  if (anySaved) {
    await getKV()!.set(LAST_RUN_KEY, summary);
  }

  console.log(JSON.stringify(summary, null, 2));
  if (errors.length > 0) {
    fail(`収集は完了しましたが ${errors.length} 件のエラーがあります: ${errors.join(" / ")}`);
  }
}

async function check(): Promise<void> {
  guardEnvironment();
  const { getKV } = await import("../src/lib/store/kv");
  const last = await getKV()!.get<{ at: string }>(LAST_RUN_KEY);
  if (!last?.at) fail("収集の記録がまだありません (collect が一度も成功していない)");
  const ageH = (Date.now() - new Date(last.at).getTime()) / 3_600_000;
  console.log(`最終収集: ${last.at} (${ageH.toFixed(1)} 時間前)`);
  if (ageH > STALE_HOURS) {
    fail(`最終収集から ${ageH.toFixed(0)} 時間経過しています (しきい値 ${STALE_HOURS}h)`);
  }
}

(process.argv.includes("--check") ? check() : collect()).catch((e) => {
  fail(`予期しないエラー: ${(e as Error).stack ?? e}`);
});
