import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { Theme } from '../../../theme';
import { Tenant } from '../../../services/tenants/tenantService';

interface AccommodationDetailsProps {
  tenant: Tenant;
  onChangeCheckoutDate: () => void;
  onClearCheckout: () => void;
  checkoutLoading: boolean;
}

export const AccommodationDetails: React.FC<AccommodationDetailsProps> = ({
  tenant,
  onChangeCheckoutDate,
  onClearCheckout,
  checkoutLoading,
}) => {
  return (
    <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: Theme.colors.text.primary,
          marginBottom: 12,
        }}
      >
        🏠 Accommodation Details
      </Text>

      <View style={{ gap: 12 }}>
        {tenant.pg_locations && (
          <View>
            <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
              PG Location
            </Text>
            <Text
              style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}
            >
              {tenant.pg_locations.location_name}
            </Text>
            <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
              {tenant.pg_locations.address}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 16 }}>
          {tenant.rooms && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Room</Text>
              <Text
                style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.primary }}
              >
                {tenant.rooms.room_no}
              </Text>
              {tenant.rooms.rent_price && (
                <Text style={{ fontSize: 12, color: Theme.colors.text.secondary }}>
                  ₹{tenant.rooms.rent_price}/month
                </Text>
              )}
            </View>
          )}

          {tenant.beds && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Bed</Text>
              <Text
                style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.primary }}
              >
                {tenant.beds.bed_no}
              </Text>
            </View>
          )}
        </View>

        <View>
          <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>Check-in Date</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
            {new Date(tenant.check_in_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {tenant.check_out_date && (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: Theme.colors.text.tertiary }}>
                  Check-out Date
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: Theme.colors.text.primary }}>
                  {new Date(tenant.check_out_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={onChangeCheckoutDate}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: Theme.colors.primary,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClearCheckout}
                  disabled={checkoutLoading}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: checkoutLoading ? '#9CA3AF' : '#10B981',
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
};
