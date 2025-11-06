import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { NetworkLoggerModal } from './src/components/NetworkLoggerModal';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { NetworkStatusProvider } from './src/providers/NetworkStatusProvider';
import { Theme } from './src/theme';
import { AppNavigator } from '@/navigation/AppNavigator';
import { setupGlobalErrorHandlers } from './src/utils/errorHandler';
import { initializeGlobalErrorHandling } from './src/config/globalErrorHandler';

export default function App() {
  useEffect(() => {
    // Initialize global error handlers
    setupGlobalErrorHandlers();
    
    // Initialize global axios error interceptors
    initializeGlobalErrorHandling();
    
    console.log('✅ App initialized with global error handling');
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate
            loading={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
              </View>
            }
            persistor={persistor}
          >
            <NetworkStatusProvider>
              <StatusBar translucent backgroundColor="transparent" />
              <AppNavigator />
              <NetworkLoggerModal />
            </NetworkStatusProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
