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

interface AddAdvancePaymentModalProps {
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

export const AddAdvancePaymentModal: React.FC<AddAdvancePaymentModalProps> = ({
  visible,
  tenant,
  onClose,
  onSave,
}) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [actualRentAmount, setActualRentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [status, setStatus] = useState('PAID');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && tenant) {
      // Set default values
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setPaymentDate(formattedDate);
      
      // Pre-fill with room rent if available
      if (tenant.rooms?.rent_price) {
        setAmountPaid(tenant.rooms.rent_price.toString());
        setActualRentAmount(tenant.rooms.rent_price.toString());
      }
    }
  }, [visible, tenant]);

  const handleSave = async () => {
    // Validation
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }

    if (!paymentDate) {
      Alert.alert('Validation Error', 'Please select payment date');
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
      setPaymentMethod('CASH');
      setStatus('PAID');
      setRemarks('');
      
      onClose();
    } catch (error: any) {
      console.error('Error creating advance payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create advance payment';
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
      setPaymentMethod('CASH');
      setStatus('PAID');
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
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View
            style={{
              backgroundColor: Theme.colors.canvas,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
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
                borderBottomColor: Theme.colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
                  Add Advance Payment
                </Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 4 }}>
                  {tenant.name} • Room {tenant.rooms?.room_no} • Bed {tenant.beds?.bed_no}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                disabled={loading}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: Theme.colors.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView
              style={{ maxHeight: 500 }}
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
                    borderColor: Theme.colors.input.border,
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
                  Actual Rent Amount
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
                  }}
                  placeholder="Enter actual rent"
                  placeholderTextColor={Theme.colors.input.placeholder}
                  keyboardType="numeric"
                  value={actualRentAmount}
                  onChangeText={setActualRentAmount}
                />
              </View>

              {/* Payment Date */}
              <DatePicker
                label="Payment Date"
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
                  Remarks
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
                    textAlignVertical: 'top',
                    minHeight: 80,
                  }}
                  placeholder="Add any notes (optional)"
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
                    Save Payment
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
