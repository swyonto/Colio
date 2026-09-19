export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ExpenseCategory = 'Food' | 'Transport' | 'Books' | 'College' | 'Other';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  room: string;
  color: string;
  present: number;
  absent: number;
  targetPercent: number;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  period: number; // 1 to 9
  startTime: string;
  endTime: string;
  subjectId: string;
  room: string;
  teacher: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD or 'Today' / 'Tomorrow'
  priority: Priority;
  completed: boolean;
  subjectId?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  timeOfDay: TimeOfDay;
  time?: string; // e.g. "01:30 PM"
  date: string; // ISO format: YYYY-MM-DD
  icon?: string;
}

export interface QuickExpensePreset {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  icon: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  docType: 'BOOK' | 'NOTES' | 'SYLLABUS' | 'OTHER';
  subjectCode?: string;
  size: string;
  addedAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'HOLIDAY' | 'DUTY_LEAVE';
}

export interface StudentProfile {
  appNickname: string;
  name: string;
  rollNumber: string;
  course: string;
  branch: string;
  semester: string;
  college: string;
  avatarUri?: string;
  idCardFrontUri?: string;
  idCardBackUri?: string;
}

export type TabKey = 'home' | 'attend' | 'timetable' | 'expenses' | 'more';
