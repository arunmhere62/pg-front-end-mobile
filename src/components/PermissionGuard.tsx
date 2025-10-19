import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../config/rbac.config';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions
 * Useful for hiding/showing buttons, sections, or features
 * 
 * Usage:
 * <PermissionGuard permission={Permission.CREATE_TENANT}>
 *   <Button title="Add Tenant" />
 * </PermissionGuard>
 * 
 * Or with multiple permissions:
 * <PermissionGuard 
 *   permissions={[Permission.EDIT_TENANT, Permission.DELETE_TENANT]}
 *   requireAll={false}
 * >
 *   <ActionButtons />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { can, canAny, canAll } = usePermissions();

  // Check single permission
  if (permission) {
    return can(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions) {
    const hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // If no permissions specified, render children
  return <>{children}</>;
};
