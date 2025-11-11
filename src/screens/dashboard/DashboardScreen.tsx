import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
import { TenantStatusContent } from '../../components/TenantStatusContent';
import { pgLocationService } from '../../services/organization/pgLocationService';
import { retryWithBackoff, categorizeError, ErrorInfo } from '../../utils/errorHandler';

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
  const [activeSection, setActiveSection] = useState<'summary' | 'rentStatus'>('summary');
  
  // Error tracking
  const [errors, setErrors] = useState<{
    summary?: ErrorInfo;
    financial?: ErrorInfo;
    rentStatus?: ErrorInfo;
  }>({});
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    // Step 1: Fetch PG locations first
    initializeDashboard();
  }, []);

  // Step 2: Auto-select first PG location when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !selectedPGLocationId) {
      console.log('✅ Auto-selecting first PG location:', locations[0].location_name);
      dispatch(setSelectedPGLocation(locations[0].s_no));
    }
  }, [locations, selectedPGLocationId, dispatch]);

  // Step 3: Load all PG-dependent data ONLY after PG location is selected
  useEffect(() => {
    if (selectedPGLocationId) {
      console.log('🚀 PG Location selected, loading dashboard data...');
      loadAllDashboardData();
    }
  }, [selectedPGLocationId, selectedMonths]);

  // Step 1: Initialize dashboard - fetch PG locations FIRST
  const initializeDashboard = async () => {
    try {
      console.log('📍 Step 1: Fetching PG locations...');
      await dispatch(fetchPGLocations()).unwrap();
      console.log('✅ PG locations fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching PG locations:', error);
    }
  };

  // Step 3: Load all dashboard data after PG location is selected
  const loadAllDashboardData = async () => {
    if (!selectedPGLocationId) {
      console.warn('⚠️ Cannot load dashboard data: No PG location selected');
      return;
    }

    try {
      console.log('📊 Loading dashboard data for PG:', selectedPGLocationId);
      
      // Load all PG-dependent data in parallel
      await Promise.all([
        loadSummary(selectedPGLocationId),
        loadFinancialAnalytics(selectedPGLocationId, selectedMonths),
        loadTenantRentStatus(selectedPGLocationId),
        dispatch(fetchTenants({
          page: 1,
          limit: 10,
          pg_id: selectedPGLocationId,
        })),
        dispatch(fetchPayments({})),
      ]);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  };

  const loadSummary = async (pgId: number) => {
    try {
      setLoadingSummary(true);
      setErrors(prev => ({ ...prev, summary: undefined }));
      
      const response = await retryWithBackoff(
        () => pgLocationService.getSummary(pgId),
        {
          maxRetries: 2,
          initialDelay: 1000,
          onRetry: (attempt) => {
            console.log(`🔄 Retrying summary API (attempt ${attempt})...`);
          },
        }
      );
      
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      const errorInfo = categorizeError(error);
      console.error(`❌ [${errorInfo.type.toUpperCase()}] Error loading summary:`, errorInfo.message);
      setErrors(prev => ({ ...prev, summary: errorInfo }));
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadFinancialAnalytics = async (pgId: number, months: number) => {
    try {
      setLoadingFinancial(true);
      setErrors(prev => ({ ...prev, financial: undefined }));
      
      const response = await retryWithBackoff(
        () => pgLocationService.getFinancialAnalytics(pgId, months),
        {
          maxRetries: 2,
          initialDelay: 1000,
          onRetry: (attempt) => {
            console.log(`🔄 Retrying financial analytics API (attempt ${attempt})...`);
          },
        }
      );
      
      if (response.success) {
        setFinancialData(response.data);
      }
    } catch (error) {
      const errorInfo = categorizeError(error);
      console.error(`❌ [${errorInfo.type.toUpperCase()}] Error loading financial analytics:`, errorInfo.message);
      setErrors(prev => ({ ...prev, financial: errorInfo }));
    } finally {
      setLoadingFinancial(false);
    }
  };
  
  const loadTenantRentStatus = async (pgId: number) => {
    try {
      setLoadingRentStatus(true);
      setErrors(prev => ({ ...prev, rentStatus: undefined }));
      
      const response = await retryWithBackoff(
        () => pgLocationService.getTenantRentPaymentStatus(pgId),
        {
          maxRetries: 2,
          initialDelay: 1000,
          onRetry: (attempt) => {
            console.log(`🔄 Retrying rent status API (attempt ${attempt})...`);
          },
        }
      );
      
      if (response.success) {
        setTenantsWithIssues(response.data);
      }
    } catch (error) {
      const errorInfo = categorizeError(error);
      console.error(`❌ [${errorInfo.type.toUpperCase()}] Error loading rent status:`, errorInfo.message);
      setErrors(prev => ({ ...prev, rentStatus: errorInfo }));
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

  // Retry specific failed API
  const handleRetry = useCallback((section: 'summary' | 'financial' | 'rentStatus') => {
    if (!selectedPGLocationId) return;
    
    setRetryCount(prev => prev + 1);
    
    switch (section) {
      case 'summary':
        loadSummary(selectedPGLocationId);
        break;
      case 'financial':
        loadFinancialAnalytics(selectedPGLocationId, selectedMonths);
        break;
      case 'rentStatus':
        loadTenantRentStatus(selectedPGLocationId);
        break;
    }
  }, [selectedPGLocationId, selectedMonths]);

  // Show error banner if there are critical errors
  const showErrorBanner = useCallback(() => {
    const criticalErrors = Object.values(errors).filter(e => e && (e.type === 'network' || e.type === 'timeout'));
    
    if (criticalErrors.length > 0) {
      const errorTypes = [...new Set(criticalErrors.map(e => e!.type))];
      const message = errorTypes.includes('network') 
        ? 'Network connection issue. Some data may not be available.'
        : 'Server is slow to respond. Some data may be delayed.';
      
      Alert.alert(
        'Connection Issue',
        message,
        [
          { text: 'Retry All', onPress: () => selectedPGLocationId && loadAllDashboardData() },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  }, [errors, selectedPGLocationId]);

  // Show error banner when errors change
  useEffect(() => {
    const hasNewErrors = Object.values(errors).some(e => e !== undefined);
    if (hasNewErrors && retryCount === 0) {
      // Only show banner on first error, not on retries
      showErrorBanner();
    }
  }, [errors]);

  const onRefresh = async () => {
    setRefreshing(true);
    
    if (selectedPGLocationId) {
      console.log('🔄 Refreshing dashboard data...');
      await loadAllDashboardData();
    } else {
      console.log('🔄 Refreshing PG locations...');
      await initializeDashboard();
    }
    
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
                }}
                onPress={() => setActiveSection('rentStatus')}
              >
                <Text style={{ fontWeight: '700', fontSize: 12, color: activeSection === 'rentStatus' ? Theme.colors.primary : Theme.colors.text.secondary }}>Rent Status</Text>
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
              <>
                {errors.summary ? (
                  <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                    <View style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#EF4444' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#DC2626', marginBottom: 8 }}>
                        Failed to load summary
                      </Text>
                      <Text style={{ fontSize: 12, color: '#7F1D1D', marginBottom: 12 }}>
                        {errors.summary.message}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRetry('summary')}
                        style={{ backgroundColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <PGSummary summary={summary} loading={loadingSummary} />
                )}
              </>
            )}

            {/* Financial Analytics Section */}
            {selectedPGLocationId && (
              <>
                {errors.financial ? (
                  <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                    <View style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#D97706', marginBottom: 8 }}>
                        Failed to load financial analytics
                      </Text>
                      <Text style={{ fontSize: 12, color: '#92400E', marginBottom: 12 }}>
                        {errors.financial.message}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRetry('financial')}
                        style={{ backgroundColor: '#F59E0B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <FinancialAnalytics 
                    data={financialData} 
                    loading={loadingFinancial} 
                    selectedMonths={selectedMonths}
                    onMonthsChange={handleMonthsChange}
                  />
                )}
              </>
            )}

            {/* Summary content ends here */}

            {/* Quick Actions */}
            <QuickActions menuItems={menuItems} onNavigate={handleNavigate} />
          </ScrollView>
        ) : (
          // Rent Status tab content - using TenantStatusContent
          <View style={{ flex: 1 }}>
            {selectedPGLocationId && (
              <>
                {errors.rentStatus ? (
                  <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    <View style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#EF4444' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#DC2626', marginBottom: 8 }}>
                        Failed to load rent status
                      </Text>
                      <Text style={{ fontSize: 12, color: '#7F1D1D', marginBottom: 12 }}>
                        {errors.rentStatus.message}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRetry('rentStatus')}
                        style={{ backgroundColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TenantStatusContent 
                    navigation={navigation}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                  />
                )}
              </>
            )}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};
