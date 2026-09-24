import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Subject,
  TimetableSlot,
  Task,
  Expense,
  QuickExpensePreset,
  DocumentItem,
  Holiday,
  StudentProfile,
  TabKey,
} from '../types/campus';
import {
  initialSubjects,
  initialTimetable,
  initialTasks,
  initialExpenses,
  initialPresets,
  initialDocuments,
  initialHolidays,
  initialProfile,
} from '../data/initialData';
import { LayoutAnimation } from 'react-native';
import { triggerHapticFeedback } from '../utils/haptics';
import { AppThemeKey, Themes, ThemeColors, applyTheme } from '../theme/colors';
import { syncUserDataToCloud, fetchUserDataFromCloud } from '../services/firebase';
import {
  registerForPushNotificationsAsync,
  syncAllTimetableReminders,
  triggerAttendanceSafeguardAlert,
  scheduleTaskDeadlineReminder,
} from '../services/notifications';

import {
  AuthUser,
  signupWithEmail,
  checkEmailVerified as checkFirebaseEmailVerified,
  resendVerificationEmail as resendFirebaseVerificationEmail,
  loginWithEmail,
  requestPasswordReset,
  triggerGoogleSignInWeb,
  signInWithGoogleToken,
  logoutSession,
  getPersistedSession,
  getUserProfile,
} from '../services/authService';
export type { AuthUser };

export interface NotificationPreferences {
  classReminders: boolean;
  classReminderLeadMinutes: number; // 5, 10, or 15
  taskReminders: boolean;
  attendanceAlerts: boolean;
  morningBriefing: boolean;
}

