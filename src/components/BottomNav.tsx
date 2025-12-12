import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Modal, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../config/rbac.config';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavProps {
  navigation: any;
  currentRoute: string;
}

interface TabConfig {
  name: string;
  label: string;
  icon: string;
  permission: Permission;
}

// User tabs (Admin/Employee) - Super Admin will use separate web app
const userTabs: TabConfig[] = [
  { name: 'Dashboard', label: 'Home', icon: 'home', permission: Permission.VIEW_DASHBOARD },
  { name: 'Tenants', label: 'Tenants', icon: 'people', permission: Permission.VIEW_TENANTS },
  { name: 'Payments', label: 'Payments', icon: 'card', permission: Permission.VIEW_PAYMENTS },
  { name: 'Settings', label: 'Settings', icon: 'settings', permission: Permission.VIEW_SETTINGS },
];

export const BottomNav: React.FC<BottomNavProps> = React.memo(({ navigation, currentRoute }) => {
  const insets = useSafeAreaInsets();
  const { can } = usePermissions();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentOptionsPosition, setPaymentOptionsPosition] = useState({ x: 0, y: 0 });
  
  // Animation values
  const dropdownAnimValue = useRef(new Animated.Value(0)).current;
  const backdropAnimValue = useRef(new Animated.Value(0)).current;
  
  // Filter tabs based on user permissions
  const accessibleTabs = userTabs.filter(tab => can(tab.permission));
  
  const animateDropdownIn = () => {
    Animated.parallel([
      Animated.spring(dropdownAnimValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnimValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const animateDropdownOut = (callback?: () => void) => {
    Animated.parallel([
      Animated.spring(dropdownAnimValue, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnimValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback?.();
    });
  };
  
  const handleTabPress = (tab: TabConfig, event?: any) => {
    if (tab.name === 'Payments') {
      // Get position of the tab for dropdown
      if (event) {
        event.target?.measure?.((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
          setPaymentOptionsPosition({ x: px + width / 2, y: py });
        });
      }
      
      if (!showPaymentOptions) {
        setShowPaymentOptions(true);
        animateDropdownIn();
      } else {
        animateDropdownOut(() => setShowPaymentOptions(false));
      }
    } else {
      if (showPaymentOptions) {
        animateDropdownOut(() => setShowPaymentOptions(false));
      }
      navigation.navigate(tab.name);
    }
  };
  
  const PaymentOption = ({ icon, title, screen, color }: { icon: string; title: string; screen: string; color: string }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 3,
        backgroundColor: Theme.colors.canvas,
      }}
      onPress={() => {
        animateDropdownOut(() => {
          setShowPaymentOptions(false);
          navigation.navigate(screen);
        });
      }}
    >
      <View style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
      }}>
        <Ionicons name={icon as any} size={10} color="#fff" />
      </View>
      <Text style={{
        fontSize: 12,
        fontWeight: '500',
        color: Theme.colors.text.primary,
        flex: 1,
      }}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={12} color={Theme.colors.text.tertiary} />
    </TouchableOpacity>
  );
  
  return (
    <>
      <BlurView
        intensity={100}
        tint="light"
        style={[styles.container, { paddingBottom: Math.max(insets.bottom + -2, 10) }]}
      >
        {accessibleTabs.map((tab) => {
          const isActive = currentRoute === tab.name;
          return (
            <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={(event) => handleTabPress(tab, event)}
            activeOpacity={0.8}
          >
              <View style={styles.tabContainer}>
                <View style={styles.tabContent}>
                  <Ionicons 
                    name={tab.icon as any} 
                    size={20} 
                    color={isActive ? Theme.colors.primary : Theme.colors.text.tertiary}
                  />
                  <Text style={[
                    styles.label,
                    { color: isActive ? Theme.colors.primary : Theme.colors.text.tertiary }
                  ]}>
                    {tab.label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
      
      {/* Payment Options Dropdown */}
      {showPaymentOptions && (
        <Animated.View style={{
          position: 'absolute',
          bottom: 85, // Reduced space from bottom nav
          left: paymentOptionsPosition.x - 70, // Center horizontally on tab
          backgroundColor: Theme.colors.canvas,
          borderRadius: 10,
          padding: 8,
          minWidth: 140, // Reduced width
          borderWidth: 1,
          borderColor: Theme.colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 6,
          zIndex: 1000,
          opacity: dropdownAnimValue,
          transform: [
            {
              scale: dropdownAnimValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
                extrapolate: 'clamp',
              }),
            },
            {
              translateY: dropdownAnimValue.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}>
          {/* Simplified dropdown arrow */}
          <View style={{
            position: 'absolute',
            bottom: -6,
            left: 70 - 6, // Center the arrow
            width: 12,
            height: 12,
            backgroundColor: Theme.colors.canvas,
            transform: [{ rotate: '45deg' }],
            borderBottomWidth: 1,
            borderRightWidth: 1,
            borderBottomColor: Theme.colors.border,
            borderRightColor: Theme.colors.border,
          }} />
          
          <PaymentOption
            icon="card"
            title="Rent"
            screen="Payments"
            color={Theme.colors.primary}
          />
          <PaymentOption
            icon="arrow-up"
            title="Advance"
            screen="AdvancePayments"
            color="#10B981"
          />
          <PaymentOption
            icon="arrow-down"
            title="Refund"
            screen="RefundPayments"
            color="#EF4444"
          />
        </Animated.View>
      )}
      
      {/* Backdrop to close dropdown */}
      {showPaymentOptions && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 999,
            opacity: backdropAnimValue,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => animateDropdownOut(() => setShowPaymentOptions(false))}
            activeOpacity={1}
          />
        </Animated.View>
      )}
    </>
  );
});

BottomNav.displayName = 'BottomNav';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 0,
    minHeight: 70,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    position: 'relative',
  },
  icon: {
    marginBottom: 1,
    textAlign: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    left: -12,
    right: -12,
    bottom: -4,
    backgroundColor: Theme.colors.primary,
    borderRadius: 20,
    zIndex: -1,
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});
