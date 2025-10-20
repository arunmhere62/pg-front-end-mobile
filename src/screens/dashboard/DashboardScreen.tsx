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
    { title: 'PG Locations', icon: '🏢', screen: 'PGLocations', color: 'bg-purple-500' },
    { title: 'Rooms', icon: '🏠', screen: 'Rooms', color: 'bg-green-500' },
    { title: 'Tenants', icon: '👥', screen: 'Tenants', color: 'bg-blue-500' },
    { title: 'Payments', icon: '💰', screen: 'Payments', color: 'bg-yellow-500' },
    { title: 'Settings', icon: '⚙️', screen: 'Settings', color: 'bg-gray-500' },
  ];

  return (
    <ScreenLayout>
      <ScreenHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name}`} 
        showPGSelector={true}
      />
        <View style={{ flex: 1, backgroundColor: Theme.colors.light }}>
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
          <View className="px-4 mb-6">
            <Text className="text-xl font-bold text-dark mb-4">Quick Actions</Text>
            <View className="flex-row flex-wrap justify-between">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (navigation && navigation.navigate) {
                      navigation.navigate(item.screen);
                    }
                  }}
                  className="w-[48%] mb-4"
                >
                  <Card className="items-center py-6">
                    <View className={`w-16 h-16 ${item.color} rounded-full items-center justify-center mb-3`}>
                      <Text className="text-3xl">{item.icon}</Text>
                    </View>
                    <Text className="text-dark font-semibold text-center">{item.title}</Text>
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
