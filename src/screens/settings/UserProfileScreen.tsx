import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { CONTENT_COLOR } from '@/constant';
import { EditProfileModal } from '../../components/EditProfileModal';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';
import userService from '../../services/userService';
import { updateUser } from '../../store/slices/authSlice';
import axiosInstance from '../../services/core/axiosInstance';

interface UserProfileScreenProps {
  navigation: any;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [stateName, setStateName] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');

  useEffect(() => {
    if (user?.state_id) {
      fetchStateName(user.state_id);
    }
    if (user?.city_id) {
      fetchCityName(user.city_id);
    }
  }, [user?.state_id, user?.city_id]);

  const fetchStateName = async (stateId: number) => {
    try {
      const response = await axiosInstance.get('/location/states', {
        params: { countryCode: 'IN' },
      });
      if (response.data.success) {
        const states = response.data.data || [];
        const state = states.find((s: any) => s.s_no === stateId);
        if (state) {
          setStateName(state.name);
        }
      }
    } catch (error) {
      console.error('Error fetching state name:', error);
    }
  };

  const fetchCityName = async (cityId: number) => {
    try {
      // We need to get the state code first to fetch cities
      if (user?.state_id) {
        const stateResponse = await axiosInstance.get('/location/states', {
          params: { countryCode: 'IN' },
        });
        if (stateResponse.data.success) {
          const states = stateResponse.data.data || [];
          const state = states.find((s: any) => s.s_no === user.state_id);
          if (state) {
            const cityResponse = await axiosInstance.get('/location/cities', {
              params: { stateCode: state.iso_code },
            });
            if (cityResponse.data.success) {
              const cities = cityResponse.data.data || [];
              const city = cities.find((c: any) => c.s_no === cityId);
              if (city) {
                setCityName(city.name);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching city name:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.state_id) {
      await fetchStateName(user.state_id);
    }
    if (user?.city_id) {
      await fetchCityName(user.city_id);
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSaveProfile = async (data: any) => {
    try {
      if (!user) return;
      
      const response = await userService.updateUserProfile(user.s_no, data);
      
      // Update Redux store with new user data
      dispatch(updateUser(data));
      
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      if (!user) return;
      
      await userService.changePassword(user.s_no, data);
      
      setShowChangePasswordModal(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status?: string) => {
    return status === 'ACTIVE' ? '#10B981' : '#EF4444';
  };

  const getStatusBgColor = (status?: string) => {
    return status === 'ACTIVE' ? '#ECFDF5' : '#FEE2E2';
  };

  const getRoleBadgeColor = (roleName?: string) => {
    switch (roleName?.toUpperCase()) {
      case 'SUPER_ADMIN':
        return { bg: '#EFF6FF', color: '#3B82F6' };
      case 'ADMIN':
        return { bg: '#F3E8FF', color: '#A855F7' };
      case 'MANAGER':
        return { bg: '#FEF3C7', color: '#F59E0B' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  const userData = user;
  const roleBadge = getRoleBadgeColor(userData?.role_name);

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader
        title="My Profile"
        showBackButton
        onBackPress={() => navigation.goBack()}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor:CONTENT_COLOR }}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Header Card */}
        <Card
          style={{
            margin: 16,
            padding: 24,
            alignItems: 'center',
            backgroundColor: Theme.colors.canvas,
          }}
        >
          {/* Profile Image */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor:CONTENT_COLOR,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              overflow: 'hidden',
              borderWidth: 4,
              borderColor: Theme.colors.background.blueLight,
            }}
          >
            {userData?.profile_images ? (
              <Image
                source={{ uri: userData.profile_images }}
                style={{ width: 120, height: 120 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#fff', fontSize: 48, fontWeight: 'bold' }}>
                {getInitials(userData?.name || 'User')}
              </Text>
            )}
          </View>

          {/* Name */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: Theme.colors.text.primary,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {userData?.name}
          </Text>

          {/* Role Badge */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: roleBadge.bg,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: roleBadge.color,
              }}
            >
              {userData?.role_name?.replace('_', ' ') || 'User'}
            </Text>
          </View>

          {/* Status Badge */}
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: getStatusBgColor(userData?.status),
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: getStatusColor(userData?.status),
              }}
            >
              ● {userData?.status || 'ACTIVE'}
            </Text>
          </View>

          {/* Organization */}
          {userData?.organization_name && (
            <View
              style={{
                marginTop: 16,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: Theme.colors.background.secondary,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginBottom: 2 }}>
                Organization
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                {userData.organization_name}
              </Text>
            </View>
          )}
        </Card>

        {/* Contact Information */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="mail" size={20} color={Theme.colors.primary} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: Theme.colors.text.primary,
                marginLeft: 8,
              }}
            >
              Contact Information
            </Text>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="mail-outline" size={16} color={Theme.colors.text.tertiary} />
              <Text
                style={{
                  fontSize: 12,
                  color: Theme.colors.text.tertiary,
                  marginLeft: 6,
                }}
              >
                Email Address
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: Theme.colors.text.primary,
                marginLeft: 22,
              }}
            >
              {userData?.email || 'Not provided'}
            </Text>
          </View>

          {/* Phone */}
          {userData?.phone && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="call-outline" size={16} color={Theme.colors.text.tertiary} />
                <Text
                  style={{
                    fontSize: 12,
                    color: Theme.colors.text.tertiary,
                    marginLeft: 6,
                  }}
                >
                  Phone Number
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: Theme.colors.text.primary,
                  marginLeft: 22,
                }}
              >
                {userData.phone}
              </Text>
            </View>
          )}
        </Card>

        {/* Personal Details */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="person" size={20} color={Theme.colors.primary} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: Theme.colors.text.primary,
                marginLeft: 8,
              }}
            >
              Personal Details
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            {/* Gender */}
            {userData?.gender && (
              <View>
                <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginBottom: 4 }}>
                  Gender
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                  {userData.gender}
                </Text>
              </View>
            )}

            {/* State */}
            {stateName && (
              <View>
                <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginBottom: 4 }}>
                  State
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                  {stateName}
                </Text>
              </View>
            )}

            {/* City */}
            {cityName && (
              <View>
                <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginBottom: 4 }}>
                  City
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                  {cityName}
                </Text>
              </View>
            )}

            {/* Address */}
            {userData?.address && (
              <View>
                <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginBottom: 4 }}>
                  Address
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                  {userData.address}
                </Text>
              </View>
            )}

            {/* User ID */}
            <View>
              <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginBottom: 4 }}>
                User ID
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
                #{userData?.s_no}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Settings */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="settings" size={20} color={Theme.colors.primary} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: Theme.colors.text.primary,
                  marginLeft: 8,
                }}
              >
                Account Settings
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Theme.colors.border,
            }}
            onPress={() => setShowEditModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="create-outline" size={20} color={Theme.colors.text.secondary} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: Theme.colors.text.primary,
                  marginLeft: 12,
                }}
              >
                Edit Profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: Theme.colors.border,
            }}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.text.secondary} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: Theme.colors.text.primary,
                  marginLeft: 12,
                }}
              >
                Change Password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}
            onPress={() => {
              // Navigate to privacy settings
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Theme.colors.text.secondary} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: Theme.colors.text.primary,
                  marginLeft: 12,
                }}
              >
                Privacy & Security
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Theme.colors.text.tertiary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        user={userData}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSave={handleChangePassword}
      />
    </ScreenLayout>
  );
};
