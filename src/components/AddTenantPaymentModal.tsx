import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { DatePicker } from './DatePicker';
import { paymentService } from '@/services/payments/paymentService';

interface AddTenantPaymentModalProps {
  visible: boolean;
  tenantId: number;
  tenantName: string;
  roomId: number;
  bedId: number;
  pgId: number;
  rentAmount?: number;
  joiningDate?: string;
  lastPaymentStartDate?: string;
  lastPaymentEndDate?: string;
  previousPayments?: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { label: 'GPay', value: 'GPAY', icon: 'logo-google' },
  { label: 'PhonePe', value: 'PHONEPE', icon: 'phone-portrait-outline' },
  { label: 'Cash', value: 'CASH', icon: 'cash-outline' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER', icon: 'card-outline' },
];

const PAYMENT_STATUS = [
  { label: '✅ Paid', value: 'PAID', color: '#10B981', icon: 'checkmark-circle' },
  { label: '🔵 Partial', value: 'PARTIAL', color: '#3B82F6', icon: 'pie-chart' },
  { label: '⏳ Pending', value: 'PENDING', color: '#F59E0B', icon: 'time' },
  { label: '❌ Failed', value: 'FAILED', color: '#EF4444', icon: 'close-circle' },
];

const AddTenantPaymentModal: React.FC<AddTenantPaymentModalProps> = ({
  visible,
  tenantId,
  tenantName,
  roomId,
  bedId,
  pgId,
  rentAmount = 0,
  joiningDate,
  lastPaymentStartDate,
  lastPaymentEndDate,
  previousPayments = [],
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount_paid: '',
    actual_rent_amount: '',
    payment_date: '',
    payment_method: '',
    status: '',
    start_date: '',
    end_date: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set default actual rent amount when modal opens
    if (visible && rentAmount > 0) {
      setFormData(prev => ({
        ...prev,
        actual_rent_amount: rentAmount.toString(),
      }));
    }
  }, [visible, rentAmount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
      newErrors.amount_paid = 'Amount paid is required';
    }

    if (!formData.actual_rent_amount || parseFloat(formData.actual_rent_amount) <= 0) {
      newErrors.actual_rent_amount = 'Actual rent amount is required';
    }

    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Auto-calculate status based on amounts
    const amountPaid = parseFloat(formData.amount_paid);
    const actualAmount = parseFloat(formData.actual_rent_amount);
    
    let autoStatus: string;
    let autoStatusLabel: string;
    
    if (amountPaid >= actualAmount) {
      autoStatus = 'PAID';
      autoStatusLabel = '✅ Paid';
    } else if (amountPaid > 0) {
      autoStatus = 'PARTIAL';
      autoStatusLabel = '🔵 Partial';
    } else {
      autoStatus = 'PENDING';
      autoStatusLabel = '⏳ Pending';
    }

    // Show confirmation with auto-calculated status
    Alert.alert(
      'Confirm Payment Status',
      `Based on the amounts:\n\nAmount Paid: ₹${amountPaid}\nRent Amount: ₹${actualAmount}\n\nSuggested Status: ${autoStatusLabel}\n\nIs this correct?`,
      [
        {
          text: 'Change Status',
          onPress: () => {
            // Show manual selection dialog
            Alert.alert(
              'Select Payment Status',
              'Please select the payment status:',
              [
                ...PAYMENT_STATUS.map((statusOption) => ({
                  text: statusOption.label,
                  onPress: () => savePayment(statusOption.value),
                })),
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            );
          },
        },
        {
          text: 'Confirm',
          onPress: () => savePayment(autoStatus),
        },
      ]
    );
  };

  const savePayment = async (status: string) => {
    setLoading(true);
    try {
      const paymentData = {
        tenant_id: tenantId,
        pg_id: pgId,
        room_id: roomId,
        bed_id: bedId,
        amount_paid: parseFloat(formData.amount_paid),
        actual_rent_amount: parseFloat(formData.actual_rent_amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method as 'GPAY' | 'PHONEPE' | 'CASH' | 'BANK_TRANSFER',
        status: status as 'PAID' | 'PARTIAL' | 'PENDING' | 'FAILED' | 'REFUNDED',
        start_date: formData.start_date,
        end_date: formData.end_date,
        remarks: formData.remarks || undefined,
      };

      await paymentService.createTenantPayment(paymentData);
      
      Alert.alert('Success', 'Payment added successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount_paid: '',
      actual_rent_amount: '',
      payment_date: '',
      payment_method: '',
      status: '',
      start_date: '',
      end_date: '',
      remarks: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <TouchableOpacity
            style={{ flex: 0.1 }}
            activeOpacity={1}
            onPress={handleClose}
          />
          
          <View
            style={{
              flex: 0.9,
              backgroundColor: Theme.colors.canvas,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: Theme.colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: Theme.colors.text.primary,
                  }}
                >
                  Add Payment
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: Theme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  {tenantName}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Payment Info Card */}
            {(joiningDate || lastPaymentStartDate || lastPaymentEndDate) && (
              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: Theme.colors.background.blueLight,
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: Theme.colors.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: Theme.colors.primary,
                    marginBottom: 8,
                  }}
                >
                  📋 Payment Reference
                </Text>
                {joiningDate && (
                  <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, width: 100 }}>
                      Joining Date:
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                      {new Date(joiningDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
                {lastPaymentStartDate && lastPaymentEndDate && (
                  <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, width: 100 }}>
                      Last Payment:
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                      {new Date(lastPaymentStartDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                      {' - '}
                      {new Date(lastPaymentEndDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}

                {/* Previous Payments List */}
                {previousPayments && previousPayments.length > 0 && (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                    <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 6, fontWeight: '600' }}>
                      PREVIOUS PAYMENTS
                    </Text>
                    {previousPayments.slice(0, 3).map((prevPayment, index) => (
                      <View key={prevPayment.s_no || index} style={{ flexDirection: 'row', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, width: 100 }}>
                          {index === 0 ? 'Most Recent:' : `${index + 1} ago:`}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                            {prevPayment.start_date && prevPayment.end_date ? (
                              `${new Date(prevPayment.start_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                              })} - ${new Date(prevPayment.end_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}`
                            ) : (
                              'N/A'
                            )}
                          </Text>
                          <Text style={{ fontSize: 11, color: Theme.colors.text.secondary }}>
                            ₹{prevPayment.amount_paid?.toLocaleString('en-IN')} • {prevPayment.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Form */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Amount Paid */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Amount Paid <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: errors.amount_paid ? Theme.colors.danger : Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                  }}
                  placeholder="Enter amount"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  keyboardType="numeric"
                  value={formData.amount_paid}
                  onChangeText={(text) => setFormData({ ...formData, amount_paid: text })}
                />
                {errors.amount_paid && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.amount_paid}
                  </Text>
                )}
              </View>

              {/* Actual Rent Amount */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Actual Rent Amount <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: errors.actual_rent_amount ? Theme.colors.danger : Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                  }}
                  placeholder="Enter actual rent"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  keyboardType="numeric"
                  value={formData.actual_rent_amount}
                  onChangeText={(text) => setFormData({ ...formData, actual_rent_amount: text })}
                />
                {errors.actual_rent_amount && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.actual_rent_amount}
                  </Text>
                )}
              </View>

              {/* Payment Date */}
              <DatePicker
                label="Payment Date"
                value={formData.payment_date}
                onChange={(date: string) => setFormData({ ...formData, payment_date: date })}
                required
                error={errors.payment_date}
              />

              {/* Payment Period */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Payment Period <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <DatePicker
                      label="Start Date"
                      value={formData.start_date}
                      onChange={(date: string) => setFormData({ ...formData, start_date: date })}
                      required
                      error={errors.start_date}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <DatePicker
                      label="End Date"
                      value={formData.end_date}
                      onChange={(date: string) => setFormData({ ...formData, end_date: date })}
                      required
                      error={errors.end_date}
                    />
                  </View>
                </View>
              </View>

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
                      onPress={() => setFormData({ ...formData, payment_method: method.value })}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          formData.payment_method === method.value
                            ? Theme.colors.primary
                            : Theme.colors.border,
                        backgroundColor:
                          formData.payment_method === method.value
                            ? Theme.colors.background.blueLight
                            : Theme.colors.canvas,
                      }}
                    >
                      <Ionicons
                        name={method.icon as any}
                        size={18}
                        color={
                          formData.payment_method === method.value
                            ? Theme.colors.primary
                            : Theme.colors.text.secondary
                        }
                      />
                      <Text
                        style={{
                          marginLeft: 8,
                          fontSize: 14,
                          fontWeight: formData.payment_method === method.value ? '600' : '400',
                          color:
                            formData.payment_method === method.value
                              ? Theme.colors.primary
                              : Theme.colors.text.primary,
                        }}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Payment Status Note */}
              <View style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: Theme.colors.background.blueLight,
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: Theme.colors.primary,
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: Theme.colors.primary,
                  marginBottom: 4,
                }}>
                  ℹ️ Payment Status
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: Theme.colors.text.secondary,
                }}>
                  You will be asked to select the payment status when you add the payment.
                </Text>
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
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Add any notes..."
                  placeholderTextColor={Theme.colors.input.placeholder}
                  multiline
                  numberOfLines={3}
                  value={formData.remarks}
                  onChangeText={(text) => setFormData({ ...formData, remarks: text })}
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={{
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: Theme.colors.border,
              }}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: loading ? Theme.colors.button.disabled : Theme.colors.primary,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator color={Theme.colors.canvas} />
                ) : (
                  <Text
                    style={{
                      color: Theme.colors.canvas,
                      fontSize: 16,
                      fontWeight: '600',
                    }}
                  >
                    Add Payment
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

export default AddTenantPaymentModal;
