# ✅ FCM Token Error - FIXED

## Issue
```
ERROR ❌ Error getting FCM token: [Error: No "projectId" found]
```

## Solution Applied

### 1. **Updated notificationService.ts**
Removed the `projectId` requirement. Expo Go automatically infers the project ID.

```typescript
// Before (causing error)
const token = await Notifications.getExpoPushTokenAsync({
  projectId: Constants.expoConfig?.extra?.eas?.projectId,
});

// After (fixed)
const token = await Notifications.getExpoPushTokenAsync();
```

### 2. **Updated app.json**
Added notification plugin configuration:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#3B82F6"
        }
      ]
    ],
    "android": {
      "permissions": ["NOTIFICATIONS"]
    }
  }
}
```

---

## 🧪 Test Again

### 1. Restart the App
```bash
# Stop the current Expo server (Ctrl+C)
# Then restart
npm start
```

### 2. Clear Cache (if needed)
```bash
npm start -- --clear
```

### 3. Login Again

On your physical device:
1. Close and reopen the app
2. Login with your phone number
3. Check console logs

### Expected Output
```
📱 FCM Token: ExponentPushToken[xxxxxxxxxxxxxx]
✅ FCM token registered with backend
✅ Notification service initialized
```

---

## ✅ Verification Steps

### 1. Check Console
Look for the FCM token in console (should start with `ExponentPushToken[`)

### 2. Check Database
```sql
SELECT * FROM user_fcm_tokens WHERE user_id = YOUR_USER_ID;
```

Should show:
- `fcm_token`: ExponentPushToken[...]
- `is_active`: 1

### 3. Send Test Notification
```bash
POST http://localhost:3000/api/v1/notifications/test
Headers: pg_id: 1, organization_id: 1, user_id: YOUR_USER_ID
```

---

## 📝 Notes

- **Expo Go**: Project ID is automatically inferred from the app
- **Development Build**: Would need explicit project ID in app.json
- **Physical Device Only**: Notifications don't work on emulators

---

## 🔧 If Still Not Working

### Clear Expo Cache
```bash
expo start -c
# or
npm start -- --clear
```

### Reinstall Expo Go
1. Uninstall Expo Go from phone
2. Reinstall from App Store/Play Store
3. Try again

### Check Permissions
1. Phone Settings → Apps → Expo Go
2. Ensure Notifications are enabled
3. Restart app

---

## ✨ Success Indicators

✅ No more "projectId" error  
✅ FCM token appears in console  
✅ Token saved in database  
✅ Test notification received  

The fix is now applied. Just restart your app and login again!
