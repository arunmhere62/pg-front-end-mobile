import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTenants } from '../../store/slices/tenantSlice';
import { fetchPGLocations, setSelectedPGLocation } from '../../store/slices/pgLocationSlice';
import { fetchPayments } from '../../store/slices/paymentSlice';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { PGSummary } from '../../components/PGSummary';
import { FinancialAnalytics } from '../../components/FinancialAnalytics';
import { TenantRentStatus } from '../../components/TenantRentStatus';
import { QuickActions } from '../../components/QuickActions';
import { pgLocationService } from '../../services/pgLocationService';
import * as tenantService from '../../services/tenantService';

export const DashboardScreen: React.FC = () => {
  // All hooks must be called at the top level
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tenants, loading: tenantsLoading } = useSelector((state: RootState) => state.tenants);
  const { locations, selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { payments } = useSelector((state: RootState) => state.payments);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [tenantsWithIssues, setTenantsWithIssues] = useState<any[]>([]);
  const [loadingRentStatus, setLoadingRentStatus] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [noAdvanceTenants, setNoAdvanceTenants] = useState<tenantService.Tenant[]>([]);
  const [loadingNoAdvance, setLoadingNoAdvance] = useState(false);
  const [activeSection, setActiveSection] = useState<'summary' | 'rentStatus' | 'advance'>('summary');

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  // Auto-select first PG location when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !selectedPGLocationId) {
      dispatch(setSelectedPGLocation(locations[0].s_no));
    }
  }, [locations, selectedPGLocationId, dispatch]);

  // Load summary when PG location changes
  useEffect(() => {
    if (selectedPGLocationId) {
      loadSummary(selectedPGLocationId);
      loadFinancialAnalytics(selectedPGLocationId, selectedMonths);
      loadTenantRentStatus(selectedPGLocationId);
      loadTenantsWithoutAdvance(selectedPGLocationId);
    }
  }, [selectedPGLocationId, selectedMonths]);

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
      
      // Load summary if PG location is selected
      if (selectedPGLocationId) {
        loadSummary(selectedPGLocationId);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadSummary = async (pgId: number) => {
    try {
      setLoadingSummary(true);
      const response = await pgLocationService.getSummary(pgId);
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadFinancialAnalytics = async (pgId: number, months: number) => {
    try {
      setLoadingFinancial(true);
      const response = await pgLocationService.getFinancialAnalytics(pgId, months);
      if (response.success) {
        setFinancialData(response.data);
      }
    } catch (error) {
      console.error('Error loading financial analytics:', error);
    } finally {
      setLoadingFinancial(false);
    }
  };
  
  const loadTenantRentStatus = async (pgId: number) => {
    try {
      setLoadingRentStatus(true);
      const response = await pgLocationService.getTenantRentPaymentStatus(pgId);
      if (response.success) {
        setTenantsWithIssues(response.data);
      }
    } catch (error) {
      console.error('Error loading tenant rent status:', error);
    } finally {
      setLoadingRentStatus(false);
    }
  };

  const handleMonthsChange = useCallback((months: number) => {
    setSelectedMonths(months);
  }, []);

  const handleNavigate = useCallback((screen: string) => {
    // With any type, we can directly navigate
    navigation.navigate(screen);
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (selectedPGLocationId) {
      await loadTenantRentStatus(selectedPGLocationId);
      await loadTenantsWithoutAdvance(selectedPGLocationId);
    }
    setRefreshing(false);
  };

  const loadTenantsWithoutAdvance = async (pgId: number) => {
    try {
      setLoadingNoAdvance(true);
      const res = await tenantService.getAllTenants({ pg_id: pgId, pending_advance: true, limit: 10, page: 1 });
      if (res.success) {
        setNoAdvanceTenants(res.data || []);
      }
    } catch (e) {
      console.error('Error loading tenants without advance:', e);
    } finally {
      setLoadingNoAdvance(false);
    }
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

  

  // Show loading state while component is mounting
  if (!isMounted) {
    return (
      <ScreenLayout backgroundColor={Theme.colors.background.blue}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 10, color: Theme.colors.text.secondary }}>Loading Dashboard...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name}`} 
        showPGSelector={true}
      />
      <View style={{ flex: 1, backgroundColor: Theme.colors.background.secondary }}>
        {/* Section Tabs - compact, scrollable */}
        <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  marginRight: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 9999,
                  backgroundColor: activeSection === 'summary' ? Theme.colors.primary + '20' : '#F3F4F6',
                }}
                onPress={() => setActiveSection('summary')}
              >
                <Text style={{ fontWeight: '700', fontSize: 12, color: activeSection === 'summary' ? Theme.colors.primary : Theme.colors.text.secondary }}>Summary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  marginRight: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 9999,
                  backgroundColor: activeSection === 'rentStatus' ? Theme.colors.primary + '20' : '#F3F4F6',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setActiveSection('rentStatus')}
              >
                <Text style={{ fontWeight: '700', fontSize: 12, color: activeSection === 'rentStatus' ? Theme.colors.primary : Theme.colors.text.secondary }}>Rent Status</Text>
                {tenantsWithIssues.length > 0 && (
                  <View style={{ backgroundColor: '#EF4444', borderRadius: 9999, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 6, paddingHorizontal: 4 }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{tenantsWithIssues.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  marginRight: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 9999,
                  backgroundColor: activeSection === 'advance' ? Theme.colors.primary + '20' : '#F3F4F6',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setActiveSection('advance')}
              >
                <Text style={{ fontWeight: '700', fontSize: 12, color: activeSection === 'advance' ? Theme.colors.primary : Theme.colors.text.secondary }}>Advance</Text>
                {noAdvanceTenants.length > 0 && (
                  <View style={{ backgroundColor: '#F59E0B', borderRadius: 9999, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 6, paddingHorizontal: 4 }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{noAdvanceTenants.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {activeSection === 'summary' ? (
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

            {/* PG Summary Section */}
            {selectedPGLocationId && (
              <PGSummary summary={summary} loading={loadingSummary} />
            )}

            {/* Financial Analytics Section */}
            {selectedPGLocationId && (
              <FinancialAnalytics 
                data={financialData} 
                loading={loadingFinancial} 
                selectedMonths={selectedMonths}
                onMonthsChange={handleMonthsChange}
              />
            )}

            {/* Summary content ends here */}

            {/* Quick Actions */}
            <QuickActions menuItems={menuItems} onNavigate={handleNavigate} />
          </ScrollView>
        ) : activeSection === 'rentStatus' ? (
          // Rent Status tab content
          <View style={{ flex: 1 }}>
            {selectedPGLocationId && (
              <TenantRentStatus 
                pgId={selectedPGLocationId} 
                preloadedData={tenantsWithIssues} 
                isLoading={loadingRentStatus} 
              />
            )}
          </View>
        ) : (
          // Advance tab content (Tenants Without Advance)
          <ScrollView
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {selectedPGLocationId && (
              <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <View style={{ backgroundColor: 'white', borderRadius: 12, overflow: 'hidden' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary }}>Tenants Without Advance</Text>
                      <View style={{ marginLeft: 8, backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 }}>
                        <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 12 }}>{noAdvanceTenants.length}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleNavigate('Tenants')}>
                      <Text style={{ color: Theme.colors.primary, fontWeight: '700' }}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  {loadingNoAdvance ? (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color={Theme.colors.primary} />
                      <Text style={{ marginTop: 8, color: Theme.colors.text.secondary }}>Loading...</Text>
                    </View>
                  ) : noAdvanceTenants.length === 0 ? (
                    <View style={{ padding: 16 }}>
                      <Text style={{ color: Theme.colors.text.secondary }}>All tenants have paid advance. Great!</Text>
                    </View>
                  ) : (
                    <View>
                      <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                        <Text style={{ flex: 1.6, fontWeight: '700', color: Theme.colors.text.secondary, fontSize: 12 }}>Tenant</Text>
                        <Text style={{ flex: 1, fontWeight: '700', color: Theme.colors.text.secondary, fontSize: 12 }}>Room</Text>
                        <Text style={{ flex: 1.2, fontWeight: '700', color: Theme.colors.text.secondary, fontSize: 12 }}>Check-in</Text>
                        <Text style={{ width: 90, textAlign: 'right', fontWeight: '700', color: Theme.colors.text.secondary, fontSize: 12 }}>Action</Text>
                      </View>
                      {noAdvanceTenants.slice(0, 20).map((t, idx) => (
                        <View
                          key={t.s_no}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#F3F4F6',
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                          }}
                        >
                          <View style={{ flex: 1.6 }}>
                            <Text numberOfLines={1} style={{ color: Theme.colors.text.primary, fontWeight: '700' }}>{t.name}</Text>
                            <Text style={{ marginTop: 2, color: Theme.colors.text.secondary, fontSize: 12 }}>{t.phone_no || t.whatsapp_number || '—'}</Text>
                          </View>
                          <Text style={{ flex: 1, color: Theme.colors.text.primary, textAlign: 'center' }}>{t.rooms?.room_no || '—'}</Text>
                          <Text style={{ flex: 1.2, color: Theme.colors.text.primary, textAlign: 'center' }}>{new Date(t.check_in_date).toLocaleDateString()}</Text>
                          <View style={{ width: 90, alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('TenantDetails', { tenantId: t.s_no })} style={{ backgroundColor: Theme.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Details</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenLayout>
  );
};
