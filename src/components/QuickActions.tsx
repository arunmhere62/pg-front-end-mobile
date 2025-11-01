import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: Theme.colors.text.primary, marginBottom: 16 }}>
        Quick Actions
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onNavigate(item.screen)}
            style={{ width: '48%', marginBottom: 12 }}
          >
            <Card style={{ padding: 16, alignItems: 'center' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: item.color,
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Ionicons name={item.icon as any} size={32} color="#fff" />
              </View>
              <Text style={{ color: Theme.colors.text.primary, fontWeight: '600', textAlign: 'center' }}>
                {item.title}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

QuickActions.displayName = 'QuickActions';
