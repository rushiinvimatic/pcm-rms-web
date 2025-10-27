@echo off
REM Build script for PMC Web app

echo 🔄 Installing dependencies...
call yarn install

echo 🔍 Running type check...
call yarn tsc --noEmit

echo 🎨 Building CSS...
echo /* Auto-generated file */ > .\src\styles.css
type .\src\reset.css >> .\src\styles.css
type .\src\tailwind.css >> .\src\styles.css
type .\src\global.css >> .\src\styles.css
type .\src\index.css >> .\src\styles.css

echo 🚀 Building application...
call yarn build

echo ✅ Build complete!