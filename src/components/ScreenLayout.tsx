import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  contentBackgroundColor?: string;
  style?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  backgroundColor = Theme.colors.primary,
  contentBackgroundColor = Theme.colors.light,
  style,
}) => {
  return (
    <View style={{ flex: 1, backgroundColor }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {children}
      </SafeAreaView>
    </View>
  );
};
