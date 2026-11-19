@echo off
setlocal enabledelayedexpansion
title CalClip.IN - Auto Clipper ^& Motion

echo =======================================================
echo             CALCLIP.IN - AUTO CLIPPER ^& MOTION
echo       (Independen ^& Terisolasi Penuh dari Aplikasi Lain)
echo =======================================================
echo.

set STUDIO_PORT=8799
set STUDIO_DATA=%USERPROFILE%\CalClip

:: 1. Periksa Port Backend CalClip (8799)
echo [1/3] Memeriksa mesin backend CalClip (port 8799)...
netstat -ano | findstr ":8799 " | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo       [OK] Mesin backend CalClip sudah aktif di port 8799.
) else (
    echo       [..] Menjalankan mesin backend CalClip port 8799...
    if exist "%~dp0python\python.exe" (
        start "" /B "%~dp0python\python.exe" "%~dp0alat\studio\studio.py" --tanpa-buka
    ) else if exist "%LOCALAPPDATA%\Programs\Studio Maliki\python\python.exe" (
        start "" /B "%LOCALAPPDATA%\Programs\Studio Maliki\python\python.exe" "%~dp0alat\studio\studio.py" --tanpa-buka
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        start "" /B "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" "%~dp0alat\studio\studio.py" --tanpa-buka
    ) else if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
        start "" /B "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" "%~dp0alat\studio\studio.py" --tanpa-buka
    ) else (
        start "" /B python "%~dp0alat\studio\studio.py" --tanpa-buka
    )
    timeout /t 2 /nobreak >nul
)

:: 2. Mode Produksi vs Mode Dev
if "%1"=="--dev" (
    echo [2/3] Mode Developer aktif. Memeriksa Vite dev server (port 5173)...
    netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
    if !ERRORLEVEL! EQU 0 (
        echo       [OK] Server web dev sudah berjalan di port 5173.
    ) else (
        echo       [..] Menjalankan server web Vite...
        start "" /B npm run dev
        timeout /t 3 /nobreak >nul
    )
    echo [3/3] Membuka CalClip.IN di browser...
    start http://localhost:5173/
    set APP_URL=http://localhost:5173/
) else (
    echo [2/3] Mode Mandiri Single-Port. Menggunakan frontend produksi terintegrasi...
    timeout /t 1 /nobreak >nul
    echo [3/3] Membuka CalClip.IN di browser...
    start http://localhost:8799/
    set APP_URL=http://localhost:8799/
)

echo.
echo =======================================================
echo  CalClip.IN siap digunakan!
echo  URL: !APP_URL!
echo  Penyimpanan data mandiri: %USERPROFILE%\CalClip
echo  Backend port: 8799 (Terisolasi mandiri)
echo =======================================================
echo.
pause
