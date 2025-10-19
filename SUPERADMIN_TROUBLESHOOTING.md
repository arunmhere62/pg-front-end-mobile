# SuperAdmin Dashboard Troubleshooting Guide

## Issue: SuperAdmin Dashboard Not Showing

### Quick Fixes Applied

1. **Backend Updated** - Both auth services now check for multiple role name formats:
   - `SUPER_ADMIN` (database format)
   - `super_admin` (lowercase with underscore)
   - `superadmin` (legacy format)

2. **Frontend Updated** - Permission hook checks for:
   - `SUPER_ADMIN` (exact match)
   - `super_admin` (lowercase)

3. **Debug Logging Added** - Console logs to help identify the issue

## How to Debug

### Step 1: Check Console Logs

After logging in, check the browser console for these logs:

```
🔐 usePermissions - User Role: SUPER_ADMIN
🔐 usePermissions - User Data: { role_name: "SUPER_ADMIN", ... }
📱 MainTabs - isSuperAdmin: true
📱 MainTabs - role: SUPER_ADMIN
📱 MainTabs - Dashboard Component: SuperAdminDashboard
```

### Step 2: Verify Database Role Name

Check your database:
```sql
SELECT u.s_no, u.name, r.role_name 
FROM users u 
JOIN roles r ON u.role_id = r.s_no 
WHERE u.phone = 'YOUR_PHONE_NUMBER';
```

Expected result: `role_name` should be `SUPER_ADMIN`

### Step 3: Check API Response

In Network Logger or browser DevTools, check the login response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "role_name": "SUPER_ADMIN",  // Should be this
    ...
  }
}
```

### Step 4: Verify Redux State

Check Redux DevTools for auth state:
```javascript
{
  auth: {
    user: {
      role_name: "SUPER_ADMIN",  // Should be this
      ...
    }
  }
}
```

## Common Issues & Solutions

### Issue 1: Role name is lowercase "super_admin"

**Solution**: Already handled! Both backend and frontend now support this format.

### Issue 2: Role name is "SuperAdmin" (PascalCase)

**Solution**: Update database to use `SUPER_ADMIN`:
```sql
UPDATE roles 
SET role_name = 'SUPER_ADMIN' 
WHERE role_name = 'SuperAdmin';
```

### Issue 3: User has wrong role_id

**Solution**: Check user's role_id matches SUPER_ADMIN role:
```sql
-- Find SUPER_ADMIN role
SELECT s_no FROM roles WHERE role_name = 'SUPER_ADMIN';

-- Update user's role
UPDATE users 
SET role_id = (SELECT s_no FROM roles WHERE role_name = 'SUPER_ADMIN')
WHERE s_no = YOUR_USER_ID;
```

### Issue 4: Redux state not updating

**Solution**: 
1. Clear app cache
2. Logout and login again
3. Check if login action is dispatching correctly

### Issue 5: Console shows wrong role

**Check these locations:**

1. **Login Response** - Check network tab
2. **Redux Store** - Check Redux DevTools
3. **usePermissions Hook** - Check console logs
4. **Database** - Verify role_name in roles table

## Testing Steps

### Test 1: Fresh Login
1. Logout completely
2. Clear browser cache
3. Login with SUPER_ADMIN credentials
4. Check console logs
5. Verify SuperAdmin dashboard appears

### Test 2: Role Switching
1. Login as SUPER_ADMIN
2. Verify SuperAdmin dashboard
3. Logout
4. Login as ADMIN
5. Verify regular dashboard

### Test 3: Permission Checks
```typescript
// In any component
const { isSuperAdmin, role, permissions } = usePermissions();

console.log('Is SuperAdmin?', isSuperAdmin);
console.log('Role:', role);
console.log('Permissions:', permissions);
```

## Expected Behavior

### SUPER_ADMIN User Should See:
- ✅ SuperAdmin Dashboard (not regular dashboard)
- ✅ System-wide statistics
- ✅ Organization management options
- ✅ No PG location selector
- ✅ All screens accessible

### ADMIN User Should See:
- ✅ Regular Dashboard
- ✅ Organization-specific statistics
- ✅ PG location selector
- ✅ Most screens accessible

### EMPLOYEE User Should See:
- ✅ Regular Dashboard
- ✅ Limited statistics
- ✅ PG location selector
- ✅ Limited screens accessible

## Debug Checklist

- [ ] Check console logs for role name
- [ ] Verify database role_name is `SUPER_ADMIN`
- [ ] Check API response has correct role_name
- [ ] Verify Redux state has correct role_name
- [ ] Confirm isSuperAdmin is true in console
- [ ] Check MainTabs log shows SuperAdminDashboard
- [ ] Clear cache and re-login
- [ ] Check backend auth service is updated

## Quick Test Script

Add this to any component to test:

```typescript
import { usePermissions } from '../hooks/usePermissions';

function TestComponent() {
  const { isSuperAdmin, role, can, permissions } = usePermissions();
  
  console.log('=== RBAC TEST ===');
  console.log('Role:', role);
  console.log('Is SuperAdmin:', isSuperAdmin);
  console.log('Can view dashboard:', can(Permission.VIEW_DASHBOARD));
  console.log('All permissions:', permissions);
  console.log('================');
  
  return null;
}
```

## Still Not Working?

1. **Restart backend server** - Ensure updated code is running
2. **Clear frontend cache** - Hard refresh (Ctrl+Shift+R)
3. **Check database** - Verify role_name exactly matches
4. **Check Redux** - Ensure user data is stored correctly
5. **Check logs** - Look for any errors in console

## Contact Support

If issue persists, provide:
1. Console logs (all 🔐 and 📱 logs)
2. Database role_name value
3. API response JSON
4. Redux state screenshot
5. Any error messages
