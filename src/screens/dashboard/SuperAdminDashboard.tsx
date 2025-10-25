import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Theme } from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchOrganizationStats } from '../../store/slices/organizationSlice';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';

interface SuperAdminDashboardProps {
  navigation: any;
}

/**
 * SuperAdmin Dashboard
 * 
 * Shows organization-level metrics and system-wide statistics
 * Only accessible to SuperAdmin role
 */
export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, loading } = useSelector((state: RootState) => state.organizations);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      await dispatch(fetchOrganizationStats()).unwrap();
    } catch (error) {
      console.error('Error loading SuperAdmin data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuperAdminData();
    setRefreshing(false);
  };

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader 
        title="SuperAdmin Dashboard" 
        subtitle={`Welcome back, ${user?.name}`}
      />

      <View style={{ flex: 1, backgroundColor: Theme.colors.background.secondary }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={{ padding: 16 }}>
            {/* System Overview */}
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 12,
              color: Theme.colors.text.primary 
            }}>
              System Overview
            </Text>

            {/* Stats Grid */}
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              marginHorizontal: -8,
              marginBottom: 24 
            }}>
              <View style={{ width: '50%', padding: 8 }}>
                <Card style={{ padding: 16 }}>
                  <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 }}>
                    Total Organizations
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: Theme.colors.primary }}>
                    {stats?.totalOrganizations || 0}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>
                    {stats?.activeOrganizations || 0} active
                  </Text>
                </Card>
              </View>

              <View style={{ width: '50%', padding: 8 }}>
                <Card style={{ padding: 16 }}>
                  <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 }}>
                    Total Users
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: Theme.colors.primary }}>
                    {stats?.totalUsers || 0}
                  </Text>
                  <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                    Across all orgs
                  </Text>
                </Card>
              </View>

              <View style={{ width: '50%', padding: 8 }}>
                <Card style={{ padding: 16 }}>
                  <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 }}>
                    PG Locations
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#10B981' }}>
                    {stats?.totalPGLocations || 0}
                  </Text>
                  <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                    System-wide
                  </Text>
                </Card>
              </View>

              <View style={{ width: '50%', padding: 8 }}>
                <Card style={{ padding: 16 }}>
                  <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 4 }}>
                    Total Tenants
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#F59E0B' }}>
                    {stats?.totalTenants || 0}
                  </Text>
                  <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                    All organizations
                  </Text>
                </Card>
              </View>
            </View>

            {/* Revenue Card */}
            <Card style={{ padding: 16, marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginBottom: 8 }}>
                Total System Revenue
              </Text>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#10B981' }}>
                ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                Across all organizations
              </Text>
            </Card>

            {/* Quick Actions */}
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 12,
              color: Theme.colors.text.primary 
            }}>
              System Management
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              <TouchableOpacity 
                style={{ width: '50%', padding: 8 }}
                onPress={() => navigation.navigate('Organizations')}
              >
                <Card style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>🏢</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
                    Manage Organizations
                  </Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => {/* Navigate to System Users */}}
              >
                <Text style={{ fontSize: 32, marginRight: 16 }}>👥</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                    System Users
                  </Text>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                    Manage users across all organizations
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: Theme.colors.text.tertiary }}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => {/* Navigate to System Reports */}}
              >
                <Text style={{ fontSize: 32, marginRight: 16 }}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                    System Reports
                  </Text>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                    View comprehensive system analytics
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: Theme.colors.text.tertiary }}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => {/* Navigate to System Settings */}}
              >
                <Text style={{ fontSize: 32, marginRight: 16 }}>⚙️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                    System Settings
                  </Text>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                    Configure system-wide settings
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: Theme.colors.text.tertiary }}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginTop: 24,
              marginBottom: 12,
              color: Theme.colors.text.primary 
            }}>
              Recent System Activity
            </Text>

            <Card style={{ padding: 16 }}>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                Activity feed coming soon...
              </Text>
            </Card>
          </View>
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};
