import { TimetableSlot, Subject } from '../types/campus';

export interface ParseTimetableResult {
  slots: TimetableSlot[];
  newSubjects: Subject[];
  totalParsed: number;
  errors: string[];
}

const PALETTE = [
  '#00E676', '#00E5FF', '#FF4081', '#FFD600',
  '#E040FB', '#38BDF8', '#FF9100', '#69F0AE',
  '#A78BFA', '#F472B6', '#34D399', '#FBBF24',
];

const DAY_MAP: Record<string, number> = {
  '1': 1, 'mon': 1, 'monday': 1,
  '2': 2, 'tue': 2, 'tues': 2, 'tuesday': 2,
  '3': 3, 'wed': 3, 'wednesday': 3,
  '4': 4, 'thu': 4, 'thur': 4, 'thurs': 4, 'thursday': 4,
  '5': 5, 'fri': 5, 'friday': 5,
  '6': 6, 'sat': 6, 'saturday': 6,
};

/**
 * Standard CSV sample string for users to copy or export
 */
export const SAMPLE_TIMETABLE_CSV = `Day,Period,StartTime,EndTime,Subject,Code,Room,Teacher
Monday,1,08:30,09:30,Python Programming,PYTH,Lab 3,Dr. Sharma
Monday,2,09:30,10:30,Computer Architecture,CSA,Room 201,Prof. Verma
Monday,3,10:30,11:30,Math Computing,MC,Room 104,Dr. Rao
Tuesday,1,08:30,09:30,Python Programming,PYTH,Lab 3,Dr. Sharma
Tuesday,2,09:30,10:30,Value Addition,VAC1,Room 302,Faculty
Wednesday,1,08:30,09:30,Skill Enhancement,SEC1,Lab 1,Prof. Singh
Wednesday,2,09:30,10:30,Generic Elective,GE1,Room 205,Dr. Kapoor
Thursday,1,08:30,09:30,Language & Comm,LANG1,Room 102,Prof. Iyer
Friday,1,08:30,09:30,Computer Architecture,CSA,Room 201,Prof. Verma
Friday,2,09:30,10:30,Math Computing,MC,Room 104,Dr. Rao
Saturday,1,08:30,09:30,Python Lab,PYTH,Lab 3,Dr. Sharma`;

/**
 * Parses raw CSV text (from Excel/Google Sheets export) into TimetableSlot objects.
 */
