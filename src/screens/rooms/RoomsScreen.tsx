import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { RootState } from '../../store';
import { getAllRooms, deleteRoom, Room, getRoomById } from '../../services/rooms/roomService';
import { awsS3ServiceBackend as awsS3Service, S3Utils } from '../../services/storage/awsS3ServiceBackend';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { EditRoomModal } from './EditRoomModal';
import { CONTENT_COLOR } from '@/constant';
import { CurrentBillModal } from './CurrentBillModal';

interface RoomsScreenProps {
  navigation: any;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({ navigation }) => {
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<any>(null);
  
  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  // Current bill modal state
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [selectedRoomForBill, setSelectedRoomForBill] = useState<Room | null>(null);

  useEffect(() => {
    loadRooms();
  }, [selectedPGLocationId]);

  // Reload rooms when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRooms();
    }, [selectedPGLocationId])
  );

  const loadRooms = async () => {
    if (!selectedPGLocationId) return;
    
    try {
      setLoading(true);
      const response = await getAllRooms(
        {
          pg_id: selectedPGLocationId,
          limit: 100,
        },
        {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        }
      );
      
      setRooms(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!selectedPGLocationId) return;
    
    try {
      setLoading(true);
      const response = await getAllRooms(
        {
          pg_id: selectedPGLocationId,
          search: searchQuery,
          limit: 100,
        },
        {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        }
      );
      
      setRooms(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to search rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (roomId: number) => {
    setEditingRoomId(roomId);
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingRoomId(null);
  };

  const handleEditSuccess = () => {
    loadRooms();
  };

  const handleOpenBillModal = (room: Room) => {
    setSelectedRoomForBill(room);
    setBillModalVisible(true);
  };

  const handleCloseBillModal = () => {
    setBillModalVisible(false);
    setSelectedRoomForBill(null);
  };

  const handleBillSuccess = () => {
    loadRooms();
  };

  const handleDeleteRoom = (roomId: number, roomNo: string) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete Room ${roomNo}? This will also delete all associated images from cloud storage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // First, get room data to access images
              console.log('Fetching room data for deletion...');
              const roomResponse = await getRoomById(roomId, {
                pg_id: selectedPGLocationId || undefined,
                organization_id: user?.organization_id,
                user_id: user?.s_no,
              });

              // Delete S3 images if they exist
              if (roomResponse.data.images && Array.isArray(roomResponse.data.images)) {
                console.log('Deleting S3 images for room:', roomResponse.data.images);
                
                const s3DeletePromises = roomResponse.data.images
                  .filter(imageUrl => imageUrl && imageUrl.includes('amazonaws.com'))
                  .map(async (imageUrl) => {
                    try {
                      const key = S3Utils.extractKeyFromUrl(imageUrl);
                      if (key) {
                        console.log('Deleting S3 image:', key);
                        await awsS3Service.deleteFile(key);
                      }
                    } catch (s3Error) {
                      console.warn('Failed to delete S3 image:', imageUrl, s3Error);
                      // Continue with room deletion even if S3 deletion fails
                    }
                  });

                await Promise.all(s3DeletePromises);
                console.log('S3 images deleted successfully');
              }

              // Delete room from database
              await deleteRoom(roomId, {
                pg_id: selectedPGLocationId || undefined,
                organization_id: user?.organization_id,
                user_id: user?.s_no,
              });
              
              Alert.alert('Success', 'Room and all associated images deleted successfully');
              loadRooms();
            } catch (error: any) {
              console.error('Delete room error:', error);
              Alert.alert('Error', error?.response?.data?.message || error.message || 'Failed to delete room');
            }
          },
        },
      ]
    );
  };

  const renderRoomCard = ({ item }: { item: Room }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RoomDetails', { roomId: item.s_no })}
      activeOpacity={0.7}
    >
      <Card className='' style={{ margin: 16, marginBottom: 0, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Theme.colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>🏠</Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary }}>
                Room {item.room_no}
              </Text>
              <Text style={{ fontSize: 12, color: Theme.colors.text.tertiary }}>
                ID: {item.s_no}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleOpenBillModal(item)}
              style={{
                backgroundColor: '#F59E0B',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenEditModal(item.s_no)}
              style={{
                backgroundColor: '#3B82F6',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteRoom(item.s_no, item.room_no)}
              style={{
                backgroundColor: '#EF4444',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flex: 1, minWidth: '45%' }}>
            <View
              style={{
                backgroundColor: '#F0FDF4',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#10B981',
              }}
            >
              <Text style={{ fontSize: 10, color: '#059669', fontWeight: '600', marginBottom: 4 }}>
                MONTHLY RENT
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#047857' }}>
                ₹{item.rent_price || 0}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1, minWidth: '45%' }}>
            <View
              style={{
                backgroundColor: '#EFF6FF',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#3B82F6',
              }}
            >
              <Text style={{ fontSize: 10, color: '#2563EB', fontWeight: '600', marginBottom: 4 }}>
                TOTAL BEDS
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1D4ED8' }}>
                {item.total_beds || 0}
              </Text>
            </View>
          </View>
        </View>

        {item.pg_locations && (
          <View
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: Theme.colors.border,
            }}
          >
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
              📍 {item.pg_locations.location_name}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader 
        onBackPress={() => navigation.goBack()} 
        showBackButton 
        title="Rooms" 
        subtitle={`${pagination?.total || 0} total`}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
      />
      <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: Theme.colors.background.secondary,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 14,
            }}
            placeholder="Search by room number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              backgroundColor: Theme.colors.primary,
              borderRadius: 8,
              paddingHorizontal: 14,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{flex : 1, backgroundColor : CONTENT_COLOR}}>

      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 12, color: Theme.colors.text.secondary }}>Loading rooms...</Text>
        </View>
      ) : rooms.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🏠</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 8 }}>
            No Rooms Found
          </Text>
          <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
            {searchQuery ? 'Try a different search term' : 'Add your first room to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoomCard}
          keyExtractor={(item) => item.s_no.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      </View>

      <TouchableOpacity
        onPress={() => {
          setEditingRoomId(null);
          setEditModalVisible(true);
        }}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 80,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: Theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      {/* Edit Room Modal */}
      <EditRoomModal
        visible={editModalVisible}
        roomId={editingRoomId}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Current Bill Modal */}
      {selectedRoomForBill && (
        <CurrentBillModal
          visible={billModalVisible}
          room={selectedRoomForBill}
          onClose={handleCloseBillModal}
          onSuccess={handleBillSuccess}
        />
      )}
    </ScreenLayout>
  );
};
