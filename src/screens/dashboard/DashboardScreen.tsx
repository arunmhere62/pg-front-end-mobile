import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Theme } from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTenants } from '../../store/slices/tenantSlice';
import { fetchPGLocations, setSelectedPGLocation } from '../../store/slices/pgLocationSlice';
import { fetchPayments } from '../../store/slices/paymentSlice';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tenants, loading: tenantsLoading } = useSelector((state: RootState) => state.tenants);
  const { locations, selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { payments } = useSelector((state: RootState) => state.payments);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-select first PG location when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !selectedPGLocationId) {
      dispatch(setSelectedPGLocation(locations[0].s_no));
    }
  }, [locations, selectedPGLocationId, dispatch]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchTenants({
          page: 1,
          limit: 10,
          pg_id: selectedPGLocationId || undefined,
        })),
        dispatch(fetchPGLocations()),
        dispatch(fetchPayments()),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length;

  const menuItems = [
    { title: 'PG Locations', icon: 'business', screen: 'PGLocations', color: '#A855F7' },
    { title: 'Rooms', icon: 'home', screen: 'Rooms', color: '#22C55E' },
    { title: 'Beds', icon: 'bed', screen: 'Beds', color: '#3B82F6' },
    { title: 'Tenants', icon: 'people', screen: 'Tenants', color: '#06B6D4' },
    { title: 'Visitors', icon: 'person-add', screen: 'Visitors', color: '#10B981' },
    { title: 'Employees', icon: 'people-circle', screen: 'Employees', color: '#F59E0B' },
    { title: 'Payments', icon: 'cash', screen: 'Payments', color: '#EAB308' },
    { title: 'Expenses', icon: 'receipt', screen: 'Expenses', color: '#EF4444' },
    { title: 'Employee Salary', icon: 'wallet', screen: 'EmployeeSalary', color: '#8B5CF6' },
    { title: 'Settings', icon: 'settings', screen: 'Settings', color: '#6B7280' },
  ];

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name}`} 
        showPGSelector={true}
      />
        <View style={{ flex: 1, backgroundColor: Theme.colors.background.secondary }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >

          {/* User Info Card */}
          {user && (
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <View style={{ 
                backgroundColor: 'white', 
                borderRadius: 12, 
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: Theme.colors.primary,
              }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, fontWeight: '600', marginRight: 8 }}>
                      ORGANIZATION
                    </Text>
                    <Text style={{ fontSize: 13, color: Theme.colors.text.primary, fontWeight: '600' }}>
                      {user.organization_name || 'N/A'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, fontWeight: '600', marginRight: 8 }}>
                      ROLE
                    </Text>
                    <View style={{ 
                      backgroundColor: '#EEF2FF', 
                      paddingHorizontal: 8, 
                      paddingVertical: 2, 
                      borderRadius: 6 
                    }}>
                      <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '700' }}>
                        {user.role_name || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Stats Cards */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View className="flex-row flex-wrap justify-between">
              <Card className="w-[48%] mb-4">
                <Text className="text-gray-600 text-sm mb-1">Active Tenants</Text>
                <Text className="text-3xl font-bold text-dark">{activeTenants}</Text>
              </Card>
              <Card className="w-[48%] mb-4">
                <Text className="text-gray-600 text-sm mb-1">PG Locations</Text>
                <Text className="text-3xl font-bold text-dark">{locations.length}</Text>
              </Card>
              <Card className="w-[48%] mb-4">
                <Text className="text-gray-600 text-sm mb-1">Total Revenue</Text>
                <Text className="text-2xl font-bold text-secondary">₹{totalRevenue.toFixed(2)}</Text>
              </Card>
              <Card className="w-[48%] mb-4">
                <Text className="text-gray-600 text-sm mb-1">Pending Payments</Text>
                <Text className="text-3xl font-bold text-warning">{pendingPayments}</Text>
              </Card>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (navigation && navigation.navigate) {
                      navigation.navigate(item.screen);
                    }
                  }}
                  style={{ width: '48%', marginBottom: 16 }}
                >
                  <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        backgroundColor: item.color,
                        borderRadius: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <Ionicons name={item.icon as any} size={32} color="#fff" />
                    </View>
                    <Text style={{ color: Theme.colors.text.primary, fontWeight: '600', textAlign: 'center' }}>
                      {item.title}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          </ScrollView>
        </View>
    </ScreenLayout>
  );
};
