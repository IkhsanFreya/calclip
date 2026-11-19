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
    if exist "C:\Users\Asus ROG\AppData\Local\Programs\Studio Maliki\python\python.exe" (
        start "" /B "C:\Users\Asus ROG\AppData\Local\Programs\Studio Maliki\python\python.exe" "%~dp0alat\studio\studio.py" --tanpa-buka
    ) else if exist "C:\Users\Asus ROG\AppData\Local\Programs\Python\Python312\python.exe" (
        start "" /B "C:\Users\Asus ROG\AppData\Local\Programs\Python\Python312\python.exe" "%~dp0alat\studio\studio.py" --tanpa-buka
    ) else (
        start "" /B python "%~dp0alat\studio\studio.py" --tanpa-buka
    )
    timeout /t 2 /nobreak >nul
)

:: 2. Periksa Port Frontend CalClip (5173)
echo [2/3] Memeriksa server antarmuka web (port 5173)...
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo       [OK] Server web sudah berjalan di port 5173.
) else (
    echo       [..] Menjalankan server web Vite...
    start "" /B npm run dev
    timeout /t 3 /nobreak >nul
)

:: 3. Buka CalClip di Browser
echo [3/3] Membuka CalClip.IN di browser...
start http://localhost:5173/

echo.
echo =======================================================
echo  CalClip.IN siap digunakan!
echo  URL: http://localhost:5173/
echo  Penyimpanan data mandiri: %USERPROFILE%\CalClip
echo  Backend port: 8799 (Tidak terhubung ke Studio Maliki)
echo =======================================================
echo.
pause
