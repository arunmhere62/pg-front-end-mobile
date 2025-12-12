import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { AnimatedPressableCard } from '../../components/AnimatedPressableCard';
import { ActionButtons } from '../../components/ActionButtons';
import { CONTENT_COLOR } from '@/constant';
import refundPaymentService from '@/services/payments/refundPaymentService';
import { showErrorAlert } from '@/utils/errorHandler';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface RefundPayment {
  s_no: number;
  payment_date: string;
  amount_paid: number;
  actual_rent_amount: number;
  payment_method: string;
  status: string;
  remarks?: string;
}

export const RefundPaymentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);

  const payments: RefundPayment[] = route.params?.payments || [];
  const tenantName = route.params?.tenantName || 'Tenant';
  const tenantId = route.params?.tenantId || 0;

  const [loading, setLoading] = useState(false);

  const handleDeletePayment = (payment: RefundPayment) => {
    Alert.alert(
      'Delete Refund Payment',
      `Are you sure you want to delete this refund?\n\nAmount: ₹${payment.amount_paid}\nDate: ${new Date(payment.payment_date).toLocaleDateString('en-IN')}`,
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
              setLoading(true);
              await refundPaymentService.deleteRefundPayment(payment.s_no);
              Alert.alert('Success', 'Refund payment deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              showErrorAlert(error, 'Delete Error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return { bg: '#10B98120', text: '#10B981', icon: '✅' };
      case 'PARTIAL':
        return { bg: '#DC262620', text: '#DC2626', icon: '⏳' };
      case 'PENDING':
        return { bg: '#F59E0B20', text: '#F59E0B', icon: '📅' };
      case 'FAILED':
        return { bg: '#EF444420', text: '#EF4444', icon: '❌' };
      default:
        return { bg: '#9CA3AF20', text: '#6B7280', icon: '📋' };
    }
  };

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader
        title="Refund Payments"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
      />

      <View style={{ flex: 1, backgroundColor: CONTENT_COLOR }}>
        {/* Tenant Info Header */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: Theme.colors.background.blueLight,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
            {tenantName}
          </Text>
          <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginTop: 4 }}>
            {payments.length} payment(s)
          </Text>
        </View>

        {loading && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          </View>
        )}

        {!loading && payments && payments.length > 0 ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {payments.map((payment) => {
              const statusColor = getStatusColor(payment.status);

              return (
                <AnimatedPressableCard
                  key={payment.s_no}
                  scaleValue={0.97}
                  duration={120}
                  style={{ marginBottom: 12 }}
                >
                  <Card style={{
                    padding: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: '#F59E0B',
                  }}>
                    {/* Header Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginBottom: 4 }}>
                          {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#D97706' }}>
                          ₹{payment.amount_paid}
                        </Text>
                      </View>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: statusColor.bg,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor.text }}>
                          {statusColor.icon} {payment.status}
                        </Text>
                      </View>
                    </View>

                    {/* Payment Method */}
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: '#E5E7EB',
                      marginBottom: 10,
                    }}>
                      <Text style={{ fontSize: 11, color: Theme.colors.text.secondary }}>
                        {payment.payment_method || 'N/A'}
                      </Text>
                      {payment.remarks && (
                        <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, fontStyle: 'italic' }}>
                          {payment.remarks}
                        </Text>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <ActionButtons
                      onEdit={() => {}}
                      onDelete={() => handleDeletePayment(payment)}
                      showView={false}
                    />
                  </Card>
                </AnimatedPressableCard>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>
        ) : (
          !loading && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FEF3C7',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="cash-outline" size={48} color="#D97706" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 8 }}>
                No Refund Payments
              </Text>
              <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                No refund payments have been recorded for this tenant yet.
              </Text>
            </View>
          )
        )}
      </View>
    </ScreenLayout>
  );
};
