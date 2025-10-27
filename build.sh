#!/bin/sh
# Build script for PMC Web app

echo "🔄 Installing dependencies..."
yarn install

echo "🔍 Running type check..."
yarn tsc --noEmit

echo "🎨 Building CSS..."
echo "/* Auto-generated file */" > ./src/styles.css
cat ./src/reset.css >> ./src/styles.css
cat ./src/tailwind.css >> ./src/styles.css
cat ./src/global.css >> ./src/styles.css
cat ./src/index.css >> ./src/styles.css

echo "🚀 Building application..."
yarn build

echo "✅ Build complete!"