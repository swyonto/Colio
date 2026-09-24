/**
 * authService.ts - Firebase Auth Only
 * Architecture: Firebase Auth is the SINGLE source of truth.
 * - No custom OTP system (removed entirely)
 * - No dual auth fragmentation  
 * - No custom password hashing
 * - Profiles stored in Firestore under users/{uid} (not email-keyed)
 * - Rate limiting via local AsyncStorage (15-minute windows)
 * - Session cache (minimal data, 7-day TTL) for fast cold start
 */
import AsyncStorage from '../utils/storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

// ============================================================
// TYPES
// ============================================================

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  provider?: 'password' | 'google';
  avatarUrl?: string;
  isEmailVerified?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  provider: 'password' | 'google';
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEYS = {
  CURRENT_USER: '@colio_auth_user_v3',
};

const RATE_LIMIT = {
  LOGIN_MAX: 5,
  SIGNUP_MAX: 3,
  RESET_MAX: 3,
  WINDOW_MS: 15 * 60 * 1000,
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================================
// HELPERS
// ============================================================

function firestoreUserDoc(uid: string) {
  return doc(db, 'users', uid);
}

function authUserFromFirebase(fbUser: any, profile?: Partial<UserProfile>): AuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email || profile?.email || '',
    name: fbUser.displayName || profile?.name || fbUser.email?.split('@')[0] || 'Student',
    provider:
      profile?.provider ||
      (fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password'),
    avatarUrl: fbUser.photoURL || profile?.avatarUrl,
    isEmailVerified: fbUser.emailVerified,
  };
}

// ============================================================
// RATE LIMITING
// ============================================================

interface RateLimitRecord {
  attempts: number;
  windowStart: number;
}

