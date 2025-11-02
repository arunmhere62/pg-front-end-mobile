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
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { RootState } from '../../store';
import { getAllBeds, getBedsByRoomId, deleteBed, Bed } from '../../services/rooms/bedService';
import { getAllRooms, Room } from '../../services/rooms/roomService';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { BedFormModal } from '../../components/BedFormModal';
import { Ionicons } from '@expo/vector-icons';
import { CONTENT_COLOR } from '@/constant';

interface BedsScreenProps {
  navigation: any;
}

export const BedsScreen: React.FC<BedsScreenProps> = ({ navigation }) => {
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  const { user } = useSelector((state: RootState) => state.auth);

  const [beds, setBeds] = useState<Bed[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  // Filters
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'occupied' | 'available'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [bedModalVisible, setBedModalVisible] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  useEffect(() => {
    loadRooms();
    loadBeds();
  }, [selectedPGLocationId]);

  useEffect(() => {
    loadBeds();
  }, [selectedRoomId, occupancyFilter]);

  // Reload beds when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBeds();
      loadRooms();
    }, [selectedPGLocationId, selectedRoomId, occupancyFilter])
  );

  const loadRooms = async () => {
    if (!selectedPGLocationId) return;

    try {
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
    } catch (error: any) {
      console.error('Failed to load rooms:', error);
    }
  };

  const loadBeds = async () => {
    if (!selectedPGLocationId) return;

    try {
      setLoading(true);

      let response;
      if (selectedRoomId) {
        // Load beds for specific room
        response = await getBedsByRoomId(selectedRoomId, {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        });
      } else {
        // Load all beds
        response = await getAllBeds(
          {
            limit: 100,
          },
          {
            pg_id: selectedPGLocationId,
            organization_id: user?.organization_id,
            user_id: user?.s_no,
          }
        );
      }

      let filteredBeds = response.data;

      // Apply occupancy filter
      if (occupancyFilter === 'occupied') {
        filteredBeds = filteredBeds.filter((bed) => bed.is_occupied);
      } else if (occupancyFilter === 'available') {
        filteredBeds = filteredBeds.filter((bed) => !bed.is_occupied);
      }

      setBeds(filteredBeds);
      setPagination(response.pagination);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load beds');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBeds();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!selectedPGLocationId || !searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await getAllBeds(
        {
          search: searchQuery,
          limit: 100,
        },
        {
          pg_id: selectedPGLocationId,
          organization_id: user?.organization_id,
          user_id: user?.s_no,
        }
      );

      let filteredBeds = response.data;

      // Apply filters
      if (selectedRoomId) {
        filteredBeds = filteredBeds.filter((bed) => bed.room_id === selectedRoomId);
      }
      if (occupancyFilter === 'occupied') {
        filteredBeds = filteredBeds.filter((bed) => bed.is_occupied);
      } else if (occupancyFilter === 'available') {
        filteredBeds = filteredBeds.filter((bed) => !bed.is_occupied);
      }

      setBeds(filteredBeds);
      setPagination(response.pagination);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to search beds');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBed = (bed: Bed) => {
    setSelectedBed(bed);
    setBedModalVisible(true);
  };

  const handleDeleteBed = (bedId: number, bedNo: string) => {
    Alert.alert('Delete Bed', `Are you sure you want to delete Bed ${bedNo}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBed(bedId, {
              pg_id: selectedPGLocationId || undefined,
              organization_id: user?.organization_id,
              user_id: user?.s_no,
            });
            Alert.alert('Success', 'Bed deleted successfully');
            loadBeds();
          } catch (error: any) {
            const backendMsg = error?.response?.data?.message ?? error?.response?.data?.error ?? error?.response?.data?.errors ?? error?.message;
            const msg = Array.isArray(backendMsg) ? backendMsg.join('\n') : backendMsg || 'Failed to delete bed';
            Alert.alert('Error', msg);
          }
        },
      },
    ]);
  };

  const handleBedFormSuccess = async () => {
    await loadBeds();
  };

  const clearFilters = () => {
    setSelectedRoomId(null);
    setOccupancyFilter('all');
    setSearchQuery('');
  };

  const getFilterCount = () => {
    let count = 0;
    if (selectedRoomId) count++;
    if (occupancyFilter !== 'all') count++;
    return count;
  };

  const renderBedCard = ({ item }: { item: Bed }) => (
    <Card style={{ margin: 16, marginBottom: 0, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: item.is_occupied ? '#FEE2E2' : '#DCFCE7',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="bed" size={24} color={item.is_occupied ? '#DC2626' : '#16A34A'} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary }}>{item.bed_no}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: item.is_occupied ? '#DC2626' : '#16A34A',
                }}
              />
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
                {item.is_occupied ? 'Occupied' : 'Available'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleEditBed(item)}
            style={{
              backgroundColor: Theme.colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteBed(item.s_no, item.bed_no)}
            style={{
              backgroundColor: Theme.colors.danger,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Room Info */}
      {item.rooms && (
        <View
          style={{
            backgroundColor: '#F3F4F6',
            padding: 10,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 4 }}>ROOM</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
            {item.rooms.room_no}
          </Text>
        </View>
      )}

      {/* Tenant Info */}
      {item.tenants && item.tenants.length > 0 && (
        <View
          style={{
            backgroundColor: '#FEF3C7',
            padding: 10,
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#F59E0B',
          }}
        >
          <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '600', marginBottom: 4 }}>TENANT</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#78350F' }}>{item.tenants[0].name}</Text>
          {item.tenants[0].phone_no && (
            <Text style={{ fontSize: 12, color: '#92400E', marginTop: 2 }}>{item.tenants[0].phone_no}</Text>
          )}
        </View>
      )}
    </Card>
  );

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue} contentBackgroundColor={CONTENT_COLOR}>
      <ScreenHeader
        onBackPress={() => navigation.goBack()}
        showBackButton
        title="Beds"
        subtitle={`${pagination?.total || 0} total`}
      />
      {/* Search and Filter Bar */}
      <View style={{  padding: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: Theme.colors.background.secondary,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 14,
            }}
            placeholder="Search by bed number..."
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
            <Ionicons name="search" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: getFilterCount() > 0 ? Theme.colors.primary : Theme.colors.light,
              borderRadius: 8,
              paddingHorizontal: 14,
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons name="filter" size={18} color={getFilterCount() > 0 ? '#fff' : Theme.colors.text.primary} />
            {getFilterCount() > 0 && (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: Theme.colors.primary }}>
                  {getFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>
<View style={{flex : 1 , backgroundColor : CONTENT_COLOR}}>
  

      {/* Filter Modal Overlay */}
      <Modal
        visible={showFilters}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: SCREEN_HEIGHT * 0.7,
                ...Theme.colors.shadows.large,
              }}
            >
              {/* Handle Bar */}
              <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: Theme.colors.border,
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: Theme.colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary }}>
                    Filter Beds
                  </Text>
                  {getFilterCount() > 0 && (
                    <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginTop: 2 }}>
                      {getFilterCount()} filter{getFilterCount() > 1 ? 's' : ''} active
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: Theme.colors.light,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={20} color={Theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Filter Content */}
              <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.5 }} contentContainerStyle={{ padding: 20 }}>
                {/* Room Filter */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                    Filter by Room
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setSelectedRoomId(null)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: selectedRoomId === null ? Theme.colors.primary : '#fff',
                        borderWidth: 1,
                        borderColor: selectedRoomId === null ? Theme.colors.primary : Theme.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: selectedRoomId === null ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        All Rooms
                      </Text>
                    </TouchableOpacity>
                    {rooms.map((room) => (
                      <TouchableOpacity
                        key={room.s_no}
                        onPress={() => setSelectedRoomId(room.s_no)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: selectedRoomId === room.s_no ? Theme.colors.primary : '#fff',
                          borderWidth: 1,
                          borderColor: selectedRoomId === room.s_no ? Theme.colors.primary : Theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: selectedRoomId === room.s_no ? '#fff' : Theme.colors.text.secondary,
                          }}
                        >
                          {room.room_no}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Occupancy Filter */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary, marginBottom: 12 }}>
                    Filter by Status
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setOccupancyFilter('all')}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 8,
                        backgroundColor: occupancyFilter === 'all' ? Theme.colors.primary : '#fff',
                        borderWidth: 1,
                        borderColor: occupancyFilter === 'all' ? Theme.colors.primary : Theme.colors.border,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: occupancyFilter === 'all' ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setOccupancyFilter('available')}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 8,
                        backgroundColor: occupancyFilter === 'available' ? '#16A34A' : '#fff',
                        borderWidth: 1,
                        borderColor: occupancyFilter === 'available' ? '#16A34A' : Theme.colors.border,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: occupancyFilter === 'available' ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        🟢 Available
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setOccupancyFilter('occupied')}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 8,
                        backgroundColor: occupancyFilter === 'occupied' ? '#DC2626' : '#fff',
                        borderWidth: 1,
                        borderColor: occupancyFilter === 'occupied' ? '#DC2626' : Theme.colors.border,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: occupancyFilter === 'occupied' ? '#fff' : Theme.colors.text.secondary,
                        }}
                      >
                        🔴 Occupied
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Footer Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  padding: 20,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: Theme.colors.border,
                }}
              >
                {getFilterCount() > 0 && (
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: Theme.colors.light,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                      Clear Filters
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: Theme.colors.primary,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 12, color: Theme.colors.text.secondary }}>Loading beds...</Text>
        </View>
      ) : beds.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Ionicons name="bed-outline" size={64} color={Theme.colors.text.tertiary} />
          <Text style={{ fontSize: 18, fontWeight: '600', color: Theme.colors.text.primary, marginTop: 16, marginBottom: 8 }}>
            No Beds Found
          </Text>
          <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, textAlign: 'center' }}>
            {getFilterCount() > 0 ? 'Try adjusting your filters' : 'Add your first bed to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={beds}
          renderItem={renderBedCard}
          keyExtractor={(item) => item.s_no.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Bed Form Modal - Only for editing */}
      <BedFormModal
        visible={bedModalVisible}
        onClose={() => setBedModalVisible(false)}
        onSuccess={handleBedFormSuccess}
        roomId={selectedBed?.room_id || 0}
        roomNo={selectedBed?.rooms?.room_no || ''}
        bed={selectedBed}
        pgId={selectedPGLocationId || undefined}
        organizationId={user?.organization_id}
        userId={user?.s_no}
      />
</View>
    </ScreenLayout>
  );
};
