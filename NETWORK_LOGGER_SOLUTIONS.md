# Network Logger - High-Level Solutions ✅

## Problem
When the application encounters errors, the UI gets stuck and the network logger cannot be accessed via shake gesture, making debugging impossible.

## Solutions Implemented

### 🎯 Solution 1: Floating Debug Button (PRIMARY)
**Always visible, draggable button that works even when app is frozen**

- **Location**: Top-left corner of screen (draggable anywhere)
- **Icon**: 🔍 magnifying glass
- **Badge**: Shows number of network requests logged
- **Actions**:
  - **Tap**: Opens network logger
  - **Long Press**: Clears all logs
- **Advantages**:
  - Works even when shake detection fails
  - Always accessible, even during errors
  - Visual indicator of network activity
  - Can be moved out of the way

### 🎯 Solution 2: Error Screen Integration
**Network logger button on error boundary screen**

When the app crashes and shows the error screen:
- **"Try Again"** button - Resets the error
- **"View Network Logs" 🔍** button - Opens network logger to debug the error

### 🎯 Solution 3: Improved Shake Detection
**Enhanced shake gesture with better reliability**

Improvements:
- ✅ Permission request for accelerometer
- ✅ Device availability check
- ✅ Lower threshold (2.5 → 2.0) for easier detection
- ✅ Reduced timeout (1000ms → 800ms) for better responsiveness
- ✅ Console logging for debugging
- ✅ Initialization confirmation message

### 🎯 Solution 4: Global Error Handler
**Catches all errors and logs them automatically**

Features:
- Intercepts all unhandled errors
- Logs detailed error information
- Preserves original error handlers
- Works with React Native's ErrorUtils

### 🎯 Solution 5: Programmatic Access
**Open logger from anywhere in code**

```typescript
import { openNetworkLogger } from '@/components/NetworkLoggerModal';

// Call from anywhere
openNetworkLogger();
```

## How to Use

### Method 1: Floating Button (Recommended)
1. Look for the green 🔍 button on screen
2. Tap it to open network logger
3. Drag it to move it around
4. Long press to clear logs

### Method 2: Shake Gesture
1. Shake your device firmly
2. Watch console for "✅ Shake detected!" message
3. Network logger opens automatically

### Method 3: Error Screen
1. When app crashes, error screen appears
2. Tap "View Network Logs" button
3. Inspect network requests that led to the error

### Method 4: From Code
```typescript
// In any component or service
import { openNetworkLogger } from '@/components/NetworkLoggerModal';

try {
  // Your code
} catch (error) {
  console.error('Error occurred:', error);
  openNetworkLogger(); // Open logger to debug
}
```

## Features

### Network Logger Modal
- ✅ View all network requests
- ✅ Filter by status (success/error)
- ✅ Search requests
- ✅ View request/response details
- ✅ Copy CURL commands
- ✅ Statistics (total, success, errors, avg duration)
- ✅ Expandable sections for headers, payload, response
- ✅ Smart data truncation for large responses
- ✅ Copy full data to clipboard

### Floating Button
- ✅ Always visible (except when logger is open)
- ✅ Draggable to any position
- ✅ Badge shows request count
- ✅ High z-index (always on top)
- ✅ Shadow for visibility
- ✅ Tap to open, long press to clear

## Console Messages

Watch for these messages in console:

```
✅ Global error handlers initialized
📱 Network Logger: Shake to open (threshold: 2.0)
Shake detection - Acceleration: 1.23
✅ Shake detected! Opening network logger...
🔴 Global Error Caught: [error details]
```

## Troubleshooting

### Floating button not visible?
- Check if logger modal is open (button hides when modal is visible)
- Try restarting the app
- Check console for initialization errors

### Shake not working?
- Check console for "📱 Network Logger: Shake to open" message
- If not present, accelerometer permission may be denied
- Watch for acceleration values in console
- Try shaking harder (threshold is 2.0)
- Use floating button instead

### Logger opens but no logs?
- Make sure network requests are being made
- Check if logs were cleared (long press floating button)
- Verify axios interceptor is set up correctly

### App still freezes?
- Use floating button (works even when frozen)
- Check error boundary screen for "View Network Logs" button
- Restart app and reproduce issue

## Architecture

```
App.tsx
├── setupGlobalErrorHandlers() ← Catches all errors
├── ErrorBoundary ← Shows error screen with logger button
└── NetworkLoggerModal
    ├── Floating Button ← Always visible
    ├── Shake Detection ← Accelerometer listener
    ├── Global Function ← openNetworkLogger()
    └── Modal UI ← Full logger interface
```

## Files Modified

1. **NetworkLoggerModal.tsx**
   - Added floating button
   - Improved shake detection
   - Added global open function
   - Added draggable functionality

2. **ErrorBoundary.tsx**
   - Added "View Network Logs" button
   - Integrated with openNetworkLogger

3. **App.tsx**
   - Initialize global error handlers
   - Setup on app startup

4. **errorHandler.ts** (NEW)
   - Global error handling
   - Automatic error logging
   - Integration with ErrorUtils

## Best Practices

1. **Always keep floating button visible** - Don't hide it in production
2. **Use long press to clear logs** - Prevents accidental clears
3. **Check console first** - Many issues show up in console logs
4. **Reproduce errors** - With logger open to capture requests
5. **Copy CURL commands** - For testing in Postman/Insomnia

## Future Enhancements

- [ ] Export logs to file
- [ ] Filter by request method (GET, POST, etc.)
- [ ] Timeline view of requests
- [ ] Performance metrics
- [ ] Request replay functionality
- [ ] Share logs via email/messaging

---

**Status**: ✅ All solutions implemented and tested
**Priority**: HIGH - Critical for debugging production issues
**Maintenance**: Keep floating button enabled in all builds
