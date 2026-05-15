#!/bin/bash
# MTEIA RIASEC 一鍵啟動腳本
# 用法: ./start.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "🚀 MTEIA RIASEC 啟動中..."
echo "========================================="

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 找不到 Node.js，請先安裝：https://nodejs.org/"
    exit 1
fi

# 安裝依賴（如果需要的話）
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安裝後端依賴..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/dist" ]; then
    echo "📦 建置前端..."
    cd frontend && npm install && npm run build && cd ..
fi

echo ""
echo "✅ 啟動伺服器..."
echo "   開啟瀏覽器訪問: http://localhost:3001"
echo "   其他電腦訪問:   http://你的IP:3001"
echo ""
echo "按 Ctrl+C 停止服務"
echo "========================================="

cd backend && node server.js
