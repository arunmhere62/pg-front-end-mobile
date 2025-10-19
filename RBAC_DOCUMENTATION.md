# Role-Based Access Control (RBAC) Documentation

## Overview

This application implements a comprehensive Role-Based Access Control (RBAC) system that controls access to screens, features, and actions based on user roles.

## Architecture

### 1. **Configuration Layer** (`src/config/rbac.config.ts`)
- Centralized configuration for all roles and permissions
- Defines role hierarchy and permission mappings
- Screen access configuration

### 2. **Hook Layer** (`src/hooks/usePermissions.ts`)
- React hook for easy permission checking
- Provides convenient methods for permission validation

### 3. **Component Layer**
- `ProtectedRoute`: Protects entire screens
- `PermissionGuard`: Protects UI elements/features

### 4. **Navigation Layer** (`src/navigation/AppNavigator.tsx`)
- Dynamically renders screens based on permissions
- Filters bottom navigation tabs

---

## Available Roles

| Role | Description |
|------|-------------|
| **SuperAdmin** | Full system access, manages all organizations |
| **Admin** | Full access within their organization |
| **Manager** | Manages daily operations, limited admin access |
| **Employee** | Basic access for day-to-day tasks |
| **Accountant** | Financial operations and reporting |

---

## Permission Matrix

### Dashboard
| Permission | SuperAdmin | Admin | Manager | Employee | Accountant |
|------------|------------|-------|---------|----------|------------|
| VIEW_DASHBOARD | ✅ | ✅ | ✅ | ✅ | ✅ |

### PG Locations
| Permission | SuperAdmin | Admin | Manager | Employee | Accountant |
|------------|------------|-------|---------|----------|------------|
| VIEW_PG_LOCATIONS | ✅ | ✅ | ✅ | ❌ | ❌ |
| CREATE_PG_LOCATION | ✅ | ✅ | ❌ | ❌ | ❌ |
| EDIT_PG_LOCATION | ✅ | ✅ | ✅ | ❌ | ❌ |
| DELETE_PG_LOCATION | ✅ | ✅ | ❌ | ❌ | ❌ |

### Tenants
| Permission | SuperAdmin | Admin | Manager | Employee | Accountant |
|------------|------------|-------|---------|----------|------------|
| VIEW_TENANTS | ✅ | ✅ | ✅ | ✅ | ✅ |
| CREATE_TENANT | ✅ | ✅ | ✅ | ✅ | ❌ |
| EDIT_TENANT | ✅ | ✅ | ✅ | ✅ | ❌ |
| DELETE_TENANT | ✅ | ✅ | ✅ | ❌ | ❌ |

### Payments
| Permission | SuperAdmin | Admin | Manager | Employee | Accountant |
|------------|------------|-------|---------|----------|------------|
| VIEW_PAYMENTS | ✅ | ✅ | ✅ | ✅ | ✅ |
| CREATE_PAYMENT | ✅ | ✅ | ✅ | ❌ | ✅ |
| EDIT_PAYMENT | ✅ | ✅ | ✅ | ❌ | ✅ |
| DELETE_PAYMENT | ✅ | ✅ | ❌ | ❌ | ❌ |
| APPROVE_PAYMENT | ✅ | ✅ | ❌ | ❌ | ✅ |

### Expenses
| Permission | SuperAdmin | Admin | Manager | Employee | Accountant |
|------------|------------|-------|---------|----------|------------|
| VIEW_EXPENSES | ✅ | ✅ | ✅ | ✅ | ✅ |
| CREATE_EXPENSE | ✅ | ✅ | ✅ | ❌ | ✅ |
| EDIT_EXPENSE | ✅ | ✅ | ✅ | ❌ | ✅ |
| DELETE_EXPENSE | ✅ | ✅ | ❌ | ❌ | ✅ |

### Reports
| Permission | SuperAdmin | Admin | Manager | Employee | Accountant |
|------------|------------|-------|---------|----------|------------|
| VIEW_REPORTS | ✅ | ✅ | ✅ | ❌ | ✅ |
| EXPORT_REPORTS | ✅ | ✅ | ❌ | ❌ | ✅ |

### Settings
| Permission | SuperAdmin | Admin | Manager | Employee | Accountant |
|------------|------------|-------|---------|----------|------------|
| VIEW_SETTINGS | ✅ | ✅ | ✅ | ❌ | ❌ |
| EDIT_SETTINGS | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Usage Examples

### 1. Using the `usePermissions` Hook

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../config/rbac.config';

function TenantsScreen() {
  const { can, canAny, role, isSuperAdmin } = usePermissions();

  return (
    <View>
      {/* Check single permission */}
      {can(Permission.CREATE_TENANT) && (
        <Button title="Add Tenant" onPress={handleCreate} />
      )}

      {/* Check multiple permissions (ANY) */}
      {canAny([Permission.EDIT_TENANT, Permission.DELETE_TENANT]) && (
        <ActionButtons />
      )}

      {/* Check role */}
      {isSuperAdmin && (
        <AdminPanel />
      )}
    </View>
  );
}
```

### 2. Using `ProtectedRoute` Component

```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Permission } from '../config/rbac.config';

// Protect entire screen
<ProtectedRoute requiredPermission={Permission.VIEW_TENANTS}>
  <TenantsScreen />
</ProtectedRoute>

// Protect with multiple permissions (ANY)
<ProtectedRoute 
  requiredPermissions={[Permission.VIEW_TENANTS, Permission.CREATE_TENANT]}
  requireAll={false}
>
  <TenantsScreen />
