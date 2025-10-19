import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPGLocations } from '../../store/slices/pgLocationSlice';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

interface PGLocationsScreenProps {
  navigation: any;
}

export const PGLocationsScreen: React.FC<PGLocationsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { locations, loading } = useSelector((state: RootState) => state.pgLocations);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      await dispatch(fetchPGLocations()).unwrap();
    } catch (error) {
      console.error('Error loading PG locations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  };

  const renderLocationItem = ({ item }: any) => (
    <Card className="mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold text-dark mb-1">{item.location_name}</Text>
          <Text className="text-gray-600 text-sm mb-1">📍 {item.address}</Text>
          {item.pincode && (
            <Text className="text-gray-600 text-sm">PIN: {item.pincode}</Text>
          )}
        </View>
        <View className={`px-3 py-1 rounded-full ${
          item.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <Text className={`text-xs font-semibold ${
            item.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-700'
          }`}>
            {item.status}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-light">
      <View className="bg-primary p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">PG Locations</Text>
        </View>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-600">
            {locations.length} location{locations.length !== 1 ? 's' : ''}
          </Text>
          <Button
            title="+ Add Location"
            onPress={() => {/* Add navigation */}}
            className="py-2 px-4"
          />
        </View>

        <FlatList
          data={locations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.s_no.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500 text-lg">No PG locations found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};
