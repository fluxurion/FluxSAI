@echo off
echo ============================================
echo   FluxSAI Build Script
echo   Produces single .exe on your Desktop
echo ============================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Building Tauri app (release mode)...
call npm run tauri build
if %errorlevel% neq 0 (
    echo ERROR: Tauri build failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Locating built executable...
set "EXE_PATH=src-tauri\target\release\fluxsai.exe"
if not exist "%EXE_PATH%" (
    echo ERROR: Could not find %EXE_PATH%
    pause
    exit /b 1
)

echo.
echo [4/4] Copying to Desktop...
set "DESKTOP=%USERPROFILE%\Desktop"
copy /Y "%EXE_PATH%" "%DESKTOP%\FluxSAI.exe" >nul
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy to Desktop!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   BUILD SUCCESSFUL!
echo   FluxSAI.exe copied to your Desktop:
echo   %DESKTOP%\FluxSAI.exe
echo ============================================
echo.
pause
