import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Permission,
  hasPermission,
  getRolePermissions,
  canAccessScreen,
  getAccessibleScreens,
  hasAnyPermission,
  hasAllPermissions,
  ScreenConfig,
} from '../config/rbac.config';

/**
 * Custom hook for role-based access control
 * 
 * Usage:
 * const { can, canAccess, accessibleScreens } = usePermissions();
 * 
 * if (can('create_tenant')) {
 *   // Show create button
 * }
 */
export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role_name || '';


  return {
    /**
     * Check if user has a specific permission
     * @param permission - Permission to check
     * @returns boolean
     */
    can: (permission: Permission): boolean => {
      return hasPermission(userRole, permission);
    },

    /**
     * Check if user has any of the permissions
     * @param permissions - Array of permissions
     * @returns boolean
     */
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(userRole, permissions);
    },

    /**
     * Check if user has all of the permissions
     * @param permissions - Array of permissions
     * @returns boolean
     */
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(userRole, permissions);
    },

    /**
     * Check if user can access a screen
     * @param screenPath - Screen path/name
     * @returns boolean
     */
    canAccess: (screenPath: string): boolean => {
      return canAccessScreen(userRole, screenPath);
    },

    /**
     * Get all permissions for current user
     * @returns Permission[]
     */
    permissions: getRolePermissions(userRole),

    /**
     * Get all accessible screens for current user
     * @returns ScreenConfig[]
     */
    accessibleScreens: getAccessibleScreens(userRole),

    /**
     * Get current user role
     * @returns string
     */
    role: userRole,

    /**
     * Check if user is SuperAdmin
     * @returns boolean
     */
    isSuperAdmin: userRole === 'SUPER_ADMIN' || userRole.toLowerCase() === 'super_admin',

    /**
     * Check if user is Admin
     * @returns boolean
     */
    isAdmin: userRole === 'ADMIN' || userRole.toLowerCase() === 'admin',

    /**
     * Get user info
     */
    user,
  };
};
