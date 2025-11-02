import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { Theme } from '../../../theme';
import { Tenant } from '../../../services/tenants/tenantService';

interface TenantHeaderProps {
  tenant: Tenant;
  onEdit: () => void;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
  onEmail: (email: string) => void;
  onAddPayment: () => void;
  onAddAdvance: () => void;
  onAddRefund: () => void;
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
}) => {
  const tenantImage =
    tenant.images && Array.isArray(tenant.images) && tenant.images.length > 0
      ? tenant.images[0]
      : null;

  return (
    <Card style={{ margin: 16, padding: 16, position: 'relative' }}>
      {/* Edit Button - Top Right Corner */}
      <TouchableOpacity
        onPress={onEdit}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: '#fff',
          borderRadius: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text style={{ color: Theme.colors.primary, fontWeight: '600', fontSize: 14 }}>✏️ Edit</Text>
      </TouchableOpacity>

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
              {tenant.name.charAt(0).toUpperCase()}
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
            {tenant.name}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: Theme.colors.text.tertiary,
              marginBottom: 8,
            }}
          >
            ID: {tenant.tenant_id}
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
              {tenant.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {tenant.phone_no && (
          <TouchableOpacity
            onPress={() => onCall(tenant.phone_no!)}
            style={{
              flex: 1,
              paddingVertical: 10,
              backgroundColor: '#3B82F6',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>📞 Call</Text>
          </TouchableOpacity>
        )}
        {tenant.whatsapp_number && (
          <TouchableOpacity
            onPress={() => onWhatsApp(tenant.whatsapp_number!)}
            style={{
              flex: 1,
              paddingVertical: 10,
              backgroundColor: '#25D366',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>💬 WhatsApp</Text>
          </TouchableOpacity>
        )}
        {tenant.email && (
          <TouchableOpacity
            onPress={() => onEmail(tenant.email!)}
            style={{
              flex: 1,
              paddingVertical: 10,
              backgroundColor: '#EF4444',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>✉️ Email</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          onPress={onAddPayment}
          style={{
            flex: 1,
            paddingVertical: 12,
            backgroundColor: '#10B981',
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>💰</Text>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={onAddAdvance}
          style={{
            flex: 1,
            paddingVertical: 12,
            backgroundColor: '#8B5CF6',
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>🎁</Text>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Advance</Text>
        </TouchableOpacity>
      </View>
      
      {/* Refund Button */}
      <View style={{ marginTop: 8 }}>
        <TouchableOpacity
          onPress={onAddRefund}
          style={{
            paddingVertical: 12,
            backgroundColor: '#F97316',
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>🔄</Text>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Refund</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};
