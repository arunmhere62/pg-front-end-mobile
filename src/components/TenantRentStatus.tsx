import React, { memo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { Theme } from '../theme';
import { pgLocationService } from '../services/organization/pgLocationService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';

// Types
interface MissingPayment {
  expected_date: string;
  month: string;
  year: number;
  amount: number;
  status: string; // Added status field
}

interface PartialPayment {
  payment_id: number;
  payment_date: string;
  month: string;
  year: number;
  actual_rent: number;
  amount_paid: number;
  due_amount: number;
  status: string;
  is_fully_pending?: boolean; // Added to identify fully pending payments
}

interface LatestPayment {
  payment_date: string;
  status: string;
  actual_rent: number;
  amount_paid: number;
  due_amount: number;
  rent_period: {
    start_date: string;
    end_date: string;
  };
}

interface TenantRentStatusItem {
  id: number;
  tenant_id: string;
  name: string;
  phone: string;
  email: string;
  room_no: string;
  bed_no: string;
  check_in_date: string;
  missing_payments: MissingPayment[];
  partial_payments: PartialPayment[];
  current_payment_status: string;
  overall_status: string; // Added overall payment status
  total_due_amount: number;
  missing_months_count: number; // Added count of missing months
  partial_months_count: number; // Added count of partial payment months
  latest_payment: LatestPayment | null;
}

interface TenantRentStatusProps {
  pgId: number;
  preloadedData?: TenantRentStatusItem[];
  isLoading?: boolean;
}

const TenantRentStatusComponent: React.FC<TenantRentStatusProps> = ({ pgId, preloadedData, isLoading }) => {
  const [loading, setLoading] = useState(isLoading !== undefined ? isLoading : true);
  const [tenants, setTenants] = useState<TenantRentStatusItem[]>(preloadedData || []);
  const [expandedTenantId, setExpandedTenantId] = useState<number | null>(null);
  // Use any type for navigation to avoid typing issues
  const navigation = useNavigation<any>();

  useEffect(() => {
    // If preloaded data is provided, use it
    if (preloadedData) {
      setTenants(preloadedData);
      setLoading(isLoading || false);
    } else if (pgId) {
      // Otherwise, load the data
      loadTenantRentStatus(pgId);
    }
  }, [pgId, preloadedData, isLoading]);

  const loadTenantRentStatus = async (pgId: number) => {
    try {
      setLoading(true);
      const response = await pgLocationService.getTenantRentPaymentStatus(pgId);
      if (response.success) {
        setTenants(response.data);
      }
    } catch (error) {
      console.error('Error loading tenant rent status:', error);
      Alert.alert('Error', 'Failed to load tenant rent payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantPress = (tenant: TenantRentStatusItem) => {
    // Toggle expanded state
    setExpandedTenantId(expandedTenantId === tenant.id ? null : tenant.id);
  };

  const navigateToTenantDetails = (tenantId: number) => {
    // With any type, we can directly navigate
    navigation.navigate('TenantDetails', { tenantId });
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    // Remove any non-numeric characters
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=${formattedNumber}`);
  };

  const handleCollectPayment = (tenant: TenantRentStatusItem) => {
    // With any type, we can directly navigate
    navigation.navigate('Payments', {
      screen: 'AddPayment',
      params: { tenantId: tenant.id, tenantName: tenant.name },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#EF4444'; // Red
      case 'PARTIAL':
      case 'PARTIAL_PAYMENTS':
        return '#F59E0B'; // Amber
      case 'MISSING_PAYMENTS':
        return '#DC2626'; // Dark Red
      case 'NO_PAYMENT':
        return '#6366F1'; // Indigo
      case 'MISSING':
        return '#DC2626'; // Dark Red
      case 'PAID':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'MISSING_PAYMENTS':
        return 'Missing Payments';
      case 'PARTIAL_PAYMENTS':
        return 'Partial Payments';
      case 'PENDING':
        return 'Pending';
      case 'NO_PAYMENT':
        return 'No Payment';
      case 'PAID':
        return 'Paid';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const renderTenantCard = ({ item }: { item: TenantRentStatusItem }) => {
    const isExpanded = expandedTenantId === item.id;
    
    return (
      <Card 
        style={[
          styles.tenantCard, 
          { borderLeftColor: getStatusColor(item.current_payment_status) }
        ]}
      >
        {/* Card Header */}
        <TouchableOpacity 
          onPress={() => handleTenantPress(item)}
          activeOpacity={0.7}
          style={styles.cardHeader}
        >
          <View style={styles.tenantInfo}>
            <Text style={styles.tenantName}>{item.name}</Text>
            <Text style={styles.tenantId}>{item.tenant_id}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.overall_status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.overall_status) }]}>
                {getStatusText(item.overall_status)}
              </Text>
            </View>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={18} 
              color="#6B7280" 
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Room & Bed</Text>
            <Text style={styles.infoValue}>{item.room_no} • {item.bed_no}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Due</Text>
            <Text style={styles.dueAmount}>{formatCurrency(item.total_due_amount)}</Text>
          </View>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Divider */}
            <View style={styles.divider} />

            {/* Payment Summary */}
            <View style={styles.paymentSummary}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Missing Payments</Text>
                  <Text style={[styles.summaryValue, item.missing_months_count > 0 ? styles.dueAmount : {}]}>
                    {item.missing_months_count}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Partial Payments</Text>
                  <Text style={[styles.summaryValue, item.partial_months_count > 0 ? { color: '#F59E0B' } : {}]}>
                    {item.partial_months_count}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Due</Text>
                  <Text style={[styles.summaryValue, styles.dueAmount]}>{formatCurrency(item.total_due_amount)}</Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Overall Status</Text>
                  <Text style={[styles.summaryValue, { color: getStatusColor(item.overall_status) }]}>
                    {getStatusText(item.overall_status)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Missing Payments */}
            {item.missing_payments.length > 0 && (
              <View style={styles.paymentSection}>
                <Text style={styles.sectionTitle}>Missing Payments</Text>
                {item.missing_payments.map((payment, index) => (
                  <View key={`missing-${index}`} style={styles.paymentItem}>
                    <View style={styles.paymentMonth}>
                      <Text style={styles.monthText}>{payment.month}</Text>
                      <Text style={styles.yearText}>{payment.year}</Text>
                    </View>
                    <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Partial Payments */}
            {item.partial_payments.length > 0 && (
              <View style={styles.paymentSection}>
                <Text style={styles.sectionTitle}>Partial Payments</Text>
                {item.partial_payments.map((payment) => (
                  <View key={`partial-${payment.payment_id}`} style={styles.paymentItem}>
                    <View style={styles.paymentMonth}>
                      <Text style={styles.monthText}>{payment.month}</Text>
                      <Text style={styles.yearText}>{payment.year}</Text>
                    </View>
                    <View style={styles.partialAmounts}>
                      <Text style={styles.paidAmount}>Paid: {formatCurrency(payment.amount_paid)}</Text>
                      <Text style={styles.remainingAmount}>Due: {formatCurrency(payment.due_amount)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Latest Payment */}
            {item.latest_payment && (
              <View style={styles.paymentSection}>
                <Text style={styles.sectionTitle}>Latest Payment</Text>
                <View style={styles.latestPayment}>
                  <View style={styles.latestPaymentRow}>
                    <Text style={styles.latestPaymentLabel}>Date:</Text>
                    <Text style={styles.latestPaymentValue}>{formatDate(item.latest_payment.payment_date)}</Text>
                  </View>
                  <View style={styles.latestPaymentRow}>
                    <Text style={styles.latestPaymentLabel}>Status:</Text>
                    <Text style={[
                      styles.latestPaymentValue, 
                      { color: getStatusColor(item.latest_payment.status) }
                    ]}>
                      {item.latest_payment.status}
                    </Text>
                  </View>
                  <View style={styles.latestPaymentRow}>
                    <Text style={styles.latestPaymentLabel}>Amount:</Text>
                    <Text style={styles.latestPaymentValue}>{formatCurrency(item.latest_payment.actual_rent)}</Text>
                  </View>
                  <View style={styles.latestPaymentRow}>
                    <Text style={styles.latestPaymentLabel}>Paid:</Text>
                    <Text style={styles.latestPaymentValue}>{formatCurrency(item.latest_payment.amount_paid)}</Text>
                  </View>
                  {item.latest_payment.status === 'PARTIAL' && (
                    <View style={styles.latestPaymentRow}>
                      <Text style={styles.latestPaymentLabel}>Due:</Text>
                      <Text style={[styles.latestPaymentValue, styles.dueAmount]}>
                        {formatCurrency(item.latest_payment.due_amount)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.collectButton]} 
                onPress={() => handleCollectPayment(item)}
              >
                <Ionicons name="cash" size={16} color="white" />
                <Text style={styles.actionButtonText}>Collect Payment</Text>
              </TouchableOpacity>
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.detailsButton]} 
                  onPress={() => navigateToTenantDetails(item.id)}
                >
                  <Ionicons name="person" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.callButton]} 
                  onPress={() => handleCall(item.phone)}
                >
                  <Ionicons name="call" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.whatsappButton]} 
                  onPress={() => handleWhatsApp(item.phone)}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="white" />
                  <Text style={styles.actionButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </View>
      <Text style={styles.emptyTitle}>All Payments Up to Date!</Text>
      <Text style={styles.emptyDescription}>
        There are no tenants with pending or partial rent payments.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading payment status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tenant Rent Status</Text>
        {tenants.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{tenants.length}</Text>
          </View>
        )}
      </View>

      {tenants.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={tenants}
          renderItem={renderTenantCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }} // Ensure FlatList takes full available space
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    height: '100%', // Ensure it takes full height
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  countBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Theme.colors.text.secondary,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  tenantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  tenantId: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  basicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: Theme.colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  dueAmount: {
    color: '#EF4444',
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  paymentSummary: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  summaryItem: {
    width: '50%',
    paddingVertical: 8,
    paddingRight: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  paymentSection: {
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentMonth: {
    width: 100,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  yearText: {
    fontSize: 10,
    color: Theme.colors.text.secondary,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  partialAmounts: {
    alignItems: 'flex-end',
  },
  paidAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  remainingAmount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 2,
  },
  latestPayment: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  latestPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  latestPaymentLabel: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  latestPaymentValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  actions: {
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  collectButton: {
    backgroundColor: Theme.colors.primary,
    marginBottom: 8,
  },
  detailsButton: {
    backgroundColor: '#6B7280',
    flex: 1,
    marginRight: 4,
  },
  callButton: {
    backgroundColor: '#10B981',
    flex: 1,
    marginHorizontal: 4,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flex: 1,
    marginLeft: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export const TenantRentStatus = memo(TenantRentStatusComponent);
