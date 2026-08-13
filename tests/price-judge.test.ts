/**
 * 「今買うか待つか」ジャッジの単体テスト。
 * 正直さの規約 (観測不足・鮮度切れで裁定しない) が仕様の核心なので、
 * その境界を重点的に固定する。
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  computeJudgement,
  JUDGE_MIN_DAYS,
  JUDGE_MAX_STALE_DAYS,
} from "../src/lib/deals/price-judge";
import type { Observation } from "../src/lib/deals/price-observations";

const NOW = new Date("2026-08-13T12:00:00Z");

/** now から n 日前の YYYY-MM-DD */
function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 86400_000).toISOString().slice(0, 10);
}

function obs(dAgo: number, p: number, c: "Economy" | "Business" = "Economy"): Observation {
  return { d: daysAgo(dAgo), p, c };
}

describe("computeJudgement", () => {
  test("観測が8日未満なら裁定しない (null)", () => {
    const o = Array.from({ length: JUDGE_MIN_DAYS - 1 }, (_, i) => obs(i, 10000 + i));
    assert.equal(computeJudgement(o, NOW), null);
  });

  test("直近観測が7日より古ければ裁定しない (「いまの価格」を名乗れない)", () => {
    const o = Array.from({ length: 10 }, (_, i) =>
      obs(JUDGE_MAX_STALE_DAYS + 1 + i, 10000 + i)
    );
    assert.equal(computeJudgement(o, NOW), null);
  });

  test("直近が窓内最安なら verdict=cheap・パーセンタイルは下位", () => {
    // 9日分: 過去は 12000〜19000、直近(今日)だけ 8000
    const o = [
      ...Array.from({ length: 8 }, (_, i) => obs(i + 1, 12000 + i * 1000)),
      obs(0, 8000),
    ];
    const j = computeJudgement(o, NOW);
    assert.ok(j);
    assert.equal(j!.verdict, "cheap");
    assert.equal(j!.latestPrice, 8000);
    assert.ok(j!.percentile <= 25, `percentile=${j!.percentile}`);
    assert.equal(j!.min, 8000);
    assert.equal(j!.sampleDays, 9);
  });

  test("直近が窓内最高なら verdict=high", () => {
    const o = [
      ...Array.from({ length: 8 }, (_, i) => obs(i + 1, 10000 + i * 100)),
      obs(0, 30000),
    ];
    const j = computeJudgement(o, NOW);
    assert.ok(j);
    assert.equal(j!.verdict, "high");
    assert.ok(j!.percentile >= 75);
  });

  test("中間圏なら verdict=normal", () => {
    // 1万〜2万に均等散布、直近はど真ん中の 15000
    const o = [
      ...Array.from({ length: 10 }, (_, i) => obs(i + 1, 10000 + i * 1000)),
      obs(0, 15000),
    ];
    const j = computeJudgement(o, NOW);
    assert.ok(j);
    assert.equal(j!.verdict, "normal");
  });

  test("Business の観測は分布に混ぜない (Economy のみで裁定)", () => {
    const o = [
      // Business の超高額が混ざっても Economy の裁定に影響しないこと
      ...Array.from({ length: 5 }, (_, i) => obs(i + 1, 200000, "Business")),
      ...Array.from({ length: 8 }, (_, i) => obs(i + 1, 12000 + i * 500)),
      obs(0, 16000),
    ];
    const j = computeJudgement(o, NOW);
    assert.ok(j);
    assert.ok(j!.max < 200000, "Business価格が混入している");
    assert.equal(j!.sampleDays, 9);
  });

  test("窓 (90日) の外の観測は無視する", () => {
    const o = [
      // 窓外の激安 (これが混ざると percentile が歪む)
      ...Array.from({ length: 10 }, (_, i) => obs(100 + i, 1000)),
      ...Array.from({ length: 8 }, (_, i) => obs(i + 1, 12000)),
      obs(0, 12000),
    ];
    const j = computeJudgement(o, NOW);
    assert.ok(j);
    assert.equal(j!.min, 12000, "窓外の観測が混入している");
  });

  test("全観測が同値なら percentile=50 (境界の偏りなし)", () => {
    const o = Array.from({ length: 9 }, (_, i) => obs(i, 9990));
    const j = computeJudgement(o, NOW);
    assert.ok(j);
    assert.equal(j!.percentile, 50);
    assert.equal(j!.verdict, "normal");
  });
});
