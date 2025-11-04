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
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTenantById } from '../../store/slices/tenantSlice';
import { TenantPayment, AdvancePayment, RefundPayment, PendingPaymentMonth } from '../../services/tenants/tenantService';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { DatePicker } from '../../components/DatePicker';
import axiosInstance from '../../services/core/axiosInstance';
import { CONTENT_COLOR } from '@/constant';
import AddTenantPaymentModal from '../../components/AddTenantPaymentModal';
import { AddAdvancePaymentModal } from '../../components/AddAdvancePaymentModal';
import { AddRefundPaymentModal } from '../../components/AddRefundPaymentModal';
import { EditRentPaymentModal } from '../../components/EditRentPaymentModal';
import { EditAdvancePaymentModal } from '../../components/EditAdvancePaymentModal';
import { Ionicons } from '@expo/vector-icons';
import { ReceiptPdfGenerator } from '@/services/receipt/receiptPdfGenerator';
import { CompactReceiptGenerator } from '@/services/receipt/compactReceiptGenerator';
import {
  TenantHeader,
  PendingPaymentAlert,
  AccommodationDetails,
  PersonalInformation,
} from './components';
import advancePaymentService from '@/services/payments/advancePaymentService';
import refundPaymentService from '@/services/payments/refundPaymentService';
import { paymentService } from '@/services/payments/paymentService';

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
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete payment');
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
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete payment');
            }
          },
        },
      ]
    );
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

        {/* Rent Payments */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSection('rentPayments')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#F9FAFB',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary }}>
              💵 Rent Payments ({tenant.tenant_payments?.length || 0})
            </Text>
            <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
              {expandedSections.rentPayments ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {expandedSections.rentPayments && (
            <ScrollView 
              style={{ maxHeight: 600, padding: 16, paddingTop: 0 }}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {tenant.tenant_payments && tenant.tenant_payments.length > 0 ? (
                tenant.tenant_payments.map((payment: TenantPayment, index: number) => (
                  <View
                    key={payment.s_no}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      marginBottom: 12,
                      backgroundColor: '#FAFAFA',
                      borderRadius: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: 
                        payment.status === 'PAID' ? '#10B981' :
                        payment.status === 'PENDING' ? '#F59E0B' :
                        payment.status === 'OVERDUE' ? '#EF4444' : '#9CA3AF',
                    }}
                  >
                    {/* Header Row */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Theme.colors.text.primary }}>
                          Payment Date
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.secondary, marginTop: 2 }}>
                          {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleEditRentPayment(payment)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: Theme.colors.background.blueLight,
                          }}
                        >
                          <Ionicons name="pencil" size={16} color={Theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteRentPayment(payment)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: '#FEE2E2',
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                        {payment.status && (
                          <View style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            backgroundColor: 
                              payment.status === 'PAID' ? '#10B98120' :
                              payment.status === 'PENDING' ? '#F59E0B20' :
                              payment.status === 'OVERDUE' ? '#EF444420' : '#9CA3AF20',
                          }}>
                            <Text style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: 
                                payment.status === 'PAID' ? '#10B981' :
                                payment.status === 'PENDING' ? '#F59E0B' :
                                payment.status === 'OVERDUE' ? '#EF4444' : '#6B7280',
                            }}>
                              {payment.status}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Amount Section */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      borderTopWidth: 1,
                      borderTopColor: '#E5E7EB',
                      marginBottom: 8,
                    }}>
                      <View>
                        <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>
                          Amount Paid
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: Theme.colors.primary }}>
                          ₹{payment.amount_paid?.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      {payment.actual_rent_amount && payment.actual_rent_amount !== payment.amount_paid && (
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>
                            Actual Rent
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: Theme.colors.text.secondary }}>
                            ₹{payment.actual_rent_amount?.toLocaleString('en-IN')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Details Grid */}
                    <View style={{ gap: 6 }}>
                      {/* Payment Period */}
                      {payment.start_date && payment.end_date && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, width: 80 }}>
                            Period:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary, flex: 1 }}>
                            {new Date(payment.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(payment.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Text>
                        </View>
                      )}

                      {/* Payment Method */}
                      {payment.payment_method && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, width: 80 }}>
                            Method:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                            {payment.payment_method}
                          </Text>
                        </View>
                      )}

                      {/* Room & Bed */}
                      {((payment as any).rooms || (payment as any).beds) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, width: 80 }}>
                            Location:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                            {(payment as any).rooms?.room_no && `Room ${(payment as any).rooms.room_no}`}
                            {(payment as any).rooms?.room_no && (payment as any).beds?.bed_no && ' • '}
                            {(payment as any).beds?.bed_no && `Bed ${(payment as any).beds.bed_no}`}
                          </Text>
                        </View>
                      )}

                      {/* Remarks */}
                      {payment.remarks && (
                        <View style={{ 
                          marginTop: 6, 
                          padding: 8, 
                          backgroundColor: '#FFF', 
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                        }}>
                          <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, marginBottom: 2, fontWeight: '600' }}>
                            REMARKS
                          </Text>
                          <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, fontStyle: 'italic' }}>
                            {payment.remarks}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Receipt Buttons */}
                    {payment.status === 'PAID' && (
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                        <TouchableOpacity
                          onPress={() => handleViewReceipt(payment)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 10,
                            backgroundColor: '#FEF3C7',
                            borderRadius: 8,
                            gap: 6,
                          }}
                        >
                          <Ionicons name="eye-outline" size={18} color="#F59E0B" />
                          <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '600' }}>
                            View
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleWhatsAppReceipt(payment)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 10,
                            backgroundColor: '#F0FDF4',
                            borderRadius: 8,
                            gap: 6,
                          }}
                        >
                          <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
                          <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>
                            WhatsApp
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleShareReceipt(payment)}
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 10,
                            backgroundColor: '#EFF6FF',
                            borderRadius: 8,
                            gap: 6,
                          }}
                        >
                          <Ionicons name="share-social-outline" size={18} color="#3B82F6" />
                          <Text style={{ color: '#3B82F6', fontSize: 12, fontWeight: '600' }}>
                            Share
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>💵</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 4 }}>
                    No Rent Payments
                  </Text>
                  <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                    No rent payment records found for this tenant
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </Card>

        {/* Advance Payments */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSection('advancePayments')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#F0FDF4',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981' }}>
              💰 Advance Payments ({tenant.advance_payments?.length || 0})
            </Text>
            <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
              {expandedSections.advancePayments ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {expandedSections.advancePayments && (
            <ScrollView 
              style={{ maxHeight: 600, padding: 16, paddingTop: 0 }}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {tenant.advance_payments && tenant.advance_payments.length > 0 ? (
                tenant.advance_payments.map((payment: AdvancePayment, index: number) => (
                  <View
                    key={payment.s_no}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      marginBottom: 12,
                      backgroundColor: '#F0FDF4',
                      borderRadius: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: 
                        payment.status === 'PAID' ? '#10B981' :
                        payment.status === 'PENDING' ? '#F59E0B' :
                        payment.status === 'FAILED' ? '#EF4444' : '#9CA3AF',
                    }}
                  >
                    {/* Header Row */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Theme.colors.text.primary }}>
                          Payment Date
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.secondary, marginTop: 2 }}>
                          {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleEditAdvancePayment(payment)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: Theme.colors.background.blueLight,
                          }}
                        >
                          <Ionicons name="pencil" size={16} color={Theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteAdvancePayment(payment)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: '#FEE2E2',
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                        {payment.status && (
                          <View style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            backgroundColor: 
                              payment.status === 'PAID' ? '#10B98120' :
                              payment.status === 'PENDING' ? '#F59E0B20' :
                              payment.status === 'FAILED' ? '#EF444420' :
                              payment.status === 'REFUNDED' ? '#3B82F620' : '#9CA3AF20',
                          }}>
                            <Text style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: 
                                payment.status === 'PAID' ? '#10B981' :
                                payment.status === 'PENDING' ? '#F59E0B' :
                                payment.status === 'FAILED' ? '#EF4444' :
                                payment.status === 'REFUNDED' ? '#3B82F6' : '#6B7280',
                            }}>
                              {payment.status}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Amount Section */}
                    <View style={{ 
                      paddingVertical: 10,
                      borderTopWidth: 1,
                      borderTopColor: '#D1FAE5',
                      marginBottom: 8,
                    }}>
                      <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 2 }}>
                        Advance Amount
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: '#10B981' }}>
                        ₹{payment.amount_paid?.toLocaleString('en-IN')}
                      </Text>
                    </View>

                    {/* Details */}
                    <View style={{ gap: 6 }}>
                      {/* Payment Method */}
                      {payment.payment_method && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, width: 80 }}>
                            Method:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                            {payment.payment_method}
                          </Text>
                        </View>
                      )}

                      {/* Room & Bed */}
                      {((payment as any).rooms || (payment as any).beds) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, width: 80 }}>
                            Location:
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                            {(payment as any).rooms?.room_no && `Room ${(payment as any).rooms.room_no}`}
                            {(payment as any).rooms?.room_no && (payment as any).beds?.bed_no && ' • '}
                            {(payment as any).beds?.bed_no && `Bed ${(payment as any).beds.bed_no}`}
                          </Text>
                        </View>
                      )}

                      {/* Remarks */}
                      {payment.remarks && (
                        <View style={{ 
                          marginTop: 6, 
                          padding: 8, 
                          backgroundColor: '#FFF', 
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#D1FAE5',
                        }}>
                          <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary, marginBottom: 2, fontWeight: '600' }}>
                            REMARKS
                          </Text>
                          <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, fontStyle: 'italic' }}>
                            {payment.remarks}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 48, marginBottom: 12 }}>💰</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#10B981', marginBottom: 4 }}>
                    No Advance Payments
                  </Text>
                  <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
                    No advance payment records found for this tenant
                  </Text>
                </View>
              )}
              
              {/* Total Advance Summary - Only show if there are payments */}
              {tenant.advance_payments && tenant.advance_payments.length > 0 && (
                <View style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 16,
                  borderTopWidth: 2, 
                  borderTopColor: '#10B981', 
                  marginTop: 8,
                  backgroundColor: '#ECFDF5',
                  borderRadius: 8,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#047857' }}>
                      Total Advance Paid
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#10B981' }}>
                      ₹{tenant.advance_payments.reduce((sum: number, p: AdvancePayment) => sum + parseFloat(p.amount_paid.toString()), 0).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </Card>

        {/* Refund Payments */}
        {tenant.refund_payments && tenant.refund_payments.length > 0 && (
          <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
            <TouchableOpacity
              onPress={() => toggleSection('refundPayments')}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#FEF3C7',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#F59E0B' }}>
                🔄 Refund Payments ({tenant.refund_payments.length})
              </Text>
              <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
                {expandedSections.refundPayments ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections.refundPayments && (
              <ScrollView 
                style={{ maxHeight: 600, padding: 16, paddingTop: 0 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {tenant.refund_payments.map((payment: RefundPayment, index: number) => (
                  <View
                    key={payment.s_no}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: index < tenant.refund_payments!.length - 1 ? 1 : 0,
                      borderBottomColor: '#E5E7EB',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                          {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                        {payment.status && (
                          <View style={{
                            marginTop: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                            alignSelf: 'flex-start',
                            backgroundColor: 
                              payment.status === 'PAID' ? '#10B98120' :
                              payment.status === 'PENDING' ? '#F59E0B20' : '#9CA3AF20',
                          }}>
                            <Text style={{
                              fontSize: 10,
                              fontWeight: '600',
                              color: 
                                payment.status === 'PAID' ? '#10B981' :
                                payment.status === 'PENDING' ? '#F59E0B' : '#6B7280',
                            }}>
                              {payment.status}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#F59E0B', marginBottom: 8 }}>
                          ₹{payment.amount_paid}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleDeleteRefundPayment(payment)}
                            style={{
                              padding: 6,
                              borderRadius: 6,
                              backgroundColor: '#FEE2E2',
                            }}
                          >
                            <Text style={{ fontSize: 16 }}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {payment.payment_method && (
                      <Text style={{ fontSize: 11, color: Theme.colors.text.secondary }}>
                        Method: {payment.payment_method}
                      </Text>
                    )}
                    {payment.remarks && (
                      <Text style={{ fontSize: 11, color: Theme.colors.text.secondary, fontStyle: 'italic' }}>
                        {payment.remarks}
                      </Text>
                    )}
                  </View>
                ))}
                <View style={{ paddingTop: 12, borderTopWidth: 2, borderTopColor: '#F59E0B', marginTop: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#F59E0B', textAlign: 'right' }}>
                    Total Refund: ₹
                    {tenant.refund_payments.reduce((sum: number, p: RefundPayment) => sum + parseFloat(p.amount_paid.toString()), 0)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </Card>
        )}

        {/* Proof Documents */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSection('proofDocuments')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#F3F4F6',
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
            <View style={{ padding: 16, paddingTop: 12 }}>
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
        </Card>

        {/* Tenant Images */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <TouchableOpacity
            onPress={() => toggleSection('images')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#F3F4F6',
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
            <View style={{ padding: 16, paddingTop: 12 }}>
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
        </Card>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={closeImageViewer}
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>

          {/* Full Screen Image */}
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Change Checkout Date Modal */}
      <Modal
        visible={checkoutDateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCheckoutDateModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            width: '85%',
            maxWidth: 400,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: Theme.colors.text.primary,
              marginBottom: 16,
            }}>
              Change Checkout Date
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: Theme.colors.text.secondary,
              marginBottom: 20,
            }}>
              Update the checkout date for {tenant.name}
            </Text>

            <DatePicker
              label="New Checkout Date"
              value={newCheckoutDate}
              onChange={(date) => setNewCheckoutDate(date)}
            />

            <View style={{
              flexDirection: 'row',
              gap: 12,
              marginTop: 24,
            }}>
              <TouchableOpacity
                onPress={() => setCheckoutDateModalVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: Theme.colors.text.primary,
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmUpdateCheckoutDate}
                disabled={checkoutLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: checkoutLoading ? '#9CA3AF' : Theme.colors.primary,
                  alignItems: 'center',
                }}
              >
                {checkoutLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 16,
                  }}>
                    Update
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* Receipt View Modal */}
      <Modal
        visible={receiptModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReceiptModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, maxWidth: '90%' }}>
            {receiptData && (
              <CompactReceiptGenerator.ReceiptComponent data={receiptData} />
            )}
            
            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setReceiptModalVisible(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#6B7280', fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await CompactReceiptGenerator.shareImage(receiptRef);
                    setReceiptModalVisible(false);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to share');
                  }
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: '#3B82F6',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
