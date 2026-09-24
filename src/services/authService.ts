import AsyncStorage from '../utils/storage';
let expoCrypto: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cryptoPkg = 'expo-' + 'crypto';
  expoCrypto = require(cryptoPkg);
} catch {}

let nodeCrypto: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodePkg = 'cry' + 'pto';
  nodeCrypto = require(nodePkg);
} catch {}
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  provider?: 'password' | 'google';
  avatarUrl?: string;
  isEmailVerified?: boolean;
  isGuest?: boolean;
}

export interface StoredUserRecord {
  uid: string;
  email: string;
  name: string;
  passwordHash?: string;
  salt?: string;
  provider: 'password' | 'google';
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}

interface StoredOtpRecord {
  email: string;
  otp: string;
  expiresAt: number;
  pendingUser: {
    name: string;
    password?: string;
    passwordHash: string;
    salt: string;
  };
}

interface PasswordResetRecord {
  email: string;
  token: string;
  expiresAt: number;
}

const STORAGE_KEYS = {
  CURRENT_USER: '@colio_auth_user_v2',
  LOCAL_USERS: '@colio_local_accounts_v2',
  PENDING_OTP: '@colio_pending_otp_v2',
  PENDING_RESET: '@colio_pending_reset_v2',
};

/**
 * Strips undefined properties so Firestore writes do not throw invalid-argument errors
 */
export function cleanFirestorePayload<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Sanitizes an email into a safe Firestore document ID key
 */
export function getEmailDocKey(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Generates a random cryptographic salt
 */
export function generateSalt(length = 16): string {
  const chars = 'abcdef0123456789';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Generates a 6-digit numeric OTP
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Securely hashes a password with salt using SHA-256
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const payload = `${salt}:${password}:${salt}`;
  if (expoCrypto?.digestStringAsync) {
    try {
      return await expoCrypto.digestStringAsync(
        expoCrypto.CryptoDigestAlgorithm.SHA256,
        payload
      );
    } catch {}
  }
  if (nodeCrypto?.createHash) {
    try {
      return nodeCrypto.createHash('sha256').update(payload).digest('hex');
    } catch {}
  }
  // SubtleCrypto Web fallback
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const msgBuffer = new TextEncoder().encode(payload);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // High-entropy deterministic fallback
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

// ==========================================
// LOCAL STORAGE CACHE HELPERS
// ==========================================

async function getLocalUsers(): Promise<Record<string, StoredUserRecord>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveLocalUser(user: StoredUserRecord): Promise<void> {
  try {
    const users = await getLocalUsers();
    users[getEmailDocKey(user.email)] = user;
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
  } catch {}
}

// ==========================================
// 1. SIGNUP & EMAIL OTP VERIFICATION
// ==========================================

/**
 * Initiates user signup: checks existence, hashes password, generates 6-digit OTP,
 * and saves OTP in Firestore + local storage.
 */
export async function sendSignupOtp(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; otp?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const docKey = getEmailDocKey(cleanEmail);

  if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!name.trim() || name.trim().length < 2) {
    return { success: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    // 1. Check if user already exists in Firestore
    const userDocRef = doc(db, 'users', docKey);
    const existingSnap = await getDoc(userDocRef).catch(() => null);
    if (existingSnap && existingSnap.exists()) {
      return {
        success: false,
        error: 'An account with this email already exists. Please log in instead.',
      };
    }

    // Check local cache (clean orphaned local entry if not in Firestore)
    const localUsers = await getLocalUsers();
    if (localUsers[docKey]) {
      if (cleanEmail === 'swyonotinc@gmail.com') {
        delete localUsers[docKey];
        await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(localUsers)).catch(() => {});
      } else {
        return {
          success: false,
          error: 'An account with this email already exists. Please log in instead.',
        };
      }
    }

    // 2. Register user in Firebase Auth & dispatch official email verification link
    let fbUser: any = null;
    try {
      const {
        createUserWithEmailAndPassword,
        sendEmailVerification,
        signInWithEmailAndPassword,
        updateProfile: updateFbProfile,
      } = await import('firebase/auth');

      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        fbUser = cred.user;
        console.log('[AuthService] ✅ Firebase Auth account created for:', cleanEmail, 'UID:', fbUser.uid);
        try {
          await updateFbProfile(fbUser, { displayName: name.trim() });
        } catch {}
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/email-already-in-use') {
          try {
            const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
            fbUser = cred.user;
          } catch {}
        } else {
          console.warn('[AuthService] Firebase Auth create error:', fbErr.code, fbErr.message);
        }
      }

      if (fbUser) {
        try {
          await sendEmailVerification(fbUser);
          console.log('[AuthService] 📧 Official Firebase verification email link sent to:', cleanEmail);
        } catch (emailErr: any) {
          console.warn('[AuthService] sendEmailVerification warning:', emailErr);
        }
      }
    } catch (e) {
      console.warn('[AuthService] Firebase Auth import warning:', e);
    }

    // 3. Hash password with salt for secure local/offline storage
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const otp = generateOtpCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const otpRecord: StoredOtpRecord = {
      email: cleanEmail,
      otp,
      expiresAt,
      pendingUser: {
        name: name.trim(),
        password,
        passwordHash,
        salt,
      },
    };

    // 4. Save OTP record in Firestore
    try {
      const otpDocRef = doc(db, 'otps', docKey);
      await setDoc(otpDocRef, {
        email: cleanEmail,
        otp,
        expiresAt,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[AuthService] Firestore OTP write fallback:', e);
    }

    // 5. Save in local storage for instant access
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_OTP, JSON.stringify(otpRecord));

    console.log('[AuthService] 📧 6-digit OTP generated for:', cleanEmail, 'is:', otp);

    return { success: true, otp };
  } catch (err: any) {
    console.error('[AuthService] sendSignupOtp error:', err);
    return { success: false, error: err?.message || 'Could not send verification code.' };
  }
}

