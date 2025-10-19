import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import { ActivityIndicator, View } from 'react-native';
import { NetworkLoggerModal } from './src/components/NetworkLoggerModal';
import { Theme } from './src/theme';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function App() {
  return (
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
          <StatusBar style="light" translucent backgroundColor="transparent" />
          <AppNavigator />
          <NetworkLoggerModal />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
