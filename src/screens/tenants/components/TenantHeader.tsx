import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { Theme } from '../../../theme';
import { Tenant } from '../../../services/tenants/tenantService';
import { AnimatedPressableCard } from '../../../components/AnimatedPressableCard';

interface TenantHeaderProps {
  tenant: Tenant;
  onEdit: () => void;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
  onEmail: (email: string) => void;
  onAddPayment: () => void;
  onAddAdvance: () => void;
  onAddRefund: () => void;
  onAddCurrentBill?: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({
  tenant,
  onEdit,
  onCall,
  onWhatsApp,
  onEmail,
  onAddPayment,
  onAddAdvance,
  onAddRefund,
  onAddCurrentBill,
}) => {
  // Defensive checks for tenant data
  if (!tenant || !tenant.name) {
    return (
      <Card style={{ marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 16, paddingVertical: 16 }}>
        <Text style={{ color: Theme.colors.text.secondary, textAlign: 'center' }}>
          Loading tenant information...
        </Text>
      </Card>
    );
  }

  const tenantImage =
    tenant.images && Array.isArray(tenant.images) && tenant.images.length > 0
      ? tenant.images[0]
      : null;

  return (
    <Card style={{ marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 16, paddingVertical: 16, position: 'relative' }}>
      {/* Edit Button - Top Right Corner with Animation */}
      <AnimatedPressableCard
        onPress={onEdit}
        scaleValue={0.95}
        duration={100}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: Theme.colors.primary,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Edit</Text>
      </AnimatedPressableCard>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        {/* Tenant Image/Avatar */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            overflow: 'hidden',
          }}
        >
          {tenantImage ? (
            <Image
              source={{ uri: tenantImage }}
              style={{ width: 80, height: 80 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
              {tenant.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          )}
        </View>

        {/* Name and Status */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: Theme.colors.text.primary,
              marginBottom: 4,
            }}
          >
            {tenant.name || 'N/A'}
          </Text>
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor:
                tenant.status === 'ACTIVE' ? '#10B98120' : '#EF444420',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: tenant.status === 'ACTIVE' ? '#10B981' : '#EF4444',
              }}
            >
              {tenant.status || 'UNKNOWN'}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {tenant.phone_no && (
          <AnimatedPressableCard
            onPress={() => onCall(tenant.phone_no!)}
            scaleValue={0.96}
            duration={100}
            style={{ flex: 1 }}
          >
            <View
              style={{
                paddingVertical: 12,
                backgroundColor: Theme.colors.primary,
                borderRadius: 8,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>📞 Call</Text>
            </View>
          </AnimatedPressableCard>
        )}
        {tenant.whatsapp_number && (
          <AnimatedPressableCard
            onPress={() => onWhatsApp(tenant.whatsapp_number!)}
            scaleValue={0.96}
            duration={100}
            style={{ flex: 1 }}
          >
            <View
              style={{
                paddingVertical: 12,
                backgroundColor: Theme.colors.secondary,
                borderRadius: 8,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>💬 WhatsApp</Text>
            </View>
          </AnimatedPressableCard>
        )}
        {tenant.email && (
          <AnimatedPressableCard
            onPress={() => onEmail(tenant.email!)}
            scaleValue={0.96}
            duration={100}
            style={{ flex: 1 }}
          >
            <View
              style={{
                paddingVertical: 12,
                backgroundColor: Theme.colors.warning,
                borderRadius: 8,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✉️ Email</Text>
            </View>
          </AnimatedPressableCard>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <AnimatedPressableCard
          onPress={onAddPayment}
          scaleValue={0.96}
          duration={100}
          style={{ flex: 1 }}
        >
          <View
            style={{
              paddingVertical: 12,
              backgroundColor: Theme.colors.secondary,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18 }}>💰</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Add Payment</Text>
          </View>
        </AnimatedPressableCard>
        
        <AnimatedPressableCard
          onPress={onAddAdvance}
          scaleValue={0.96}
          duration={100}
          style={{ flex: 1 }}
        >
          <View
            style={{
              paddingVertical: 12,
              backgroundColor: Theme.colors.primary,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18 }}>🎁</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Add Advance</Text>
          </View>
        </AnimatedPressableCard>
      </View>
      
      {/* Refund Button */}
      <View style={{ marginTop: 8 }}>
        <AnimatedPressableCard
          onPress={onAddRefund}
          scaleValue={0.96}
          duration={100}
          style={{ width: '100%' }}
        >
          <View
            style={{
              paddingVertical: 12,
              backgroundColor: Theme.colors.danger,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18 }}>🔄</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Add Refund</Text>
          </View>
        </AnimatedPressableCard>
      </View>

      {/* Current Bill Button */}
      {onAddCurrentBill && (
        <View style={{ marginTop: 8 }}>
          <AnimatedPressableCard
            onPress={onAddCurrentBill}
            scaleValue={0.96}
            duration={100}
            style={{ width: '100%' }}
          >
            <View
              style={{
                paddingVertical: 12,
                backgroundColor: '#F59E0B',
                borderRadius: 8,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 18 }}>📊</Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Add Current Bill</Text>
            </View>
          </AnimatedPressableCard>
        </View>
      )}
    </Card>
  );
};
