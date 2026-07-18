#!/usr/bin/env bash
# 本番が「いま手元にあるコミット」に入れ替わるまで待つ。
#
# これが無かった頃は push のあと 25〜30秒 sleep しては curl して確かめる、を
# 空振りしながら繰り返していて、1回の確認に4〜5分かかっていた。反映の瞬間が
# 分からないので毎回多めに待つしかなかったのが原因。/api/health/version が返す
# コミットSHAと突き合わせれば、反映された時点で即座に抜けられる。
#
#   使い方: npm run wait-deploy          (HEAD の反映を待つ)
#           scripts/wait-deploy.sh <sha> (特定コミットを待つ)
set -euo pipefail

TARGET="${1:-$(git rev-parse HEAD)}"
URL="${BEATRIP_URL:-https://beatrip.jp}/api/health/version"
TIMEOUT_SEC="${TIMEOUT_SEC:-600}"   # 10分で諦める (ビルド失敗に永久に待たない)
INTERVAL=10

# SHA のときだけ短縮する。printf '%.7s' はバイト単位で切るため、
# 「取得失敗」のような日本語をそのまま渡すと途中で切れて文字化けする。
short() {
  case "$1" in
    [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]*) printf '%.7s' "$1" ;;
    *) printf '%s' "$1" ;;
  esac
}
started=$(date +%s)
echo "待機中: $(short "$TARGET") が $URL に反映されるまで (最大 ${TIMEOUT_SEC}秒)"

while :; do
  live=$(curl -fsS --max-time 15 "$URL" 2>/dev/null \
         | python3 -c 'import sys,json;print(json.load(sys.stdin).get("commit") or "")' 2>/dev/null || true)
  elapsed=$(( $(date +%s) - started ))

  if [ "$live" = "$TARGET" ]; then
    echo "反映済み: $(short "$live")  (${elapsed}秒)"
    exit 0
  fi

  if [ "$elapsed" -ge "$TIMEOUT_SEC" ]; then
    echo "タイムアウト (${elapsed}秒)。本番は $(short "${live:-取得失敗}") のまま。" >&2
    echo "Vercel のビルドが失敗している可能性があります。ダッシュボードを確認してください。" >&2
    exit 1
  fi

  printf '  %3d秒: 本番はまだ %s\n' "$elapsed" "$(short "${live:-取得失敗}")"
  sleep "$INTERVAL"
done
