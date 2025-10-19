import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTenants } from '../../store/slices/tenantSlice';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';

interface TenantsScreenProps {
  navigation: any;
}

export const TenantsScreen: React.FC<TenantsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tenants, loading } = useSelector((state: RootState) => state.tenants);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      await dispatch(fetchTenants()).unwrap();
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenants();
    setRefreshing(false);
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone_no?.includes(searchQuery) ||
    tenant.tenant_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTenantItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TenantDetails', { tenantId: item.s_no })}
    >
      <Card className="mb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-dark mb-1">{item.name}</Text>
            <Text className="text-gray-600 text-sm mb-1">ID: {item.tenant_id}</Text>
            {item.phone_no && (
              <Text className="text-gray-600 text-sm">📞 {item.phone_no}</Text>
            )}
            {item.occupation && (
              <Text className="text-gray-600 text-sm">💼 {item.occupation}</Text>
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
        <View className="mt-3 pt-3 border-t border-gray-200">
          <Text className="text-xs text-gray-500">
            Check-in: {new Date(item.check_in_date).toLocaleDateString()}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      <ScreenHeader title="Tenants">
          <TextInput
            className="bg-white rounded-lg px-4 py-3"
            placeholder="Search tenants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </ScreenHeader>

        <View style={{ flex: 1, backgroundColor: Theme.colors.light, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-600">
            {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''} found
          </Text>
          <Button
            title="+ Add Tenant"
            onPress={() => navigation.navigate('AddTenant')}
            className="py-2 px-4"
          />
        </View>

        <FlatList
          data={filteredTenants}
          renderItem={renderTenantItem}
          keyExtractor={(item) => item.s_no.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-500 text-lg">No tenants found</Text>
            </View>
          }
        />
        </View>
    </ScreenLayout>
  );
};
