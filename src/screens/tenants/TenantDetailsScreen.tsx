import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTenantById } from '../../store/slices/tenantSlice';
import { TenantPayment, AdvancePayment, RefundPayment, CurrentBill, PendingPaymentMonth } from '../../services/tenants/tenantService';
import { Card } from '../../components/Card';
import { AnimatedPressableCard } from '../../components/AnimatedPressableCard';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import axiosInstance from '../../services/core/axiosInstance';
import { CONTENT_COLOR } from '@/constant';
import AddTenantPaymentModal from '../../components/AddTenantPaymentModal';
import { AddAdvancePaymentModal } from '../../components/AddAdvancePaymentModal';
import { AddRefundPaymentModal } from '../../components/AddRefundPaymentModal';
import { EditRentPaymentModal } from '../../components/EditRentPaymentModal';
import { EditAdvancePaymentModal } from '../../components/EditAdvancePaymentModal';
import { EditRefundPaymentModal } from '../../components/EditRefundPaymentModal';
import { Ionicons } from '@expo/vector-icons';
import { ReceiptPdfGenerator } from '@/services/receipt/receiptPdfGenerator';
import { CompactReceiptGenerator } from '@/services/receipt/compactReceiptGenerator';
import {
  TenantHeader,
  PendingPaymentAlert,
  AccommodationDetails,
  PersonalInformation,
  AddCurrentBillModal,
  CheckoutDateModal,
  ImageViewerModal,
  ReceiptViewModal,
  RentPaymentsSection,
  AdvancePaymentsSection,
  RefundPaymentsSection,
  CurrentBillsSection,
} from './components';
import advancePaymentService from '@/services/payments/advancePaymentService';
import refundPaymentService from '@/services/payments/refundPaymentService';
import { paymentService } from '@/services/payments/paymentService';
import { createCurrentBill } from '@/services/bills/currentBillService';
import { showErrorAlert } from '@/utils/errorHandler';

