#!/bin/bash

# Mindful Rhythm アプリ起動スクリプト
# このスクリプトは、すべてのプロセスを停止し、キャッシュをクリアして、Expoを起動します。

echo "🚀 Mindful Rhythm アプリ起動スクリプト"
echo "======================================="
echo ""

# Step 1: すべてのExpoプロセスを停止
echo "📍 Step 1: すべてのExpoプロセスを停止中..."
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
pkill -9 -f "node.*8081" 2>/dev/null
sleep 2
echo "✅ プロセス停止完了"
echo ""

# Step 2: ポートをクリア
echo "📍 Step 2: ポートをクリア中..."
lsof -ti:8081 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:8082 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:19000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti:19001 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1
echo "✅ ポートクリア完了"
echo ""

# Step 3: キャッシュをクリア
echo "📍 Step 3: キャッシュをクリア中..."
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "✅ キャッシュクリア完了"
echo ""

# Step 4: Expoを起動
echo "📍 Step 4: Expoを起動中..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Expo起動後、QRコードが表示されます"
echo "  スマートフォンのExpo Goアプリでスキャンしてください"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx expo start --clear
