#!/usr/bin/env bash
# Vercel の本番環境変数から、収集 (collect.yml) に必要な値だけを
# GitHub Actions の Secrets へ転送する。
#
#   bash scripts/sync-secrets.sh
#
# - 値は画面に一切出さない (存在した/しなかったのキー名だけ表示)
# - Vercel から落とした一時ファイルは、成功・失敗に関わらず終了時に削除する
# - 前提: `vercel` と `gh` にログイン済み、このリポジトリが vercel link 済み
set -euo pipefail

KEYS=(
  KV_REST_API_URL
  KV_REST_API_TOKEN
  TRAVELPAYOUTS_API_TOKEN
  TRAVELPAYOUTS_MARKER
  TRIP_COM_AFFILIATE_ID
  TRIP_COM_SITE_ID
)
REQUIRED=(KV_REST_API_URL KV_REST_API_TOKEN)

TMP_DIR="$(mktemp -d)"
chmod 700 "$TMP_DIR"
trap 'rm -rf "$TMP_DIR"' EXIT
ENV_FILE="$TMP_DIR/env"

echo "Vercel から本番の環境変数を取得しています..."
vercel env pull "$ENV_FILE" --environment=production --yes >/dev/null

missing_required=0
for key in "${KEYS[@]}"; do
  # KEY="value" / KEY=value の両形式に対応。値は変数に入れるだけで表示しない
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')"
  if [ -n "$value" ]; then
    printf '%s' "$value" | gh secret set "$key" >/dev/null
    echo "  登録: $key"
  else
    echo "  未設定のため skip: $key"
    for r in "${REQUIRED[@]}"; do
      [ "$r" = "$key" ] && missing_required=1
    done
  fi
done

if [ "$missing_required" = "1" ]; then
  # 変数自体は存在するのに値が空で返ることがある (2026-11: Vercel アカウント停止中は
  # 全ユーザー変数が "" で pull された)。「無い」と断定せず、元のサービスから入れてもらう
  echo "KV_REST_API_URL / KV_REST_API_TOKEN の値を Vercel から取得できませんでした" >&2
  echo "(アカウント停止中などは変数が存在しても空で返ります)。" >&2
  echo "Upstash のコンソールで REST URL / TOKEN を確認し、次のコマンドで登録してください" >&2
  echo "(値の入力は画面に表示されません):" >&2
  echo "  gh secret set KV_REST_API_URL" >&2
  echo "  gh secret set KV_REST_API_TOKEN" >&2
  exit 1
fi

echo "完了。GitHub → Actions → collect → Run workflow で初回実行できます。"
