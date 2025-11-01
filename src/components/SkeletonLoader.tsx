import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
};

interface CardSkeletonProps {
  width?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ width = 160 }) => {
  return (
    <View style={{ 
      width, 
      padding: 12, 
      backgroundColor: 'white', 
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#F3F4F6'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <SkeletonLoader width={36} height={36} borderRadius={8} style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="40%" height={10} style={{ marginBottom: 4 }} />
          <SkeletonLoader width="60%" height={22} />
        </View>
      </View>
      <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <SkeletonLoader width={30} height={16} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={40} height={9} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <SkeletonLoader width={30} height={16} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={40} height={9} />
          </View>
          <View style={{ alignItems: 'center' }}>
            <SkeletonLoader width={30} height={16} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={40} height={9} />
          </View>
        </View>
      </View>
    </View>
  );
};
