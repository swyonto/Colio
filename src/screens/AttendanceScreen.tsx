import React, { useState, useEffect, useMemo } from 'react';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '../utils/storage';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { CircularProgress } from '../components/common/CircularProgress';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { ThemeColors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { Subject, MonthlySubjectEntry, MonthlyAttendanceRecord } from '../types/campus';
import { triggerHapticFeedback } from '../utils/haptics';
import { AttendanceSkeleton } from '../components/common/SkeletonLoader';
import { AttendanceAnalyticsModal } from '../components/cards/AttendanceAnalyticsModal';

const STORAGE_KEY_CANCELLED_SUBJECTS = '@colio_cancelled_attendance_subjects_v1';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function generatePastMonths(count = 12) {
  const result = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    const label = `${MONTH_NAMES[d.getMonth()]} ${yyyy}`;
    const fullLabel = `${FULL_MONTH_NAMES[d.getMonth()]} ${yyyy}`;
    result.push({ key, label, fullLabel, year: yyyy, month: d.getMonth() });
  }
  return result;
}

const DAYS = [
  { id: 'all', label: 'All Subjects', fullLabel: 'All Subjects' },
  { id: '1', label: 'Mon', fullLabel: 'Monday' },
  { id: '2', label: 'Tue', fullLabel: 'Tuesday' },
  { id: '3', label: 'Wed', fullLabel: 'Wednesday' },
  { id: '4', label: 'Thu', fullLabel: 'Thursday' },
  { id: '5', label: 'Fri', fullLabel: 'Friday' },
  { id: '6', label: 'Sat', fullLabel: 'Saturday' },
];

