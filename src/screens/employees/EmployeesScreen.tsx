import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import employeeService, { Employee } from '../../services/employeeService';
import { CONTENT_COLOR } from '@/constant';

interface EmployeesScreenProps {
  navigation: any;
}

export const EmployeesScreen: React.FC<EmployeesScreenProps> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedPGLocationId } = useSelector((state: RootState) => state.pgLocations);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, [selectedPGLocationId, search]);

  const loadEmployees = async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const response = await employeeService.getEmployees(
        pageNum,
        20,
        selectedPGLocationId || undefined,
        undefined,
        search || undefined,
      );

      if (response.success) {
        if (append) {
          setEmployees(prev => [...prev, ...response.data]);
        } else {
          setEmployees(response.data);
        }
        setHasMore(response.pagination.hasMore);
        setPage(pageNum);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEmployees(1, false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadEmployees(page + 1, true);
    }
  };

  const handleDelete = (employee: Employee) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeeService.deleteEmployee(employee.s_no);
              Alert.alert('Success', 'Employee deleted successfully');
              loadEmployees(1, false);
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message || 'Failed to delete employee');
            }
          },
        },
      ]
    );
  };

  const renderEmployeeCard = (employee: Employee) => (
    <Card key={employee.s_no} style={{ marginBottom: 12, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, flex: 1 }}>
              {employee.name}
            </Text>
            <View
              style={{
                backgroundColor: employee.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: employee.status === 'ACTIVE' ? '#16A34A' : '#DC2626',
                }}
              >
                {employee.status}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="briefcase-outline" size={14} color={Theme.colors.text.secondary} />
            <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginLeft: 6 }}>
              {employee.roles?.role_name || 'N/A'}
            </Text>
          </View>

          {employee.email && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="mail-outline" size={14} color={Theme.colors.text.secondary} />
              <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginLeft: 6 }}>
                {employee.email}
              </Text>
            </View>
          )}

          {employee.phone && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="call-outline" size={14} color={Theme.colors.text.secondary} />
              <Text style={{ fontSize: 13, color: Theme.colors.text.secondary, marginLeft: 6 }}>
                {employee.phone}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', marginLeft: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEmployee', { employeeId: employee.s_no })}
            style={{
              padding: 8,
              backgroundColor: '#EEF2FF',
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Ionicons name="create-outline" size={18} color={Theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(employee)}
            style={{
              padding: 8,
              backgroundColor: '#FEE2E2',
              borderRadius: 8,
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue}>
      <ScreenHeader
        title="Employees"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
      />

      <View style={{ flex: 1, backgroundColor: CONTENT_COLOR }}>
        {/* Search Bar */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: Theme.colors.border,
            }}
          >
            <Ionicons name="search" size={20} color={Theme.colors.text.tertiary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search employees..."
              style={{
                flex: 1,
                padding: 12,
                fontSize: 14,
                color: Theme.colors.text.primary,
              }}
            />
          </View>
        </View>

        {/* Employee List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {employees.length === 0 && !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="people-outline" size={64} color={Theme.colors.text.tertiary} />
              <Text style={{ fontSize: 16, color: Theme.colors.text.secondary, marginTop: 16 }}>
                No employees found
              </Text>
            </View>
          ) : (
            employees.map(renderEmployeeCard)
          )}

          {loading && page === 1 && (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 20 }} />
          )}

          {loading && page > 1 && (
            <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginVertical: 16 }} />
          )}
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddEmployee')}
          style={{
            position: 'absolute',
            bottom: 80,
            right: 16,
            backgroundColor: Theme.colors.primary,
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};
