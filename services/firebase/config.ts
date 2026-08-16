import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';

// Firebase web config is NOT secret — Firebase's security model relies on
// Firestore/Auth rules, not on hiding these values. See
// https://firebase.google.com/docs/projects/api-keys
// Never add Admin SDK credentials (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)
// or Cloudinary secrets here — those stay server-side in the website's
// Netlify Functions and must never ship inside this app.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase configuration: ${missingKeys.join(', ')}. Copy .env.example to .env.local and fill in the values.`
  );
}

export const firebaseApp: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
