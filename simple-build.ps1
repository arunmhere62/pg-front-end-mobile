Write-Host "🚀 Building Android APK..." -ForegroundColor Green

# Check Java
Write-Host "Checking Java..." -ForegroundColor Yellow
java -version

# Check current directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: Run this from mob-ui directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Navigate to android folder
Set-Location "android"

# Clean build
Write-Host "Cleaning build..." -ForegroundColor Yellow
.\gradlew clean

# Build APK
Write-Host "Building APK..." -ForegroundColor Yellow
.\gradlew assembleRelease

# Check result
$apkPath = "app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "SUCCESS! APK created at: $apkPath" -ForegroundColor Green
    Start-Process "app\build\outputs\apk\release\"
} else {
    Write-Host "Build may have failed - check output above" -ForegroundColor Red
}

Set-Location ".."
Read-Host "Press Enter to continue"
