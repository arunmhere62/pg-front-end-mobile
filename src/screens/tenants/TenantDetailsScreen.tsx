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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTenantById } from '../../store/slices/tenantSlice';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { DatePicker } from '../../components/DatePicker';
import axiosInstance from '../../services/axiosInstance';
import { CONTENT_COLOR } from '@/constant';
import AddTenantPaymentModal from '../../components/AddTenantPaymentModal';
import { AddAdvancePaymentModal } from '../../components/AddAdvancePaymentModal';
import advancePaymentService from '../../services/advancePaymentService';

interface TenantDetailsScreenProps {
  navigation: any;
  route: any;
}

export const TenantDetailsScreen: React.FC<TenantDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { tenantId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { currentTenant, loading } = useSelector((state: RootState) => state.tenants);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);

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

      console.log('Creating advance payment with data:', { ...data, pg_id: pgId });

      await advancePaymentService.createAdvancePayment(data, {
        pg_id: pgId,
        organization_id: user?.organization_id,
        user_id: user?.s_no,
      });
      
      Alert.alert('Success', 'Advance payment created successfully');
      loadTenantDetails(); // Reload tenant details to show new payment
    } catch (error: any) {
      console.error('Error in handleSaveAdvancePayment:', error);
      console.error('Error response:', error.response?.data);
      throw error; // Re-throw to let modal handle it
    }
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
  const tenantImage =
    tenant.images && Array.isArray(tenant.images) && tenant.images.length > 0
      ? tenant.images[0]
      : null;

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
        {/* Header Card with Image */}
       <Card style={{ margin: 16, padding: 16, position: 'relative' }}>
  {/* Edit Button - Top Right Corner */}
  <TouchableOpacity
    onPress={() => navigation.navigate('AddTenant', { tenantId: currentTenant.s_no })}
    style={{
      position: 'absolute',
      top: 12,
      right: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: '#fff',
      borderRadius: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }}
  >
    <Text style={{ color: Theme.colors.primary, fontWeight: '600', fontSize: 14 }}>✏️ Edit</Text>
  </TouchableOpacity>

  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
    {/* Tenant Image/Avatar */}
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        overflow: 'hidden',
      }}
    >
      {tenantImage ? (
        <Image
          source={{ uri: tenantImage }}
          style={{ width: 80, height: 80 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
          {tenant.name.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>

    {/* Name and Status */}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: Theme.colors.text.primary,
          marginBottom: 4,
        }}
      >
        {tenant.name}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: Theme.colors.text.tertiary,
          marginBottom: 8,
        }}
      >
        ID: {tenant.tenant_id}
      </Text>
      <View
        style={{
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor:
            tenant.status === 'ACTIVE' ? '#10B98120' : '#EF444420',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: tenant.status === 'ACTIVE' ? '#10B981' : '#EF4444',
          }}
        >
          {tenant.status}
        </Text>
      </View>
    </View>
  </View>

  {/* Contact Actions */}
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {tenant.phone_no && (
      <TouchableOpacity
        onPress={() => handleCall(tenant.phone_no!)}
        style={{
          flex: 1,
          paddingVertical: 10,
          backgroundColor: Theme.colors.primary,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>📞 Call</Text>
      </TouchableOpacity>
    )}
    {tenant.whatsapp_number && (
      <TouchableOpacity
        onPress={() => handleWhatsApp(tenant.whatsapp_number!)}
        style={{
          flex: 1,
          paddingVertical: 10,
          backgroundColor: '#25D366',
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>💬 WhatsApp</Text>
      </TouchableOpacity>
    )}
    {tenant.email && (
      <TouchableOpacity
        onPress={() => handleEmail(tenant.email!)}
        style={{
          flex: 1,
          paddingVertical: 10,
          backgroundColor: '#EA4335',
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>✉️ Email</Text>
      </TouchableOpacity>
    )}
  </View>

  {/* Action Buttons */}
  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
    <TouchableOpacity
      onPress={() => setPaymentModalVisible(true)}
      style={{
        flex: 1,
        paddingVertical: 12,
        backgroundColor: Theme.colors.secondary,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 18 }}>💰</Text>
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Payment</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      onPress={() => setAdvancePaymentModalVisible(true)}
      style={{
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#10B981',
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 18 }}>🎁</Text>
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Advance</Text>
    </TouchableOpacity>
  </View>
</Card>

        {/* Pending Payment Alert */}
        {tenant.pending_payment && tenant.pending_payment.total_pending > 0 && (
          <Card
            style={{
              marginHorizontal: 16,
              marginBottom: 16,
              padding: 16,
              backgroundColor:
                tenant.pending_payment.payment_status === 'OVERDUE'
                  ? '#FEE2E2'
                  : tenant.pending_payment.payment_status === 'PARTIAL'
                  ? '#FEF3C7'
                  : '#DBEAFE',
              borderLeftWidth: 6,
              borderLeftColor:
                tenant.pending_payment.payment_status === 'OVERDUE'
                  ? '#EF4444'
                  : tenant.pending_payment.payment_status === 'PARTIAL'
                  ? '#F59E0B'
                  : '#3B82F6',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color:
                    tenant.pending_payment.payment_status === 'OVERDUE'
                      ? '#DC2626'
                      : tenant.pending_payment.payment_status === 'PARTIAL'
                      ? '#D97706'
                      : '#2563EB',
                }}
              >
                {tenant.pending_payment.payment_status === 'OVERDUE'
                  ? '⚠️ OVERDUE PAYMENT'
                  : tenant.pending_payment.payment_status === 'PARTIAL'
                  ? '⏳ PARTIAL PAYMENT'
                  : '📅 PENDING PAYMENT'}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color:
                    tenant.pending_payment.payment_status === 'OVERDUE'
                      ? '#DC2626'
                      : tenant.pending_payment.payment_status === 'PARTIAL'
                      ? '#D97706'
                      : '#2563EB',
                }}
              >
                ₹{tenant.pending_payment.total_pending}
              </Text>
            </View>

            {tenant.pending_payment.overdue_months > 0 && (
              <Text style={{ fontSize: 13, color: '#DC2626', marginBottom: 6 }}>
                {tenant.pending_payment.overdue_months} month(s) overdue
              </Text>
            )}

            {tenant.pending_payment.next_due_date && (
              <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginBottom: 12 }}>
                Next due: {new Date(tenant.pending_payment.next_due_date).toLocaleDateString()}
              </Text>
            )}

            {/* Pending Months Breakdown */}
            {tenant.pending_payment.pending_months &&
              tenant.pending_payment.pending_months.length > 0 && (
                <View>
                  <TouchableOpacity
                    onPress={() => toggleSection('pendingMonths')}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderTopWidth: 1,
                      borderTopColor: '#00000020',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
                      Monthly Breakdown
                    </Text>
                    <Text style={{ fontSize: 14, color: Theme.colors.text.secondary }}>
                      {expandedSections.pendingMonths ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>

                  {expandedSections.pendingMonths && (
                    <View style={{ marginTop: 8 }}>
                      {tenant.pending_payment.pending_months.map((month, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingVertical: 6,
                            borderBottomWidth: 1,
                            borderBottomColor: '#00000010',
                          }}
                        >
                          <View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: Theme.colors.text.primary }}>
                              {month.month} {month.year}
                            </Text>
                            <Text style={{ fontSize: 10, color: Theme.colors.text.tertiary }}>
                              Paid: ₹{month.paid_amount} / ₹{month.expected_amount}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: '700',
                                color: month.is_overdue ? '#DC2626' : '#D97706',
                              }}
                            >
                              ₹{month.balance}
                            </Text>
                            {month.is_overdue && (
                              <Text style={{ fontSize: 10, color: '#DC2626' }}>Overdue</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
          </Card>
        )}

        {/* Room & Accommodation Info */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: Theme.colors.text.primary,
              marginBottom: 12,
            }}
          >
            🏠 Accommodation Details
          </Text>

          <View style={{ gap: 12 }}>
            {tenant.pg_locations && (
              <View>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
                  PG Location
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}
                >
                  {tenant.pg_locations.location_name}
                </Text>
                <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
                  {tenant.pg_locations.address}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 16 }}>
              {tenant.rooms && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Room</Text>
                  <Text
                    style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.primary }}
                  >
                    {tenant.rooms.room_no}
                  </Text>
                  {tenant.rooms.rent_price && (
                    <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
                      ₹{tenant.rooms.rent_price}/month
                    </Text>
                  )}
                </View>
              )}

              {tenant.beds && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Bed</Text>
                  <Text
                    style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.primary }}
                  >
                    {tenant.beds.bed_no}
                  </Text>
                </View>
              )}
            </View>

            <View>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Check-in Date</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {new Date(tenant.check_in_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {tenant.check_out_date && (
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
                      Check-out Date
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                      {new Date(tenant.check_out_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      onPress={handleChangeCheckoutDate}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: Theme.colors.primary,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleClearCheckout}
                      disabled={checkoutLoading}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: checkoutLoading ? '#9CA3AF' : '#10B981',
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Personal Information */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: Theme.colors.text.primary,
              marginBottom: 12,
            }}
          >
            👤 Personal Information
          </Text>

          <View style={{ gap: 12 }}>
            {tenant.phone_no && (
              <View>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Phone</Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.primary }}>
                  {tenant.phone_no}
                </Text>
              </View>
            )}

            {tenant.whatsapp_number && (
              <View>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>WhatsApp</Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.primary }}>
                  {tenant.whatsapp_number}
                </Text>
              </View>
            )}

            {tenant.email && (
              <View>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Email</Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.primary }}>
                  {tenant.email}
                </Text>
              </View>
            )}

            {tenant.occupation && (
              <View>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Occupation</Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.primary }}>
                  {tenant.occupation}
                </Text>
              </View>
            )}

            {tenant.tenant_address && (
              <View>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Address</Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.primary }}>
                  {tenant.tenant_address}
                </Text>
              </View>
            )}

            {(tenant.city || tenant.state) && (
              <View>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Location</Text>
                <Text style={{ fontSize: 14, color: Theme.colors.text.primary }}>
                  {tenant.city?.name}
                  {tenant.city && tenant.state && ', '}
                  {tenant.state?.name}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Rent Payments */}
        {tenant.tenant_payments && tenant.tenant_payments.length > 0 && (
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
                💵 Rent Payments ({tenant.tenant_payments.length})
              </Text>
              <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
                {expandedSections.rentPayments ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections.rentPayments && (
              <View style={{ padding: 16, paddingTop: 0 }}>
                {tenant.tenant_payments.map((payment, index) => (
                  <View
                    key={payment.s_no}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: index < tenant.tenant_payments!.length - 1 ? 1 : 0,
                      borderBottomColor: '#E5E7EB',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
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
                              payment.status === 'PENDING' ? '#F59E0B20' :
                              payment.status === 'OVERDUE' ? '#EF444420' : '#9CA3AF20',
                          }}>
                            <Text style={{
                              fontSize: 10,
                              fontWeight: '600',
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
                      <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.primary }}>
                        ₹{payment.amount_paid}
                      </Text>
                    </View>
                    {payment.start_date && payment.end_date && (
                      <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
                        Period: {new Date(payment.start_date).toLocaleDateString()} -{' '}
                        {new Date(payment.end_date).toLocaleDateString()}
                      </Text>
                    )}
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
              </View>
            )}
          </Card>
        )}

        {/* Advance Payments */}
        {tenant.advance_payments && tenant.advance_payments.length > 0 && (
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
                💰 Advance Payments ({tenant.advance_payments.length})
              </Text>
              <Text style={{ fontSize: 16, color: Theme.colors.text.secondary }}>
                {expandedSections.advancePayments ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedSections.advancePayments && (
              <View style={{ padding: 16, paddingTop: 0 }}>
                {tenant.advance_payments.map((payment, index) => (
                  <View
                    key={payment.s_no}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: index < tenant.advance_payments!.length - 1 ? 1 : 0,
                      borderBottomColor: '#E5E7EB',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
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
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981' }}>
                        ₹{payment.amount_paid}
                      </Text>
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
                <View style={{ paddingTop: 12, borderTopWidth: 2, borderTopColor: '#10B981', marginTop: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#10B981', textAlign: 'right' }}>
                    Total Advance: ₹
                    {tenant.advance_payments.reduce((sum, p) => sum + parseFloat(p.amount_paid.toString()), 0)}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        )}

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
              <View style={{ padding: 16, paddingTop: 0 }}>
                {tenant.refund_payments.map((payment, index) => (
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
                        alignItems: 'center',
                        marginBottom: 4,
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
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#F59E0B' }}>
                        ₹{payment.amount_paid}
                      </Text>
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
                    {tenant.refund_payments.reduce((sum, p) => sum + parseFloat(p.amount_paid.toString()), 0)}
                  </Text>
                </View>
              </View>
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
      </View>
    </ScreenLayout>
  );
};
