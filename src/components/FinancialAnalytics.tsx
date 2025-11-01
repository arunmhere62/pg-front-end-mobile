import React, { memo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Card } from './Card';
import { Theme } from '../theme';
import { SkeletonLoader, CardSkeleton } from './SkeletonLoader';

interface MonthlyFinancialData {
  month: string;
  year: number;
  monthNumber: number;
  revenue: {
    rentPayments: number;
    advancePayments: number;
    total: number;
  };
  expenses: {
    generalExpenses: number;
    salaries: number;
    total: number;
  };
  profit: number;
  profitPercentage: string;
}

interface FinancialAnalyticsData {
  pgLocation: {
    id: number;
    name: string;
  };
  monthlyData: MonthlyFinancialData[];
}

interface FinancialAnalyticsProps {
  data: FinancialAnalyticsData | null;
  loading: boolean;
  selectedMonths: number;
  onMonthsChange: (months: number) => void;
}

export const FinancialAnalytics = memo<FinancialAnalyticsProps>(({ 
  data, 
  loading, 
  selectedMonths, 
  onMonthsChange 
}) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthlyFinancialData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Set initial selected month when data loads
  React.useEffect(() => {
    if (data && data.monthlyData.length > 0 && !selectedMonth) {
      setSelectedMonth(data.monthlyData[data.monthlyData.length - 1]);
    }
  }, [data]);

  const handleMonthSelect = useCallback((monthData: MonthlyFinancialData) => {
    setSelectedMonth(monthData);
    setShowDropdown(false);
  }, []);

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary }}>
          💰 Financial Analytics
        </Text>
        {/* Month Dropdown Selector */}
        {data && selectedMonth && (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={() => setShowDropdown(!showDropdown)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                minWidth: 120,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1F2937', flex: 1 }}>
                {selectedMonth.month}
              </Text>
              <Text style={{ fontSize: 10, color: '#6B7280', marginLeft: 4 }}>
                {showDropdown ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <View style={{
                position: 'absolute',
                top: 40,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                minWidth: 140,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 5,
                zIndex: 1000,
              }}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {data.monthlyData.map((monthData, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleMonthSelect(monthData)}
                      style={{
                        padding: 12,
                        borderBottomWidth: index < data.monthlyData.length - 1 ? 1 : 0,
                        borderBottomColor: '#F3F4F6',
                        backgroundColor: selectedMonth?.month === monthData.month ? '#F0F9FF' : 'white',
                      }}
                    >
                      <Text style={{ 
                        fontSize: 12, 
                        fontWeight: selectedMonth?.month === monthData.month ? '700' : '600',
                        color: selectedMonth?.month === monthData.month ? '#3B82F6' : '#1F2937'
                      }}>
                        {monthData.month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 16 }}>
          <SkeletonLoader width="100%" height={120} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SkeletonLoader width="48%" height={140} />
            <SkeletonLoader width="48%" height={140} />
          </View>
        </View>
      ) : data && (
        <View>
          {/* Month Details */}
          {selectedMonth && (
            <View style={{ paddingHorizontal: 16 }}>
              {/* Profit Summary Card */}
              <Card style={{ 
                padding: 16, 
                backgroundColor: selectedMonth.profit >= 0 ? '#F0FDF4' : '#FEF2F2',
                borderRadius: 12,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: selectedMonth.profit >= 0 ? '#10B981' : '#EF4444'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' }}>
                      {selectedMonth.profit >= 0 ? 'Net Profit' : 'Net Loss'}
                    </Text>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: selectedMonth.profit >= 0 ? '#10B981' : '#EF4444' }}>
                      {selectedMonth.profit >= 0 ? '+' : ''}₹{Math.abs(selectedMonth.profit).toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>
                      {selectedMonth.profitPercentage}% profit margin
                    </Text>
                  </View>
                  <View style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: selectedMonth.profit >= 0 ? '#10B981' : '#EF4444',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: 28 }}>{selectedMonth.profit >= 0 ? '📈' : '📉'}</Text>
                  </View>
                </View>
              </Card>

              {/* Revenue and Expenses Cards */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                {/* Revenue Card */}
                <Card style={{ flex: 1, padding: 14, backgroundColor: 'white', borderRadius: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      <Text style={{ fontSize: 16 }}>💰</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '600' }}>REVENUE</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#10B981', marginBottom: 8 }}>
                    ₹{selectedMonth.revenue.total.toLocaleString('en-IN')}
                  </Text>
                  <View style={{ gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 9, color: '#9CA3AF' }}>Rent</Text>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#1F2937' }}>
                        ₹{selectedMonth.revenue.rentPayments.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 9, color: '#9CA3AF' }}>Advance</Text>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#1F2937' }}>
                        ₹{selectedMonth.revenue.advancePayments.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Expenses Card */}
                <Card style={{ flex: 1, padding: 14, backgroundColor: 'white', borderRadius: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      <Text style={{ fontSize: 16 }}>💸</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '600' }}>EXPENSES</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#EF4444', marginBottom: 8 }}>
                    ₹{selectedMonth.expenses.total.toLocaleString('en-IN')}
                  </Text>
                  <View style={{ gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 9, color: '#9CA3AF' }}>General</Text>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#1F2937' }}>
                        ₹{selectedMonth.expenses.generalExpenses.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 9, color: '#9CA3AF' }}>Salaries</Text>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#1F2937' }}>
                        ₹{selectedMonth.expenses.salaries.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

FinancialAnalytics.displayName = 'FinancialAnalytics';
