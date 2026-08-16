import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth } from '@/services/firebase/auth';
import { ensureUserProfile, userDocRef } from '@/services/user-service';
import type { UserProfile } from '@/types/user';
import { getFriendlyErrorMessage, logError } from '@/utils/errors';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  register: (input: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  // `profileUid` records which uid the current `profile` snapshot belongs to,
  // so "is the profile for the active user still loading" can be derived
  // during render instead of tracked with a second effect-driven flag.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileUid, setProfileUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthResolved(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    ensureUserProfile(firebaseUser).catch((error) => logError(error, { where: 'ensureUserProfile' }));

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    let retriesLeft = 2;

    function subscribe() {
      unsubscribe = onSnapshot(
        userDocRef(firebaseUser!.uid),
        (snap) => {
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
          setProfileUid(firebaseUser!.uid);
        },
        (error) => {
          // Immediately after sign-in, Firestore's outbound requests can briefly race
          // ahead of the freshly-issued auth token reaching the backend, surfacing a
          // transient permission-denied. Retry a couple of times with backoff before
          // treating it as a real authorization failure. Same race the website's
          // AuthContext works around (see voyago-website-repo memory).
          if (cancelled) return;
          if (error.code === 'permission-denied' && retriesLeft > 0) {
            retriesLeft -= 1;
            const delay = (3 - retriesLeft) * 500;
            setTimeout(() => {
              if (!cancelled) subscribe();
            }, delay);
            return;
          }
          logError(error, { where: 'profile onSnapshot' });
          setProfileUid(firebaseUser!.uid);
        },
      );
    }
    subscribe();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [firebaseUser]);

  const resolvedProfile = firebaseUser && profileUid === firebaseUser.uid ? profile : null;
  const profileLoading = firebaseUser !== null && profileUid !== firebaseUser.uid;

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile: resolvedProfile,
      loading: !authResolved || profileLoading,
      isAdmin: resolvedProfile?.role === 'admin',
      async register({ email, password, firstName, lastName }) {
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await updateFirebaseProfile(credential.user, { displayName: `${firstName} ${lastName}`.trim() });
          await ensureUserProfile(credential.user, { firstName, lastName });
          // No actionCodeSettings: uses Firebase's own default-hosted
          // verification page rather than a continue-URL back into the
          // website or a not-yet-built mobile deep link.
          await sendEmailVerification(credential.user);
        } catch (error) {
          throw new Error(getFriendlyErrorMessage(error, 'We couldn’t create your account. Please try again.'), { cause: error });
        }
      },
      async login(email, password) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          throw new Error(getFriendlyErrorMessage(error, 'We couldn’t sign you in. Please try again.'), { cause: error });
        }
      },
      async logout() {
        try {
          await firebaseSignOut(auth);
        } catch (error) {
          throw new Error(getFriendlyErrorMessage(error, 'Sign-out failed. Please try again.'), { cause: error });
        }
      },
      async resetPassword(email) {
        try {
          // No actionCodeSettings, same reasoning as register(): Firebase's
          // default-hosted reset page lets the user complete the reset
          // without needing the website or a mobile deep link.
          await sendPasswordResetEmail(auth, email);
        } catch (error) {
          throw new Error(getFriendlyErrorMessage(error, 'We couldn’t send the reset email. Please try again.'), { cause: error });
        }
      },
      async resendVerificationEmail() {
        if (!auth.currentUser) return;
        try {
          await sendEmailVerification(auth.currentUser);
        } catch (error) {
          throw new Error(getFriendlyErrorMessage(error, 'We couldn’t send the verification email. Please try again.'), { cause: error });
        }
      },
    }),
    [firebaseUser, resolvedProfile, authResolved, profileLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
