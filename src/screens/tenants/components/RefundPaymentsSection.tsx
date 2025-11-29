import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AnimatedPressableCard } from '../../../components/AnimatedPressableCard';
import { Theme } from '../../../theme';
import { RefundPayment } from '../../../services/tenants/tenantService';

interface RefundPaymentsSectionProps {
  payments: RefundPayment[] | undefined;
  expanded: boolean;
  onToggle: () => void;
  onEdit: (payment: RefundPayment) => void;
  onDelete: (payment: RefundPayment) => void;
}

export const RefundPaymentsSection: React.FC<RefundPaymentsSectionProps> = ({
  payments,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const totalRefund = payments?.reduce((sum: number, p: RefundPayment) => sum + parseFloat(p.amount_paid.toString()), 0) || 0;

  return (
    <View style={{ marginBottom: 8, marginHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
      <TouchableOpacity
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: expanded ? 1 : 0,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#F59E0B' }}>
          🔄 Refund Payments ({payments?.length || 0})
        </Text>
        <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
          {expanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView 
          style={{ maxHeight: 600, paddingHorizontal: 8, paddingVertical: 0, backgroundColor: '#FFFFFF' }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {payments && payments.length > 0 ? (
            <>
              {payments.map((payment: RefundPayment) => (
                <AnimatedPressableCard
                  key={payment.s_no}
                  scaleValue={0.98}
                  duration={120}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                    backgroundColor: 'white',
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                        {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                      {payment.status && (
                        <View style={{
                          marginTop: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          alignSelf: 'flex-start',
                          backgroundColor: 
                            payment.status === 'PAID' ? '#10B98120' :
                            payment.status === 'PENDING' ? '#F59E0B20' : '#9CA3AF20',
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '600',
                            color: 
                              payment.status === 'PAID' ? '#10B981' :
                              payment.status === 'PENDING' ? '#F59E0B' : '#6B7280',
                          }}>
                            {payment.status}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#F59E0B', marginBottom: 8 }}>
                        ₹{payment.amount_paid}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => onEdit(payment)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: '#DBEAFE',
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => onDelete(payment)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: '#FEE2E2',
                          }}
                        >
                          <Text style={{ fontSize: 16 }}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {payment.payment_method && (
                    <Text style={{ fontSize: 11, color: Theme.colors.text.secondary }}>
                      Method: {payment.payment_method}
                    </Text>
                  )}
                  {payment.remarks && (
                    <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, fontStyle: 'italic' }}>
                      {payment.remarks}
                    </Text>
                  )}
                </AnimatedPressableCard>
              ))}
              <View style={{ paddingTop: 12, borderTopWidth: 2, borderTopColor: '#F59E0B', marginTop: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#F59E0B', textAlign: 'right' }}>
                  Total Refund: ₹{totalRefund.toLocaleString('en-IN')}
                </Text>
              </View>
            </>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔄</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#F59E0B', marginBottom: 4 }}>
                No Refunds
              </Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                No refund records found for this tenant
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
