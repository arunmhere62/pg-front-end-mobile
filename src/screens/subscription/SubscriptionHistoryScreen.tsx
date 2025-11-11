import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchSubscriptionHistory } from '../../store/slices/subscriptionSlice';
import { ScreenLayout } from '../../components/ScreenLayout';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { UserSubscription } from '../../services/subscription/subscriptionService';
import { CONTENT_COLOR } from '@/constant';

interface SubscriptionHistoryScreenProps {
  navigation: any;
}

export const SubscriptionHistoryScreen: React.FC<SubscriptionHistoryScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { history, historyPagination, loading } = useSelector((state: RootState) => state.subscription);
  const [refreshing, setRefreshing] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const flatListRef = React.useRef<any>(null);

  useEffect(() => {
    loadHistory(1, true);
  }, [dispatch]);

  const loadHistory = async (page: number, reset: boolean = false) => {
    try {
      if (!hasMore && !reset) return;
      
      setCurrentPage(page);
      
      const result = await dispatch(fetchSubscriptionHistory({ page, limit: 10 })).unwrap();
      console.log('📜 History fetched:', result);
      
      setHasMore(result.pagination ? page < result.pagination.totalPages : false);
      
      // Scroll to top when resetting
      if (flatListRef.current && reset) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    } catch (error) {
      console.error('❌ Error loading history:', error);
    }
  };

  // Debug log
  useEffect(() => {
    console.log('📊 History state:', { history, loading, historyPagination });
  }, [history, loading, historyPagination]);

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    await loadHistory(1, true);
    setRefreshing(false);
  };

  const goToPage = (page: number) => {
    if (page < 1 || (historyPagination && page > historyPagination.totalPages)) return;
    loadHistory(page, true);
  };

  const loadMoreHistory = () => {
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    loadHistory(nextPage, false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return Theme.colors.secondary;
      case 'EXPIRED':
        return Theme.colors.danger;
      case 'CANCELLED':
        return Theme.colors.text.tertiary;
      case 'PENDING':
        return Theme.colors.warning;
      default:
        return Theme.colors.text.secondary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return Theme.colors.secondary;
      case 'PENDING':
        return Theme.colors.warning;
      case 'FAILED':
        return Theme.colors.danger;
      default:
        return Theme.colors.text.secondary;
    }
  };

  const renderPageNumbers = () => {
    if (!historyPagination || historyPagination.totalPages <= 1) return null;

    const pages = [];
    const totalPages = historyPagination.totalPages;
    const current = currentPage;

    // Show max 5 page numbers
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, current + 2);

    // Adjust if at the beginning or end
    if (current <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (current >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Calculate showing range
    const startItem = (current - 1) * historyPagination.limit + 1;
    const endItem = Math.min(current * historyPagination.limit, historyPagination.total);

    return (
      <View style={{ backgroundColor: CONTENT_COLOR }}>
        {/* Showing X of Y indicator */}
        <View style={{
          alignItems: 'center',
          paddingTop: 12,
          paddingBottom: 8,
        }}>
          <View style={{
            backgroundColor: Theme.colors.text.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}>
            <Text style={{
              color: '#fff',
              fontSize: 13,
              fontWeight: '600',
            }}>
              {startItem}-{endItem} of {historyPagination.total}
            </Text>
          </View>
        </View>

        {/* Page numbers */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 16,
          gap: 8,
        }}>
        {/* Previous Button */}
        <TouchableOpacity
          onPress={() => goToPage(current - 1)}
          disabled={current === 1}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: current === 1 ? '#E5E7EB' : Theme.colors.primary,
          }}
        >
          <Text style={{ 
            color: current === 1 ? '#9CA3AF' : '#fff', 
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
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: Theme.colors.text.primary, fontWeight: '600' }}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && <Text style={{ color: Theme.colors.text.tertiary }}>...</Text>}
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
              backgroundColor: page === current ? Theme.colors.primary : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ 
              color: page === current ? '#fff' : Theme.colors.text.primary, 
              fontWeight: '600' 
            }}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Last Page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <Text style={{ color: Theme.colors.text.tertiary }}>...</Text>}
            <TouchableOpacity
              onPress={() => goToPage(totalPages)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: Theme.colors.text.primary, fontWeight: '600' }}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Next Button */}
        <TouchableOpacity
          onPress={() => goToPage(current + 1)}
          disabled={current === totalPages}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: current === totalPages ? '#E5E7EB' : Theme.colors.primary,
          }}
        >
          <Text style={{ 
            color: current === totalPages ? '#9CA3AF' : '#fff', 
            fontWeight: '600',
            fontSize: 14,
          }}>
            Next →
          </Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: UserSubscription }) => {
    const plan = item.plan || item.subscription_plans;
    
    return (
    <Card style={{ marginBottom: 12, padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 }}>
            {plan?.name || 'Unknown Plan'}
          </Text>
          <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>
            {plan?.description || ''}
          </Text>
        </View>
        <View style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 12,
          backgroundColor: Theme.withOpacity(getStatusColor(item.status), 0.1),
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '700',
            color: getStatusColor(item.status),
          }}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={{ 
        backgroundColor: Theme.colors.background.secondary, 
        padding: 12, 
        borderRadius: 8,
        marginBottom: 12,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary }}>Start Date</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
            {formatDate(item.start_date)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary }}>End Date</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
            {formatDate(item.end_date)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary }}>Amount Paid</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.primary }}>
            ₹{(item.amount_paid || plan?.price || 0).toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary }}>Duration</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
            {plan?.duration || 0} days
          </Text>
        </View>
      </View>

      {/* Payment Status */}
      {item.payment_status && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={item.payment_status === 'PAID' ? 'checkmark-circle' : item.payment_status === 'PENDING' ? 'time' : 'close-circle'} 
              size={18} 
              color={getPaymentStatusColor(item.payment_status || 'PENDING')} 
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>
              Payment: <Text style={{ fontWeight: '600', color: getPaymentStatusColor(item.payment_status || 'PENDING') }}>
                {item.payment_status}
              </Text>
            </Text>
          </View>
          
          {item.status === 'ACTIVE' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('SubscriptionPlans')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: Theme.colors.background.blueLight,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.primary }}>
                Manage
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
    );
  };

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue} contentBackgroundColor={CONTENT_COLOR}>
      <ScreenHeader
        showBackButton
        onBackPress={() => navigation.goBack()}
        title="Subscription History"
        subtitle={historyPagination ? `${historyPagination.total} subscriptions` : ''}
        backgroundColor={Theme.colors.background.blue}
      />

      <FlatList
        ref={flatListRef}
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.s_no?.toString() || item.id?.toString() || Math.random().toString()}
        style={{ backgroundColor: CONTENT_COLOR }}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Theme.colors.primary]}
          />
        }
        ListFooterComponent={
          loading && currentPage > 1 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
              <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>
                Loading history...
              </Text>
            </View>
          ) : (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <Ionicons name="receipt-outline" size={64} color={Theme.colors.text.tertiary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16 }}>
                No Subscription History
              </Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                You haven't subscribed to any plan yet
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SubscriptionPlans')}
                style={{
                  marginTop: 24,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  backgroundColor: Theme.colors.primary,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                  View Plans
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
      
      {/* Pagination Numbers */}
      {renderPageNumbers()}
    </ScreenLayout>
  );
};
