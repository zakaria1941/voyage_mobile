import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { Platform } from 'react-native';

import { firebaseApp } from './config';

// React Native has no default storage Firebase Auth can persist a session
// to (unlike a browser's IndexedDB/localStorage), so native platforms need
// an explicit AsyncStorage-backed persistence layer or the user is signed
// out every app restart. AsyncStorage is included in Expo Go — no dev
// client required. On web, getReactNativePersistence is not applicable;
// getAuth's own default (browserLocalPersistence) is correct there.
export const auth: Auth =
  Platform.OS === 'web'
    ? getAuth(firebaseApp)
    : initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
