import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  // Animation value for back button
  const backButtonScale = new Animated.Value(1);

  const handleBackPressIn = () => {
    Animated.spring(backButtonScale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleBackPressOut = () => {
    Animated.spring(backButtonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };
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
    
    // Set notification bar background color (Android only)
    // Priority: notificationBarColor > syncMobileHeaderBg > ScreenLayout default
    if (Platform.OS === 'android') {
      if (notificationBarColor) {
        StatusBar.setBackgroundColor(notificationBarColor, true);
      } else if (syncMobileHeaderBg) {
        StatusBar.setBackgroundColor(backgroundColor, true);
      }
    }
  }, [backgroundColor, statusBarStyle, syncMobileHeaderBg, notificationBarColor]);

  return (
    <View style={{ backgroundColor, padding: 8, paddingTop: 0, paddingBottom: 14 }}>
      <View style={{ marginBottom: (children || showPGSelector) ? 4 : 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Back Button */}
          {showBackButton && onBackPress && (
            <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
              <TouchableOpacity
                onPress={onBackPress}
                onPressIn={handleBackPressIn}
                onPressOut={handleBackPressOut}
                activeOpacity={0.6}
                style={{
                  marginRight: 12,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: Theme.withOpacity('#000000', 0.4),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="chevron-back" size={18} color={textColor} />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Title and Subtitle */}
          <View style={{ flex: 1 }}>
            <Text 
              style={{ color: textColor, fontSize: 20, fontWeight: 'bold' }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {subtitle && (
              <Text 
                style={{ color: Theme.withOpacity(textColor, 0.8), fontSize: 13, marginTop: 2 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
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
