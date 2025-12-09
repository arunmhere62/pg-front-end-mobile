import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Theme } from "../../theme";
import { DatePicker } from "../../components/DatePicker";
import { SlideBottomModal } from "../../components/SlideBottomModal";
import { OptionSelector, Option } from "../../components/OptionSelector";
import { AmountInput } from "../../components/AmountInput";
import { paymentService } from "@/services/payments/paymentService";
import { getBedById } from "@/services/rooms/bedService";
import { showErrorAlert } from "@/utils/errorHandler";

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

const PAYMENT_METHODS: Option[] = [
  { label: "GPay", value: "GPAY", icon: "📱" },
  { label: "PhonePe", value: "PHONEPE", icon: "📱" },
  { label: "Cash", value: "CASH", icon: "💵" },
  { label: "Bank Transfer", value: "BANK_TRANSFER", icon: "🏦" },
];

const PAYMENT_STATUS = [
  {
    label: "✅ Paid",
    value: "PAID",
    color: "#10B981",
    icon: "checkmark-circle",
  },
  {
    label: "🔵 Partial",
    value: "PARTIAL",
    color: "#3B82F6",
    icon: "pie-chart",
  },
  { label: "⏳ Pending", value: "PENDING", color: "#F59E0B", icon: "time" },
  {
    label: "❌ Failed",
    value: "FAILED",
    color: "#EF4444",
    icon: "close-circle",
  },
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
  const [fetchingBedPrice, setFetchingBedPrice] = useState(false);
  const [bedRentAmount, setBedRentAmount] = useState<number>(0);
  const [formData, setFormData] = useState({
    amount_paid: "",
    actual_rent_amount: "",
    payment_date: "",
    payment_method: null as string | null,
    status: "",
    start_date: "",
    end_date: "",
    remarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch bed details to get the actual rent amount
  useEffect(() => {
    const fetchBedDetails = async () => {
      if (visible && bedId > 0) {
        try {
          setFetchingBedPrice(true);
          const response = await getBedById(bedId, {
            pg_id: pgId,
          });
          
          if (response.success && response.data?.bed_price) {
            const bedPrice = response.data.bed_price;
            setBedRentAmount(bedPrice);
            setFormData((prev) => ({
              ...prev,
              actual_rent_amount: bedPrice.toString(),
            }));
          } else if (rentAmount > 0) {
            // Fallback to rentAmount if bed_price is not available
            setBedRentAmount(rentAmount);
            setFormData((prev) => ({
              ...prev,
              actual_rent_amount: rentAmount.toString(),
            }));
          }
        } catch (error) {
          showErrorAlert(error, 'Error fetching');
          if (rentAmount > 0) {
            setBedRentAmount(rentAmount);
            setFormData((prev) => ({
              ...prev,
              actual_rent_amount: rentAmount.toString(),
            }));
          }
        } finally {
          setFetchingBedPrice(false);
        }
      }
    };

    fetchBedDetails();
  }, [visible, bedId, pgId, rentAmount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
      newErrors.amount_paid = "Amount paid is required";
    }

    if (!formData.payment_date) {
      newErrors.payment_date = "Payment date is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (!formData.payment_method) {
      newErrors.payment_method = "Payment method is required";
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
      autoStatus = "PAID";
      autoStatusLabel = "✅ Paid";
    } else if (amountPaid > 0) {
      autoStatus = "PARTIAL";
      autoStatusLabel = "🔵 Partial";
    } else {
      autoStatus = "PENDING";
      autoStatusLabel = "⏳ Pending";
    }

    // Show confirmation with auto-calculated status
    Alert.alert(
      "Confirm Payment Status",
      `Based on the amounts:\n\nAmount Paid: ₹${amountPaid}\nRent Amount: ₹${actualAmount}\n\nSuggested Status: ${autoStatusLabel}\n\nIs this correct?`,
      [
        {
          text: "Change Status",
          onPress: () => {
            // Show manual selection dialog
            Alert.alert(
              "Select Payment Status",
              "Please select the payment status:",
              [
                ...PAYMENT_STATUS.map((statusOption) => ({
                  text: statusOption.label,
                  onPress: () => savePayment(statusOption.value),
                })),
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ]
            );
          },
        },
        {
          text: "Confirm",
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
        payment_method: formData.payment_method as
          | "GPAY"
          | "PHONEPE"
          | "CASH"
          | "BANK_TRANSFER",
        status: status as
          | "PAID"
          | "PARTIAL"
          | "PENDING"
          | "FAILED"
          | "REFUNDED",
        start_date: formData.start_date,
        end_date: formData.end_date,
        remarks: formData.remarks || undefined,
      };

      await paymentService.createTenantPayment(paymentData);

      Alert.alert("Success", "Payment added successfully");
      onSuccess();
      handleClose();
    } catch (error: any) {
      showErrorAlert(error, 'Error creating payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount_paid: "",
      actual_rent_amount: "",
      payment_date: "",
      payment_method: "",
      status: "",
      start_date: "",
      end_date: "",
      remarks: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <SlideBottomModal
      visible={visible}
      onClose={handleClose}
      title="Add Payment"
      subtitle={tenantName}
      onSubmit={handleSubmit}
      submitLabel="Add Payment"
      cancelLabel="Cancel"
      isLoading={loading}
    >
      {/* Payment Info Card */}
      {(joiningDate || lastPaymentStartDate || lastPaymentEndDate || bedRentAmount > 0) && (
        <View
          style={{
            marginHorizontal: 0,
            marginBottom: 16,
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
              fontWeight: "600",
              color: Theme.colors.primary,
              marginBottom: 8,
            }}
          >
            📋 Payment Reference
          </Text>
          {joiningDate && (
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Theme.colors.text.tertiary,
                  width: 100,
                }}
              >
                Joining Date:
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: Theme.colors.text.primary,
                }}
              >
                {new Date(joiningDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
          {lastPaymentStartDate && lastPaymentEndDate && (
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Theme.colors.text.tertiary,
                  width: 100,
                }}
              >
                Last Payment:
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: Theme.colors.text.primary,
                }}
              >
                {new Date(lastPaymentStartDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
                {" - "}
                {new Date(lastPaymentEndDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
          {bedRentAmount > 0 && (
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Theme.colors.text.tertiary,
                  width: 100,
                }}
              >
                Bed Rent Amount:
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: Theme.colors.primary,
                }}
              >
                {fetchingBedPrice ? (
                  <ActivityIndicator size="small" color={Theme.colors.primary} />
                ) : (
                  `₹${bedRentAmount.toLocaleString("en-IN")}`
                )}
              </Text>
            </View>
          )}

          {/* Previous Payments List */}
          {previousPayments && previousPayments.length > 0 && (
            <View
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: Theme.colors.text.tertiary,
                  marginBottom: 6,
                  fontWeight: "600",
                }}
              >
                PREVIOUS PAYMENTS
              </Text>
              {previousPayments.slice(0, 3).map((prevPayment, index) => (
                <View
                  key={prevPayment.s_no || index}
                  style={{ flexDirection: "row", marginBottom: 4 }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: Theme.colors.text.tertiary,
                      width: 100,
                    }}
                  >
                    {index === 0 ? "Most Recent:" : `${index + 1} ago:`}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: Theme.colors.text.primary,
                      }}
                    >
                      {prevPayment.start_date && prevPayment.end_date
                        ? `${new Date(
                            prevPayment.start_date
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })} - ${new Date(
                            prevPayment.end_date
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}`
                        : "N/A"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: Theme.colors.text.secondary,
                      }}
                    >
                      ₹{prevPayment.amount_paid?.toLocaleString("en-IN")} •{" "}
                      {prevPayment.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Form */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Amount Paid */}
        <AmountInput
          label="Amount Paid"
          value={formData.amount_paid}
          onChangeText={(text) =>
            setFormData({ ...formData, amount_paid: text })
          }
          error={errors.amount_paid}
          required
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Payment Date */}
        <View style={{ marginBottom: 16 }}>
          <DatePicker
            label="Payment Date"
            value={formData.payment_date}
            onChange={(date: string) =>
              setFormData({ ...formData, payment_date: date })
            }
            required
            error={errors.payment_date}
          />
        </View>

        {/* Payment Period - Start and End Date in One Row */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: Theme.colors.text.primary,
              marginBottom: 8,
            }}
          >
            Payment Period <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(date: string) =>
                setFormData({ ...formData, start_date: date })
              }
              required
              error={errors.start_date}
            />
          </View>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <DatePicker
              label="End Date"
              value={formData.end_date}
              onChange={(date: string) =>
                setFormData({ ...formData, end_date: date })
              }
              required
              error={errors.end_date}
            />
          </View>
        </View>

        {/* Payment Method */}
        <OptionSelector
          label="Payment Method"
          options={PAYMENT_METHODS}
          selectedValue={formData.payment_method}
          onSelect={(value) =>
            setFormData({ ...formData, payment_method: value })
          }
          required
          error={errors.payment_method}
          containerStyle={{ marginBottom: 16 }}
        />

        {/* Payment Status Note */}
        <View
          style={{
            marginBottom: 16,
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
              fontWeight: "600",
              color: Theme.colors.primary,
              marginBottom: 4,
            }}
          >
            ℹ️ Payment Status
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: Theme.colors.text.secondary,
            }}
          >
            You will be asked to select the payment status when you add the
            payment.
          </Text>
        </View>

        {/* Remarks */}
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
            value={formData.remarks}
            onChangeText={(text) => setFormData({ ...formData, remarks: text })}
          />
        </View>
      </ScrollView>
    </SlideBottomModal>
  );
};

export default AddTenantPaymentModal;
