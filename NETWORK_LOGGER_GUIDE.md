# Network Logger - Shake to Debug 📱

## Overview

I've added a **Network Logger** that lets you view all API requests and responses by **shaking your mobile device**!

## Features

✅ **Shake to Open** - Just shake your phone to open the network logs
✅ **Request Details** - See method, URL, status code, and duration
✅ **Request/Response Bodies** - View full JSON data
✅ **Error Tracking** - See failed requests with error messages
✅ **Timestamps** - Track when each request was made
✅ **Color Coded** - Green for success, Red for errors, Yellow for warnings
✅ **Clear Logs** - Clear all logs with one tap

## How to Use

### 1. Run the App
```bash
cd d:\pg-mobile-app\front-end
npx expo start
```

### 2. Open on Your Phone
- Scan the QR code with Expo Go app
- Make sure your backend API is running

### 3. Shake Your Phone
- **Literally shake your phone** (like you're mixing a cocktail 🍹)
- The Network Logger modal will appear

### 4. View API Requests
You'll see a list of all API calls with:
- **Method** (GET, POST, PUT, DELETE)
- **Status Code** (200, 404, 500, etc.)
- **URL** (endpoint path)
- **Duration** (how long the request took)
- **Timestamp** (when it happened)

### 5. Tap Any Request
- Tap on any log entry to see full details
- View request body (data you sent)
- View response body (data you received)
- See error messages if the request failed

### 6. Clear Logs
- Tap the **"Clear"** button to remove all logs
- Shake again to reopen after closing

## What Gets Logged

### Successful Requests ✅
```
POST /auth/send-otp
Status: 200
Duration: 234ms
Request: { "phone": "9876543210" }
Response: { "success": true, "message": "OTP sent" }
```

### Failed Requests ❌
```
POST /auth/verify-otp
Status: 401
Duration: 156ms
Request: { "phone": "9876543210", "otp": "123456" }
Response: { "error": "Invalid OTP" }
Error: Request failed with status code 401
```

## Color Coding

- 🟢 **Green** - Success (200-299)
- 🔴 **Red** - Error (400+)
- 🟡 **Yellow** - Other statuses
- ⚪ **Gray** - No response yet

## Technical Details

### Files Added/Modified

1. **`src/utils/networkLogger.ts`** - Logger utility that stores network logs
2. **`src/components/NetworkLoggerModal.tsx`** - UI component for displaying logs
3. **`src/services/apiClient.ts`** - Modified to log all requests/responses
4. **`App.tsx`** - Added NetworkLoggerModal component

### How It Works

1. **Axios Interceptors** capture all requests and responses
2. **NetworkLogger** stores up to 50 most recent logs
3. **Shake Detector** listens for device shake gesture
4. **Modal** displays logs in a user-friendly format

## Troubleshooting

### Shake Not Working?
- Make sure you're using a **physical device** (not simulator)
- Shake harder! It needs a good shake to trigger
- Check that `react-native-shake` is installed

### No Logs Showing?
- Make sure your backend API is running
- Check that requests are actually being made
- Try making a login attempt first

### Can't See Full JSON?
- Tap on the log entry to see full details
- Scroll horizontally in the JSON view
- JSON is formatted with proper indentation

## Tips

💡 **Best Practices:**
- Clear logs periodically to avoid clutter
- Use this during development to debug API issues
- Check request/response bodies to verify data format
- Monitor response times to identify slow endpoints

💡 **When to Use:**
- Debugging login/authentication issues
- Verifying API request payloads
- Checking response data structure
- Identifying network errors
- Monitoring API performance

## Example Scenarios

### Scenario 1: Login Not Working
1. Shake phone to open logger
2. Try to login
3. Check if OTP request shows status 200
4. Verify phone number in request body
5. Check response for error messages

### Scenario 2: Data Not Loading
1. Navigate to the problematic screen
2. Shake to open logger
3. Check if API request was made
4. Verify status code (should be 200)
5. Inspect response data structure

### Scenario 3: Slow Performance
1. Make some API calls
2. Shake to open logger
3. Check duration column
4. Identify slow endpoints (>1000ms)
5. Optimize those specific calls

## Removing the Logger (Production)

For production builds, you may want to disable the logger:

1. Comment out in `App.tsx`:
```tsx
// import { NetworkLoggerModal } from './src/components/NetworkLoggerModal';
// <NetworkLoggerModal />
```

2. Or add environment check:
```tsx
{__DEV__ && <NetworkLoggerModal />}
```

## Dependencies

- `react-native-shake` - Detects shake gesture
- `axios` - HTTP client (already installed)

---

**Happy Debugging! 🐛🔍**

Shake your phone anytime to see what's happening under the hood!
