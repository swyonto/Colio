import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { TimetableSlot, Subject } from '../types/campus';
import { triggerHapticFeedback } from '../utils/haptics';

export const PERIODS = [
  { period: 1, time: '08:30 – 09:30', startTime: '08:30', endTime: '09:30' },
  { period: 2, time: '09:30 – 10:30', startTime: '09:30', endTime: '10:30' },
  { period: 3, time: '10:30 – 11:30', startTime: '10:30', endTime: '11:30' },
  { period: 4, time: '11:30 – 12:30', startTime: '11:30', endTime: '12:30' },
  { period: 5, time: '12:30 – 01:30', startTime: '12:30', endTime: '01:30', isBreak: true }, // Recess / Lunch
  { period: 6, time: '01:30 – 02:30', startTime: '01:30', endTime: '02:30' },
  { period: 7, time: '02:30 – 03:30', startTime: '02:30', endTime: '03:30' },
  { period: 8, time: '03:30 – 04:30', startTime: '03:30', endTime: '04:30' },
  { period: 9, time: '04:30 – 05:30', startTime: '04:30', endTime: '05:30' },
];

export const DAYS = [
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
  { day: 6, label: 'Sat', full: 'Saturday' },
];

export const TimetableScreen: React.FC = () => {
  const {
    timetable,
    subjects,
    timetableViewMode,
    setTimetableViewMode,
    adjustSubjectAttendance,
    updateTimetableSlot,
    addTimetableSlot,
    deleteTimetableSlot,
    dailyAttendanceLogs,
    recordSlotAttendance,
    currentTheme,
  } = useCampus();

  // Today's date key for attendance log lookup
  const todayDateStr = new Date().toISOString().slice(0, 10); // e.g. "2026-09-24"

  // Real calendar dates for Monday - Saturday of current week
  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon ...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    return DAYS.map((d, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      const dateNum = dayDate.getDate();
      const monthShort = dayDate.toLocaleDateString('en-US', { month: 'short' });
      const isToday = dayDate.toDateString() === now.toDateString();
      return {
        ...d,
        dateNum,
        monthShort,
        dateFormatted: `${monthShort} ${dateNum}`,
        isToday,
      };
    });
  };

  const weekDates = getWeekDates();

  // Automatic Current Day Detection (Calendar-like)
  const todayDayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon ...
  const defaultDay = todayDayOfWeek >= 1 && todayDayOfWeek <= 6 ? todayDayOfWeek : 1;
  const [selectedDay, setSelectedDay] = useState<number>(defaultDay);

  // Edit Timetable Entry Modal State
  const [editingSlot, setEditingSlot] = useState<{
    dayOfWeek: number;
    period: number;
    time: string;
    startTime: string;
    endTime: string;
    slot?: TimetableSlot;
  } | null>(null);

  const [formSubjectId, setFormSubjectId] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');

  const getSubject = (subjectId: string): Subject => {
    return (
      subjects.find((s) => s.id === subjectId) || {
        id: 'unknown',
        name: 'Class Session',
        code: 'CLASS',
        color: currentTheme.primary,
        teacher: 'Faculty',
        room: 'TBA',
        present: 0,
        absent: 0,
        targetPercent: 68,
      }
    );
  };

  const getSubjectCellTheme = (code: string) => {
    const isDark = currentTheme.isDark;
    switch (code) {
      case 'PYTH':
        return {
          bg: isDark ? 'rgba(0, 229, 255, 0.18)' : '#E0F7FA',
          border: isDark ? 'rgba(0, 229, 255, 0.45)' : '#80DEEA',
          text: isDark ? '#00E5FF' : '#006064',
          subText: isDark ? 'rgba(0, 229, 255, 0.9)' : '#00838F',
        };
      case 'CSA':
        return {
          bg: isDark ? 'rgba(0, 230, 118, 0.18)' : '#E8F5E9',
          border: isDark ? 'rgba(0, 230, 118, 0.45)' : '#A5D6A7',
          text: isDark ? '#00E676' : '#1B5E20',
          subText: isDark ? 'rgba(0, 230, 118, 0.9)' : '#2E7D32',
        };
      case 'MC':
        return {
          bg: isDark ? 'rgba(255, 64, 129, 0.18)' : '#FCE4EC',
          border: isDark ? 'rgba(255, 64, 129, 0.45)' : '#F48FB1',
          text: isDark ? '#FF4081' : '#880E4F',
          subText: isDark ? 'rgba(255, 64, 129, 0.9)' : '#AD1457',
        };
      case 'VAC1':
        return {
          bg: isDark ? 'rgba(255, 214, 0, 0.20)' : '#FFF9C4',
          border: isDark ? 'rgba(255, 214, 0, 0.45)' : '#FFF176',
          text: isDark ? '#FFD600' : '#E65100',
          subText: isDark ? 'rgba(255, 214, 0, 0.9)' : '#F57F17',
        };
      case 'SEC1':
        return {
          bg: isDark ? 'rgba(224, 64, 251, 0.18)' : '#F3E5F5',
          border: isDark ? 'rgba(224, 64, 251, 0.45)' : '#CE93D8',
          text: isDark ? '#E040FB' : '#4A148C',
          subText: isDark ? 'rgba(224, 64, 251, 0.9)' : '#6A1B9A',
        };
      case 'GE1':
        return {
          bg: isDark ? 'rgba(2, 132, 199, 0.18)' : '#E1F5FE',
          border: isDark ? 'rgba(2, 132, 199, 0.45)' : '#81D4FA',
          text: isDark ? '#38BDF8' : '#01579B',
          subText: isDark ? 'rgba(56, 189, 248, 0.9)' : '#0277BD',
        };
      case 'LANG1':
        return {
          bg: isDark ? 'rgba(105, 240, 174, 0.18)' : '#DCEDC8',
          border: isDark ? 'rgba(105, 240, 174, 0.45)' : '#AED581',
          text: isDark ? '#69F0AE' : '#33691E',
          subText: isDark ? 'rgba(105, 240, 174, 0.9)' : '#558B2F',
        };
      default:
        return {
          bg: isDark ? 'rgba(0, 230, 118, 0.12)' : '#F1F5F9',
          border: isDark ? 'rgba(0, 230, 118, 0.30)' : '#CBD5E1',
          text: isDark ? '#00E676' : '#0F172A',
          subText: isDark ? '#B2DFDB' : '#475569',
        };
    }
  };

  const daySlots = timetable.filter((slot) => slot.dayOfWeek === selectedDay);

  const handleOpenEdit = (
    dayNum: number,
    periodNum: number,
    timeStr: string,
    startTimeStr: string,
    endTimeStr: string,
    slot?: TimetableSlot
  ) => {
    triggerHapticFeedback('selection');
    const existingSubject = slot ? getSubject(slot.subjectId) : subjects[0];
    setEditingSlot({
      dayOfWeek: dayNum,
      period: periodNum,
      time: timeStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      slot,
    });
    setFormSubjectId(slot ? slot.subjectId : subjects[0]?.id || '');
    setFormRoom(slot?.room || existingSubject?.room || '');
    setFormTeacher(slot?.teacher || existingSubject?.teacher || '');
    setFormStartTime(slot?.startTime || startTimeStr);
    setFormEndTime(slot?.endTime || endTimeStr);
  };

  const handleSaveSlot = () => {
    if (!editingSlot || !formSubjectId) return;

    if (editingSlot.slot) {
      // Modify existing slot
      updateTimetableSlot({
        ...editingSlot.slot,
        subjectId: formSubjectId,
        room: formRoom.trim() || 'TBA',
        teacher: formTeacher.trim() || 'Faculty',
        startTime: formStartTime.trim() || editingSlot.startTime,
        endTime: formEndTime.trim() || editingSlot.endTime,
      });
    } else {
      // Create new slot
      addTimetableSlot({
        dayOfWeek: editingSlot.dayOfWeek,
        period: editingSlot.period,
        startTime: formStartTime.trim() || editingSlot.startTime,
        endTime: formEndTime.trim() || editingSlot.endTime,
        subjectId: formSubjectId,
        room: formRoom.trim() || 'TBA',
        teacher: formTeacher.trim() || 'Faculty',
      });
    }
    setEditingSlot(null);
  };

  const handleDeleteSlot = () => {
    if (!editingSlot?.slot) return;
    deleteTimetableSlot(editingSlot.slot.id);
    setEditingSlot(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Controls: Day Selector & Grid/List View */}
      <View style={[styles.topControlBar, { backgroundColor: currentTheme.bgSurface, borderBottomColor: currentTheme.borderGlass }]}>
        {/* Days Scroll with Calendar-style Today Indicators */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
          style={styles.daysScrollView}
        >
          {weekDates.map((d) => {
            const isSelected = selectedDay === d.day;

            return (
              <TouchableOpacity
                key={d.day}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: isSelected ? currentTheme.primary + '25' : currentTheme.bgCardSecondary,
                    borderColor: isSelected ? currentTheme.primary : currentTheme.borderGlass,
                  },
                ]}
                onPress={() => {
                  triggerHapticFeedback('selection');
                  setSelectedDay(d.day);
                }}
              >
                <View style={styles.dayBtnInner}>
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isSelected ? currentTheme.primary : currentTheme.textMuted,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {d.label}
                  </Text>
                  <Text
                    style={[
                      styles.dayDateNumText,
                      { color: isSelected ? currentTheme.primary : currentTheme.textSecondary },
                    ]}
                  >
                    {d.dateNum}
                  </Text>
                  {d.isToday && (
                    <View style={[styles.todayIndicator, { backgroundColor: currentTheme.primary }]}>
                      <Text style={[styles.todayText, { color: currentTheme.isDark ? '#050907' : '#FFFFFF' }]}>
                        TODAY
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* View Mode Switcher: Proper Grid vs List */}
        <View style={[styles.modeToggleContainer, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              timetableViewMode === 'list' && { backgroundColor: currentTheme.primary },
            ]}
            onPress={() => setTimetableViewMode('list')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather
              name="list"
              size={15}
              color={timetableViewMode === 'list' ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : currentTheme.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              timetableViewMode === 'grid' && { backgroundColor: currentTheme.primary },
            ]}
            onPress={() => setTimetableViewMode('grid')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather
              name="grid"
              size={15}
              color={timetableViewMode === 'grid' ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : currentTheme.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Header Bar */}
        <View style={styles.activeDayHeader}>
          <View>
            <Text style={[Typography.titleLg, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
              {timetableViewMode === 'grid' ? 'Weekly Timetable Matrix' : `${DAYS.find((d) => d.day === selectedDay)?.full} Schedule`}
            </Text>
            <Text style={[styles.periodsCountText, { color: currentTheme.textMuted }]}>
              {timetableViewMode === 'grid'
                ? 'Section - I Official Matrix (Mon–Sat) • Tap any cell to edit'
                : `${daySlots.length} scheduled periods • Tap any slot to edit`}
            </Text>
          </View>
          <View style={[styles.viewModeBadge, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}>
            <Text style={[styles.viewModeBadgeText, { color: currentTheme.primary }]}>
              {timetableViewMode.toUpperCase()} VIEW
            </Text>
          </View>
        </View>

        {/* OFFICIAL WEEKLY MATRIX TIMETABLE (LOOKS EXACTLY LIKE THE CLASS TIMETABLE IMAGE) */}
        {timetableViewMode === 'grid' ? (
          <View style={styles.matrixContainer}>
            {/* Header info badge */}
            <View style={[styles.matrixHeaderCard, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
              <View style={styles.matrixHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.matrixCollegeTitle, { color: currentTheme.textPrimary }]} numberOfLines={1}>
                    Department of Computer Science
                  </Text>
                  <Text style={[styles.matrixClassSubtitle, { color: currentTheme.primary }]} numberOfLines={1}>
                    First Year (Section - I) • Class Timetable (2026 – 27)
                  </Text>
                </View>
                <View style={[styles.matrixWeekBadge, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}>
                  <Text style={[styles.matrixWeekBadgeText, { color: currentTheme.primary }]}>
                    Full Week
                  </Text>
                </View>
              </View>
              <Text style={[styles.matrixHintText, { color: currentTheme.textMuted }]}>
                Scroll horizontally to view all 9 periods • Tap any subject block to edit
              </Text>
            </View>

            {/* Scrollable Matrix Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.matrixScrollContent}>
              <View style={[styles.matrixTableWrapper, { borderColor: currentTheme.borderGlass }]}>
                {/* 1. Matrix Table Header Row: Day & Periods 1 to 9 */}
                <View style={[styles.matrixTableRow, styles.matrixTableHeaderRow, { backgroundColor: currentTheme.bgSurface, borderBottomColor: currentTheme.borderGlass }]}>
                  {/* Fixed Day Column Header */}
                  <View style={[styles.matrixDayColHeader, { borderRightColor: currentTheme.borderGlass }]}>
                    <Text style={[styles.matrixDayColHeaderText, { color: currentTheme.textPrimary }]}>Day / Date</Text>
                  </View>

                  {/* 9 Period Headers */}
                  {PERIODS.map(({ period, startTime, endTime }) => (
                    <View
                      key={period}
                      style={[
                        styles.matrixPeriodColHeader,
                        { borderRightColor: currentTheme.borderGlass },
                        period === 5 && { backgroundColor: currentTheme.bgElevated },
                      ]}
                    >
                      <Text style={[styles.matrixPeriodNumText, { color: currentTheme.primary }]}>
                        {period === 5 ? '5 (Break)' : period}
                      </Text>
                      <Text style={[styles.matrixPeriodTimeText, { color: currentTheme.textMuted }]}>
                        {startTime}–{endTime}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* 2. Matrix Table Body: Rows for Monday through Saturday */}
                {weekDates.map((dayItem) => {
                  return (
                    <View
                      key={dayItem.day}
                      style={[
                        styles.matrixTableRow,
                        { borderBottomColor: currentTheme.borderGlass },
                        dayItem.isToday && { backgroundColor: currentTheme.primary + '08' },
                      ]}
                    >
                      {/* Day & Real Calendar Date Cell */}
                      <TouchableOpacity
                        style={[
                          styles.matrixDayCell,
                          { borderRightColor: currentTheme.borderGlass },
                          dayItem.isToday && { backgroundColor: currentTheme.primary + '15' },
                        ]}
                        onPress={() => {
                          triggerHapticFeedback('selection');
                          setSelectedDay(dayItem.day);
                          setTimetableViewMode('list');
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.matrixDayNameText,
                            { color: dayItem.isToday ? currentTheme.primary : currentTheme.textPrimary },
                          ]}
                        >
                          {dayItem.full}
                        </Text>
                        <View
                          style={[
                            styles.matrixDateBadge,
                            {
                              backgroundColor: dayItem.isToday ? currentTheme.primary : currentTheme.bgCardSecondary,
                              borderColor: dayItem.isToday ? currentTheme.primary : currentTheme.borderGlass,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.matrixDateBadgeText,
                              { color: dayItem.isToday ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : currentTheme.textMuted },
                            ]}
                          >
                            {dayItem.dateFormatted}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* 9 Period Cells for this Day */}
                      {PERIODS.map(({ period, time, startTime, endTime, isBreak }) => {
                        const slot = timetable.find((s) => s.dayOfWeek === dayItem.day && s.period === period);
                        const subj = slot ? getSubject(slot.subjectId) : null;
                        const cellTheme = subj ? getSubjectCellTheme(subj.code) : null;

                        if (isBreak && !slot) {
                          return (
                            <View
                              key={period}
                              style={[
                                styles.matrixCell,
                                styles.matrixBreakCell,
                                {
                                  backgroundColor: currentTheme.bgCardSecondary,
                                  borderRightColor: currentTheme.borderGlass,
                                },
                              ]}
                            >
                              <Text style={[styles.matrixBreakCellText, { color: currentTheme.textDisabled }]}>
                                Lunch
                              </Text>
                            </View>
                          );
                        }

                        if (!slot) {
                          return (
                            <TouchableOpacity
                              key={period}
                              style={[
                                styles.matrixCell,
                                styles.matrixEmptyCell,
                                {
                                  backgroundColor: currentTheme.bgCardSecondary,
                                  borderRightColor: currentTheme.borderGlass,
                                },
                              ]}
                              onPress={() => handleOpenEdit(dayItem.day, period, time, startTime, endTime)}
                              activeOpacity={0.6}
                            >
                              <Text style={[styles.matrixEmptyDash, { color: currentTheme.textDisabled }]}>—</Text>
                            </TouchableOpacity>
                          );
                        }

                        return (
                          <TouchableOpacity
                            key={period}
                            style={[
                              styles.matrixCell,
                              styles.matrixOccupiedCell,
                              {
                                backgroundColor: cellTheme ? cellTheme.bg : `${subj?.color}20`,
                                borderColor: cellTheme ? cellTheme.border : `${subj?.color}60`,
                                borderRightColor: currentTheme.borderGlass,
                              },
                            ]}
                            onPress={() => handleOpenEdit(dayItem.day, period, time, startTime, endTime, slot)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.matrixCellCode,
                                { color: cellTheme ? cellTheme.text : subj?.color },
                              ]}
                              numberOfLines={1}
                            >
                              {subj?.code}
                            </Text>
                            <Text
                              style={[
                                styles.matrixCellRoom,
                                { color: cellTheme ? cellTheme.subText : currentTheme.textSecondary },
                              ]}
                              numberOfLines={1}
                            >
                              ({slot.room || subj?.room})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Subject Code Reference Legend (Matching the reference chart) */}
            <View style={[styles.matrixLegendCard, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
              <Text style={[styles.legendHeader, { color: currentTheme.textMuted }]}>
                SUBJECT CODES (FOR REFERENCE)
              </Text>
              <View style={styles.legendGrid}>
                {subjects.map((s) => {
                  const cellTheme = getSubjectCellTheme(s.code);
                  return (
                    <View
                      key={s.id}
                      style={[
                        styles.legendChip,
                        {
                          backgroundColor: cellTheme.bg,
                          borderColor: cellTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.legendCodeText, { color: cellTheme.text }]}>
                        {s.code}
                      </Text>
                      <Text style={[styles.legendNameText, { color: currentTheme.textSecondary }]}>
                        – {s.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          /* PROPER DETAILED LIST VIEW */
          <View style={styles.listContainer}>
            {PERIODS.map(({ period, time, startTime, endTime, isBreak }) => {
              const slot = daySlots.find((s) => s.period === period);
              const subj = slot ? getSubject(slot.subjectId) : null;

              if (isBreak) {
                return (
                  <View
                    key={period}
                    style={[
                      styles.listBreakRow,
                      { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="coffee" size={14} color={currentTheme.textMuted} />
                    <Text style={[styles.listBreakText, { color: currentTheme.textMuted }]}>
                      Period {period} • {time} • Recess / Lunch Break
                    </Text>
                  </View>
                );
              }

              if (!slot) {
                return (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.listEmptyRow,
                      { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                    ]}
                    onPress={() => handleOpenEdit(selectedDay, period, time, startTime, endTime)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.listEmptyLeft}>
                      <View style={[styles.periodPill, { backgroundColor: currentTheme.bgElevated }]}>
                        <Text style={[styles.periodPillText, { color: currentTheme.textMuted }]}>P{period}</Text>
                      </View>
                      <Text style={[styles.listEmptyPeriodText, { color: currentTheme.textMuted }]} numberOfLines={1}>
                        P{period} ({time}) — Free
                      </Text>
                    </View>
                    <View style={[styles.addSlotBtn, { borderColor: currentTheme.primary + '50' }]}>
                      <Feather name="plus" size={13} color={currentTheme.primary} />
                      <Text style={[styles.addSlotBtnText, { color: currentTheme.primary }]}>Assign</Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              return (
                <View
                  key={period}
                  style={[
                    styles.listItemCard,
                    {
                      backgroundColor: currentTheme.bgCard,
                      borderColor:
                        dailyAttendanceLogs[`${todayDateStr}_${slot.id}`] === 'present'
                          ? currentTheme.statusPresent + '60'
                          : dailyAttendanceLogs[`${todayDateStr}_${slot.id}`] === 'absent'
                          ? '#FF5252' + '60'
                          : currentTheme.borderGlass,
                      borderWidth:
                        dailyAttendanceLogs[`${todayDateStr}_${slot.id}`] ? 1.5 : 0.8,
                    },
                  ]}
                >
                  {/* Left Colored Accent Stripe */}
                  <View style={[styles.coloredStripe, {
                    backgroundColor:
                      dailyAttendanceLogs[`${todayDateStr}_${slot.id}`] === 'present'
                        ? currentTheme.statusPresent
                        : dailyAttendanceLogs[`${todayDateStr}_${slot.id}`] === 'absent'
                        ? '#FF5252'
                        : subj!.color
                  }]} />

                  <View style={styles.listItemContent}>
                    {/* Period Header Row */}
                    <View style={styles.listHeaderRow}>
                      <View style={styles.listTimeBadgeWrap}>
                        <Text style={[styles.listTimeBadge, { color: currentTheme.textMuted }]}>
                          Period {period} • {slot.startTime || startTime} – {slot.endTime || endTime}
                        </Text>
                      </View>

                      <View style={styles.listActionTopRight}>
                        <View style={[styles.codePill, { borderColor: `${subj!.color}60`, backgroundColor: `${subj!.color}15` }]}>
                          <Text style={[styles.codePillText, { color: subj!.color }]}>
                            {subj!.code}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.slotEditBtn}
                          onPress={() => handleOpenEdit(selectedDay, period, time, startTime, endTime, slot)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Feather name="edit-2" size={14} color={currentTheme.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Subject Name */}
                    <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]} numberOfLines={1}>
                      {subj!.name}
                    </Text>

                    {/* Room & Teacher */}
                    <View style={styles.listMetaRow}>
                      <View style={[styles.roomPill, { backgroundColor: currentTheme.primary + '16' }]}>
                        <Feather name="map-pin" size={11} color={currentTheme.primary} />
                        <Text style={[styles.roomPillText, { color: currentTheme.primary }]}>
                          {slot.room || subj!.room}
                        </Text>
                      </View>
                      <Text style={[styles.teacherNameText, { color: currentTheme.textSecondary }]}>
                        {slot.teacher || subj!.teacher}
                      </Text>
                    </View>

                    {/* Mark Attendance Row — Smart Toggle with visual state */}
                    {(() => {
                      const logKey = `${todayDateStr}_${slot.id}`;
                      const markedStatus = dailyAttendanceLogs[logKey];
                      const isPresent = markedStatus === 'present';
                      const isAbsent = markedStatus === 'absent';

                      return (
                        <View style={[styles.attendanceActionRow, { borderTopColor: currentTheme.borderGlass }]}>
                          {/* PRESENT button */}
                          <TouchableOpacity
                            style={[
                              styles.markPresentBtn,
                              {
                                backgroundColor: isPresent ? currentTheme.statusPresent + '28' : currentTheme.statusPresentBg,
                                borderColor: isPresent ? currentTheme.statusPresent : currentTheme.statusPresent + '40',
                                borderWidth: isPresent ? 1.5 : 0.8,
                              },
                            ]}
                            onPress={() => {
                              triggerHapticFeedback('light');
                              recordSlotAttendance(todayDateStr, slot.id, slot.subjectId, 'present');
                            }}
                          >
                            <MaterialIcons
                              name={isPresent ? 'check-circle' : 'check'}
                              size={15}
                              color={currentTheme.statusPresent}
                            />
                            <Text style={[styles.markPresentText, { color: currentTheme.statusPresent, fontWeight: isPresent ? '700' : '600' }]}>
                              {isPresent ? '✓ Attended' : 'Mark Present'}
                            </Text>
                          </TouchableOpacity>

                          {/* ABSENT button */}
                          <TouchableOpacity
                            style={[
                              styles.markAbsentBtn,
                              {
                                backgroundColor: isAbsent ? 'rgba(255, 82, 82, 0.22)' : 'rgba(255, 82, 82, 0.12)',
                                borderColor: isAbsent ? 'rgba(255, 82, 82, 0.8)' : 'rgba(255, 82, 82, 0.35)',
                                borderWidth: isAbsent ? 1.5 : 0.8,
                              },
                            ]}
                            onPress={() => {
                              triggerHapticFeedback('medium');
                              recordSlotAttendance(todayDateStr, slot.id, slot.subjectId, 'absent');
                            }}
                          >
                            <MaterialIcons
                              name={isAbsent ? 'cancel' : 'close'}
                              size={15}
                              color="#FF5252"
                            />
                            <Text style={[styles.markAbsentText, { fontWeight: isAbsent ? '700' : '600' }]}>
                              {isAbsent ? '✕ Absent' : 'Mark Absent'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })()}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Edit / Add Timetable Slot Modal */}
      <GlassDialog
        visible={Boolean(editingSlot)}
        onClose={() => setEditingSlot(null)}
        title={editingSlot?.slot ? `Edit Period ${editingSlot.period} Class` : `Assign Period ${editingSlot?.period} Class`}
      >
        <Text style={[Typography.bodySm, { color: currentTheme.textMuted, marginBottom: 12 }]}>
          {DAYS.find((d) => d.day === (editingSlot?.dayOfWeek || selectedDay))?.full} • Period {editingSlot?.period} ({editingSlot?.time})
        </Text>

        {/* Subject Selector */}
        <Text style={[Typography.labelSm, styles.formSectionLabel, { color: currentTheme.textMuted }]}>
          SELECT SUBJECT *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectPillsRow}>
          {subjects.map((s) => {
            const isSelected = formSubjectId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.subjSelectChip,
                  {
                    backgroundColor: isSelected ? `${s.color}25` : currentTheme.bgCardSecondary,
                    borderColor: isSelected ? s.color : currentTheme.borderGlass,
                  },
                ]}
                onPress={() => {
                  setFormSubjectId(s.id);
                  if (!formRoom) setFormRoom(s.room);
                  if (!formTeacher) setFormTeacher(s.teacher);
                }}
              >
                <Text style={[styles.subjSelectChipText, { color: isSelected ? s.color : currentTheme.textMuted, fontWeight: isSelected ? '700' : '500' }]}>
                  {s.code} • {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <GlassInput
          label="Classroom / Lab Location *"
          placeholder="e.g. CL-2, LT-1, Lab 3"
          value={formRoom}
          onChangeText={setFormRoom}
        />

        <GlassInput
          label="Teacher / Faculty *"
          placeholder="e.g. Prof. Sharma"
          value={formTeacher}
          onChangeText={setFormTeacher}
        />

        <View style={styles.timeInputsRow}>
          <View style={{ flex: 1 }}>
            <GlassInput
              label="Start Time"
              placeholder="08:30"
              value={formStartTime}
              onChangeText={setFormStartTime}
            />
          </View>
          <View style={{ flex: 1 }}>
            <GlassInput
              label="End Time"
              placeholder="09:30"
              value={formEndTime}
              onChangeText={setFormEndTime}
            />
          </View>
        </View>

        <View style={{ marginTop: 14, gap: 10 }}>
          <EmeraldButton
            label={editingSlot?.slot ? 'Save Entry Changes' : 'Add Class to Timetable'}
            onPress={handleSaveSlot}
          />

          {editingSlot?.slot && (
            <TouchableOpacity
              style={[styles.deleteSlotBtn, { backgroundColor: 'rgba(255, 82, 82, 0.12)', borderColor: 'rgba(255, 82, 82, 0.35)' }]}
              onPress={handleDeleteSlot}
              activeOpacity={0.8}
            >
              <Feather name="trash-2" size={14} color="#FF5252" />
              <Text style={styles.deleteSlotBtnText}>Clear / Remove this Class Slot</Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControlBar: {
    paddingVertical: 10,
    borderBottomWidth: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  daysScrollView: {
    flex: 1,
  },
  daysScroll: {
    gap: 6,
    flexGrow: 1,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 0.8,
  },
  dayBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayText: {
    fontSize: 12,
  },
  dayDateNumText: {
    fontSize: 10,
    fontWeight: '700',
  },
  todayIndicator: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayText: {
    fontSize: 7,
    fontWeight: '800',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    borderWidth: 0.8,
    marginLeft: 8,
  },
  modeButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 11,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  activeDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodsCountText: {
    fontSize: 11,
    marginTop: 2,
  },
  viewModeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.6,
  },
  viewModeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // --- GRID VIEW MATRIX STYLES ---
  gridMatrixContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridSlotCard: {
    width: '48.5%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.8,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  gridBreakCard: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 0.8,
  },
  breakInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakCardTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  gridCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  periodPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  gridCardTime: {
    fontSize: 10,
  },
  gridCardMid: {
    marginVertical: 6,
    gap: 4,
  },
  gridCodeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  gridCodeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  gridSubjTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  gridEmptyMid: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  gridEmptyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gridCardBottom: {
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 6,
    gap: 2,
  },
  gridMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridMetaText: {
    fontSize: 10,
    fontWeight: '600',
  },
  gridTeacherName: {
    fontSize: 9,
  },
  tapToAssignText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  // --- LIST VIEW STYLES ---
  listContainer: {
    gap: 10,
  },
  listBreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.8,
  },
  listBreakText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.8,
    borderStyle: 'dashed',
  },
  listEmptyLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  listEmptyPeriodText: {
    fontSize: 12,
    flex: 1,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  addSlotBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listItemCard: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.8,
  },
  coloredStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  listItemContent: {
    padding: 14,
    paddingLeft: 18,
    gap: 6,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTimeBadgeWrap: {
    flex: 1,
  },
  listTimeBadge: {
    fontSize: 11,
  },
  listActionTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  codePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  slotEditBtn: {
    padding: 4,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roomPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  teacherNameText: {
    fontSize: 11,
  },
  attendanceActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 0.6,
  },
  markPresentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  markPresentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  markAbsentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  markAbsentText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '700',
  },
  // --- FORM DIALOG STYLES ---
  formSectionLabel: {
    marginBottom: 6,
  },
  subjectPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  subjSelectChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  subjSelectChipText: {
    fontSize: 11,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  deleteSlotBtnText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: '600',
  },
  // --- WEEKLY TIMETABLE MATRIX STYLES ---
  matrixContainer: {
    marginBottom: 24,
  },
  matrixHeaderCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matrixCollegeTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  matrixClassSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  matrixWeekBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  matrixWeekBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  matrixHintText: {
    fontSize: 10,
    marginTop: 4,
  },
  matrixScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  matrixTableWrapper: {
    borderRadius: 10,
    borderWidth: 0.8,
    overflow: 'hidden',
  },
  matrixTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.8,
  },
  matrixTableHeaderRow: {
    minHeight: 46,
  },
  matrixDayColHeader: {
    width: 90,
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.8,
  },
  matrixDayColHeaderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  matrixPeriodColHeader: {
    width: 76,
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.8,
  },
  matrixPeriodNumText: {
    fontSize: 11,
    fontWeight: '700',
  },
  matrixPeriodTimeText: {
    fontSize: 8,
    marginTop: 2,
  },
  matrixDayCell: {
    width: 90,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.8,
  },
  matrixDayNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  matrixDateBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.6,
  },
  matrixDateBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  matrixCell: {
    width: 76,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRightWidth: 0.8,
  },
  matrixBreakCell: {
    opacity: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixBreakCellText: {
    fontSize: 10,
    fontWeight: '600',
  },
  matrixEmptyCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixEmptyDash: {
    fontSize: 14,
    fontWeight: '500',
  },
  matrixOccupiedCell: {
    borderWidth: 1,
    borderRadius: 6,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    maxWidth: 72,
  },
  matrixCellCode: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    width: 68,
  },
  matrixCellRoom: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    width: 68,
  },
  matrixLegendCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  legendHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.8,
    gap: 4,
  },
  legendCodeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  legendNameText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