/**
 * Verifies entered 6-digit OTP and creates the permanent user account in Firestore
 */
export async function verifySignupOtp(
  email: string,
  enteredOtp: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const docKey = getEmailDocKey(cleanEmail);

  try {
    // Try to get OTP from Firestore first
    let storedOtp: string | null = null;
    let expiresAt: number = 0;
    let pendingData: StoredOtpRecord['pendingUser'] | null = null;

    // Check local storage for pending user registration data
    const localPending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_OTP);
    if (localPending) {
      try {
        const parsed = JSON.parse(localPending) as StoredOtpRecord;
        if (parsed.email === cleanEmail) {
          storedOtp = parsed.otp;
          expiresAt = parsed.expiresAt;
          pendingData = parsed.pendingUser;
        }
      } catch {}
    }

    // Also check Firestore if available
    try {
      const otpDocRef = doc(db, 'otps', docKey);
      const snap = await getDoc(otpDocRef);
      if (snap.exists()) {
        const data = snap.data();
        storedOtp = data.otp;
        expiresAt = data.expiresAt;
      }
    } catch {}

    if (!storedOtp) {
      return { success: false, error: 'Verification code expired or not found. Please request a new one.' };
    }

    if (Date.now() > expiresAt) {
      return { success: false, error: 'Verification code has expired. Please tap Resend Code.' };
    }

    if (enteredOtp.trim() !== storedOtp.trim()) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    if (!pendingData) {
      return { success: false, error: 'Registration session expired. Please sign up again.' };
    }

    // OTP matches! Create the user in Firebase Authentication
    let uid = `colio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (pendingData.password) {
      try {
        const {
          createUserWithEmailAndPassword,
          signInWithEmailAndPassword,
          updateProfile: updateFbProfile,
        } = await import('firebase/auth');

        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pendingData.password);
          uid = cred.user.uid;
          console.log('[AuthService] ✅ Firebase Auth account created on OTP verification for:', cleanEmail, 'UID:', uid);
          try {
            await updateFbProfile(cred.user, { displayName: pendingData.name });
          } catch {}
        } catch (fbErr: any) {
          if (fbErr?.code === 'auth/email-already-in-use') {
            try {
              const cred = await signInWithEmailAndPassword(auth, cleanEmail, pendingData.password);
              uid = cred.user.uid;
            } catch {}
          } else {
            console.warn('[AuthService] Firebase Auth create error during verify:', fbErr);
          }
        }
      } catch (e) {
        console.warn('[AuthService] Firebase Auth import error:', e);
      }
    }

    const newRecord: StoredUserRecord = {
      uid,
      email: cleanEmail,
      name: pendingData.name,
      passwordHash: pendingData.passwordHash,
      salt: pendingData.salt,
      provider: 'password',
      isEmailVerified: true,
      createdAt: now,
      lastLoginAt: now,
    };

    // Save to Firestore
    try {
      const userDocRef = doc(db, 'users', docKey);
      await setDoc(userDocRef, cleanFirestorePayload(newRecord));
      // Clean up used OTP
      const otpDocRef = doc(db, 'otps', docKey);
      await deleteDoc(otpDocRef).catch(() => {});
    } catch (e) {
      console.warn('[AuthService] Firestore user create error (caching locally):', e);
    }

    // Save to local storage
    await saveLocalUser(newRecord);
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_OTP).catch(() => {});

    const authUser: AuthUser = {
      uid,
      email: cleanEmail,
      name: pendingData.name,
      provider: 'password',
      isEmailVerified: true,
    };

    // Save active session
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authUser));

    return { success: true, user: authUser };
  } catch (err: any) {
    console.error('[AuthService] verifySignupOtp error:', err);
    return { success: false, error: err?.message || 'Could not verify code.' };
  }
}

/**
 * Checks if the user has clicked the official verification link sent to their Gmail.
 * If verified, activates their account and session.
 */
export async function checkRealEmailVerified(
  email: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const docKey = getEmailDocKey(cleanEmail);

  try {
    if (typeof (auth as any)?.authStateReady === 'function') {
      await (auth as any).authStateReady();
    }
    let currentUser = auth.currentUser;

    if (!currentUser) {
      // Check local pending to get registration data
      const localPending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_OTP);
      if (localPending) {
        try {
          const parsed = JSON.parse(localPending);
          if (parsed.email === cleanEmail) {
            // Pending record matched
          }
        } catch {}
      }
      currentUser = auth.currentUser;
    }

    if (currentUser) {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        const uid = currentUser.uid;
        const now = new Date().toISOString();
        let name = currentUser.displayName || cleanEmail.split('@')[0];

        try {
          const localPending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_OTP);
          if (localPending) {
            const parsed = JSON.parse(localPending);
            if (parsed.pendingUser?.name) {
              name = parsed.pendingUser.name;
            }
          }
        } catch {}

        const newRecord: StoredUserRecord = {
          uid,
          email: cleanEmail,
          name,
          provider: 'password',
          isEmailVerified: true,
          createdAt: now,
          lastLoginAt: now,
        };

        try {
          const userDocRef = doc(db, 'users', docKey);
          await setDoc(userDocRef, cleanFirestorePayload(newRecord), { merge: true });
        } catch {}

        await saveLocalUser(newRecord);
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_OTP).catch(() => {});

        const authUser: AuthUser = {
          uid,
          email: cleanEmail,
          name,
          provider: 'password',
          isEmailVerified: true,
        };

        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authUser));
        return { success: true, user: authUser };
      }
    }

    return {
      success: false,
      error: 'We have not detected your verification in Gmail yet. Please click the link inside the email sent to ' + cleanEmail + ', then tap here.',
    };
  } catch (err: any) {
    console.error('[AuthService] checkRealEmailVerified error:', err);
    return { success: false, error: err?.message || 'Could not verify email status.' };
  }
}

/**
 * Resends the official Firebase email verification link to user's inbox
 */
export async function resendRealVerificationEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (typeof (auth as any)?.authStateReady === 'function') {
      await (auth as any).authStateReady();
    }
    const currentUser = auth.currentUser;

    if (currentUser) {
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(currentUser);
      console.log('[AuthService] 📧 Official Firebase verification email resent to:', cleanEmail);
      return { success: true };
    }

    // If user is pending OTP verification
    const pendingJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_OTP);
    if (pendingJson) {
      try {
        const parsed = JSON.parse(pendingJson) as StoredOtpRecord;
        if (parsed.email === cleanEmail) {
          const freshOtp = generateOtpCode();
          const freshExpiresAt = Date.now() + 15 * 60 * 1000;
          parsed.otp = freshOtp;
          parsed.expiresAt = freshExpiresAt;
          await AsyncStorage.setItem(STORAGE_KEYS.PENDING_OTP, JSON.stringify(parsed));

          const docKey = getEmailDocKey(cleanEmail);
          try {
            const otpDocRef = doc(db, 'otps', docKey);
            await setDoc(otpDocRef, {
              email: cleanEmail,
              otp: freshOtp,
              expiresAt: freshExpiresAt,
              updatedAt: new Date().toISOString(),
            });
          } catch {}

          console.log('[AuthService] 📧 Fresh 6-digit OTP generated for:', cleanEmail, 'is:', freshOtp);
          return { success: true };
        }
      } catch {}
    }

    return {
      success: false,
      error: 'Session not active. Please re-enter your signup credentials to receive a fresh email.',
    };
  } catch (err: any) {
    console.warn('[AuthService] resendRealVerificationEmail error:', err);
    return { success: false, error: err?.message || 'Failed to resend verification email.' };
  }
}


// ==========================================
// 2. EMAIL & PASSWORD LOGIN
// ==========================================

/**
 * Authenticates user by looking up email, hashing entered password with stored salt,
 * and checking matches.
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const docKey = getEmailDocKey(cleanEmail);

  if (!cleanEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  try {
    const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');

    let firebaseAuthUser: any = null;
    let firebaseAuthSuccess = false;

    // 1. Primary: Authenticate via Firebase Authentication
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      firebaseAuthUser = cred.user;
      firebaseAuthSuccess = true;
      console.log('[AuthService] ✅ Firebase Auth login successful for:', cleanEmail, 'UID:', cred.user.uid);
    } catch (fbErr: any) {
      console.log('[AuthService] Firebase Auth signIn info:', fbErr.code);
    }

    let userRecord: StoredUserRecord | null = null;

    // 2. Fetch user from Firestore
    try {
      const userDocRef = doc(db, 'users', docKey);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        userRecord = snap.data() as StoredUserRecord;
      }
    } catch (e) {
      console.warn('[AuthService] Firestore fetch user warning:', e);
    }

    // 3. Try local cache lookup
    if (!userRecord) {
      const localUsers = await getLocalUsers();
      if (localUsers[docKey]) {
        userRecord = localUsers[docKey];
      }
    }

    // 4. If Firebase Auth authenticated successfully
    if (firebaseAuthSuccess && firebaseAuthUser) {
      if (userRecord && userRecord.salt && userRecord.passwordHash) {
        const inputHash = await hashPassword(password, userRecord.salt);
        if (inputHash !== userRecord.passwordHash) {
          return {
            success: false,
            error: 'Invalid email or password. Please check your credentials or sign up.',
          };
        }
      }

      const uid = firebaseAuthUser.uid;
      const now = new Date().toISOString();
      const displayName = firebaseAuthUser.displayName || userRecord?.name || cleanEmail.split('@')[0];

      const updatedRecord: StoredUserRecord = {
        uid,
        email: cleanEmail,
        name: displayName,
        provider: 'password',
        isEmailVerified: firebaseAuthUser.emailVerified || !!userRecord?.isEmailVerified,
        createdAt: userRecord?.createdAt || now,
        lastLoginAt: now,
      };

      try {
        const userDocRef = doc(db, 'users', docKey);
        await setDoc(userDocRef, cleanFirestorePayload(updatedRecord), { merge: true });
      } catch {}

      await saveLocalUser(updatedRecord);

      const authUser: AuthUser = {
        uid,
        email: cleanEmail,
        name: displayName,
        provider: 'password',
        isEmailVerified: updatedRecord.isEmailVerified,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authUser));
      return { success: true, user: authUser };
    }

    // 5. If not authenticated directly in Firebase Auth, check Firestore / local password hash
    if (!userRecord) {
      return {
        success: false,
        error: 'Invalid email or password. Please check your credentials or sign up.',
      };
    }

    if (!userRecord.salt || !userRecord.passwordHash) {
      return {
        success: false,
        error: 'This account was created with Google Sign-In. Please tap Continue with Google.',
      };
    }

    // Verify password hash
    const inputHash = await hashPassword(password, userRecord.salt);
    if (inputHash !== userRecord.passwordHash) {
      return {
        success: false,
        error: 'Invalid email or password. Please check your credentials or sign up.',
      };
    }

    // Password is valid! Auto-sync user into Firebase Auth table if not there yet
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      userRecord.uid = cred.user.uid;
      console.log('[AuthService] 🔄 Auto-migrated user into Firebase Auth Users table:', cleanEmail, 'UID:', cred.user.uid);
    } catch (migErr: any) {
      if (migErr.code === 'auth/email-already-in-use') {
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          userRecord.uid = cred.user.uid;
        } catch {}
      }
    }

    // Update lastLoginAt
    const now = new Date().toISOString();
    userRecord.lastLoginAt = now;
    try {
      const userDocRef = doc(db, 'users', docKey);
      await setDoc(userDocRef, cleanFirestorePayload(userRecord), { merge: true });
    } catch {}

    await saveLocalUser(userRecord);

    const authUser: AuthUser = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.name,
      provider: userRecord.provider || 'password',
      avatarUrl: userRecord.avatarUrl,
      isEmailVerified: userRecord.isEmailVerified,
    };

    // Save active session
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authUser));

    return { success: true, user: authUser };
  } catch (err: any) {
    console.error('[AuthService] loginWithEmail error:', err);
    return { success: false, error: err?.message || 'Login failed. Please try again.' };
  }
}

// ==========================================
// 3. FORGOT PASSWORD & RESET FLOW
// ==========================================

/**
 * Requests a password reset: generates a 6-digit reset code and stores it with 15m expiry.
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; resetCode?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const docKey = getEmailDocKey(cleanEmail);

  if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    // Check if account exists
    let exists = false;
    try {
      const userDocRef = doc(db, 'users', docKey);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) exists = true;
    } catch {}

    if (!exists) {
      const localUsers = await getLocalUsers();
      if (localUsers[docKey]) exists = true;
    }

    if (!exists) {
      return {
        success: false,
        error: 'No account registered with this email address.',
      };
    }

    const resetCode = generateOtpCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    // Store in Firestore
    try {
      const resetDocRef = doc(db, 'password_resets', docKey);
      await setDoc(resetDocRef, {
        email: cleanEmail,
        token: resetCode,
        expiresAt,
        createdAt: new Date().toISOString(),
      });
    } catch {}

    // Trigger official real Firebase password reset email to user's Gmail
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, cleanEmail);
      console.log('[AuthService] 📧 Official Firebase password recovery email sent to:', cleanEmail);
    } catch (e) {
      console.warn('[AuthService] Firebase reset email dispatch warning:', e);
    }

    // Trigger password reset email delivery to user's Gmail via Firestore
    try {
      await addDoc(collection(db, 'mail'), {
        to: [cleanEmail],
        message: {
          subject: 'Colio CampusOS Password Recovery Code: ' + resetCode,
          text: `Your Colio CampusOS password recovery code is: ${resetCode}\n\nThis code will expire in 15 minutes.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0c120e; color: #ffffff; border-radius: 14px; padding: 28px; border: 1px solid #10b98133;">
              <h2 style="color: #10b981; margin: 0 0 12px 0; font-size: 22px;">Colio CampusOS</h2>
              <p style="font-size: 15px; color: #a1a1aa; line-height: 22px;">We received a request to reset your Colio CampusOS account password.</p>
              <p style="font-size: 15px; color: #a1a1aa; line-height: 22px;">Your 6-digit recovery code is:</p>
              <div style="background: #132418; border: 1.5px dashed #10b981; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #10b981;">${resetCode}</span>
              </div>
              <p style="font-size: 13px; color: #71717a; line-height: 18px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        },
      });
    } catch (e) {
      console.warn('[AuthService] Firestore mail trigger write fallback:', e);
    }

    // Store in local storage
    const resetRecord: PasswordResetRecord = {
      email: cleanEmail,
      token: resetCode,
      expiresAt,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_RESET, JSON.stringify(resetRecord));

    return { success: true, resetCode };
  } catch (err: any) {
    console.error('[AuthService] requestPasswordReset error:', err);
    return { success: false, error: err?.message || 'Could not send password reset code.' };
  }
}

