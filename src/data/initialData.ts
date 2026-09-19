import { Subject, TimetableSlot, Task, Expense, QuickExpensePreset, DocumentItem, Holiday, StudentProfile } from '../types/campus';

export const initialSubjects: Subject[] = [
  {
    id: 'subj-1',
    name: 'Python Programming',
    code: 'PYTH',
    teacher: 'Prof. Sharma',
    room: 'CL-2',
    color: '#00E676',
    present: 26,
    absent: 4,
    targetPercent: 68,
  },
  {
    id: 'subj-2',
    name: 'Computer System Architecture',
    code: 'CSA',
    teacher: 'Dr. Verma',
    room: 'LT-1',
    color: '#00C853',
    present: 22,
    absent: 6,
    targetPercent: 68,
  },
  {
    id: 'subj-3',
    name: 'Mathematical Computing',
    code: 'MC',
    teacher: 'Prof. Rao',
    room: 'Lab 1',
    color: '#69F0AE',
    present: 19,
    absent: 5,
    targetPercent: 68,
  },
  {
    id: 'subj-4',
    name: 'Economics for Engineers',
    code: 'GE1',
    teacher: 'Dr. Mehta',
    room: 'R-204',
    color: '#00B0FF',
    present: 16,
    absent: 2,
    targetPercent: 68,
  },
  {
    id: 'subj-5',
    name: 'Value Addition: Ethics',
    code: 'VAC1',
    teacher: 'Prof. Singh',
    room: 'Audi 2',
    color: '#FFD600',
    present: 12,
    absent: 1,
    targetPercent: 68,
  },
  {
    id: 'subj-6',
    name: 'Web Dev & Cloud Skills',
    code: 'SEC1',
    teacher: 'Dr. Gupta',
    room: 'Lab 3',
    color: '#FF9100',
    present: 20,
    absent: 3,
    targetPercent: 68,
  },
  {
    id: 'subj-7',
    name: 'Technical Communication',
    code: 'LANG1',
    teacher: 'Ms. Kapoor',
    room: 'R-102',
    color: '#00E5FF',
    present: 15,
    absent: 3,
    targetPercent: 68,
  },
];

