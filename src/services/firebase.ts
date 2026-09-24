import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { getAuth } from 'firebase/auth';

// Firebase configuration loaded from environment variables.
// In development: create a .env file from .env.example and fill in real values.
// In production EAS builds: set these in eas.json build env or the EAS Secrets dashboard.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Warn in development if any required key is missing (never throws in prod to avoid crashes)
if (__DEV__) {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missingKeys.length > 0) {
    console.warn(
      `[Firebase] Missing environment variables: ${missingKeys.join(', ')}.\n` +
      'Copy .env.example to .env and fill in your Firebase project values.'
    );
  }
}

// Initialize Firebase once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export interface CloudStudentBackup {
  profile: any;
  timetable: any[];
  subjects: any[];
  tasks: any[];
  expenses: any[];
  documents?: any[]; // document metadata (NOT file URIs — those are device-local)
  attendanceLogs?: Record<string, 'present' | 'absent'>;
  updatedAt?: any;
}

/**
 * Saves or updates student records in Firestore under 'students/{studentId}'
 */
export async function syncUserDataToCloud(
  studentId: string,
  data: Partial<CloudStudentBackup>
): Promise<boolean> {
  try {
    const cleanId = (studentId || 'default_student').replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'students', cleanId);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('[Firebase] Error saving to cloud:', error);
    return false;
  }
}

/**
 * Fetches student records from Firestore
 */
export async function fetchUserDataFromCloud(
  studentId: string
): Promise<CloudStudentBackup | null> {
  try {
    const cleanId = (studentId || 'default_student').replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'students', cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CloudStudentBackup;
    }
    return null;
  } catch (error) {
    console.warn('[Firebase] Error fetching from cloud:', error);
    return null;
  }
}

/**
 * Subscribes to realtime updates for this student from Firestore
 */
export function subscribeToCloudUpdates(
  studentId: string,
  onUpdate: (data: CloudStudentBackup) => void
): () => void {
  const cleanId = (studentId || 'default_student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const docRef = doc(db, 'students', cleanId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as CloudStudentBackup);
      }
    },
    (err) => {
      console.warn('[Firebase] Realtime snapshot error:', err);
    }
  );
}

export default app;
