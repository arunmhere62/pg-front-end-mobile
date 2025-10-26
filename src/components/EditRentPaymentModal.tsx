import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { Payment } from '../types';
import { DatePicker } from './DatePicker';

interface EditRentPaymentModalProps {
  visible: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSave: (id: number, data: Partial<Payment>) => Promise<void>;
}

const PAYMENT_METHODS = [
  { label: 'GPay', value: 'GPAY', icon: 'logo-google' },
  { label: 'PhonePe', value: 'PHONEPE', icon: 'phone-portrait-outline' },
  { label: 'Cash', value: 'CASH', icon: 'cash-outline' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER', icon: 'card-outline' },
];

const RENT_PAYMENT_STATUSES = [
  { label: 'Paid', value: 'PAID', color: Theme.colors.secondary },
  { label: 'Pending', value: 'PENDING', color: Theme.colors.warning },
  { label: 'Overdue', value: 'OVERDUE', color: Theme.colors.danger },
  { label: 'Cancelled', value: 'CANCELLED', color: Theme.colors.text.tertiary },
];

export const EditRentPaymentModal: React.FC<EditRentPaymentModalProps> = ({
  visible,
  payment,
  onClose,
  onSave,
}) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [actualRentAmount, setActualRentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [status, setStatus] = useState('PENDING');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (payment) {
      setAmountPaid(payment.amount_paid?.toString() || '');
      setActualRentAmount(payment.actual_rent_amount?.toString() || '');
      setPaymentDate(payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : '');
      setStartDate(payment.start_date ? new Date(payment.start_date).toISOString().split('T')[0] : '');
      setEndDate(payment.end_date ? new Date(payment.end_date).toISOString().split('T')[0] : '');
      setPaymentMethod((payment.payment_method as string) || 'CASH');
      setStatus((payment.status as string) || 'PENDING');
      setRemarks(payment.remarks || '');
    }
  }, [payment]);

  const validate = () => {
    const newErrors: any = {};

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      newErrors.amountPaid = 'Valid amount is required';
    }

    if (!actualRentAmount || parseFloat(actualRentAmount) <= 0) {
      newErrors.actualRentAmount = 'Valid rent amount is required';
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !payment) return;

    try {
      setLoading(true);
      await onSave(payment.s_no, {
        amount_paid: parseFloat(amountPaid),
        actual_rent_amount: parseFloat(actualRentAmount),
        payment_date: paymentDate,
        start_date: startDate,
        end_date: endDate,
        payment_method: paymentMethod as any,
        status: status as any,
        remarks: remarks.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error updating rent payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!payment) return null;

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
                  Edit Rent Payment
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: Theme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  {payment.tenants?.name} • {payment.rooms?.room_no}/{payment.beds?.bed_no}
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
                    borderColor: errors.amountPaid ? Theme.colors.danger : Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                  }}
                  placeholder="Enter amount"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  keyboardType="numeric"
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                />
                {errors.amountPaid && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.amountPaid}
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
                    borderColor: errors.actualRentAmount ? Theme.colors.danger : Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                  }}
                  placeholder="Enter actual rent"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  keyboardType="numeric"
                  value={actualRentAmount}
                  onChangeText={setActualRentAmount}
                />
                {errors.actualRentAmount && (
                  <Text style={{ color: Theme.colors.danger, fontSize: 12, marginTop: 4 }}>
                    {errors.actualRentAmount}
                  </Text>
                )}
              </View>

              {/* Payment Date */}
              <DatePicker
                label="Payment Date"
                value={paymentDate}
                onChange={(date: string) => setPaymentDate(date)}
                required
                error={errors.paymentDate}
              />

              {/* Payment Period - Start and End Date in One Row */}
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
                      value={startDate}
                      onChange={(date: string) => setStartDate(date)}
                      required
                      error={errors.startDate}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(date: string) => setEndDate(date)}
                      required
                      error={errors.endDate}
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
                      onPress={() => setPaymentMethod(method.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          paymentMethod === method.value
                            ? Theme.colors.primary
                            : Theme.colors.border,
                        backgroundColor:
                          paymentMethod === method.value
                            ? Theme.colors.background.blueLight
                            : Theme.colors.canvas,
                      }}
                    >
                      <Ionicons
                        name={method.icon as any}
                        size={18}
                        color={
                          paymentMethod === method.value
                            ? Theme.colors.primary
                            : Theme.colors.text.secondary
                        }
                      />
                      <Text
                        style={{
                          marginLeft: 8,
                          fontSize: 14,
                          fontWeight: paymentMethod === method.value ? '600' : '400',
                          color:
                            paymentMethod === method.value
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

              {/* Status */}
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
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {RENT_PAYMENT_STATUSES.map((statusOption) => (
                    <TouchableOpacity
                      key={statusOption.value}
                      onPress={() => setStatus(statusOption.value)}
                      style={{
                        flex: 1,
                        minWidth: '45%',
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          status === statusOption.value ? statusOption.color : Theme.colors.border,
                        backgroundColor:
                          status === statusOption.value
                            ? Theme.withOpacity(statusOption.color, 0.1)
                            : Theme.colors.canvas,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: status === statusOption.value ? '600' : '400',
                          color:
                            status === statusOption.value
                              ? statusOption.color
                              : Theme.colors.text.primary,
                        }}
                      >
                        {statusOption.label}
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
                  value={remarks}
                  onChangeText={setRemarks}
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
                onPress={handleSave}
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
                    Save Changes
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
