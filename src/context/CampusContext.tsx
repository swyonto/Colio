import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface CampusContextType {
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
  appTheme: AppThemeKey;
  setAppTheme: (theme: AppThemeKey) => void;
  currentTheme: ThemeColors;
  classRemindersEnabled: boolean;
  setClassRemindersEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUBJECTS: '@campusos_subjects_v2',
  TASKS: '@campusos_tasks_v2',
  EXPENSES: '@campusos_expenses_v2',
  PRESETS: '@campusos_presets_v2',
  TIMETABLE_MODE: '@campusos_timetable_view_mode',
  PROFILE: '@campusos_profile_v2',
  DOCUMENTS: '@campusos_documents_v2',
  HOLIDAYS: '@campusos_holidays_v2',
  ATTENDANCE_CRITERIA: '@campusos_attendance_criteria_v2',
  APP_THEME: '@campusos_app_theme_v2',
  CLASS_REMINDERS: '@campusos_class_reminders_v2',
  HAPTICS: '@campusos_haptics_v2',
};

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabKey>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [timetable] = useState<TimetableSlot[]>(initialTimetable);
  const [timetableViewMode, setTimetableViewModeState] = useState<'list' | 'grid'>('list');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [presets, setPresets] = useState<QuickExpensePreset[]>(initialPresets);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);

  // Dynamic Preferences
  const [attendanceCriteria, setAttendanceCriteriaState] = useState<number>(68);
  const [appTheme, setAppThemeState] = useState<AppThemeKey>('dark-emerald');
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
    AsyncStorage.setItem(STORAGE_KEYS.APP_THEME, theme).catch(() => {});
  };

  const setClassRemindersEnabled = (enabled: boolean) => {
    triggerHapticFeedback('selection');
    setClassRemindersEnabledState(enabled);
    AsyncStorage.setItem(STORAGE_KEYS.CLASS_REMINDERS, String(enabled)).catch(() => {});
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
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SUBJECTS),
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
        ]);

        if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedPresets) setPresets(JSON.parse(savedPresets));
        if (savedMode === 'grid' || savedMode === 'list') setTimetableViewModeState(savedMode);
        if (savedProfile) setProfile(JSON.parse(savedProfile));
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
      } catch (err) {
        console.warn('Error restoring storage:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
  const currentMonthTotal = expenses
    .filter((e) => e.date.startsWith('2026-09'))
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthTotal = expenses
    .filter((e) => e.date.startsWith('2026-08'))
    .reduce((sum, e) => sum + e.amount, 0);

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

  // --- Profile Logic ---
  const updateProfile = (updated: Partial<StudentProfile>) => {
    triggerHapticFeedback('success');
    setProfile((prev) => {
      const merged = { ...prev, ...updated };
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged)).catch(() => {});
      return merged;
    });
  };

  return (
    <CampusContext.Provider
      value={{
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
        setAttendanceCriteria,
        appTheme,
        setAppTheme,
        currentTheme,
        classRemindersEnabled,
        setClassRemindersEnabled,
        hapticsEnabled,
        setHapticsEnabled,
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
