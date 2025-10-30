import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import employeeSalaryService, { EmployeeSalary, PaymentMethod } from '../services/employeeSalaryService';
import userService from '../services/userService';
import { DatePicker } from './DatePicker';
import { SearchableDropdown } from './SearchableDropdown';

interface AddEditEmployeeSalaryModalProps {
  visible: boolean;
  salary: EmployeeSalary | null;
  onClose: () => void;
  onSave: () => void;
}

const PAYMENT_METHODS = [
  { label: 'GPay', value: PaymentMethod.GPAY, icon: 'logo-google', color: '#4285F4' },
  { label: 'PhonePe', value: PaymentMethod.PHONEPE, icon: 'phone-portrait-outline', color: '#5F259F' },
  { label: 'Cash', value: PaymentMethod.CASH, icon: 'cash-outline', color: '#10B981' },
  { label: 'Bank Transfer', value: PaymentMethod.BANK_TRANSFER, icon: 'card-outline', color: '#F59E0B' },
];

export const AddEditEmployeeSalaryModal: React.FC<AddEditEmployeeSalaryModalProps> = ({
  visible,
  salary,
  onClose,
  onSave,
}) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [salaryAmount, setSalaryAmount] = useState('');
  const [month, setMonth] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Fetch employees when modal opens
  useEffect(() => {
    if (visible) {
      fetchEmployees();
      
      if (salary) {
        // Edit mode
        setSelectedEmployeeId(salary.user_id);
        setSalaryAmount(salary.salary_amount.toString());
        setMonth(salary.month.split('T')[0]);
        setPaidDate(salary.paid_date ? salary.paid_date.split('T')[0] : '');
        setPaymentMethod(salary.payment_method || null);
        setRemarks(salary.remarks || '');
      } else {
        // Add mode - set default month to current month
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setMonth(firstDayOfMonth.toISOString().split('T')[0]);
      }
    }
  }, [visible, salary]);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await userService.getUsers();
      console.log('Employees response:', response);
      
      if (response.success) {
        setEmployees(response.data || []);
      } else if (Array.isArray(response)) {
        setEmployees(response);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Failed to load employees list');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!selectedEmployeeId) {
      newErrors.employee = 'Please select an employee';
    }

    if (!salaryAmount.trim()) {
      newErrors.amount = 'Salary amount is required';
    } else if (isNaN(Number(salaryAmount)) || Number(salaryAmount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!month.trim()) {
      newErrors.month = 'Month is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('💾 Save button clicked');
    
    if (!validate()) {
      console.log('❌ Validation failed');
      return;
    }

    try {
      setLoading(true);

      const data: any = {
        salary_amount: Number(salaryAmount),
        paid_date: paidDate || undefined,
        payment_method: paymentMethod || undefined,
        remarks: remarks.trim() || undefined,
      };

      console.log('📤 Sending salary data:', data);

      if (salary) {
        // Update existing salary
        console.log('Updating salary ID:', salary.s_no);
        await employeeSalaryService.updateSalary(salary.s_no, data);
        Alert.alert('Success', 'Salary record updated successfully');
      } else {
        // Create new salary
        console.log('Creating new salary for employee:', selectedEmployeeId);
        const createData = {
          user_id: selectedEmployeeId!,
          month: month,
          ...data,
        };
        const response = await employeeSalaryService.createSalary(createData);
        console.log('✅ Salary created:', response);
        Alert.alert('Success', 'Salary record added successfully');
      }

      handleClose();
      onSave();
    } catch (error: any) {
      console.error('❌ Error saving salary:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save salary record');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployeeId(null);
    setSalaryAmount('');
    setMonth('');
    setPaidDate('');
    setPaymentMethod(null);
    setRemarks('');
    setErrors({});
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: Theme.colors.canvas,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90%',
              flex: 1,
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: Theme.colors.border,
              }}
            >
              <View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
                  {salary ? 'Edit Salary' : 'Add Salary'}
                </Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 4 }}>
                  {salary ? 'Update salary details' : 'Record a new salary payment'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {/* Employee Selection */}
              {salary ? (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: Theme.colors.text.primary,
                      marginBottom: 8,
                    }}
                  >
                    Employee <Text style={{ color: Theme.colors.danger }}>*</Text>
                  </Text>
                  <View
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor: Theme.colors.input.background,
                      borderWidth: 1,
                      borderColor: Theme.colors.input.border,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16, color: Theme.colors.text.primary }}>
                      {salary.users?.name || 'Unknown Employee'}
                    </Text>
                    <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginTop: 2 }}>
                      Cannot change employee in edit mode
                    </Text>
                  </View>
                </View>
              ) : (
                <SearchableDropdown
                  label="Employee"
                  placeholder="Select an employee"
                  items={employees.map(emp => ({
                    id: emp.s_no,
                    label: emp.name,
                    value: emp.s_no,
                  }))}
                  selectedValue={selectedEmployeeId}
                  onSelect={(item) => setSelectedEmployeeId(item.id)}
                  loading={loadingEmployees}
                  error={errors.employee}
                  required
                />
              )}

              {/* Salary Amount */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Salary Amount <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: errors.amount ? Theme.colors.danger : Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: '600', color: Theme.colors.text.secondary }}>₹</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      fontSize: 16,
                      color: Theme.colors.text.primary,
                    }}
                    placeholder="0.00"
                    placeholderTextColor={Theme.colors.input.placeholder}
                    keyboardType="decimal-pad"
                    value={salaryAmount}
                    onChangeText={setSalaryAmount}
                  />
                </View>
                {errors.amount && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.amount}
                  </Text>
                )}
              </View>

              {/* Month */}
              <DatePicker
                label="Month"
                value={month}
                onChange={setMonth}
                error={errors.month}
                required
                maximumDate={new Date()}
                disabled={!!salary}
              />
              {salary && (
                <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginTop: -12, marginBottom: 16 }}>
                  Cannot change month in edit mode
                </Text>
              )}

              {/* Paid Date */}
              <DatePicker
                label="Paid Date (Optional)"
                value={paidDate}
                onChange={setPaidDate}
                maximumDate={new Date()}
              />

              {/* Payment Method */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Payment Method (Optional)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                      key={method.value}
                      onPress={() => setPaymentMethod(method.value)}
                      style={{
                        flex: 1,
                        minWidth: '45%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: paymentMethod === method.value ? method.color : Theme.colors.border,
                        backgroundColor: paymentMethod === method.value ? `${method.color}15` : Theme.colors.canvas,
                      }}
                    >
                      <Ionicons
                        name={method.icon as any}
                        size={20}
                        color={paymentMethod === method.value ? method.color : Theme.colors.text.secondary}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: paymentMethod === method.value ? '600' : '400',
                          color: paymentMethod === method.value ? method.color : Theme.colors.text.primary,
                          marginLeft: 8,
                        }}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Remarks */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Remarks (Optional)
                </Text>
                <TextInput
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: Theme.colors.input.border,
                    borderRadius: 8,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Add any additional notes"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  multiline
                  numberOfLines={3}
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: Theme.colors.border,
                backgroundColor: Theme.colors.canvas,
              }}
            >
              <TouchableOpacity
                onPress={handleClose}
                disabled={loading}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: Theme.colors.light,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: loading ? Theme.colors.light : Theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                    {salary ? 'Update' : 'Add'} Salary
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
