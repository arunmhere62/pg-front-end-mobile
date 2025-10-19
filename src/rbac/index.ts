/**
 * RBAC (Role-Based Access Control) Module
 * 
 * Central export point for all RBAC functionality
 * 
 * Usage:
 * import { usePermissions, Permission, ProtectedRoute } from '../rbac';
 */

// Configuration
export {
  UserRole,
  Permission,
  RolePermissions,
  ScreenAccessConfig,
  hasPermission,
  getRolePermissions,
  canAccessScreen,
  getAccessibleScreens,
  hasAnyPermission,
  hasAllPermissions,
} from '../config/rbac.config';

export type { ScreenConfig } from '../config/rbac.config';

// Hooks
export { usePermissions } from '../hooks/usePermissions';

// Components
export { ProtectedRoute } from '../components/ProtectedRoute';
export { PermissionGuard } from '../components/PermissionGuard';
