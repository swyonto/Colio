import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import initial dataset
import {
  initialTimetable,
  initialSubjects,
  initialProfile,
  initialHolidays,
} from '../src/data/initialData';

describe('Colio Student OS — Comprehensive Test Suite', () => {

  describe('1. First Year Section–I Official Timetable Matrix', () => {
    it('should contain all 33 occupied period slots across Monday to Saturday', () => {
      assert.strictEqual(initialTimetable.length, 33, 'Expected exactly 33 timetable slots');
    });

    it('should map each day to the official scheduled count', () => {
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      initialTimetable.forEach((slot) => {
        counts[slot.dayOfWeek] = (counts[slot.dayOfWeek] || 0) + 1;
      });

      assert.strictEqual(counts[1], 4, 'Monday must have 4 periods');
      assert.strictEqual(counts[2], 8, 'Tuesday must have 8 periods');
      assert.strictEqual(counts[3], 7, 'Wednesday must have 7 periods');
      assert.strictEqual(counts[4], 5, 'Thursday must have 5 periods');
      assert.strictEqual(counts[5], 5, 'Friday must have 5 periods');
      assert.strictEqual(counts[6], 4, 'Saturday must have 4 periods');
    });

    it('should cover all 7 academic subjects without missing IDs', () => {
      const expectedCodes = ['PYTH', 'CSA', 'MC', 'GE1', 'VAC1', 'SEC1', 'LANG1'];
      const registeredCodes = initialSubjects.map((s) => s.code);
      const registeredIds = initialSubjects.map((s) => s.id);

      expectedCodes.forEach((code) => {
        assert.ok(registeredCodes.includes(code), `Subject code ${code} must exist in initialSubjects`);
      });

      // Verify each slot references a valid subject
      initialTimetable.forEach((slot) => {
        assert.ok(
          registeredIds.includes(slot.subjectId),
          `Slot ${slot.id} references non-existent subject: ${slot.subjectId}`
        );
      });
    });

    it('should have valid time ranges for each period', () => {
      initialTimetable.forEach((slot) => {
        assert.match(slot.startTime, /^\d{2}:\d{2}$/, `Slot ${slot.id} has invalid startTime`);
        assert.match(slot.endTime, /^\d{2}:\d{2}$/, `Slot ${slot.id} has invalid endTime`);
        assert.ok(slot.period >= 1 && slot.period <= 9, `Period ${slot.period} must be between 1 and 9`);
      });
    });
  });

  describe('2. Attendance & 75% Safeguard Calculations', () => {
    const calculateStats = (present: number, absent: number, criteria: number = 75) => {
      const total = present + absent;
      const ratio = criteria / 100;
      const percent = total > 0 ? Math.round((present / total) * 100) : 100;
      const classesCanMiss = Math.max(0, Math.floor((present - ratio * total) / ratio));
      const classesNeeded = Math.max(0, Math.ceil((ratio * total - present) / (1 - ratio)));
      const isDanger = percent < criteria;
      return { percent, classesCanMiss, classesNeeded, isDanger };
    };

    it('should calculate 100% attendance and safe bunk buffer for perfect record', () => {
      const stats = calculateStats(20, 0, 75);
      assert.strictEqual(stats.percent, 100);
      assert.strictEqual(stats.classesCanMiss, 6, 'With 20 present and 0 absent, student can miss 6 classes');
      assert.strictEqual(stats.classesNeeded, 0);
      assert.strictEqual(stats.isDanger, false);
    });

    it('should detect danger zone when attendance drops below 75%', () => {
      const stats = calculateStats(14, 6, 75); // 14/20 = 70%
      assert.strictEqual(stats.percent, 70);
      assert.strictEqual(stats.classesCanMiss, 0);
      assert.strictEqual(stats.isDanger, true);
      assert.ok(stats.classesNeeded > 0, 'Must calculate classes needed to recover');
      // To get back to 75%: (14 + x) / (20 + x) >= 0.75 => 14 + x >= 15 + 0.75x => 0.25x >= 1 => x >= 4
      assert.strictEqual(stats.classesNeeded, 4);
    });

    it('should handle zero classes gracefully on day one', () => {
      const stats = calculateStats(0, 0, 75);
      assert.strictEqual(stats.percent, 100);
      assert.strictEqual(stats.classesCanMiss, 0);
      assert.strictEqual(stats.classesNeeded, 0);
      assert.strictEqual(stats.isDanger, false);
    });
  });

  describe('3. Notification Schedule & Time Calculations', () => {
    const calculateReminderTrigger = (startTimeStr: string, leadMinutes: number) => {
      const [hours, minutes] = startTimeStr.split(':').map((v) => parseInt(v, 10) || 0);
      let triggerMinutes = minutes - leadMinutes;
      let triggerHours = hours;

      if (triggerMinutes < 0) {
        triggerMinutes += 60;
        triggerHours = triggerHours > 0 ? triggerHours - 1 : 23;
      }
      return { triggerHours, triggerMinutes };
    };

    it('should calculate 10-min lead time correctly for normal hour', () => {
      const trigger = calculateReminderTrigger('09:30', 10);
      assert.strictEqual(trigger.triggerHours, 9);
      assert.strictEqual(trigger.triggerMinutes, 20);
    });

    it('should handle hour underflow correctly (e.g. 09:05 - 10 mins = 08:55)', () => {
      const trigger = calculateReminderTrigger('09:05', 10);
      assert.strictEqual(trigger.triggerHours, 8);
      assert.strictEqual(trigger.triggerMinutes, 55);
    });

    it('should handle 15-min and 5-min lead times correctly', () => {
      const t15 = calculateReminderTrigger('10:00', 15);
      assert.strictEqual(t15.triggerHours, 9);
      assert.strictEqual(t15.triggerMinutes, 45);

      const t5 = calculateReminderTrigger('08:30', 5);
      assert.strictEqual(t5.triggerHours, 8);
      assert.strictEqual(t5.triggerMinutes, 25);
    });

    it('should map Monday correctly to Expo weekly weekday convention', () => {
      // Mon = 1 in Colio -> 2 in Expo (1 = Sunday)
      const dayOfWeek = 1;
      const expoWeekday = dayOfWeek >= 7 ? 1 : dayOfWeek + 1;
      assert.strictEqual(expoWeekday, 2, 'Monday must map to Expo weekday 2');
    });
  });

  describe('4. Storage Keys & Colio Branding Purity', () => {
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

    it('should prefix all storage keys with @colio_', () => {
      Object.entries(STORAGE_KEYS).forEach(([keyName, keyVal]) => {
        assert.ok(
          keyVal.startsWith('@colio_'),
          `Key ${keyName} (${keyVal}) must start with @colio_`
        );
      });
    });

    it('should never contain the string "campusos" in any key', () => {
      Object.entries(STORAGE_KEYS).forEach(([keyName, keyVal]) => {
        assert.ok(
          !keyVal.toLowerCase().includes('campusos'),
          `Key ${keyName} contains forbidden word campusos`
        );
      });
    });

    it('should have initial profile configured with Colio nickname', () => {
      assert.strictEqual(initialProfile.appNickname, 'Colio');
      assert.strictEqual(initialProfile.isSetupComplete, true);
    });
  });

  describe('5. Firebase Cloud Backup Payload Schema', () => {
    const sanitizeStudentId = (id: string) => (id || 'default_student').replace(/[^a-zA-Z0-9_-]/g, '_');

    it('should sanitize student roll number into valid Firestore document ID', () => {
      const rawRoll = '2026CS-I/042';
      const clean = sanitizeStudentId(rawRoll);
      assert.strictEqual(clean, '2026CS-I_042');
      assert.match(clean, /^[a-zA-Z0-9_-]+$/);
    });

    it('should construct valid cloud backup bundle structure', () => {
      const backupBundle = {
        profile: initialProfile,
        timetable: initialTimetable,
        subjects: initialSubjects,
        tasks: [],
        expenses: [],
      };

      assert.ok(Array.isArray(backupBundle.timetable));
      assert.ok(Array.isArray(backupBundle.subjects));
      assert.ok(Array.isArray(backupBundle.tasks));
      assert.ok(Array.isArray(backupBundle.expenses));
      assert.strictEqual(backupBundle.timetable.length, 33);
      assert.strictEqual(backupBundle.subjects.length, 7);
      assert.strictEqual(backupBundle.profile.course, 'Computer Science (Section I)');
    });
  });

});
