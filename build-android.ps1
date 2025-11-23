# Android Build Script for React Native/Expo
Write-Host "🚀 Building Android APK..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this from the mob-ui directory." -ForegroundColor Red
    exit 1
}

# Check for Java
Write-Host "🔍 Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found or not in PATH" -ForegroundColor Red
    Write-Host "Please install Java JDK 17 from: https://docs.microsoft.com/en-us/java/openjdk/download" -ForegroundColor Yellow
    exit 1
}

# Check for Android SDK
$androidHome = $env:ANDROID_HOME
if (!$androidHome -or !(Test-Path $androidHome)) {
    $androidHome = "$env:USERPROFILE\AppData\Local\Android\Sdk"
    if (Test-Path $androidHome) {
        Write-Host "✅ Found Android SDK at: $androidHome" -ForegroundColor Green
        $env:ANDROID_HOME = $androidHome
    } else {
        Write-Host "❌ Android SDK not found. Please install Android Studio." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

# Clean Android build
Write-Host "🧹 Cleaning Android build..." -ForegroundColor Yellow
Set-Location "android"

if (Test-Path ".gradle") {
    Remove-Item -Recurse -Force ".gradle"
}
if (Test-Path "app\build") {
    Remove-Item -Recurse -Force "app\build"
}

# Run Gradle clean
Write-Host "🧽 Running Gradle clean..." -ForegroundColor Yellow
.\gradlew clean

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Gradle clean failed" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# Build release APK
Write-Host "🔨 Building release APK..." -ForegroundColor Yellow
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "📱 APK created: $apkPath" -ForegroundColor Green
        Write-Host "📊 APK size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Green
        
        # Open APK folder
        Write-Host "📁 Opening APK folder..." -ForegroundColor Yellow
        Start-Process "app\build\outputs\apk\release\"
        
        Write-Host "`n🎉 BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Test the APK on your device" -ForegroundColor White
        Write-Host "2. Upload to Google Play Console (if ready)" -ForegroundColor White
    }
    else {
        Write-Host "❌ APK file not found after build" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Try running with more details: .\gradlew assembleRelease --stacktrace" -ForegroundColor Yellow
}

Set-Location ".."
Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
