import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, type DocumentReference } from 'firebase/firestore';

import type { UserProfile } from '@/types/user';

import { db } from './firebase/firestore';

const usersCol = 'users';

export function userDocRef(uid: string): DocumentReference {
  return doc(db, usersCol, uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/**
 * Creates the Firestore users/{uid} profile document the first time a
 * Firebase Auth user is seen. Idempotent — safe to call on every sign-in.
 */
export async function ensureUserProfile(firebaseUser: User, extra?: Partial<UserProfile>): Promise<UserProfile> {
  const existing = await getUserProfile(firebaseUser.uid);
  if (existing) return existing;

  const [firstName, ...rest] = (firebaseUser.displayName ?? '').split(' ').filter(Boolean);
  const now = Date.now();

  const profile: UserProfile = {
    uid: firebaseUser.uid,
    firstName: extra?.firstName ?? firstName ?? 'Traveler',
    lastName: extra?.lastName ?? (rest.length ? rest.join(' ') : ''),
    email: firebaseUser.email ?? '',
    phone: extra?.phone ?? firebaseUser.phoneNumber ?? null,
    photoURL: extra?.photoURL ?? firebaseUser.photoURL ?? null,
    country: extra?.country ?? null,
    role: 'user',
    emailVerified: firebaseUser.emailVerified,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(userDocRef(firebaseUser.uid), profile);
  return profile;
}
