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
import { Subject } from '../types/campus';
import { triggerHapticFeedback } from '../utils/haptics';
import { AttendanceSkeleton } from '../components/common/SkeletonLoader';

const STORAGE_KEY_CANCELLED_SUBJECTS = '@colio_cancelled_attendance_subjects_v1';

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
  } = useCampus();

  const styles = useMemo(() => makeStyles(currentTheme), [currentTheme]);


  const totalAbsent = subjects.reduce((sum, s) => sum + s.absent, 0);

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
        {/* Redesigned Attendance Card with 68% Criteria & Circular Gauge */}
        <EmeraldGlassCard statusVariant={isCriteriaMet ? 'emerald' : 'rose'}>
          {/* Top Row: Attendance Card title & 87% with Target Met Chip (No circular gauge) */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.titleIconBadge, { backgroundColor: currentTheme.primary + '18' }]}>
                  <MaterialIcons name="fact-check" size={16} color={currentTheme.primary} />
                </View>
                <Text style={[Typography.titleMd, styles.mainCardTitle, { color: currentTheme.textPrimary }]}>Attendance Card</Text>
              </View>

              {/* 87% + Left-Aligned Goal Badge with Mini Dynamic Circular Progress */}
              <View style={styles.percentageAndBadgeRow}>
                <Text style={[Typography.displayLg, styles.overallPercentageText, { color: currentTheme.textPrimary }]}>
                  {overallAttendance}%
                </Text>

                <View style={styles.goalBadge}>
                  {/* 1. Verified Tick Mark Icon (starburst with tick) */}
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

                  {/* 2. Goal Text */}
                  <Text style={styles.goalBadgeText}>Goal {attendanceCriteria}%</Text>

                  {/* 3. Small Circular Progress Bar */}
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

          {/* Full-width Horizontal Progress Bar (clean, without repetitive target text) */}
          <View style={styles.linearProgressContainer}>
            <ProgressBar percentage={overallAttendance} height={7} target={attendanceCriteria} />
          </View>

          {/* Bottom Row: 4-Column Centered Layout (Attended | Absent | Total | Can Miss) */}
          <View style={[styles.statsFourColRow, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
            {/* 1. Classes Attended */}
            <View style={styles.metricColumn}>
              <Text style={[styles.metricColumnLabel, { color: currentTheme.textMuted }]}>ATTENDED</Text>
              <Text style={[styles.metricColumnValue, { color: currentTheme.primary }]}>
                {totalPresent}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            {/* 2. Classes Absent */}
            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>ABSENT</Text>
              <Text style={[styles.metricColumnValue, { color: '#FF5252' }]}>
                {totalAbsent}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            {/* 3. Total Classes */}
            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>TOTAL</Text>
              <Text style={[styles.metricColumnValue, { color: currentTheme.textPrimary }]}>
                {totalClasses}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            {/* 4. Can be Missed / Needed */}
            <View style={styles.metricColumn}>
              <Text style={styles.metricColumnLabel}>
                {isCriteriaMet ? 'CAN MISS' : 'NEEDED'}
              </Text>
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
});

