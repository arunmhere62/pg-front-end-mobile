import React from 'react';
import { View, Text } from 'react-native';
import { Theme } from '../theme';
import { PGLocationSelector } from './PGLocationSelector';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showPGSelector?: boolean;
  children?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  subtitle, 
  showPGSelector = false,
  children 
}) => {
  return (
    <View style={{ backgroundColor: Theme.colors.primary, padding: 16, paddingTop: 0, paddingBottom: 12 }}>
      <View style={{ marginBottom: (children || showPGSelector) ? 8 : 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
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
      {showPGSelector && <PGLocationSelector />}
      {children}
    </View>
  );
};
