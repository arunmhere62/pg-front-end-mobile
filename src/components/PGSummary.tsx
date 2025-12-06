import React, { memo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from './Card';
import { Theme } from '../theme';
import { CardSkeleton } from './SkeletonLoader';

interface PGSummaryData {
  pgLocation: {
    id: number;
    name: string;
    address: string;
    status: string;
  };
  rooms: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
    occupancyRate: number;
  };
  beds: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
    occupancyRate: number;
  };
  tenants: {
    total: number;
    active: number;
    inactive: number;
  };
  employees: {
    total: number;
  };
}

interface PGSummaryProps {
  summary: PGSummaryData | null;
  loading: boolean;
}

const PGSummaryComponent: React.FC<PGSummaryProps> = ({ summary, loading }) => {
  return (
    <View style={{ marginBottom: 30, backgroundColor: '', paddingVertical: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 12, paddingHorizontal: 16 }}>
        📊 PG Summary
      </Text>
      
      {loading ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 10 }}
        >
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </ScrollView>
      ) : summary && summary.rooms && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8 }}
        >
          {/* Rooms Card */}
          <Card style={{ width: 150, padding: 12, backgroundColor: 'white', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18 }}>🏠</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F2937' }}>{summary.rooms?.total || 0}</Text>
              </View>
              <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Rooms</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#10B981' }}>{summary.rooms?.occupied || 0}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>OCCUPIED</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#F59E0B' }}>{summary.rooms?.vacant || 0}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>VACANT</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#EF4444' }}>{summary.rooms?.maintenance || 0}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>MAINT</Text>
              </View>
            </View>
          </Card>

          {/* Beds Card */}
          <Card style={{ width: 150, padding: 12, backgroundColor: 'white', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18 }}>🛏️</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F2937' }}>{summary.beds.total}</Text>
              </View>
              <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Beds</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#10B981' }}>{summary.beds.occupied}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>OCCUPIED</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#F59E0B' }}>{summary.beds.vacant}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>VACANT</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#EF4444' }}>{summary.beds.maintenance}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>MAINT</Text>
              </View>
            </View>
          </Card>

          {/* Tenants Card */}
          <Card style={{ width: 150, padding: 12, backgroundColor: 'white', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18 }}>👥</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F2937' }}>{summary.tenants.total}</Text>
              </View>
              <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tenants</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#10B981' }}>{summary.tenants.active}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>ACTIVE</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#6B7280' }}>{summary.tenants.inactive}</Text>
                <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', marginTop: 1 }}>INACTIVE</Text>
              </View>
            </View>
          </Card>

          {/* Employees Card */}
          <Card style={{ width: 150, padding: 12, backgroundColor: 'white', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18 }}>👔</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F2937' }}>{summary.employees.total}</Text>
              </View>
              <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Employees</Text>
            </View>
            <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>
              <Text style={{ fontSize: 7, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>STAFF MEMBERS</Text>
            </View>
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

// Custom comparison function to prevent re-renders when only unrelated props change
export const PGSummary = memo(PGSummaryComponent, (prevProps, nextProps) => {
  return prevProps.summary === nextProps.summary && prevProps.loading === nextProps.loading;
});

PGSummary.displayName = 'PGSummary';
