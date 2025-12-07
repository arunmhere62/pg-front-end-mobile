import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { AnimatedButton } from '../../components/AnimatedButton';
import { pgLocationService } from '../../services/organization/pgLocationService';

interface PGDetailsScreenProps {
  navigation: any;
}

interface PGDetails {
  s_no: number;
  location_name: string;
  address: string;
  pincode: string;
  status: string;
  rent_cycle_type: string;
  rent_cycle_start: string | null;
  rent_cycle_end: string | null;
  pg_type: string;
  images: string[];
  city: {
    s_no: number;
    name: string;
  };
  state: {
    s_no: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card style={{ flex: 1, padding: 14, backgroundColor: '#fff', marginBottom: 10 }}>
    <Text style={{ fontSize: 12, color: Theme.colors.text.secondary, marginBottom: 6, fontWeight: '500' }}>
      {label}
    </Text>
    <Text style={{ fontSize: 28, fontWeight: '600', color: Theme.colors.primary }}>
      {value}
    </Text>
  </Card>
);

export const PGDetailsScreen: React.FC<PGDetailsScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const { pgId } = route.params as { pgId: number };

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pgDetails, setPgDetails] = useState<PGDetails | null>(null);

  useEffect(() => {
    loadPGDetails();
  }, [pgId]);

  const loadPGDetails = async () => {
    setLoading(true);
    try {
      const response = await pgLocationService.getDetails(pgId);
      
      console.log('PG Details Response:', response);
      
      if (response.success && response.data) {
        console.log('PG Details Data:', response.data);
        // Handle nested response structure
        const pgData = response.data?.data || response.data;
        setPgDetails(pgData);
      } else {
        Alert.alert('Error', 'Failed to load PG details');
      }
    } catch (error: any) {
      console.error('Error loading PG details:', error);
      Alert.alert('Error', error?.message || 'Failed to load PG details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPGDetails();
    setRefreshing(false);
  };

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader
        title="PG Details"
        subtitle="Overview and statistics"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <View style={{ flex: 1, backgroundColor: Theme.colors.light }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>
              Loading PG details...
            </Text>
          </View>
        ) : pgDetails ? (
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Image Gallery */}
            {pgDetails.images && pgDetails.images.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={true}
                  pagingEnabled
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                >
                  {pgDetails.images.map((image, index) => (
                    <Card 
                      key={index} 
                      style={{
                        width: 300,
                        height: 200,
                        marginRight: 10,
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        borderRadius: 12,
                      }}
                    >
                      <Image
                        source={{ uri: image }}
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          resizeMode: 'cover',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                          borderBottomLeftRadius: 12,
                          borderBottomRightRadius: 12,
                        }}
                      />
                    </Card>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* PG Location Header */}
            <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#fff' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 }}>
                    {pgDetails.location_name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{
                      backgroundColor: pgDetails.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    }}>
                      <Text style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: pgDetails.status === 'ACTIVE' ? '#166534' : '#991B1B',
                      }}>
                        {pgDetails.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location Info */}
              <View style={{ marginBottom: 12 }}>
                {pgDetails.city && pgDetails.state && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="location" size={16} color={Theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 13, color: Theme.colors.text.primary, fontWeight: '500' }}>
                      {pgDetails.city.name}, {pgDetails.state.name}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons name="home" size={16} color={Theme.colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={{ fontSize: 13, color: Theme.colors.text.primary, flex: 1 }}>
                    {pgDetails.address}
                  </Text>
                </View>
                {pgDetails.pincode && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Ionicons name="pin" size={16} color={Theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 13, color: Theme.colors.text.primary }}>
                      {pgDetails.pincode}
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {/* PG Details */}
            <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#fff' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                PG Information
              </Text>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>PG Type</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
                    {pgDetails.pg_type === 'COLIVING' ? '👥 Co-living' : pgDetails.pg_type === 'MENS' ? '👨 Mens' : '👩 Womens'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>Rent Cycle</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
                    {pgDetails.rent_cycle_type}
                  </Text>
                </View>
                {pgDetails.rent_cycle_type === 'MIDMONTH' && (
                  <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                      <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>Cycle Start</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
                        {pgDetails.rent_cycle_start || 'N/A'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>Cycle End</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.primary }}>
                        {pgDetails.rent_cycle_end || 'N/A'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Card>

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <AnimatedButton
                style={{
                  flex: 1,
                  backgroundColor: Theme.colors.primary,
                  paddingVertical: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
                onPress={() => navigation.navigate('Rooms')}
              >
                <Ionicons name="home" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Rooms</Text>
              </AnimatedButton>

              <AnimatedButton
                style={{
                  flex: 1,
                  backgroundColor: Theme.colors.primary,
                  paddingVertical: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
                onPress={() => navigation.navigate('Tenants')}
              >
                <Ionicons name="people" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Tenants</Text>
              </AnimatedButton>

              <AnimatedButton
                style={{
                  flex: 1,
                  backgroundColor: Theme.colors.primary,
                  paddingVertical: 12,
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}
                onPress={() => navigation.navigate('Beds')}
              >
                <Ionicons name="bed" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Beds</Text>
              </AnimatedButton>
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: Theme.colors.text.secondary }}>No data available</Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};
