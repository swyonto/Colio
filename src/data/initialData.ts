import { Subject, TimetableSlot, Task, Expense, QuickExpensePreset, DocumentItem, Holiday, StudentProfile } from '../types/campus';

export const initialSubjects: Subject[] = [
  {
    id: 'subj-1',
    name: 'Python Programming',
    code: 'PYTH',
    teacher: 'Dr. AD',
    room: 'AD1 / Lab 3',
    color: '#00E676',
    present: 0,
    absent: 0,
    targetPercent: 68,
  },
  {
    id: 'subj-2',
    name: 'Computer System Architecture',
    code: 'CSA',
    teacher: 'Prof. DJS / PSS',
    room: 'DJS1 / Lab 3',
    color: '#00C853',
    present: 0,
    absent: 0,
    targetPercent: 68,
  },
  {
    id: 'subj-3',
    name: 'Mathematics',
    code: 'MC',
    teacher: 'Dr. PRK',
    room: 'PRK1 / Lab 2',
    color: '#69F0AE',
    present: 0,
    absent: 0,
    targetPercent: 68,
  },
  {
    id: 'subj-4',
    name: 'General Elective 1',
    code: 'GE1',
    teacher: 'Prof. AD / MBB',
    room: 'AD1 / MBB Lab',
    color: '#00B0FF',
    present: 0,
    absent: 0,
    targetPercent: 68,
  },
  {
    id: 'subj-5',
    name: 'Value Added Course 1',
    code: 'VAC1',
    teacher: 'Prof. ITH',
    room: 'ITH / Lab',
    color: '#FFD600',
    present: 0,
    absent: 0,
    targetPercent: 68,
  },
  {
    id: 'subj-6',
    name: 'Skill Enhancement Course 1',
    code: 'SEC1',
    teacher: 'Prof. MBB',
    room: 'MBB Lab 2',
    color: '#FF9100',
    present: 0,
    absent: 0,
    targetPercent: 68,
  },
  {
    id: 'subj-7',
    name: 'Language 1',
    code: 'LANG1',
    teacher: 'Prof. BSK1 / SPD1',
    room: 'Room 101',
    color: '#00E5FF',
    present: 0,
    absent: 0,
    targetPercent: 68,
  },
];

