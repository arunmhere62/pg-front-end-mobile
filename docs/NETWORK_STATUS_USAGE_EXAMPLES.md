# Network Status - Usage Examples

## 🎯 Quick Start

### **Import the Hook**

```tsx
import { useNetwork } from '@/providers/NetworkStatusProvider';
```

### **Basic Usage**

```tsx
const MyComponent = () => {
  const { isOnline } = useNetwork();

  return (
    <View>
      <Text>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</Text>
    </View>
  );
};
```

## 📱 Real-World Examples

### **1. Dashboard Screen - Show Cached Data When Offline**

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, RefreshControl, ScrollView } from 'react-native';
import { useNetwork } from '@/providers/NetworkStatusProvider';

const DashboardScreen = () => {
  const { isOnline, checkConnection } = useNetwork();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (isOnline) {
      // Fetch from API
      const apiData = await fetchDashboardData();
      await cacheData(apiData); // Cache for offline use
      setData(apiData);
    } else {
      // Load from cache
      const cachedData = await getCachedData();
      setData(cachedData);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const connected = await checkConnection();
    
    if (!connected) {
      Alert.alert('Offline', 'Cannot refresh while offline');
      setRefreshing(false);
      return;
    }

    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [isOnline]); // Reload when connectivity changes

  return (
    <ScrollView
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          enabled={isOnline} // Disable pull-to-refresh when offline
        />
      }
    >
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠ Showing cached data - Last updated: {data?.timestamp}
          </Text>
        </View>
      )}
      
      {/* Dashboard content */}
      <DashboardContent data={data} />
    </ScrollView>
  );
};
```

### **2. Payment Screen - Disable Actions When Offline**

```tsx
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { useNetwork } from '@/providers/NetworkStatusProvider';

