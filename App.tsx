import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { NetworkLoggerModal } from './src/components/NetworkLoggerModal';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { Theme } from './src/theme';
import { AppNavigator } from '@/navigation/AppNavigator';
import { setupGlobalErrorHandlers } from './src/utils/errorHandler';

export default function App() {
  useEffect(() => {
    // Initialize global error handlers
    setupGlobalErrorHandlers();
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
            <StatusBar translucent backgroundColor="transparent" />
            <AppNavigator />
            <NetworkLoggerModal />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