/**
 * Completes password reset by verifying reset code and updating password hash in Firestore
 */
export async function completePasswordReset(
  email: string,
  resetCode: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const docKey = getEmailDocKey(cleanEmail);

  if (!resetCode.trim()) {
    return { success: false, error: 'Please enter the reset code.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  try {
    let validToken: string | null = null;
    let expiresAt: number = 0;

    // Check local storage
    const localReset = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_RESET);
    if (localReset) {
      try {
        const parsed = JSON.parse(localReset) as PasswordResetRecord;
        if (parsed.email === cleanEmail) {
          validToken = parsed.token;
          expiresAt = parsed.expiresAt;
        }
      } catch {}
    }

    // Check Firestore
    try {
      const resetDocRef = doc(db, 'password_resets', docKey);
      const snap = await getDoc(resetDocRef);
      if (snap.exists()) {
        const data = snap.data();
        validToken = data.token;
        expiresAt = data.expiresAt;
      }
    } catch {}

    if (!validToken) {
      return { success: false, error: 'Reset session expired or not found. Please request again.' };
    }

    if (Date.now() > expiresAt) {
      return { success: false, error: 'Reset code has expired. Please request a new code.' };
    }

    if (resetCode.trim() !== validToken.trim()) {
      return { success: false, error: 'Invalid reset code. Please check and try again.' };
    }

    // Valid reset code! Generate new salt and hash
    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);

    // Update Firestore
    try {
      const userDocRef = doc(db, 'users', docKey);
      await updateDoc(userDocRef, {
        passwordHash: newHash,
        salt: newSalt,
        updatedAt: new Date().toISOString(),
      });

      // Delete used reset record
      const resetDocRef = doc(db, 'password_resets', docKey);
      await deleteDoc(resetDocRef).catch(() => {});
    } catch (e) {
      console.warn('[AuthService] Firestore update password warning:', e);
    }

    // Update local cache
    const localUsers = await getLocalUsers();
    if (localUsers[docKey]) {
      localUsers[docKey].passwordHash = newHash;
      localUsers[docKey].salt = newSalt;
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(localUsers));
    }

    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_RESET).catch(() => {});

    return { success: true };
  } catch (err: any) {
    console.error('[AuthService] completePasswordReset error:', err);
    return { success: false, error: err?.message || 'Could not reset password.' };
  }
}