const PaymentScreen = () => {
  const { isOnline, checkConnection } = useNetwork();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    // Double-check connectivity before critical operation
    const connected = await checkConnection();
    
    if (!connected) {
      Alert.alert(
        'No Internet Connection',
        'Payment processing requires an active internet connection. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setProcessing(true);
    try {
      await processPayment();
      Alert.alert('Success', 'Payment processed successfully');
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Payment form */}
      
      <Button
        title={processing ? 'Processing...' : 'Pay Now'}
        onPress={handlePayment}
        disabled={!isOnline || processing}
      />
      
      {!isOnline && (
        <Text style={styles.warning}>
          ⚠ Internet connection required for payments
        </Text>
      )}
    </View>
  );
};
```

### **3. Form Screen - Queue Submissions When Offline**

```tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useNetwork } from '@/providers/NetworkStatusProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TenantFormScreen = () => {
  const { isOnline } = useNetwork();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    room: '',
  });

  const saveToQueue = async (data) => {
    const queue = await AsyncStorage.getItem('pendingSubmissions') || '[]';
    const submissions = JSON.parse(queue);
    submissions.push({ ...data, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem('pendingSubmissions', JSON.stringify(submissions));
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      // Save to queue for later
      await saveToQueue(formData);
      Alert.alert(
        'Saved Offline',
        'Your submission has been saved and will be sent when you\'re back online.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Submit immediately
    try {
      await submitToServer(formData);
      Alert.alert('Success', 'Tenant added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
      <TextInput
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
      />
      
      <Button title="Submit" onPress={handleSubmit} />
      
      {!isOnline && (
        <View style={styles.offlineNotice}>
          <Text style={styles.offlineText}>
            📱 Offline Mode - Submissions will be queued
          </Text>
        </View>
      )}
    </View>
  );
};
```

### **4. Image Upload - Prevent Upload When Offline**

```tsx
import React, { useState } from 'react';
import { View, Image, Button, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNetwork } from '@/providers/NetworkStatusProvider';

const ProfileImageUpload = () => {
  const { isOnline, checkConnection } = useNetwork();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    // Check connectivity before upload
    const connected = await checkConnection();
    
    if (!connected) {
      Alert.alert(
        'No Internet',
        'Image upload requires an internet connection. Please try again when online.',
        [{ text: 'OK' }]
      );
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      await uploadToServer(formData);
      Alert.alert('Success', 'Image uploaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      
      <Button title="Pick Image" onPress={pickImage} />
      
      {image && (
        <Button
          title={uploading ? 'Uploading...' : 'Upload'}
          onPress={uploadImage}
          disabled={!isOnline || uploading}
        />
      )}
      
      {!isOnline && image && (
        <Text style={styles.warning}>
          ⚠ Connect to internet to upload
        </Text>
      )}
    </View>
  );
};
```

### **5. Settings Screen - Show Connection Status**

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNetwork } from '@/providers/NetworkStatusProvider';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { isOnline, lastOnlineTime, checkConnection } = useNetwork();

  const formatLastOnline = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Connection Status Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons
            name={isOnline ? 'cloud-done' : 'cloud-offline'}
            size={24}
            color={isOnline ? '#10B981' : '#EF4444'}
          />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Connection Status</Text>
            <Text style={[
              styles.statusValue,
              { color: isOnline ? '#10B981' : '#EF4444' }
            ]}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
        </View>
        
        {!isOnline && lastOnlineTime && (
          <Text style={styles.lastOnline}>
            Last online: {formatLastOnline(lastOnlineTime)}
          </Text>
        )}
        
        <TouchableOpacity
          style={styles.checkButton}
          onPress={checkConnection}
        >
          <Text style={styles.checkButtonText}>Check Connection</Text>
        </TouchableOpacity>
      </View>

      {/* Other settings */}
    </View>
  );
};
```

### **6. API Service - Automatic Retry**

```tsx
import { store } from '@/store';
import { useNetwork } from '@/providers/NetworkStatusProvider';

class APIService {
  static async fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        // Check if it's a network error
        if (error.message.includes('Network request failed')) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
          
          if (i === maxRetries - 1) {
            throw new Error('Network error: Please check your connection');
          }
        } else {
          throw error;
        }
      }
    }
  }
}

// Usage in component
const MyComponent = () => {
  const { isOnline } = useNetwork();

  const loadData = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot load data while offline');
      return;
    }

    try {
      const response = await APIService.fetchWithRetry('/api/data');
      const data = await response.json();
      // Process data
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return <Button title="Load Data" onPress={loadData} />;
};
```

## 🎨 Styling Examples

### **Offline Warning Banner**

```tsx
const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  offlineText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

### **Connection Status Indicator**

```tsx
const ConnectionIndicator = () => {
  const { isOnline } = useNetwork();

  return (
    <View style={styles.indicator}>
      <View style={[
        styles.dot,
        { backgroundColor: isOnline ? '#10B981' : '#EF4444' }
      ]} />
      <Text style={styles.indicatorText}>
        {isOnline ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

## 🚀 Advanced Patterns

### **Sync Queue Pattern**

```tsx
// Create a sync queue manager
class SyncQueue {
  static async addToQueue(action) {
    const queue = await AsyncStorage.getItem('syncQueue') || '[]';
    const items = JSON.parse(queue);
    items.push({ ...action, id: Date.now() });
    await AsyncStorage.setItem('syncQueue', JSON.stringify(items));
  }

  static async processQueue() {
    const queue = await AsyncStorage.getItem('syncQueue') || '[]';
    const items = JSON.parse(queue);
    
    for (const item of items) {
      try {
        await this.executeAction(item);
        // Remove from queue on success
        await this.removeFromQueue(item.id);
      } catch (error) {
        console.error('Failed to sync:', error);
      }
    }
  }
}

// Use in component
const MyComponent = () => {
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (isOnline) {
      // Process queued actions when back online
      SyncQueue.processQueue();
    }
  }, [isOnline]);
};
```

### **Optimistic Updates**

```tsx
const TodoList = () => {
  const { isOnline } = useNetwork();
  const [todos, setTodos] = useState([]);

  const addTodo = async (text) => {
    const newTodo = { id: Date.now(), text, synced: false };
    
    // Optimistic update
    setTodos([...todos, newTodo]);

    if (isOnline) {
      try {
        await saveTodoToServer(newTodo);
        // Mark as synced
        setTodos(prev => prev.map(t => 
          t.id === newTodo.id ? { ...t, synced: true } : t
        ));
      } catch (error) {
        // Revert on error
        setTodos(prev => prev.filter(t => t.id !== newTodo.id));
      }
    } else {
      // Queue for later
      await SyncQueue.addToQueue({ type: 'ADD_TODO', data: newTodo });
    }
  };

  return (
    <View>
      {todos.map(todo => (
        <View key={todo.id} style={styles.todoItem}>
          <Text>{todo.text}</Text>
          {!todo.synced && <Text style={styles.pending}>⏳ Pending</Text>}
        </View>
      ))}
    </View>
  );
};
```

## 📊 Summary

The `useNetwork()` hook provides:

- ✅ `isOnline` - Current connectivity status
- ✅ `checkConnection()` - Manual connectivity check
- ✅ `lastOnlineTime` - Timestamp of last connection
- ✅ `showOfflineBanner` - Banner visibility state

Use it to:
- Disable actions when offline
- Show cached data
- Queue operations
- Provide user feedback
- Handle errors gracefully

---

**Pro Tip**: Always check connectivity before critical operations like payments, uploads, or data submissions!
