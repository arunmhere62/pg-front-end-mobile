# Axios Interceptor & Request Headers Documentation

## Overview
Centralized axios instance with automatic header injection and comprehensive request/response logging.

---

## Features

### 🔐 Automatic Header Injection
- **Authorization**: Bearer token from Redux store
- **X-User-Id**: Current user ID
- **X-Organization-Id**: User's organization ID

### 📊 Comprehensive Logging
- Request details (URL, method, headers, params, body)
- Response details (status, data)
- Error details (status, error data)
- Formatted with visual separators

### 🎯 Centralized Configuration
- Single axios instance for all API calls
- Consistent timeout (30 seconds)
- Base URL from config
- Content-Type: application/json

---

## Implementation

### File Structure
```
front-end/src/
├── services/
│   └── axiosInstance.ts  ← Axios instance with interceptors
├── config/
│   └── index.ts          ← API_BASE_URL configuration
└── store/
    └── index.ts          ← Redux store
```

---

## Axios Instance Configuration

### Base Configuration
```typescript
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,  // http://172.20.10.2:3000/api/v1
  timeout: 30000,         // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## Request Interceptor

### Functionality
1. **Get Redux State**: Access auth state from store
2. **Extract User Data**: Get user and access token
3. **Inject Headers**:
   - `Authorization: Bearer {token}`
   - `X-User-Id: {userId}`
   - `X-Organization-Id: {organizationId}`
4. **Log Request Details**: Console log with formatting

### Code
```typescript
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const { user, accessToken } = state.auth;

    // Add Authorization header
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add User ID header
    if (user?.s_no) {
      config.headers['X-User-Id'] = user.s_no.toString();
    }

    // Add Organization ID header
    if (user?.organization_id) {
      config.headers['X-Organization-Id'] = user.organization_id.toString();
    }

    // Log request details
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 API REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 URL:', config.method?.toUpperCase(), config.url);
    console.log('📋 Headers:', JSON.stringify(config.headers, null, 2));
    if (config.params) {
      console.log('🔍 Query Params:', JSON.stringify(config.params, null, 2));
    }
    if (config.data) {
      console.log('📦 Request Body:', JSON.stringify(config.data, null, 2));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);
```

---

## Response Interceptor

### Success Handler
Logs successful responses with:
- URL and method
- Status code
- Response data

```typescript
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 API RESPONSE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗 URL:', response.config.method?.toUpperCase(), response.config.url);
    console.log('✅ Status:', response.status, response.statusText);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return response;
  },
  // ... error handler
);
```

### Error Handler
Logs errors with:
- URL and method
- Status code
- Error data
- Request details (if no response)

```typescript
(error) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ API ERROR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (error.response) {
    console.log('🔗 URL:', error.config?.method?.toUpperCase(), error.config?.url);
    console.log('❌ Status:', error.response.status, error.response.statusText);
    console.log('📦 Error Data:', JSON.stringify(error.response.data, null, 2));
  } else if (error.request) {
    console.log('📡 No Response Received');
    console.log('Request:', error.request);
  } else {
    console.log('⚠️ Error:', error.message);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return Promise.reject(error);
}
```

---

## Usage

### Import
```typescript
import axiosInstance from '../../services/axiosInstance';
```

### GET Request
```typescript
const response = await axiosInstance.get('/pg-locations');
```

### GET with Query Params
```typescript
const response = await axiosInstance.get('/location/states', {
  params: { countryCode: 'IN' }
});
```

### POST Request
```typescript
const response = await axiosInstance.post('/pg-locations', {
  locationName: 'Green Valley PG',
  address: '123 Main Street',
  stateId: 1,
  cityId: 1,
});
```

### PUT Request
```typescript
const response = await axiosInstance.put('/pg-locations/1', {
  locationName: 'Updated Name',
  status: 'INACTIVE',
});
```

### DELETE Request
```typescript
const response = await axiosInstance.delete('/pg-locations/1');
```

---

## Console Log Examples

### Request Log
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 API REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 URL: POST /pg-locations
📋 Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "X-User-Id": "1",
  "X-Organization-Id": "1"
}
📦 Request Body: {
  "locationName": "Green Valley PG",
  "address": "123 Main Street, Bangalore",
  "stateId": 1,
  "cityId": 1,
  "pincode": "560001"
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Response Log
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 API RESPONSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 URL: POST /pg-locations
✅ Status: 201 Created
📦 Response Data: {
  "success": true,
  "message": "PG location created successfully",
  "data": {
    "s_no": 1,
    "location_name": "Green Valley PG",
    "address": "123 Main Street, Bangalore",
    "status": "ACTIVE"
  }
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Error Log
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ API ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 URL: POST /pg-locations
❌ Status: 400 Bad Request
📦 Error Data: {
  "statusCode": 400,
  "message": [
    "locationName should not be empty",
    "address should not be empty"
  ],
  "error": "Bad Request"
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Headers Sent

### Authorization Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Automatically added if `accessToken` exists in Redux store
- Used for JWT authentication

### User ID Header
```
X-User-Id: 1
```
- Automatically added if `user.s_no` exists
- Identifies the current user making the request

### Organization ID Header
```
X-Organization-Id: 1
```
- Automatically added if `user.organization_id` exists
- Identifies the user's organization
- Used for multi-tenancy and data isolation

---

## Backend Integration

### NestJS Controller
The backend can extract these headers:

```typescript
@Get()
async findAll(@Request() req: any) {
  const userId = req.headers['x-user-id'];
  const organizationId = req.headers['x-organization-id'];
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Use these values for authorization and filtering
  return this.service.findAll(userId, organizationId);
}
```

### Express Middleware
```typescript
app.use((req, res, next) => {
  console.log('User ID:', req.headers['x-user-id']);
  console.log('Organization ID:', req.headers['x-organization-id']);
  console.log('Token:', req.headers.authorization);
  next();
});
```

---

## Files Updated

### Created
1. **`front-end/src/services/axiosInstance.ts`**
   - Axios instance with interceptors

### Modified
1. **`front-end/src/screens/pg-locations/PGLocationsScreen.tsx`**
   - Replaced `axios` with `axiosInstance`
   - Removed `API_BASE_URL` imports

2. **`front-end/src/screens/auth/SignupScreen.tsx`**
   - Replaced `axios` with `axiosInstance`
   - Removed `API_BASE_URL` imports

---

## Benefits

### 🔐 Security
- Automatic token injection
- No manual header management
- Consistent authentication

### 📊 Debugging
- Complete request/response visibility
- Easy troubleshooting
- Error tracking

### 🎯 Consistency
- Single source of truth
- Uniform error handling
- Centralized configuration

### 🚀 Maintainability
- Easy to update headers globally
- Simple to add new interceptors
- Clean code in components

---

## Best Practices

### 1. Always Use axiosInstance
```typescript
// ✅ Good
import axiosInstance from '../../services/axiosInstance';
const response = await axiosInstance.get('/pg-locations');