interface CampusContextType {
  // Authentication & Session
  currentUser: AuthUser | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  checkEmailVerification: () => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithGoogleToken: (idToken: string, accessToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;

  // Tabs & Navigation
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchExpanded: boolean;
  setIsSearchExpanded: (expanded: boolean) => void;

  // Subjects & Attendance
  subjects: Subject[];
  adjustSubjectAttendance: (subjectId: string, presentDelta: number, absentDelta: number) => void;
  setSubjectAttendance: (subjectId: string, present: number, absent: number) => void;
  dailyAttendanceLogs: Record<string, 'present' | 'absent'>;
  recordSlotAttendance: (dateStr: string, slotKey: string, subjectId: string, status: 'present' | 'absent') => void;
  overallAttendance: number;
  totalPresent: number;
  totalClasses: number;
  classesCanMiss: number;
  classesNeeded: number;
  attendanceCriteria: number;
  setAttendanceCriteria: (criteria: number) => void;

  // Timetable
  timetable: TimetableSlot[];
  timetableViewMode: 'list' | 'grid';
  setTimetableViewMode: (mode: 'list' | 'grid') => void;
  todayClasses: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (id: string) => void;
  setTimetableSlots: (slots: TimetableSlot[]) => void;

  // Tasks
  tasks: Task[];
  toggleTask: (taskId: string) => void;
  addTask: (title: string, description?: string, dueDate?: string, priority?: Task['priority'], subjectId?: string) => void;
  deleteTask: (taskId: string) => void;
  pendingTasksCount: number;

  // Expenses
  expenses: Expense[];
  presets: QuickExpensePreset[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addPreset: (preset: Omit<QuickExpensePreset, 'id'>) => void;
  updatePreset: (preset: QuickExpensePreset) => void;
  deletePreset: (id: string) => void;
  currentMonthTotal: number;
  prevMonthTotal: number;
  momChangePercent: number;

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'addedAt'>) => void;
  deleteDocument: (id: string) => void;

  // Holidays
  holidays: Holiday[];
  addHoliday: (name: string, date: string, type: 'HOLIDAY' | 'DUTY_LEAVE') => void;
  deleteHoliday: (id: string) => void;

  // Profile & Preferences
  profile: StudentProfile;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  isSetupComplete: boolean;
  setIsSetupComplete: (complete: boolean) => void;
  resetAllData: () => Promise<void>;
  appTheme: AppThemeKey;
  setAppTheme: (theme: AppThemeKey) => void;
  themePreference: 'system' | AppThemeKey;
  setThemePreference: (pref: 'system' | AppThemeKey) => void;
  currentTheme: ThemeColors;
  classRemindersEnabled: boolean;
  setClassRemindersEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  // Notification Preferences & Smart Alarms
  notificationPrefs: NotificationPreferences;
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
  // Cloud Sync & Notifications
  syncToCloud: () => Promise<boolean>;
  restoreFromCloud: () => Promise<boolean>;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUBJECTS: '@colio_subjects_v2',
  TIMETABLE: '@colio_timetable_v2',
  TASKS: '@colio_tasks_v2',
  EXPENSES: '@colio_expenses_v2',
  PRESETS: '@colio_presets_v2',
  TIMETABLE_MODE: '@colio_timetable_view_mode',
  PROFILE: '@colio_profile_v2',
  DOCUMENTS: '@colio_documents_v2',
  HOLIDAYS: '@colio_holidays_v2',
  ATTENDANCE_CRITERIA: '@colio_attendance_criteria_v2',
  APP_THEME: '@colio_app_theme_v2',
  CLASS_REMINDERS: '@colio_class_reminders_v2',
  HAPTICS: '@colio_haptics_v2',
  SETUP_COMPLETE: '@colio_setup_complete_v2',
  NOTIFICATION_PREFS: '@colio_notification_prefs_v2',
  LAST_SYNC: '@colio_last_sync_v2',
};

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabKey>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [timetable, setTimetableState] = useState<TimetableSlot[]>(initialTimetable);
  const [timetableViewMode, setTimetableViewModeState] = useState<'list' | 'grid'>('list');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [presets, setPresets] = useState<QuickExpensePreset[]>(initialPresets);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [isSetupComplete, setIsSetupCompleteState] = useState<boolean>(true);
  const [notificationPrefs, setNotificationPrefsState] = useState<NotificationPreferences>({
    classReminders: true,
    classReminderLeadMinutes: 10,
    taskReminders: true,
    attendanceAlerts: true,
    morningBriefing: true,
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Daily Attendance Logs (slot-level, per date)
  const [dailyAttendanceLogs, setDailyAttendanceLogs] = useState<Record<string, 'present' | 'absent'>>({});

  // Dynamic Preferences
  const [attendanceCriteria, setAttendanceCriteriaState] = useState<number>(68);
  const [appTheme, setAppThemeState] = useState<AppThemeKey>('dark-emerald');
  const [themePreference, setThemePreferenceState] = useState<'system' | AppThemeKey>('dark-emerald');
  const [classRemindersEnabled, setClassRemindersEnabledState] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  const currentTheme = Themes[appTheme] || Themes['dark-emerald'];

  const setAttendanceCriteria = (criteria: number) => {
    triggerHapticFeedback('selection');
    setAttendanceCriteriaState(criteria);
    AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE_CRITERIA, String(criteria)).catch(() => {});
  };

  const setAppTheme = (theme: AppThemeKey) => {
    triggerHapticFeedback('selection');
    applyTheme(theme);
    setAppThemeState(theme);
    setThemePreferenceState(theme);
    AsyncStorage.setItem(STORAGE_KEYS.APP_THEME, theme).catch(() => {});
  };

  const setThemePreference = (pref: 'system' | AppThemeKey) => {
    setThemePreferenceState(pref);
    if (pref !== 'system') {
      setAppTheme(pref);
    }
  };

  // --- Auth methods wired to Firebase-only authService ---
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await loginWithEmail(email, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const signup = async (
    email: string,
    pass: string,
    name: string
  ): Promise<{ success: boolean; requiresVerification?: boolean; error?: string }> => {
    // Creates Firebase Auth account + sends verification email. No OTP involved.
    return await signupWithEmail(email, name, pass);
  };

  const checkEmailVerification = async (): Promise<{ success: boolean; error?: string }> => {
    // Reloads Firebase Auth user and checks emailVerified flag
    const res = await checkFirebaseEmailVerified();
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsSetupCompleteState(false);
      await AsyncStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'false').catch(() => {});
      if (res.user.name) updateProfile({ name: res.user.name });
    }
    return res;
  };

