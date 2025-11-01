# Firebase Cloud Messaging Setup Guide

## 🔥 Firebase Configuration Files

You need to download the actual Firebase configuration files from your Firebase Console and replace the placeholder files.

### Step 1: Download Configuration Files

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **indianpgmanagement**
3. Click on ⚙️ **Project Settings**
4. Scroll down to **Your apps** section

#### For Android:
1. Select your Android app (or add one if not exists)
   - Package name: `com.pgmanagement.app`
2. Download `google-services.json`
3. Replace the file at: `front-end/google-services.json`

#### For iOS:
1. Select your iOS app (or add one if not exists)
   - Bundle ID: `com.pgmanagement.app`
2. Download `GoogleService-Info.plist`
3. Replace the file at: `front-end/GoogleService-Info.plist`

### Step 2: Enable Cloud Messaging

1. In Firebase Console, go to **Cloud Messaging** tab
2. Enable **Cloud Messaging API (Legacy)** if not already enabled
3. Note your **Server Key** - you'll need this for your backend

### Step 3: Update Firebase Config (Optional)

If you need to update the Firebase SDK configuration, edit:
```
front-end/src/config/firebase.config.ts
```

Replace the placeholder values with your actual Firebase project credentials.

## 📱 Building the App

### For Development (Expo Go)
```bash
npm start
```

### For Production Build

#### Android
```bash
npx expo prebuild --platform android
npx expo run:android
```

#### iOS
```bash
npx expo prebuild --platform ios
npx expo run:ios
```

## 🧪 Testing Notifications

### Test Local Notification
You can test local notifications using the service:
```typescript
import notificationService from './src/services/notificationService';

notificationService.sendLocalNotification(
  'Test Title',
  'Test notification body',
  { type: 'GENERAL' }
);
```

### Test Push Notification from Firebase Console
1. Go to Firebase Console > Cloud Messaging
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Enter your FCM token (check console logs after app starts)
6. Click **Test**

## 🔧 Troubleshooting

### Android Issues
- Make sure `google-services.json` is in the root of `front-end/` folder
- Run `npx expo prebuild --clean` to regenerate native code
- Check that package name matches: `com.pgmanagement.app`

### iOS Issues
- Make sure `GoogleService-Info.plist` is in the root of `front-end/` folder
- Run `npx expo prebuild --clean` to regenerate native code
- Check that bundle identifier matches: `com.pgmanagement.app`
- For physical device testing, you need proper provisioning profiles

### Permission Issues
- On iOS, check Settings > [App Name] > Notifications
- On Android, check Settings > Apps > [App Name] > Notifications

## 📚 Key Changes Made

### Removed
- ❌ `expo-notifications` - Replaced with Firebase Cloud Messaging
- ❌ `expo-device` - No longer needed
- ❌ `expo-constants` - No longer needed for device info

### Added
- ✅ `@react-native-firebase/app` - Firebase core
- ✅ `@react-native-firebase/messaging` - Firebase Cloud Messaging
- ✅ `@notifee/react-native` - Local notification display

### Updated Files
1. **app.json** - Added Firebase plugins and configuration
2. **notificationService.ts** - Complete rewrite using Firebase APIs
3. **package.json** - Updated dependencies

## 🎯 Next Steps

1. Download real `google-services.json` and `GoogleService-Info.plist`
2. Update `firebase.config.ts` with your actual credentials
3. Run `npx expo prebuild` to generate native code
4. Test on physical device (notifications don't work in simulator/emulator)
5. Configure your backend to send notifications using Firebase Admin SDK
