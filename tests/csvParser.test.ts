import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseTimetableCsv, SAMPLE_TIMETABLE_CSV } from '../src/utils/csvTimetableParser';
import { Subject } from '../src/types/campus';

describe('CSV Timetable Parser & Excel Import Engine', () => {
  const mockExistingSubjects: Subject[] = [
    {
      id: 'sub-existing-cs101',
      name: 'Computer Science 101',
      code: 'CS101',
      teacher: 'Dr. Alan',
      room: 'Room 101',
      color: '#00E676',
      present: 10,
      absent: 2,
      targetPercent: 75,
    },
  ];

  test('should parse sample timetable CSV template correctly', () => {
    const result = parseTimetableCsv(SAMPLE_TIMETABLE_CSV, mockExistingSubjects);
    assert.strictEqual(result.errors.length, 0);
    assert.strictEqual(result.slots.length, 11);
    assert.ok(result.newSubjects.length > 0);

    const firstSlot = result.slots[0];
    assert.strictEqual(firstSlot.dayOfWeek, 1); // Monday
    assert.strictEqual(firstSlot.period, 1);
    assert.strictEqual(firstSlot.startTime, '08:30');
    assert.strictEqual(firstSlot.endTime, '09:30');
    assert.strictEqual(firstSlot.room, 'Lab 3');
    assert.strictEqual(firstSlot.teacher, 'Dr. Sharma');
  });

  test('should match existing subjects without creating duplicate records', () => {
    const csv = `Day,Period,StartTime,EndTime,Subject,Code,Room,Teacher
Monday,1,08:30,09:30,Computer Science 101,CS101,Room 101,Dr. Alan`;

    const result = parseTimetableCsv(csv, mockExistingSubjects);
    assert.strictEqual(result.slots.length, 1);
    assert.strictEqual(result.slots[0].subjectId, 'sub-existing-cs101');
    assert.strictEqual(result.newSubjects.length, 0);
  });

  test('should auto-create new Subject with color if subject is not found', () => {
    const csv = `Day,Period,StartTime,EndTime,Subject,Code,Room,Teacher
Tuesday,2,10:00,11:00,Machine Learning,ML202,Lab 5,Prof. Turing`;

    const result = parseTimetableCsv(csv, mockExistingSubjects);
    assert.strictEqual(result.slots.length, 1);
    assert.strictEqual(result.newSubjects.length, 1);
    assert.strictEqual(result.newSubjects[0].name, 'Machine Learning');
    assert.strictEqual(result.newSubjects[0].code, 'ML202');
    assert.strictEqual(result.newSubjects[0].teacher, 'Prof. Turing');
    assert.strictEqual(result.newSubjects[0].room, 'Lab 5');
    assert.ok(result.newSubjects[0].color.startsWith('#'));
  });

  test('should support European semicolon-delimited CSV from Excel', () => {
    const csv = `Day;Period;StartTime;EndTime;Subject;Code;Room;Teacher
Wednesday;1;09:00;10:00;Web Engineering;WEB;Lab 2;Dr. Berners-Lee`;

    const result = parseTimetableCsv(csv, mockExistingSubjects);
    assert.strictEqual(result.slots.length, 1);
    assert.strictEqual(result.slots[0].dayOfWeek, 3);
    assert.strictEqual(result.slots[0].startTime, '09:00');
    assert.strictEqual(result.slots[0].endTime, '10:00');
    assert.strictEqual(result.slots[0].room, 'Lab 2');
  });

  test('should support 12-hour AM/PM time format and normalize to 24h HH:MM', () => {
    const csv = `Day,Period,StartTime,EndTime,Subject,Code,Room,Teacher
Friday,3,2:30 PM,3:30 PM,Digital Ethics,ETHIC,Room 401,Prof. Smith`;

    const result = parseTimetableCsv(csv, mockExistingSubjects);
    assert.strictEqual(result.slots.length, 1);
    assert.strictEqual(result.slots[0].startTime, '14:30');
    assert.strictEqual(result.slots[0].endTime, '15:30');
  });

  test('should handle quoted fields containing commas', () => {
    const csv = `Day,Period,StartTime,EndTime,Subject,Code,Room,Teacher
Thursday,1,08:30,09:30,"Signals, Systems & Controls",SSC,"Building B, Lab 4",Dr. Fourier`;

    const result = parseTimetableCsv(csv, mockExistingSubjects);
    assert.strictEqual(result.slots.length, 1);
    assert.strictEqual(result.slots[0].room, 'Building B, Lab 4');
    assert.strictEqual(result.newSubjects[0].name, 'Signals, Systems & Controls');
  });

  test('should return clear warning if day name is unrecognized', () => {
    const csv = `Day,Period,StartTime,EndTime,Subject,Code,Room,Teacher
Funday,1,08:30,09:30,Physics,PHY,Room 1,Dr. Newton`;

    const result = parseTimetableCsv(csv, mockExistingSubjects);
    assert.strictEqual(result.slots.length, 0);
    assert.strictEqual(result.errors.length, 1);
    assert.ok(result.errors[0].includes("Unrecognized day 'Funday'"));
  });
});
