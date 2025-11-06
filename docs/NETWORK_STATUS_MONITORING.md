# Network Status Monitoring - Root Level Implementation

## 🎯 Overview

Implemented a comprehensive, root-level network connectivity monitoring system similar to high-level applications like Gmail, WhatsApp, Slack, and Instagram. The system provides real-time network status detection, visual feedback, and programmatic access throughout the app.

## 🏗️ Architecture

### **How High-Level Apps Handle Network Status**

#### **1. Gmail / Google Apps**
```
- Persistent banner at top when offline
- "No connection" with retry button
- Queue actions for when back online
- Gray out send buttons
```

#### **2. WhatsApp**
```
- "Connecting..." banner
- Queue messages when offline
- Auto-retry when back online
- Show timestamp of last connection
```

#### **3. Slack**
```
- Prominent offline banner
- "You're offline" message
- Disable message sending
- Show reconnecting status
```

#### **4. Instagram**
```
- "No Internet Connection" banner
- Cached content still viewable
- Disable posting/commenting
- Auto-refresh when back online
```

### **Our Implementation**

We've implemented a similar system with:
- ✅ Root-level network monitoring
- ✅ Animated banner notifications
- ✅ Real-time connectivity checks
- ✅ Programmatic access via hooks
- ✅ Automatic retry logic
- ✅ Last online timestamp

## 📦 Components

### **1. NetworkStatusProvider**

Root-level provider that wraps the entire app.

**Location**: `src/providers/NetworkStatusProvider.tsx`

**Features**:
- Real-time connectivity monitoring
- Periodic health checks (every 10 seconds)
- Multiple endpoint fallbacks
- Animated banner notifications
- Context API for app-wide access

### **2. Network Context**

Provides network status to all components.

```typescript
interface NetworkContextType {
  isOnline: boolean;           // Internet connectivity status
  isConnected: boolean;        // Same as isOnline
  connectionType: string;      // 'wifi' | 'cellular' | 'none' | 'unknown'
  lastOnlineTime: Date | null; // Last time app was online
  checkConnection: () => Promise<boolean>; // Manual connectivity check
  showOfflineBanner: boolean;  // Banner visibility state
}
```

## 🚀 Implementation

### **Step 1: Provider Setup (Already Done)**

The `NetworkStatusProvider` is wrapped at the root level in `App.tsx`:

```tsx
// App.tsx
import { NetworkStatusProvider } from './src/providers/NetworkStatusProvider';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <NetworkStatusProvider>  {/* ← Root-level wrapper */}
              <StatusBar />
              <AppNavigator />
            </NetworkStatusProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
```

### **Step 2: Using Network Status in Components**

#### **Basic Usage**

```tsx
import { useNetwork } from '@/providers/NetworkStatusProvider';

const MyComponent = () => {
  const { isOnline, checkConnection } = useNetwork();

  return (
    <View>
      {isOnline ? (
        <Text>✓ Connected</Text>
      ) : (
        <Text>⚠ Offline</Text>
      )}
    </View>
  );
};
```

#### **Conditional API Calls**

```tsx
const DashboardScreen = () => {
  const { isOnline, checkConnection } = useNetwork();

  const loadData = async () => {
    // Check connectivity before API call
    if (!isOnline) {
      Alert.alert('No Connection', 'Please check your internet connection');
      return;
    }

    try {
      const data = await fetchDashboardData();
      // Process data
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      <Button 
        title="Refresh" 
        onPress={loadData}
        disabled={!isOnline}  // Disable when offline
      />
    </View>
  );
};
```

#### **Manual Connectivity Check**

```tsx
const PaymentScreen = () => {
  const { checkConnection } = useNetwork();

  const handlePayment = async () => {
    // Verify connectivity before critical operation
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      Alert.alert('No Internet', 'Payment requires internet connection');
      return;
    }

    // Proceed with payment
    await processPayment();
  };

  return (
    <Button title="Pay Now" onPress={handlePayment} />
  );
};
```