// ❌ Bad
import axios from 'axios';
const response = await axios.get(`${API_BASE_URL}/pg-locations`);
```

### 2. Use Relative URLs
```typescript
// ✅ Good
await axiosInstance.get('/pg-locations');

// ❌ Bad
await axiosInstance.get('http://localhost:3000/api/v1/pg-locations');
```

### 3. Let Interceptors Handle Headers
```typescript
// ✅ Good
await axiosInstance.get('/pg-locations');
// Headers added automatically

// ❌ Bad
await axiosInstance.get('/pg-locations', {
  headers: {
    'X-User-Id': userId,
    'X-Organization-Id': orgId,
  }
});
```

---

## Troubleshooting

### Headers Not Sent
**Problem**: Headers are undefined or missing

**Solution**:
1. Check if user is logged in
2. Verify Redux store has user data
3. Check console logs for request details

### Token Expired
**Problem**: 401 Unauthorized errors

**Solution**:
1. Implement token refresh logic
2. Add token expiry check
3. Redirect to login on 401

### Console Logs Too Verbose
**Problem**: Too many logs in production

**Solution**:
```typescript
// Add environment check
if (__DEV__) {
  console.log('📤 API REQUEST');
  // ... logging code
}
```

---

## Future Enhancements

- [ ] Add token refresh interceptor
- [ ] Add retry logic for failed requests
- [ ] Add request queuing
- [ ] Add offline support
- [ ] Add request caching
- [ ] Add request cancellation
- [ ] Add rate limiting
- [ ] Add request deduplication
- [ ] Add performance metrics
- [ ] Environment-based logging

---

## Security Considerations

1. **Never log sensitive data** in production
2. **Use HTTPS** for all API calls
3. **Implement token refresh** before expiry
4. **Validate tokens** on backend
5. **Use secure storage** for tokens
6. **Implement CSRF protection** if needed
7. **Rate limit** API requests
8. **Sanitize** user inputs

---

## Testing

### Test Headers Are Sent
```typescript
// Mock Redux store
const mockStore = {
  auth: {
    user: { s_no: 1, organization_id: 1 },
    accessToken: 'test-token',
  },
};

// Make request
const response = await axiosInstance.get('/test');

// Verify headers
expect(response.config.headers['Authorization']).toBe('Bearer test-token');
expect(response.config.headers['X-User-Id']).toBe('1');
expect(response.config.headers['X-Organization-Id']).toBe('1');
```

---

## Support

For issues or questions:
- Check console logs for request/response details
- Verify Redux store has correct user data
- Ensure backend is running and accessible
- Check network connectivity
