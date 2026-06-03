# GA4 カスタムレポート設計：アフィリエイトCTR可視化

BEATRIP では `hotel_click` / `affiliate_click` イベントの `affiliate_provider` 属性を全 OTA で揃えています。これを使い、**「どの OTA が最も収益動線として機能しているか」** を GA4 Explorations で可視化する手順。

## 前提：送信されるイベント

| イベント名 | 発火タイミング | カスタム ディメンション |
|---|---|---|
| `hotel_click` | curated hotel ボタン / cross-sell OTA ピル / Hotellook ヒーロー | `affiliate_provider`（`booking` / `trip` / `agoda` / `hotellook` / `hotellook_hero`）, `destination_code`, `deal_id` |
| `affiliate_click` | TravelCompanions（eSIM / KiwiTaxi / 保険）等 | `affiliate_provider`, `route`, `value`, `currency` |
| `page_view` | 全ページ自動 | `page_path`, `page_location` |

---

## 0. 一度だけやる：カスタムディメンション登録

GA4 → **管理 → カスタム定義 → カスタム ディメンションを作成**

| ディメンション名 | スコープ | イベントパラメータ |
|---|---|---|
| Affiliate Provider | イベント | `affiliate_provider` |
| Destination Code | イベント | `destination_code` |
| Deal ID | イベント | `deal_id` |
| Route | イベント | `route` |

> 登録後、データが反映されるまで **24〜48 時間** 待つ。それ以前のデータは「(not set)」になる。

---

## レポート1：OTA 別クリック数 × CTR 概観

**目的**: どの OTA がよくクリックされ、どのページで効率が良いかを 1 表で見る。

**作り方**:
1. GA4 左メニュー → **探索 → 自由形式（Free form）**
2. **ディメンション**に追加:
   - `Affiliate Provider`
   - `ページ パス + クエリ文字列`
3. **指標**に追加:
   - `イベント数`
   - `ユーザー数`
   - `セッション数`
4. **フィルタ**: `イベント名 = hotel_click OR affiliate_click`
5. **行**: `Affiliate Provider`
6. **列**: なし（or `ページパス`）
7. **値**: `イベント数`, `ユーザー数`

**CTR 計算（カスタム指標タブで）**:
- 計算式: `イベント数 / ページビュー数`
- ただし GA4 の Explorations は割り算指標を直接サポートしないため、**Looker Studio** に同じデータソースを繋いで割り算指標を作るのが実用的。

---

## レポート2：ページ × OTA のヒートマップ

**目的**: `/hotels/tokyo` では Booking が強いが `/deals/[id]` では Agoda が強い、という偏りを見つける。

**作り方**:
1. **探索 → 自由形式**
2. **行**: `ページ パス + クエリ文字列`
3. **列**: `Affiliate Provider`
4. **値**: `イベント数`
5. **フィルタ**: `イベント名 = hotel_click`
6. ビジュアライゼーション: **テーブル**（または **ハイライト**）

結果として、「ページごとの OTA 嗜好」が一目で分かるマトリクスになる。承認済み OTA を増やしたとき、どこに優先的に出すかの判断材料。

---

## レポート3：CTR ファネル（page_view → click）

**目的**: ホテル詳細ページが何 % の訪問でアフィリエイトクリックを生むか。

**作り方**:
1. **探索 → ファネル探索**
2. ステップ:
   - **Step 1**: `イベント名 = page_view` AND `ページパス CONTAINS "/hotels/"`
   - **Step 2**: `イベント名 = hotel_click`
3. **内訳ディメンション**: `Affiliate Provider`
4. **タイプ**: 開放型ファネル（順序問わず・30分以内）

→ 「`/hotels/tokyo` 訪問のうち X% が Booking ボタンを押した」が見える。

---

## レポート4：日次トレンド（CTR の悪化検知）

**目的**: 突然どの OTA のクリックが落ちたか検知。

**作り方**:
1. **探索 → 自由形式**
2. **行**: `日付`
3. **列**: `Affiliate Provider`
4. **値**: `イベント数`
5. **ビジュアル**: 折れ線グラフ
6. **期間**: 過去 30 日

異常検知用にこのレポートをブックマーク。週1で目視するか、Looker Studio で同じビューを作り Slack 通知を仕込むのが理想。

---

## レポート5：OTA別の「離脱せず予約に至った可能性」推定

GA4 単独では Booking 等の他サイト側のコンバージョンは見えない。ただし TravelPayouts 側で各 OTA の Conversion レポートが取れるので、**両者を Looker Studio で突き合わせる**：

| 比較軸 | GA4 | TravelPayouts |
|---|---|---|
| クリック数（出口） | `hotel_click` の イベント数 | 「クリック」レポート |
| 予約数 | × | 「予約・コンバージョン」レポート |
| 推定収益 | × | 「Earnings」 |

→ **CTR = GA4 click / page_view**、**Conversion = TP bookings / GA4 click** という構造で OTA 毎の効率が完全に可視化できる。

---

## オプション：BigQuery エクスポート + SQL

GA4 のフリープランでも BigQuery エクスポートは無料（1日10GBまで）。これを有効にすると以下が可能：

```sql
SELECT
  event_date,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'affiliate_provider') AS provider,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'destination_code') AS dest,
  COUNT(*) AS clicks
FROM `beatrip.analytics_XXXXX.events_*`
WHERE event_name IN ('hotel_click', 'affiliate_click')
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
                        AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
GROUP BY 1, 2, 3
ORDER BY 1 DESC, clicks DESC
```

これを cron で回して `data/affiliate-perf.json` に書き、Bluesky 自動投稿の「今週の人気目的地」シグナルに使うのが次の展望。

---

## チェックリスト

- [ ] カスタムディメンション 4 種登録（24h 待つ）
- [ ] レポート1：OTA別クリック数 を保存
- [ ] レポート2：ページ × OTA を保存
- [ ] レポート3：CTR ファネルを保存
- [ ] レポート4：日次トレンドをブックマーク
- [ ] Looker Studio に GA4 + TravelPayouts を接続（任意）
- [ ] BigQuery エクスポート有効化（任意・分析を深めたくなったら）
