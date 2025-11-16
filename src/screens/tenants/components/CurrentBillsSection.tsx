import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressableCard } from '../../../components/AnimatedPressableCard';
import { Theme } from '../../../theme';
import { CurrentBill } from '../../../services/tenants/tenantService';

interface CurrentBillsSectionProps {
  bills: CurrentBill[] | undefined;
  expanded: boolean;
  onToggle: () => void;
}

export const CurrentBillsSection: React.FC<CurrentBillsSectionProps> = ({
  bills,
  expanded,
  onToggle,
}) => {
  const totalBills = bills?.reduce((sum: number, bill: CurrentBill) => sum + parseFloat(bill.bill_amount.toString()), 0) || 0;

  return (
    <View style={{ marginBottom: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
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
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#8B5CF6' }}>
          📋 Current Bills ({bills?.length || 0})
        </Text>
        <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
          {expanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <ScrollView 
          style={{ maxHeight: 600, paddingHorizontal: 0, paddingVertical: 0, backgroundColor: '#FFFFFF' }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {bills && bills.length > 0 ? (
            <>
              {bills.map((bill: CurrentBill) => (
                <AnimatedPressableCard
                  key={bill.s_no}
                  scaleValue={0.98}
                  duration={120}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                    marginHorizontal: 8,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: '#8B5CF6',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  {/* Header Row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: Theme.colors.text.primary }}>
                        Bill Date
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.secondary, marginTop: 1 }}>
                        {new Date(bill.bill_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>
                        Bill Amount
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#8B5CF6' }}>
                        ₹{parseFloat(bill.bill_amount.toString()).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={{ gap: 6, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#E5E7EB' }}>
                    {/* Created Date */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, width: 80 }}>
                        Created:
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                        {new Date(bill.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    {/* Updated Date */}
                    {bill.updated_at && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, width: 80 }}>
                          Updated:
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                          {new Date(bill.updated_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                </AnimatedPressableCard>
              ))}

              {/* Total Bills Summary */}
              <View style={{ 
                paddingVertical: 12, 
                paddingHorizontal: 16,
                borderTopWidth: 2, 
                borderTopColor: '#8B5CF6', 
                marginTop: 8,
                backgroundColor: '#F3E8FF',
                borderRadius: 8,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#6D28D9' }}>
                    Total Current Bills
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#8B5CF6' }}>
                    ₹{totalBills.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 4 }}>
                No Current Bills
              </Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                No current bills found for this tenant
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
