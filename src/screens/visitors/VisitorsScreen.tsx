import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { fetchVisitors, deleteVisitor } from '../../store/slices/visitorSlice';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { CONTENT_COLOR } from '@/constant';

interface VisitorsScreenProps {
  navigation: any;
}

export const VisitorsScreen: React.FC<VisitorsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { visitors, pagination, loading } = useSelector((state: RootState) => state.visitors);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [visibleItemsCount, setVisibleItemsCount] = useState(0);
  const [convertedFilter, setConvertedFilter] = useState<'ALL' | 'CONVERTED' | 'NOT_CONVERTED'>('ALL');
  
  const flatListRef = React.useRef<any>(null);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadVisitors(1, true);
  }, [selectedPGLocationId, convertedFilter]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentPage === 1) {
        loadVisitors(1, true);
      }
    }, [selectedPGLocationId, convertedFilter])
  );

  const loadVisitors = async (page: number, reset: boolean = false) => {
    try {
      if (!hasMore && !reset) return;
      
      setCurrentPage(page);
      
      const params: any = {
        page,
        limit: 20,
        search: searchQuery || undefined,
        append: !reset && page > 1,
      };

      if (convertedFilter === 'CONVERTED') {
        params.converted_to_tenant = true;
      } else if (convertedFilter === 'NOT_CONVERTED') {
        params.converted_to_tenant = false;
      }

      const result = await dispatch(fetchVisitors(params)).unwrap();
      
      setHasMore(result.pagination ? page < result.pagination.totalPages : false);
      
      if (flatListRef.current && reset) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    } catch (error) {
      console.error('Error loading visitors:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    await loadVisitors(1, true);
    setRefreshing(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setHasMore(true);
    loadVisitors(1, true);
  };

  const loadMoreVisitors = () => {
    if (!hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    loadVisitors(nextPage, false);
  };

  const handleViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const lastVisibleIndex = viewableItems[viewableItems.length - 1]?.index || 0;
      setVisibleItemsCount(lastVisibleIndex + 1);
    }
  }, []);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const handleDeleteVisitor = (id: number, name: string) => {
    Alert.alert(
      'Delete Visitor',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteVisitor(id)).unwrap();
              Alert.alert('Success', 'Visitor deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to delete visitor');
            }
          },
        },
      ]
    );
  };

  const renderVisitorCard = ({ item }: { item: any }) => {
    const visitorName = item?.visitor_name || 'Unknown Visitor';
    const phoneNo = item?.phone_no || 'N/A';
    const purpose = item?.purpose || '';
    const visitedDate = item?.visited_date || '';
    const remarks = item?.remarks || '';
    
    return (
    <Card style={{ marginBottom: 12, padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 4 }}>
            {visitorName}
          </Text>
          {item.convertedTo_tenant && (
            <View style={{ 
              backgroundColor: Theme.withOpacity(Theme.colors.secondary, 0.1), 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 6,
              alignSelf: 'flex-start',
              marginTop: 4,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Theme.colors.secondary }}>
                ✓ CONVERTED TO TENANT
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddVisitor', { visitorId: item?.s_no })}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: Theme.colors.background.blueLight,
            }}
          >
            <Ionicons name="pencil" size={18} color={Theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteVisitor(item?.s_no, visitorName)}
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#FEE2E2',
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name="call-outline" size={16} color={Theme.colors.text.secondary} />
        <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginLeft: 8 }}>
          {phoneNo}
        </Text>
      </View>

      {/* Purpose */}
      {purpose && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="document-text-outline" size={16} color={Theme.colors.text.secondary} />
          <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginLeft: 8 }}>
            {purpose}
          </Text>
        </View>
      )}

      {/* Visit Date */}
      {visitedDate && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="calendar-outline" size={16} color={Theme.colors.text.secondary} />
          <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginLeft: 8 }}>
            {new Date(visitedDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      )}

      {/* Room & Bed Info */}
      {(item.rooms || item.beds) && (
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Theme.colors.border }}>
          {item.rooms && (
            <View>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Room</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {item.rooms.room_no}
              </Text>
            </View>
          )}
          {item.beds && (
            <View>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Bed</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                {item.beds.bed_no}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Remarks */}
      {remarks && (
        <View style={{ marginTop: 12, padding: 12, backgroundColor: Theme.colors.background.secondary, borderRadius: 8 }}>
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary, marginBottom: 4 }}>Remarks</Text>
          <Text style={{ fontSize: 13, color: Theme.colors.text.secondary }}>
            {remarks}
          </Text>
        </View>
      )}
    </Card>
    );
  };

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}  contentBackgroundColor ={ CONTENT_COLOR}>
      <ScreenHeader 
        title="Visitors" 
        subtitle={`${pagination?.total || 0} total`}
        showPGSelector={true}
      />

      {/* Search & Filter Bar */}
      <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: Theme.colors.background.secondary,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 14,
            }}
            placeholder="Search by name, phone, purpose..."
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
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['ALL', 'CONVERTED', 'NOT_CONVERTED'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setConvertedFilter(filter as any)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: convertedFilter === filter ? Theme.colors.primary : '#F3F4F6',
                borderWidth: 1,
                borderColor: convertedFilter === filter ? Theme.colors.primary : Theme.colors.border,
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: convertedFilter === filter ? '#fff' : Theme.colors.text.secondary,
              }}>
                {filter === 'ALL' ? 'All' : filter === 'CONVERTED' ? 'Converted' : 'Not Converted'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scroll Position Indicator */}
      {visibleItemsCount > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 160,
          right: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          zIndex: 1000,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '700', 
            color: '#fff',
            textAlign: 'center',
          }}>
            {visibleItemsCount} of {pagination?.total || visitors.length}
          </Text>
          <Text style={{ 
            fontSize: 10, 
            color: '#fff',
            opacity: 0.8,
            textAlign: 'center',
            marginTop: 2,
          }}>
            {(pagination?.total || visitors.length) - visibleItemsCount} remaining
          </Text>
        </View>
      )}

      {/* Visitors List */}
      {loading && visitors.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={{ marginTop: 16, color: Theme.colors.text.secondary }}>Loading visitors...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={visitors}
          renderItem={renderVisitorCard}
          keyExtractor={(item) => item.s_no.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>👥</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: Theme.colors.text.primary }}>No Visitors Found</Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text.secondary, marginTop: 8 }}>
                Add your first visitor to get started
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && currentPage > 1 ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={Theme.colors.primary} />
                <Text style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: Theme.colors.text.secondary }}>
                  Loading more...
                </Text>
              </View>
            ) : null
          }
          onEndReached={loadMoreVisitors}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      )}

      {/* Floating Add Visitor Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddVisitor')}
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
    </ScreenLayout>
  );
};
