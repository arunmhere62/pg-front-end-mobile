import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { PGLocationSelector } from './PGLocationSelector';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showPGSelector?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  children?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  subtitle, 
  showPGSelector = false,
  showBackButton = false,
  onBackPress,
  children 
}) => {
  return (
    <View style={{ backgroundColor: Theme.colors.primary, padding: 16, paddingTop: 0, paddingBottom: 12 }}>
      <View style={{ marginBottom: (children || showPGSelector) ? 8 : 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Back Button */}
          {showBackButton && onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={{
                marginRight: 8,
                padding: 4,
              }}
            >
              <Text style={{ color: Theme.colors.text.inverse, fontSize: 24, fontWeight: 'bold' }}>
                ←
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Title and Subtitle */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ color: Theme.colors.text.inverse, fontSize: 20, fontWeight: 'bold' }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{ color: Theme.withOpacity(Theme.colors.text.inverse, 0.8), fontSize: 13 }}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
      {showPGSelector && <PGLocationSelector />}
      {children}
    </View>
  );
};