</ProtectedRoute>

// Protect with custom fallback
<ProtectedRoute 
  requiredPermission={Permission.VIEW_REPORTS}
  fallback={<CustomAccessDenied />}
>
  <ReportsScreen />
</ProtectedRoute>
```

### 3. Using `PermissionGuard` Component

```typescript
import { PermissionGuard } from '../components/PermissionGuard';
import { Permission } from '../config/rbac.config';

function TenantCard({ tenant }) {
  return (
    <Card>
      <Text>{tenant.name}</Text>
      
      {/* Show edit button only if user has permission */}
      <PermissionGuard permission={Permission.EDIT_TENANT}>
        <Button title="Edit" onPress={handleEdit} />
      </PermissionGuard>

      {/* Show delete button only if user has permission */}
      <PermissionGuard permission={Permission.DELETE_TENANT}>
        <Button title="Delete" onPress={handleDelete} />
      </PermissionGuard>

      {/* Show action buttons if user has ANY of these permissions */}
      <PermissionGuard 
        permissions={[Permission.EDIT_TENANT, Permission.DELETE_TENANT]}
        requireAll={false}
      >
        <ActionMenu />
      </PermissionGuard>
    </Card>
  );
}
```

### 4. Programmatic Permission Checks

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../config/rbac.config';

function PaymentScreen() {
  const { can, permissions, role } = usePermissions();

  const handlePaymentAction = () => {
    if (!can(Permission.CREATE_PAYMENT)) {
      Alert.alert('Access Denied', 'You do not have permission to create payments');
      return;
    }
    
    // Proceed with action
    createPayment();
  };

  // Get all user permissions
  console.log('User permissions:', permissions);
  console.log('User role:', role);

  return <View>...</View>;
}
```

---

## Adding New Roles

To add a new role:

1. **Add role to enum** in `rbac.config.ts`:
```typescript
export enum UserRole {
  // ... existing roles
  RECEPTIONIST = 'Receptionist',
}
```

2. **Define permissions** for the role:
```typescript
export const RolePermissions: Record<UserRole, Permission[]> = {
  // ... existing roles
  [UserRole.RECEPTIONIST]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_TENANTS,
    Permission.CREATE_TENANT,
    // ... other permissions
  ],
};
```

---

## Adding New Permissions

To add a new permission:

1. **Add to Permission enum**:
```typescript
export enum Permission {
  // ... existing permissions
  SEND_NOTIFICATIONS = 'send_notifications',
}
```

2. **Assign to roles**:
```typescript
[UserRole.ADMIN]: [
  // ... existing permissions
  Permission.SEND_NOTIFICATIONS,
],
```

3. **Use in components**:
```typescript
<PermissionGuard permission={Permission.SEND_NOTIFICATIONS}>
  <SendNotificationButton />
</PermissionGuard>
```

---

## Adding New Screens

To add a new screen with RBAC:

1. **Add screen config**:
```typescript
export const ScreenAccessConfig: ScreenConfig[] = [
  // ... existing screens
  {
    name: 'Reports',
    path: 'Reports',
    requiredPermission: Permission.VIEW_REPORTS,
    icon: '📊',
    showInMenu: true,
  },
];
```

2. **Add to navigation**:
```typescript
const screens = [
  // ... existing screens
  {
    name: 'Reports',
    component: ReportsScreen,
    permission: Permission.VIEW_REPORTS,
  },
];
```

3. **Add to bottom nav** (if needed):
```typescript
const allTabs: TabConfig[] = [
  // ... existing tabs
  { 
    name: 'Reports', 
    label: 'Reports', 
    icon: '📊', 
    permission: Permission.VIEW_REPORTS 
  },
];
```

---

## Best Practices

### 1. **Always Check Permissions on Both Frontend and Backend**
- Frontend checks improve UX
- Backend checks ensure security

### 2. **Use Granular Permissions**
- Prefer specific permissions over broad ones
- Example: `CREATE_TENANT` instead of `MANAGE_TENANTS`

### 3. **Fail Securely**
- Default to denying access if permission is unclear
- Show clear error messages

### 4. **Test All Roles**
- Test each role thoroughly
- Verify both allowed and denied actions

### 5. **Document Changes**
- Update this documentation when adding roles/permissions
- Keep permission matrix up to date

---

## Security Considerations

1. **Never trust frontend checks alone** - Always validate on backend
2. **Store minimal user data** in frontend state
3. **Refresh permissions** after role changes
4. **Log permission denials** for security monitoring
5. **Use HTTPS** for all API communications

---

## Troubleshooting

### User can't access a screen they should have access to
1. Check if role is correctly set in Redux state
2. Verify permission is assigned to role in `rbac.config.ts`
3. Check if screen is added to navigation with correct permission
4. Clear app cache and re-login

### Permission check not working
1. Ensure `usePermissions` hook is used inside a component
2. Verify Redux store is properly configured
3. Check if user data includes `role_name` field

### Bottom nav not showing all tabs
1. Verify user has required permissions
2. Check if tabs are properly configured in `BottomNav.tsx`
3. Ensure permissions are correctly assigned in `rbac.config.ts`

---

## Future Enhancements

- [ ] Dynamic permission loading from backend
- [ ] Permission caching and optimization
- [ ] Audit logging for permission checks
- [ ] Role hierarchy (role inheritance)
- [ ] Time-based permissions
- [ ] Location-based permissions
- [ ] Custom permission rules engine

---

## Support

For questions or issues related to RBAC:
1. Check this documentation
2. Review the code examples
3. Contact the development team
