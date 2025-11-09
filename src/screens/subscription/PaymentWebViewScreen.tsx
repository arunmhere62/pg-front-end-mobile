import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { ScreenLayout } from '../../components/ScreenLayout';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Theme } from '../../theme';

interface PaymentWebViewScreenProps {
  navigation: any;
  route: any;
}

export const PaymentWebViewScreen: React.FC<PaymentWebViewScreenProps> = ({ navigation, route }) => {
  const { paymentUrl, orderId, subscriptionId } = route.params;
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: any) => {
    console.log('📍 Navigation URL:', navState.url);

    // Check if payment is successful or cancelled
    if (navState.url.includes('/payment/callback') || navState.url.includes('payment/success')) {
      // Payment successful
      Alert.alert(
        'Payment Successful',
        'Your subscription has been activated!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Settings' }],
              });
            },
          },
        ]
      );
    } else if (navState.url.includes('/payment/cancel') || navState.url.includes('payment/failed')) {
      // Payment cancelled or failed
      Alert.alert(
        'Payment Cancelled',
        'Your payment was not completed. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  return (
    <ScreenLayout backgroundColor={Theme.colors.background.primary}>
      <ScreenHeader
        title="Payment"
        showBackButton
        onBackPress={handleBackPress}
      />
      
      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          style={styles.webview}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ WebView error:', nativeEvent);
            Alert.alert('Error', 'Failed to load payment page. Please try again.');
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ HTTP error:', nativeEvent.statusCode);
          }}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    zIndex: 1,
  },
  webview: {
    flex: 1,
  },
});
