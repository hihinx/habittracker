#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "请先登录 Cloudflare（会打开浏览器）："
  npx wrangler login
fi

echo "正在部署 Worker..."
npm run deploy:worker

echo "完成。请访问：https://habittracker.freyachou.workers.dev/"
