# アフィリエイト設定ガイド

BEATRIPのアフィリエイト収益化セットアップ手順。

## 現在の状態

各ディールの「予約ボタン」と「価格比較リンク」は**今すぐ動作**します（リンク先には正常に飛ぶ）。ただし、アフィリエイトIDが未設定のため、現状では収益は0円です。

承認を取った後、環境変数に ID を追加するだけで収益が自動で発生する設計です。

## 優先順位（収益化しやすい順）

### 🥇 1. TravelPayouts（最速・推奨）

**メリット**:
- ✅ 即承認（個人サイトでもOK）
- ✅ Skyscanner / Aviasales / Trip.com / Booking.com を一括で取得
- ✅ 月額無料、最低支払額 $50

**手順**:
1. https://www.travelpayouts.com/ で登録
2. ダッシュボード → 「Tools」→「Marker ID」をコピー
3. Vercel の Environment Variables に追加:
   ```
   TRAVELPAYOUTS_MARKER=YOUR_MARKER_ID
   ```
4. Vercel で Redeploy

→ Skyscanner / Aviasales / Trip.com 全てが自動的に収益化される

### 🥈 2. A8.net（日系プログラム）

**メリット**:
- ✅ 日本最大の ASP
- ✅ 楽天トラベル・JTB・Trip.com・Booking.com などの広告主あり
- ✅ 即時提携可能なプログラム多数

**手順**:
1. https://www.a8.net/ で登録（無料）
2. 「プログラム検索」→「旅行」カテゴリで以下を申請:
   - 楽天トラベル
   - Trip.com
   - Booking.com
   - JTBハイウェイバス
   - HIS
   - エクスペディア
3. 各プログラムの専用 URL を取得
4. Vercel の Environment Variables に追加:
   ```
   TRIP_COM_AFFILIATE_ID=YOUR_A8_ID_FOR_TRIPCOM
   ```

### 🥉 3. Skyscanner Partners（直接契約）

**メリット**:
- ✅ 報酬率が高い
- ⚠️ 承認に時間がかかる（数日〜数週間）

**手順**:
1. https://partners.skyscanner.net/ で登録
2. サイト審査通過後、Associate ID を取得
3. Vercel の Environment Variables に追加:
   ```
   SKYSCANNER_ASSOCIATE_ID=YOUR_ASSOCIATE_ID
   ```

### 🏅 4. バリューコマース（A8の代替）

**メリット**:
- ✅ Yahoo!トラベルなどの広告主
- ✅ 日系企業の旅行関連プログラムが豊富

**手順**: https://www.valuecommerce.ne.jp/ から登録

---

## 即時設定推奨（最低限）

最も効果的なのは TravelPayouts のみ：

```bash
# Vercel Dashboard → Project Settings → Environment Variables
TRAVELPAYOUTS_MARKER=XXXXXX
```

これだけで Skyscanner / Trip.com / Aviasales 経由の予約から収益が発生します。

---

## クリック数の確認方法

現在、クリックは `/api/clicks` エンドポイントに記録されます：

```bash
# 本番環境では /tmp に保存される（再起動でリセット）
# 永続化したい場合は Vercel KV または Google Analytics 4 への移行を推奨
```

**推奨**: Google Analytics 4 を追加して、外部リンククリックをイベントとして送信する。

```typescript
// 例: src/components/deals/booking-button.tsx でクリック時に
window.gtag?.('event', 'affiliate_click', {
  provider: affiliateProvider,
  deal_id: dealId,
  value: dealPrice,
});
```

---

## 報酬率の目安

| プロバイダー | 予約成立報酬 |
|------------|------------|
| Skyscanner | クリックあたり ¥10-30 |
| Trip.com | 予約金額の 2-3% |
| Booking.com | 予約金額の 3-4% |
| 楽天トラベル | 予約金額の 1-2% |
| 航空会社直販 | プログラムによる（0-3%） |

**月間1万PV、CTR 2%、CVR 1% を想定**:
- クリック数: 200/月
- 予約成立: 2件/月
- 平均予約額: ¥40,000
- 月間想定収益: ¥800-3,200（プロバイダーミックスによる）

サイトトラフィックが10倍になれば月間8,000-32,000円。100倍で月間8-32万円。