export const initialTimetable: TimetableSlot[] = [
  // Monday (1)
  { id: 'tt-m1', dayOfWeek: 1, period: 1, startTime: '08:30', endTime: '09:30', subjectId: 'subj-1', room: 'CL-2', teacher: 'Prof. Sharma' },
  { id: 'tt-m2', dayOfWeek: 1, period: 2, startTime: '09:30', endTime: '10:30', subjectId: 'subj-2', room: 'LT-1', teacher: 'Dr. Verma' },
  { id: 'tt-m3', dayOfWeek: 1, period: 3, startTime: '10:30', endTime: '11:30', subjectId: 'subj-3', room: 'Lab 1', teacher: 'Prof. Rao' },
  { id: 'tt-m4', dayOfWeek: 1, period: 4, startTime: '11:30', endTime: '12:30', subjectId: 'subj-4', room: 'R-204', teacher: 'Dr. Mehta' },
  { id: 'tt-m6', dayOfWeek: 1, period: 6, startTime: '01:30', endTime: '02:30', subjectId: 'subj-6', room: 'Lab 3', teacher: 'Dr. Gupta' },
  { id: 'tt-m7', dayOfWeek: 1, period: 7, startTime: '02:30', endTime: '03:30', subjectId: 'subj-7', room: 'R-102', teacher: 'Ms. Kapoor' },

  // Tuesday (2)
  { id: 'tt-t1', dayOfWeek: 2, period: 1, startTime: '08:30', endTime: '09:30', subjectId: 'subj-2', room: 'LT-1', teacher: 'Dr. Verma' },
  { id: 'tt-t2', dayOfWeek: 2, period: 2, startTime: '09:30', endTime: '10:30', subjectId: 'subj-1', room: 'CL-2', teacher: 'Prof. Sharma' },
  { id: 'tt-t3', dayOfWeek: 2, period: 3, startTime: '10:30', endTime: '11:30', subjectId: 'subj-5', room: 'Audi 2', teacher: 'Prof. Singh' },
  { id: 'tt-t4', dayOfWeek: 2, period: 4, startTime: '11:30', endTime: '12:30', subjectId: 'subj-3', room: 'Lab 1', teacher: 'Prof. Rao' },
  { id: 'tt-t7', dayOfWeek: 2, period: 7, startTime: '02:30', endTime: '03:30', subjectId: 'subj-6', room: 'Lab 3', teacher: 'Dr. Gupta' },
  { id: 'tt-t8', dayOfWeek: 2, period: 8, startTime: '03:30', endTime: '04:30', subjectId: 'subj-4', room: 'R-204', teacher: 'Dr. Mehta' },

  // Wednesday (3)
  { id: 'tt-w1', dayOfWeek: 3, period: 1, startTime: '08:30', endTime: '09:30', subjectId: 'subj-3', room: 'Lab 1', teacher: 'Prof. Rao' },
  { id: 'tt-w2', dayOfWeek: 3, period: 2, startTime: '09:30', endTime: '10:30', subjectId: 'subj-4', room: 'R-204', teacher: 'Dr. Mehta' },
  { id: 'tt-w3', dayOfWeek: 3, period: 3, startTime: '10:30', endTime: '11:30', subjectId: 'subj-1', room: 'CL-2', teacher: 'Prof. Sharma' },
  { id: 'tt-w6', dayOfWeek: 3, period: 6, startTime: '01:30', endTime: '02:30', subjectId: 'subj-2', room: 'LT-1', teacher: 'Dr. Verma' },
  { id: 'tt-w7', dayOfWeek: 3, period: 7, startTime: '02:30', endTime: '03:30', subjectId: 'subj-7', room: 'R-102', teacher: 'Ms. Kapoor' },

  // Thursday (4)
  { id: 'tt-th1', dayOfWeek: 4, period: 1, startTime: '08:30', endTime: '09:30', subjectId: 'subj-6', room: 'Lab 3', teacher: 'Dr. Gupta' },
  { id: 'tt-th2', dayOfWeek: 4, period: 2, startTime: '09:30', endTime: '10:30', subjectId: 'subj-2', room: 'LT-1', teacher: 'Dr. Verma' },
  { id: 'tt-th3', dayOfWeek: 4, period: 3, startTime: '10:30', endTime: '11:30', subjectId: 'subj-1', room: 'CL-2', teacher: 'Prof. Sharma' },
  { id: 'tt-th4', dayOfWeek: 4, period: 4, startTime: '11:30', endTime: '12:30', subjectId: 'subj-5', room: 'Audi 2', teacher: 'Prof. Singh' },
  { id: 'tt-th7', dayOfWeek: 4, period: 7, startTime: '02:30', endTime: '03:30', subjectId: 'subj-3', room: 'Lab 1', teacher: 'Prof. Rao' },

  // Friday (5)
  { id: 'tt-f1', dayOfWeek: 5, period: 1, startTime: '08:30', endTime: '09:30', subjectId: 'subj-1', room: 'CL-2', teacher: 'Prof. Sharma' },
  { id: 'tt-f2', dayOfWeek: 5, period: 2, startTime: '09:30', endTime: '10:30', subjectId: 'subj-3', room: 'Lab 1', teacher: 'Prof. Rao' },
  { id: 'tt-f3', dayOfWeek: 5, period: 3, startTime: '10:30', endTime: '11:30', subjectId: 'subj-2', room: 'LT-1', teacher: 'Dr. Verma' },
  { id: 'tt-f4', dayOfWeek: 5, period: 4, startTime: '11:30', endTime: '12:30', subjectId: 'subj-6', room: 'Lab 3', teacher: 'Dr. Gupta' },
  { id: 'tt-f6', dayOfWeek: 5, period: 6, startTime: '01:30', endTime: '02:30', subjectId: 'subj-4', room: 'R-204', teacher: 'Dr. Mehta' },

  // Saturday (6)
  { id: 'tt-s1', dayOfWeek: 6, period: 1, startTime: '08:30', endTime: '09:30', subjectId: 'subj-5', room: 'Audi 2', teacher: 'Prof. Singh' },
  { id: 'tt-s2', dayOfWeek: 6, period: 2, startTime: '09:30', endTime: '10:30', subjectId: 'subj-7', room: 'R-102', teacher: 'Ms. Kapoor' },
  { id: 'tt-s3', dayOfWeek: 6, period: 3, startTime: '10:30', endTime: '11:30', subjectId: 'subj-1', room: 'CL-2', teacher: 'Prof. Sharma' },
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Submit Python Assignment 4 (NumPy & Pandas)',
    description: 'Complete data analysis on dataset and submit Jupyter notebook on portal.',
    dueDate: 'Today',
    priority: 'URGENT',
    completed: false,
    subjectId: 'subj-1',
  },
  {
    id: 'task-2',
    title: 'CSA Microarchitecture Flowchart Presentation',
    description: 'Prepare 5 slides on pipeline hazards and branch prediction.',
    dueDate: 'Tomorrow',
    priority: 'HIGH',
    completed: false,
    subjectId: 'subj-2',
  },
  {
    id: 'task-3',
    title: 'Prepare for Discrete Math Quiz',
    description: 'Revise recurrence relations, graph theory, and Boolean algebra.',
    dueDate: '2026-09-22',
    priority: 'MEDIUM',
    completed: false,
    subjectId: 'subj-3',
  },
  {
    id: 'task-4',
    title: 'Issue recommended Algorithms textbook from library',
    description: 'Return previous book and borrow CLRS copy.',
    dueDate: '2026-09-15',
    priority: 'LOW',
    completed: true,
    subjectId: 'subj-6',
  },
];

