import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../config/rbac.config';

interface BottomNavProps {
  navigation: any;
  currentRoute: string;
}

interface TabConfig {
  name: string;
  label: string;
  icon: string;
  permission: Permission;
}

const allTabs: TabConfig[] = [
  { name: 'Dashboard', label: 'Home', icon: '🏠', permission: Permission.VIEW_DASHBOARD },
  { name: 'Tenants', label: 'Tenants', icon: '👥', permission: Permission.VIEW_TENANTS },
  { name: 'Payments', label: 'Payments', icon: '💰', permission: Permission.VIEW_PAYMENTS },
  { name: 'Settings', label: 'Settings', icon: '⚙️', permission: Permission.VIEW_SETTINGS },
];

export const BottomNav: React.FC<BottomNavProps> = React.memo(({ navigation, currentRoute }) => {
  const insets = useSafeAreaInsets();
  const { can } = usePermissions();
  
  // Filter tabs based on user permissions
  const accessibleTabs = allTabs.filter(tab => can(tab.permission));
  
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom + 50) }]}>
      {accessibleTabs.map((tab) => {
        const isActive = currentRoute === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, { opacity: isActive ? 1 : 0.85 }]}>{tab.icon}</Text>
            <Text style={[
              styles.label,
              { color: Theme.colors.text.inverse, opacity: isActive ? 1 : 0.85 }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

BottomNav.displayName = 'BottomNav';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Theme.colors.primary,
    borderTopWidth: 0,
    minHeight: 60,
    maxHeight: 80,
    paddingTop: 8,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  icon: {
    fontSize: 24,
    height: 28,
    lineHeight: 28,
    marginBottom: 4,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
    height: 14,
    textAlign: 'center',
  },
});
