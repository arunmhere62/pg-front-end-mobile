import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
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

interface PGSummary {
  pgLocation: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  statistics: {
    totalTenants: number;
    activeTenants: number;
    totalRooms: number;
    occupiedRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    totalEmployees: number;
  };
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
  const [pgDetails, setPgDetails] = useState<PGSummary | null>(null);

  useEffect(() => {
    loadPGDetails();
  }, [pgId]);

  const loadPGDetails = async () => {
    setLoading(true);
    try {
      const response = await pgLocationService.getSummary(pgId);
      
      console.log('PG Details Response:', response);
      
      if (response.success && response.data) {
        console.log('PG Details Data:', response.data);
        
        // Transform API response to match component expectations
        const apiData = response.data;
        const transformedData: PGSummary = {
          pgLocation: {
            id: apiData.pgLocation?.id || 0,
            name: apiData.pgLocation?.name || 'N/A',
            address: apiData.pgLocation?.address || 'N/A',
            city: apiData.pgLocation?.city || 'N/A',
            state: apiData.pgLocation?.state || 'N/A',
          },
          statistics: {
            totalTenants: apiData.tenants?.total || 0,
            activeTenants: apiData.tenants?.active || 0,
            totalRooms: apiData.rooms?.total || 0,
            occupiedRooms: apiData.rooms?.occupied || 0,
            totalBeds: apiData.beds?.total || 0,
            occupiedBeds: apiData.beds?.occupied || 0,
            totalEmployees: apiData.employees?.total || 0,
          },
        };
        
        setPgDetails(transformedData);
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
            {/* PG Location Header */}
            <Card style={{ padding: 16, marginBottom: 20, backgroundColor: '#fff' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 12 }}>
                {pgDetails.pgLocation.name}
              </Text>
              <View style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Ionicons name="location" size={16} color={Theme.colors.text.secondary} style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 13, color: Theme.colors.text.primary }}>
                    {pgDetails.pgLocation.city}, {pgDetails.pgLocation.state}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons name="home" size={16} color={Theme.colors.text.secondary} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={{ fontSize: 13, color: Theme.colors.text.primary, flex: 1 }}>
                    {pgDetails.pgLocation.address}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Statistics Grid */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.text.secondary, marginBottom: 12, marginTop: 8 }}>
              Statistics
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <StatCard label="Total Tenants" value={pgDetails.statistics.totalTenants} />
              <StatCard label="Active Tenants" value={pgDetails.statistics.activeTenants} />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <StatCard label="Total Rooms" value={pgDetails.statistics.totalRooms} />
              <StatCard label="Occupied Rooms" value={pgDetails.statistics.occupiedRooms} />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <StatCard label="Total Beds" value={pgDetails.statistics.totalBeds} />
              <StatCard label="Occupied Beds" value={pgDetails.statistics.occupiedBeds} />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <StatCard label="Total Employees" value={pgDetails.statistics.totalEmployees} />
              <View style={{ flex: 1 }} />
            </View>

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
