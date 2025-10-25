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
import { paymentService } from '../services/paymentService';

interface AddTenantPaymentModalProps {
  visible: boolean;
  tenantId: number;
  tenantName: string;
  roomId: number;
  bedId: number;
  pgId: number;
  rentAmount?: number;
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
  { label: 'Paid', value: 'PAID', color: Theme.colors.secondary },
  { label: 'Pending', value: 'PENDING', color: Theme.colors.warning },
  { label: 'Failed', value: 'FAILED', color: Theme.colors.danger },
];

const AddTenantPaymentModal: React.FC<AddTenantPaymentModalProps> = ({
  visible,
  tenantId,
  tenantName,
  roomId,
  bedId,
  pgId,
  rentAmount = 0,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount_paid: rentAmount.toString(),
    actual_rent_amount: rentAmount.toString(),
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH',
    status: 'PAID',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      // Calculate end date (30 days from start date)
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      
      setFormData(prev => ({
        ...prev,
        end_date: endDate.toISOString().split('T')[0],
      }));
    }
  }, [visible, formData.start_date]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

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
        status: formData.status as 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED',
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
      amount_paid: rentAmount.toString(),
      actual_rent_amount: rentAmount.toString(),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'CASH',
      status: 'PAID',
      start_date: new Date().toISOString().split('T')[0],
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

              {/* Payment Status */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Status <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {PAYMENT_STATUS.map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      onPress={() => setFormData({ ...formData, status: status.value })}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          formData.status === status.value ? status.color : Theme.colors.border,
                        backgroundColor:
                          formData.status === status.value
                            ? Theme.withOpacity(status.color, 0.1)
                            : Theme.colors.canvas,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: formData.status === status.value ? '600' : '400',
                          color:
                            formData.status === status.value
                              ? status.color
                              : Theme.colors.text.primary,
                        }}
                      >
                        {status.label}
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
