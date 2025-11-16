# How to Add Logo After First Build

## Current Status
Your app is now building successfully without logo files. Once you have your logo images ready, follow these steps to add them.

## Step 1: Create Logo Images
Create two PNG images (1024x1024px each):
- `splash-logo.png` - Your PG Management logo (transparent background)
- `app-icon.png` - App icon for home screen

## Step 2: Place Files in Assets
Copy the images to:
```
d:\pg-mobile-app\mob-ui\assets\
├── splash-logo.png
└── app-icon.png
```

## Step 3: Update app.json
Update your `app.json` with the following configuration:

```json
{
  "expo": {
    "name": "PG Management",
    "slug": "pgmanagement",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "icon": "./assets/app-icon.png",
    "splash": {
      "image": "./assets/splash-logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pgmanagement.app",
      "icon": "./assets/app-icon.png",
      "infoPlist": {
        "UIBackgroundModes": [
          "remote-notification",
          "remote-notification"
        ],
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.pgmanagement.app",
      "icon": "./assets/app-icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/splash-logo.png",
        "backgroundColor": "#3B82F6"
      },
      "permissions": [
        "NOTIFICATIONS",
        "INTERNET"
      ],
      "useNextNotificationsApi": true
    },
    "web": {
      "bundler": "metro"
    },
    "scheme": "pgapp",
    "plugins": [
      [
        "expo-notifications",
        {
          "color": "#3B82F6"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "0f6ecb0b-7511-427b-be33-74a4bd0207fe"
      }
    }
  }
}
```

## Step 4: Rebuild
```bash
cd d:\pg-mobile-app\mob-ui
eas build --platform android --clean
```

## Why We Removed Logos Temporarily
- The build was failing because it was looking for logo files that didn't exist
- This caused the APK to be corrupted or incomplete
- By removing the references, the build completes successfully
- Once you add the actual logo files, you can re-enable them

## Logo Design Tips
- **Splash Logo**: Keep it centered with transparent background
- **App Icon**: Make it recognizable at small sizes (32x32px)
- **Format**: PNG with transparency for best results
- **Size**: 1024x1024px for both images

## Testing
After adding logos and rebuilding:
1. Download the APK from EAS
2. Install on your Android device
3. Verify splash screen shows your logo
4. Verify app icon appears on home screen
