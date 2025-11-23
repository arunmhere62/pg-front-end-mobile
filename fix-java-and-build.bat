@echo off
echo 🔧 Fixing Java Setup and Building Android APK...

REM Try to find Java installation automatically
echo 🔍 Searching for Java installations...

set JAVA_FOUND=0

REM Check common Java installation paths
for %%i in (
    "C:\Program Files\Java\jdk-17*"
    "C:\Program Files\Java\jdk-11*"
    "C:\Program Files\Java\jdk-8*"
    "C:\Program Files\Microsoft\jdk-17*"
    "C:\Program Files\Microsoft\jdk-11*"
    "C:\Program Files\Eclipse Adoptium\jdk-17*"
    "C:\Program Files\Eclipse Adoptium\jdk-11*"
) do (
    for /d %%j in (%%i) do (
        if exist "%%j\bin\java.exe" (
            set "JAVA_HOME=%%j"
            set JAVA_FOUND=1
            echo ✅ Found Java at: %%j
            goto :java_found
        )
    )
)

:java_found
if %JAVA_FOUND%==0 (
    echo ❌ No Java installation found!
    echo.
    echo Please install Java JDK 17 from one of these sources:
    echo 1. Oracle JDK: https://www.oracle.com/java/technologies/downloads/
    echo 2. Microsoft OpenJDK: https://docs.microsoft.com/en-us/java/openjdk/download
    echo 3. Eclipse Adoptium: https://adoptium.net/
    echo.
    pause
    exit /b 1
)

echo ✅ Using Java: %JAVA_HOME%
echo 📋 Java version:
"%JAVA_HOME%\bin\java" -version

REM Set Android SDK path (common locations)
if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
    echo ✅ Found Android SDK at: %ANDROID_HOME%
) else (
    echo ⚠️  Android SDK not found at default location
    echo Please install Android Studio and SDK
)

REM Navigate to project directory
cd /d "%~dp0"

echo 🧹 Cleaning node modules and reinstalling...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"
call npm install

echo 🧹 Cleaning Android build cache...
cd android
if exist ".gradle" rmdir /s /q ".gradle"
if exist "app\build" rmdir /s /q "app\build"

echo 📦 Building release APK...
call gradlew clean
call gradlew assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful!
    echo 📱 APK location: android\app\build\outputs\apk\release\app-release.apk
    
    if exist "app\build\outputs\apk\release\app-release.apk" (
        echo.
        echo 📊 APK Details:
        dir "app\build\outputs\apk\release\app-release.apk"
        
        echo.
        echo 🎉 BUILD COMPLETED SUCCESSFULLY!
        echo.
        echo Next steps:
        echo 1. Test the APK on your device
        echo 2. Upload to Google Play Console (if ready for production)
        echo.
        echo 📁 Opening APK folder...
        start "" "app\build\outputs\apk\release\"
    ) else (
        echo ❌ APK file not found after build
    )
) else (
    echo.
    echo ❌ Build failed!
    echo.
    echo Common solutions:
    echo 1. Make sure Android Studio is installed
    echo 2. Accept Android SDK licenses: sdkmanager --licenses
    echo 3. Check if you have enough disk space
    echo 4. Try running: gradlew clean assembleRelease --stacktrace
)

echo.
pause
