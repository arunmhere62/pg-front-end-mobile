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

// User tabs (Admin/Employee) - Super Admin will use separate web app
const userTabs: TabConfig[] = [
  { name: 'Dashboard', label: 'Home', icon: '🏠', permission: Permission.VIEW_DASHBOARD },
  { name: 'Tenants', label: 'Tenants', icon: '👥', permission: Permission.VIEW_TENANTS },
  { name: 'Payments', label: 'Payments', icon: '💰', permission: Permission.VIEW_PAYMENTS },
  { name: 'Settings', label: 'Settings', icon: '⚙️', permission: Permission.VIEW_SETTINGS },
];

export const BottomNav: React.FC<BottomNavProps> = React.memo(({ navigation, currentRoute }) => {
  const insets = useSafeAreaInsets();
  const { can } = usePermissions();
  
  // Filter tabs based on user permissions
  const accessibleTabs = userTabs.filter(tab => can(tab.permission));
  
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {accessibleTabs.map((tab) => {
        const isActive = currentRoute === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, { opacity: isActive ? 1 : 0.6 }]}>{tab.icon}</Text>
            <Text style={[
              styles.label,
              { 
                color: isActive ? Theme.colors.primary : Theme.colors.text.secondary,
                fontWeight: isActive ? '700' : '600'
              }
            ]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
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
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingTop: 8,
    minHeight: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
        borderTopWidth: 1.5,
        borderTopColor: 'rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
  },
});