#### **Show Last Online Time**

```tsx
const SettingsScreen = () => {
  const { isOnline, lastOnlineTime } = useNetwork();

  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      {!isOnline && lastOnlineTime && (
        <Text>Last online: {lastOnlineTime.toLocaleString()}</Text>
      )}
    </View>
  );
};
```

## 🎨 Visual Feedback

### **Offline Banner**

When the app goes offline, an animated banner slides down from the top:

```
┌────────────────────────────────────────┐
│  ⚠ No Internet Connection              │
│  Last online: 2m ago                   │
└────────────────────────────────────────┘
```

**Styling**:
- **Background**: Red (#EF4444)
- **Icon**: Cloud offline
- **Animation**: Slide down from top
- **Position**: Fixed at top, above all content
- **Z-Index**: 9999 (always on top)

### **Back Online Banner**

When connectivity is restored:

```
┌────────────────────────────────────────┐
│  ✓ Back Online                         │
└────────────────────────────────────────┘
```

**Styling**:
- **Background**: Green (#10B981)
- **Icon**: Cloud done
- **Duration**: Shows for 2 seconds, then fades out
- **Animation**: Slide down, then slide up

## 🔧 Technical Details

### **Connectivity Detection Methods**

#### **1. Primary Check - Google**
```typescript
fetch('https://www.google.com/generate_204', {
  method: 'HEAD',
  cache: 'no-cache',
  signal: abortSignal,
})
```

#### **2. Fallback Checks**
```typescript
const endpoints = [
  'https://www.google.com/generate_204',
  'https://www.cloudflare.com/cdn-cgi/trace',
  'https://1.1.1.1/cdn-cgi/trace',
];
```

#### **3. Timeout Handling**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);
```

### **Monitoring Strategy**

```
App Start
  ↓
Initial connectivity check
  ↓
Start periodic checks (every 10 seconds)
  ↓
On status change:
  - Offline → Show red banner
  - Online → Show green banner (2s), then hide
  ↓
Continue monitoring...
```

### **Performance Optimizations**

1. **Lightweight Requests**: Uses HEAD requests (no body)
2. **Timeout Protection**: 5-second timeout on all checks
3. **Efficient Polling**: 10-second intervals (not too frequent)
4. **Abort Controllers**: Cancels pending requests
5. **Cleanup**: Proper cleanup on unmount

## 📊 Use Cases

### **1. Dashboard Screen**

```tsx
const DashboardScreen = () => {
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (isOnline) {
      loadDashboardData();
    }
  }, [isOnline]); // Reload when back online

  return (
    <View>
      {!isOnline && (
        <View style={styles.offlineWarning}>
          <Text>Showing cached data</Text>
        </View>
      )}
      {/* Dashboard content */}
    </View>
  );
};
```

### **2. Payment Screen**

```tsx
const PaymentScreen = () => {
  const { isOnline, checkConnection } = useNetwork();

  const handleSubmit = async () => {
    const connected = await checkConnection();
    if (!connected) {
      Alert.alert('Error', 'Internet required for payments');
      return;
    }
    await submitPayment();
  };

  return (
    <Button 
      title="Submit Payment"
      onPress={handleSubmit}
      disabled={!isOnline}
    />
  );
};
```

### **3. Form Submission**

```tsx
const TenantForm = () => {
  const { isOnline } = useNetwork();
  const [formData, setFormData] = useState({});

  const handleSave = async () => {
    if (!isOnline) {
      // Save locally, sync later
      await saveToLocalStorage(formData);
      Alert.alert('Saved Offline', 'Will sync when online');
      return;
    }

    // Save to server
    await saveToServer(formData);
  };

  return (
    <Form>
      {/* Form fields */}
      <Button title="Save" onPress={handleSave} />
      {!isOnline && <Text>⚠ Offline mode</Text>}
    </Form>
  );
};
```

### **4. Image Upload**

```tsx
const ImageUpload = () => {
  const { isOnline } = useNetwork();

  const handleUpload = async (image) => {
    if (!isOnline) {
      Alert.alert('No Connection', 'Cannot upload images offline');
      return;
    }

    await uploadImage(image);
  };

  return (
    <View>
      <ImagePicker onSelect={handleUpload} />
      {!isOnline && (
        <Text style={styles.warning}>
          Image upload requires internet
        </Text>
      )}
    </View>
  );
};
```

## 🎯 Best Practices

### **1. Check Before Critical Operations**

```tsx
// ✅ Good
const handlePayment = async () => {
  if (!isOnline) {
    Alert.alert('No Internet', 'Payment requires connection');
    return;
  }
  await processPayment();
};

