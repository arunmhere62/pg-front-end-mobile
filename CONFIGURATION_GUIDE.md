# 🔧 Configuration Management Guide

## 📋 **Single Source of Truth Architecture**

### **Configuration Flow:**
```
.env file → app.config.js → Constants.expoConfig.extra → environment.ts → All other files
```

## 🎯 **How to Change API URL**

### **✅ Correct Way (Single Place):**
```bash
# Edit .env file only
API_BASE_URL=https://your-new-api-url.com/api/v1
```

### **❌ Wrong Way (Multiple Places):**
~~Don't edit app.json, index.ts, api.config.ts, or any other files~~

## 📁 **File Structure**

### **1. Environment Variables (.env)**
```bash
# Primary configuration source
API_BASE_URL=https://pg-api-mobile.onrender.com/api/v1
SUBSCRIPTION_MODE=true
SHOW_DEV_BANNER=false
```

### **2. Expo Configuration (app.config.js)**
```javascript
// Reads from .env and passes to app
module.exports = {
  expo: {
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || "fallback-url",
      subscriptionMode: process.env.SUBSCRIPTION_MODE === 'true',
      showDevBanner: process.env.SHOW_DEV_BANNER === 'true'
    }
  }
};
```

### **3. Centralized Environment (src/config/environment.ts)**
```typescript
// Single source of truth for app configuration
export const ENV = {
  API_BASE_URL: appConfig.apiBaseUrl!,
  SUBSCRIPTION_MODE: appConfig.subscriptionMode ?? true,
  SHOW_DEV_BANNER: appConfig.showDevBanner ?? false,
};
```

### **4. Configuration Exports (src/config/index.ts)**
```typescript
// Re-exports centralized configuration
export { ENV, getApiUrl } from './environment';
export const API_BASE_URL = ENV.API_BASE_URL;
```

### **5. API Configuration (src/config/api.config.ts)**
```typescript
// Uses centralized environment
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: 30000,
};
```

## 🚀 **Usage Examples**

### **In Components:**
```typescript
import { ENV, getApiUrl } from '@/config';

// Use environment variables
const apiUrl = ENV.API_BASE_URL;
const isProduction = ENV.IS_PROD;

// Build API URLs
const loginUrl = getApiUrl('/auth/login');
```

### **In Services:**
```typescript
import { API_CONFIG } from '@/config/api.config';

// Use API configuration
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});
```

## 🔍 **Configuration Validation**

### **Automatic Validation:**
- Environment configuration validates on app startup
- Throws clear error if API_BASE_URL is missing
- Logs configuration in development mode

### **Debug Configuration:**
```typescript
import { logConfig } from '@/config';

// Log current configuration
logConfig();
```

## 🎯 **Benefits of This Architecture**

### **✅ Single Source of Truth:**
- Only `.env` file needs to be changed
- No duplication across multiple files
- Consistent configuration everywhere

### **✅ Type Safety:**
- TypeScript interfaces for configuration
- Compile-time validation
- Auto-completion in IDE

### **✅ Error Prevention:**
- Validation on app startup
- Clear error messages
- Development-time configuration logging

### **✅ Environment Management:**
```bash
# Development
API_BASE_URL=http://localhost:5000/api/v1

# Staging  
API_BASE_URL=https://staging-api.example.com/api/v1

# Production
API_BASE_URL=https://pg-api-mobile.onrender.com/api/v1
```

## 🔄 **Migration Completed**

### **Before (5 places to change):**
- ❌ `.env` file
- ❌ `app.config.js`
- ❌ `app.json`
- ❌ `src/config/index.ts`
- ❌ `src/config/api.config.ts`

### **After (1 place to change):**
- ✅ `.env` file only

## 🛠️ **Troubleshooting**

### **If API URL is not working:**
1. Check `.env` file has correct URL
2. Restart Expo dev server: `npx expo start --clear`
3. Check console for configuration logs
4. Verify app.config.js is reading .env correctly

### **Configuration Debug:**
```typescript
import { ENV, logConfig } from '@/config';

console.log('Current API URL:', ENV.API_BASE_URL);
logConfig(); // Logs all configuration
```

## 🎉 **Result**

Now you only need to change the API URL in **one place** (`.env` file) and it will automatically update everywhere in your app! 🚀