export const initialTimetable: TimetableSlot[] = [
  // ==========================================
  // MONDAY (Day 1)
  // ==========================================
  {
    id: 'tt-m2',
    dayOfWeek: 1,
    period: 2,
    startTime: '09:30',
    endTime: '10:30',
    subjectId: 'subj-1',
    room: 'AD1',
    teacher: 'Dr. AD',
  },
  {
    id: 'tt-m3',
    dayOfWeek: 1,
    period: 3,
    startTime: '10:30',
    endTime: '11:30',
    subjectId: 'subj-5',
    room: 'LAB',
    teacher: 'Prof. ITH',
  },
  {
    id: 'tt-m4',
    dayOfWeek: 1,
    period: 4,
    startTime: '11:30',
    endTime: '12:30',
    subjectId: 'subj-5',
    room: 'LAB',
    teacher: 'Prof. ITH',
  },
  {
    id: 'tt-m5',
    dayOfWeek: 1,
    period: 5,
    startTime: '12:30',
    endTime: '01:30',
    subjectId: 'subj-3',
    room: 'PRK1',
    teacher: 'Dr. PRK',
  },

  // ==========================================
  // TUESDAY (Day 2)
  // ==========================================
  {
    id: 'tt-t1',
    dayOfWeek: 2,
    period: 1,
    startTime: '08:30',
    endTime: '09:30',
    subjectId: 'subj-2',
    room: 'Lab 3',
    teacher: 'Prof. DJS',
  },
  {
    id: 'tt-t2',
    dayOfWeek: 2,
    period: 2,
    startTime: '09:30',
    endTime: '10:30',
    subjectId: 'subj-3',
    room: 'Lab 3',
    teacher: 'PRK / AD / DJS',
  },
  {
    id: 'tt-t3',
    dayOfWeek: 2,
    period: 3,
    startTime: '10:30',
    endTime: '11:30',
    subjectId: 'subj-3',
    room: 'Lab 3',
    teacher: 'PRK / AD / DJS',
  },
  {
    id: 'tt-t4',
    dayOfWeek: 2,
    period: 4,
    startTime: '11:30',
    endTime: '12:30',
    subjectId: 'subj-1',
    room: 'AD1',
    teacher: 'Dr. AD',
  },
  {
    id: 'tt-t5',
    dayOfWeek: 2,
    period: 5,
    startTime: '12:30',
    endTime: '01:30',
    subjectId: 'subj-1',
    room: 'AD1',
    teacher: 'Dr. AD',
  },
  {
    id: 'tt-t7',
    dayOfWeek: 2,
    period: 7,
    startTime: '02:30',
    endTime: '03:30',
    subjectId: 'subj-5',
    room: 'ITH',
    teacher: 'Prof. ITH',
  },
  {
    id: 'tt-t8',
    dayOfWeek: 2,
    period: 8,
    startTime: '03:30',
    endTime: '04:30',
    subjectId: 'subj-7',
    room: 'Room 101',
    teacher: 'Prof. BSK1 / SPD1',
  },
  {
    id: 'tt-t9',
    dayOfWeek: 2,
    period: 9,
    startTime: '04:30',
    endTime: '05:30',
    subjectId: 'subj-7',
    room: 'Room 101',
    teacher: 'Prof. BSK1 / SPD1',
  },

  // ==========================================
  // WEDNESDAY (Day 3)
  // ==========================================
  {
    id: 'tt-w1',
    dayOfWeek: 3,
    period: 1,
    startTime: '08:30',
    endTime: '09:30',
    subjectId: 'subj-3',
    room: 'Lab 2',
    teacher: 'Dr. PRK',
  },
  {
    id: 'tt-w2',
    dayOfWeek: 3,
    period: 2,
    startTime: '09:30',
    endTime: '10:30',
    subjectId: 'subj-3',
    room: 'Lab 2',
    teacher: 'PRK / AD',
  },
  {
    id: 'tt-w3',
    dayOfWeek: 3,
    period: 3,
    startTime: '10:30',
    endTime: '11:30',
    subjectId: 'subj-1',
    room: 'Lab 2',
    teacher: 'Dr. AD',
  },
  {
    id: 'tt-w6',
    dayOfWeek: 3,
    period: 6,
    startTime: '01:30',
    endTime: '02:30',
    subjectId: 'subj-6',
    room: 'MBB Lab 2',
    teacher: 'Prof. MBB',
  },
  {
    id: 'tt-w7',
    dayOfWeek: 3,
    period: 7,
    startTime: '02:30',
    endTime: '03:30',
    subjectId: 'subj-6',
    room: 'MBB Lab 2',
    teacher: 'Prof. MBB',
  },
  {
    id: 'tt-w8',
    dayOfWeek: 3,
    period: 8,
    startTime: '03:30',
    endTime: '04:30',
    subjectId: 'subj-6',
    room: 'MBB Lab 2',
    teacher: 'Prof. MBB',
  },
  {
    id: 'tt-w9',
    dayOfWeek: 3,
    period: 9,
    startTime: '04:30',
    endTime: '05:30',
    subjectId: 'subj-6',
    room: 'MBB Lab 2',
    teacher: 'Prof. MBB',
  },

  // ==========================================
  // THURSDAY (Day 4)
  // ==========================================
  {
    id: 'tt-th1',
    dayOfWeek: 4,
    period: 1,
    startTime: '08:30',
    endTime: '09:30',
    subjectId: 'subj-4',
    room: 'MBB Lab',
    teacher: 'Prof. AD / MBB',
  },
  {
    id: 'tt-th2',
    dayOfWeek: 4,
    period: 2,
    startTime: '09:30',
    endTime: '10:30',
    subjectId: 'subj-4',
    room: 'MBB Lab',
    teacher: 'Prof. AD / MBB',
  },
  {
    id: 'tt-th3',
    dayOfWeek: 4,
    period: 3,
    startTime: '10:30',
    endTime: '11:30',
    subjectId: 'subj-4',
    room: 'AD1',
    teacher: 'Prof. AD',
  },
  {
    id: 'tt-th4',
    dayOfWeek: 4,
    period: 4,
    startTime: '11:30',
    endTime: '12:30',
    subjectId: 'subj-4',
    room: 'AD1',
    teacher: 'Prof. AD',
  },
  {
    id: 'tt-th5',
    dayOfWeek: 4,
    period: 5,
    startTime: '12:30',
    endTime: '01:30',
    subjectId: 'subj-2',
    room: 'DJS1',
    teacher: 'Prof. DJS',
  },

  // ==========================================
  // FRIDAY (Day 5)
  // ==========================================
  {
    id: 'tt-f2',
    dayOfWeek: 5,
    period: 2,
    startTime: '09:30',
    endTime: '10:30',
    subjectId: 'subj-2',
    room: 'Lab 3',
    teacher: 'Prof. PSS',
  },
  {
    id: 'tt-f3',
    dayOfWeek: 5,
    period: 3,
    startTime: '10:30',
    endTime: '11:30',
    subjectId: 'subj-2',
    room: 'Lab 3',
    teacher: 'Prof. PSS',
  },
  {
    id: 'tt-f4',
    dayOfWeek: 5,
    period: 4,
    startTime: '11:30',
    endTime: '12:30',
    subjectId: 'subj-1',
    room: 'Lab 3',
    teacher: 'Dr. AD',
  },
  {
    id: 'tt-f5',
    dayOfWeek: 5,
    period: 5,
    startTime: '12:30',
    endTime: '01:30',
    subjectId: 'subj-1',
    room: 'Lab 3',
    teacher: 'Dr. AD',
  },
  {
    id: 'tt-f6',
    dayOfWeek: 5,
    period: 6,
    startTime: '01:30',
    endTime: '02:30',
    subjectId: 'subj-4',
    room: 'AD1',
    teacher: 'Prof. AD',
  },

  // ==========================================
  // SATURDAY (Day 6)
  // ==========================================
  {
    id: 'tt-s1',
    dayOfWeek: 6,
    period: 1,
    startTime: '08:30',
    endTime: '09:30',
    subjectId: 'subj-7',
    room: 'Room 101',
    teacher: 'Prof. BSK1 / SPD1',
  },
  {
    id: 'tt-s2',
    dayOfWeek: 6,
    period: 2,
    startTime: '09:30',
    endTime: '10:30',
    subjectId: 'subj-7',
    room: 'Room 101',
    teacher: 'Prof. BSK1 / SPD1',
  },
  {
    id: 'tt-s3',
    dayOfWeek: 6,
    period: 3,
    startTime: '10:30',
    endTime: '11:30',
    subjectId: 'subj-3',
    room: 'PRK1',
    teacher: 'Dr. PRK',
  },
  {
    id: 'tt-s4',
    dayOfWeek: 6,
    period: 4,
    startTime: '11:30',
    endTime: '12:30',
    subjectId: 'subj-3',
    room: 'PRK1',
    teacher: 'Dr. PRK',
  },
];

