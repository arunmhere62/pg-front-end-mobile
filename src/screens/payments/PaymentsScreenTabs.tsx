import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { RentPaymentsScreen } from './RentPaymentsScreen';
import { AdvancePaymentScreen } from './AdvancePaymentScreen';
import { RefundPaymentScreen } from './RefundPaymentScreen';

interface PaymentsScreenProps {
  navigation: any;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'RENT' | 'ADVANCE' | 'REFUND'>('RENT');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'RENT':
        return <RentPaymentsScreen navigation={navigation} />;
      case 'ADVANCE':
        return <AdvancePaymentScreen navigation={navigation} />;
      case 'REFUND':
        return <RefundPaymentScreen navigation={navigation} />;
      default:
        return <RentPaymentsScreen navigation={navigation} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background.blue }}>
      <ScreenHeader
        title="Tenant Payments"
        backgroundColor={Theme.colors.background.blue}
        syncMobileHeaderBg={true}
        showPGSelector={true}
      />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('RENT')}
          style={{
            minWidth: 140,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'RENT' ? Theme.colors.primary : Theme.colors.canvas,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: activeTab === 'RENT' ? Theme.colors.primary : Theme.colors.border,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'RENT' ? '#fff' : Theme.colors.text.secondary,
            }}
          >
            💰 Rent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('ADVANCE')}
          style={{
            minWidth: 140,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'ADVANCE' ? Theme.colors.primary : Theme.colors.canvas,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: activeTab === 'ADVANCE' ? Theme.colors.primary : Theme.colors.border,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'ADVANCE' ? '#fff' : Theme.colors.text.secondary,
            }}
          >
            🎁 Advance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('REFUND')}
          style={{
            minWidth: 140,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: activeTab === 'REFUND' ? Theme.colors.primary : Theme.colors.canvas,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: activeTab === 'REFUND' ? Theme.colors.primary : Theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'REFUND' ? '#fff' : Theme.colors.text.secondary,
            }}
          >
            💸 Refunds
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>
    </View>
  );
};
