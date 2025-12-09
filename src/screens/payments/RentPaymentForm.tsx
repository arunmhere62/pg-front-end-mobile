import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../theme";
import { DatePicker } from "../../components/DatePicker";
import { SlideBottomModal } from "../../components/SlideBottomModal";
import { OptionSelector, Option } from "../../components/OptionSelector";
import { AmountInput } from "../../components/AmountInput";
import { paymentService } from "@/services/payments/paymentService";
import { getBedById } from "@/services/rooms/bedService";
import { pgLocationService } from "../../services/organization/pgLocationService";
import { showErrorAlert } from "@/utils/errorHandler";
import { calculateRentCycleDates, calculateNextRentCycleDates } from "@/utils/rentCycleCalculator";

interface RentPaymentFormProps {
  visible: boolean;
  mode: "add" | "edit"; // add or edit mode
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
  // For edit mode
  paymentId?: number;
  existingPayment?: any;
  onClose: () => void;
  onSuccess: () => void;
  onSave?: (id: number, data: any) => Promise<void>; // For edit mode
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

const RentPaymentForm: React.FC<RentPaymentFormProps> = ({
  visible,
  mode,
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
  paymentId,
  existingPayment,
  onClose,
  onSuccess,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchingBedPrice, setFetchingBedPrice] = useState(false);
  const [bedRentAmount, setBedRentAmount] = useState<number>(0);
  const [rentCycleData, setRentCycleData] = useState<{
    type: 'CALENDAR' | 'MIDMONTH';
    startDay: number;
    endDay: number;
  } | null>(null);
  const [hasExistingPayments, setHasExistingPayments] = useState(false);
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

  // Fetch bed details and PG location rent cycle data
  useEffect(() => {
    const fetchDetails = async () => {
      if (visible && bedId > 0) {
        try {
          setFetchingBedPrice(true);
          
          // Fetch bed price
          const bedResponse = await getBedById(bedId, {
            pg_id: pgId,
          });

          if (bedResponse.success && bedResponse.data?.bed_price) {
            const bedPrice = bedResponse.data.bed_price;
            setBedRentAmount(bedPrice);
            setFormData((prev) => ({
              ...prev,
              actual_rent_amount: bedPrice.toString(),
            }));
          } else if (rentAmount > 0) {
            setBedRentAmount(rentAmount);
            setFormData((prev) => ({
              ...prev,
              actual_rent_amount: rentAmount.toString(),
            }));
          }

          // Fetch PG location details for rent cycle data
          if (pgId > 0) {
            try {
              const pgResponse = await pgLocationService.getDetails(pgId);
              if (pgResponse.success && pgResponse.data) {
                const pgData = pgResponse.data;
                if (pgData.rent_cycle_type) {
                  let startDay = 1;
                  let endDay = 30;

                  // For MIDMONTH cycles, derive from tenant's joining date
                  if (pgData.rent_cycle_type === 'MIDMONTH' && joiningDate) {
                    const joiningDateObj = new Date(joiningDate);
                    startDay = joiningDateObj.getDate();
                    // End day is the day before start day in next month
                    endDay = startDay === 1 ? 30 : startDay - 1;
                  }

                  setRentCycleData({
                    type: pgData.rent_cycle_type as 'CALENDAR' | 'MIDMONTH',
                    startDay,
                    endDay,
                  });
                }
              }
            } catch (pgError) {
              console.error("Error fetching PG location details:", pgError);
            }
          }
        } catch (error) {
          console.error("Error fetching details:", error);
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

    fetchDetails();
  }, [visible, bedId, pgId, rentAmount]);

  // Load existing payment data for edit mode and check for previous payments
  useEffect(() => {
    if (mode === "edit" && existingPayment) {
      setFormData({
        amount_paid: existingPayment.amount_paid?.toString() || "",
        actual_rent_amount: existingPayment.actual_rent_amount?.toString() || "",
        payment_date: existingPayment.payment_date
          ? new Date(existingPayment.payment_date).toISOString().split("T")[0]
          : "",
        payment_method: existingPayment.payment_method || null,
        status: existingPayment.status || "",
        start_date: existingPayment.start_date
          ? new Date(existingPayment.start_date).toISOString().split("T")[0]
          : "",
        end_date: existingPayment.end_date
          ? new Date(existingPayment.end_date).toISOString().split("T")[0]
          : "",
        remarks: existingPayment.remarks || "",
      });
    } else if (mode === "add") {
      // Check if tenant has previous payments
      const hasPreviousPayments = previousPayments && previousPayments.length > 0;
      setHasExistingPayments(hasPreviousPayments);

      if (hasPreviousPayments && rentCycleData) {
        // Get the most recent payment
        const lastPayment = previousPayments[0];
        const lastEndDate = lastPayment.end_date
          ? new Date(lastPayment.end_date).toISOString().split("T")[0]
          : null;

        if (lastEndDate) {
          // Calculate next cycle dates using utility function
          const { startDate, endDate } = calculateNextRentCycleDates(
            lastEndDate,
            rentCycleData.type,
            rentCycleData.startDay,
            rentCycleData.endDay
          );

          // Auto-fill dates from previous payment
          setFormData({
            amount_paid: "",
            actual_rent_amount: bedRentAmount.toString(),
            payment_date: new Date().toISOString().split("T")[0],
            payment_method: null,
            status: "",
            start_date: startDate,
            end_date: endDate,
            remarks: "",
          });
        } else {
          // No previous end date, reset form
          setFormData({
            amount_paid: "",
            actual_rent_amount: bedRentAmount.toString(),
            payment_date: new Date().toISOString().split("T")[0],
            payment_method: null,
            status: "",
            start_date: "",
            end_date: "",
            remarks: "",
          });
        }
      } else {
        // No previous payments, reset form
        setFormData({
          amount_paid: "",
          actual_rent_amount: bedRentAmount.toString(),
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: null,
          status: "",
          start_date: "",
          end_date: "",
          remarks: "",
        });
      }
    }
  }, [mode, existingPayment, visible, previousPayments, rentCycleData, bedRentAmount]);


  const handleAutoFillDates = () => {
    if (!rentCycleData) {
      Alert.alert(
        "No Rent Cycle Data",
        "PG location rent cycle data not available. Please try again."
      );
      return;
    }

    const { startDate, endDate } = calculateRentCycleDates(
      rentCycleData.type,
      rentCycleData.startDay,
      rentCycleData.endDay
    );

    setFormData((prev) => ({
      ...prev,
      start_date: startDate,
      end_date: endDate,
    }));

    Alert.alert(
      "Dates Auto-filled",
      `Start: ${new Date(startDate).toLocaleDateString("en-IN")}\nEnd: ${new Date(endDate).toLocaleDateString("en-IN")}`
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
      newErrors.amount_paid = "Amount paid is required";
    }

    // Check if amount paid exceeds actual rent amount
    if (formData.amount_paid && formData.actual_rent_amount) {
      const amountPaid = parseFloat(formData.amount_paid);
      const actualAmount = parseFloat(formData.actual_rent_amount);
      
      if (amountPaid > actualAmount) {
        newErrors.amount_paid = `Amount paid cannot exceed ₹${actualAmount.toLocaleString("en-IN")}`;
      }
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

    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = "End date must be after start date";
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

    Alert.alert(
      "Confirm Payment Status",
      `Based on the amounts:\n\nAmount Paid: ₹${amountPaid.toLocaleString("en-IN")}\nRent Amount: ₹${actualAmount.toLocaleString("en-IN")}\n\nSuggested Status: ${autoStatusLabel}\n\nIs this correct?`,
      [
        {
          text: "Change Status",
          onPress: () => {
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
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const savePayment = async (status: string) => {
    try {
      setLoading(true);

      if (mode === "add") {
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
          status: status as "PAID" | "PARTIAL" | "PENDING" | "FAILED",
          start_date: formData.start_date,
          end_date: formData.end_date,
          remarks: formData.remarks || undefined,
        };

        await paymentService.createTenantPayment(paymentData);
        Alert.alert("Success", "Payment added successfully");
      } else if (mode === "edit" && paymentId && onSave) {
        const updateData = {
          amount_paid: parseFloat(formData.amount_paid),
          actual_rent_amount: parseFloat(formData.actual_rent_amount),
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          status: status,
          start_date: formData.start_date,
          end_date: formData.end_date,
          remarks: formData.remarks || undefined,
        };

        await onSave(paymentId, updateData);
        Alert.alert("Success", "Payment updated successfully");
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      showErrorAlert(error, 'Error saving payment');
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
      title={mode === "add" ? "Add Payment" : "Edit Payment"}
      subtitle={tenantName}
      onSubmit={handleSubmit}
      submitLabel={mode === "add" ? "Add Payment" : "Update Payment"}
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

        {/* Payment Period - Start and End Date */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: Theme.colors.text.primary,
              }}
            >
              Payment Period <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            {!hasExistingPayments && rentCycleData && (
              <TouchableOpacity
                onPress={handleAutoFillDates}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: Theme.colors.primary,
                  borderRadius: 6,
                  gap: 4,
                }}
              >
                <Ionicons name="flash" size={14} color="#fff" />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  Auto-fill
                </Text>
              </TouchableOpacity>
            )}
            {hasExistingPayments && (
              <Text
                style={{
                  fontSize: 11,
                  color: Theme.colors.primary,
                  fontWeight: "600",
                }}
              >
                Auto-filled from last payment
              </Text>
            )}
          </View>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(date: string) => {
                if (!hasExistingPayments) {
                  setFormData({ ...formData, start_date: date });
                }
              }}
              required
              error={errors.start_date}
              disabled={hasExistingPayments}
            />
          </View>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <DatePicker
              label="End Date"
              value={formData.end_date}
              onChange={(date: string) => {
                if (!hasExistingPayments) {
                  setFormData({ ...formData, end_date: date });
                }
              }}
              required
              error={errors.end_date}
              disabled={hasExistingPayments}
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
            Payment status will be automatically calculated based on the amount paid vs rent amount.
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

export default RentPaymentForm;