export const initialTasks: Task[] = [];

export const initialExpenses: Expense[] = [];

export const initialPresets: QuickExpensePreset[] = [
  { id: 'pre-1', title: 'Chai & Snacks', amount: 30, category: 'Food', icon: 'coffee' },
  { id: 'pre-2', title: 'Canteen Lunch', amount: 90, category: 'Food', icon: 'coffee' },
  { id: 'pre-3', title: 'Auto / Metro', amount: 50, category: 'Transport', icon: 'navigation' },
  { id: 'pre-4', title: 'Xerox & Prints', amount: 20, category: 'College', icon: 'tag' },
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Python for Data Science & Computing - Official Textbook',
    filename: 'Python_Programming_Guide.pdf',
    docType: 'BOOK',
    subjectCode: 'PYTH',
    size: '3.4 MB',
    addedAt: '2026-09-01',
    content: `# Python for Data Science & Computing
## Chapter 1: Introduction to Python Architecture
Python is a dynamically-typed, interpreted language renowned for data science and systems engineering.

### Key Concepts:
- Bytecode Compilation: Python compiles source code (.py) into bytecode (.pyc) executed on PVM.
- Data Types: int, float, str, list, tuple, dict, and set.
- Vectorized Operations with NumPy: Ndarrays enable parallelized computations without Python loop overhead.

\`\`\`python
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print("Mean:", arr.mean())
\`\`\`

## Chapter 2: Control Flow & Memory Management
- Conditional Statements: if, elif, else
- Reference Counting & Garbage Collection (Cyclic GC)`,
  },
  {
    id: 'doc-2',
    title: 'Computer System Architecture (CSA) Lecture Notes Unit 1 & 2',
    filename: 'CSA_Lecture_Notes_Unit1_2.pdf',
    docType: 'NOTES',
    subjectCode: 'CSA',
    size: '2.1 MB',
    addedAt: '2026-09-05',
    content: `# Computer System Architecture (CSA)
## Section: Section - I (2026 - 27)

### 1. Register Transfer & Microoperations
- Register Transfer Language (RTL) notation: R2 <- R1.
- Bus and Memory Transfers: Tri-state bus buffers and multiplexer-based common buses.
- Arithmetic Microoperations: Binary adder, adder-subtractor, and arithmetic logic shift unit (ALSU).

### 2. Basic Computer Organization & Design
- Instruction Codes: Opcode, addressing modes (Direct vs Indirect).
- Computer Registers: DR (Data Register), AR (Address Register), AC (Accumulator), IR (Instruction Register), PC (Program Counter).
- Timing and Control: Hardwired vs Microprogrammed control units.`,
  },
  {
    id: 'doc-3',
    title: 'First Year Section-I Class Timetable & Academic Regulations (2026-27)',
    filename: 'CS_FirstYear_SectionI_Timetable.pdf',
    docType: 'SYLLABUS',
    subjectCode: 'PYTH',
    size: '1.2 MB',
    addedAt: '2026-09-01',
    content: `# Department of Computer Science
## First Year Section - I Class Timetable (2026 - 27)
"Learn | Build | Grow — A Better Tomorrow"

### Weekly Schedule Matrix:
- Monday: PYTH (AD1), VAC1 Lab, MC (PRK1)
- Tuesday: CSA (Lab 3), MC/PYTH/CSA Lab, PYTH (AD1), VAC1 (ITH), LANG1 (BSK1/SPD1)
- Wednesday: MC Lab (Lab 2), PYTH Lab (Lab 2), SEC1 Lab (MBB Lab 2)
- Thursday: GE1 Lab (MBB Lab), GE1 Theory (AD1), CSA (DJS1)
- Friday: CSA Lab (Lab 3), PYTH Lab (Lab 3), GE1 Theory (AD1)
- Saturday: LANG1 (Room 101), MC (PRK1)

### Attendance Requirement:
- Minimum mandatory attendance is 68% for end-semester examination eligibility.`,
  },
];

export const initialHolidays: Holiday[] = [
  { id: 'hol-1', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'HOLIDAY' },
  { id: 'hol-2', name: 'Maha Navami / Dussehra', date: '2026-10-20', type: 'HOLIDAY' },
  { id: 'hol-3', name: 'Deepawali Break', date: '2026-11-09', type: 'HOLIDAY' },
  { id: 'hol-4', name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'HOLIDAY' },
  { id: 'hol-5', name: 'Department Hackathon (Duty Leave)', date: '2026-10-14', type: 'DUTY_LEAVE' },
];

export const initialProfile: StudentProfile = {
  appNickname: 'Colio',
  name: 'First Year Student',
  rollNumber: '2026CS-I-042',
  course: 'Computer Science (Section I)',
  branch: 'Computer Science',
  semester: 'Semester 1',
  college: 'Department of Computer Science',
  avatarUri: '',
  avatarSize: 'medium',
  avatarPreset: 0,
  isSetupComplete: true,
};
