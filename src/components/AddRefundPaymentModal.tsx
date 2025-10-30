import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { DatePicker } from './DatePicker';

interface AddRefundPaymentModalProps {
  visible: boolean;
  tenant: {
    s_no: number;
    name: string;
    room_id?: number;
    bed_id?: number;
    rooms?: {
      room_no: string;
      rent_price?: number;
    };
    beds?: {
      bed_no: string;
    };
  } | null;
  onClose: () => void;
  onSave: (data: {
    tenant_id: number;
    room_id: number;
    bed_id: number;
    amount_paid: number;
    actual_rent_amount?: number;
    payment_date: string;
    payment_method: string;
    status: string;
    remarks?: string;
  }) => Promise<void>;
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

export const AddRefundPaymentModal: React.FC<AddRefundPaymentModalProps> = ({
  visible,
  tenant,
  onClose,
  onSave,
}) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [actualRentAmount, setActualRentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset form when modal opens and set default actual rent amount
    if (visible) {
      setAmountPaid('');
      setActualRentAmount(tenant?.rooms?.rent_price ? tenant.rooms.rent_price.toString() : '');
      setPaymentDate('');
      setPaymentMethod('');
      setStatus('');
      setRemarks('');
    }
  }, [visible, tenant]);

  const handleSave = async () => {
    // Validation
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid refund amount');
      return;
    }

    if (!paymentDate) {
      Alert.alert('Validation Error', 'Please select refund date');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Validation Error', 'Please select a payment method');
      return;
    }

    if (!status) {
      Alert.alert('Validation Error', 'Please select a status');
      return;
    }

    if (!tenant?.room_id || !tenant?.bed_id) {
      Alert.alert('Error', 'Tenant room/bed information is missing');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        tenant_id: tenant.s_no,
        room_id: tenant.room_id,
        bed_id: tenant.bed_id,
        amount_paid: parseFloat(amountPaid),
        actual_rent_amount: actualRentAmount ? parseFloat(actualRentAmount) : parseFloat(amountPaid),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        status,
        remarks: remarks || undefined,
      });

      // Reset form
      setAmountPaid('');
      setActualRentAmount('');
      setPaymentDate('');
      setPaymentMethod('');
      setStatus('');
      setRemarks('');
      
      onClose();
    } catch (error: any) {
      console.error('Error creating refund payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create refund payment';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmountPaid('');
      setActualRentAmount('');
      setPaymentDate('');
      setPaymentMethod('');
      setStatus('');
      setRemarks('');
      onClose();
    }
  };

  if (!tenant) return null;

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
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '90%',
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
                borderBottomColor: '#E5E7EB',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: Theme.colors.text.primary,
                  }}
                >
                  🔄 Add Refund Payment
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: Theme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  {tenant.name} • Room {tenant.rooms?.room_no} • Bed {tenant.beds?.bed_no}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={28} color={Theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView
              style={{ maxHeight: '80%' }}
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Refund Amount */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Refund Amount <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <TextInput
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                  placeholder="Enter refund amount"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                  }}
                />
              </View>

              {/* Actual Rent Amount (Optional) */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: Theme.colors.text.primary,
                    marginBottom: 8,
                  }}
                >
                  Actual Rent Amount
                </Text>
                <TextInput
                  value={actualRentAmount}
                  onChangeText={setActualRentAmount}
                  placeholder="Enter actual rent amount"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  keyboardType="numeric"
                  style={{
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                  }}
                />
              </View>

              {/* Refund Date */}
              <DatePicker
                label="Refund Date"
                value={paymentDate}
                onChange={(date: string) => setPaymentDate(date)}
                required
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
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {PAYMENT_STATUS.map((statusOption) => (
                    <TouchableOpacity
                      key={statusOption.value}
                      onPress={() => setStatus(statusOption.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          status === statusOption.value
                            ? statusOption.color
                            : Theme.colors.border,
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
                  Remarks
                </Text>
                <TextInput
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Add any notes (optional)"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: Theme.colors.input.background,
                    borderWidth: 1,
                    borderColor: Theme.colors.input.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: Theme.colors.text.primary,
                    textAlignVertical: 'top',
                    minHeight: 80,
                  }}
                />
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: Theme.colors.border,
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
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: Theme.colors.text.primary,
                  }}
                >
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
                  backgroundColor: loading ? Theme.colors.light : '#F59E0B',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#fff',
                    }}
                  >
                    Save Refund
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
