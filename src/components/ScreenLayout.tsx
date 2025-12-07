import React, { useEffect } from 'react';
import { View, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  /** Background color for the SafeAreaView */
  backgroundColor?: string;
  /** Background color for the content area */
  contentBackgroundColor?: string;
  style?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  backgroundColor = Theme.colors.background.primary,
  contentBackgroundColor = Theme.colors.background.primary,
  style,
}) => {
  return (
    <SafeAreaView 
      style={{ flex: 1,  }} 
      edges={['left', 'right', ]}
    >
      <View style={{ flex: 1, backgroundColor: contentBackgroundColor }}>
        {children}
      </View>
    </SafeAreaView>
  );
};
