import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPayments } from '../../store/slices/paymentSlice';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';

interface PaymentsScreenProps {
  navigation: any;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, loading } = useSelector((state: RootState) => state.payments);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED'>('ALL');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      await dispatch(fetchPayments()).unwrap();
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const filteredPayments = filter === 'ALL'
    ? payments
    : payments.filter(p => p.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  const renderPaymentItem = ({ item }: any) => (
    <Card className="mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-dark mb-1">
            ₹{Number(item.amount_paid).toFixed(2)}
          </Text>
          <Text className="text-gray-600 text-sm">
            {getPaymentMethodIcon(item.payment_method)} {item.payment_method}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-semibold">{item.status}</Text>
        </View>
      </View>
      <View className="border-t border-gray-200 pt-2">
        <Text className="text-xs text-gray-500">
          Date: {item.payment_date ? new Date(item.payment_date).toLocaleDateString() : 'N/A'}
        </Text>
        {item.remarks && (
          <Text className="text-xs text-gray-500 mt-1">Note: {item.remarks}</Text>
        )}
      </View>
    </Card>
  );

  return (
    <ScreenLayout>
      <ScreenHeader title="Payments" />

        <View style={{ flex: 1, backgroundColor: Theme.colors.light, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 }}>
        {/* Filter Buttons */}
        <View className="flex-row mb-4">
          {['ALL', 'PAID', 'PENDING', 'FAILED'].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilter(status as any)}
              className={`flex-1 py-2 mx-1 rounded-lg ${
                filter === status ? 'bg-primary' : 'bg-white'
              }`}
            >
              <Text className={`text-center font-semibold ${
                filter === status ? 'text-white' : 'text-gray-600'
              }`}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <Card className="mb-4">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-600 text-sm">Total Collected</Text>
              <Text className="text-2xl font-bold text-secondary">
                ₹{payments
                  .filter(p => p.status === 'PAID')
                  .reduce((sum, p) => sum + Number(p.amount_paid), 0)
                  .toFixed(2)}
              </Text>
            </View>
            <View>
              <Text className="text-gray-600 text-sm">Pending</Text>
              <Text className="text-2xl font-bold text-warning">
                ₹{payments
                  .filter(p => p.status === 'PENDING')
                  .reduce((sum, p) => sum + Number(p.amount_paid), 0)
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        <FlatList
          data={filteredPayments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.s_no.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500 text-lg">No payments found</Text>
            </View>
          }
        />
        </View>
    </ScreenLayout>
  );
};
