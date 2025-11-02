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
import expenseService, { Expense, PaymentMethod } from '../services/expenses/expenseService';
import { DatePicker } from './DatePicker';

interface AddEditExpenseModalProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}

const PAYMENT_METHODS = [
  { label: 'GPay', value: PaymentMethod.GPAY, icon: 'logo-google', color: '#4285F4' },
  { label: 'PhonePe', value: PaymentMethod.PHONEPE, icon: 'phone-portrait-outline', color: '#5F259F' },
  { label: 'Cash', value: PaymentMethod.CASH, icon: 'cash-outline', color: '#10B981' },
  { label: 'Bank Transfer', value: PaymentMethod.BANK_TRANSFER, icon: 'card-outline', color: '#F59E0B' },
];

const EXPENSE_TYPES = [
  'Electricity Bill',
  'Water Bill',
  'Internet Bill',
  'Maintenance',
  'Repairs',
  'Groceries',
  'Cleaning',
  'Security',
  'Salary',
];

export const AddEditExpenseModal: React.FC<AddEditExpenseModalProps> = ({
  visible,
  expense,
  onClose,
  onSave,
}) => {
  const [expenseType, setExpenseType] = useState('');
  const [customExpenseType, setCustomExpenseType] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (visible) {
      if (expense) {
        // Edit mode
        const isCustomType = !EXPENSE_TYPES.includes(expense.expense_type);
        setExpenseType(isCustomType ? '' : expense.expense_type);
        setCustomExpenseType(isCustomType ? expense.expense_type : '');
        setShowCustomType(isCustomType);
        setAmount(expense.amount.toString());
        setPaidTo(expense.paid_to);
        setPaidDate(expense.paid_date.split('T')[0]);
        setPaymentMethod(expense.payment_method);
        setRemarks(expense.remarks || '');
      } else {
        // Add mode - set default date to today
        const today = new Date().toISOString().split('T')[0];
        setPaidDate(today);
        setShowCustomType(false);
      }
    }
  }, [visible, expense]);

  const validate = () => {
    const newErrors: any = {};

    const finalExpenseType = showCustomType ? customExpenseType : expenseType;
    if (!finalExpenseType.trim()) {
      newErrors.expenseType = 'Expense type is required';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!paidTo.trim()) {
      newErrors.paidTo = 'Paid to is required';
    }

    if (!paidDate.trim()) {
      newErrors.paidDate = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const finalExpenseType = showCustomType ? customExpenseType : expenseType;

      const data = {
        expense_type: finalExpenseType.trim(),
        amount: Number(amount),
        paid_to: paidTo.trim(),
        paid_date: paidDate,
        payment_method: paymentMethod,
        remarks: remarks.trim() || undefined,
      };


      if (expense) {
        // Update existing expense
        await expenseService.updateExpense(expense.s_no, data);
        Alert.alert('Success', 'Expense updated successfully');
      } else {
        // Create new expense
        const response = await expenseService.createExpense(data);
        Alert.alert('Success', 'Expense added successfully');
      }

      handleClose();
      onSave();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setExpenseType('');
    setCustomExpenseType('');
    setShowCustomType(false);
    setAmount('');
    setPaidTo('');
    setPaidDate('');
    setPaymentMethod(PaymentMethod.CASH);
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
                  {expense ? 'Edit Expense' : 'Add Expense'}
                </Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 4 }}>
                  {expense ? 'Update expense details' : 'Record a new expense'}
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
              {/* Expense Type */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Expense Type <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                
                {/* Toggle between predefined and custom */}
                <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCustomType(false);
                      setCustomExpenseType('');
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: !showCustomType ? Theme.colors.primary : Theme.colors.border,
                      backgroundColor: !showCustomType ? Theme.colors.background.blueLight : Theme.colors.canvas,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: !showCustomType ? '600' : '400',
                        color: !showCustomType ? Theme.colors.primary : Theme.colors.text.secondary,
                      }}
                    >
                      Predefined Types
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCustomType(true);
                      setExpenseType('');
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: showCustomType ? Theme.colors.primary : Theme.colors.border,
                      backgroundColor: showCustomType ? Theme.colors.background.blueLight : Theme.colors.canvas,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: showCustomType ? '600' : '400',
                        color: showCustomType ? Theme.colors.primary : Theme.colors.text.secondary,
                      }}
                    >
                      Custom Type
                    </Text>
                  </TouchableOpacity>
                </View>

                {!showCustomType ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {EXPENSE_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setExpenseType(type)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: expenseType === type ? Theme.colors.primary : Theme.colors.border,
                          backgroundColor: expenseType === type ? Theme.colors.background.blueLight : Theme.colors.canvas,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: expenseType === type ? '600' : '400',
                            color: expenseType === type ? Theme.colors.primary : Theme.colors.text.primary,
                          }}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <TextInput
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: Theme.colors.text.primary,
                      backgroundColor: Theme.colors.input.background,
                      borderWidth: 1,
                      borderColor: errors.expenseType ? Theme.colors.danger : Theme.colors.input.border,
                      borderRadius: 8,
                    }}
                    placeholder="Enter custom expense type (e.g., Gas Bill, Pest Control)"
                    placeholderTextColor={Theme.colors.input.placeholder}
                    value={customExpenseType}
                    onChangeText={setCustomExpenseType}
                    autoFocus
                  />
                )}
                {errors.expenseType && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.expenseType}
                  </Text>
                )}
              </View>

              {/* Amount */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Amount <Text style={{ color: Theme.colors.danger }}>*</Text>
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
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                {errors.amount && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.amount}
                  </Text>
                )}
              </View>

              {/* Paid To */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Paid To <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: errors.paidTo ? Theme.colors.danger : Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                  }}
                >
                  <Ionicons name="person-outline" size={20} color={Theme.colors.text.tertiary} />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      fontSize: 16,
                      color: Theme.colors.text.primary,
                    }}
                    placeholder="Enter person or company name"
                    placeholderTextColor={Theme.colors.input.placeholder}
                    value={paidTo}
                    onChangeText={setPaidTo}
                  />
                </View>
                {errors.paidTo && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.paidTo}
                  </Text>
                )}
              </View>

              {/* Date */}
              <DatePicker
                label="Date"
                value={paidDate}
                onChange={setPaidDate}
                error={errors.paidDate}
                required
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
                  Payment Method <Text style={{ color: Theme.colors.danger }}>*</Text>
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
                    {expense ? 'Update' : 'Add'} Expense
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
