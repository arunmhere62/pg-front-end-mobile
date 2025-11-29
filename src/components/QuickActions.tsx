import React, { memo } from 'react';
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
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 12, paddingHorizontal: 16 }}>
        Quick Actions
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {menuItems.map((item, index) => {
          const scaleValue = new Animated.Value(1);
          
          const handlePressIn = () => {
            Animated.spring(scaleValue, {
              toValue: 0.95,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }).start();
          };
          
          const handlePressOut = () => {
            Animated.spring(scaleValue, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }).start();
          };
          
          return (
            <Animated.View key={index} style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                onPress={() => onNavigate(item.screen)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
                style={{ 
                  height: 85, // Fixed height
                  minWidth: 70, // Minimum width
                  maxWidth: 90, // Maximum width for responsiveness
                  justifyContent: 'center'
                }}
              >
                <Card style={{ 
                  padding: 10, 
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'center'
                }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: item.color,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Ionicons name={item.icon as any} size={16} color="#fff" />
                  </View>
                  <Text style={{ 
                    color: Theme.colors.text.primary, 
                    fontWeight: '600', 
                    textAlign: 'center', 
                    fontSize: 10,
                    lineHeight: 12,
                    maxWidth: '100%'
                  }}>
                    {item.title.length > 10 ? item.title.substring(0, 10) + '...' : item.title}
                  </Text>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
});

QuickActions.displayName = 'QuickActions';
