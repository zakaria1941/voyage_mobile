import type { Persistence } from 'firebase/auth';

// @firebase/auth exposes getReactNativePersistence only through its
// "react-native" package-export condition (dist/rn/index.rn.d.ts). Metro
// resolves that condition correctly at bundle/runtime, but the top-level
// "." export entry lists a plain "types" key ahead of the per-condition
// branches, which shadows it for plain `tsc` type-checking regardless of
// this project's customConditions setting. Runtime behavior is correct
// (confirmed against the installed @firebase/auth build and Expo's own
// Firebase-persistence setup guide) — this augmentation only restores the
// type so `tsc --noEmit` sees what Metro already resolves.
declare module 'firebase/auth' {
  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
