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

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await dispatch(fetchSubscriptionHistory({ page: 1, limit: 20 })).unwrap();
        console.log('📜 History fetched:', result);
      } catch (error) {
        console.error('❌ Error loading history:', error);
      }
    };
    loadHistory();
  }, [dispatch]);

  // Debug log
  useEffect(() => {
    console.log('📊 History state:', { history, loading, historyPagination });
  }, [history, loading, historyPagination]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSubscriptionHistory({ page: 1, limit: 20 }));
    setRefreshing(false);
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
            ₹{(item.amount_paid || 0).toLocaleString('en-IN')}
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
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.s_no?.toString() || item.id?.toString() || Math.random().toString()}
        style={{ backgroundColor: CONTENT_COLOR }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Theme.colors.primary]}
          />
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
    </ScreenLayout>
  );
};
