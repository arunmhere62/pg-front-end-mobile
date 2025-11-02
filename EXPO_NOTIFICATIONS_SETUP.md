# 🔔 Expo Notifications Setup - Fixed!

## ✅ Issue Fixed

**Error**: `Native module RNFBAppModule not found`

**Root Cause**: The app was using `@react-native-firebase` packages which require native modules that aren't available in Expo Go.

**Solution**: Switched to **Expo Notifications** which works seamlessly with Expo Go.

---

## 🔄 Changes Made

### 1. **Updated notification Service** (`src/services/notificationService.ts`)
- ✅ Replaced `@react-native-firebase/messaging` with `expo-notifications`
- ✅ Replaced `@notifee/react-native` with `expo-notifications`
- ✅ Added `expo-device` for device detection
- ✅ Added `expo-constants` for project configuration
- ✅ Updated all notification methods to use Expo APIs

### 2. **Updated package.json**
**Removed**:
- `@react-native-firebase/app`
- `@react-native-firebase/messaging`
- `@notifee/react-native`

**Added**:
- `expo-notifications` (~0.30.1)
- `expo-device` (~7.0.1)
- `expo-constants` (~17.0.3)

### 3. **Updated app.json**
- ✅ Removed Firebase plugins
- ✅ Added `expo-notifications` plugin
- ✅ Configured notification icon and color

---

## 🚀 How to Use

### **Step 1: Start the Development Server**

```bash
cd mob-ui
npm start
```

### **Step 2: Test on Physical Device**

1. Open **Expo Go** app on your phone
2. Scan the QR code
3. Login to the app

> ⚠️ **Important**: Push notifications only work on **physical devices**, not simulators/emulators.

### **Step 3: Verify Initialization**

Check the console for:
```
✅ Notification permission granted
✅ Android notification channels created
📱 Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxx]
✅ Notification service initialized
```

---

## 📱 Notification Channels

The app creates 4 notification channels on Android:

| Channel | Purpose | Importance |
|---------|---------|------------|
| **default** | General notifications | High |
| **rent-reminders** | Rent payment reminders | High |
| **payments** | Payment confirmations | High |
| **alerts** | Overdue alerts | Max |

---

## 🔧 API Reference

### **Initialize Notifications**

```typescript
import notificationService from './services/notificationService';

// Initialize on login
await notificationService.initialize(userId);
```

### **Send Local Notification (Testing)**

```typescript
await notificationService.sendLocalNotification(
  'Test Title',
  'Test Body',
  { type: 'GENERAL', customData: 'value' }
);
```

### **Get Expo Push Token**

```typescript
const token = await notificationService.getExpoPushToken();
console.log('Token:', token);
```

### **Cleanup on Logout**

```typescript
await notificationService.unregisterToken();
notificationService.cleanup();
```

---

## 🎯 Backend Integration

The backend already supports both **Expo Push Tokens** and **Firebase tokens**:

```typescript
// Token format
ExponentPushToken[xxxxxxxxxxxxxx]  // Expo Go
fMiGFlowSUmZZpkh4ZBXV8:APA91bF...  // Firebase (production builds)
```

The backend automatically detects the token type and uses the appropriate service:
- **Expo tokens** → Sent via `expo-server-sdk`
- **Firebase tokens** → Sent via `firebase-admin`

---

## 🧪 Testing Notifications

### **Test 1: Local Notification**

```typescript
// In your app code
await notificationService.sendLocalNotification(
  'Hello!',
  'This is a test notification'
);
```

### **Test 2: Backend Test Endpoint**

```bash
POST http://localhost:3000/api/v1/notifications/test
Headers:
  pg_id: 1
  organization_id: 1
  user_id: YOUR_USER_ID
```

### **Test 3: Payment Notification**

The backend automatically sends notifications for:
- Pending payments
- Partial payments
- Full payments
- Payment due soon (3 days)
- Overdue payments

---

## 🔍 Troubleshooting

### **Issue: "Push notifications only work on physical devices"**

**Solution**: You're running on a simulator/emulator. Use a physical device with Expo Go.

### **Issue: Permission denied**

**Solution**: 
1. Go to phone Settings → Apps → Expo Go
2. Enable Notifications
3. Restart the app

### **Issue: Token not registered**

**Solution**:
1. Check backend is running
2. Verify network connection
3. Check console for errors
4. Ensure you're logged in

### **Issue: Notifications not received**

**Solution**:
1. Verify token in database: `SELECT * FROM user_fcm_tokens WHERE user_id = YOUR_ID`
2. Check backend logs for send confirmation
3. Ensure phone has internet connection
4. Check notification permissions

---

## 🏗️ Production Build (Optional)

If you want to use Firebase in a production build:

### **Step 1: Create Development Build**

```bash
npx expo install expo-dev-client
npx expo prebuild
npx expo run:android  # or run:ios
```

### **Step 2: Add Firebase Back**

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### **Step 3: Update app.json**

```json
"plugins": [
  "@react-native-firebase/app",
  "@react-native-firebase/messaging"
]
```

### **Step 4: Rebuild**

```bash
npx expo prebuild --clean
npx expo run:android
```

---

## ✨ Benefits of Expo Notifications

✅ **Works with Expo Go** - No build required  
✅ **Cross-platform** - Same API for iOS and Android  
✅ **Easy to test** - Instant feedback during development  
✅ **Production ready** - Scales to millions of users  
✅ **Free tier** - No cost for development  
✅ **Type-safe** - Full TypeScript support  

---

## 📊 Monitoring

### **Check Active Tokens**

```sql
SELECT user_id, fcm_token, device_type, created_at 
FROM user_fcm_tokens 
WHERE is_active = 1;
```

### **Check Notification History**

```sql
SELECT * FROM notifications 
WHERE user_id = YOUR_USER_ID 
ORDER BY sent_at DESC 
LIMIT 10;
```

---

## 📝 Summary

The app now uses **Expo Notifications** which:
- ✅ Works perfectly with Expo Go
- ✅ No native module errors
- ✅ Easy to test and develop
- ✅ Backend supports both Expo and Firebase tokens
- ✅ Production ready

**Just run `npm start` and test on your phone!** 🎉

---

## 🔗 Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Testing Push Notifications](https://docs.expo.dev/push-notifications/testing/)