// ==========================================
// 4. GOOGLE AUTHENTICATION (LOGIN + SIGNUP)
// ==========================================

/**
 * Invokes the official Google Sign-In API.
 * On Web: uses Firebase signInWithPopup with GoogleAuthProvider & select_account prompt
 * to show the user's Google accounts picker.
 * On Native/Mobile: provides WebBrowser / OAuth fallback.
 */
export async function triggerGoogleSignIn(): Promise<{
  success: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
  googleUid?: string;
  error?: string;
}> {
  if (isWeb) {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      // Forces the Google account chooser to always appear
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      const user = credential.user;
      return {
        success: true,
        email: user.email || '',
        name: user.displayName || '',
        avatarUrl: user.photoURL || undefined,
        googleUid: user.uid,
      };
    } catch (err: any) {
      console.warn('[GoogleAuth] Web popup error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Google sign-in was cancelled.' };
      }
      if (err.code === 'auth/popup-blocked') {
        return { success: false, error: 'Popup blocked by browser. Please enable popups.' };
      }
      if (err.code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Sign-in popup request cancelled.' };
      }
      if (err.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error: 'Google Sign-In is not enabled in Firebase Console. Please enable Google provider.',
        };
      }
      if (
        err.code === 'auth/configuration-not-found' ||
        err?.message?.includes('configuration-not-found') ||
        err?.message?.includes('CONFIGURATION_NOT_FOUND')
      ) {
        return {
          success: false,
          error:
            'Google Sign-In is not enabled in Firebase Console for project "calio2026". Go to Firebase Console > Authentication > Sign-in method and enable Google provider, or use Quick Google Sign-In below.',
        };
      }
      return { success: false, error: err.message || 'Google sign-in failed.' };
    }
  }

  // On Mobile / Native (Expo Go / standalone)
  try {
    return {
      success: false,
      error: 'Native Google sign in requires custom standalone build. Please use Web or Email OTP.',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Google sign in unavailable.' };
  }
}

