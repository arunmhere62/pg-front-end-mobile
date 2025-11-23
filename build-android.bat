@echo off
echo 🚀 Building Android Release APK...

REM Set JAVA_HOME to correct path (adjust if needed)
set JAVA_HOME=C:\Program Files\Java\jdk-17.0.13.11-hotspot
if not exist "%JAVA_HOME%" (
    echo ❌ JAVA_HOME not found at %JAVA_HOME%
    echo Please install Java JDK 17 or update the path in this script
    pause
    exit /b 1
)

echo ✅ Using Java: %JAVA_HOME%

REM Navigate to project directory
cd /d "%~dp0"

echo 🧹 Cleaning previous builds...
if exist "android\app\build\outputs\apk" rmdir /s /q "android\app\build\outputs\apk"

echo 📦 Building release APK...
cd android
call gradlew assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 📱 APK location: android\app\build\outputs\apk\release\app-release.apk
    
    REM Check if APK exists
    if exist "app\build\outputs\apk\release\app-release.apk" (
        echo 📊 APK size:
        dir "app\build\outputs\apk\release\app-release.apk" | find "app-release.apk"
        
        echo.
        echo 🎉 Build completed successfully!
        echo 📁 Opening APK folder...
        explorer "app\build\outputs\apk\release\"
    ) else (
        echo ❌ APK file not found after build
    )
) else (
    echo ❌ Build failed with error code %ERRORLEVEL%
)

pause
