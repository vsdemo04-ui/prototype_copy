@echo off
cd /d "%~dp0"
start http://localhost:5173/automation.html
npm run dev
