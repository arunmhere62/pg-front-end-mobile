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
  const renderActionItem = (item: MenuItem, index: number) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }).start();
      
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };
    
    return (
      <Animated.View key={index} style={{ 
        transform: [{ scale: scaleValue }], 
        opacity: opacityValue,
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 16
      }}>
        <TouchableOpacity
          onPress={() => onNavigate(item.screen)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={{ 
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
        >
          {/* Icon container */}
          <View
            style={{
              width: 36,
              height: 36,
              backgroundColor: item.color,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Ionicons name={item.icon as any} size={18} color="#fff" />
          </View>
          
          {/* Text label */}
          <Text 
            style={{ 
              color: Theme.colors.text.primary, 
              fontWeight: '600', 
              textAlign: 'center', 
              fontSize: 9,
              lineHeight: 11,
              flex: 1
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Split items into two rows for horizontal scrolling
  const halfLength = Math.ceil(menuItems.length / 2);
  const firstRowItems = menuItems.slice(0, halfLength);
  const secondRowItems = menuItems.slice(halfLength);

  return (
    <View style={{ marginBottom: 24, marginTop: 20, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 18 }}>
        Quick Actions
      </Text>
      
      {/* Two Rows Full Width */}
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        {/* First Row */}
        <View style={{ flexDirection: 'row', marginBottom: 16, justifyContent: 'center', width: '100%' }}>
          {firstRowItems.map((item, index) => renderActionItem(item, index))}
        </View>
        
        {/* Second Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
          {secondRowItems.map((item, index) => renderActionItem(item, index + halfLength))}
        </View>
      </View>
    </View>
  );
});

QuickActions.displayName = 'QuickActions';
