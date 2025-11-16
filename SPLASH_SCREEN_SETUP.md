# Splash Screen & App Icon Setup Guide

## Overview
Your `app.json` has been configured to use splash screen and app icons. Now you need to create the actual image files.

## Required Image Files

### 1. **Splash Logo** (`assets/splash-logo.png`)
- **Purpose**: Displayed during app startup
- **Dimensions**: 1024x1024px (square)
- **Format**: PNG with transparent background
- **Recommendations**:
  - Keep it simple and centered
  - Use your PG Management logo
  - Ensure good contrast against blue background (#3B82F6)
  - Transparent background for flexibility

### 2. **App Icon** (`assets/app-icon.png`)
- **Purpose**: App icon on home screen and app store
- **Dimensions**: 1024x1024px (square)
- **Format**: PNG
- **Recommendations**:
  - Should be recognizable at small sizes (32x32px, 64x64px)
  - Can include solid background or transparent
  - Professional appearance
  - Consistent with splash logo branding

## File Structure
```
mob-ui/
├── assets/
│   ├── splash-logo.png      (1024x1024px, PNG)
│   └── app-icon.png         (1024x1024px, PNG)
├── app.json                 (already configured ✓)
└── ...
```

## Configuration Applied

Your `app.json` now includes:

```json
{
  "expo": {
    "icon": "./assets/app-icon.png",
    "splash": {
      "image": "./assets/splash-logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "ios": {
      "icon": "./assets/app-icon.png"
    },
    "android": {
      "icon": "./assets/app-icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/splash-logo.png",
        "backgroundColor": "#3B82F6"
      }
    }
  }
}
```

## Steps to Complete Setup

### 1. Create Your Logo Images
- Design or download your PG Management logo
- Create two PNG files (1024x1024px each):
  - `splash-logo.png` - For splash screen and Android adaptive icon
  - `app-icon.png` - For app icon on home screen

### 2. Place Files in Assets Folder
```bash
# Copy your images to:
d:\pg-mobile-app\mob-ui\assets\splash-logo.png
d:\pg-mobile-app\mob-ui\assets\app-icon.png
```

### 3. Rebuild the App
```bash
# Clear cache and rebuild
cd d:\pg-mobile-app\mob-ui
expo prebuild --clean

# For local testing
expo start

# For production builds
eas build --platform ios
eas build --platform android
```

## Design Tips

### Splash Logo
- ✅ Center the logo
- ✅ Use transparent background
- ✅ Keep padding around edges (20-30%)
- ✅ Ensure visibility on #3B82F6 blue background
- ✅ Test at different sizes

### App Icon
- ✅ Make it recognizable at 32x32px
- ✅ Avoid thin lines (may disappear at small sizes)
- ✅ Use solid colors or high contrast
- ✅ Include rounded corners for modern look
- ✅ Test on both iOS and Android

## Testing

After adding images and rebuilding:

1. **iOS**: Check app icon in Simulator
2. **Android**: Check splash screen and adaptive icon
3. **Both**: Verify splash appears during startup

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not showing | Ensure files are in `assets/` folder with correct names |
| Splash appears stretched | Check `resizeMode: "contain"` in app.json |
| Icon looks pixelated | Ensure images are 1024x1024px |
| Build fails | Run `expo prebuild --clean` to clear cache |

## Next Steps

1. Create your logo images (1024x1024px PNG)
2. Place them in `assets/` folder
3. Run `expo prebuild --clean`
4. Test on iOS and Android
5. Build for production with `eas build`

## Resources

- [Expo Splash Screen Docs](https://docs.expo.dev/build-reference/app-config/#splash)
- [App Icon Requirements](https://docs.expo.dev/build-reference/app-config/#icon)
- [Adaptive Icons (Android)](https://docs.expo.dev/build-reference/app-config/#adaptiveicon)
