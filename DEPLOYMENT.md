# BEATRIP デプロイガイド

## 1. Vercel デプロイ（5分）

### 前提
- GitHub アカウント
- Vercel アカウント（GitHub連携で無料サインアップ）

### 手順

1. **リポジトリを GitHub にプッシュ**

   ```bash
   git add .
   git commit -m "Production-ready: real data pipeline + Vercel config"
   git push origin main
   ```

2. **Vercel でインポート**
   - https://vercel.com/new にアクセス
   - GitHub リポジトリ `BEATRIP` を選択
   - Framework Preset: Next.js（自動検出）
   - Build Command / Output Directory はデフォルトのまま
   - 「Deploy」をクリック

3. **環境変数を設定**（Vercel ダッシュボード → Settings → Environment Variables）

   | Key | Value | 必須 |
   |-----|-------|------|
   | `SCRAPER_MODE` | `hybrid` | ✅ |
   | `CRON_SECRET` | ランダム文字列（例: `openssl rand -hex 32`） | ✅ |
   | `ADMIN_API_KEY` | ランダム文字列 | ✅ |
   | `LINE_CHANNEL_ACCESS_TOKEN` | LINE Bot のトークン | 任意 |

4. **再デプロイ**
   環境変数追加後、Deployments タブから「Redeploy」を実行。

5. **ドメイン設定**
   Settings → Domains から独自ドメイン（例: beatrip.jp）を追加。Vercel が指示する DNS レコード（CNAME / A）を設定。

---

## 2. Cron 動作確認

- vercel.json に `0 */6 * * *`（6時間ごと）でスクレイプを設定済み
- 手動実行: `https://your-domain.vercel.app/api/cron/scrape` に `Authorization: Bearer <CRON_SECRET>` ヘッダ付きでリクエスト
- ログは Vercel Dashboard → Logs から確認可能

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/scrape
```

---

## 3. データ更新フロー（MVP）

### 重要：Vercel サーバーレスでの制限

Vercel のサーバーレス関数では `/tmp` 以外への書き込みは**消えます**。Cron が実行されてもスクレイプ結果は永続化されません。

**MVP の運用**:
1. ローカルで `npm run dev` を起動
2. 手動で `curl http://localhost:3000/api/cron/scrape` を実行
3. `data/sales/*.json` が更新される
4. `git commit` & `git push` → Vercel が自動再デプロイ

**永続化を完全自動化したい場合**: 次の選択肢から：
- **Vercel KV**（推奨、月3万コマンド無料）
- **Upstash Redis**（月10k リクエスト無料）
- **Vercel Postgres**（月60時間計算無料）

→ `src/lib/store/sale-store.ts` を KV API に書き換える（次フェーズ）

---

## 4. アフィリエイトリンク差し替え（C ステップ）

現在 `?ref=beatrip` というダミーパラメータ。実際の収益化には以下が必要：

### Skyscanner Partners（推奨：即承認、シンプル）
1. https://partners.skyscanner.net にサインアップ
2. Trip Affiliate ID を取得
3. URL 形式: `https://www.skyscanner.jp/transport/flights/{origin}/{dest}/?associateid=YOUR_ID`
4. `src/lib/deals/deal-service.ts` の `affiliateUrl` 生成箇所を更新

### A8.net / バリューコマース（複数プログラム）
- 楽天トラベル、JTB、Trip.com、HIS などのプログラムに参加
- 各プログラムの承認後、専用URLを取得
- 航空会社別に `affiliate_url` を差し替え

### 航空会社直アフィリエイト
- ANA、JAL は直接アフィリエイトを提供していない場合あり
- A8.net 経由で間接的に連携可能

---

## 5. 監視・分析（推奨）

- **Vercel Analytics**: 無料で有効化可能（PV / Web Vitals）
- **Google Analytics 4**: アフィリエイトクリック計測には必須
- **Sentry**: エラー検知（無料枠あり）

---

## 6. 緊急時の対応

### サイトが落ちた
- Vercel Dashboard → Deployments で前の deployment に Rollback

### スクレイパーが壊れた
- `SCRAPER_MODE=mock` に変更してデプロイ → モックデータで一時稼働
- `data/sales/*.json` を直接編集して PR を出す

### アフィリエイトリンクが切れた
- `src/data/airlines.ts` の URL を更新 → デプロイ
