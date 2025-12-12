import React from 'react';
import { RentPaymentsScreen } from './RentPaymentsScreen';

interface PaymentsScreenProps {
  navigation: any;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  return <RentPaymentsScreen navigation={navigation} />;
};
