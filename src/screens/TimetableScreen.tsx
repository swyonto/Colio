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
    currentTheme,
  } = useCampus();

  // Automatic Current Day Detection (Calendar-like)
  const todayDayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon ...
  const defaultDay = todayDayOfWeek >= 1 && todayDayOfWeek <= 6 ? todayDayOfWeek : 1;
  const [selectedDay, setSelectedDay] = useState<number>(defaultDay);

  // Edit Timetable Entry Modal State
  const [editingSlot, setEditingSlot] = useState<{
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

  const daySlots = timetable.filter((slot) => slot.dayOfWeek === selectedDay);

  const handleOpenEdit = (periodNum: number, timeStr: string, startTimeStr: string, endTimeStr: string, slot?: TimetableSlot) => {
    triggerHapticFeedback('selection');
    const existingSubject = slot ? getSubject(slot.subjectId) : subjects[0];
    setEditingSlot({
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
        dayOfWeek: selectedDay,
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
      {/* Top Controls: Day Selector & Grid/List View Mode Switcher */}
      <View style={[styles.topControlBar, { backgroundColor: currentTheme.bgSurface, borderBottomColor: currentTheme.borderGlass }]}>
        {/* Days Scroll with Calendar-style Today Indicators */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {DAYS.map((d) => {
            const isSelected = selectedDay === d.day;
            const isToday = todayDayOfWeek === d.day;

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
                  {isToday && (
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
        {/* Active Day Header Bar */}
        <View style={styles.activeDayHeader}>
          <View>
            <Text style={[Typography.titleLg, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
              {DAYS.find((d) => d.day === selectedDay)?.full} Schedule
            </Text>
            <Text style={[styles.periodsCountText, { color: currentTheme.textMuted }]}>
              {daySlots.length} scheduled periods • Tap any slot to edit
            </Text>
          </View>
          <View style={[styles.viewModeBadge, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}>
            <Text style={[styles.viewModeBadgeText, { color: currentTheme.primary }]}>
              {timetableViewMode.toUpperCase()} VIEW
            </Text>
          </View>
        </View>

        {/* PROPER 2-COLUMN GRID VIEW */}
        {timetableViewMode === 'grid' ? (
          <View style={styles.gridMatrixContainer}>
            {PERIODS.map(({ period, time, startTime, endTime, isBreak }) => {
              const slot = daySlots.find((s) => s.period === period);
              const subj = slot ? getSubject(slot.subjectId) : null;

              if (isBreak) {
                return (
                  <View
                    key={period}
                    style={[
                      styles.gridBreakCard,
                      { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <View style={styles.breakInnerRow}>
                      <Text style={[styles.breakCardTitle, { color: currentTheme.textMuted }]}>
                        ☕ Period {period}: Lunch & Midday Break ({time})
                      </Text>
                    </View>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.gridSlotCard,
                    {
                      backgroundColor: slot ? currentTheme.bgCard : currentTheme.bgCardSecondary,
                      borderColor: slot ? (subj?.color ? `${subj.color}60` : currentTheme.borderGlass) : currentTheme.borderGlass,
                      borderStyle: slot ? 'solid' : 'dashed',
                    },
                  ]}
                  onPress={() => handleOpenEdit(period, time, startTime, endTime, slot)}
                  activeOpacity={0.8}
                >
                  {/* Top Bar: Period Number + Start Time */}
                  <View style={styles.gridCardTopRow}>
                    <View style={[styles.periodPill, { backgroundColor: currentTheme.primary + '20' }]}>
                      <Text style={[styles.periodPillText, { color: currentTheme.primary }]}>P{period}</Text>
                    </View>
                    <Text style={[styles.gridCardTime, { color: currentTheme.textMuted }]}>
                      {slot ? `${slot.startTime}–${slot.endTime}` : startTime}
                    </Text>
                    <Feather name="edit-2" size={11} color={currentTheme.textDisabled} />
                  </View>

                  {/* Middle: Subject Code & Name */}
                  {slot && subj ? (
                    <View style={styles.gridCardMid}>
                      <View style={[styles.gridCodeBadge, { backgroundColor: `${subj.color}20`, borderColor: `${subj.color}50` }]}>
                        <Text style={[styles.gridCodeText, { color: subj.color }]}>{subj.code}</Text>
                      </View>
                      <Text style={[styles.gridSubjTitle, { color: currentTheme.textPrimary }]} numberOfLines={2}>
                        {subj.name}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.gridEmptyMid}>
                      <Feather name="plus-circle" size={18} color={currentTheme.textMuted} />
                      <Text style={[styles.gridEmptyText, { color: currentTheme.textMuted }]}>
                        Free Slot
                      </Text>
                    </View>
                  )}

                  {/* Bottom: Room & Teacher */}
                  {slot && subj ? (
                    <View style={styles.gridCardBottom}>
                      <View style={styles.gridMetaItem}>
                        <Feather name="map-pin" size={10} color={currentTheme.primary} />
                        <Text style={[styles.gridMetaText, { color: currentTheme.textSecondary }]} numberOfLines={1}>
                          {slot.room || subj.room}
                        </Text>
                      </View>
                      <Text style={[styles.gridTeacherName, { color: currentTheme.textMuted }]} numberOfLines={1}>
                        {slot.teacher || subj.teacher}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.tapToAssignText, { color: currentTheme.primary }]}>
                      + Tap to Assign
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
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
                    onPress={() => handleOpenEdit(period, time, startTime, endTime)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.listEmptyLeft}>
                      <View style={[styles.periodPill, { backgroundColor: currentTheme.bgElevated }]}>
                        <Text style={[styles.periodPillText, { color: currentTheme.textMuted }]}>P{period}</Text>
                      </View>
                      <Text style={[styles.listEmptyPeriodText, { color: currentTheme.textMuted }]}>
                        Period {period} ({time}) — Free Slot
                      </Text>
                    </View>
                    <View style={[styles.addSlotBtn, { borderColor: currentTheme.primary + '50' }]}>
                      <Feather name="plus" size={13} color={currentTheme.primary} />
                      <Text style={[styles.addSlotBtnText, { color: currentTheme.primary }]}>Assign Class</Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              return (
                <View
                  key={period}
                  style={[
                    styles.listItemCard,
                    { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                  ]}
                >
                  {/* Left Colored Accent Stripe */}
                  <View style={[styles.coloredStripe, { backgroundColor: subj!.color }]} />

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
                          onPress={() => handleOpenEdit(period, time, startTime, endTime, slot)}
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

                    {/* Mark Attendance Row */}
                    <View style={[styles.attendanceActionRow, { borderTopColor: currentTheme.borderGlass }]}>
                      <TouchableOpacity
                        style={[styles.markPresentBtn, { backgroundColor: currentTheme.statusPresentBg, borderColor: currentTheme.statusPresent + '40' }]}
                        onPress={() => adjustSubjectAttendance(slot.subjectId, 1, 0)}
                      >
                        <MaterialIcons name="check" size={15} color={currentTheme.statusPresent} />
                        <Text style={[styles.markPresentText, { color: currentTheme.statusPresent }]}>
                          Mark Present
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.markAbsentBtn, { backgroundColor: 'rgba(255, 82, 82, 0.12)', borderColor: 'rgba(255, 82, 82, 0.35)' }]}
                        onPress={() => adjustSubjectAttendance(slot.subjectId, 0, 1)}
                      >
                        <MaterialIcons name="close" size={15} color="#FF5252" />
                        <Text style={styles.markAbsentText}>Mark Absent</Text>
                      </TouchableOpacity>
                    </View>
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
          {DAYS.find((d) => d.day === selectedDay)?.full} • Period {editingSlot?.period} ({editingSlot?.time})
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listEmptyPeriodText: {
    fontSize: 12,
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
});
