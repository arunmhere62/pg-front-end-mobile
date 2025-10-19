import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import tenantReducer from './slices/tenantSlice';
import pgLocationReducer from './slices/pgLocationSlice';
import paymentReducer from './slices/paymentSlice';
import organizationReducer from './slices/organizationSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'pgLocations'], // Persist auth and selected PG location
};

const rootReducer = combineReducers({
  auth: authReducer,
  tenants: tenantReducer,
  pgLocations: pgLocationReducer,
  payments: paymentReducer,
  organizations: organizationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
