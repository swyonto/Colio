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
import { triggerHapticFeedback } from '../utils/haptics';

interface CampusContextType {
  // Tabs & Navigation
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
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

  // Profile
  profile: StudentProfile;
  updateProfile: (profile: Partial<StudentProfile>) => void;
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
};

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabKey>('home');
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

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedSubjects, savedTasks, savedExpenses, savedPresets, savedMode, savedProfile, savedDocs, savedHols] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.SUBJECTS),
            AsyncStorage.getItem(STORAGE_KEYS.TASKS),
            AsyncStorage.getItem(STORAGE_KEYS.EXPENSES),
            AsyncStorage.getItem(STORAGE_KEYS.PRESETS),
            AsyncStorage.getItem(STORAGE_KEYS.TIMETABLE_MODE),
            AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
            AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS),
            AsyncStorage.getItem(STORAGE_KEYS.HOLIDAYS),
          ]);

        if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedPresets) setPresets(JSON.parse(savedPresets));
        if (savedMode === 'grid' || savedMode === 'list') setTimetableViewModeState(savedMode);
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedDocs) setDocuments(JSON.parse(savedDocs));
        if (savedHols) setHolidays(JSON.parse(savedHols));
      } catch (err) {
        console.warn('Error restoring storage:', err);
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

  // --- Attendance Calculations (68% Criteria requested) ---
  const ATTENDANCE_CRITERIA_RATIO = 0.68;
  const attendanceCriteria = 68;
  const totalPresent = subjects.reduce((sum, s) => sum + s.present, 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + s.absent, 0);
  const totalClasses = totalPresent + totalAbsent;
  const overallAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 100;

  // Classes can miss vs needed for 68%
  // canMiss = floor((present - 0.68 * total) / 0.68)
  // needed = ceil((0.68 * total - present) / (1 - 0.68))
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

  // --- Tasks Logic (Section 6: Checkbox strike-through, 55% dim, sink to bottom) ---
  const toggleTask = (taskId: string) => {
    triggerHapticFeedback('selection');
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      // Sort completed items to the bottom
      updated.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
      AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated)).catch(() => {});
      return updated;
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
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const deleteTask = (taskId: string) => {
    triggerHapticFeedback('medium');
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
    const newExpense: Expense = {
      ...exp,
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
