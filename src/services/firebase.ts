import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase configuration derived from your google-services.json & Firebase project
const firebaseConfig = {
  apiKey: 'AIzaSyDIn6WYpNXoGI3MgqbBgUUmAToTGXvJmfo',
  authDomain: 'calio2026.firebaseapp.com',
  projectId: 'calio2026',
  storageBucket: 'calio2026.firebasestorage.app',
  messagingSenderId: '61733534967',
  appId: '1:61733534967:android:8f2b4686c114e11f4527f2',
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database
export const db = getFirestore(app);

export interface CloudStudentBackup {
  profile: any;
  timetable: any[];
  subjects: any[];
  tasks: any[];
  expenses: any[];
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