export function parseTimetableCsv(
  csvText: string,
  existingSubjects: Subject[] = []
): ParseTimetableResult {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const slots: TimetableSlot[] = [];
  const createdSubjects: Map<string, Subject> = new Map();
  const errors: string[] = [];

  if (lines.length < 2) {
    return {
      slots: [],
      newSubjects: [],
      totalParsed: 0,
      errors: ['The CSV file is empty or does not contain data rows.'],
    };
  }

  // Auto-detect delimiter (comma, semicolon, or tab)
  const delimiter = detectDelimiter(lines[0]);

  // Parse header line
  const headerTokens = parseCsvLine(lines[0].toLowerCase(), delimiter);
  const colIndex = {
    day: headerTokens.findIndex((h) => h.includes('day')),
    period: headerTokens.findIndex((h) => h.includes('period') || h.includes('slot') || h.includes('hour')),
    startTime: headerTokens.findIndex((h) => h.includes('start') || h.includes('from')),
    endTime: headerTokens.findIndex((h) => h.includes('end') || h.includes('to')),
    subject: headerTokens.findIndex((h) => h.includes('subject') || h.includes('course') || h.includes('name')),
    code: headerTokens.findIndex((h) => h.includes('code') || h.includes('abbr')),
    room: headerTokens.findIndex((h) => h.includes('room') || h.includes('hall') || h.includes('lab') || h.includes('venue')),
    teacher: headerTokens.findIndex((h) => h.includes('teacher') || h.includes('faculty') || h.includes('prof') || h.includes('instructor')),
  };

  // If standard columns aren't detected in header, fallback to positional order
  // [0: Day, 1: Period, 2: Start, 3: End, 4: Subject, 5: Code, 6: Room, 7: Teacher]
  const dayIdx = colIndex.day >= 0 ? colIndex.day : 0;
  const periodIdx = colIndex.period >= 0 ? colIndex.period : 1;
  const startIdx = colIndex.startTime >= 0 ? colIndex.startTime : 2;
  const endIdx = colIndex.endTime >= 0 ? colIndex.endTime : 3;
  const subjectIdx = colIndex.subject >= 0 ? colIndex.subject : 4;
  const codeIdx = colIndex.code >= 0 ? colIndex.code : (subjectIdx + 1);
  const roomIdx = colIndex.room >= 0 ? colIndex.room : (codeIdx + 1);
  const teacherIdx = colIndex.teacher >= 0 ? colIndex.teacher : (roomIdx + 1);

  // Helper to find or register a Subject
  const getOrCreateSubject = (subjName: string, subjCode: string, room: string, teacher: string): string => {
    const cleanName = subjName.trim() || 'General Lecture';
    const cleanCode = (subjCode.trim() || cleanName.slice(0, 4)).toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Check existing subjects by code or name
    const existing = existingSubjects.find(
      (s) => s.code.toUpperCase() === cleanCode || s.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) return existing.id;

    // Check newly created map
    if (createdSubjects.has(cleanCode)) {
      return createdSubjects.get(cleanCode)!.id;
    }

    // Create a new subject with a distinct color from palette
    const colorIndex = (existingSubjects.length + createdSubjects.size) % PALETTE.length;
    const newId = `sub-${cleanCode.toLowerCase()}-${Date.now().toString(36)}`;
    const newSubject: Subject = {
      id: newId,
      name: cleanName,
      code: cleanCode,
      teacher: teacher.trim() || 'Faculty',
      room: room.trim() || 'Room TBA',
      color: PALETTE[colorIndex],
      present: 0,
      absent: 0,
      targetPercent: 68,
    };
    createdSubjects.set(cleanCode, newSubject);
    return newId;
  };

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine || rawLine.startsWith('#')) continue;

    const row = parseCsvLine(rawLine, delimiter);
    if (row.length < 2) continue;

    const rawDay = (row[dayIdx] || '').toLowerCase().trim();
    const dayOfWeek = DAY_MAP[rawDay];
    if (!dayOfWeek) {
      errors.push(`Row ${i + 1}: Unrecognized day '${row[dayIdx]}'. Use Monday-Saturday.`);
      continue;
    }

    const rawPeriod = parseInt(row[periodIdx] || '', 10);
    const period = !isNaN(rawPeriod) && rawPeriod >= 1 && rawPeriod <= 9 ? rawPeriod : (slots.filter(s => s.dayOfWeek === dayOfWeek).length + 1);

    const startTime = normalizeTime(row[startIdx] || '09:00');
    const endTime = normalizeTime(row[endIdx] || '10:00');
    const subjName = row[subjectIdx] || `Period ${period}`;
    const subjCode = row[codeIdx] || subjName.slice(0, 4);
    const room = row[roomIdx] || 'TBA';
    const teacher = row[teacherIdx] || 'Faculty';

    const subjectId = getOrCreateSubject(subjName, subjCode, room, teacher);

    slots.push({
      id: `slot-csv-${dayOfWeek}-${period}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dayOfWeek,
      period,
      startTime,
      endTime,
      subjectId,
      room,
      teacher,
    });
  }

  // Sort slots by dayOfWeek and period
  slots.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.period - b.period;
  });

  return {
    slots,
    newSubjects: Array.from(createdSubjects.values()),
    totalParsed: slots.length,
    errors,
  };
}

/**
 * Detects whether CSV uses comma, semicolon, or tab as separator
 */
function detectDelimiter(line: string): string {
  const commas = (line.match(/,/g) || []).length;
  const semicolons = (line.match(/;/g) || []).length;
  const tabs = (line.match(/\t/g) || []).length;
  if (semicolons > commas && semicolons > tabs) return ';';
  if (tabs > commas && tabs > semicolons) return '\t';
  return ',';
}

/**
 * Basic CSV tokenizer that respects quoted strings and custom delimiter
 */
function parseCsvLine(line: string, delimiter = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

/**
 * Normalizes user time strings (e.g. "8:30 AM", "8:30", "08:30", "14:00") into HH:MM
 */
function normalizeTime(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '09:00';

  // 12-hour format with AM/PM
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = (match12[3] || '').toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  return trimmed;
}
