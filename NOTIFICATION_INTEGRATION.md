# 📱 Notification Integration - Setup Complete

## ✅ Changes Made

### 1. **OTPVerificationScreen.tsx**
- Added notification service initialization after successful login
- FCM token will be registered automatically when user logs in

### 2. **SettingsScreen.tsx**
- Added notification cleanup on logout
- FCM token will be unregistered when user logs out

### 3. **notificationService.ts**
- Fixed API client import (was using non-existent `api`, now uses `apiClient`)

---

## 📦 Required Packages

The notification service requires these Expo packages. Install them:

```bash
cd front-end
npx expo install expo-notifications expo-device expo-constants
```

---

## 🧪 Testing Steps

### 1. Install Packages
```bash
cd front-end
npx expo install expo-notifications expo-device expo-constants
```

### 2. Start the App
```bash
npm start
```

### 3. Test on Physical Device
**Important**: Notifications only work on physical devices, not emulators!

- Scan QR code with Expo Go app
- Login with your phone number
- Check console logs for:
  ```
  📱 FCM Token: ExponentPushToken[xxxxx]
  ✅ FCM token registered with backend
  ✅ Notification service initialized
  ```

### 4. Verify in Database
Check if token was saved:
```sql
SELECT * FROM user_fcm_tokens WHERE user_id = YOUR_USER_ID;
```

You should see:
- `fcm_token`: ExponentPushToken[...]
- `device_type`: ios or android
- `is_active`: 1

### 5. Send Test Notification
```bash
POST http://localhost:3000/api/v1/notifications/test
Headers:
  pg_id: 1
  organization_id: 1
  user_id: YOUR_USER_ID
```

You should receive a notification on your phone!

---

## 🔍 Troubleshooting

### Issue: "Cannot find module 'expo-notifications'"
**Solution**: Install the required packages
```bash
npx expo install expo-notifications expo-device expo-constants
```

### Issue: No FCM token in database
**Solution**: 
1. Check console logs for errors
2. Ensure you're testing on a physical device
3. Grant notification permissions when prompted
4. Check backend is running and Firebase env vars are set

### Issue: "Notification permission denied"
**Solution**:
1. Go to phone Settings → Apps → Expo Go
2. Enable Notifications
3. Restart the app and login again

### Issue: Token registered but no notification received
**Solution**:
1. Check backend logs for Firebase initialization: `✅ Firebase Admin initialized successfully`
2. Verify Firebase environment variables in `api/.env`
3. Check notification was sent in backend logs
4. Ensure phone has internet connection

---

## 📝 How It Works Now

### On Login:
1. User enters OTP
2. OTP verified successfully
3. **Notification service initializes**
4. Requests notification permission
5. Gets FCM token from Expo
6. Registers token with backend
7. Backend stores in `user_fcm_tokens` table

### On Logout:
1. User clicks logout
2. **Notification service cleanup**
3. Unregisters FCM token from backend
4. Backend marks token as inactive
5. User logged out

### Receiving Notifications:
1. Backend sends payment reminder/alert
2. Firebase delivers to device
3. Notification appears on phone
4. User taps → navigates to relevant screen

---

## 🎯 Next Steps

1. **Install packages** (see above)
2. **Test on physical device**
3. **Verify token in database**
4. **Send test notification**
5. **Integrate payment notifications** in your payment flow

---

## 💡 Usage in Payment Flow

When a payment is made, add this to your payment service:

```typescript
import { NotificationService } from '../notification/notification.service';

// In your payment method
if (payment.payment_status === 'PARTIAL') {
  await this.notificationService.sendPartialPaymentNotification(userId, {
    tenant_name: tenant.name,
    paid_amount: payment.paid_amount,
    remaining_amount: payment.remaining_amount,
    tenant_id: tenant.s_no,
    payment_id: payment.s_no
  });
}
```

The automated cron jobs will handle:
- Daily payment due reminders
- Overdue alerts
- Weekly pending payment summaries
