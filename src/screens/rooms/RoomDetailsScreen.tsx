import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getRoomById, deleteRoom, Room } from '../../services/roomService';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';

interface RoomDetailsScreenProps {
  navigation: any;
  route: any;
}

export const RoomDetailsScreen: React.FC<RoomDetailsScreenProps> = ({ navigation, route }) => {
  const { roomId } = route.params;
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRoomDetails();
  }, [roomId]);

  const loadRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await getRoomById(roomId, {
        pg_id: selectedPGLocationId || undefined,
        organization_id: user?.organization_id,
        user_id: user?.s_no,
      });
      setRoom(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load room details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoomDetails();
    setRefreshing(false);
  };

  const handleEdit = () => {
    navigation.navigate('EditRoom', { roomId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete Room ${room?.room_no}? This will also delete all beds in this room.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoom(roomId, {
                pg_id: selectedPGLocationId || undefined,
                organization_id: user?.organization_id,
                user_id: user?.s_no,
              });
              Alert.alert('Success', 'Room deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete room');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenLayout>
        <ScreenHeader
          title="Room Details"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>
            Loading room details...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!room) {
    return (
      <ScreenLayout>
        <ScreenHeader
          title="Room Details"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>❌</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: Theme.colors.text.primary }}>
            Room Not Found
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScreenHeader
        title={`Room ${room.room_no}`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header Card */}
        <Card style={{ margin: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: Theme.colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 32 }}>🏠</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: Theme.colors.text.primary }}>
                Room {room.room_no}
              </Text>
              <Text style={{ fontSize: 13, color: Theme.colors.text.tertiary, marginTop: 4 }}>
                ID: {room.s_no}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleEdit}
              style={{
                flex: 1,
                backgroundColor: '#3B82F6',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>✏️ Edit Room</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                flex: 1,
                backgroundColor: '#EF4444',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Room Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
          <Card
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: '#F0FDF4',
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            }}
          >
            <Text style={{ fontSize: 11, color: '#059669', fontWeight: '600', marginBottom: 4 }}>
              MONTHLY RENT
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#047857' }}>
              ₹{room.rent_price || 0}
            </Text>
          </Card>

          <Card
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: '#EFF6FF',
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6',
            }}
          >
            <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '600', marginBottom: 4 }}>
              TOTAL BEDS
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1D4ED8' }}>
              {room.total_beds || 0}
            </Text>
          </Card>
        </View>

        {/* PG Location Info */}
        {room.pg_locations && (
          <Card style={{ margin: 16, marginTop: 0, padding: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Theme.colors.text.primary,
                marginBottom: 12,
              }}
            >
              📍 PG Location
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>
              {room.pg_locations.location_name}
            </Text>
            <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, marginTop: 4 }}>
              Location ID: {room.pg_locations.s_no}
            </Text>
          </Card>
        )}

        {/* Beds List */}
        <Card style={{ margin: 16, marginTop: 0, padding: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary }}>
              🛏️ Beds ({room.beds?.length || 0})
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddBed', { roomId: room.s_no })}
              style={{
                backgroundColor: Theme.colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>+ Add Bed</Text>
            </TouchableOpacity>
          </View>

          {room.beds && room.beds.length > 0 ? (
            <View style={{ gap: 8 }}>
              {room.beds.map((bed, index) => (
                <View
                  key={bed.s_no}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: '#F9FAFB',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Theme.colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#EFF6FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>🛏️</Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: Theme.colors.text.primary,
                        }}
                      >
                        Bed {bed.bed_no}
                      </Text>
                      <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
                        ID: {bed.s_no}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('BedDetails', { bedId: bed.s_no })}
                    style={{
                      backgroundColor: '#3B82F6',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>View</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🛏️</Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginBottom: 4 }}>
                No beds added yet
              </Text>
              <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary, textAlign: 'center' }}>
                Add beds to this room to start assigning tenants
              </Text>
            </View>
          )}
        </Card>

        {/* Bottom Spacing */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenLayout>
  );
};
