import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Theme } from "../../theme";
import { DatePicker } from "../../components/DatePicker";
import { SlideBottomModal } from "../../components/SlideBottomModal";
import { OptionSelector, Option } from "../../components/OptionSelector";
import { AmountInput } from "../../components/AmountInput";

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

const PAYMENT_METHODS: Option[] = [
  { label: "GPay", value: "GPAY", icon: "📱" },
  { label: "PhonePe", value: "PHONEPE", icon: "📱" },
  { label: "Cash", value: "CASH", icon: "💵" },
  { label: "Bank Transfer", value: "BANK_TRANSFER", icon: "🏦" },
];

const PAYMENT_STATUS: Option[] = [
  { label: "Paid", value: "PAID", icon: "✅" },
  { label: "Pending", value: "PENDING", icon: "⏳" },
  { label: "Failed", value: "FAILED", icon: "❌" },
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
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
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
    <SlideBottomModal
      visible={visible}
      onClose={handleClose}
      title="Add Refund Payment"
      subtitle={`${tenant.name} •  ${tenant.rooms?.room_no} •  ${tenant.beds?.bed_no}`}
      onSubmit={handleSave}
      submitLabel="Save Refund"
      cancelLabel="Cancel"
      isLoading={loading}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <AmountInput
          label="Refund Amount"
          value={amountPaid}
          onChangeText={setAmountPaid}
          error={""}
          required
          containerStyle={{ marginBottom: 16 }}
        />

        <AmountInput
          label="Actual Rent Amount"
          value={actualRentAmount}
          onChangeText={setActualRentAmount}
          error={""}
          containerStyle={{ marginBottom: 16 }}
        />

        <View style={{ marginBottom: 16 }}>
          <DatePicker
            label="Refund Date"
            value={paymentDate}
            onChange={(date: string) => setPaymentDate(date)}
            required
          />
        </View>

        <OptionSelector
          label="Payment Method"
          options={PAYMENT_METHODS}
          selectedValue={paymentMethod}
          onSelect={setPaymentMethod}
          required
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Payment Status */}
        <OptionSelector
          label="Status"
          options={PAYMENT_STATUS}
          selectedValue={status}
          onSelect={setStatus}
          required
          containerStyle={{ marginBottom: 16 }}
        />

        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: Theme.colors.text.primary,
              marginBottom: 6,
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
              paddingHorizontal: 12,
              paddingVertical: 12,
              fontSize: 14,
              color: Theme.colors.text.primary,
              minHeight: 80,
              textAlignVertical: "top",
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
    </SlideBottomModal>
  );
};
