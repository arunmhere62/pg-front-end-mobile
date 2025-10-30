import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { usePermissions } from '../hooks/usePermissions';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Permission } from '../config/rbac.config';

// Use require to avoid TypeScript errors
const { NavigationContainer, useNavigation, useNavigationState } = require('@react-navigation/native');
const { createNativeStackNavigator } = require('@react-navigation/native-stack');
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// Main Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { SuperAdminDashboard } from '../screens/dashboard/SuperAdminDashboard';
import { TenantsScreen } from '../screens/tenants/TenantsScreen';
import { TenantDetailsScreen } from '../screens/tenants/TenantDetailsScreen';
import { AddTenantScreen } from '../screens/tenants/AddTenantScreen';
import { RoomsScreen } from '../screens/rooms/RoomsScreen';
import { RoomDetailsScreen } from '../screens/rooms/RoomDetailsScreen';
import { BedsScreen } from '../screens/beds/BedsScreen';
import { PaymentsScreen } from '../screens/payments/PaymentsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { UserProfileScreen } from '../screens/settings/UserProfileScreen';
import { PGLocationsScreen } from '../screens/pg-locations/PGLocationsScreen';
import { OrganizationsScreen } from '../screens/organizations/OrganizationsScreen';
import { BottomNav } from '../components/BottomNav';
import { ExpenseScreen } from '@/screens/expense/ExpenseScreen';
import { EmployeeSalaryScreen } from '@/screens/employee-salary/EmployeeSalaryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tabs component that keeps screens mounted
const MainTabs = () => {
  const navigation = useNavigation();
  const { can, isSuperAdmin, role } = usePermissions();
  const currentRoute = useNavigationState((state: any) => {
    const route = state?.routes[state.index];
    return route?.state?.routes?.[route.state.index]?.name || route?.name || 'Dashboard';
  });

  // Debug logging
  console.log('📱 MainTabs - isSuperAdmin:', isSuperAdmin);
  console.log('📱 MainTabs - role:', role);
  console.log('📱 MainTabs - Dashboard Component:', isSuperAdmin ? 'SuperAdminDashboard' : 'DashboardScreen');

  // Define screen configurations with permissions
  // Use SuperAdminDashboard for SuperAdmin, regular Dashboard for others
  const screens = [
    {
      name: 'Dashboard',
      component: isSuperAdmin ? SuperAdminDashboard : DashboardScreen,
      permission: Permission.VIEW_DASHBOARD,
    },
    {
      name: 'Tenants',
      component: TenantsScreen,
      permission: Permission.VIEW_TENANTS,
    },
    {
      name: 'Payments',
      component: PaymentsScreen,
      permission: Permission.VIEW_PAYMENTS,
    },
    {
      name: 'Settings',
      component: SettingsScreen,
      permission: Permission.VIEW_SETTINGS,
    },
  ];

  // Filter screens based on permissions
  const accessibleScreens = screens.filter(screen => can(screen.permission));

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <View style={{ flex: 1, paddingBottom: 60 }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            lazy: false,
            animationEnabled: false,
          }}
          sceneContainerStyle={{ backgroundColor: 'transparent' }}
          initialRouteName="Dashboard"
        >
          {accessibleScreens.map(screen => (
            <Tab.Screen
              key={screen.name}
              name={screen.name}
              component={screen.component}
              options={{ animationEnabled: false }}
            />
          ))}
        </Tab.Navigator>
      </View>
      <BottomNav navigation={navigation} currentRoute={currentRoute} />
    </View>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="PGLocations" component={PGLocationsScreen} />
            <Stack.Screen name="Organizations" component={OrganizationsScreen} />
            <Stack.Screen name="Rooms" component={RoomsScreen} />
            <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
            <Stack.Screen name="Beds" component={BedsScreen} />
            <Stack.Screen name="TenantDetails" component={TenantDetailsScreen} />
            <Stack.Screen name="AddTenant" component={AddTenantScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Expenses" component={ExpenseScreen} />
            <Stack.Screen name="EmployeeSalary" component={EmployeeSalaryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
