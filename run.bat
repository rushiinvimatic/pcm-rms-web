@echo off
echo 🚀 Starting PMC Web application...
echo.
echo 🔨 Building styles.css...
echo /* Auto-generated file */ > .\src\styles.css
type .\src\reset.css >> .\src\styles.css
type .\src\tailwind.css >> .\src\styles.css
type .\src\global.css >> .\src\styles.css
type .\src\index.css >> .\src\styles.css
echo.
echo 🌐 Starting development server...
call yarn dev