export const initialPresets: QuickExpensePreset[] = [
  { id: 'pre-1', title: 'Canteen Chai & Samosa', amount: 40, category: 'Food', icon: 'coffee' },
  { id: 'pre-2', title: 'Metro Smart Card Recharge', amount: 200, category: 'Transport', icon: 'train' },
  { id: 'pre-3', title: 'Notes Printing & Xerox', amount: 65, category: 'Books', icon: 'file-text' },
  { id: 'pre-4', title: 'Campus Lunch Thali', amount: 110, category: 'Food', icon: 'utensils' },
  { id: 'pre-5', title: 'Shared Auto Fare', amount: 30, category: 'Transport', icon: 'car' },
  { id: 'pre-6', title: 'Library Book Fine', amount: 25, category: 'College', icon: 'book' },
];

export const initialExpenses: Expense[] = [
  { id: 'exp-1', title: 'Campus Lunch & Juice', amount: 120, category: 'Food', timeOfDay: 'Afternoon', date: '2026-09-17' },
  { id: 'exp-2', title: 'Metro Card Recharge', amount: 200, category: 'Transport', timeOfDay: 'Morning', date: '2026-09-17' },
  { id: 'exp-3', title: 'Python Lab Manual Xerox', amount: 75, category: 'Books', timeOfDay: 'Evening', date: '2026-09-16' },
  { id: 'exp-4', title: 'Evening Chai & Cookies', amount: 45, category: 'Food', timeOfDay: 'Evening', date: '2026-09-16' },
  { id: 'exp-5', title: 'College Fest Registration', amount: 250, category: 'College', timeOfDay: 'Morning', date: '2026-09-15' },
  { id: 'exp-6', title: 'Stationery & Spiral Notebooks', amount: 180, category: 'Books', timeOfDay: 'Evening', date: '2026-09-14' },
  { id: 'exp-7', title: 'Hostel Night Canteen Maggi', amount: 60, category: 'Food', timeOfDay: 'Night', date: '2026-09-13' },
  // August expenses for MoM comparison
  { id: 'exp-8', title: 'Semester Books Bundle', amount: 1250, category: 'Books', timeOfDay: 'Afternoon', date: '2026-08-20' },
  { id: 'exp-9', title: 'Bus Monthly Pass', amount: 800, category: 'Transport', timeOfDay: 'Morning', date: '2026-08-10' },
  { id: 'exp-10', title: 'Mess Advance Fee', amount: 2400, category: 'Food', timeOfDay: 'Morning', date: '2026-08-05' },
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Python for Data Analysis — Pandas & NumPy Guide',
    filename: 'Python_Data_Analysis.pdf',
    docType: 'BOOK',
    subjectCode: 'PYTH',
    size: '4.8 MB',
    addedAt: '2026-09-10',
  },
  {
    id: 'doc-2',
    title: 'Computer System Architecture Lecture Notes',
    filename: 'CSA_Notes_Unit1_4.pdf',
    docType: 'NOTES',
    subjectCode: 'CSA',
    size: '2.3 MB',
    addedAt: '2026-09-12',
  },
  {
    id: 'doc-3',
    title: 'Semester 5 Official Curriculum & Lab Syllabus',
    filename: 'Syllabus_Sem5_CS.pdf',
    docType: 'SYLLABUS',
    subjectCode: 'SEC1',
    size: '1.1 MB',
    addedAt: '2026-09-02',
  },
];

export const initialHolidays: Holiday[] = [
  { id: 'hol-1', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'HOLIDAY' },
  { id: 'hol-2', name: 'Maha Navami / Dussehra', date: '2026-10-20', type: 'HOLIDAY' },
  { id: 'hol-3', name: 'Deepawali Break', date: '2026-11-09', type: 'HOLIDAY' },
  { id: 'hol-4', name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'HOLIDAY' },
  { id: 'hol-5', name: 'Inter-College Tech Hackathon (Duty Leave)', date: '2026-10-14', type: 'DUTY_LEAVE' },
];

export const initialProfile: StudentProfile = {
  appNickname: 'Colio',
  name: 'Aarav Sharma',
  rollNumber: '23BCSE042',
  course: 'B.Sc Computer Science',
  branch: 'Computer Science',
  semester: 'Semester 5',
  college: 'National Institute of Technology',
  avatarUri: '',
};
