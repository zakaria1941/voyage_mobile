import { FirebaseError } from 'firebase/app';

// Mirrors the website's src/utils/errors.ts mapping (auth-relevant subset
// only — this app doesn't have the website's Netlify-Functions ApiError
// type yet).
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/user-not-found': 'We couldn’t find an account with those details.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Please choose a stronger password (at least 6 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
};

export function getFriendlyErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof FirebaseError) {
    const mapped = AUTH_ERROR_MESSAGES[error.code];
    if (mapped) return mapped;

    if (error.code === 'permission-denied' || error.code.startsWith('firestore/permission-denied')) {
      return 'You don’t have permission to do that.';
    }
    if (error.code === 'unavailable') {
      return 'We’re having trouble connecting right now. Please try again shortly.';
    }

    logError(error);
    return fallback;
  }

  logError(error);
  return fallback;
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  console.error('[voyago:error]', error, context ?? '');
}
