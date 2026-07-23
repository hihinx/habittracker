#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

WRANGLER=(npx wrangler)

if ! "${WRANGLER[@]}" whoami >/dev/null 2>&1; then
  echo "请先登录 Cloudflare。"
  echo "若浏览器未自动打开，请使用："
  echo "  npm run login:cloudflare -- --browser=false"
  echo "并复制终端里输出的链接到浏览器完成授权。"
  echo ""
  "${WRANGLER[@]}" login
fi

echo "正在部署 Worker..."
npm run deploy:worker

echo "完成。请访问：https://habittracker.freyachou.workers.dev/"
