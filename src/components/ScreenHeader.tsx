import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Theme } from '../theme';
import { PGLocationSelector } from './PGLocationSelector';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showPGSelector?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  children?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  /** Sync mobile notification bar (status bar) background with header background */
  syncMobileHeaderBg?: boolean;
  /** Custom color for notification bar (status bar) - overrides syncMobileHeaderBg */
  notificationBarColor?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ 
  title, 
  subtitle, 
  showPGSelector = false,
  showBackButton = false,
  onBackPress,
  children,
  backgroundColor = Theme.colors.background.blue,
  textColor = Theme.colors.text.inverse,
  statusBarStyle = 'auto',
  syncMobileHeaderBg = false,
  notificationBarColor
}) => {
  // Auto-detect status bar style based on background color
  useEffect(() => {
    let style: 'light' | 'dark' = 'light';
    
    if (statusBarStyle === 'auto') {
      // Check if background is light or dark
      const isDarkBackground = 
        backgroundColor === Theme.colors.background.blue ||
        backgroundColor === Theme.colors.background.blueDark ||
        backgroundColor === Theme.colors.primary ||
        backgroundColor === Theme.colors.primaryDark;
      
      style = isDarkBackground ? 'light' : 'dark';
    } else {
      style = statusBarStyle;
    }
    
    StatusBar.setBarStyle(style === 'light' ? 'light-content' : 'dark-content', true);
    
    // Set notification bar background color
    // Priority: notificationBarColor > syncMobileHeaderBg > ScreenLayout default
    if (notificationBarColor) {
      StatusBar.setBackgroundColor(notificationBarColor, true);
    } else if (syncMobileHeaderBg) {
      StatusBar.setBackgroundColor(backgroundColor, true);
    }
  }, [backgroundColor, statusBarStyle, syncMobileHeaderBg, notificationBarColor]);

  return (
    <View style={{ backgroundColor, padding: 16, paddingTop: 0, paddingBottom: 12 }}>
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
              <Text style={{ color: textColor, fontSize: 24, fontWeight: 'bold' }}>
                ←
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Title and Subtitle */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{ color: Theme.withOpacity(textColor, 0.8), fontSize: 13 }}>
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