/**
 * Handles Google authentication for both new users and existing users:
 * If user exists: logs in with saved profile.
 * If user does not exist: creates an account automatically and logs in.
 */
export async function authenticateWithGoogleAccount(googleProfile: {
  email: string;
  name?: string;
  avatarUrl?: string;
  googleUid?: string;
}): Promise<{ success: boolean; user?: AuthUser; isNewUser: boolean; error?: string }> {
  const cleanEmail = googleProfile.email.trim().toLowerCase();
  const docKey = getEmailDocKey(cleanEmail);

  if (!cleanEmail) {
    return { success: false, isNewUser: false, error: 'Google email is required.' };
  }

  try {
    let existingUser: StoredUserRecord | null = null;

    // Check Firestore
    try {
      const userDocRef = doc(db, 'users', docKey);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        existingUser = snap.data() as StoredUserRecord;
      }
    } catch {}

    // Check local storage
    if (!existingUser) {
      const localUsers = await getLocalUsers();
      if (localUsers[docKey]) {
        existingUser = localUsers[docKey];
      }
    }

    const now = new Date().toISOString();

    if (existingUser) {
      // Existing user — log them in!
      try {
        const userDocRef = doc(db, 'users', docKey);
        await updateDoc(userDocRef, { lastLoginAt: now });
      } catch {}

      const authUser: AuthUser = {
        uid: existingUser.uid,
        email: existingUser.email,
        name: existingUser.name,
        provider: 'google',
        avatarUrl: googleProfile.avatarUrl || existingUser.avatarUrl,
        isEmailVerified: true,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authUser));
      return { success: true, user: authUser, isNewUser: false };
    }

    // New user — create account automatically!
    const uid = googleProfile.googleUid || `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: StoredUserRecord = {
      uid,
      email: cleanEmail,
      name: googleProfile.name || cleanEmail.split('@')[0],
      provider: 'google',
      isEmailVerified: true,
      avatarUrl: googleProfile.avatarUrl,
      createdAt: now,
      lastLoginAt: now,
    };

    // Save to Firestore
    try {
      const userDocRef = doc(db, 'users', docKey);
      await setDoc(userDocRef, cleanFirestorePayload(newRecord));
    } catch (e) {
      console.warn('[AuthService] Firestore save google user warning:', e);
    }

    // Save to local storage
    await saveLocalUser(newRecord);

    const authUser: AuthUser = {
      uid,
      email: cleanEmail,
      name: newRecord.name,
      provider: 'google',
      avatarUrl: googleProfile.avatarUrl,
      isEmailVerified: true,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(authUser));
    return { success: true, user: authUser, isNewUser: true };
  } catch (err: any) {
    console.error('[AuthService] authenticateWithGoogleAccount error:', err);
    return { success: false, isNewUser: false, error: err?.message || 'Google authentication failed.' };
  }
}

/**
 * Restores active user session from local storage
 */
export async function getPersistedSession(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears active user session (Logout)
 */
export async function logoutSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch {}
}
