export type SaleRecord = {
  id: string;
  airlineCode: string;
  airlineName: string;
  saleName: string;
  startDate: string;
  endDate: string;
  routes: string[];
  minPrice: number;
  maxDiscount: number;
  cabin: string;
};

export const saleHistory: SaleRecord[] = [
  // ANA
  { id: "h-ana-01", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA スーパーバリュー SALE", startDate: "2024-05-15", endDate: "2024-05-31", routes: ["NRT→BKK", "HND→JFK", "NRT→CDG"], minPrice: 42000, maxDiscount: 43, cabin: "Economy" },
  { id: "h-ana-02", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA タイムセール", startDate: "2024-08-10", endDate: "2024-08-20", routes: ["NRT→BKK", "NRT→SIN"], minPrice: 39000, maxDiscount: 45, cabin: "Economy" },
  { id: "h-ana-03", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA スーパーバリュー SALE", startDate: "2024-11-20", endDate: "2024-12-05", routes: ["NRT→BKK", "HND→JFK", "NRT→LHR", "NRT→CDG"], minPrice: 40000, maxDiscount: 48, cabin: "Economy" },
  { id: "h-ana-04", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA ビジネスクラス タイムセール", startDate: "2025-02-01", endDate: "2025-02-14", routes: ["HND→JFK", "NRT→LHR"], minPrice: 198000, maxDiscount: 35, cabin: "Business" },
  { id: "h-ana-05", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA スーパーバリュー SALE", startDate: "2025-05-12", endDate: "2025-05-28", routes: ["NRT→BKK", "HND→JFK", "NRT→CDG", "NRT→SIN"], minPrice: 38000, maxDiscount: 50, cabin: "Economy" },
  { id: "h-ana-06", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA 秋の旅割", startDate: "2025-09-15", endDate: "2025-09-30", routes: ["NRT→BKK", "NRT→HKG", "NRT→SIN"], minPrice: 41000, maxDiscount: 42, cabin: "Economy" },
  { id: "h-ana-07", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA スーパーバリュー SALE", startDate: "2025-11-18", endDate: "2025-12-03", routes: ["NRT→BKK", "HND→JFK", "NRT→LHR"], minPrice: 39000, maxDiscount: 47, cabin: "Economy" },
  { id: "h-ana-08", airlineCode: "ANA", airlineName: "ANA", saleName: "ANA スーパーバリュー SALE", startDate: "2026-05-10", endDate: "2026-05-25", routes: ["NRT→BKK", "HND→JFK", "NRT→CDG"], minPrice: 38000, maxDiscount: 51, cabin: "Economy" },

  // JAL
  { id: "h-jal-01", airlineCode: "JAL", airlineName: "JAL", saleName: "JAL スペシャルセーバー", startDate: "2024-06-01", endDate: "2024-06-15", routes: ["HND→CDG", "NRT→LHR", "HND→LAX"], minPrice: 85000, maxDiscount: 38, cabin: "Economy" },
  { id: "h-jal-02", airlineCode: "JAL", airlineName: "JAL", saleName: "JAL タイムセール", startDate: "2024-09-10", endDate: "2024-09-20", routes: ["NRT→BKK", "HND→SIN"], minPrice: 45000, maxDiscount: 40, cabin: "Economy" },
  { id: "h-jal-03", airlineCode: "JAL", airlineName: "JAL", saleName: "JAL スペシャルセーバー", startDate: "2024-12-01", endDate: "2024-12-15", routes: ["HND→CDG", "NRT→LHR", "HND→LAX"], minPrice: 82000, maxDiscount: 42, cabin: "Economy" },
  { id: "h-jal-04", airlineCode: "JAL", airlineName: "JAL", saleName: "JAL プレミアムエコノミー SALE", startDate: "2025-03-15", endDate: "2025-03-31", routes: ["NRT→LHR", "HND→CDG"], minPrice: 120000, maxDiscount: 30, cabin: "Premium Economy" },
  { id: "h-jal-05", airlineCode: "JAL", airlineName: "JAL", saleName: "JAL スペシャルセーバー", startDate: "2025-06-03", endDate: "2025-06-17", routes: ["HND→CDG", "NRT→LHR", "HND→JFK"], minPrice: 89000, maxDiscount: 44, cabin: "Economy" },
  { id: "h-jal-06", airlineCode: "JAL", airlineName: "JAL", saleName: "JAL スペシャルセーバー", startDate: "2025-12-02", endDate: "2025-12-16", routes: ["HND→CDG", "NRT→LHR"], minPrice: 86000, maxDiscount: 40, cabin: "Economy" },
  { id: "h-jal-07", airlineCode: "JAL", airlineName: "JAL", saleName: "JAL スペシャルセーバー", startDate: "2026-05-10", endDate: "2026-05-25", routes: ["HND→CDG", "NRT→LHR", "HND→LAX"], minPrice: 89000, maxDiscount: 44, cabin: "Economy" },

  // Peach
  { id: "h-pch-01", airlineCode: "PCH", airlineName: "Peach", saleName: "Peach メガセール", startDate: "2024-03-10", endDate: "2024-03-17", routes: ["KIX→TPE", "KIX→ICN", "NRT→BKK"], minPrice: 3990, maxDiscount: 70, cabin: "Economy" },
  { id: "h-pch-02", airlineCode: "PCH", airlineName: "Peach", saleName: "Peach サマーSALE", startDate: "2024-07-15", endDate: "2024-07-22", routes: ["KIX→TPE", "KIX→ICN"], minPrice: 4990, maxDiscount: 65, cabin: "Economy" },
  { id: "h-pch-03", airlineCode: "PCH", airlineName: "Peach", saleName: "Peach メガセール", startDate: "2024-11-10", endDate: "2024-11-17", routes: ["KIX→TPE", "KIX→ICN", "NRT→BKK"], minPrice: 3490, maxDiscount: 72, cabin: "Economy" },
  { id: "h-pch-04", airlineCode: "PCH", airlineName: "Peach", saleName: "Peach メガセール", startDate: "2025-03-12", endDate: "2025-03-19", routes: ["KIX→TPE", "KIX→ICN", "NRT→BKK"], minPrice: 3990, maxDiscount: 68, cabin: "Economy" },
  { id: "h-pch-05", airlineCode: "PCH", airlineName: "Peach", saleName: "Peach ゴールデンSALE", startDate: "2025-07-18", endDate: "2025-07-25", routes: ["KIX→TPE", "NRT→ICN"], minPrice: 5480, maxDiscount: 60, cabin: "Economy" },
  { id: "h-pch-06", airlineCode: "PCH", airlineName: "Peach", saleName: "Peach メガセール", startDate: "2026-05-08", endDate: "2026-05-15", routes: ["KIX→TPE", "KIX→ICN"], minPrice: 9800, maxDiscount: 55, cabin: "Economy" },

  // Jetstar Japan
  { id: "h-jjp-01", airlineCode: "JJP", airlineName: "Jetstar Japan", saleName: "Jetstar スーパースターSALE", startDate: "2024-06-20", endDate: "2024-06-27", routes: ["NRT→MNL", "KIX→TPE"], minPrice: 4480, maxDiscount: 65, cabin: "Economy" },
  { id: "h-jjp-02", airlineCode: "JJP", airlineName: "Jetstar Japan", saleName: "Jetstar タイムセール", startDate: "2024-09-15", endDate: "2024-09-22", routes: ["NRT→MNL", "NRT→BKK"], minPrice: 5990, maxDiscount: 55, cabin: "Economy" },
  { id: "h-jjp-03", airlineCode: "JJP", airlineName: "Jetstar Japan", saleName: "Jetstar スーパースターSALE", startDate: "2025-01-10", endDate: "2025-01-17", routes: ["NRT→MNL", "KIX→TPE", "NRT→BKK"], minPrice: 3980, maxDiscount: 68, cabin: "Economy" },
  { id: "h-jjp-04", airlineCode: "JJP", airlineName: "Jetstar Japan", saleName: "Jetstar スーパースターSALE", startDate: "2025-06-18", endDate: "2025-06-25", routes: ["NRT→MNL", "KIX→TPE"], minPrice: 4980, maxDiscount: 58, cabin: "Economy" },
  { id: "h-jjp-05", airlineCode: "JJP", airlineName: "Jetstar Japan", saleName: "Jetstar スーパースターSALE", startDate: "2026-05-12", endDate: "2026-05-19", routes: ["NRT→MNL", "KIX→TPE"], minPrice: 12800, maxDiscount: 54, cabin: "Economy" },

  // Spring Japan
  { id: "h-apj-01", airlineCode: "APJ", airlineName: "Spring Japan", saleName: "Spring 737セール", startDate: "2024-07-03", endDate: "2024-07-10", routes: ["NRT→PVG", "NRT→HRB"], minPrice: 3737, maxDiscount: 70, cabin: "Economy" },
  { id: "h-apj-02", airlineCode: "APJ", airlineName: "Spring Japan", saleName: "Spring 片道キャンペーン", startDate: "2024-12-07", endDate: "2024-12-14", routes: ["NRT→PVG", "NRT→WUH"], minPrice: 4980, maxDiscount: 62, cabin: "Economy" },
  { id: "h-apj-03", airlineCode: "APJ", airlineName: "Spring Japan", saleName: "Spring 737セール", startDate: "2025-03-07", endDate: "2025-03-14", routes: ["NRT→PVG", "NRT→HRB", "NRT→WUH"], minPrice: 3737, maxDiscount: 68, cabin: "Economy" },
  { id: "h-apj-04", airlineCode: "APJ", airlineName: "Spring Japan", saleName: "Spring 737セール", startDate: "2025-07-07", endDate: "2025-07-14", routes: ["NRT→PVG", "NRT→HRB"], minPrice: 3737, maxDiscount: 65, cabin: "Economy" },
  { id: "h-apj-05", airlineCode: "APJ", airlineName: "Spring Japan", saleName: "Spring 片道キャンペーン", startDate: "2026-05-10", endDate: "2026-05-17", routes: ["NRT→PVG"], minPrice: 8800, maxDiscount: 65, cabin: "Economy" },

  // T'way Air
  { id: "h-tw-01", airlineCode: "TW", airlineName: "T'way Air", saleName: "T'way ハッピーフライデー", startDate: "2024-04-05", endDate: "2024-04-12", routes: ["FUK→ICN", "KIX→ICN"], minPrice: 5900, maxDiscount: 60, cabin: "Economy" },
  { id: "h-tw-02", airlineCode: "TW", airlineName: "T'way Air", saleName: "T'way ハッピーフライデー", startDate: "2024-07-05", endDate: "2024-07-12", routes: ["FUK→ICN", "NRT→ICN"], minPrice: 6500, maxDiscount: 55, cabin: "Economy" },
  { id: "h-tw-03", airlineCode: "TW", airlineName: "T'way Air", saleName: "T'way ハッピーフライデー", startDate: "2024-10-04", endDate: "2024-10-11", routes: ["FUK→ICN", "KIX→ICN", "NRT→ICN"], minPrice: 5500, maxDiscount: 62, cabin: "Economy" },
  { id: "h-tw-04", airlineCode: "TW", airlineName: "T'way Air", saleName: "T'way ハッピーフライデー", startDate: "2025-04-04", endDate: "2025-04-11", routes: ["FUK→ICN", "KIX→ICN"], minPrice: 6200, maxDiscount: 58, cabin: "Economy" },
  { id: "h-tw-05", airlineCode: "TW", airlineName: "T'way Air", saleName: "T'way ハッピーセール", startDate: "2026-05-09", endDate: "2026-05-16", routes: ["FUK→ICN"], minPrice: 6900, maxDiscount: 62, cabin: "Economy" },

  // VietJet
  { id: "h-vj-01", airlineCode: "VJ", airlineName: "VietJet", saleName: "VietJet ゼロ円フェスタ", startDate: "2024-05-05", endDate: "2024-05-12", routes: ["NRT→HAN", "NGO→SGN"], minPrice: 0, maxDiscount: 100, cabin: "Economy" },
  { id: "h-vj-02", airlineCode: "VJ", airlineName: "VietJet", saleName: "VietJet スカイSALE", startDate: "2024-09-09", endDate: "2024-09-16", routes: ["NRT→HAN", "KIX→HAN"], minPrice: 4980, maxDiscount: 65, cabin: "Economy" },
  { id: "h-vj-03", airlineCode: "VJ", airlineName: "VietJet", saleName: "VietJet ゼロ円フェスタ", startDate: "2025-01-01", endDate: "2025-01-08", routes: ["NRT→HAN", "NGO→SGN", "KIX→HAN"], minPrice: 0, maxDiscount: 100, cabin: "Economy" },
  { id: "h-vj-04", airlineCode: "VJ", airlineName: "VietJet", saleName: "VietJet ゼロ円フェスタ", startDate: "2025-05-05", endDate: "2025-05-12", routes: ["NRT→HAN", "NGO→SGN"], minPrice: 0, maxDiscount: 100, cabin: "Economy" },
  { id: "h-vj-05", airlineCode: "VJ", airlineName: "VietJet", saleName: "VietJet SKY SALE", startDate: "2026-05-10", endDate: "2026-05-17", routes: ["NGO→SGN"], minPrice: 12800, maxDiscount: 54, cabin: "Economy" },

  // Emirates
  { id: "h-ek-01", airlineCode: "EK", airlineName: "Emirates", saleName: "Emirates グローバルセール", startDate: "2024-01-10", endDate: "2024-01-31", routes: ["NRT→DXB", "KIX→DXB"], minPrice: 65000, maxDiscount: 38, cabin: "Economy" },
  { id: "h-ek-02", airlineCode: "EK", airlineName: "Emirates", saleName: "Emirates サマーSALE", startDate: "2024-06-15", endDate: "2024-07-05", routes: ["NRT→DXB", "HND→DXB"], minPrice: 62000, maxDiscount: 40, cabin: "Economy" },
  { id: "h-ek-03", airlineCode: "EK", airlineName: "Emirates", saleName: "Emirates グローバルセール", startDate: "2025-01-12", endDate: "2025-02-01", routes: ["NRT→DXB", "KIX→DXB", "HND→DXB"], minPrice: 60000, maxDiscount: 42, cabin: "Economy" },
  { id: "h-ek-04", airlineCode: "EK", airlineName: "Emirates", saleName: "Emirates グローバルセール", startDate: "2025-06-14", endDate: "2025-07-04", routes: ["NRT→DXB", "KIX→DXB"], minPrice: 63000, maxDiscount: 40, cabin: "Economy" },
  { id: "h-ek-05", airlineCode: "EK", airlineName: "Emirates", saleName: "Emirates グローバルセール", startDate: "2026-05-08", endDate: "2026-05-28", routes: ["NRT→DXB"], minPrice: 68000, maxDiscount: 46, cabin: "Economy" },

  // Singapore Airlines
  { id: "h-sq-01", airlineCode: "SQ", airlineName: "Singapore Airlines", saleName: "SIA プレミアムセール", startDate: "2024-02-10", endDate: "2024-02-28", routes: ["NRT→SIN", "HND→SIN"], minPrice: 48000, maxDiscount: 35, cabin: "Economy" },
  { id: "h-sq-02", airlineCode: "SQ", airlineName: "Singapore Airlines", saleName: "SIA プレミアムセール", startDate: "2024-08-15", endDate: "2024-09-01", routes: ["NRT→SIN", "KIX→SIN"], minPrice: 45000, maxDiscount: 40, cabin: "Economy" },
  { id: "h-sq-03", airlineCode: "SQ", airlineName: "Singapore Airlines", saleName: "SIA プレミアムセール", startDate: "2025-02-12", endDate: "2025-02-28", routes: ["NRT→SIN", "HND→SIN", "KIX→SIN"], minPrice: 46000, maxDiscount: 38, cabin: "Economy" },
  { id: "h-sq-04", airlineCode: "SQ", airlineName: "Singapore Airlines", saleName: "SIA プレミアムセール", startDate: "2025-08-10", endDate: "2025-08-28", routes: ["NRT→SIN", "HND→SIN"], minPrice: 43000, maxDiscount: 42, cabin: "Economy" },
  { id: "h-sq-05", airlineCode: "SQ", airlineName: "Singapore Airlines", saleName: "SIA プレミアムセール", startDate: "2026-05-08", endDate: "2026-05-28", routes: ["NRT→SIN", "HND→SIN"], minPrice: 58000, maxDiscount: 43, cabin: "Economy/Business" },

  // Cathay Pacific
  { id: "h-cx-01", airlineCode: "CX", airlineName: "Cathay Pacific", saleName: "キャセイ ファンフェア", startDate: "2024-03-15", endDate: "2024-03-31", routes: ["NRT→HKG", "KIX→HKG"], minPrice: 32000, maxDiscount: 40, cabin: "Economy" },
  { id: "h-cx-02", airlineCode: "CX", airlineName: "Cathay Pacific", saleName: "キャセイ サマーセール", startDate: "2024-09-20", endDate: "2024-10-05", routes: ["NRT→HKG", "HND→HKG"], minPrice: 30000, maxDiscount: 42, cabin: "Economy" },
  { id: "h-cx-03", airlineCode: "CX", airlineName: "Cathay Pacific", saleName: "キャセイ ファンフェア", startDate: "2025-03-18", endDate: "2025-04-01", routes: ["NRT→HKG", "KIX→HKG", "HND→HKG"], minPrice: 28000, maxDiscount: 45, cabin: "Economy" },
  { id: "h-cx-04", airlineCode: "CX", airlineName: "Cathay Pacific", saleName: "キャセイ ファンフェア", startDate: "2025-09-15", endDate: "2025-09-30", routes: ["NRT→HKG", "KIX→HKG"], minPrice: 31000, maxDiscount: 38, cabin: "Economy" },
  { id: "h-cx-05", airlineCode: "CX", airlineName: "Cathay Pacific", saleName: "キャセイ サマーセール", startDate: "2026-05-08", endDate: "2026-05-22", routes: ["KIX→HKG"], minPrice: 38000, maxDiscount: 46, cabin: "Economy" },
];

export function getSaleHistoryByAirline(airlineCode: string): SaleRecord[] {
  return saleHistory
    .filter((s) => s.airlineCode === airlineCode)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export function getAirlineSaleStats(airlineCode: string) {
  const records = getSaleHistoryByAirline(airlineCode);
  if (records.length === 0) return null;

  const avgDiscount = Math.round(
    records.reduce((s, r) => s + r.maxDiscount, 0) / records.length
  );
  const lowestPrice = Math.min(...records.map((r) => r.minPrice));
  const bestDiscount = Math.max(...records.map((r) => r.maxDiscount));

  const months = records.map((r) => new Date(r.startDate).getMonth());
  const monthCounts = new Array(12).fill(0);
  months.forEach((m) => monthCounts[m]++);
  const peakMonths = monthCounts
    .map((count, i) => ({ month: i, count }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((m) => m.month);

  const saleNames = [...new Set(records.map((r) => r.saleName))];

  const intervals: number[] = [];
  for (let i = 1; i < records.length; i++) {
    const diff =
      new Date(records[i - 1].startDate).getTime() -
      new Date(records[i].startDate).getTime();
    intervals.push(Math.round(diff / (1000 * 60 * 60 * 24)));
  }
  const avgInterval =
    intervals.length > 0
      ? Math.round(intervals.reduce((s, d) => s + d, 0) / intervals.length)
      : null;

  return {
    totalSales: records.length,
    avgDiscount,
    lowestPrice,
    bestDiscount,
    peakMonths,
    saleNames,
    avgInterval,
    records,
  };
}