export const AttendanceScreen: React.FC = () => {
  const {
    subjects,
    adjustSubjectAttendance,
    setSubjectAttendance,
    overallAttendance,
    totalPresent,
    totalClasses,
    classesCanMiss,
    classesNeeded,
    attendanceCriteria = 68,
    timetable,
    currentTheme,
    monthlyAttendanceHistory,
    setMonthlyAttendanceRecord,
    deleteMonthlyAttendanceRecord,
    getMonthlyAttendanceRecord,
    currentMonthAttendance,
  } = useCampus();

  const styles = useMemo(() => makeStyles(currentTheme), [currentTheme]);

  const pastMonths = useMemo(() => generatePastMonths(12), []);
  const currentMonthKey = pastMonths[0]?.key || '2026-10';

  // Switchable top card: 'overall' | 'month'
  const [cardMode, setCardMode] = useState<'overall' | 'month'>('overall');
  const [selectedCardMonth, setSelectedCardMonth] = useState<string>(currentMonthKey);

  // Monthly Attendance History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [modalMonth, setModalMonth] = useState<string>(currentMonthKey);
  const [entryMode, setEntryMode] = useState<'quick' | 'subject'>('quick');
  const [quickHeld, setQuickHeld] = useState<string>('');
  const [quickAttended, setQuickAttended] = useState<string>('');
  const [subjectInputs, setSubjectInputs] = useState<Record<string, { held: string; attended: string }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Attendance Analytics Modal State
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);

  const totalAbsent = subjects.reduce((sum, s) => sum + s.absent, 0);

  // Month navigation in switchable card
  const currentMonthIdx = pastMonths.findIndex((m) => m.key === selectedCardMonth);
  const selectedMonthObj = pastMonths[currentMonthIdx >= 0 ? currentMonthIdx : 0];
  const activeMonthRecord = getMonthlyAttendanceRecord(selectedCardMonth);
  const isSelectedCurrent = selectedCardMonth === currentMonthKey;

  // Resolved statistics for the monthly preview card
  const monthDisplayStats = useMemo(() => {
    if (activeMonthRecord && activeMonthRecord.totalHeld > 0) {
      const held = activeMonthRecord.totalHeld;
      const attended = activeMonthRecord.totalAttended;
      const absent = Math.max(0, held - attended);
      const pct = held > 0 ? Math.round((attended / held) * 100) : 0;
      const isMet = pct >= attendanceCriteria;
      const ratio = attendanceCriteria / 100;
      const canMiss = Math.max(0, Math.floor((attended - ratio * held) / ratio));
      const needed = Math.max(0, Math.ceil((ratio * held - attended) / (1 - ratio)));
      return { held, attended, absent, pct, isMet, canMiss, needed, hasData: true };
    }
    if (isSelectedCurrent) {
      // Current month defaults directly to active live subject attendance
      return {
        held: totalClasses,
        attended: totalPresent,
        absent: totalAbsent,
        pct: overallAttendance,
        isMet: overallAttendance >= attendanceCriteria,
        canMiss: classesCanMiss,
        needed: classesNeeded,
        hasData: true,
      };
    }
    return {
      held: 0,
      attended: 0,
      absent: 0,
      pct: 0,
      isMet: false,
      canMiss: 0,
      needed: 0,
      hasData: false,
    };
  }, [activeMonthRecord, isSelectedCurrent, totalClasses, totalPresent, totalAbsent, overallAttendance, attendanceCriteria, classesCanMiss, classesNeeded]);

  // Analytics comparison data (Current vs Previous month)
  const currentMonthObj = pastMonths[0] || { key: '2026-10', label: 'Oct 2026', fullLabel: 'October 2026' };
  const previousMonthObj = pastMonths[1] || { key: '2026-09', label: 'Sep 2026', fullLabel: 'September 2026' };

  const currentRecord = getMonthlyAttendanceRecord(currentMonthObj.key);
  const prevRecord = getMonthlyAttendanceRecord(previousMonthObj.key);

  const currentMonthPct = currentRecord && currentRecord.totalHeld > 0
    ? Math.round((currentRecord.totalAttended / currentRecord.totalHeld) * 100)
    : overallAttendance;
  const currentMonthHeld = currentRecord && currentRecord.totalHeld > 0 ? currentRecord.totalHeld : totalClasses;
  const currentMonthAttended = currentRecord && currentRecord.totalHeld > 0 ? currentRecord.totalAttended : totalPresent;

  const previousMonthPct = prevRecord && prevRecord.totalHeld > 0
    ? Math.round((prevRecord.totalAttended / prevRecord.totalHeld) * 100)
    : 75;
  const previousMonthHeld = prevRecord ? prevRecord.totalHeld : 48;
  const previousMonthAttended = prevRecord ? prevRecord.totalAttended : 36;

  const cycleCardMonth = (delta: number) => {
    triggerHapticFeedback('selection');
    const newIdx = currentMonthIdx + delta;
    if (newIdx >= 0 && newIdx < pastMonths.length) {
      setSelectedCardMonth(pastMonths[newIdx].key);
    }
  };

  // Open modal and pre-load data
  const openHistoryModal = (targetMonth?: string) => {
    triggerHapticFeedback('medium');
    const monthToLoad = targetMonth || selectedCardMonth || currentMonthKey;
    setModalMonth(monthToLoad);
    const existing = getMonthlyAttendanceRecord(monthToLoad);
    if (existing) {
      setQuickHeld(existing.totalHeld.toString());
      setQuickAttended(existing.totalAttended.toString());
      const inputs: Record<string, { held: string; attended: string }> = {};
      existing.subjectEntries.forEach((entry) => {
        inputs[entry.subjectId] = {
          held: entry.held.toString(),
          attended: entry.attended.toString(),
        };
      });
      subjects.forEach((subj) => {
        if (!inputs[subj.id]) inputs[subj.id] = { held: '0', attended: '0' };
      });
      setSubjectInputs(inputs);
      setEntryMode(existing.isDistributed ? 'quick' : 'subject');
    } else {
      setQuickHeld('');
      setQuickAttended('');
      const inputs: Record<string, { held: string; attended: string }> = {};
      subjects.forEach((subj) => {
        inputs[subj.id] = { held: '', attended: '' };
      });
      setSubjectInputs(inputs);
      setEntryMode('quick');
    }
    setShowHistoryModal(true);
  };

  const selectModalMonth = (mKey: string) => {
    triggerHapticFeedback('selection');
    setModalMonth(mKey);
    const existing = getMonthlyAttendanceRecord(mKey);
    if (existing) {
      setQuickHeld(existing.totalHeld.toString());
      setQuickAttended(existing.totalAttended.toString());
      const inputs: Record<string, { held: string; attended: string }> = {};
      existing.subjectEntries.forEach((entry) => {
        inputs[entry.subjectId] = {
          held: entry.held.toString(),
          attended: entry.attended.toString(),
        };
      });
      subjects.forEach((subj) => {
        if (!inputs[subj.id]) inputs[subj.id] = { held: '0', attended: '0' };
      });
      setSubjectInputs(inputs);
      setEntryMode(existing.isDistributed ? 'quick' : 'subject');
    } else {
      setQuickHeld('');
      setQuickAttended('');
      const inputs: Record<string, { held: string; attended: string }> = {};
      subjects.forEach((subj) => {
        inputs[subj.id] = { held: '', attended: '' };
      });
      setSubjectInputs(inputs);
    }
  };

  // Quick mode distribution preview
  const quickPreviewDistribution = useMemo(() => {
    const h = parseInt(quickHeld, 10) || 0;
    const a = Math.min(parseInt(quickAttended, 10) || 0, h);
    const count = subjects.length;
    if (count === 0 || h === 0) return [];
    const baseHeld = Math.floor(h / count);
    const remHeld = h % count;
    const baseAtt = Math.floor(a / count);
    const remAtt = a % count;

    return subjects.map((subj, idx) => {
      const held = idx < remHeld ? baseHeld + 1 : baseHeld;
      const attended = Math.min(idx < remAtt ? baseAtt + 1 : baseAtt, held);
      const pct = held > 0 ? Math.round((attended / held) * 100) : 0;
      return {
        subject: subj,
        held,
        attended,
        pct,
      };
    });
  }, [quickHeld, quickAttended, subjects]);

  const handleSaveMonthAttendance = () => {
    let entries: MonthlySubjectEntry[] = [];
    let totalH = 0;
    let totalA = 0;
    let isDist = false;

    if (entryMode === 'quick') {
      totalH = parseInt(quickHeld, 10) || 0;
      totalA = Math.min(parseInt(quickAttended, 10) || 0, totalH);
      if (totalH <= 0) {
        setToastMessage('Please enter total classes held (> 0).');
        setTimeout(() => setToastMessage(null), 2500);
        return;
      }
      isDist = true;
      const count = subjects.length;
      const baseHeld = Math.floor(totalH / count);
      const remHeld = totalH % count;
      const baseAtt = Math.floor(totalA / count);
      const remAtt = totalA % count;
      entries = subjects.map((subj, idx) => {
        const held = idx < remHeld ? baseHeld + 1 : baseHeld;
        const attended = Math.min(idx < remAtt ? baseAtt + 1 : baseAtt, held);
        return {
          subjectId: subj.id,
          held,
          attended,
        };
      });
    } else {
      entries = subjects.map((subj) => {
        const h = parseInt(subjectInputs[subj.id]?.held, 10) || 0;
        const a = Math.min(parseInt(subjectInputs[subj.id]?.attended, 10) || 0, h);
        totalH += h;
        totalA += a;
        return {
          subjectId: subj.id,
          held: h,
          attended: a,
        };
      });
      if (totalH <= 0) {
        setToastMessage('Please enter classes held for at least one subject.');
        setTimeout(() => setToastMessage(null), 2500);
        return;
      }
    }

    const record: MonthlyAttendanceRecord = {
      month: modalMonth,
      totalHeld: totalH,
      totalAttended: totalA,
      subjectEntries: entries,
      isDistributed: isDist,
    };

    setMonthlyAttendanceRecord(record);
    setSelectedCardMonth(modalMonth);
    setCardMode('month');
    triggerHapticFeedback('success');
    setToastMessage(`✓ Saved ${pastMonths.find((m) => m.key === modalMonth)?.label || modalMonth} attendance!`);
    setTimeout(() => {
      setShowHistoryModal(false);
      setToastMessage(null);
    }, 1200);
  };

  const handleDeleteMonthAttendance = () => {
    deleteMonthlyAttendanceRecord(modalMonth);
    triggerHapticFeedback('warning');
    setToastMessage(`Removed ${pastMonths.find((m) => m.key === modalMonth)?.label || modalMonth} record.`);
    setTimeout(() => {
      setShowHistoryModal(false);
      setToastMessage(null);
    }, 1000);
  };

  // Auto detect current day: 1 = Mon, ..., 6 = Sat. If Sunday (0), fallback to Mon '1'
  const currentDayIndex = new Date().getDay();
  const initialDayTab = currentDayIndex >= 1 && currentDayIndex <= 6 ? String(currentDayIndex) : '1';

  const [selectedDayTab, setSelectedDayTab] = useState<string>(initialDayTab);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editPresentInput, setEditPresentInput] = useState('');
  const [editAbsentInput, setEditAbsentInput] = useState('');
  const [cancelledSubjectIds, setCancelledSubjectIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_CANCELLED_SUBJECTS).then((val) => {
      if (val) {
        try {
          setCancelledSubjectIds(JSON.parse(val));
        } catch {}
      }
    });
  }, []);

  const toggleCancelSubject = (subjId: string) => {
    triggerHapticFeedback('medium');
    setCancelledSubjectIds((prev) => {
      const updated = prev.includes(subjId) ? prev.filter((id) => id !== subjId) : [...prev, subjId];
      AsyncStorage.setItem(STORAGE_KEY_CANCELLED_SUBJECTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const isCriteriaMet = overallAttendance >= attendanceCriteria;
  const activeDay = DAYS.find((d) => d.id === selectedDayTab);
  const isTodaySelected = selectedDayTab === String(currentDayIndex);

  // Filter subjects based on day tab dynamically from timetable
  const getFilteredSubjects = () => {
    if (selectedDayTab === 'all') return subjects;
    const dayNum = parseInt(selectedDayTab, 10);
    const daySubjectIds = new Set(
      timetable.filter((slot) => slot.dayOfWeek === dayNum).map((slot) => slot.subjectId)
    );
    return subjects.filter((s) => daySubjectIds.has(s.id));
  };

  const filteredSubjects = getFilteredSubjects();

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setEditPresentInput(subject.present.toString());
    setEditAbsentInput(subject.absent.toString());
  };

  const handleSaveEdit = () => {
    if (!editingSubject) return;
    const p = parseInt(editPresentInput, 10);
    const a = parseInt(editAbsentInput, 10);
    if (!isNaN(p) && !isNaN(a)) {
      setSubjectAttendance(editingSubject.id, p, a);
    }
    setEditingSubject(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Day Selector Tabs with auto-detected day active */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {DAYS.map((tab) => {
            const isSelected = selectedDayTab === tab.id;
            const isToday = tab.id === String(currentDayIndex);
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.dayTabPill,
                  {
                    backgroundColor: currentTheme.bgCardSecondary,
                    borderColor: currentTheme.borderGlass,
                  },
                  isSelected && {
                    backgroundColor: currentTheme.primary + '20',
                    borderColor: currentTheme.primary,
                  },
                  isToday && !isSelected && {
                    borderColor: currentTheme.primary + '40',
                  },
                ]}
                onPress={() => setSelectedDayTab(tab.id)}
              >
                <View style={styles.dayTabInnerRow}>
                  <Text
                    style={[
                      styles.dayTabText,
                      { color: isSelected ? currentTheme.primary : currentTheme.textMuted },
                      isSelected && styles.dayTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isToday && (
                    <View style={[styles.tabTodayDot, { backgroundColor: isSelected ? currentTheme.primary : currentTheme.primary + '80' }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Switchable Attendance Card (Overall vs Monthly) */}
        <EmeraldGlassCard
          statusVariant={
            cardMode === 'overall'
              ? (isCriteriaMet ? 'emerald' : 'rose')
              : (activeMonthRecord && activeMonthRecord.totalHeld > 0
                  ? (Math.round((activeMonthRecord.totalAttended / activeMonthRecord.totalHeld) * 100) >= attendanceCriteria ? 'emerald' : 'rose')
                  : 'emerald')
          }
        >
          {/* Top Control Bar: Segmented Switcher + Monthly Log Button */}
          <View style={styles.cardHeaderControlRow}>
            {/* Pill Switcher: Overall vs Monthly */}
            <View style={[styles.cardModeSwitcher, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
              <TouchableOpacity
                style={[
                  styles.cardModeTab,
                  cardMode === 'overall' && [styles.cardModeTabActive, { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary }],
                ]}
                onPress={() => {
                  triggerHapticFeedback('selection');
                  setCardMode('overall');
                }}
              >
                <Feather
                  name="pie-chart"
                  size={12}
                  color={cardMode === 'overall' ? currentTheme.primary : currentTheme.textMuted}
                />
                <Text
                  style={[
                    styles.cardModeTabText,
                    { color: cardMode === 'overall' ? currentTheme.primary : currentTheme.textMuted },
                    cardMode === 'overall' && styles.cardModeTabTextActive,
                  ]}
                >
                  Overall
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cardModeTab,
                  cardMode === 'month' && [styles.cardModeTabActive, { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary }],
                ]}
                onPress={() => {
                  triggerHapticFeedback('selection');
                  setCardMode('month');
                }}
              >
                <Feather
                  name="calendar"
                  size={12}
                  color={cardMode === 'month' ? currentTheme.primary : currentTheme.textMuted}
                />
                <Text
                  style={[
                    styles.cardModeTabText,
                    { color: cardMode === 'month' ? currentTheme.primary : currentTheme.textMuted },
                    cardMode === 'month' && styles.cardModeTabTextActive,
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Action Buttons: Analyze & Edit */}
            <View style={styles.cardHeaderActionsGroup}>
              <TouchableOpacity
                style={[styles.headerAnalyzeBtn, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}
                onPress={() => {
                  triggerHapticFeedback('medium');
                  setShowAnalyticsModal(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="trending-up" size={12} color={currentTheme.primary} />
                <Text style={[styles.headerAnalyzeBtnText, { color: currentTheme.primary }]}>Analyze</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerEditBtn, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
                onPress={() => openHistoryModal(cardMode === 'month' ? selectedCardMonth : currentMonthKey)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="edit-2" size={12} color={currentTheme.textPrimary} />
                <Text style={[styles.headerEditBtnText, { color: currentTheme.textPrimary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {cardMode === 'overall' ? (
            /* ================= OVERALL VIEW ================= */
            <>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.cardTitleRow}>
                    <View style={[styles.titleIconBadge, { backgroundColor: currentTheme.primary + '18' }]}>
                      <MaterialIcons name="fact-check" size={16} color={currentTheme.primary} />
                    </View>
                    <Text style={[Typography.titleMd, styles.mainCardTitle, { color: currentTheme.textPrimary }]}>
                      Current Overall
                    </Text>
                  </View>

                  <View style={styles.percentageAndBadgeRow}>
                    <Text style={[Typography.displayLg, styles.overallPercentageText, { color: currentTheme.textPrimary }]}>
                      {overallAttendance}%
                    </Text>

                    <View style={styles.goalBadge}>
                      <MaterialIcons
                        name={isCriteriaMet ? 'verified' : 'error-outline'}
                        size={14}
                        color={
                          overallAttendance < attendanceCriteria
                            ? '#FF5252'
                            : overallAttendance < attendanceCriteria + 8
                            ? '#FFC107'
                            : currentTheme.statusPresent
                        }
                      />
                      <Text style={styles.goalBadgeText}>Goal {attendanceCriteria}%</Text>
                      <CircularProgress
                        percentage={overallAttendance}
                        size={18}
                        strokeWidth={2.5}
                        criteria={attendanceCriteria}
                        showLabel={false}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.linearProgressContainer}>
                <ProgressBar percentage={overallAttendance} height={7} target={attendanceCriteria} />
              </View>

              <View style={[styles.statsFourColRow, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricColumnLabel, { color: currentTheme.textMuted }]}>ATTENDED</Text>
                  <Text style={[styles.metricColumnValue, { color: currentTheme.primary }]}>{totalPresent}</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricColumnLabel}>ABSENT</Text>
                  <Text style={[styles.metricColumnValue, { color: '#FF5252' }]}>{totalAbsent}</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricColumnLabel}>TOTAL</Text>
                  <Text style={[styles.metricColumnValue, { color: currentTheme.textPrimary }]}>{totalClasses}</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricColumnLabel}>{isCriteriaMet ? 'CAN MISS' : 'NEEDED'}</Text>
                  <Text
                    style={[
                      styles.metricColumnValue,
                      { color: isCriteriaMet ? currentTheme.primary : '#FF5252' },
                    ]}
                  >
                    {isCriteriaMet ? `${classesCanMiss}` : `${classesNeeded}`}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            /* ================= MONTHLY VIEW ================= */
            <>
              {/* Month Navigator Header Row (< Oct 2026 >) */}
              <View style={styles.monthCycleRow}>
                <TouchableOpacity
                  style={[styles.monthCycleBtn, { opacity: currentMonthIdx < pastMonths.length - 1 ? 1 : 0.3 }]}
                  disabled={currentMonthIdx >= pastMonths.length - 1}
                  onPress={() => cycleCardMonth(1)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="chevron-left" size={18} color={currentTheme.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.monthCycleTitleBtn}
                  onPress={() => openHistoryModal(selectedCardMonth)}
                >
                  <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                    {selectedMonthObj?.fullLabel || selectedCardMonth}
                  </Text>
                  <Feather name="chevron-down" size={14} color={currentTheme.primary} style={{ marginLeft: 2 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.monthCycleBtn, { opacity: currentMonthIdx > 0 ? 1 : 0.3 }]}
                  disabled={currentMonthIdx <= 0}
                  onPress={() => cycleCardMonth(-1)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="chevron-right" size={18} color={currentTheme.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Month Stats Row */}
              <View style={styles.percentageAndBadgeRow}>
                <Text style={[Typography.displayLg, styles.overallPercentageText, { color: currentTheme.textPrimary }]}>
                  {monthDisplayStats.pct}%
                </Text>

                <View style={styles.goalBadge}>
                  <MaterialIcons
                    name={monthDisplayStats.isMet ? 'verified' : 'error-outline'}
                    size={14}
                    color={
                      monthDisplayStats.pct < attendanceCriteria
                        ? '#FF5252'
                        : monthDisplayStats.pct < attendanceCriteria + 8
                        ? '#FFC107'
                        : currentTheme.statusPresent
                    }
                  />
                  <Text style={styles.goalBadgeText}>
                    {monthDisplayStats.isMet ? `Goal ${attendanceCriteria}% • Met ✓` : `Goal ${attendanceCriteria}% • Below`}
                  </Text>
                  <CircularProgress
                    percentage={monthDisplayStats.pct}
                    size={18}
                    strokeWidth={2.5}
                    criteria={attendanceCriteria}
                    showLabel={false}
                  />
                </View>
              </View>

              {/* Horizontal Progress Bar */}
              <View style={styles.linearProgressContainer}>
                <ProgressBar percentage={monthDisplayStats.pct} height={7} target={attendanceCriteria} />
              </View>

              {/* 4-Column Metrics: Attended | Absent | Total | Can Miss / Needed */}
              <View style={[styles.statsFourColRow, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricColumnLabel, { color: currentTheme.textMuted }]}>ATTENDED</Text>
                  <Text style={[styles.metricColumnValue, { color: currentTheme.primary }]}>
                    {monthDisplayStats.attended}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricColumnLabel}>ABSENT</Text>
                  <Text style={[styles.metricColumnValue, { color: '#FF5252' }]}>
                    {monthDisplayStats.absent}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricColumnLabel}>TOTAL</Text>
                  <Text style={[styles.metricColumnValue, { color: currentTheme.textPrimary }]}>
                    {monthDisplayStats.held}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricColumnLabel}>
                    {monthDisplayStats.isMet ? 'CAN MISS' : 'NEEDED'}
                  </Text>
                  <Text
                    style={[
                      styles.metricColumnValue,
                      { color: monthDisplayStats.isMet ? currentTheme.primary : '#FF5252' },
                    ]}
                  >
                    {monthDisplayStats.isMet ? `${monthDisplayStats.canMiss}` : `${monthDisplayStats.needed}`}
                  </Text>
                </View>
              </View>

              {/* Bottom Card Action: Edit Month Data */}
              <TouchableOpacity
                style={[styles.editMonthCardBtn, { borderColor: currentTheme.borderGlass, backgroundColor: currentTheme.bgInner }]}
                onPress={() => openHistoryModal(selectedCardMonth)}
              >
                <Feather name="edit-2" size={12} color={currentTheme.primary} />
                <Text style={[styles.editMonthCardBtnText, { color: currentTheme.primary }]}>
                  {monthDisplayStats.hasData
                    ? `Edit ${selectedMonthObj?.label} Attendance Record`
                    : `Enter ${selectedMonthObj?.label} Attendance`}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </EmeraldGlassCard>

        {/* Smart Rule Callout */}
        <View style={[styles.ruleNoticeCard, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
          <Feather name="shield" size={14} color={currentTheme.primary} />
          <Text style={[styles.ruleNoticeText, { color: currentTheme.textSecondary }]}>
            Sundays and approved college holidays are excluded from missed class penalties.
          </Text>
        </View>

        {/* Seamless Scheduled Subjects Section Header */}
        <View style={styles.scheduledSectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionAccentBar, { backgroundColor: currentTheme.primary }]} />
            <Text style={[styles.sectionTitleText, { color: currentTheme.textPrimary }]}>
              {selectedDayTab === 'all' ? 'All Subjects' : 'Scheduled Subjects'}
            </Text>
            <View style={[styles.subjectCountPill, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}>
              <Text style={[styles.subjectCountPillText, { color: currentTheme.primary }]}>{filteredSubjects.length}</Text>
            </View>
          </View>
        </View>

        {/* Subjects List */}
        <View style={styles.subjectsContainer}>
          {filteredSubjects.length === 0 ? (
            <View style={styles.emptyDayBox}>
              <Feather name="coffee" size={28} color={currentTheme.textDisabled} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyDayText}>
                No classes scheduled for {activeDay?.fullLabel || activeDay?.label} on your timetable.
              </Text>
              <TouchableOpacity
                style={[styles.viewAllPillBtn, { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary }]}
                onPress={() => setSelectedDayTab('all')}
              >
                <Text style={[styles.viewAllPillText, { color: currentTheme.primary }]}>View All Subjects</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredSubjects.map((subj) => {
              const subjTotal = subj.present + subj.absent;
              const subjPct = subjTotal > 0 ? Math.round((subj.present / subjTotal) * 100) : 100;
              const isSubjSafe = subjPct >= attendanceCriteria;
              const isCancelled = cancelledSubjectIds.includes(subj.id);
              const subjCanMiss = Math.max(
                0,
                Math.floor((subj.present - (attendanceCriteria / 100) * subjTotal) / (attendanceCriteria / 100))
              );

              return (
                <View
                  key={subj.id}
                  style={[
                    styles.subjectCard,
                    { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                    isCancelled && styles.subjectCardCancelled,
                  ]}
                >
                  {/* Top Bar: Gradient Color Ring + Code + Name + Edit Button */}
                  <View style={styles.subjHeaderRow}>
                    <View style={styles.subjTitleGroup}>
                      <View style={[styles.gradientDonutOuter, { borderColor: isCancelled ? currentTheme.textDisabled : subj.color, backgroundColor: currentTheme.bgInner }]}>
                        <View style={[styles.gradientDonutInner, { backgroundColor: isCancelled ? currentTheme.textDisabled : subj.color }]} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            Typography.titleSm,
                            styles.subjName,
                            { color: currentTheme.textPrimary },
                            isCancelled && styles.textCancelledStriked,
                          ]}
                          numberOfLines={1}
                        >
                          {subj.name}
                        </Text>
                        <Text style={[styles.subjCodeTeacher, { color: currentTheme.textMuted }]}>
                          {subj.code} • {subj.room}
                        </Text>
                      </View>
                    </View>

                    {/* Edit Button + Status Pill */}
                    <View style={styles.subjHeaderRight}>
                      <TouchableOpacity
                        style={[styles.subjEditBtn, { backgroundColor: currentTheme.bgCardSecondary }]}
                        onPress={() => handleOpenEdit(subj)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="edit-2" size={13} color={currentTheme.textMuted} />
                      </TouchableOpacity>

                    {/* Status Pill Indicator */}
                    <View
                      style={[
                        styles.subjStatusBadge,
                        {
                          backgroundColor: isCancelled
                            ? 'rgba(255, 255, 255, 0.06)'
                            : isSubjSafe
                            ? currentTheme.primary + '20'
                            : 'rgba(255, 82, 82, 0.14)',
                          borderColor: isCancelled
                            ? 'rgba(255, 255, 255, 0.12)'
                            : isSubjSafe
                            ? currentTheme.primary + '50'
                            : 'rgba(255, 82, 82, 0.3)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subjStatusText,
                          {
                            color: isCancelled
                              ? currentTheme.textMuted
                              : isSubjSafe
                              ? currentTheme.primary
                              : '#FF5252',
                          },
                        ]}
                      >
                        {isCancelled ? 'Cancelled' : isSubjSafe ? `Safe (+${subjCanMiss})` : 'Critical'}
                      </Text>
                    </View>
                    </View>
                  </View>

                  {/* Slim Indicator Progress Bar (4px) with distinct subject color */}
                  <ProgressBar
                    percentage={subjPct}
                    height={4}
                    color={isCancelled ? currentTheme.textDisabled : isSubjSafe ? subj.color : '#FF5252'}
                    target={attendanceCriteria}
                  />

                  {/* Attendance Actions: Present | Absent | Cancel Class */}
                  <View style={styles.subjActionsRow}>
                    {isCancelled ? (
                      <View style={styles.cancelledStatusRow}>
                        <View style={styles.cancelledNoticePill}>
                          <Feather name="slash" size={11} color={'#FF5252'} />
                          <Text style={styles.cancelledNoticeText}>Cancelled today (No penalty)</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.restoreClassBtn}
                          onPress={() => toggleCancelSubject(subj.id)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="rotate-ccw" size={11} color={currentTheme.textSecondary} />
                          <Text style={styles.restoreClassText}>Restore</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.presentActionBtn, { backgroundColor: currentTheme.statusPresentBg, borderColor: currentTheme.primary + '40' }]}
                          onPress={() => adjustSubjectAttendance(subj.id, 1, 0)}
                          activeOpacity={0.8}
                        >
                          <Feather name="check" size={13} color={currentTheme.statusPresent} />
                          <Text style={[styles.presentActionText, { color: currentTheme.statusPresent }]}>
                            Attended
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.absentActionBtn}
                          onPress={() => adjustSubjectAttendance(subj.id, 0, 1)}
                        >
                          <MaterialIcons name="close" size={15} color={'#FF5252'} />
                          <Text style={styles.absentActionText}>Absent</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelClassActionBtn}
                          onPress={() => toggleCancelSubject(subj.id)}
                        >
                          <Feather name="slash" size={13} color={currentTheme.textMuted} />
                          <Text style={styles.cancelClassActionText}>Cancel Class</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Manual Edit Attendance Dialog (Section 7.3) */}
      <GlassDialog
        visible={Boolean(editingSubject)}
        onClose={() => setEditingSubject(null)}
        title={editingSubject ? `Edit ${editingSubject.code} Attendance` : 'Edit Attendance'}
      >
        <Text style={[Typography.bodySm, { color: currentTheme.textMuted, marginBottom: 12 }]}>
          Update present and absent class counts for {editingSubject?.name}.
        </Text>

        <GlassInput
          label="Present Classes"
          value={editPresentInput}
          onChangeText={setEditPresentInput}
          keyboardType="numeric"
          autoFocus
        />

        <GlassInput
          label="Absent Classes"
          value={editAbsentInput}
          onChangeText={setEditAbsentInput}
          keyboardType="numeric"
        />

        <View style={{ marginTop: 16 }}>
          <EmeraldButton label="Save Changes" onPress={handleSaveEdit} />
        </View>
      </GlassDialog>

      {/* Monthly Attendance History & Past Attendance Entry Modal */}
      <GlassDialog
        visible={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setToastMessage(null);
        }}
        title="Monthly Attendance History"
      >
        {toastMessage && (
          <View style={[styles.toastBanner, { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary }]}>
            <Text style={[styles.toastBannerText, { color: currentTheme.primary }]}>{toastMessage}</Text>
          </View>
        )}

        {/* 1. Month Selector Pills (Horizontal Scroll) */}
        <Text style={[styles.modalFieldLabel, { color: currentTheme.textSecondary }]}>SELECT MONTH</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthPillsScroll}
          style={{ marginBottom: 14 }}
        >
          {pastMonths.map((m) => {
            const isSel = modalMonth === m.key;
            const hasData = Boolean(getMonthlyAttendanceRecord(m.key));
            return (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.modalMonthPill,
                  {
                    backgroundColor: currentTheme.bgCardSecondary,
                    borderColor: currentTheme.borderGlass,
                  },
                  isSel && {
                    backgroundColor: currentTheme.primary + '25',
                    borderColor: currentTheme.primary,
                  },
                ]}
                onPress={() => selectModalMonth(m.key)}
              >
                <View style={styles.modalMonthPillInner}>
                  <Text
                    style={[
                      styles.modalMonthPillText,
                      { color: isSel ? currentTheme.primary : currentTheme.textMuted },
                      isSel && { fontWeight: '700' },
                    ]}
                  >
                    {m.label}
                  </Text>
                  {hasData && (
                    <View style={[styles.monthDataDot, { backgroundColor: currentTheme.statusPresent }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 2. Mode Toggle (⚡ Quick Entry vs 📊 Subject-Wise) */}
        <View style={[styles.entryModeTabsWrapper, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
          <TouchableOpacity
            style={[
              styles.entryModeTab,
              entryMode === 'quick' && [styles.entryModeTabActive, { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary }],
            ]}
            onPress={() => {
              triggerHapticFeedback('selection');
              setEntryMode('quick');
            }}
          >
            <Feather name="zap" size={13} color={entryMode === 'quick' ? currentTheme.primary : currentTheme.textMuted} />
            <Text
              style={[
                styles.entryModeTabText,
                { color: entryMode === 'quick' ? currentTheme.primary : currentTheme.textMuted },
                entryMode === 'quick' && { fontWeight: '700' },
              ]}
            >
              Quick Entry
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.entryModeTab,
              entryMode === 'subject' && [styles.entryModeTabActive, { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary }],
            ]}
            onPress={() => {
              triggerHapticFeedback('selection');
              setEntryMode('subject');
            }}
          >
            <Feather name="layers" size={13} color={entryMode === 'subject' ? currentTheme.primary : currentTheme.textMuted} />
            <Text
              style={[
                styles.entryModeTabText,
                { color: entryMode === 'subject' ? currentTheme.primary : currentTheme.textMuted },
                entryMode === 'subject' && { fontWeight: '700' },
              ]}
            >
              Subject-wise
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Entry Content */}
        {entryMode === 'quick' ? (
          <View style={styles.quickEntryBox}>
            <Text style={[Typography.bodySm, { color: currentTheme.textMuted, marginBottom: 12 }]}>
              Enter total classes held and attended for this month. Classes will be distributed evenly across all your active subjects.
            </Text>

            <View style={styles.inputsRowTwoCol}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <GlassInput
                  label="Classes Held"
                  placeholder="e.g. 50"
                  value={quickHeld}
                  onChangeText={setQuickHeld}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <GlassInput
                  label="Classes Attended"
                  placeholder="e.g. 38"
                  value={quickAttended}
                  onChangeText={setQuickAttended}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Quick Live Preview */}
            {parseInt(quickHeld, 10) > 0 && (
              <View style={[styles.quickLivePreviewCard, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
                <View style={styles.previewHeaderRow}>
                  <Text style={[styles.previewHeading, { color: currentTheme.textPrimary }]}>
                    Calculated: {Math.min(100, Math.round(((parseInt(quickAttended, 10) || 0) / parseInt(quickHeld, 10)) * 100))}% Attendance
                  </Text>
                  <View style={[styles.previewBadge, { backgroundColor: currentTheme.primary + '20' }]}>
                    <Text style={[styles.previewBadgeText, { color: currentTheme.primary }]}>
                      {quickAttended || '0'} / {quickHeld} Attended
                    </Text>
                  </View>
                </View>

                <Text style={[styles.previewSubheading, { color: currentTheme.textMuted }]}>
                  Even subject breakdown ({subjects.length} subjects):
                </Text>

                <View style={styles.previewChipsWrapper}>
                  {quickPreviewDistribution.map((item) => (
                    <View
                      key={item.subject.id}
                      style={[styles.previewSubjectChip, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}
                    >
                      <View style={[styles.miniColorDot, { backgroundColor: item.subject.color }]} />
                      <Text style={[styles.previewChipCode, { color: currentTheme.textPrimary }]}>{item.subject.code}:</Text>
                      <Text style={[styles.previewChipStats, { color: currentTheme.primary }]}>
                        {item.attended}/{item.held} ({item.pct}%)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.subjectEntryBox}>
            <Text style={[Typography.bodySm, { color: currentTheme.textMuted, marginBottom: 12 }]}>
              Enter held and attended class counts for each individual subject.
            </Text>

            {subjects.map((subj) => {
              const currentInput = subjectInputs[subj.id] || { held: '', attended: '' };
              const hNum = parseInt(currentInput.held, 10) || 0;
              const aNum = parseInt(currentInput.attended, 10) || 0;
              const pct = hNum > 0 ? Math.round((aNum / hNum) * 100) : 0;

              return (
                <View
                  key={subj.id}
                  style={[styles.subjectInputRowCard, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
                >
                  <View style={styles.subjRowHeader}>
                    <View style={styles.subjRowLeft}>
                      <View style={[styles.subjDot, { backgroundColor: subj.color }]} />
                      <Text style={[styles.subjRowTitle, { color: currentTheme.textPrimary }]} numberOfLines={1}>
                        {subj.name}
                      </Text>
                      <Text style={[styles.subjRowCode, { color: currentTheme.textMuted }]}>({subj.code})</Text>
                    </View>
                    {hNum > 0 && (
                      <Text style={[styles.subjRowPct, { color: pct >= attendanceCriteria ? currentTheme.statusPresent : '#FF5252' }]}>
                        {pct}%
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputsRowTwoCol}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <GlassInput
                        label="Held"
                        placeholder="0"
                        value={currentInput.held}
                        onChangeText={(val) => {
                          setSubjectInputs((prev) => ({
                            ...prev,
                            [subj.id]: { ...(prev[subj.id] || { attended: '' }), held: val },
                          }));
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 6 }}>
                      <GlassInput
                        label="Attended"
                        placeholder="0"
                        value={currentInput.attended}
                        onChangeText={(val) => {
                          setSubjectInputs((prev) => ({
                            ...prev,
                            [subj.id]: { ...(prev[subj.id] || { held: '' }), attended: val },
                          }));
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 4. Action Buttons (Save & Delete) */}
        <View style={{ marginTop: 16 }}>
          <EmeraldButton
            label={`Save ${pastMonths.find((m) => m.key === modalMonth)?.label || ''} Record`}
            onPress={handleSaveMonthAttendance}
          />

          {Boolean(getMonthlyAttendanceRecord(modalMonth)) && (
            <TouchableOpacity
              style={[styles.deleteMonthBtn, { borderColor: 'rgba(255, 82, 82, 0.3)' }]}
              onPress={handleDeleteMonthAttendance}
            >
              <Feather name="trash-2" size={13} color="#FF5252" />
              <Text style={styles.deleteMonthBtnText}>
                Delete {pastMonths.find((m) => m.key === modalMonth)?.label || ''} Record
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassDialog>

      {/* Attendance Analytics & Trend Insights Modal */}
      <AttendanceAnalyticsModal
        visible={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        currentMonthLabel={currentMonthObj.label}
        previousMonthLabel={previousMonthObj.label}
        currentMonthPct={currentMonthPct}
        previousMonthPct={previousMonthPct}
        currentMonthHeld={currentMonthHeld}
        currentMonthAttended={currentMonthAttended}
        previousMonthHeld={previousMonthHeld}
        previousMonthAttended={previousMonthAttended}
        attendanceCriteria={attendanceCriteria}
        subjects={subjects}
        classesCanMiss={classesCanMiss}
        classesNeeded={classesNeeded}
        onOpenEdit={() => {
          setShowAnalyticsModal(false);
          openHistoryModal(currentMonthKey);
        }}
      />
    </View>
  );
};

const makeStyles = (currentTheme: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentTheme.bgBase,
  },
  tabsWrapper: {
    backgroundColor: '#0A0E0B',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#121614',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayTabPillActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderColor: currentTheme.primary,
  },
  dayTabPillToday: {
    borderColor: 'rgba(0, 230, 118, 0.40)',
  },
  dayTabInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabTodayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: currentTheme.primary,
  },
  tabTodayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  dayTabText: {
    color: currentTheme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  dayTabTextActive: {
    color: currentTheme.textPrimary,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 125,
    gap: 14,
  },
  cardHeaderControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardModeSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 10,
    borderWidth: 0.8,
    gap: 4,
  },
  cardModeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
    borderWidth: 0.8,
    borderColor: 'transparent',
  },
  cardModeTabActive: {
    borderWidth: 0.8,
  },
  cardModeTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardModeTabTextActive: {
    fontWeight: '700',
  },
  cardHeaderActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerAnalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  headerAnalyzeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  headerEditBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  monthCycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthCycleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthCycleTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editMonthCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 0.8,
    marginTop: 10,
  },
  editMonthCardBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardTitle: {
    color: currentTheme.textPrimary,
    fontWeight: '700',
  },
  percentageAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  overallPercentageText: {
    color: currentTheme.textPrimary,
    fontSize: 34,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: currentTheme.textPrimary,
  },
  linearProgressContainer: {
    marginVertical: 12,
  },
  statsFourColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D0A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 2,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  metricColumnLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: currentTheme.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  metricColumnValue: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  metricDivider: {
    width: 0.6,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scheduledSectionHeader: {
    marginTop: 6,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccentBar: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
    backgroundColor: currentTheme.primary,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: currentTheme.textPrimary,
    letterSpacing: 0.2,
  },
  subjectCountPill: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  subjectCountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: currentTheme.primary,
  },
  viewAllPillBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 0.6,
    borderColor: currentTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: currentTheme.primary,
  },
  ruleNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0B120E',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.18)',
  },
  ruleNoticeText: {
    color: currentTheme.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  subjectsContainer: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: '#0F1210',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  subjHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  gradientDonutOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070908',
  },
  gradientDonutInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjName: {
    color: currentTheme.textPrimary,
  },
  subjCodeTeacher: {
    color: currentTheme.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  editSubjectBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#161917',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjPctBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  fractionNote: {
    color: currentTheme.textMuted,
    fontSize: 12,
  },
  subjStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  subjStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  presentActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: currentTheme.statusPresentBg,
    borderRadius: 8,
    borderWidth: 0.7,
    borderColor: 'rgba(0, 230, 118, 0.35)',
    paddingVertical: 7.5,
  },
  presentActionText: {
    color: currentTheme.statusPresent,
    fontWeight: '700',
    fontSize: 12,
  },
  absentActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 82, 82, 0.14)',
    borderRadius: 8,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 82, 82, 0.35)',
    paddingVertical: 7.5,
  },
  absentActionText: {
    color: '#FF5252',
    fontWeight: '700',
    fontSize: 12,
  },
  cancelClassActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: 7.5,
  },
  cancelClassActionText: {
    color: currentTheme.textMuted,
    fontWeight: '600',
    fontSize: 11,
  },
  subjectCardCancelled: {
    opacity: 0.65,
    borderColor: 'rgba(255, 82, 82, 0.20)',
    backgroundColor: '#0B0E0C',
  },
  textCancelledStriked: {
    textDecorationLine: 'line-through',
    color: currentTheme.textDisabled,
  },
  cancelledStatusRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderWidth: 0.6,
    borderColor: 'rgba(255, 82, 82, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelledNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  cancelledNoticeText: {
    color: '#FF5252',
    fontSize: 11,
    fontWeight: '600',
  },
  restoreClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  restoreClassText: {
    color: currentTheme.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyDayBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyDayText: {
    color: currentTheme.textMuted,
    fontSize: 13,
  },
  subjHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMonthCardBox: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  emptyMonthIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyMonthTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyMonthSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  emptyMonthActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyMonthActionBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  toastBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.8,
    marginBottom: 12,
  },
  toastBannerText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  monthPillsScroll: {
    gap: 8,
  },
  modalMonthPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  modalMonthPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modalMonthPillText: {
    fontSize: 12,
  },
  monthDataDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  entryModeTabsWrapper: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 0.8,
    marginBottom: 14,
  },
  entryModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 0.8,
    borderColor: 'transparent',
  },
  entryModeTabActive: {},
  entryModeTabText: {
    fontSize: 12,
  },
  quickEntryBox: {},
  inputsRowTwoCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickLivePreviewCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewSubheading: {
    fontSize: 11,
    marginBottom: 8,
  },
  previewChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewSubjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  miniColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewChipCode: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewChipStats: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjectEntryBox: {
    gap: 10,
  },
  subjectInputRowCard: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  subjRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  subjDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  subjRowCode: {
    fontSize: 11,
  },
  subjRowPct: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  deleteMonthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.8,
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
  },
  deleteMonthBtnText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '600',
  },
});

