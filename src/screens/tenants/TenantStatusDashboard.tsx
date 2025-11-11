import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ScreenLayout } from '../../components/ScreenLayout';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../services/core/axiosInstance';
import { Theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TenantStatusStats {
  total: number;
  active: number;
  with_pending_rent: number;
  with_partial_rent: number;
  with_paid_rent: number;
  without_advance: number;
  total_due_amount: number;
}

interface Tenant {
  s_no: number;
  tenant_id: string;
  name: string;
  phone_no?: string;
  email?: string;
  status: string;
  is_rent_paid: boolean;
  is_rent_partial: boolean;
  rent_due_amount: number;
  partial_due_amount: number;
  pending_due_amount: number;
  is_advance_paid: boolean;
  pending_months: number;
  rooms?: {
    room_no: string;
    rent_price: number;
  };
}

type TabType = 'pending' | 'partial' | 'paid' | 'advance';

interface TenantStatusDashboardProps {
  navigation: any;
}

export const TenantStatusDashboard: React.FC<TenantStatusDashboardProps> = ({ navigation }) => {
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const [stats, setStats] = useState<TenantStatusStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  useEffect(() => {
    loadData();
  }, [selectedPGLocationId, activeTab]);

  const loadData = async () => {
    if (!selectedPGLocationId) return;
    
    setLoading(true);
    try {
      await Promise.all([loadStatistics(), loadTenants()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axiosInstance.get('/tenant-status/statistics');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadTenants = async () => {
    try {
      const endpoints: Record<TabType, string> = {
        pending: '/tenant-status/pending-rent',
        partial: '/tenant-status/partial-rent',
        paid: '/tenant-status/paid-rent',
        advance: '/tenant-status/without-advance',
      };
      
      const response = await axiosInstance.get(endpoints[activeTab], {
        params: { page: 1, limit: 100 }
      });
      setTenants(response.data.data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusBadge = (tenant: Tenant) => {
    if (!tenant.is_rent_paid && tenant.pending_months > 0) {
      return {
        label: `${tenant.pending_months} ${tenant.pending_months === 1 ? 'Month' : 'Months'} Pending`,
        color: Theme.colors.danger,
        bgColor: '#FEE2E2',
      };
    }
    if (tenant.is_rent_partial) {
      return {
        label: 'Partial Payment',
        color: '#F97316',
        bgColor: '#FFEDD5',
      };
    }
    if (tenant.is_rent_paid) {
      return {
        label: 'Paid',
        color: Theme.colors.secondary,
        bgColor: '#D1FAE5',
      };
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    value: string | number; 
    subtitle: string; 
    icon: string; 
    color: string; 
    bgColor: string;
  }) => (
    <Card style={{ marginBottom: 12, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: Theme.colors.textSecondary, marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold' as const, color: Theme.colors.text.primary, marginBottom: 2 }}>
            {value}
          </Text>
          <Text style={{ fontSize: 11, color: Theme.colors.textSecondary }}>
            {subtitle}
          </Text>
        </View>
        <View style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 12, 
          backgroundColor: bgColor, 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
      </View>
      <View style={{ height: 3, backgroundColor: color, marginTop: 12, borderRadius: 2 }} />
    </Card>
  );

  const TenantCard = ({ tenant }: { tenant: Tenant }) => {
    const badge = getStatusBadge(tenant);
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('TenantDetails', { tenantId: tenant.s_no })}
        activeOpacity={0.7}
      >
        <Card style={{ marginBottom: 12, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: Theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' as const }}>
                {tenant.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' as const, color: Theme.colors.text.primary, marginBottom: 2 }}>
                {tenant.name}
              </Text>
              <Text style={{ fontSize: 12, color: Theme.colors.textSecondary }}>
                {tenant.tenant_id}
              </Text>
            </View>
          </View>

          {tenant.rooms && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="home-outline" size={16} color={Theme.colors.textSecondary} />
              <Text style={{ fontSize: 13, color: Theme.colors.textSecondary, marginLeft: 6 }}>
                Room {tenant.rooms.room_no}
              </Text>
            </View>
          )}

          {tenant.phone_no && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="call-outline" size={16} color={Theme.colors.textSecondary} />
              <Text style={{ fontSize: 13, color: Theme.colors.textSecondary, marginLeft: 6 }}>
                {tenant.phone_no}
              </Text>
            </View>
          )}

          {badge && (
            <View style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: badge.bgColor,
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '600' as const, color: badge.color }}>
                {badge.label}
              </Text>
            </View>
          )}

          {tenant.rent_due_amount > 0 && (
            <View style={{
              backgroundColor: '#FEF2F2',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: Theme.colors.textSecondary }}>Due Amount:</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold' as const, color: Theme.colors.danger }}>
                  {formatCurrency(tenant.rent_due_amount)}
                </Text>
              </View>
              {tenant.partial_due_amount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, color: Theme.colors.textSecondary }}>Partial:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600' as const, color: '#F97316' }}>
                    {formatCurrency(tenant.partial_due_amount)}
                  </Text>
                </View>
              )}
              {tenant.pending_due_amount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, color: Theme.colors.textSecondary }}>Pending:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600' as const, color: Theme.colors.danger }}>
                    {formatCurrency(tenant.pending_due_amount)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {!tenant.is_advance_paid && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={14} color="#9333EA" />
              <Text style={{ fontSize: 11, color: '#9333EA', fontWeight: '600' as const, marginLeft: 4 }}>
                Advance payment pending
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const tabs = [
    { id: 'pending' as TabType, label: 'Pending', count: stats?.with_pending_rent || 0, color: Theme.colors.danger },
    { id: 'partial' as TabType, label: 'Partial', count: stats?.with_partial_rent || 0, color: '#F97316' },
    { id: 'paid' as TabType, label: 'Paid', count: stats?.with_paid_rent || 0, color: Theme.colors.secondary },
    { id: 'advance' as TabType, label: 'No Advance', count: stats?.without_advance || 0, color: '#9333EA' },
  ];

  return (
    <ScreenLayout>
      <ScreenHeader 
        title="Tenant Status" 
        showBackButton={false}
      />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 16 }}>
          {/* Statistics Cards */}
          {stats && (
            <>
              <StatCard
                title="Total Tenants"
                value={stats.active}
                subtitle={`${stats.total} total`}
                icon="people"
                color="#3B82F6"
                bgColor="#DBEAFE"
              />
              
              <StatCard
                title="Pending Rent"
                value={stats.with_pending_rent}
                subtitle="Needs attention"
                icon="alert-circle"
                color={Theme.colors.danger}
                bgColor="#FEE2E2"
              />
              
              <StatCard
                title="Partial Payments"
                value={stats.with_partial_rent}
                subtitle="Incomplete"
                icon="time"
                color="#F97316"
                bgColor="#FFEDD5"
              />
              
              <StatCard
                title="Paid Rent"
                value={stats.with_paid_rent}
                subtitle="Up to date"
                icon="checkmark-circle"
                color={Theme.colors.secondary}
                bgColor="#D1FAE5"
              />
              
              <StatCard
                title="Without Advance"
                value={stats.without_advance}
                subtitle="Pending deposit"
                icon="card"
                color="#9333EA"
                bgColor="#F3E8FF"
              />
              
              <StatCard
                title="Total Due Amount"
                value={formatCurrency(stats.total_due_amount)}
                subtitle="Outstanding"
                icon="cash"
                color="#6366F1"
                bgColor="#E0E7FF"
              />
            </>
          )}

          {/* Tabs */}
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: activeTab === tab.id ? Theme.colors.text.primary : 'white',
                      flexDirection: 'row' as const,
                      alignItems: 'center' as const,
                      gap: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    } as any}
                  >
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600' as const,
                      color: activeTab === tab.id ? 'white' : Theme.colors.text.primary,
                    }}>
                      {tab.label}
                    </Text>
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                      backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                    }}>
                      <Text style={{
                        fontSize: 11,
                        fontWeight: 'bold' as const,
                        color: activeTab === tab.id ? 'white' : Theme.colors.text.primary,
                      }}>
                        {tab.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tenants List */}
          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
          ) : tenants.length > 0 ? (
            <View>
              {tenants.map((tenant) => (
                <TenantCard key={tenant.s_no} tenant={tenant} />
              ))}
            </View>
          ) : (
            <Card style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="people-outline" size={64} color={Theme.colors.textSecondary} />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600' as const, 
                color: Theme.colors.text.primary, 
                marginTop: 16,
                marginBottom: 8,
              }}>
                No tenants found
              </Text>
              <Text style={{ fontSize: 13, color: Theme.colors.textSecondary, textAlign: 'center' }}>
                There are no tenants in this category at the moment.
              </Text>
            </Card>
          )}

          {/* Summary Card for Pending Tab */}
          {activeTab === 'pending' && stats && stats.total_due_amount > 0 && (
            <Card style={{ 
              marginTop: 16, 
              padding: 20, 
              backgroundColor: Theme.colors.danger,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>
                    Total Outstanding Amount
                  </Text>
                  <Text style={{ fontSize: 32, fontWeight: 'bold' as const, color: 'white', marginBottom: 8 }}>
                    {formatCurrency(stats.total_due_amount)}
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    From {stats.with_pending_rent} tenants with pending payments
                  </Text>
                </View>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="trending-up" size={32} color="white" />
                </View>
              </View>
            </Card>
          )}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};