async function getRateLimitRecord(key: string): Promise<RateLimitRecord> {
  try {
    const raw = await AsyncStorage.getItem(`@colio_rl_${key}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { attempts: 0, windowStart: Date.now() };
}

async function recordFailedAttempt(email: string, action: 'login' | 'signup' | 'reset'): Promise<void> {
  try {
    const key = `${action}_${email.replace(/[^a-z0-9]/gi, '_')}`;
    const record = await getRateLimitRecord(key);
    const now = Date.now();
    if (now - record.windowStart > RATE_LIMIT.WINDOW_MS) {
      await AsyncStorage.setItem(`@colio_rl_${key}`, JSON.stringify({ attempts: 1, windowStart: now }));
    } else {
      record.attempts += 1;
      await AsyncStorage.setItem(`@colio_rl_${key}`, JSON.stringify(record));
    }
  } catch {}
}

async function clearRateLimit(email: string, action: 'login' | 'signup' | 'reset'): Promise<void> {
  try {
    const key = `${action}_${email.replace(/[^a-z0-9]/gi, '_')}`;
    await AsyncStorage.removeItem(`@colio_rl_${key}`);
  } catch {}
}

export async function checkRateLimit(
  email: string,
  action: 'login' | 'signup' | 'reset'
): Promise<{ allowed: boolean; minutesLeft?: number; error?: string }> {
  try {
    const key = `${action}_${email.replace(/[^a-z0-9]/gi, '_')}`;
    const record = await getRateLimitRecord(key);
    const now = Date.now();
    if (now - record.windowStart > RATE_LIMIT.WINDOW_MS) return { allowed: true };
    const max = action === 'login' ? RATE_LIMIT.LOGIN_MAX : action === 'signup' ? RATE_LIMIT.SIGNUP_MAX : RATE_LIMIT.RESET_MAX;
    if (record.attempts >= max) {
      const minutesLeft = Math.ceil((RATE_LIMIT.WINDOW_MS - (now - record.windowStart)) / 60000);
      return {
        allowed: false,
        minutesLeft,
        error: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
      };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

// ============================================================
// FIRESTORE PROFILE HELPERS (users/{uid})
// ============================================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(firestoreUserDoc(uid));
    if (snap.exists()) return snap.data() as UserProfile;
    return null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(firestoreUserDoc(profile.uid), profile, { merge: true });
  } catch {}
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

export async function getPersistedSession(): Promise<AuthUser | null> {
  try {
    if (typeof (auth as any).authStateReady === 'function') {
      await (auth as any).authStateReady();
    }

    const fbUser = auth.currentUser;
    if (fbUser) {
      const profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        const migrated = await migrateOldUserProfile(fbUser.uid, fbUser.email || '');
        const authUser = authUserFromFirebase(fbUser, migrated || undefined);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...authUser, cachedAt: Date.now() }));
        return authUser;
      }
      const authUser = authUserFromFirebase(fbUser, profile);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...authUser, cachedAt: Date.now() }));
      return authUser;
    }

    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      const cached = JSON.parse(raw) as AuthUser & { cachedAt?: number };
      if (cached.cachedAt && Date.now() - cached.cachedAt > SESSION_TTL_MS) {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return null;
      }
      return cached;
    }
    return null;
  } catch {
    return null;
  }
}

export async function logoutSession(): Promise<void> {
  try {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  } catch {}
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch {}
}

// ============================================================
// 1. SIGNUP
// ============================================================

export async function signupWithEmail(
  email: string,
  name?: string,
  password?: string
): Promise<{ success: boolean; requiresVerification?: boolean; error?: string }> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name && name.trim()) ? name.trim() : ((cleanEmail.split('@')[0]) || 'Student');

  if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) return { success: false, error: 'Please enter a valid email address.' };
  if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };

  const rateCheck = await checkRateLimit(cleanEmail, 'signup');
  if (!rateCheck.allowed) return { success: false, error: rateCheck.error };

  try {
    const { createUserWithEmailAndPassword, sendEmailVerification, updateProfile: updateFbProfile } = await import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = cred.user;

    try { await updateFbProfile(fbUser, { displayName: cleanName }); } catch {}
    try { await sendEmailVerification(fbUser); } catch (e) { console.warn('[Auth] sendEmailVerification warning:', e); }

    const now = new Date().toISOString();
    await saveUserProfile({
      uid: fbUser.uid, email: cleanEmail, name: cleanName,
      provider: 'password', isEmailVerified: false, createdAt: now, lastLoginAt: now,
    });
    await clearRateLimit(cleanEmail, 'signup');

    return { success: true, requiresVerification: true };
  } catch (err: any) {
    await recordFailedAttempt(cleanEmail, 'signup');
    if (err.code === 'auth/email-already-in-use') return { success: false, error: 'An account with this email already exists. Please log in.' };
    if (err.code === 'auth/weak-password') return { success: false, error: 'Password is too weak. Please use at least 6 characters.' };
    if (err.code === 'auth/invalid-email') return { success: false, error: 'Please enter a valid email address.' };
    console.error('[Auth] signupWithEmail error:', err.code, err.message);
    return { success: false, error: 'Could not create account. Please try again.' };
  }
}

// ============================================================
// 2. CHECK EMAIL VERIFIED
// ============================================================

export async function checkEmailVerified(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    if (typeof (auth as any).authStateReady === 'function') await (auth as any).authStateReady();
    const fbUser = auth.currentUser;
    if (!fbUser) return { success: false, error: 'No active session. Please sign up again.' };

    await fbUser.reload();
    if (!fbUser.emailVerified) {
      return {
        success: false,
        error: 'Email not verified yet. Please click the verification link in the email sent to ' + fbUser.email + '. Check Spam if not found.',
      };
    }

    try {
      await updateDoc(firestoreUserDoc(fbUser.uid), { isEmailVerified: true, lastLoginAt: new Date().toISOString() });
    } catch {}

    const profile = await getUserProfile(fbUser.uid);
    const authUser = authUserFromFirebase(fbUser, profile || undefined);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...authUser, cachedAt: Date.now() }));
    return { success: true, user: authUser };
  } catch (err: any) {
    console.error('[Auth] checkEmailVerified error:', err);
    return { success: false, error: err?.message || 'Could not check verification status.' };
  }
}

// ============================================================
// 3. RESEND VERIFICATION EMAIL
// ============================================================

export async function resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
  try {
    const fbUser = auth.currentUser;
    if (!fbUser) return { success: false, error: 'No active session. Please sign up again.' };
    const { sendEmailVerification } = await import('firebase/auth');
    await sendEmailVerification(fbUser);
    return { success: true };
  } catch (err: any) {
    if (err.code === 'auth/too-many-requests') return { success: false, error: 'Too many requests. Wait a few minutes before resending.' };
    console.warn('[Auth] resendVerificationEmail error:', err);
    return { success: false, error: 'Could not resend verification email.' };
  }
}

// ============================================================
// 4. LOGIN WITH EMAIL
// ============================================================

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { success: false, error: 'Please enter your email address.' };
  if (!password) return { success: false, error: 'Please enter your password.' };

  const rateCheck = await checkRateLimit(cleanEmail, 'login');
  if (!rateCheck.allowed) return { success: false, error: rateCheck.error };

  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = cred.user;
    const now = new Date().toISOString();

    let profile = await getUserProfile(fbUser.uid);
    if (!profile) {
      profile = {
        uid: fbUser.uid, email: cleanEmail,
        name: fbUser.displayName || cleanEmail.split('@')[0],
        provider: 'password', isEmailVerified: fbUser.emailVerified,
        createdAt: now, lastLoginAt: now,
      };
      await saveUserProfile(profile);
      await migrateOldUserProfile(fbUser.uid, cleanEmail);
    } else {
      profile.lastLoginAt = now;
      profile.isEmailVerified = fbUser.emailVerified;
      try { await updateDoc(firestoreUserDoc(fbUser.uid), { lastLoginAt: now, isEmailVerified: fbUser.emailVerified }); } catch {}
    }

    const authUser = authUserFromFirebase(fbUser, profile);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...authUser, cachedAt: Date.now() }));
    await clearRateLimit(cleanEmail, 'login');
    return { success: true, user: authUser };
  } catch (err: any) {
    await recordFailedAttempt(cleanEmail, 'login');
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    if (err.code === 'auth/user-disabled') return { success: false, error: 'This account has been disabled. Please contact support.' };
    if (err.code === 'auth/too-many-requests') return { success: false, error: 'Too many failed attempts. Please try again later.' };
    console.error('[Auth] loginWithEmail error:', err.code, err.message);
    return { success: false, error: 'Login failed. Check your connection and try again.' };
  }
}

// ============================================================
// 5. PASSWORD RESET (Firebase email link � no code entry)
// ============================================================

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) return { success: false, error: 'Please enter a valid email address.' };

  const rateCheck = await checkRateLimit(cleanEmail, 'reset');
  if (!rateCheck.allowed) return { success: false, error: rateCheck.error };

  try {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, cleanEmail);
    await clearRateLimit(cleanEmail, 'reset');
    return { success: true };
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') return { success: true }; // prevent account enumeration
    if (err.code === 'auth/too-many-requests') return { success: false, error: 'Too many requests. Wait before trying again.' };
    await recordFailedAttempt(cleanEmail, 'reset');
    console.warn('[Auth] requestPasswordReset error:', err.code);
    return { success: false, error: 'Could not send reset email. Please try again.' };
  }
}

// ============================================================
// 6. GOOGLE SIGN-IN
// ============================================================

export async function triggerGoogleSignInWeb(): Promise<{
  success: boolean; user?: AuthUser; isNewUser: boolean; error?: string;
}> {
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return await _processGoogleUser(result.user, false);
  } catch (err: any) {
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request')
      return { success: false, isNewUser: false, error: 'Google sign-in was cancelled.' };
    if (err.code === 'auth/popup-blocked')
      return { success: false, isNewUser: false, error: 'Popup blocked. Please allow popups and try again.' };
    if (err.code === 'auth/operation-not-allowed' || err.code?.includes('configuration'))
      return { success: false, isNewUser: false, error: 'Google Sign-In is not enabled. Enable it in Firebase Console -> Authentication -> Sign-in method.' };
    console.warn('[Auth] Google web sign-in error:', err.code);
    return { success: false, isNewUser: false, error: err.message || 'Google sign-in failed.' };
  }
}

/** Native: accepts Google ID token from expo-auth-session hook */
export async function signInWithGoogleToken(
  idToken: string,
  accessToken?: string
): Promise<{ success: boolean; user?: AuthUser; isNewUser: boolean; error?: string }> {
  try {
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    const isNew = (result as any)._tokenResponse?.isNewUser ?? false;
    return await _processGoogleUser(result.user, isNew);
  } catch (err: any) {
    console.warn('[Auth] signInWithGoogleToken error:', err.code);
    return { success: false, isNewUser: false, error: err?.message || 'Google authentication failed.' };
  }
}

async function _processGoogleUser(
  fbUser: any,
  isNewUser: boolean
): Promise<{ success: boolean; user?: AuthUser; isNewUser: boolean; error?: string }> {
  const cleanEmail = (fbUser.email || '').toLowerCase();
  const now = new Date().toISOString();
  let profile = await getUserProfile(fbUser.uid);

  if (!profile) {
    isNewUser = true;
    profile = {
      uid: fbUser.uid, email: cleanEmail,
      name: fbUser.displayName || cleanEmail.split('@')[0],
      provider: 'google', avatarUrl: fbUser.photoURL || undefined,
      isEmailVerified: true, createdAt: now, lastLoginAt: now,
    };
    await saveUserProfile(profile);
  } else {
    try {
      await updateDoc(firestoreUserDoc(fbUser.uid), {
        lastLoginAt: now, isEmailVerified: true, avatarUrl: fbUser.photoURL || profile.avatarUrl,
      });
    } catch {}
  }

  const authUser = authUserFromFirebase(fbUser, profile);
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...authUser, cachedAt: Date.now() }));
  return { success: true, user: authUser, isNewUser };
}

// ============================================================
// MIGRATION: users/{emailKey} -> users/{uid}
// ============================================================

export async function migrateOldUserProfile(uid: string, email: string): Promise<UserProfile | null> {
  try {
    const oldKey = email.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
    const oldRef = doc(db, 'users', oldKey);
    const oldSnap = await getDoc(oldRef);
    if (oldSnap.exists()) {
      const oldData = oldSnap.data() as UserProfile;
      const migrated: UserProfile = { ...oldData, uid };
      await setDoc(firestoreUserDoc(uid), migrated, { merge: true });
      console.log('[Auth] Migrated profile from email-key to UID-key for', email);
      return migrated;
    }
    return null;
  } catch {
    return null;
  }
}