// ❌ Bad
const handlePayment = async () => {
  await processPayment(); // Will fail silently if offline
};
```

### **2. Provide User Feedback**

```tsx
// ✅ Good
<Button 
  title="Submit"
  onPress={handleSubmit}
  disabled={!isOnline}
/>
{!isOnline && <Text>⚠ Offline - button disabled</Text>}

// ❌ Bad
<Button title="Submit" onPress={handleSubmit} />
// User doesn't know why it's not working
```

### **3. Cache Data When Possible**

```tsx
// ✅ Good
const loadData = async () => {
  if (isOnline) {
    const data = await fetchFromAPI();
    await cacheData(data);
    return data;
  } else {
    return await getCachedData();
  }
};

// ❌ Bad
const loadData = async () => {
  return await fetchFromAPI(); // Fails when offline
};
```

### **4. Queue Actions for Later**

```tsx
// ✅ Good
const handleAction = async (action) => {
  if (!isOnline) {
    await queueAction(action);
    Alert.alert('Queued', 'Will execute when online');
    return;
  }
  await executeAction(action);
};
```

## 🔍 Debugging

### **Enable Network Logs**

```typescript
// In NetworkStatusProvider.tsx
const checkConnection = async () => {
  console.log('🔍 Checking connectivity...');
  const isConnected = await checkInternetConnectivity();
  console.log(`📡 Status: ${isConnected ? 'ONLINE' : 'OFFLINE'}`);
  return isConnected;
};
```

### **Test Offline Mode**

1. **Airplane Mode**: Enable airplane mode on device
2. **Network Throttling**: Use Chrome DevTools
3. **Manual Toggle**: Add debug button to force offline state

```tsx
// Debug component
const NetworkDebug = () => {
  const { isOnline, checkConnection } = useNetwork();

  return (
    <View>
      <Text>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</Text>
      <Button title="Check Now" onPress={checkConnection} />
    </View>
  );
};
```

## 📈 Benefits

### **Before Implementation**
```
❌ No network status awareness
❌ API calls fail silently
❌ Poor user experience when offline
❌ No visual feedback
❌ Users confused why app doesn't work
```

### **After Implementation**
```
✅ Real-time network monitoring
✅ Visual feedback with banners
✅ Graceful offline handling
✅ Better user experience
✅ Programmatic access everywhere
✅ Automatic retry when back online
```

## 🎉 Summary

The network status monitoring system provides:

1. **Root-Level Monitoring** - Wraps entire app
2. **Visual Feedback** - Animated banners
3. **Programmatic Access** - `useNetwork()` hook
4. **Real-Time Updates** - 10-second checks
5. **Multiple Fallbacks** - Reliable detection
6. **Performance Optimized** - Lightweight checks
7. **User-Friendly** - Clear messaging

This matches the behavior of high-level production apps and provides a professional, reliable network monitoring solution!

---

**Last Updated**: Nov 6, 2025  
**Feature**: Network Status Monitoring  
**Status**: ✅ Production Ready  
**Level**: Root-Level Implementation
