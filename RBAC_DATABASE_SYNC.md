# RBAC Database Synchronization

## Overview
Updated RBAC configuration to match the actual roles in your database.

## Database Roles (from your screenshot)

| s_no | role_name | status | organization_id |
|------|-----------|--------|-----------------|
| 1 | ADMIN | ACTIVE | 1 |
| 2 | EMPLOYEE | ACTIVE | 1 |
| 3 | SUPER_ADMIN | ACTIVE | 1 |

## Changes Made

### 1. Updated Role Enum (`rbac.config.ts`)

**Before:**
```typescript
export enum UserRole {
  SUPERADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
  ACCOUNTANT = 'Accountant',
}
```

**After:**
```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}
```

### 2. Updated RolePermissions Mapping

Removed `MANAGER` and `ACCOUNTANT` roles, kept only:
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Full organization access
- `EMPLOYEE` - Limited access (view and create tenants, view payments)

### 3. Updated Permission Checks (`usePermissions.ts`)

**Before:**
```typescript
isSuperAdmin: userRole.toLowerCase() === 'superadmin',
isAdmin: userRole.toLowerCase() === 'admin',
```

**After:**
```typescript
isSuperAdmin: userRole === 'SUPER_ADMIN' || userRole.toLowerCase() === 'super_admin',
isAdmin: userRole === 'ADMIN' || userRole.toLowerCase() === 'admin',
```

## Current Permission Matrix

### SUPER_ADMIN
- ✅ **ALL PERMISSIONS** - Full system access
- ✅ View all organizations
- ✅ Manage organizations
- ✅ System-wide operations

### ADMIN
- ✅ Dashboard
- ✅ PG Locations (Full CRUD)
- ✅ Tenants (Full CRUD)
- ✅ Payments (Full CRUD + Approve)
- ✅ Rooms (Full CRUD)
- ✅ Expenses (Full CRUD)
- ✅ Users (Full CRUD)
- ✅ Reports (View + Export)
- ✅ Settings (View + Edit)

### EMPLOYEE
- ✅ Dashboard (View)
- ✅ Tenants (View, Create, Edit)
- ✅ Payments (View only)
- ✅ Rooms (View only)
- ✅ Expenses (View only)

## Dashboard Behavior

### SUPER_ADMIN
- Shows `SuperAdminDashboard`
- System-wide statistics
- Organization management features
- No PG location selector

### ADMIN
- Shows `DashboardScreen`
- Organization-specific statistics
- PG location selector
- Quick actions for operations

### EMPLOYEE
- Shows `DashboardScreen`
- Limited statistics
- PG location selector
- Basic operations only

## Testing Checklist

- [ ] Login as SUPER_ADMIN
  - [ ] Verify SuperAdmin dashboard is shown
  - [ ] Check all screens are accessible
  - [ ] Verify no PG location selector
  
- [ ] Login as ADMIN
  - [ ] Verify regular dashboard is shown
  - [ ] Check PG location selector appears
  - [ ] Verify all admin features work
  - [ ] Test CRUD operations
  
- [ ] Login as EMPLOYEE
  - [ ] Verify regular dashboard is shown
  - [ ] Check limited access to features
  - [ ] Verify can view but not delete
  - [ ] Test create/edit tenant functionality

## Backend Validation Required

Ensure backend validates these roles:
```sql
-- Check user role
SELECT u.*, r.role_name 
FROM users u 
JOIN roles r ON u.role_id = r.s_no 
WHERE u.s_no = ?;

-- Validate role matches one of:
-- 'SUPER_ADMIN', 'ADMIN', 'EMPLOYEE'
```

## API Endpoints to Update

Update all API endpoints to check for these role names:
- `SUPER_ADMIN` (not `SuperAdmin`)
- `ADMIN` (not `Admin`)
- `EMPLOYEE` (not `Employee`)

## Migration Notes

If you need to add more roles in the future:

1. **Add to database** (`roles` table)
2. **Update `UserRole` enum** in `rbac.config.ts`
3. **Add permissions** in `RolePermissions` mapping
4. **Test thoroughly**

## Example: Adding a New Role

```typescript
// 1. Add to enum
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',  // New role
  EMPLOYEE = 'EMPLOYEE',
}

// 2. Add permissions
export const RolePermissions: Record<UserRole, Permission[]> = {
  // ... existing roles
  [UserRole.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_TENANTS,
    Permission.CREATE_TENANT,
    // ... other permissions
  ],
};

// 3. Insert into database
INSERT INTO roles (role_name, status, organization_id) 
VALUES ('MANAGER', 'ACTIVE', 1);
```

## Important Notes

1. **Case Sensitivity**: Role names are now UPPERCASE to match database
2. **Backward Compatibility**: Permission checks support both formats
3. **Database First**: Always create roles in database first
4. **Sync Required**: Keep frontend and backend role names in sync

## Support

For role-related issues:
1. Check database `roles` table
2. Verify `role_name` matches exactly
3. Check `RolePermissions` mapping
4. Test with different users
