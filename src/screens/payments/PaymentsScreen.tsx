import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Modal, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { fetchPayments } from '../../store/slices/paymentSlice';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { DatePicker } from '../../components/DatePicker';
import { Payment } from '../../types';
import { getAllRooms, Room } from '../../services/roomService';
import { getAllBeds, Bed } from '../../services/bedService';
import { paymentService } from '../../services/paymentService';
import { Alert } from 'react-native';
import { EditRentPaymentModal } from '../../components/EditRentPaymentModal';
import { EditAdvancePaymentModal } from '../../components/EditAdvancePaymentModal';
import { EditRefundPaymentModal } from '../../components/EditRefundPaymentModal';
import advancePaymentService, { AdvancePayment } from '../../services/advancePaymentService';
import refundPaymentService, { RefundPayment } from '../../services/refundPaymentService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface PaymentsScreenProps {
  navigation: any;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, pagination, loading } = useSelector((state: RootState) => state.payments);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'RENT' | 'ADVANCE' | 'REFUND'>('RENT');
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreRent, setHasMoreRent] = useState(true);
  const [hasMoreAdvance, setHasMoreAdvance] = useState(true);
  const [hasMoreRefund, setHasMoreRefund] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advance payments state
  const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>([]);
  const [advancePagination, setAdvancePagination] = useState<any>(null);
  const [loadingAdvance, setLoadingAdvance] = useState(false);
  
  // Refund payments state
  const [refundPayments, setRefundPayments] = useState<RefundPayment[]>([]);
  const [refundPagination, setRefundPagination] = useState<any>(null);
  const [loadingRefund, setLoadingRefund] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
  const [quickFilter, setQuickFilter] = useState<'NONE' | 'LAST_WEEK' | 'LAST_MONTH'>('NONE');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showEditRefundModal, setShowEditRefundModal] = useState(false);
  const [editingRefundPayment, setEditingRefundPayment] = useState<RefundPayment | null>(null);
  
  // Scroll position tracking
  const [visibleItemsCount, setVisibleItemsCount] = useState(0);
  
  const flatListRef = React.useRef<any>(null);
  
  // Fetch rooms and beds from APIs
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);

  // Fetch rooms on mount and when PG location changes
  useEffect(() => {
    if (selectedPGLocationId) {
      fetchRooms();
    }
  }, [selectedPGLocationId]);

  // Fetch beds when room is selected
  useEffect(() => {
    if (selectedRoomId) {
      fetchBeds(selectedRoomId);
    } else {
      setBeds([]);
    }
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await getAllRooms({ page: 1, limit: 100 });
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchBeds = async (roomId: number) => {
    try {
      setLoadingBeds(true);
      const response = await getAllBeds({ room_id: roomId, page: 1, limit: 100 });
      setBeds(response.data);
    } catch (error) {
      console.error('Error fetching beds:', error);
    } finally {
      setLoadingBeds(false);
    }
  };

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  // Helper function to get tenant unavailability message
  const getTenantUnavailableMessage = (reason?: 'NOT_FOUND' | 'DELETED' | 'CHECKED_OUT' | 'INACTIVE' | null) => {
    switch (reason) {
      case 'DELETED':
        return { text: '⚠️ Tenant has been deleted', color: '#DC2626' };
      case 'CHECKED_OUT':
        return { text: '📤 Tenant has checked out', color: '#F59E0B' };
      case 'INACTIVE':
        return { text: '⏸️ Tenant is inactive', color: '#6B7280' };
      case 'NOT_FOUND':
        return { text: '❌ Tenant not found', color: '#DC2626' };
      default:
        return { text: '⚠️ Tenant unavailable', color: '#DC2626' };
    }
  };

  useEffect(() => {
    // Reset and load fresh data when PG location or tab changes
    setCurrentPage(1);
    if (activeTab === 'RENT') {
      setHasMoreRent(true);
      loadPayments(1, true);
    } else if (activeTab === 'ADVANCE') {
      setHasMoreAdvance(true);
      loadAdvancePayments(1, true);
    } else {
      setHasMoreRefund(true);
      loadRefundPayments(1, true);
    }
  }, [selectedPGLocationId, activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      // Only reload current data on focus, don't reset
      if (currentPage === 1) {
        if (activeTab === 'RENT') {
          loadPayments(1, true);
        } else if (activeTab === 'ADVANCE') {
          loadAdvancePayments(1, true);
        } else {
          loadRefundPayments(1, true);
        }
      }
    }, [selectedPGLocationId, activeTab])
  );

  const loadPayments = async (page: number, reset: boolean = false) => {
    try {
      if (!hasMoreRent && !reset) return;
      
      const params: any = {
        page,
        limit: 20, // Increased for better infinite scroll experience
      };

      if (statusFilter !== 'ALL') params.status = statusFilter;
      
      // Priority: Date range (including quick filters) > Month/Year
      if (startDate || endDate) {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      } else if (selectedMonth && selectedYear) {
        params.month = selectedMonth;
        params.year = selectedYear;
      }
      
      if (selectedRoomId) params.room_id = selectedRoomId;
      if (selectedBedId) params.bed_id = selectedBedId;
      
      // Add append flag for infinite scroll
      params.append = !reset && page > 1;

      const result = await dispatch(fetchPayments(params)).unwrap();
      
      setCurrentPage(page);
      setHasMoreRent(result.pagination ? page < result.pagination.totalPages : false);
      
      if (flatListRef.current && reset) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadAdvancePayments = async (page: number, reset: boolean = false) => {
    try {
      if (!hasMoreAdvance && !reset) return;
      
      setLoadingAdvance(true);
      
      const params: any = {
        page,
        limit: 20, // Increased for better infinite scroll experience
      };

      if (statusFilter !== 'ALL') params.status = statusFilter;
      
      // Priority: Date range (including quick filters) > Month/Year
      if (startDate || endDate) {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      } else if (selectedMonth && selectedYear) {
        params.month = selectedMonth;
        params.year = selectedYear;
      }
      
      if (selectedRoomId) params.room_id = selectedRoomId;
      if (selectedBedId) params.bed_id = selectedBedId;

      const response = await advancePaymentService.getAdvancePayments(params, {
        pg_id: selectedPGLocationId || undefined,
      });
      
      if (reset || page === 1) {
        setAdvancePayments(response.data);
      } else {
        setAdvancePayments(prev => [...prev, ...response.data]);
      }
      
      setAdvancePagination(response.pagination);
      setCurrentPage(page);
      setHasMoreAdvance(response.pagination ? page < response.pagination.totalPages : false);
      
      if (flatListRef.current && reset) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    } catch (error) {
      console.error('Error loading advance payments:', error);
    } finally {
      setLoadingAdvance(false);
    }
  };

  const loadRefundPayments = async (page: number, reset: boolean = false) => {
    try {
      if (!hasMoreRefund && !reset) return;
      
      setLoadingRefund(true);
      
      const params: any = {
        page,
        limit: 20, // Increased for better infinite scroll experience
      };

      if (statusFilter !== 'ALL') params.status = statusFilter;
      
      // Priority: Date range (including quick filters) > Month/Year
      if (startDate || endDate) {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      } else if (selectedMonth && selectedYear) {
        params.month = selectedMonth;
        params.year = selectedYear;
      }
      
      if (selectedRoomId) params.room_id = selectedRoomId;
      if (selectedBedId) params.bed_id = selectedBedId;

      const response = await refundPaymentService.getRefundPayments(params, {
        pg_id: selectedPGLocationId || undefined,
      });
      
      if (reset || page === 1) {
        setRefundPayments(response.data);
      } else {
        setRefundPayments(prev => [...prev, ...response.data]);
      }
      
      setRefundPagination(response.pagination);
      setCurrentPage(page);
      setHasMoreRefund(response.pagination ? page < response.pagination.totalPages : false);
      
      if (flatListRef.current && reset) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    } catch (error) {
      console.error('Error loading refund payments:', error);
    } finally {
      setLoadingRefund(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    if (activeTab === 'RENT') {
      setHasMoreRent(true);
      await loadPayments(1, true);
    } else if (activeTab === 'ADVANCE') {
      setHasMoreAdvance(true);
      await loadAdvancePayments(1, true);
    } else {
      setHasMoreRefund(true);
      await loadRefundPayments(1, true);
    }
    setRefreshing(false);
  };

  const loadMorePayments = () => {
    const hasMore = activeTab === 'RENT' ? hasMoreRent : activeTab === 'ADVANCE' ? hasMoreAdvance : hasMoreRefund;
    const isLoading = activeTab === 'RENT' ? loading : activeTab === 'ADVANCE' ? loadingAdvance : loadingRefund;
    
    if (!hasMore || isLoading) return;
    
    const nextPage = currentPage + 1;
    if (activeTab === 'RENT') {
      loadPayments(nextPage, false);
    } else if (activeTab === 'ADVANCE') {
      loadAdvancePayments(nextPage, false);
    } else {
      loadRefundPayments(nextPage, false);
    }
  };

  const handleViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const lastVisibleIndex = viewableItems[viewableItems.length - 1]?.index || 0;
      setVisibleItemsCount(lastVisibleIndex + 1);
    }
  }, []);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const getFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'ALL') count++;
    if (quickFilter !== 'NONE') count++;
    if (selectedMonth && selectedYear) count++;
    if (startDate || endDate) count++;
    if (selectedRoomId) count++;
    if (selectedBedId) count++;
    return count;
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setQuickFilter('NONE');
    setSelectedMonth(null);
    setSelectedYear(null);
    setStartDate('');
    setEndDate('');
    setSelectedRoomId(null);
    setSelectedBedId(null);
    setCurrentPage(1);
    if (activeTab === 'RENT') {
      setHasMoreRent(true);
      loadPayments(1, true);
    } else if (activeTab === 'ADVANCE') {
      setHasMoreAdvance(true);
      loadAdvancePayments(1, true);
    } else {
      setHasMoreRefund(true);
      loadRefundPayments(1, true);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
    if (activeTab === 'RENT') {
      setHasMoreRent(true);
      loadPayments(1, true);
    } else if (activeTab === 'ADVANCE') {
      setHasMoreAdvance(true);
      loadAdvancePayments(1, true);
    } else {
      setHasMoreRefund(true);
      loadRefundPayments(1, true);
    }
  };

  const applyQuickFilter = (filter: 'LAST_WEEK' | 'LAST_MONTH') => {
    const today = new Date();
    const start = new Date();
    
    if (filter === 'LAST_WEEK') {
      start.setDate(today.getDate() - 7);
    } else if (filter === 'LAST_MONTH') {
      start.setMonth(today.getMonth() - 1);
    }
    
    setQuickFilter(filter);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setSelectedMonth(null);
    setSelectedYear(null);
  };

  const handleMarkAsPaid = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowStatusModal(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedPayment) return;

    try {
      setUpdatingStatus(true);
      const response = await paymentService.updatePaymentStatus(
        selectedPayment.s_no,
        'PAID',
        new Date().toISOString().split('T')[0]
      );

      if (response.success) {
        Alert.alert('Success', 'Payment marked as paid successfully');
        setShowStatusModal(false);
        setSelectedPayment(null);
        setCurrentPage(1);
        setHasMoreRent(true);
        loadPayments(1, true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleSavePayment = async (id: number, data: Partial<Payment>) => {
    try {
      let response;
      
      if (activeTab === 'ADVANCE') {
        // Update advance payment
        response = await advancePaymentService.updateAdvancePayment(id, data, {
          pg_id: selectedPGLocationId || undefined,
        });
      } else {
        // Update rent payment
        response = await paymentService.updateTenantPayment(id, data);
      }
      
      if (response.success || response.data) {
        Alert.alert('Success', 'Payment updated successfully');
        setShowEditModal(false);
        setEditingPayment(null);
        
        // Reload appropriate payments from page 1 to get fresh data
        setCurrentPage(1);
        if (activeTab === 'ADVANCE') {
          setHasMoreAdvance(true);
          loadAdvancePayments(1, true);
        } else {
          setHasMoreRent(true);
          loadPayments(1, true);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update payment');
      throw error;
    }
  };

  const handleDeleteRentPayment = (payment: Payment) => {
    Alert.alert(
      'Delete Rent Payment',
      `Are you sure you want to delete this payment?\n\nTenant: ${payment.tenants?.name}\nAmount: ₹${payment.amount_paid}\nDate: ${formatDate(payment.payment_date || '')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.deleteTenantPayment(payment.s_no);
              Alert.alert('Success', 'Rent payment deleted successfully');
              setCurrentPage(1);
              setHasMoreRent(true);
              loadPayments(1, true);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete payment');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAdvancePayment = (payment: Payment) => {
    Alert.alert(
      'Delete Advance Payment',
      `Are you sure you want to delete this payment?\n\nTenant: ${payment.tenants?.name}\nAmount: ₹${payment.amount_paid}\nDate: ${formatDate(payment.payment_date || '')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await advancePaymentService.deleteAdvancePayment(payment.s_no, {
                pg_id: selectedPGLocationId || undefined,
              });
              Alert.alert('Success', 'Advance payment deleted successfully');
              setCurrentPage(1);
              setHasMoreAdvance(true);
              loadAdvancePayments(1, true);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete payment');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRefundPayment = (payment: RefundPayment) => {
    Alert.alert(
      'Delete Refund Payment',
      `Are you sure you want to delete this refund?\n\nTenant: ${payment.tenants?.name}\nAmount: ₹${payment.amount_paid}\nDate: ${formatDate(payment.payment_date)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await refundPaymentService.deleteRefundPayment(payment.s_no, {
                pg_id: selectedPGLocationId || undefined,
              });
              Alert.alert('Success', 'Refund payment deleted successfully');
              setCurrentPage(1);
              setHasMoreRefund(true);
              loadRefundPayments(1, true);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete refund payment');
            }
          },
        },
      ]
    );
  };

  const handleEditRefundPayment = (payment: RefundPayment) => {
    setEditingRefundPayment(payment);
    setShowEditRefundModal(true);
  };

  const handleSaveRefundPayment = async (id: number, data: Partial<RefundPayment>) => {
    try {
      await refundPaymentService.updateRefundPayment(id, data, {
        pg_id: selectedPGLocationId || undefined,
      });
      Alert.alert('Success', 'Refund payment updated successfully');
      setShowEditRefundModal(false);
      setEditingRefundPayment(null);
      setCurrentPage(1);
      setHasMoreRefund(true);
      loadRefundPayments(1, true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update refund payment');
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return Theme.colors.secondary;
      case 'PENDING':
        return Theme.colors.warning;
      case 'FAILED':
        return Theme.colors.danger;
      case 'REFUNDED':
        return Theme.colors.info;
      default:
        return Theme.colors.text.secondary;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'GPAY':
        return '📱';
      case 'PHONEPE':
        return '📱';
      case 'CASH':
        return '💵';
      case 'BANK_TRANSFER':
        return '🏦';
      default:
        return '💰';
    }
  };

  // Render Rent Payment Card
  const renderRentPaymentItem = ({ item }: { item: Payment }) => (
    <Card style={{ marginHorizontal: 16, marginBottom: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: Theme.colors.primary }}>
      {/* Header with Payment Type Badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ 
              backgroundColor: Theme.withOpacity(Theme.colors.primary, 0.1), 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 6,
              marginRight: 8
            }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: Theme.colors.primary }}>
                RENT PAYMENT
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 }}>
            {item.tenants?.name || 'Unknown Tenant'}
          </Text>
          <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary }}>
            ID: {item.tenants?.tenant_id || 'N/A'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleEditPayment(item)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: Theme.colors.background.blueLight,
            }}
          >
            <Ionicons name="pencil" size={16} color={Theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteRentPayment(item)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: '#FEE2E2',
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: Theme.withOpacity(getStatusColor(item.status), 0.1),
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: getStatusColor(item.status) }}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border }}>
        <View>
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>Amount Paid</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.primary }}>
            ₹{item.amount_paid?.toLocaleString('en-IN')}
          </Text>
        </View>
        {item.actual_rent_amount !== item.amount_paid && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>Actual Rent</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.secondary }}>
              ₹{item.actual_rent_amount?.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      </View>

      {/* Details Grid */}
      <View style={{ gap: 8 }}>
        {/* Room & Bed */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {item.rooms && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Room</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {item.rooms.room_no}
              </Text>
            </View>
          )}
          {item.beds && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Bed</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {item.beds.bed_no}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Date & Method */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Payment Date</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
              {formatDate(item.payment_date || '')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Method</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
              {getPaymentMethodIcon(item.payment_method)} {item.payment_method}
            </Text>
          </View>
        </View>

        {/* Payment Period */}
        {item.start_date && item.end_date && (
          <View>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Payment Period</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
              {formatDate(item.start_date)} - {formatDate(item.end_date)}
            </Text>
          </View>
        )}

        {/* Contact */}
        {item.tenants?.phone_no && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="call-outline" size={14} color={Theme.colors.text.tertiary} />
            <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginLeft: 6 }}>
              {item.tenants.phone_no}
            </Text>
          </View>
        )}

        {/* Remarks */}
        {item.remarks && (
          <View style={{ marginTop: 4, padding: 8, backgroundColor: Theme.colors.background.secondary, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>Remarks</Text>
            <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
              {item.remarks}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {/* View Details Button */}
          {item.tenants && !item.tenant_unavailable_reason ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('TenantDetails', { tenantId: item.tenant_id })}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: Theme.colors.background.blueLight,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: Theme.colors.primary,
              }}
            >
              <Ionicons name="information-circle-outline" size={16} color={Theme.colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.primary, marginLeft: 6 }}>
                View Details
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Ionicons name="alert-circle-outline" size={16} color="#9CA3AF" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#9CA3AF', marginLeft: 6 }}>
                Tenant Removed
              </Text>
            </View>
          )}

          {/* Mark as Paid Button for Pending Payments */}
          {item.status === 'PENDING' && (
            <TouchableOpacity
              onPress={() => handleMarkAsPaid(item)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: Theme.colors.secondary,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff', marginLeft: 6 }}>
                Mark as Paid
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  // Render Advance Payment Card
  const renderAdvancePaymentItem = ({ item }: { item: Payment }) => (
    <Card style={{ 
      marginHorizontal: 16, 
      marginBottom: 12, 
      padding: 16, 
      borderLeftWidth: 4, 
      borderLeftColor: '#10B981',
      backgroundColor: Theme.colors.canvas
    }}>
      {/* Header with Payment Type Badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ 
              backgroundColor: Theme.withOpacity('#10B981', 0.1), 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 6,
              marginRight: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="flash" size={12} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#10B981' }}>
                ADVANCE PAYMENT
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 }}>
            {item.tenants?.name || 'Tenant Removed'}
          </Text>
          {!item.tenants && item.tenant_unavailable_reason && (
            <View style={{ 
              backgroundColor: item.tenant_unavailable_reason === 'CHECKED_OUT' ? '#FEF3C7' : '#FEE2E2', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 6, 
              marginBottom: 4,
              alignSelf: 'flex-start'
            }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: getTenantUnavailableMessage(item.tenant_unavailable_reason).color }}>
                {getTenantUnavailableMessage(item.tenant_unavailable_reason).text}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary }}>
            ID: {item.tenants?.tenant_id || 'N/A'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleEditPayment(item)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: Theme.withOpacity('#10B981', 0.1),
            }}
          >
            <Ionicons name="pencil" size={16} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteAdvancePayment(item)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: '#FEE2E2',
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: Theme.withOpacity(getStatusColor(item.status), 0.1),
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: getStatusColor(item.status) }}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Section with Advance Badge */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 12, 
        paddingBottom: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: Theme.colors.border,
        backgroundColor: Theme.withOpacity('#10B981', 0.05),
        padding: 12,
        borderRadius: 8,
        marginHorizontal: -4
      }}>
        <View>
          <Text style={{ fontSize: 11, color: '#10B981', marginBottom: 2, fontWeight: '600' }}>Advance Amount</Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#10B981' }}>
            ₹{item.amount_paid?.toLocaleString('en-IN')}
          </Text>
        </View>
        {item.actual_rent_amount !== item.amount_paid && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>Actual Rent</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.secondary }}>
              ₹{item.actual_rent_amount?.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      </View>

      {/* Details Grid */}
      <View style={{ gap: 8 }}>
        {/* Room & Bed */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {item.rooms && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Room</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {item.rooms.room_no}
              </Text>
            </View>
          )}
          {item.beds && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Bed</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {item.beds.bed_no}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Date & Method */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Payment Date</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
              {formatDate(item.payment_date || '')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Method</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
              {getPaymentMethodIcon(item.payment_method)} {item.payment_method}
            </Text>
          </View>
        </View>

        {/* Contact */}
        {item.tenants?.phone_no && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="call-outline" size={14} color={Theme.colors.text.tertiary} />
            <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginLeft: 6 }}>
              {item.tenants.phone_no}
            </Text>
          </View>
        )}

        {/* Remarks */}
        {item.remarks && (
          <View style={{ marginTop: 4, padding: 8, backgroundColor: Theme.colors.background.secondary, borderRadius: 6 }}>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>Remarks</Text>
            <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
              {item.remarks}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {item.tenants && !item.tenant_unavailable_reason ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('TenantDetails', { tenantId: item.tenant_id })}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              backgroundColor: Theme.colors.background.blueLight,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Theme.colors.primary,
            }}
          >
            <Ionicons name="information-circle-outline" size={16} color={Theme.colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.primary, marginLeft: 6 }}>
              View Details
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#9CA3AF" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#9CA3AF', marginLeft: 6 }}>
              Tenant Removed
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  // Render Refund Payment Card
  const renderRefundPaymentItem = ({ item }: { item: RefundPayment }) => (
    <Card style={{ 
      marginHorizontal: 16, 
      marginBottom: 12, 
      padding: 16, 
      borderLeftWidth: 4, 
      borderLeftColor: '#EF4444',
      backgroundColor: Theme.colors.canvas
    }}>
      {/* Header with Payment Type Badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ 
              paddingHorizontal: 10, 
              paddingVertical: 4, 
              borderRadius: 6, 
              backgroundColor: '#FEE2E2' 
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>
                💸 REFUND
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 }}>
            {item.tenants?.name || 'Tenant Removed'}
          </Text>
          {!item.tenants && item.tenant_unavailable_reason && (
            <View style={{ 
              backgroundColor: item.tenant_unavailable_reason === 'CHECKED_OUT' ? '#FEF3C7' : '#FEE2E2', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 6, 
              marginBottom: 4,
              alignSelf: 'flex-start'
            }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: getTenantUnavailableMessage(item.tenant_unavailable_reason).color }}>
                {getTenantUnavailableMessage(item.tenant_unavailable_reason).text}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary }}>
            Room {item.rooms?.room_no || 'N/A'} • Bed {item.beds?.bed_no || 'N/A'}
          </Text>
        </View>

        {/* Edit and Delete Buttons + Status Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleEditRefundPayment(item)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: Theme.withOpacity('#F59E0B', 0.1),
            }}
          >
            <Ionicons name="pencil" size={16} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteRefundPayment(item)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: '#FEE2E2',
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
          <View style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: 
              item.status === 'PAID' ? '#DCFCE7' :
              item.status === 'PENDING' ? '#FEF3C7' :
              '#FEE2E2',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '700',
              color: 
                item.status === 'PAID' ? '#16A34A' :
                item.status === 'PENDING' ? '#CA8A04' :
                '#DC2626',
            }}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Section */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
        marginBottom: 12,
      }}>
        <View>
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Refund Amount</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#DC2626' }}>
            ₹{item.amount_paid}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Refund Date</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
            {new Date(item.payment_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Payment Details Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <View style={{ flex: 1, minWidth: '45%' }}>
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Payment Method</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
            {getPaymentMethodIcon(item.payment_method)} {item.payment_method}
          </Text>
        </View>
      </View>

      {/* Remarks */}
      {item.remarks && (
        <View style={{ marginTop: 4, padding: 8, backgroundColor: Theme.colors.background.secondary, borderRadius: 6 }}>
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>Remarks</Text>
          <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
            {item.remarks}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {item.tenants && !item.tenant_unavailable_reason ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('TenantDetails', { tenantId: item.tenant_id })}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              backgroundColor: Theme.colors.background.blueLight,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: Theme.colors.primary,
            }}
          >
            <Ionicons name="information-circle-outline" size={16} color={Theme.colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.primary, marginLeft: 6 }}>
              View Details
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#9CA3AF" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#9CA3AF', marginLeft: 6 }}>
              Tenant Removed
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  // Unified render function that chooses based on active tab
  const renderPaymentItem = ({ item }: { item: any }) => {
    if (activeTab === 'REFUND') return renderRefundPaymentItem({ item });
    return activeTab === 'ADVANCE' ? renderAdvancePaymentItem({ item }) : renderRentPaymentItem({ item });
  };

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader
        title="Tenant Payments"
        subtitle={`${activeTab === 'RENT' ? (pagination?.total || 0) : activeTab === 'ADVANCE' ? (advancePagination?.total || 0) : (refundPagination?.total || 0)} payments`}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
        showPGSelector={true}
      />

      <View style={{ flex: 1, backgroundColor: Theme.colors.background.secondary }}>
        {/* Scroll Position Indicator */}
        {visibleItemsCount > 0 && (
          <View style={{
            position: 'absolute',
            bottom: 100,
            right: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '700', 
              color: '#fff',
              textAlign: 'center',
            }}>
              {visibleItemsCount} of {activeTab === 'RENT' ? (pagination?.total || payments.length) : activeTab === 'ADVANCE' ? (advancePagination?.total || advancePayments.length) : (refundPagination?.total || refundPayments.length)}
            </Text>
            <Text style={{ 
              fontSize: 10, 
              color: '#fff',
              opacity: 0.8,
              textAlign: 'center',
              marginTop: 2,
            }}>
              {activeTab === 'RENT' ? (pagination?.total || payments.length) - visibleItemsCount : activeTab === 'ADVANCE' ? (advancePagination?.total || advancePayments.length) - visibleItemsCount : (refundPagination?.total || refundPayments.length) - visibleItemsCount} remaining
            </Text>
          </View>
        )}
        
        {/* Payments List */}
        <FlatList
          ref={flatListRef}
          data={activeTab === 'RENT' ? payments : activeTab === 'ADVANCE' ? (advancePayments as any) : (refundPayments as any)}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.s_no.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View>
              {/* Tabs - Horizontally Scrollable */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 }}
              >
            <TouchableOpacity
              onPress={() => setActiveTab('RENT')}
              style={{
              minWidth: 140,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: activeTab === 'RENT' ? Theme.colors.primary : Theme.colors.canvas,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: activeTab === 'RENT' ? Theme.colors.primary : Theme.colors.border,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'RENT' ? '#fff' : Theme.colors.text.secondary,
              }}
            >
              💰 Rent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('ADVANCE')}
            style={{
              minWidth: 140,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: activeTab === 'ADVANCE' ? Theme.colors.primary : Theme.colors.canvas,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: activeTab === 'ADVANCE' ? Theme.colors.primary : Theme.colors.border,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'ADVANCE' ? '#fff' : Theme.colors.text.secondary,
              }}
            >
              🎁 Advance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('REFUND')}
            style={{
              minWidth: 140,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: activeTab === 'REFUND' ? Theme.colors.primary : Theme.colors.canvas,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: activeTab === 'REFUND' ? Theme.colors.primary : Theme.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'REFUND' ? '#fff' : Theme.colors.text.secondary,
              }}
            >
              💸 Refunds
            </Text>
          </TouchableOpacity>
          </ScrollView>

          {/* Filter Button */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Theme.colors.canvas,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: getFilterCount() > 0 ? Theme.colors.primary : Theme.colors.border,
              ...Theme.colors.shadows.small,
            }}
          >
            <Ionicons
              name="filter"
              size={20}
              color={getFilterCount() > 0 ? Theme.colors.primary : Theme.colors.text.secondary}
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: '600',
                color: getFilterCount() > 0 ? Theme.colors.primary : Theme.colors.text.primary,
              }}
            >
              Filters {getFilterCount() > 0 && `(${getFilterCount()})`}
            </Text>
          </TouchableOpacity>
          </View>

          {/* Active Filters Display */}
          {getFilterCount() > 0 && (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {statusFilter !== 'ALL' && (
                  <View style={{ backgroundColor: Theme.colors.background.blueLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '600' }}>
                      {statusFilter}
                    </Text>
                  </View>
                )}
                {quickFilter !== 'NONE' && (
                  <View style={{ backgroundColor: Theme.colors.background.blueLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '600' }}>
                      {quickFilter === 'LAST_WEEK' ? 'Last 1 Week' : 'Last 1 Month'}
                    </Text>
                  </View>
                )}
                {selectedMonth && selectedYear && (
                  <View style={{ backgroundColor: Theme.colors.background.blueLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '600' }}>
                      {selectedMonth} {selectedYear}
                    </Text>
                  </View>
                )}
                {selectedRoomId && (
                  <View style={{ backgroundColor: Theme.colors.background.blueLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '600' }}>
                      Room: {rooms.find(r => r?.s_no === selectedRoomId)?.room_no}
                    </Text>
                  </View>
                )}
                {selectedBedId && (
                  <View style={{ backgroundColor: Theme.colors.background.blueLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '600' }}>
                      Bed: {beds.find(b => b?.s_no === selectedBedId)?.bed_no}
                    </Text>
                  </View>
                )}
              </View>
              </ScrollView>
            </View>
          )}
            </View>
          }
          ListEmptyComponent={
            !(activeTab === 'RENT' ? loading : loadingAdvance) ? (
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <Ionicons name="receipt-outline" size={64} color={Theme.colors.text.tertiary} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 }}>
                  No {activeTab === 'RENT' ? 'Rent' : 'Advance'} Payments Found
                </Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8 }}>
                  {getFilterCount() > 0 ? 'Try adjusting your filters' : 'No payment records available'}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            (activeTab === 'RENT' ? loading : activeTab === 'ADVANCE' ? loadingAdvance : loadingRefund) && currentPage > 1 ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={Theme.colors.primary} />
                <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: Theme.colors.text.secondary }}>
                  Loading more...
                </Text>
              </View>
            ) : null
          }
          onEndReached={loadMorePayments}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

      </View>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent={true} onRequestClose={() => setShowFilters(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Theme.colors.canvas,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: SCREEN_HEIGHT * 0.85,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: Theme.colors.border,
              }}
            >
              <View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
                  Filter Payments
                </Text>
                {getFilterCount() > 0 && (
                  <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                    {getFilterCount()} filter{getFilterCount() > 1 ? 's' : ''} active
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Filter Content */}
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.5 }} contentContainerStyle={{ padding: 20 }}>
              {/* Quick Filters */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                  Quick Filters
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => applyQuickFilter('LAST_WEEK')}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: quickFilter === 'LAST_WEEK' ? Theme.colors.primary : '#fff',
                      borderWidth: 1,
                      borderColor: quickFilter === 'LAST_WEEK' ? Theme.colors.primary : Theme.colors.border,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: quickFilter === 'LAST_WEEK' ? '#fff' : Theme.colors.text.secondary,
                      }}
                    >
                      📅 Last 1 Week
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => applyQuickFilter('LAST_MONTH')}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: quickFilter === 'LAST_MONTH' ? Theme.colors.primary : '#fff',
                      borderWidth: 1,
                      borderColor: quickFilter === 'LAST_MONTH' ? Theme.colors.primary : Theme.colors.border,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: quickFilter === 'LAST_MONTH' ? '#fff' : Theme.colors.text.secondary,
                      }}
                    >
                      📅 Last 1 Month
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status Filter */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                  Payment Status
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['ALL', 'PAID', 'PENDING', 'FAILED'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setStatusFilter(status as any)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: statusFilter === status ? Theme.colors.primary : '#fff',
                        borderWidth: 1,
                        borderColor: statusFilter === status ? Theme.colors.primary : Theme.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: statusFilter === status ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Month & Year Filter */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                  Filter by Month & Year
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setSelectedMonth(null)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: selectedMonth === null ? Theme.colors.primary : '#fff',
                        borderWidth: 1,
                        borderColor: selectedMonth === null ? Theme.colors.primary : Theme.colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: selectedMonth === null ? '#fff' : Theme.colors.text.secondary }}>
                        All
                      </Text>
                    </TouchableOpacity>
                    {MONTHS.map((month) => (
                      <TouchableOpacity
                        key={month}
                        onPress={() => setSelectedMonth(month)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: selectedMonth === month ? Theme.colors.primary : '#fff',
                          borderWidth: 1,
                          borderColor: selectedMonth === month ? Theme.colors.primary : Theme.colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: selectedMonth === month ? '#fff' : Theme.colors.text.secondary }}>
                          {month.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedYear(null)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: selectedYear === null ? Theme.colors.primary : '#fff',
                      borderWidth: 1,
                      borderColor: selectedYear === null ? Theme.colors.primary : Theme.colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: selectedYear === null ? '#fff' : Theme.colors.text.secondary }}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: selectedYear === year ? Theme.colors.primary : '#fff',
                        borderWidth: 1,
                        borderColor: selectedYear === year ? Theme.colors.primary : Theme.colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: selectedYear === year ? '#fff' : Theme.colors.text.secondary }}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Range Filter */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                  Date Range
                </Text>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date: string) => setStartDate(date)}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date: string) => setEndDate(date)}
                  minimumDate={startDate ? new Date(startDate) : undefined}
                />
              </View>

              {/* Room Filter */}
              {rooms.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                    Filter by Room
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedRoomId(null);
                        setSelectedBedId(null);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: selectedRoomId === null ? Theme.colors.primary : '#fff',
                        borderWidth: 1,
                        borderColor: selectedRoomId === null ? Theme.colors.primary : Theme.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: selectedRoomId === null ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        All Rooms
                      </Text>
                    </TouchableOpacity>
                    {rooms.map((room: any) => (
                      <TouchableOpacity
                        key={room.s_no}
                        onPress={() => {
                          setSelectedRoomId(room.s_no);
                          setSelectedBedId(null);
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: selectedRoomId === room.s_no ? Theme.colors.primary : '#fff',
                          borderWidth: 1,
                          borderColor: selectedRoomId === room.s_no ? Theme.colors.primary : Theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: selectedRoomId === room.s_no ? '#fff' : Theme.colors.text.secondary,
                          }}
                        >
                          {room.room_no}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Bed Filter */}
              {beds.length > 0 && selectedRoomId && (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                    Filter by Bed
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setSelectedBedId(null)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: selectedBedId === null ? Theme.colors.primary : '#fff',
                        borderWidth: 1,
                        borderColor: selectedBedId === null ? Theme.colors.primary : Theme.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: selectedBedId === null ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        All Beds
                      </Text>
                    </TouchableOpacity>
                    {beds.map((bed: any) => (
                      <TouchableOpacity
                        key={bed.s_no}
                        onPress={() => setSelectedBedId(bed.s_no)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: selectedBedId === bed.s_no ? Theme.colors.primary : '#fff',
                          borderWidth: 1,
                          borderColor: selectedBedId === bed.s_no ? Theme.colors.primary : Theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: selectedBedId === bed.s_no ? '#fff' : Theme.colors.text.secondary,
                          }}
                        >
                          {bed.bed_no}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: 20,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: Theme.colors.border,
              }}
            >
              {getFilterCount() > 0 && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: Theme.colors.light,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={applyFilters}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: Theme.colors.primary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Status Update Confirmation Modal */}
      <Modal visible={showStatusModal} animationType="fade" transparent={true} onRequestClose={() => setShowStatusModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{
              backgroundColor: Theme.colors.canvas,
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
            }}
          >
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: Theme.withOpacity(Theme.colors.secondary, 0.1),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Ionicons name="checkmark-circle" size={32} color={Theme.colors.secondary} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 8 }}>
                Mark as Paid?
              </Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                Are you sure you want to mark this payment as paid?
              </Text>
            </View>

            {/* Payment Details */}
            {selectedPayment && (
              <View
                style={{
                  backgroundColor: Theme.colors.background.secondary,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary }}>Tenant</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                    {selectedPayment.tenants?.name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary }}>Amount</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.primary }}>
                    ₹{selectedPayment.amount_paid?.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary }}>Room/Bed</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                    {selectedPayment.rooms?.room_no} / {selectedPayment.beds?.bed_no}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowStatusModal(false);
                  setSelectedPayment(null);
                }}
                disabled={updatingStatus}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: Theme.colors.light,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmMarkAsPaid}
                disabled={updatingStatus}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: Theme.colors.secondary,
                  alignItems: 'center',
                }}
              >
                {updatingStatus ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                    Confirm
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Rent Payment Modal */}
      {activeTab === 'RENT' && (
        <EditRentPaymentModal
          visible={showEditModal}
          payment={editingPayment}
          onClose={() => {
            setShowEditModal(false);
            setEditingPayment(null);
          }}
          onSave={handleSavePayment}
          onSuccess={() => {
            // Reload payments after successful update
            loadPayments(1, true);
          }}
        />
      )}

      {/* Edit Advance Payment Modal */}
      {activeTab === 'ADVANCE' && (
        <EditAdvancePaymentModal
          visible={showEditModal}
          payment={editingPayment as any}
          onClose={() => {
            setShowEditModal(false);
            setEditingPayment(null);
          }}
          onSave={handleSavePayment as any}
        />
      )}

      {/* Edit Refund Payment Modal */}
      <EditRefundPaymentModal
        visible={showEditRefundModal}
        payment={editingRefundPayment}
        onClose={() => {
          setShowEditRefundModal(false);
          setEditingRefundPayment(null);
        }}
        onSave={handleSaveRefundPayment}
      />
    </ScreenLayout>
  );
};