  const resendVerificationEmailHandler = async (): Promise<{ success: boolean; error?: string }> => {
    return await resendFirebaseVerificationEmail();
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    // Web: Firebase popup
    const res = await triggerGoogleSignInWeb();
    if (res.success && res.user) {
      setCurrentUser(res.user);
      if (res.isNewUser) {
        setIsSetupCompleteState(false);
        await AsyncStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'false').catch(() => {});
      }
    }
    return res;
  };

  const signInWithGoogleTokenHandler = async (
    idToken: string,
    accessToken?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Native: called from AuthScreen with token from expo-auth-session Google hook
    const res = await signInWithGoogleToken(idToken, accessToken);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      if (res.isNewUser) {
        setIsSetupCompleteState(false);
        await AsyncStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'false').catch(() => {});
      }
    }
    return res;
  };

  const logout = async () => {
    await logoutSession();
    setCurrentUser(null);
  };

  const requestPasswordResetHandler = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    return await requestPasswordReset(email);
  };

  // --- Daily slot attendance recording ---
  const recordSlotAttendance = (dateStr: string, slotKey: string, subjectId: string, status: 'present' | 'absent') => {
    const key = `${dateStr}_${slotKey}`;
    setDailyAttendanceLogs((prev) => {
      const existing = prev[key];
      const updated = { ...prev };

      if (existing === status) {
        // Same tap: unmark (decrement count, remove log)
        delete updated[key];
        adjustSubjectAttendance(subjectId, status === 'present' ? -1 : 0, status === 'absent' ? -1 : 0);
      } else if (existing) {
        // Different status: switch (un-mark old, mark new)
        updated[key] = status;
        adjustSubjectAttendance(
          subjectId,
          status === 'present' ? 1 : -1,  // +1 present or -1 present
          status === 'absent' ? 1 : -1     // +1 absent or -1 absent
        );
      } else {
        // First mark
        updated[key] = status;
        adjustSubjectAttendance(subjectId, status === 'present' ? 1 : 0, status === 'absent' ? 1 : 0);
      }

      AsyncStorage.setItem('@colio_attendance_logs_v2', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const setClassRemindersEnabled = (enabled: boolean) => {
    triggerHapticFeedback('selection');
    setClassRemindersEnabledState(enabled);
    AsyncStorage.setItem(STORAGE_KEYS.CLASS_REMINDERS, String(enabled)).catch(() => {});
    updateNotificationPrefs({ classReminders: enabled });
  };

  const updateNotificationPrefs = (prefs: Partial<NotificationPreferences>) => {
    triggerHapticFeedback('selection');
    setNotificationPrefsState((prev) => {
      const merged = { ...prev, ...prefs };
      AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(merged)).catch(() => {});
      syncAllTimetableReminders(
        timetable,
        subjects,
        merged.classReminders,
        merged.classReminderLeadMinutes,
        merged.morningBriefing
      ).catch(() => {});
      return merged;
    });
  };

  const setHapticsEnabled = (enabled: boolean) => {
    triggerHapticFeedback('selection');
    setHapticsEnabledState(enabled);
    AsyncStorage.setItem(STORAGE_KEYS.HAPTICS, String(enabled)).catch(() => {});
  };

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [
          savedSubjects,
          savedTimetable,
          savedTasks,
          savedExpenses,
          savedPresets,
          savedMode,
          savedProfile,
          savedDocs,
          savedHols,
          savedCriteria,
          savedTheme,
          savedReminders,
          savedHaptics,
          savedSetupComplete,
          savedNotificationPrefs,
          savedLastSync,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SUBJECTS),
          AsyncStorage.getItem(STORAGE_KEYS.TIMETABLE),
          AsyncStorage.getItem(STORAGE_KEYS.TASKS),
          AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
          AsyncStorage.getItem(STORAGE_KEYS.PRESETS),
          AsyncStorage.getItem(STORAGE_KEYS.TIMETABLE_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.HOLIDAYS),
          AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE_CRITERIA),
          AsyncStorage.getItem(STORAGE_KEYS.APP_THEME),
          AsyncStorage.getItem(STORAGE_KEYS.CLASS_REMINDERS),
          AsyncStorage.getItem(STORAGE_KEYS.HAPTICS),
          AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC),
        ]);

        if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
        if (savedTimetable) setTimetableState(JSON.parse(savedTimetable));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedPresets) setPresets(JSON.parse(savedPresets));
        if (savedMode === 'grid' || savedMode === 'list') setTimetableViewModeState(savedMode);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfile(parsed);
          if (parsed.isSetupComplete !== undefined && savedSetupComplete === null) {
            setIsSetupCompleteState(Boolean(parsed.isSetupComplete));
          }
        }
        if (savedDocs) setDocuments(JSON.parse(savedDocs));
        if (savedHols) setHolidays(JSON.parse(savedHols));
        if (savedCriteria) setAttendanceCriteriaState(parseInt(savedCriteria, 10));
        if (savedTheme && Themes[savedTheme as AppThemeKey]) {
          applyTheme(savedTheme as AppThemeKey);
          setAppThemeState(savedTheme as AppThemeKey);
        } else {
          applyTheme('dark-emerald');
        }
        if (savedReminders !== null) setClassRemindersEnabledState(savedReminders === 'true');
        if (savedHaptics !== null) setHapticsEnabledState(savedHaptics === 'true');
        if (savedSetupComplete !== null) {
          setIsSetupCompleteState(savedSetupComplete === 'true');
        }
        if (savedNotificationPrefs) {
          try {
            const parsedPrefs = JSON.parse(savedNotificationPrefs);
            setNotificationPrefsState(parsedPrefs);
          } catch {}
        }
        if (savedLastSync) {
          setLastSyncTime(savedLastSync);
        }

        // Register for push notifications on app launch
        registerForPushNotificationsAsync().catch(() => {});

        // Load auth user — uses Firebase authStateReady as source of truth, falls back to 7-day cache
        const restoredUser = await getPersistedSession().catch(() => null);
        if (restoredUser) {
          setCurrentUser(restoredUser);
        }

        // Load daily attendance logs
        const savedAttLogs = await AsyncStorage.getItem('@colio_attendance_logs_v2').catch(() => null);
        if (savedAttLogs) {
          try { setDailyAttendanceLogs(JSON.parse(savedAttLogs)); } catch {}
        }
      } catch (err) {
        console.warn('Error restoring storage:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // --- Auto Cloud Sync (Debounced) ---
  // Syncs 45 seconds after the last data change, only when logged in.
  // Timer resets on every change, so rapid edits coalesce into one network call.
  const autoSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const AUTO_SYNC_DELAY_MS = 45_000; // 45 seconds

  useEffect(() => {
    // Only auto-sync when there's an authenticated user
    if (!currentUser?.uid) return;

    // Cancel any pending timer
    if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);

    // Schedule a new sync after the delay
    autoSyncTimerRef.current = setTimeout(() => {
      // Don't sync if a manual sync is already running
      if (!isSyncing) {
        syncToCloud().catch(() => {});
      }
    }, AUTO_SYNC_DELAY_MS);

    // Cleanup on unmount or before next effect run
    return () => {
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, tasks, expenses, timetable, documents, currentUser?.uid]);

  const setActiveTab = (tab: TabKey) => {
    triggerHapticFeedback('selection');
    setActiveTabState(tab);
  };

  const setTimetableViewMode = (mode: 'list' | 'grid') => {
    triggerHapticFeedback('selection');
    setTimetableViewModeState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE_MODE, mode).catch(() => {});
  };

  // --- Dynamic Attendance Calculations (Based on current attendanceCriteria) ---
  const ATTENDANCE_CRITERIA_RATIO = attendanceCriteria / 100;
  const totalPresent = subjects.reduce((sum, s) => sum + s.present, 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + s.absent, 0);
  const totalClasses = totalPresent + totalAbsent;
  const overallAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 100;

  // Classes can miss vs needed for attendanceCriteria
  const classesCanMiss = Math.max(0, Math.floor((totalPresent - ATTENDANCE_CRITERIA_RATIO * totalClasses) / ATTENDANCE_CRITERIA_RATIO));
  const classesNeeded = Math.max(0, Math.ceil((ATTENDANCE_CRITERIA_RATIO * totalClasses - totalPresent) / (1 - ATTENDANCE_CRITERIA_RATIO)));

  const adjustSubjectAttendance = (subjectId: string, presentDelta: number, absentDelta: number) => {
    triggerHapticFeedback('light');
    setSubjects((prev) => {
      const updated = prev.map((subj) => {
        if (subj.id !== subjectId) return subj;
        const newPresent = Math.max(0, subj.present + presentDelta);
        const newAbsent = Math.max(0, subj.absent + absentDelta);
        const total = newPresent + newAbsent;
        const percent = total > 0 ? Math.round((newPresent / total) * 100) : 100;

        // 75% Attendance Safeguard notification trigger when entering danger zone
        if (notificationPrefs.attendanceAlerts && percent <= attendanceCriteria && total >= 3 && absentDelta > 0) {
          const needed = Math.max(1, Math.ceil((ATTENDANCE_CRITERIA_RATIO * total - newPresent) / (1 - ATTENDANCE_CRITERIA_RATIO)));
          triggerAttendanceSafeguardAlert(subj.name, percent, attendanceCriteria, needed);
        }

        return { ...subj, present: newPresent, absent: newAbsent };
      });
      AsyncStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const setSubjectAttendance = (subjectId: string, present: number, absent: number) => {
    triggerHapticFeedback('medium');
    setSubjects((prev) => {
      const updated = prev.map((subj) =>
        subj.id === subjectId ? { ...subj, present: Math.max(0, present), absent: Math.max(0, absent) } : subj
      );
      AsyncStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // --- Today's Classes ---
  // 1 = Monday, 6 = Saturday. If Sunday (0), fallback to Monday's schedule for preview.
  const currentDay = new Date().getDay();
  const dayKey = currentDay === 0 ? 1 : currentDay;
  const todayClasses = timetable
    .filter((slot) => slot.dayOfWeek === dayKey)
    .sort((a, b) => a.period - b.period);

  // --- Tasks Logic (Sorting completed tasks to bottom) ---
  const toggleTask = (taskId: string) => {
    triggerHapticFeedback('selection');
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      const sorted = [...updated].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
      AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(sorted)).catch(() => {});
      return sorted;
    });
  };

  const addTask = (
    title: string,
    description = '',
    dueDate = 'Today',
    priority: Task['priority'] = 'MEDIUM',
    subjectId?: string
  ) => {
    triggerHapticFeedback('success');
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      dueDate,
      priority,
      completed: false,
      subjectId,
    };
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {}
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Schedule Task & Assignment Deadline reminder
    if (notificationPrefs.taskReminders) {
      const subjName = subjectId ? subjects.find((s) => s.id === subjectId)?.name : undefined;
      scheduleTaskDeadlineReminder(newTask, subjName).catch(() => {});
    }
  };

  const deleteTask = (taskId: string) => {
    triggerHapticFeedback('medium');
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {}
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  // --- Expenses Logic ---
  const addExpense = (exp: Omit<Expense, 'id'>) => {
    triggerHapticFeedback('success');
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newExpense: Expense = {
      ...exp,
      time: exp.time || formattedTime,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updateExpense = (updatedExpense: Expense) => {
    triggerHapticFeedback('medium');
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e));
      AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteExpense = (id: string) => {
    triggerHapticFeedback('warning');
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const addPreset = (preset: Omit<QuickExpensePreset, 'id'>) => {
    triggerHapticFeedback('success');
    const newPreset: QuickExpensePreset = {
      ...preset,
      id: `pre-${Date.now()}`,
    };
    setPresets((prev) => {
      const updated = [...prev, newPreset];
      AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updatePreset = (preset: QuickExpensePreset) => {
    triggerHapticFeedback('medium');
    setPresets((prev) => {
      const updated = prev.map((p) => (p.id === preset.id ? preset : p));
      AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deletePreset = (id: string) => {
    triggerHapticFeedback('warning');
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Month-over-month expenses calculation
  // Dynamic month calculation — never hardcoded
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTotal = expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthTotal = expenses
    .filter((e) => e.date.startsWith(prevMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const syncToCloud = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      // Use Firebase Auth UID as the primary key — never the roll number alone
      const studentId = currentUser?.uid || 'unknown_student';
      if (studentId === 'unknown_student') {
        setIsSyncing(false);
        return false;
      }

      // Strip device-local file URIs from documents before cloud sync
      // (file:/// URIs are meaningless on another device)
      const cloudSafeDocuments = documents.map((d) => ({
        ...d,
        uri: undefined,         // remove local file URI
        localPath: undefined,   // remove any local path
      }));

      const success = await syncUserDataToCloud(studentId, {
        profile,
        timetable,
        subjects,
        tasks,
        expenses,
        documents: cloudSafeDocuments,
        attendanceLogs: dailyAttendanceLogs,
      });

      if (success) {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        setLastSyncTime(timeStr);
        AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr).catch(() => {});
        triggerHapticFeedback('success');
      }
      setIsSyncing(false);
      return success;
    } catch {
      setIsSyncing(false);
      return false;
    }
  };

  const restoreFromCloud = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const studentId = currentUser?.uid || 'unknown_student';
      if (studentId === 'unknown_student') { setIsSyncing(false); return false; }

      const backup = await fetchUserDataFromCloud(studentId);
      if (!backup) { setIsSyncing(false); return false; }

      if (backup.timetable && backup.timetable.length > 0) {
        setTimetableState(backup.timetable);
        AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(backup.timetable)).catch(() => {});
      }
      if (backup.subjects) {
        setSubjects(backup.subjects);
        AsyncStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(backup.subjects)).catch(() => {});
      }
      if (backup.tasks) {
        setTasks(backup.tasks);
        AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(backup.tasks)).catch(() => {});
      }
      if (backup.expenses) {
        setExpenses(backup.expenses);
        AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(backup.expenses)).catch(() => {});
      }
      if (backup.profile) {
        setProfile(backup.profile);
        AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(backup.profile)).catch(() => {});
      }
      // Restore document metadata (file URIs were stripped on upload — titles/dates restored)
      if (backup.documents && backup.documents.length > 0) {
        setDocuments(backup.documents);
        AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(backup.documents)).catch(() => {});
      }
      if (backup.attendanceLogs) {
        setDailyAttendanceLogs(backup.attendanceLogs);
        AsyncStorage.setItem('@colio_attendance_logs_v2', JSON.stringify(backup.attendanceLogs)).catch(() => {});
      }

      const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      setLastSyncTime(timeStr);
      AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr).catch(() => {});
      triggerHapticFeedback('success');
      setIsSyncing(false);
      return true;
    } catch {
      setIsSyncing(false);
      return false;
    }
  };

  const momChangePercent =
    prevMonthTotal > 0 ? Math.round(((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100) : 0;

  // --- Documents Logic ---
  const addDocument = (doc: Omit<DocumentItem, 'id' | 'addedAt'>) => {
    triggerHapticFeedback('success');
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      addedAt: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteDocument = (id: string) => {
    triggerHapticFeedback('warning');
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // --- Holidays Logic ---
  const addHoliday = (name: string, date: string, type: 'HOLIDAY' | 'DUTY_LEAVE') => {
    triggerHapticFeedback('success');
    const newHol: Holiday = {
      id: `hol-${Date.now()}`,
      name,
      date,
      type,
    };
    setHolidays((prev) => {
      const updated = [...prev, newHol].sort((a, b) => a.date.localeCompare(b.date));
      AsyncStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteHoliday = (id: string) => {
    triggerHapticFeedback('warning');
    setHolidays((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // --- Timetable CRUD Logic ---
  const setTimetableSlots = (slots: TimetableSlot[]) => {
    triggerHapticFeedback('success');
    setTimetableState(slots);
    AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(slots)).catch(() => {});
  };

  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    triggerHapticFeedback('success');
    const newSlot: TimetableSlot = {
      ...slot,
      id: `tt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setTimetableState((prev) => {
      // Remove any existing slot at the exact same day & period to prevent conflicts
      const filtered = prev.filter(
        (s) => !(s.dayOfWeek === slot.dayOfWeek && s.period === slot.period)
      );
      const updated = [...filtered, newSlot].sort((a, b) => a.period - b.period);
      AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updateTimetableSlot = (updatedSlot: TimetableSlot) => {
    triggerHapticFeedback('medium');
    setTimetableState((prev) => {
      const updated = prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));
      AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteTimetableSlot = (id: string) => {
    triggerHapticFeedback('warning');
    setTimetableState((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // --- Profile & Setup Logic ---
  const updateProfile = (updated: Partial<StudentProfile>) => {
    triggerHapticFeedback('success');
    setProfile((prev) => {
      const merged = { ...prev, ...updated };
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged)).catch(() => {});
      return merged;
    });
  };

  const setIsSetupComplete = (complete: boolean) => {
    triggerHapticFeedback('success');
    setIsSetupCompleteState(complete);
    AsyncStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, String(complete)).catch(() => {});
    setProfile((prev) => {
      const updated = { ...prev, isSetupComplete: complete };
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const resetAllData = async () => {
    triggerHapticFeedback('warning');
    const allKeysToPurge = [
      ...Object.values(STORAGE_KEYS),
      '@colio_cancelled_attendance_subjects_v1',
      '@colio_avatar_size_v2',
      '@colio_attendance_logs_v2',  // attendance logs
      '@colio_auth_user_v2',        // old auth session key (legacy)
      '@colio_auth_user_v3',        // new Firebase-only session cache key
      '@colio_rate_limit_login',    // rate limit entries
      '@colio_rate_limit_signup',
      '@colio_rate_limit_reset',
      '@colio_expenses_view_mode',  // expenses view mode
    ];

    try {
      await AsyncStorage.multiRemove(allKeysToPurge);
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }

    // Also sign out so the user goes back to AuthScreen after reset
    await logoutSession().catch(() => {});
    setCurrentUser(null);

    // Clean subjects with fresh 0 attendance counts
    const cleanSubjects = initialSubjects.map((s) => ({
      ...s,
      present: 0,
      absent: 0,
    }));

    // Reset state: Clean all data — user is logged out, will re-onboard on next login
    setSubjects(cleanSubjects);
    setTimetableState(initialTimetable);
    setTasks([]);
    setExpenses([]);
    setPresets(initialPresets);
    setDocuments(initialDocuments);
    setHolidays(initialHolidays);
    setProfile(initialProfile);
    setDailyAttendanceLogs({});
    setIsSetupCompleteState(false);  // re-trigger onboarding on next login
    setActiveTabState('home');

    // Persist the clean baseline into local database (AsyncStorage)
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TIMETABLE, JSON.stringify(initialTimetable)],
        [STORAGE_KEYS.PROFILE, JSON.stringify(initialProfile)],
        [STORAGE_KEYS.SUBJECTS, JSON.stringify(cleanSubjects)],
        [STORAGE_KEYS.TASKS, JSON.stringify([])],
        [STORAGE_KEYS.EXPENSES, JSON.stringify([])],
        [STORAGE_KEYS.SETUP_COMPLETE, 'false'],  // force re-onboarding
      ]);
    } catch (e) {
      console.warn('Error writing clean initial db state:', e);
    }
  };

  return (
    <CampusContext.Provider
      value={{
        // Auth
        currentUser,
        login,
        signup,
        checkEmailVerification,
        resendVerificationEmail: resendVerificationEmailHandler,
        loginWithGoogle,
        signInWithGoogleToken: signInWithGoogleTokenHandler,
        logout,
        requestPasswordReset: requestPasswordResetHandler,
        // Daily attendance logs
        dailyAttendanceLogs,
        recordSlotAttendance,
        // Theme preference
        themePreference,
        setThemePreference,
        activeTab,
        setActiveTab,
        isLoading,
        searchQuery,
        setSearchQuery,
        isSearchExpanded,
        setIsSearchExpanded,
        subjects,
        adjustSubjectAttendance,
        setSubjectAttendance,
        overallAttendance,
        totalPresent,
        totalClasses,
        classesCanMiss,
        classesNeeded,
        attendanceCriteria,
        timetable,
        timetableViewMode,
        setTimetableViewMode,
        todayClasses,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        setTimetableSlots,
        tasks,
        toggleTask,
        addTask,
        deleteTask,
        pendingTasksCount,
        expenses,
        presets,
        addExpense,
        updateExpense,
        deleteExpense,
        addPreset,
        updatePreset,
        deletePreset,
        currentMonthTotal,
        prevMonthTotal,
        momChangePercent,
        documents,
        addDocument,
        deleteDocument,
        holidays,
        addHoliday,
        deleteHoliday,
        profile,
        updateProfile,
        isSetupComplete,
        setIsSetupComplete,
        resetAllData,
        setAttendanceCriteria,
        appTheme,
        setAppTheme,
        currentTheme,
        classRemindersEnabled,
        setClassRemindersEnabled,
        hapticsEnabled,
        setHapticsEnabled,
        notificationPrefs,
        updateNotificationPrefs,
        syncToCloud,
        restoreFromCloud,
        lastSyncTime,
        isSyncing,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
