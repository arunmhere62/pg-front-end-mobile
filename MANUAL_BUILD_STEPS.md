# Manual Android Build Steps

## Current Issue
Java JDK not found or incorrectly configured.

## Step 1: Install/Fix Java JDK

### Option A: Install Microsoft OpenJDK (Recommended)
1. Download from: https://docs.microsoft.com/en-us/java/openjdk/download
2. Install JDK 17 (LTS version)
3. During installation, check "Set JAVA_HOME variable"

### Option B: Manual Java Setup
1. Find your Java installation:
   ```
   C:\Program Files\Java\jdk-17*
   C:\Program Files\Microsoft\jdk-17*
   C:\Program Files\Eclipse Adoptium\jdk-17*
   ```

2. Set JAVA_HOME environment variable:
   - Press Win + R, type `sysdm.cpl`
   - Go to Advanced → Environment Variables
   - Add new System Variable:
     - Name: `JAVA_HOME`
     - Value: `C:\Program Files\Microsoft\jdk-17.0.13.11-hotspot` (or your Java path)

3. Add to PATH:
   - Edit PATH variable
   - Add: `%JAVA_HOME%\bin`

## Step 2: Install Android Studio & SDK

1. Download Android Studio: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio → More Actions → SDK Manager
4. Install:
   - Android SDK Platform 33
   - Android SDK Build-Tools 33.0.0
   - Android Emulator
   - Android SDK Platform-Tools

## Step 3: Set Android Environment Variables

Add these to System Environment Variables:
- `ANDROID_HOME`: `C:\Users\[YOUR_USERNAME]\AppData\Local\Android\Sdk`
- Add to PATH: `%ANDROID_HOME%\platform-tools`

## Step 4: Build Commands (Run in PowerShell/CMD)

```bash
# Navigate to project
cd "d:\pg-mobile-app\mob-ui"

# Clean and install dependencies
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install

# Clean Android build
cd android
.\gradlew clean

# Build release APK
.\gradlew assembleRelease

# APK will be at: android\app\build\outputs\apk\release\app-release.apk
```

## Step 5: Alternative - Use Expo Build Service

If local build fails, you can use Expo's build service:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android
```

## Troubleshooting

### Java Issues
```bash
# Check Java version
java -version

# Check JAVA_HOME
echo %JAVA_HOME%
```

### Android SDK Issues
```bash
# Accept licenses
%ANDROID_HOME%\tools\bin\sdkmanager --licenses

# List installed packages
%ANDROID_HOME%\tools\bin\sdkmanager --list
```

### Gradle Issues
```bash
# Clean gradle cache
cd android
.\gradlew clean --stacktrace

# Build with verbose output
.\gradlew assembleRelease --stacktrace --info
```

## Expected Output

When successful, you'll see:
```
BUILD SUCCESSFUL in 2m 30s
47 actionable tasks: 47 executed

APK location: android\app\build\outputs\apk\release\app-release.apk
```

## Next Steps After Build

1. **Test APK**: Install on device with `adb install app-release.apk`
2. **Optimize**: Enable ProGuard for smaller APK size
3. **Sign**: Create proper keystore for Play Store
4. **Upload**: Use Google Play Console for distribution

## Build Optimization (Optional)

Add to `android/gradle.properties`:
```properties
# Enable Hermes for better performance
hermesEnabled=true

# Enable R8 for smaller APK
android.enableR8=true

# Enable bundle compression
android.enableBundleCompression=true

# Increase build performance
org.gradle.jvmargs=-Xmx4g
org.gradle.parallel=true
```

## File Sizes to Expect

- **Debug APK**: ~50-80 MB
- **Release APK**: ~25-40 MB (with optimizations)
- **AAB Bundle**: ~20-30 MB (for Play Store)

Your app should build successfully once Java and Android SDK are properly configured!