// Inner component that doesn't directly interact with frozen navigation context
const TenantDetailsContent: React.FC<{ tenantId: number; navigation: any }> = ({ tenantId, navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentTenant: reduxTenant, loading } = useSelector((state: RootState) => state.tenants);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Clone tenant data to avoid frozen Redux state issues with React 19
  const currentTenant = reduxTenant ? JSON.parse(JSON.stringify(reduxTenant)) : null;

  const [expandedSections, setExpandedSections] = useState({
    rentPayments: false,
    advancePayments: false,
    refundPayments: false,
    currentBills: false,
    pendingMonths: false,
    proofDocuments: false,
    images: false,
  });

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Checkout date modal state
  const [checkoutDateModalVisible, setCheckoutDateModalVisible] = useState(false);
  const [newCheckoutDate, setNewCheckoutDate] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  
  // Advance payment modal state
  const [advancePaymentModalVisible, setAdvancePaymentModalVisible] = useState(false);
  
  // Refund payment modal state
  const [refundPaymentModalVisible, setRefundPaymentModalVisible] = useState(false);
  
  // Edit rent payment modal state
  const [editRentPaymentModalVisible, setEditRentPaymentModalVisible] = useState(false);
  const [editingRentPayment, setEditingRentPayment] = useState<any>(null);
  
  // Edit advance payment modal state
  const [editAdvancePaymentModalVisible, setEditAdvancePaymentModalVisible] = useState(false);
  const [editingAdvancePayment, setEditingAdvancePayment] = useState<any>(null);

  // Edit refund payment modal state
  const [editRefundPaymentModalVisible, setEditRefundPaymentModalVisible] = useState(false);
  const [editingRefundPayment, setEditingRefundPayment] = useState<any>(null);

  // Current bill modal state
  const [currentBillModalVisible, setCurrentBillModalVisible] = useState(false);
  const [currentBillAmount, setCurrentBillAmount] = useState('');
  const [currentBillDate, setCurrentBillDate] = useState('');
  const [currentBillRemarks, setCurrentBillRemarks] = useState('');
  const [currentBillLoading, setCurrentBillLoading] = useState(false);

  // Receipt modal state
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const receiptRef = React.useRef<View>(null);

  useEffect(() => {
    loadTenantDetails();
  }, [tenantId]);

  const loadTenantDetails = async () => {
    try {
      await dispatch(
        fetchTenantById({
          id: tenantId,
          headers: {
            pg_id: selectedPGLocationId || undefined,
            organization_id: user?.organization_id || undefined,
            user_id: user?.s_no || undefined,
          },
        })
      ).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load tenant details');
      navigation.goBack();
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSaveAdvancePayment = async (data: any) => {
    try {
      // Ensure pg_id is available from tenant or selected location
      const pgId = currentTenant?.pg_id || selectedPGLocationId;
      
      if (!pgId) {
        throw new Error('PG Location ID is required');
      }

      await advancePaymentService.createAdvancePayment(data, {
        pg_id: pgId,
        organization_id: user?.organization_id,
        user_id: user?.s_no,
      });
      
      Alert.alert('Success', 'Advance payment created successfully');
      loadTenantDetails(); // Reload tenant details to show new payment
    } catch (error: any) {
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleSaveRefundPayment = async (data: any) => {
    try {
      // Ensure pg_id is available from tenant or selected location
      const pgId = currentTenant?.pg_id || selectedPGLocationId;
      
      if (!pgId) {
        throw new Error('PG Location ID is required');
      }

      await refundPaymentService.createRefundPayment(
        { ...data, pg_id: pgId },
        {
          pg_id: pgId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        }
      );
      
      Alert.alert('Success', 'Refund payment created successfully');
      loadTenantDetails(); // Reload tenant details to show new payment
    } catch (error: any) {
      console.error('Error in handleSaveRefundPayment:', error);
      console.error('Error response:', error.response?.data);
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleEditRentPayment = (payment: any) => {
    // Enrich payment with tenant, room, and bed info for display in modal
    const enrichedPayment = {
      ...payment,
      tenants: payment.tenants || { name: currentTenant?.name },
      rooms: payment.rooms || currentTenant?.rooms,
      beds: payment.beds || currentTenant?.beds,
    };
    setEditingRentPayment(enrichedPayment);
    setEditRentPaymentModalVisible(true);
  };

  const handleSaveRentPayment = async (id: number, data: any) => {
    try {
      await paymentService.updateTenantPayment(id, data);
      setEditRentPaymentModalVisible(false);
      setEditingRentPayment(null);
      loadTenantDetails();
    } catch (error: any) {
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleDeleteRentPayment = (payment: any) => {
    Alert.alert(
      'Delete Rent Payment',
      `Are you sure you want to delete this payment?\n\nAmount: ₹${payment.amount_paid}\nDate: ${new Date(payment.payment_date).toLocaleDateString('en-IN')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/tenant-payments/${payment.s_no}`);
              Alert.alert('Success', 'Rent payment deleted successfully');
              loadTenantDetails();
            } catch (error: any) {
              showErrorAlert(error, 'Delete Error');
            }
          },
        },
      ]
    );
  };

  // Receipt handlers
  const prepareReceiptData = (payment: any) => {
    return {
      receiptNumber: `RCP-${payment.s_no}-${new Date(payment.payment_date).getFullYear()}`,
      paymentDate: payment.payment_date,
      tenantName: currentTenant?.name || '',
      tenantPhone: currentTenant?.phone_no || '',
      pgName: currentTenant?.pg_locations?.location_name || 'PG',
      roomNumber: payment.rooms?.room_no || currentTenant?.rooms?.room_no || '',
      bedNumber: payment.beds?.bed_no || currentTenant?.beds?.bed_no || '',
      rentPeriod: {
        startDate: payment.start_date,
        endDate: payment.end_date,
      },
      actualRent: Number(payment.actual_rent_amount || 0),
      amountPaid: Number(payment.amount_paid || 0),
      paymentMethod: payment.payment_method || 'CASH',
      remarks: payment.remarks,
    };
  };

  const prepareAdvanceReceiptData = (payment: any) => {
    return {
      receiptNumber: `ADV-${payment.s_no}-${new Date(payment.payment_date).getFullYear()}`,
      paymentDate: payment.payment_date,
      tenantName: currentTenant?.name || '',
      tenantPhone: currentTenant?.phone_no || '',
      pgName: currentTenant?.pg_locations?.location_name || 'PG',
      roomNumber: payment.rooms?.room_no || currentTenant?.rooms?.room_no || '',
      bedNumber: payment.beds?.bed_no || currentTenant?.beds?.bed_no || '',
      rentPeriod: {
        startDate: payment.payment_date,
        endDate: payment.payment_date,
      },
      actualRent: Number(payment.amount_paid || 0),
      amountPaid: Number(payment.amount_paid || 0),
      paymentMethod: payment.payment_method || 'CASH',
      remarks: payment.remarks,
      receiptType: 'ADVANCE' as const,
    };
  };

  const handleViewReceipt = (payment: any) => {
    const data = prepareReceiptData(payment);
    setReceiptData(data);
    setReceiptModalVisible(true);
  };

  const handleWhatsAppReceipt = async (payment: any) => {
    try {
      const data = prepareReceiptData(payment);
      setReceiptData(data);
      
      // Wait for component to render
      setTimeout(async () => {
        await CompactReceiptGenerator.shareViaWhatsApp(
          receiptRef,
          data,
          currentTenant?.phone_no || ''
        );
        setReceiptData(null);
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send via WhatsApp');
      setReceiptData(null);
    }
  };

  const handleShareReceipt = async (payment: any) => {
    try {
      const data = prepareReceiptData(payment);
      setReceiptData(data);
      
      // Wait for component to render
      setTimeout(async () => {
        await CompactReceiptGenerator.shareImage(receiptRef);
        setReceiptData(null);
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
      setReceiptData(null);
    }
  };

  // Advance payment receipt handlers
  const handleViewAdvanceReceipt = (payment: any) => {
    const data = prepareAdvanceReceiptData(payment);
    setReceiptData(data);
    setReceiptModalVisible(true);
  };

  const handleWhatsAppAdvanceReceipt = async (payment: any) => {
    try {
      const data = prepareAdvanceReceiptData(payment);
      setReceiptData(data);
      
      // Wait for component to render
      setTimeout(async () => {
        await CompactReceiptGenerator.shareViaWhatsApp(
          receiptRef,
          data,
          currentTenant?.phone_no || ''
        );
        setReceiptData(null);
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send via WhatsApp');
      setReceiptData(null);
    }
  };

  const handleShareAdvanceReceipt = async (payment: any) => {
    try {
      const data = prepareAdvanceReceiptData(payment);
      setReceiptData(data);
      
      // Wait for component to render
      setTimeout(async () => {
        await CompactReceiptGenerator.shareImage(receiptRef);
        setReceiptData(null);
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
      setReceiptData(null);
    }
  };

  const handleEditAdvancePayment = (payment: any) => {
    // Enrich payment with tenant, room, and bed info for display in modal
    const enrichedPayment = {
      ...payment,
      tenants: payment.tenants || { name: currentTenant?.name },
      rooms: payment.rooms || currentTenant?.rooms,
      beds: payment.beds || currentTenant?.beds,
    };
    setEditingAdvancePayment(enrichedPayment);
    setEditAdvancePaymentModalVisible(true);
  };

  const handleUpdateAdvancePayment = async (id: number, data: any) => {
    try {
      await advancePaymentService.updateAdvancePayment(id, data, {
        pg_id: selectedPGLocationId || undefined,
        organization_id: user?.organization_id,
        user_id: user?.s_no,
      });
      setEditAdvancePaymentModalVisible(false);
      setEditingAdvancePayment(null);
      loadTenantDetails();
    } catch (error: any) {
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleDeleteAdvancePayment = (payment: any) => {
    Alert.alert(
      'Delete Advance Payment',
      `Are you sure you want to delete this payment?\n\nAmount: ₹${payment.amount_paid}\nDate: ${new Date(payment.payment_date).toLocaleDateString('en-IN')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/advance-payments/${payment.s_no}`);
              Alert.alert('Success', 'Advance payment deleted successfully');
              loadTenantDetails();
            } catch (error: any) {
              showErrorAlert(error, 'Delete Error');
            }
          },
        },
      ]
    );
  };

  const handleEditRefundPayment = (payment: any) => {
    // Enrich payment with tenant, room, and bed info for display in modal
    const enrichedPayment = {
      ...payment,
      tenants: payment.tenants || { name: currentTenant?.name },
      rooms: payment.rooms || currentTenant?.rooms,
      beds: payment.beds || currentTenant?.beds,
    };
    setEditingRefundPayment(enrichedPayment);
    setEditRefundPaymentModalVisible(true);
  };

  const handleUpdateRefundPayment = async (id: number, data: any) => {
    try {
      await refundPaymentService.updateRefundPayment(id, data, {
        pg_id: selectedPGLocationId || undefined,
        organization_id: user?.organization_id,
        user_id: user?.s_no,
      });
      setEditRefundPaymentModalVisible(false);
      setEditingRefundPayment(null);
      loadTenantDetails();
    } catch (error: any) {
      throw error; // Re-throw to let modal handle it
    }
  };

  // Current bill handlers
  const handleAddCurrentBill = () => {
    setCurrentBillAmount('');
    setCurrentBillDate(new Date().toISOString().split('T')[0]);
    setCurrentBillRemarks('');
    setCurrentBillModalVisible(true);
  };

  const handleSaveCurrentBill = async () => {
    if (!currentBillAmount || isNaN(Number(currentBillAmount)) || Number(currentBillAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bill amount');
      return;
    }

    try {
      setCurrentBillLoading(true);
      await createCurrentBill(
        {
          tenant_id: currentTenant.s_no,
          pg_id: selectedPGLocationId || 0,
          bill_amount: parseFloat(currentBillAmount),
          bill_date: currentBillDate,
          remarks: currentBillRemarks || undefined,
        },
        {
          pg_id: selectedPGLocationId || undefined,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        }
      );
      Alert.alert('Success', 'Current bill added successfully');
      setCurrentBillModalVisible(false);
      loadTenantDetails();
    } catch (error: any) {
      // Extract error message from backend response
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Failed to add current bill';
      Alert.alert('Error', errorMessage);
    } finally {
      setCurrentBillLoading(false);
    }
  };

  // Checkout handlers
  const handleCheckout = () => {
    setCheckoutDateModalVisible(true);
    setNewCheckoutDate(new Date().toISOString().split('T')[0]);
  };

  const confirmCheckout = async () => {
    if (!newCheckoutDate) {
      Alert.alert('Error', 'Please select a checkout date');
      return;
    }

    try {
      setCheckoutLoading(true);
      await axiosInstance.post(`/tenants/${currentTenant.s_no}/checkout`, {
        check_out_date: newCheckoutDate,
      });
      Alert.alert('Success', 'Tenant checked out successfully');
      setCheckoutDateModalVisible(false);
      setNewCheckoutDate('');
      loadTenantDetails();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to checkout tenant');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleDeleteRefundPayment = (payment: any) => {
    Alert.alert(
      'Delete Refund Payment',
      `Are you sure you want to delete this refund?\n\nAmount: ₹${payment.amount_paid}\nDate: ${new Date(payment.payment_date).toLocaleDateString('en-IN')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await refundPaymentService.deleteRefundPayment(payment.s_no, {
                pg_id: selectedPGLocationId || undefined,
                organization_id: user?.organization_id,
                user_id: user?.s_no,
              });
              Alert.alert('Success', 'Refund payment deleted successfully');
              loadTenantDetails();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete refund payment');
            }
          },
        },
      ]
    );
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openImageViewer = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setImageViewerVisible(false);
    setSelectedImage(null);
  };

  const handleChangeCheckoutDate = () => {
    setNewCheckoutDate(currentTenant?.check_out_date ? new Date(currentTenant.check_out_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setCheckoutDateModalVisible(true);
  };

  const handleClearCheckout = () => {
    Alert.alert(
      'Clear Checkout',
      'This will reactivate the tenant and clear the checkout date. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setCheckoutLoading(true);
              await axiosInstance.put(`/tenants/${tenantId}/checkout-date`, {
                clear_checkout: true,
              });
              Alert.alert('Success', 'Checkout cleared and tenant reactivated successfully');
              loadTenantDetails();
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Failed to clear checkout');
            } finally {
              setCheckoutLoading(false);
            }
          },
        },
      ]
    );
  };

  const confirmUpdateCheckoutDate = async () => {
    try {
      setCheckoutLoading(true);
      await axiosInstance.put(`/tenants/${tenantId}/checkout-date`, {
        check_out_date: newCheckoutDate,
      });
      Alert.alert('Success', 'Checkout date updated successfully');
      setCheckoutDateModalVisible(false);
      loadTenantDetails();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update checkout date');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading || !currentTenant) {
    return (
      <ScreenLayout backgroundColor={Theme.colors.background.blue}>
        <ScreenHeader title="Tenant Details" showBackButton={true} onBackPress={() => navigation.goBack()} />
        <View style={{backgroundColor : CONTENT_COLOR, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>
            Loading tenant details...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  const tenant = currentTenant;

  return (
    <ScreenLayout  backgroundColor={Theme.colors.background.blue} >
      <ScreenHeader 
        title="Tenant Details" 
        showBackButton={true} 
        onBackPress={() => navigation.goBack()}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
      >
        
      </ScreenHeader>

      <View style={{ flex: 1, backgroundColor : CONTENT_COLOR }}>
        <ScrollView style={{ flex: 1 }}>
        {/* Tenant Header */}
        <TenantHeader
          tenant={tenant}
          onEdit={() => navigation.navigate('AddTenant', { tenantId: currentTenant.s_no })}
          onCall={handleCall}
          onWhatsApp={handleWhatsApp}
          onEmail={handleEmail}
          onAddPayment={() => setPaymentModalVisible(true)}
          onAddAdvance={() => setAdvancePaymentModalVisible(true)}
          onAddRefund={() => setRefundPaymentModalVisible(true)}
          onAddCurrentBill={handleAddCurrentBill}
        />

        {/* Pending Payment Alert */}
        {tenant.pending_payment && (
          <PendingPaymentAlert pendingPayment={tenant.pending_payment} />
        )}

        {/* Accommodation Details */}
        <AccommodationDetails
          tenant={tenant}
          onChangeCheckoutDate={handleChangeCheckoutDate}
          onClearCheckout={handleClearCheckout}
          checkoutLoading={checkoutLoading}
        />

        {/* Personal Information */}
        <PersonalInformation tenant={tenant} />

        {/* Current Bills */}
        <CurrentBillsSection
          bills={tenant?.current_bills}
          expanded={expandedSections.currentBills}
          onToggle={() => toggleSection('currentBills')}
        />

        {/* Rent Payments */}
        <RentPaymentsSection
          payments={tenant?.tenant_payments}
          expanded={expandedSections.rentPayments}
          onToggle={() => toggleSection('rentPayments')}
          onEdit={handleEditRentPayment}
          onDelete={handleDeleteRentPayment}
          onViewReceipt={handleViewReceipt}
          onWhatsAppReceipt={handleWhatsAppReceipt}
          onShareReceipt={handleShareReceipt}
        />

        {/* Advance Payments */}
        <AdvancePaymentsSection
          payments={tenant?.advance_payments}
          expanded={expandedSections.advancePayments}
          onToggle={() => toggleSection('advancePayments')}
          onEdit={handleEditAdvancePayment}
          onDelete={handleDeleteAdvancePayment}
          onViewReceipt={handleViewAdvanceReceipt}
          onWhatsAppReceipt={handleWhatsAppAdvanceReceipt}
          onShareReceipt={handleShareAdvanceReceipt}
        />

        {/* Refund Payments */}
        <RefundPaymentsSection
          payments={tenant?.refund_payments}
          expanded={expandedSections.refundPayments}
          onToggle={() => toggleSection('refundPayments')}
          onEdit={handleEditRefundPayment}
          onDelete={handleDeleteRefundPayment}
        />

        {/* Proof Documents */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSection('proofDocuments')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: expandedSections.proofDocuments ? 1 : 0,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary }}>
              📄 Proof Documents (
              {tenant.proof_documents && Array.isArray(tenant.proof_documents)
                ? tenant.proof_documents.length
                : 0}
              )
            </Text>
            <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
              {expandedSections.proofDocuments ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {expandedSections.proofDocuments && (
            <View style={{ padding: 16, paddingTop: 12, backgroundColor: '#FFFFFF' }}>
              {tenant.proof_documents && Array.isArray(tenant.proof_documents) && tenant.proof_documents.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {tenant.proof_documents.map((doc: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openImageViewer(doc)}
                      style={{
                        width: '48%',
                        aspectRatio: 1,
                        backgroundColor: '#F9FAFB',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Image
                        source={{ uri: doc }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          padding: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: '600',
                          }}
                        >
                          Document {index + 1}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: Theme.colors.text.tertiary }}>
                    No proof documents uploaded
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Tenant Images */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSection('images')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#FFFFFF',
              borderBottomWidth: expandedSections.images ? 1 : 0,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary }}>
              📷 Tenant Images (
              {tenant.images && Array.isArray(tenant.images) ? tenant.images.length : 0})
            </Text>
            <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
              {expandedSections.images ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {expandedSections.images && (
            <View style={{ padding: 16, paddingTop: 12, backgroundColor: '#FFFFFF' }}>
              {tenant.images && Array.isArray(tenant.images) && tenant.images.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {tenant.images.map((image: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openImageViewer(image)}
                      style={{
                        width: '48%',
                        aspectRatio: 1,
                        backgroundColor: '#F9FAFB',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        source={{ uri: image }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: Theme.colors.text.tertiary }}>
                    No images uploaded
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Checkout Actions - Only show if there's an action available */}
        {(currentTenant?.status === 'ACTIVE' && !currentTenant?.check_out_date) || 
         (currentTenant?.status === 'INACTIVE' && currentTenant?.check_out_date) ? (
          <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {currentTenant?.status === 'ACTIVE' && !currentTenant?.check_out_date && (
                <TouchableOpacity
                  onPress={handleCheckout}
                  disabled={checkoutLoading}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: checkoutLoading ? '#9CA3AF' : '#F59E0B',
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: checkoutLoading ? 0.6 : 1,
                  }}
                >
                  {checkoutLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Checkout</Text>
                  )}
                </TouchableOpacity>
              )}
              {currentTenant?.status === 'INACTIVE' && currentTenant?.check_out_date && (
                <TouchableOpacity
                  onPress={handleClearCheckout}
                  disabled={checkoutLoading}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: checkoutLoading ? '#9CA3AF' : '#10B981',
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: checkoutLoading ? 0.6 : 1,
                  }}
                >
                  {checkoutLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Clear Checkout</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ) : null}

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Full Screen Image Viewer Modal */}
      <ImageViewerModal
        visible={imageViewerVisible}
        imageUri={selectedImage}
        onClose={closeImageViewer}
      />

      {/* Change Checkout Date Modal */}
      <CheckoutDateModal
        visible={checkoutDateModalVisible}
        tenantName={tenant?.name || ''}
        checkoutDate={newCheckoutDate}
        loading={checkoutLoading}
        onDateChange={setNewCheckoutDate}
        onClose={() => setCheckoutDateModalVisible(false)}
        onConfirm={confirmUpdateCheckoutDate}
      />

      {/* Add Payment Modal */}
      {tenant && (
        <AddTenantPaymentModal
          visible={paymentModalVisible}
          tenantId={tenant.s_no}
          tenantName={tenant.name}
          roomId={tenant.room_id || 0}
          bedId={tenant.bed_id || 0}
          pgId={tenant.pg_id || selectedPGLocationId || 0}
          rentAmount={tenant.rooms?.rent_price || 0}
          joiningDate={tenant.check_in_date}
          lastPaymentStartDate={
            tenant.tenant_payments && tenant.tenant_payments.length > 0
              ? tenant.tenant_payments[0].start_date
              : undefined
          }
          lastPaymentEndDate={
            tenant.tenant_payments && tenant.tenant_payments.length > 0
              ? tenant.tenant_payments[0].end_date
              : undefined
          }
          previousPayments={
            (tenant.tenant_payments
              ?.sort((a: TenantPayment, b: TenantPayment) => {
                return new Date(b.payment_date || b.end_date || '').getTime() - new Date(a.payment_date || a.end_date || '').getTime();
              }) as any[]) || []
          }
          onClose={() => setPaymentModalVisible(false)}
          onSuccess={() => {
            setPaymentModalVisible(false);
            loadTenantDetails();
          }}
        />
      )}

      {/* Add Advance Payment Modal */}
      {tenant && (
        <AddAdvancePaymentModal
          visible={advancePaymentModalVisible}
          tenant={tenant}
          onClose={() => setAdvancePaymentModalVisible(false)}
          onSave={handleSaveAdvancePayment}
        />
      )}

      {/* Add Refund Payment Modal */}
      {tenant && (
        <AddRefundPaymentModal
          visible={refundPaymentModalVisible}
          tenant={tenant}
          onClose={() => setRefundPaymentModalVisible(false)}
          onSave={handleSaveRefundPayment}
        />
      )}

      {/* Edit Rent Payment Modal */}
      <EditRentPaymentModal
        visible={editRentPaymentModalVisible}
        payment={editingRentPayment}
        previousPayments={
          (tenant?.tenant_payments
            ?.filter((p: TenantPayment) => p.s_no !== editingRentPayment?.s_no)
            ?.sort((a: TenantPayment, b: TenantPayment) => {
              return new Date(b.payment_date || b.end_date || '').getTime() - new Date(a.payment_date || a.end_date || '').getTime();
            }) as any[]) || []
        }
        onClose={() => {
          setEditRentPaymentModalVisible(false);
          setEditingRentPayment(null);
        }}
        onSave={handleSaveRentPayment}
        onSuccess={() => {
          loadTenantDetails();
        }}
      />

      {/* Edit Advance Payment Modal */}
      <EditAdvancePaymentModal
        visible={editAdvancePaymentModalVisible}
        payment={editingAdvancePayment}
        onClose={() => {
          setEditAdvancePaymentModalVisible(false);
          setEditingAdvancePayment(null);
        }}
        onSave={handleUpdateAdvancePayment}
      />

      {/* Edit Refund Payment Modal */}
      {tenant && (
        <EditRefundPaymentModal
          visible={editRefundPaymentModalVisible}
          payment={editingRefundPayment}
          onClose={() => {
            setEditRefundPaymentModalVisible(false);
            setEditingRefundPayment(null);
          }}
          onSave={handleUpdateRefundPayment}
        />
      )}

      {/* Current Bill Modal */}
      <AddCurrentBillModal
        visible={currentBillModalVisible}
        billAmount={currentBillAmount}
        billDate={currentBillDate}
        billRemarks={currentBillRemarks}
        loading={currentBillLoading}
        onBillAmountChange={setCurrentBillAmount}
        onBillDateChange={setCurrentBillDate}
        onBillRemarksChange={setCurrentBillRemarks}
        onClose={() => setCurrentBillModalVisible(false)}
        onSave={handleSaveCurrentBill}
      />

      {/* Receipt View Modal */}
      <ReceiptViewModal
        visible={receiptModalVisible}
        receiptData={receiptData}
        receiptRef={receiptRef}
        onClose={() => setReceiptModalVisible(false)}
        onShare={async () => {
          try {
            await CompactReceiptGenerator.shareImage(receiptRef);
            setReceiptModalVisible(false);
          } catch (error) {
            Alert.alert('Error', 'Failed to share');
          }
        }}
      />

      {/* Hidden receipt for capture (off-screen) */}
      {receiptData && !receiptModalVisible && (
        <View style={{ position: 'absolute', left: -9999 }}>
          <View ref={receiptRef} collapsable={false}>
            <CompactReceiptGenerator.ReceiptComponent data={receiptData} />
          </View>
        </View>
      )}
      </View>
    </ScreenLayout>
  );
};

// Wrapper component - extract navigation context and pass as props
function TenantDetailsScreenWrapper() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  return (
    <TenantDetailsContent 
      tenantId={route?.params?.tenantId || 0} 
      navigation={navigation} 
    />
  );
}

export const TenantDetailsScreen = TenantDetailsScreenWrapper;
