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
import { RootState } from '../store';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../services/core/axiosInstance';
import { Theme } from '../theme';

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

type TabType = 'pending' | 'partial' | 'advance';

interface TenantStatusContentProps {
  navigation: any;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const TenantStatusContent: React.FC<TenantStatusContentProps> = ({ 
  navigation, 
  onRefresh,
  refreshing = false 
}) => {
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const [stats, setStats] = useState<TenantStatusStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleRefresh = async () => {
    await loadData();
    if (onRefresh) {
      onRefresh();
    }
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


  const TenantCard = ({ tenant }: { tenant: Tenant }) => {
    // Use API-provided status data (enriched by TenantStatusService on API side)
    const badge = getStatusBadge(tenant);
    
    // Determine card background and border based on API status data
    const getCardStyle = () => {
      if (!tenant.is_rent_paid && tenant.pending_months > 0) {
        return {
          backgroundColor: '#FFF5F5', // Light red background for pending
          borderColor: '#FED7D7',
          borderWidth: 1,
        };
      } else if (tenant.is_rent_partial) {
        return {
          backgroundColor: '#FFFBEB', // Light orange background for partial
          borderColor: '#FED7AA',
          borderWidth: 1,
        };
      } else if (tenant.is_rent_paid) {
        return {
          backgroundColor: '#F0FDF4', // Light green background for paid
          borderColor: '#BBF7D0',
          borderWidth: 1,
        };
      }
      return {
        backgroundColor: 'white',
        borderColor: '#F2F2F7',
        borderWidth: 1,
      };
    };

    const cardStyle = getCardStyle();
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('TenantDetails', { tenantId: tenant.s_no })}
        activeOpacity={0.6}
        style={{
          marginBottom: 12,
          borderRadius: 16,
          ...cardStyle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          transform: [{ scale: 1 }],
        }}
      >
        <View style={{ padding: 16 }}>
          {/* Top Section - Avatar and Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: badge ? badge.color : '#007AFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              shadowColor: badge ? badge.color : '#007AFF',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Text style={{ 
                color: 'white', 
                fontSize: 18, 
                fontWeight: '600' as const,
              }}>
                {tenant.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 17, 
                fontWeight: '600' as const, 
                color: '#1C1C1E', 
                marginBottom: 2 
              }}>
                {tenant.name}
              </Text>
              <Text style={{ 
                fontSize: 13, 
                color: '#8E8E93',
                fontWeight: '400'
              }}>
                {tenant.tenant_id}
              </Text>
            </View>
            
            {badge && (
              <View style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 14,
                backgroundColor: badge.bgColor,
                borderWidth: 1,
                borderColor: badge.color + '40',
              }}>
                <Text style={{ 
                  fontSize: 11, 
                  fontWeight: '600' as const, 
                  color: badge.color,
                }}>
                  {badge.label}
                </Text>
              </View>
            )}
          </View>

          {/* Room/Bed Info */}
          {tenant.rooms && (
            <View style={{ 
              backgroundColor: 'white', 
              borderRadius: 12, 
              padding: 14, 
              marginBottom: 12,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 3,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: '#E3F2FD',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: '#BBDEFB',
                }}>
                  <Ionicons name="bed" size={14} color="#1976D2" />
                </View>
                <Text style={{ fontSize: 13, color: '#8E8E93', fontWeight: '400', marginRight: 6 }}>
                  Room
                </Text>
                <Text style={{ fontSize: 14, color: '#1C1C1E', fontWeight: '600' }}>
                  {tenant.rooms.room_no}
                </Text>
              </View>
            </View>
          )}

          {/* Due Amount Section */}
          {tenant.rent_due_amount > 0 && (
            <View style={{
              backgroundColor: '#FFEBEE',
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#FFCDD2',
              shadowColor: '#FF3B30',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#FF3B30',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}>
                    <Ionicons name="alert" size={12} color="white" />
                  </View>
                  <Text style={{ fontSize: 13, color: '#D32F2F', fontWeight: '500' }}>
                    Due Amount
                  </Text>
                </View>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '700' as const, 
                  color: '#D32F2F' 
                }}>
                  {formatCurrency(tenant.rent_due_amount)}
                </Text>
              </View>
              
              {(tenant.partial_due_amount > 0 || tenant.pending_due_amount > 0) && (
                <View style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: 8, 
                  padding: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                }}>
                  {tenant.partial_due_amount > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 12, color: '#8E8E93', fontWeight: '500' }}>Partial Payment:</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600' as const, color: '#FF9500' }}>
                        {formatCurrency(tenant.partial_due_amount)}
                      </Text>
                    </View>
                  )}
                  {tenant.pending_due_amount > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: '#8E8E93', fontWeight: '500' }}>Pending Amount:</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600' as const, color: '#D32F2F' }}>
                        {formatCurrency(tenant.pending_due_amount)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Advance Payment Warning */}
          {!tenant.is_advance_paid && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              backgroundColor: '#FFF3E0',
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FFCC02',
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#FF9500',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}>
                <Ionicons name="warning" size={12} color="white" />
              </View>
              <Text style={{ 
                fontSize: 12, 
                color: '#F57C00', 
                fontWeight: '500' as const,
                flex: 1
              }}>
                Advance payment pending
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const tabs = [
    { id: 'pending' as TabType, label: 'Pending', count: stats?.with_pending_rent || 0, color: Theme.colors.danger },
    { id: 'partial' as TabType, label: 'Partial', count: stats?.with_partial_rent || 0, color: '#F97316' },
    { id: 'advance' as TabType, label: 'No Advance', count: stats?.without_advance || 0, color: '#9333EA' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ padding: 16 }}>
        {/* Tabs - Clean Style */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: '600' as const,
            color: '#1C1C1E',
            marginBottom: 16,
          }}>
            Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {tabs.map((tab, index) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: activeTab === tab.id ? '#007AFF' : 'white',
                    flexDirection: 'row' as const,
                    alignItems: 'center' as const,
                    gap: 8,
                    minWidth: 90,
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: activeTab === tab.id ? 0.15 : 0.06,
                    shadowRadius: 6,
                    elevation: activeTab === tab.id ? 4 : 2,
                    borderWidth: 1,
                    borderColor: activeTab === tab.id ? '#007AFF' : 'rgba(0, 0, 0, 0.08)',
                  } as any}
                >
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600' as const,
                    color: activeTab === tab.id ? 'white' : '#1C1C1E',
                  }}>
                    {tab.label}
                  </Text>
                  <View style={{
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 10,
                    backgroundColor: activeTab === tab.id ? 'rgba(255, 255, 255, 0.2)' : '#F2F2F7',
                    minWidth: 22,
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '700' as const,
                      color: activeTab === tab.id ? 'white' : '#1C1C1E',
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
        <View>
          <Text style={{
            fontSize: 22,
            fontWeight: '600' as const,
            color: '#1C1C1E',
            marginBottom: 16,
          }}>
            Tenants ({tenants.length})
          </Text>
          
          {loading ? (
            <View style={{ 
              paddingVertical: 60, 
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.05)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{ 
                marginTop: 16, 
                color: '#8E8E93',
                fontSize: 15,
                fontWeight: '500'
              }}>
                Loading tenants...
              </Text>
            </View>
          ) : tenants.length > 0 ? (
            <View>
              {tenants.map((tenant) => (
                <TenantCard key={tenant.s_no} tenant={tenant} />
              ))}
            </View>
          ) : (
            <View style={{ 
              padding: 40, 
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.05)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.08)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}>
                <Ionicons name="people-outline" size={36} color="#8E8E93" />
              </View>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600' as const, 
                color: '#1C1C1E', 
                marginBottom: 8,
                textAlign: 'center'
              }}>
                No tenants found
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#8E8E93', 
                textAlign: 'center',
                lineHeight: 20,
                maxWidth: 280
              }}>
                There are no tenants in this category at the moment. Check other categories or add new tenants.
              </Text>
            </View>
          )}
        </View>

        {/* Summary Card for Pending Tab */}
        {activeTab === 'pending' && stats && stats.total_due_amount > 0 && (
          <View style={{ 
            marginTop: 16, 
            padding: 20, 
            backgroundColor: 'white',
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 13, 
                  color: '#8E8E93', 
                  marginBottom: 8,
                  fontWeight: '400',
                }}>
                  Total Outstanding
                </Text>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: '600' as const, 
                  color: '#FF3B30', 
                  marginBottom: 4,
                }}>
                  {formatCurrency(stats.total_due_amount)}
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: '#8E8E93',
                  fontWeight: '400'
                }}>
                  From {stats.with_pending_rent} tenants
                </Text>
              </View>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#F2F2F7',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="trending-up" size={20} color="#FF3B30" />
              </View>
            </View>
          </View>
        )}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
};
