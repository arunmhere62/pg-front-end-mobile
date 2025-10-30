import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Card } from '../../components/Card';
import { Theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import { CONTENT_COLOR } from '@/constant';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const settingsOptions = [
    { title: 'Profile', icon: '👤', onPress: () => navigation.navigate('UserProfile') },
    { title: 'Notifications', icon: '🔔', onPress: () => {} },
    { title: 'Privacy', icon: '🔒', onPress: () => {} },
    { title: 'Help & Support', icon: '❓', onPress: () => {} },
    { title: 'About', icon: 'ℹ️', onPress: () => {} },
  ];

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.blue} contentBackgroundColor={CONTENT_COLOR}>
      <ScreenHeader title="Settings" />

        <View style={{ flex: 1, backgroundColor: Theme.colors.light }}>
          <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 80 }}>
        {/* User Info Card */}
        <Card className="mb-4">
          <View className="items-center py-4">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-3">
              <Text className="text-white text-3xl">👤</Text>
            </View>
            <Text className="text-xl font-bold text-dark">{user?.name || 'User'}</Text>
            <Text className="text-gray-600">{user?.phone || user?.email}</Text>
          </View>
        </Card>

        {/* Settings Options */}
        <Card className="mb-4">
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.onPress}
              className={`flex-row items-center py-4 ${
                index < settingsOptions.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <Text className="text-2xl mr-3">{option.icon}</Text>
              <Text className="text-dark font-semibold flex-1">{option.title}</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-lg py-4 mb-6"
        >
          <Text className="text-white text-center font-bold text-lg">Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text className="text-center text-gray-500 text-sm mb-4">
          Version 1.0.0
        </Text>
          </ScrollView>
        </View>
    </ScreenLayout>
  );
};
