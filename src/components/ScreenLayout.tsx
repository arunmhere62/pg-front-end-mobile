import React, { useEffect } from 'react';
import { View, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  /** Background color for the entire screen (status bar area) */
  backgroundColor?: string;
  /** Background color for the content area (optional, if different from main bg) */
  contentBackgroundColor?: string;
  style?: ViewStyle;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  backgroundColor = Theme.colors.background.primary,
  contentBackgroundColor,
  style,
}) => {
  // Set status bar background color to match screen
  useEffect(() => {
    StatusBar.setBackgroundColor(backgroundColor, true);
  }, [backgroundColor]);

  return (
    <View style={{ flex: 1, backgroundColor  }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }} edges={['top']}>
        {children}
      </SafeAreaView>
    </View>
  );
};
