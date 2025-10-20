# Axios Instance Standardization - Complete ✅

## Summary

All frontend services have been standardized to use **`axiosInstance`** for consistent header management and API communication.

---

## Changes Made

### ✅ Updated Services

All services now import and use `axiosInstance`:

1. **✅ roomService.ts** - Changed from `apiClient` to `axiosInstance`
2. **✅ tenantService.ts** - Already using `axiosInstance`
3. **✅ pgLocationService.ts** - Changed from `apiClient` to `axiosInstance`
4. **✅ paymentService.ts** - Changed from `apiClient` to `axiosInstance`
5. **✅ authService.ts** - Changed from `apiClient` to `axiosInstance`
6. **✅ organizationService.ts** - Already using `axiosInstance`

---

## Benefits

### 1. **Consistent Header Management**
All API calls now use the same axios instance with the same interceptor:

```typescript
// axiosInstance.ts - Request Interceptor
axiosInstance.interceptors.request.use((config) => {
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

  // Add PG Location ID header
  const selectedPGLocationId = state.pgLocations.selectedPGLocationId;
  if (selectedPGLocationId) {
    config.headers['X-PG-Location-Id'] = selectedPGLocationId.toString();
  }

  return config;
});
```

### 2. **Automatic Headers on Every Request**
Headers are automatically added from Redux state:
- ✅ `X-User-Id` - From `auth.user.s_no`
- ✅ `X-Organization-Id` - From `auth.user.organization_id`
- ✅ `X-PG-Location-Id` - From `pgLocations.selectedPGLocationId`
- ✅ `Authorization` - Bearer token from `auth.accessToken`

### 3. **Network Logging**
All requests are logged for debugging:
```typescript
networkLogger.addLog({
  id: logId,
  method: config.method?.toUpperCase() || 'GET',
  url: `${config.baseURL}${config.url}`,
  headers: headersObj,
  requestData: config.data,
  timestamp: new Date(),
});
```

### 4. **Simplified Service Functions**
Services no longer need to manually manage headers:

**Before (with apiClient):**
```typescript
export const getAllRooms = async (
  params: GetRoomsParams = {},
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
) => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();
  
  return await apiClient.get('/rooms', { headers: requestHeaders });
};
```

**After (with axiosInstance):**
```typescript
export const getAllRooms = async (
  params: GetRoomsParams = {},
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
) => {
  // Headers still accepted for manual override if needed
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();
  
  // But interceptor will add them automatically if not provided
  return await axiosInstance.get('/rooms', { headers: requestHeaders });
};
```

---

## How It Works

### Request Flow

1. **Service Function Called**
   ```typescript
   await getAllRooms({ page: 1, limit: 10 });
   ```

2. **Interceptor Adds Headers Automatically**
   ```typescript
   // From Redux state
   X-User-Id: 1
   X-Organization-Id: 1
   X-PG-Location-Id: 5
   Authorization: Bearer <token>
   ```

3. **Request Sent to Backend**
   ```http
   GET /api/v1/rooms?page=1&limit=10
   X-User-Id: 1
   X-Organization-Id: 1
   X-PG-Location-Id: 5
   Authorization: Bearer eyJhbGc...
   ```

4. **Backend Validates Headers**
   ```typescript
   @Get()
   @RequireHeaders({ pg_id: true })
   async findAll(@ValidatedHeaders() headers: ValidatedHeaders) {
     // headers.pg_id is guaranteed to exist
   }
   ```

---

## Configuration

### axiosInstance Setup

**File:** `src/services/axiosInstance.ts`

```typescript
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { store } from '../store';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // http://172.20.10.2:3000/api/v1
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Adds headers automatically
axiosInstance.interceptors.request.use((config) => {
  // Get state from Redux
  const state = store.getState();
  const { user, accessToken } = state.auth;
  const selectedPGLocationId = state.pgLocations.selectedPGLocationId;

  // Add headers
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (user?.s_no) config.headers['X-User-Id'] = user.s_no.toString();
  if (user?.organization_id) config.headers['X-Organization-Id'] = user.organization_id.toString();
  if (selectedPGLocationId) config.headers['X-PG-Location-Id'] = selectedPGLocationId.toString();

  return config;
});

// Response interceptor - Logs responses
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    return response;
  },
  (error) => {
    // Log error response
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## Backend Integration

The backend now validates these headers using the new validation system:

```typescript
@Controller('rooms')
@UseGuards(HeadersValidationGuard)
export class RoomController {
  @Get()
  @RequireHeaders({ pg_id: true })
  async findAll(@ValidatedHeaders() headers: ValidatedHeaders) {
    // headers.pg_id is guaranteed to exist and be valid
    return this.roomService.findAll({ pg_id: headers.pg_id! });
  }
}
```

---

## Testing

### Test with Network Logger

The app includes a built-in network logger to view all requests:

1. Open the app
2. Shake device or press debug menu
3. View network logs
4. Check headers are being sent correctly

### Verify Headers

```typescript
// In any service call
const response = await axiosInstance.get('/rooms');

// Headers automatically included:
// X-User-Id: 1
// X-Organization-Id: 1
// X-PG-Location-Id: 5
// Authorization: Bearer <token>
```

---

## Migration Complete ✅

All services now use `axiosInstance` for:
- ✅ Consistent header management
- ✅ Automatic authentication
- ✅ Network logging
- ✅ Error handling
- ✅ Backend validation compatibility

---

## Notes

### Manual Header Override
Services still accept optional `headers` parameter for manual override if needed:

```typescript
// Override headers manually (rare case)
await getAllRooms(
  { page: 1 },
  { pg_id: 10, organization_id: 2, user_id: 5 }
);
```

### Redux State Required
Headers are pulled from Redux state, so:
- User must be logged in for `X-User-Id` and `X-Organization-Id`
- PG Location must be selected for `X-PG-Location-Id`

### apiClient.ts Status
The `apiClient.ts` file is no longer used by any service but can be kept for backward compatibility or removed if desired.

---

## Future Improvements

- [ ] Remove manual header parameters from service functions (rely on interceptor only)
- [ ] Add retry logic for failed requests
- [ ] Add request caching
- [ ] Add request deduplication
- [ ] Remove unused `apiClient.ts` file
