import React, { memo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Card } from './Card';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  title: string;
  icon: string;
  screen: string;
  color: string;
}

interface QuickActionsProps {
  menuItems: MenuItem[];
  onNavigate: (screen: string) => void;
}

export const QuickActions = memo<QuickActionsProps>(({ menuItems, onNavigate }) => {
  // Split menu items into two rows
  const firstRow = menuItems.slice(0, Math.ceil(menuItems.length / 2));
  const secondRow = menuItems.slice(Math.ceil(menuItems.length / 2));

  const renderActionItem = (item: MenuItem, index: number) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;
    const bgOpacityValue = useRef(new Animated.Value(0)).current;
    
    const handlePressIn = () => {
      // Scale down animation
      Animated.spring(scaleValue, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
      // Fade background in
      Animated.timing(bgOpacityValue, {
        toValue: 0.1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      
      // Slight opacity change
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      // Scale back up
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }).start();
      
      // Fade background out
      Animated.timing(bgOpacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Restore opacity
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handlePressInLong = () => {
      // Longer press - more dramatic animation
      Animated.spring(scaleValue, {
        toValue: 0.88,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }).start();
      
      Animated.timing(bgOpacityValue, {
        toValue: 0.15,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };
    
    return (
      <Animated.View key={index} style={{ 
        transform: [{ scale: scaleValue }], 
        flex: 1,
        paddingHorizontal: 4,
        maxWidth: 120,
        opacity: opacityValue
      }}>
        <TouchableOpacity
          onPress={() => onNavigate(item.screen)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handlePressInLong}
          activeOpacity={1} // We handle opacity ourselves
          style={{ 
            height: 90,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Animated background overlay */}
          <Animated.View 
            style={{
              position: 'absolute',
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              backgroundColor: item.color,
              borderRadius: 20,
              opacity: bgOpacityValue,
            }}
          />
          
          <Card 
            style={{ 
              padding: 12, 
              alignItems: 'center',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              flexDirection: 'column',
              backgroundColor: 'transparent',
              shadowColor: '',
              elevation: 0,
              position: 'relative',
              zIndex: 1
            }}>
            {/* Animated icon container */}
            <Animated.View
              style={{
                width: 36,
                height: 36,
                backgroundColor: item.color,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                transform: [{ scale: scaleValue }]
              }}
            >
              <Ionicons name={item.icon as any} size={18} color="#fff" />
            </Animated.View>
            
            {/* Fixed height text container */}
            <View style={{
              height: 28,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}>
              <Text 
                style={{ 
                  color: Theme.colors.text.primary, 
                  fontWeight: '600', 
                  textAlign: 'center', 
                  fontSize: 11,
                  lineHeight: 14,
                  width: '100%',
                  maxWidth: '100%'
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ marginBottom: 24, marginTop: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16, paddingHorizontal: 16 }}>
        Quick Actions
      </Text>
      
      {/* First Row */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginBottom: 12,
        minHeight: 90
      }}>
        {firstRow.map((item, index) => renderActionItem(item, index))}
      </View>
      
      {/* Second Row */}
      {secondRow.length > 0 && (
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          minHeight: 90
        }}>
          {secondRow.map((item, index) => renderActionItem(item, index + firstRow.length))}
        </View>
      )}
    </View>
  );
});

QuickActions.displayName = 'QuickActions';
