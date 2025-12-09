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

// Helper function to parse date string safely (handles multiple formats)
const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();

  // Try ISO format first (YYYY-MM-DDTHH:mm:ss.sssZ or similar)
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try YYYY-MM-DD format
  if (dateString.includes('-') && !dateString.includes('T')) {
    const [year, month, day] = dateString.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }

  // Try DD MMM YYYY format (e.g., "08 Dec 2025")
  if (dateString.includes(' ')) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback: try parsing as is
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get calendar month dates (1st to last day)
const getCalendarMonthDates = (dateString: string): { start: string; end: string } => {
  try {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date parsed:", dateString);
      return { start: "", end: "" };
    }

    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const result = {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };

    console.log("Calendar dates calculated:", { input: dateString, ...result });
    return result;
  } catch (error) {
    console.error("Error calculating calendar dates:", error);
    return { start: "", end: "" };
  }
};

// Helper function to get midmonth dates (same day to same day next month - 1)
const getMidmonthDates = (dateString: string): { start: string; end: string } => {
  try {
    // Parse the input date string to extract year, month, day
    let year: number, month: number, day: number;
    
    if (dateString.includes('-')) {
      // YYYY-MM-DD format
      const [y, m, d] = dateString.split('-').map(Number);
      year = y;
      month = m;
      day = d;
    } else {
      // Fallback to Date parsing
      const date = parseDate(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date parsed:", dateString);
        return { start: "", end: "" };
      }
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
    }

    // Start date is the input date
    const startMonth = String(month).padStart(2, '0');
    const startDay = String(day).padStart(2, '0');
    const startDateStr = `${year}-${startMonth}-${startDay}`;

    // Calculate end date: same day next month - 1
    let endMonth = month + 1;
    let endYear = year;
    if (endMonth > 12) {
      endMonth = 1;
      endYear = year + 1;
    }
    
    // Create a temporary date to handle day overflow
    const tempDate = new Date(endYear, endMonth - 1, day);
    tempDate.setDate(tempDate.getDate() - 1);
    
    const endDateStr = formatDate(tempDate);

    const result = {
      start: startDateStr,
      end: endDateStr,
    };

    console.log("Midmonth dates calculated:", { input: dateString, ...result });
    return result;
  } catch (error) {
    console.error("Error calculating midmonth dates:", error);
    return { start: "", end: "" };
  }
};

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
                  setRentCycleData({
                    type: pgData.rent_cycle_type as 'CALENDAR' | 'MIDMONTH',
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
        // Get the payment with the latest end_date (most recent rent period)
        const lastPayment = previousPayments.reduce((latest, current) => {
          const latestEndDate = new Date(latest.end_date || 0).getTime();
          const currentEndDate = new Date(current.end_date || 0).getTime();
          return currentEndDate > latestEndDate ? current : latest;
        });
        const lastEndDate = lastPayment.end_date
          ? new Date(lastPayment.end_date).toISOString().split("T")[0]
          : null;

        if (lastEndDate) {
          // Calculate next cycle dates using utility function
          const { startDate, endDate } = calculateNextRentCycleDates(
            lastEndDate,
            rentCycleData.type,
            1,
            30
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
        // No previous payments - calculate initial rent cycle dates
        let startDate = "";
        let endDate = "";

        if (rentCycleData && joiningDate) {
          if (rentCycleData.type === 'CALENDAR') {
            // For CALENDAR: First payment is from 1st to last day of joining month
            const dates = getCalendarMonthDates(joiningDate);
            startDate = dates.start;
            endDate = dates.end;
          } else {
            // For MIDMONTH: Use joining date as start, then same day next month - 1
            const dates = getMidmonthDates(joiningDate);
            startDate = dates.start;
            endDate = dates.end;
          }
        }

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
      }
    }
  }, [mode, existingPayment, visible, previousPayments, rentCycleData, bedRentAmount, joiningDate, lastPaymentEndDate]);


  const handleAutoFillDates = () => {
    if (!rentCycleData) {
      Alert.alert(
        "No Rent Cycle Data",
        "PG location rent cycle data not available. Please try again."
      );
      return;
    }

    let startDate = "";
    let endDate = "";

    // Check if there are previous payments
    const hasPreviousPayments = previousPayments && previousPayments.length > 0;

    if (hasPreviousPayments && lastPaymentEndDate) {
      // Calculate next cycle dates from last payment's end date
      const { startDate: nextStart, endDate: nextEnd } = calculateNextRentCycleDates(
        lastPaymentEndDate,
        rentCycleData.type,
        1,
        30
      );
      startDate = nextStart;
      endDate = nextEnd;
    } else {
      // No previous payments - use joining date logic
      if (joiningDate) {
        if (rentCycleData.type === 'CALENDAR') {
          // For CALENDAR: First payment is from 1st to last day of joining month
          const dates = getCalendarMonthDates(joiningDate);
          startDate = dates.start;
          endDate = dates.end;
        } else {
          // For MIDMONTH: Use joining date as start, then same day next month - 1
          const dates = getMidmonthDates(joiningDate);
          startDate = dates.start;
          endDate = dates.end;
        }
      }
    }

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

    // Validate start and end dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (startDate >= endDate) {
        newErrors.end_date = "End date must be after start date";
      }

      // Validate rent period duration matches cycle pattern
      if (rentCycleData) {
        if (rentCycleData.type === 'CALENDAR') {
          // CALENDAR: Full calendar month (1st to last day)
          const startDay = startDate.getDate();
          const startMonth = startDate.getMonth();
          const startYear = startDate.getFullYear();

          const endDay = endDate.getDate();
          const endMonth = endDate.getMonth();
          const endYear = endDate.getFullYear();

          // Check if start is 1st of month and end is last day of month
          const isFirstOfMonth = startDay === 1;
          const lastDayOfMonth = new Date(startYear, startMonth + 1, 0).getDate();
          const isLastDayOfMonth = endDay === lastDayOfMonth && endMonth === startMonth && endYear === startYear;

          if (!isFirstOfMonth || !isLastDayOfMonth) {
            newErrors.end_date = "CALENDAR cycle: Period must be from 1st to last day of the month";
          }
        } else {
          // MIDMONTH: Same day to same day next month minus 1 (e.g., 15th to 14th)
          const startDay = startDate.getDate();
          const startMonth = startDate.getMonth();
          const startYear = startDate.getFullYear();

          const endDay = endDate.getDate();
          const endMonth = endDate.getMonth();
          const endYear = endDate.getFullYear();

          // Calculate expected end date: create date in next month with same day, then subtract 1 day
          let expectedEndDate = new Date(startYear, startMonth + 1, startDay);
          expectedEndDate.setDate(expectedEndDate.getDate() - 1);

          // Check if end date matches expected (with 1 day tolerance for month variations)
          const dayDiff = Math.abs(endDate.getTime() - expectedEndDate.getTime()) / (1000 * 60 * 60 * 24);

          if (dayDiff > 1) {
            const expectedDay = startDay === 1 ? 30 : startDay - 1;
            newErrors.end_date = `MIDMONTH cycle: Period should be from ${startDay}th to ${expectedDay}th of next month`;
          }
        }
      }
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
          {previousPayments && previousPayments.length > 0 ? (
            // Show most recent payment from previousPayments array
            (() => {
              const mostRecentPayment = previousPayments.reduce((latest, current) => {
                const latestEndDate = new Date(latest.end_date || 0).getTime();
                const currentEndDate = new Date(current.end_date || 0).getTime();
                return currentEndDate > latestEndDate ? current : latest;
              });
              return (
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
                    {mostRecentPayment.start_date && mostRecentPayment.end_date ? (
                      <>
                        {new Date(mostRecentPayment.start_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                        {" - "}
                        {new Date(mostRecentPayment.end_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </>
                    ) : (
                      "N/A"
                    )}
                  </Text>
                </View>
              );
            })()
          ) : lastPaymentStartDate && lastPaymentEndDate ? (
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
          ) : null}
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

          {/* Rent Cycle Info */}
          {rentCycleData && (
            <View
              style={{
                flexDirection: "row",
                marginBottom: 4,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {/* Label */}
              <Text
                style={{
                  fontSize: 12,
                  color: Theme.colors.text.tertiary,
                  marginRight: 6,
                }}
              >
                Rent Cycle:
              </Text>

              {/* Value */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: Theme.colors.text.primary,
                    flexShrink: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {rentCycleData.type === "CALENDAR"
                    ? "📅 Calendar (1st - Last day)"
                    : "🔄 Mid-Month (Any day - Same day next month - 1)"}
                </Text>
              </View>
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
              {previousPayments
                .sort((a, b) => {
                  const aEndDate = new Date(a.end_date || 0).getTime();
                  const bEndDate = new Date(b.end_date || 0).getTime();
                  return bEndDate - aEndDate; // Sort by end_date descending (most recent first)
                })
                .slice(0, 3)
                .map((prevPayment, index) => (
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
            {rentCycleData && (
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
                  {hasExistingPayments ? "Recalculate" : "Auto-fill"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {hasExistingPayments && (
            <View style={{ marginBottom: 12, paddingHorizontal: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: Theme.colors.primary,
                  fontWeight: "600",
                }}
              >
                ✓ Auto-filled from last payment
              </Text>
            </View>
          )}
          <View style={{ flex: 1, marginBottom: 16 }}>
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(date: string) => {
                setFormData({ ...formData, start_date: date });
              }}
              required
              error={errors.start_date}
              disabled={true}
            />
          </View>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <DatePicker
              label="End Date"
              value={formData.end_date}
              onChange={(date: string) => {
                setFormData({ ...formData, end_date: date });
              }}
              required
              error={errors.end_date}
              disabled={true}
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
