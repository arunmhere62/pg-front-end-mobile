import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { DatePicker } from '../../../components/DatePicker';
import { Theme } from '../../../theme';

interface CheckoutDateModalProps {
  visible: boolean;
  tenantName: string;
  checkoutDate: string;
  loading: boolean;
  onDateChange: (date: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const CheckoutDateModal: React.FC<CheckoutDateModalProps> = ({
  visible,
  tenantName,
  checkoutDate,
  loading,
  onDateChange,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          width: '85%',
          maxWidth: 400,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: Theme.colors.text.primary,
            marginBottom: 16,
          }}>
            Change Checkout Date
          </Text>
          
          <Text style={{
            fontSize: 14,
            color: Theme.colors.text.secondary,
            marginBottom: 20,
          }}>
            Update the checkout date for {tenantName}
          </Text>

          <DatePicker
            label="New Checkout Date"
            value={checkoutDate}
            onChange={onDateChange}
          />

          <View style={{
            flexDirection: 'row',
            gap: 12,
            marginTop: 24,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: Theme.colors.text.primary,
                fontWeight: '600',
                fontSize: 16,
              }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: loading ? '#9CA3AF' : Theme.colors.primary,
                alignItems: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: 16,
                }}>
                  Update
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
