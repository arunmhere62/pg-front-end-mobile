import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { fetchTenants, deleteTenant, checkoutTenant } from '../../store/slices/tenantSlice';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TenantsScreenProps {
  navigation: any;
}

export const TenantsScreen: React.FC<TenantsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tenants, pagination, loading } = useSelector((state: RootState) => state.tenants);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingRentFilter, setPendingRentFilter] = useState(false);
  const [pendingAdvanceFilter, setPendingAdvanceFilter] = useState(false);
  const [expandedPaymentCards, setExpandedPaymentCards] = useState<Set<number>>(new Set());
  const flatListRef = React.useRef<any>(null);
  
  // Toggle payment details for a tenant
  const togglePaymentDetails = (tenantId: number) => {
    setExpandedPaymentCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
  };
  
  // Get unique rooms from tenants
  const rooms = React.useMemo(() => {
    const uniqueRooms = tenants
      .filter(t => t.rooms)
      .map(t => t.rooms)
      .filter((room, index, self) => 
        room && self.findIndex(r => r?.s_no === room.s_no) === index
      );
    return uniqueRooms;
  }, [tenants]);

  useEffect(() => {
    loadTenants(1);
  }, [selectedPGLocationId, statusFilter, selectedRoomId, pendingRentFilter, pendingAdvanceFilter]);

  // Reload tenants when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTenants(currentPage);
    }, [selectedPGLocationId, statusFilter, selectedRoomId, pendingRentFilter, pendingAdvanceFilter, currentPage])
  );

  const loadTenants = async (page: number) => {
    try {
      setCurrentPage(page);
      
      // When room filter is active, fetch all tenants from that room
      const isRoomFiltered = selectedRoomId !== null;
      
      const params = {
        page: isRoomFiltered ? 1 : page,
        limit: isRoomFiltered ? 1000 : 10, // Fetch all tenants when room filtered
        pg_id: selectedPGLocationId || undefined,
        organization_id: user?.organization_id || undefined,
        user_id: user?.s_no || undefined,
        search: searchQuery || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        room_id: selectedRoomId !== null ? selectedRoomId : undefined,
        pending_rent: pendingRentFilter || undefined,
        pending_advance: pendingAdvanceFilter || undefined,
      };
      
      console.log('🔍 Loading tenants with params:', params);
      
      await dispatch(fetchTenants(params)).unwrap();
      
      // Scroll to top when page changes
      if (flatListRef.current && page === 1) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenants(currentPage);
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadTenants(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      loadTenants(page);
    }
  };

  const handleDeleteTenant = (id: number, name: string) => {
    Alert.alert(
      'Delete Tenant',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteTenant({
                id,
                headers: {
                  pg_id: selectedPGLocationId || undefined,
                  organization_id: user?.organization_id || undefined,
                  user_id: user?.s_no || undefined,
                },
              })).unwrap();
              Alert.alert('Success', 'Tenant deleted successfully');
              loadTenants(currentPage);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete tenant');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = (id: number, name: string) => {
    Alert.alert(
      'Checkout Tenant',
      `Are you sure you want to checkout ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout',
          onPress: async () => {
            try {
              await dispatch(checkoutTenant({
                id,
                headers: {
                  pg_id: selectedPGLocationId || undefined,
                  organization_id: user?.organization_id || undefined,
                  user_id: user?.s_no || undefined,
                },
              })).unwrap();
              Alert.alert('Success', 'Tenant checked out successfully');
              loadTenants(currentPage);
            } catch (error) {
              Alert.alert('Error', 'Failed to checkout tenant');
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setSelectedRoomId(null);
    setPendingRentFilter(false);
    setPendingAdvanceFilter(false);
  };

  const getFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'ALL') count++;
    if (selectedRoomId !== null) count++;
    if (pendingRentFilter) count++;
    if (pendingAdvanceFilter) count++;
    return count;
  };

  const renderTenantCard = ({ item }: any) => {
    // Get tenant image
    const tenantImage = item.images && Array.isArray(item.images) && item.images.length > 0 
      ? item.images[0] 
      : null;

    const showPaymentDetails = expandedPaymentCards.has(item.s_no);
    const hasPendingPayment = item.pending_payment && item.pending_payment.total_pending > 0;
    const isOverdue = item.pending_payment?.payment_status === 'OVERDUE';

    return (
      <Card style={{ 
        marginBottom: 12, 
        padding: 12,
        borderLeftWidth: hasPendingPayment ? 4 : 0,
        borderLeftColor: isOverdue ? '#EF4444' : 
                        item.pending_payment?.payment_status === 'PARTIAL' ? '#F59E0B' : '#3B82F6',
      }}>
        {/* Header with Image */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
          {/* Tenant Image/Avatar */}
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            overflow: 'hidden',
          }}>
            {tenantImage ? (
              <Image 
                source={{ uri: tenantImage }} 
                style={{ width: 60, height: 60 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {/* Name and ID */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Theme.colors.text.primary }}>
                {item.name}
              </Text>
              {/* Pending Payment Tag */}
              {item.pending_payment && item.pending_payment.total_pending > 0 && (
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                  backgroundColor: 
                    item.pending_payment.payment_status === 'OVERDUE' ? '#EF4444' : 
                    item.pending_payment.payment_status === 'PARTIAL' ? '#F59E0B' : '#3B82F6',
                }}>
                  <Text style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: '#fff',
                  }}>
                    {item.pending_payment.payment_status === 'OVERDUE' ? '⚠️ OVERDUE' : 
                     item.pending_payment.payment_status === 'PARTIAL' ? '⏳ PARTIAL' : '📅 PENDING'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginTop: 2 }}>
              ID: {item.tenant_id}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: item.status === 'ACTIVE' ? '#10B98120' : '#EF444420',
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: '600',
              color: item.status === 'ACTIVE' ? '#10B981' : '#EF4444',
            }}>
              {item.status}
            </Text>
          </View>
        </View>

      {/* Contact Info */}
      <View style={{ marginBottom: 12 }}>
        {item.phone_no && (
          <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginBottom: 4 }}>
            📞 {item.phone_no}
          </Text>
        )}
        {item.email && (
          <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginBottom: 4 }}>
            ✉️ {item.email}
          </Text>
        )}
        {item.occupation && (
          <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>
            💼 {item.occupation}
          </Text>
        )}
      </View>

      {/* Room & Bed Info */}
      {(item.rooms || item.beds) && (
        <View style={{
          flexDirection: 'row',
          gap: 12,
          marginBottom: 12,
          paddingVertical: 8,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: Theme.colors.border,
        }}>
          {item.rooms && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Room</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {item.rooms.room_no}
              </Text>
              {item.rooms.rent_price && (
                <Text style={{ fontSize: 11, color: Theme.colors.primary, marginTop: 2 }}>
                  ₹{item.rooms.rent_price}/month
                </Text>
              )}
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
      )}

      {/* Pending Payment Alert */}
      {item.pending_payment && item.pending_payment.total_pending > 0 && (
        <View style={{
          backgroundColor: item.pending_payment.payment_status === 'OVERDUE' ? '#FEE2E2' : 
                         item.pending_payment.payment_status === 'PARTIAL' ? '#FEF3C7' : '#DBEAFE',
          borderLeftWidth: 4,
          borderLeftColor: item.pending_payment.payment_status === 'OVERDUE' ? '#EF4444' : 
                          item.pending_payment.payment_status === 'PARTIAL' ? '#F59E0B' : '#3B82F6',
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '700', 
              color: item.pending_payment.payment_status === 'OVERDUE' ? '#DC2626' : 
                     item.pending_payment.payment_status === 'PARTIAL' ? '#D97706' : '#2563EB'
            }}>
              {item.pending_payment.payment_status === 'OVERDUE' ? '⚠️ OVERDUE' : 
               item.pending_payment.payment_status === 'PARTIAL' ? '⏳ PARTIAL PAYMENT' : '📅 PENDING'}
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '700', 
                color: item.pending_payment.payment_status === 'OVERDUE' ? '#DC2626' : 
                       item.pending_payment.payment_status === 'PARTIAL' ? '#D97706' : '#2563EB'
              }}>
                ₹{item.pending_payment.total_pending}
              </Text>
              <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary }}>
                Balance
              </Text>
            </View>
          </View>
          
          {item.pending_payment.overdue_months > 0 && (
            <Text style={{ fontSize: 11, color: '#DC2626', marginBottom: 2 }}>
              {item.pending_payment.overdue_months} month(s) overdue
            </Text>
          )}
          
          {item.pending_payment.next_due_date && (
            <Text style={{ fontSize: 11, color: Theme.colors.text.secondary }}>
              Next due: {new Date(item.pending_payment.next_due_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Payment Summary - Collapsible */}
      {(item.tenant_payments?.length > 0 || item.advance_payments?.length > 0 || item.refund_payments?.length > 0) && (
        <View style={{
          backgroundColor: '#F9FAFB',
          borderRadius: 8,
          marginBottom: 12,
          overflow: 'hidden',
        }}>
          {/* Header - Always Visible */}
          <TouchableOpacity
            onPress={() => togglePaymentDetails(item.s_no)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
              💰 Payment History
            </Text>
            <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
              {showPaymentDetails ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Collapsible Content */}
          {showPaymentDetails && (
            <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
              {/* Regular Payments */}
              {item.tenant_payments && item.tenant_payments.length > 0 && (
                <View style={{ marginBottom: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 4 }}>
                    Rent Payments ({item.tenant_payments.length})
                  </Text>
                  {item.tenant_payments.slice(0, 3).map((payment: any, index: number) => (
                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 10, color: Theme.colors.text.secondary }}>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </Text>
                      <Text style={{ fontSize: 10, color: Theme.colors.text.primary, fontWeight: '600' }}>
                        ₹{payment.amount_paid}
                      </Text>
                    </View>
                  ))}
                  {item.tenant_payments.length > 3 && (
                    <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, fontStyle: 'italic' }}>
                      +{item.tenant_payments.length - 3} more
                    </Text>
                  )}
                </View>
              )}
              
              {/* Advance Payments */}
              {item.advance_payments && item.advance_payments.length > 0 && (
                <View style={{ marginBottom: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#10B981', marginBottom: 4 }}>
                    Advance Payments ({item.advance_payments.length})
                  </Text>
                  {item.advance_payments.map((payment: any, index: number) => (
                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 10, color: Theme.colors.text.secondary }}>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '600' }}>
                        ₹{payment.amount_paid}
                      </Text>
                    </View>
                  ))}
                  <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '600', marginTop: 2 }}>
                    Total: ₹{item.advance_payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0)}
                  </Text>
                </View>
              )}
              
              {/* Refund Payments */}
              {item.refund_payments && item.refund_payments.length > 0 && (
                <View style={{ paddingTop: 4, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#F59E0B', marginBottom: 4 }}>
                    Refunds ({item.refund_payments.length})
                  </Text>
                  {item.refund_payments.map((payment: any, index: number) => (
                    <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 10, color: Theme.colors.text.secondary }}>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: '600' }}>
                        ₹{payment.amount_paid}
                      </Text>
                    </View>
                  ))}
                  <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: '600', marginTop: 2 }}>
                    Total: ₹{item.refund_payments.reduce((sum: number, p: any) => sum + p.amount_paid, 0)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Check-in Date */}
      <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 12 }}>
        Check-in: {new Date(item.check_in_date).toLocaleDateString()}
      </Text>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TenantDetails', { tenantId: item.s_no })}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            backgroundColor: Theme.colors.primary,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>View Details</Text>
        </TouchableOpacity>
        {item.status === 'ACTIVE' && (
          <TouchableOpacity
            onPress={() => handleCheckout(item.s_no, item.name)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              backgroundColor: '#F59E0B',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Checkout</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleDeleteTenant(item.s_no, item.name)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            backgroundColor: '#EF4444',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
    );
  };

  const renderPagination = () => {
    // Hide pagination when room filter is active (showing all tenants)
    if (!pagination || pagination.totalPages <= 1 || selectedRoomId !== null) return null;

    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    const pages = [];
    
    // Smart pagination: show fewer pages at start/end, more in middle
    let maxPagesToShow = 3; // Default to 3 pages
    
    // If we're in the middle (not near start or end), show more pages
    if (currentPage > 3 && currentPage < totalPages - 2) {
      maxPagesToShow = 5;
    }
    
    // Calculate start and end pages
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Build page numbers array
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <View style={{
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            gap: 8,
          }}
        >
          {/* Previous Button */}
          <TouchableOpacity
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: currentPage === 1 ? '#E5E7EB' : Theme.colors.primary,
              minWidth: 70,
            }}
          >
            <Text style={{ 
              color: currentPage === 1 ? '#9CA3AF' : '#fff', 
              fontWeight: '600',
              fontSize: 14,
            }}>
              ← Prev
            </Text>
          </TouchableOpacity>
     
          {/* First Page */}
          {startPage > 1 && (
            <>
              <TouchableOpacity
                onPress={() => goToPage(1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: currentPage === 1 ? Theme.colors.primary : '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ 
                  color: currentPage === 1 ? '#fff' : Theme.colors.text.primary, 
                  fontWeight: '600' 
                }}>1</Text>
              </TouchableOpacity>
              {startPage > 2 && <Text style={{ color: Theme.colors.text.tertiary, paddingHorizontal: 4 }}>...</Text>}
            </>
          )}
     
          {/* Page Numbers */}
          {pages.map((page) => (
            <TouchableOpacity
              key={page}
              onPress={() => goToPage(page)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: page === currentPage ?   Theme.colors.primary : '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ 
                color: page === currentPage ?   '#fff' : Theme.colors.text.primary, 
                fontWeight: '600' 
              }}>
                {page}
              </Text>
            </TouchableOpacity>
          ))}
     
          {/* Last Page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <Text style={{ color: Theme.colors.text.tertiary, paddingHorizontal: 4 }}>...</Text>}
              <TouchableOpacity
                onPress={() => goToPage(totalPages)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: currentPage === totalPages ? Theme.colors.primary : '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ 
                  color: currentPage === totalPages ? '#fff' : Theme.colors.text.primary, 
                  fontWeight: '600' 
                }}>{totalPages}</Text>
              </TouchableOpacity>
            </>
          )}
     
          {/* Next Button */}
          <TouchableOpacity
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: currentPage === totalPages ? '#E5E7EB' : Theme.colors.primary,
              minWidth: 70,
            }}
          >
            <Text style={{ 
              color: currentPage === totalPages ? '#9CA3AF' : '#fff', 
              fontWeight: '600',
              fontSize: 14,
            }}>
              Next →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
  );
};

  return (
    <ScreenLayout>
      <ScreenHeader title="Tenants" subtitle={`${pagination?.total || 0} total`} />

      {/* Search & Filter Bar */}
      <View style={{ backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: Theme.colors.background.secondary,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 14,
            }}
            placeholder="Search by name, phone, ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              backgroundColor: Theme.colors.primary,
              borderRadius: 8,
              paddingHorizontal: 14,
              justifyContent: 'center',
            }}
          >
            <Ionicons name="search" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: getFilterCount() > 0 ? Theme.colors.primary : Theme.colors.light,
              borderRadius: 8,
              paddingHorizontal: 14,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons name="filter" size={18} color={getFilterCount() > 0 ? '#fff' : Theme.colors.text.primary} />
            {getFilterCount() > 0 && (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: Theme.colors.primary }}>
                  {getFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Modal Overlay */}
      <Modal
        visible={showFilters}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: SCREEN_HEIGHT * 0.7,
              }}
            >
              {/* Handle Bar */}
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: Theme.colors.border,
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: Theme.colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
                    Filter Tenants
                  </Text>
                  {getFilterCount() > 0 && (
                    <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                      {getFilterCount()} filter{getFilterCount() > 1 ? 's' : ''} active
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: Theme.colors.light,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={20} color={Theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Filter Content */}
              <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.5 }} contentContainerStyle={{ padding: 20 }}>
                {/* Status Filter */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                    Filter by Status
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setStatusFilter(status as any)}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 8,
                          backgroundColor: statusFilter === status ? Theme.colors.primary : '#fff',
                          borderWidth: 1,
                          borderColor: statusFilter === status ? Theme.colors.primary : Theme.colors.border,
                          alignItems: 'center',
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

                {/* Room Filter */}
                {rooms.length > 0 && (
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                      Filter by Room
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => setSelectedRoomId(null)}
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
                          onPress={() => setSelectedRoomId(room.s_no)}
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

                {/* Payment Filters */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                    Payment Filters
                  </Text>
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setPendingRentFilter(!pendingRentFilter)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: pendingRentFilter ? '#EF4444' : '#fff',
                        borderWidth: 1,
                        borderColor: pendingRentFilter ? '#EF4444' : Theme.colors.border,
                        gap: 8,
                      }}
                    >
                      <Ionicons 
                        name={pendingRentFilter ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={pendingRentFilter ? '#fff' : Theme.colors.text.secondary} 
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: pendingRentFilter ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        ⚠️ Pending Rent
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setPendingAdvanceFilter(!pendingAdvanceFilter)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        backgroundColor: pendingAdvanceFilter ? '#F59E0B' : '#fff',
                        borderWidth: 1,
                        borderColor: pendingAdvanceFilter ? '#F59E0B' : Theme.colors.border,
                        gap: 8,
                      }}
                    >
                      <Ionicons 
                        name={pendingAdvanceFilter ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={pendingAdvanceFilter ? '#fff' : Theme.colors.text.secondary} 
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: pendingAdvanceFilter ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        💰 No Advance
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
                  onPress={() => setShowFilters(false)}
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
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Room Filter Active Indicator */}
      {selectedRoomId !== null && (
        <View style={{
          backgroundColor: '#EFF6FF',
          borderLeftWidth: 4,
          borderLeftColor: Theme.colors.primary,
          padding: 12,
          marginHorizontal: 16,
          marginTop: 8,
          borderRadius: 8,
        }}>
          <Text style={{ 
            color: Theme.colors.primary, 
            fontWeight: '600',
            fontSize: 13,
          }}>
            🏠 Showing all tenants from selected room ({tenants.length} total)
          </Text>
        </View>
      )}

      {/* Tenants List */}
      {loading && tenants.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>Loading tenants...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={tenants}
          renderItem={renderTenantCard}
          keyExtractor={(item) => item.s_no.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>👥</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>No Tenants Found</Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8 }}>
                {selectedRoomId ? 'No tenants in this room' : 'Add your first tenant to get started'}
              </Text>
            </View>
          }
        />
      )}

      {/* Pagination */}
      {!loading && tenants.length > 0 && renderPagination()}

      {/* Pagination Info */}
      {pagination && tenants.length > 0 && (
        <View style={{
          padding: 12,
          backgroundColor: Theme.colors.background.secondary,
          borderTopWidth: 1,
          borderTopColor: Theme.colors.border,
        }}>
          <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, textAlign: 'center' }}>
            Page {currentPage} of {pagination.totalPages} • Total: {pagination.total} tenants
          </Text>
        </View>
      )}

      {/* Floating Add Tenant Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddTenant')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 80,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: Theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
};
