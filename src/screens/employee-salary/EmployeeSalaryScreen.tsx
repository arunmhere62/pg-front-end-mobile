import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { CONTENT_COLOR } from '@/constant';
import employeeSalaryService, { EmployeeSalary, PaymentMethod } from '../../services/employeeSalaryService';
import { AddEditEmployeeSalaryModal } from '@/components/AddEditEmployeeSalaryModal';

interface EmployeeSalaryScreenProps {
  navigation: any;
}

export const EmployeeSalaryScreen: React.FC<EmployeeSalaryScreenProps> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<EmployeeSalary | null>(null);

  const fetchSalaries = useCallback(async () => {
    console.log('fetchSalaries called with PG ID:', selectedPGLocationId);
    
    if (!selectedPGLocationId) {
      setLoading(false);
      setRefreshing(false);
      console.log('❌ No PG Location selected');
      return;
    }

    try {
      setLoading(true);
      
      console.log('📡 Fetching salaries for PG ID:', selectedPGLocationId);
      const response = await employeeSalaryService.getSalaries(1, 50);
      console.log('✅ Salaries response:', response);
      
      if (response.success) {
        setSalaries(response.data);
        setTotalSalaries(response.pagination.total);
        console.log('📊 Loaded salaries count:', response.data.length);
      }
    } catch (error: any) {
      console.error('❌ Error fetching salaries:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load salaries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPGLocationId]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSalaries();
  };

  const handleAddSalary = () => {
    console.log('➕ Add Salary button clicked');
    setEditingSalary(null);
    setShowAddModal(true);
  };

  const handleEditSalary = (salary: EmployeeSalary) => {
    setEditingSalary(salary);
    setShowAddModal(true);
  };

  const handleSaveSalary = async () => {
    setShowAddModal(false);
    onRefresh();
  };

  const handleDeleteSalary = (salary: EmployeeSalary) => {
    Alert.alert(
      'Delete Salary Record',
      `Are you sure you want to delete this salary record of ₹${salary.salary_amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeeSalaryService.deleteSalary(salary.s_no);
              Alert.alert('Success', 'Salary record deleted successfully');
              onRefresh();
            } catch (error) {
              console.error('Error deleting salary:', error);
              Alert.alert('Error', 'Failed to delete salary record');
            }
          },
        },
      ]
    );
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.GPAY:
        return 'logo-google';
      case PaymentMethod.PHONEPE:
        return 'phone-portrait-outline';
      case PaymentMethod.CASH:
        return 'cash-outline';
      case PaymentMethod.BANK_TRANSFER:
        return 'card-outline';
      default:
        return 'wallet-outline';
    }
  };

  const getPaymentMethodColor = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.GPAY:
        return '#4285F4';
      case PaymentMethod.PHONEPE:
        return '#5F259F';
      case PaymentMethod.CASH:
        return '#10B981';
      case PaymentMethod.BANK_TRANSFER:
        return '#F59E0B';
      default:
        return Theme.colors.text.secondary;
    }
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Show error if no PG Location selected
  if (!selectedPGLocationId && !loading) {
    return (
      <ScreenLayout backgroundColor={Theme.colors.background.blue}>
        <ScreenHeader
          title="Employee Salaries"
          showBackButton
          onBackPress={() => navigation.goBack()}
          backgroundColor={Theme.colors.background.blue}
          syncMobileHeaderBg={true}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CONTENT_COLOR, padding: 40 }}>
          <Ionicons name="alert-circle-outline" size={64} color={Theme.colors.text.tertiary} />
          <Text style={{ fontSize: 16, color: Theme.colors.text.secondary, marginTop: 16, textAlign: 'center' }}>
            No PG Location Found
          </Text>
          <Text style={{ fontSize: 14, color: Theme.colors.text.tertiary, marginTop: 8, textAlign: 'center' }}>
            Please select a PG location from the dashboard
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (loading && salaries.length === 0) {
    return (
      <ScreenLayout backgroundColor={Theme.colors.background.blue}>
        <ScreenHeader
          title="Employee Salaries"
          showBackButton
          onBackPress={() => navigation.goBack()}
          backgroundColor={Theme.colors.background.blue}
          syncMobileHeaderBg={true}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CONTENT_COLOR }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>Loading salaries...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader
        title="Employee Salaries"
        showBackButton
        onBackPress={() => navigation.goBack()}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
      />
      
      <View style={{ flex: 1, backgroundColor: CONTENT_COLOR }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Summary Card */}
          <Card style={{ margin: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginBottom: 4 }}>
                  Total Records
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: Theme.colors.text.primary }}>
                  {totalSalaries}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginBottom: 4 }}>
                  Total Amount
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '600', color: Theme.colors.primary }}>
                  {formatAmount(salaries.reduce((sum, sal) => sum + Number(sal.salary_amount), 0))}
                </Text>
              </View>
            </View>
          </Card>

          {/* Salaries List */}
          {salaries.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={64} color={Theme.colors.text.tertiary} />
              <Text style={{ fontSize: 16, color: Theme.colors.text.secondary, marginTop: 16, textAlign: 'center' }}>
                No salary records found
              </Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.tertiary, marginTop: 8, textAlign: 'center' }}>
                Add salary records from your admin panel
              </Text>
            </View>
          ) : (
            salaries.map((salary) => (
              <Card key={salary.s_no} style={{ marginHorizontal: 16, marginBottom: 12, padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 4 }}>
                      {salary.users?.name || 'Unknown Employee'}
                    </Text>
                    <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>
                      📅 {formatMonth(salary.month)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: Theme.colors.primary }}>
                    {formatAmount(Number(salary.salary_amount))}
                  </Text>
                </View>

                {salary.paid_date && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    {salary.payment_method && (
                      <>
                        <Ionicons
                          name={getPaymentMethodIcon(salary.payment_method) as any}
                          size={16}
                          color={getPaymentMethodColor(salary.payment_method)}
                        />
                        <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginLeft: 6 }}>
                          {salary.payment_method}
                        </Text>
                        <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary, marginLeft: 12 }}>
                          • Paid on {formatDate(salary.paid_date)}
                        </Text>
                      </>
                    )}
                  </View>
                )}

                {salary.remarks && (
                  <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary, fontStyle: 'italic', marginBottom: 8 }}>
                    {salary.remarks}
                  </Text>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleEditSalary(salary)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: Theme.colors.background.blueLight,
                    }}
                  >
                    <Ionicons name="create-outline" size={16} color={Theme.colors.primary} />
                    <Text style={{ fontSize: 13, fontWeight: '500', color: Theme.colors.primary, marginLeft: 4 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteSalary(salary)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: '#FEE2E2',
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color={Theme.colors.danger} />
                    <Text style={{ fontSize: 13, fontWeight: '500', color: Theme.colors.danger, marginLeft: 4 }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          {loading && salaries.length > 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            </View>
          )}
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          onPress={handleAddSalary}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add/Edit Modal */}
      <AddEditEmployeeSalaryModal
        visible={showAddModal}
        salary={editingSalary}
        onClose={() => {
          setShowAddModal(false);
          setEditingSalary(null);
        }}
        onSave={handleSaveSalary}
      />
    </ScreenLayout>
  );
};
