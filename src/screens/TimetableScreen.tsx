import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { TimetableSlot } from '../types/campus';

const PERIODS = [
  { period: 1, time: '08:30 – 09:30' },
  { period: 2, time: '09:30 – 10:30' },
  { period: 3, time: '10:30 – 11:30' },
  { period: 4, time: '11:30 – 12:30' },
  { period: 5, time: '12:30 – 01:30' }, // Lunch / Break
  { period: 6, time: '01:30 – 02:30' },
  { period: 7, time: '02:30 – 03:30' },
  { period: 8, time: '03:30 – 04:30' },
  { period: 9, time: '04:30 – 05:30' },
];

const DAYS = [
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
  { day: 6, label: 'Sat', full: 'Saturday' },
];

export const TimetableScreen: React.FC = () => {
  const { timetable, subjects, timetableViewMode, setTimetableViewMode, adjustSubjectAttendance, currentTheme } = useCampus();
  const [selectedDay, setSelectedDay] = useState(1);

  const getSubject = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId) || {
      name: 'Class Session',
      code: 'CLASS',
      color: Colors.emeraldPrimary,
      room: 'TBA',
      teacher: 'Faculty',
    };
  };

  const daySlots = timetable.filter((slot) => slot.dayOfWeek === selectedDay);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Controls: Day Selector & Grid/List View Mode Switcher (Section 8.1) */}
      <View style={styles.topControlBar}>
        {/* Days Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {DAYS.map((d) => {
            const isSelected = selectedDay === d.day;
            return (
              <TouchableOpacity
                key={d.day}
                style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                onPress={() => setSelectedDay(d.day)}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* View Mode Toggle: Grid vs List */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeButton, timetableViewMode === 'list' && styles.modeButtonActive]}
            onPress={() => setTimetableViewMode('list')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather
              name="list"
              size={15}
              color={timetableViewMode === 'list' ? '#002114' : Colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, timetableViewMode === 'grid' && styles.modeButtonActive]}
            onPress={() => setTimetableViewMode('grid')}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather
              name="grid"
              size={15}
              color={timetableViewMode === 'grid' ? '#002114' : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Day Header */}
        <View style={styles.activeDayHeader}>
          <Text style={[Typography.titleLg, { color: Colors.textPrimary }]}>
            {DAYS.find((d) => d.day === selectedDay)?.full} Schedule
          </Text>
          <Text style={styles.periodsCountText}>9 Official Periods (08:30 – 17:30)</Text>
        </View>

        {/* SECTION 8.2: GRID VIEW */}
        {timetableViewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {PERIODS.map(({ period, time }) => {
              const slot = daySlots.find((s) => s.period === period);
              const subj = slot ? getSubject(slot.subjectId) : null;
              const isBreakPeriod = period === 5;

              return (
                <View key={period} style={styles.gridSlotRow}>
                  {/* Period Time Column */}
                  <View style={styles.gridTimeColumn}>
                    <Text style={styles.gridPeriodNumber}>P{period}</Text>
                    <Text style={styles.gridTimeText}>{time.split(' – ')[0]}</Text>
                  </View>

                  {/* Period Card */}
                  {slot && subj ? (
                    <View style={styles.gridSlotCard}>
                      {/* 3dp Colored Left Stripe */}
                      <View style={[styles.coloredStripe, { backgroundColor: subj.color }]} />

                      <View style={styles.gridSlotInner}>
                        <View style={styles.gridTitleRow}>
                          <Text style={[Typography.titleSm, styles.gridSubjCode, { color: subj.color }]}>
                            {subj.code}
                          </Text>
                          {/* Room Badge */}
                          <View style={styles.gridRoomBadge}>
                            <Text style={styles.gridRoomText}>{slot.room || subj.room}</Text>
                          </View>
                        </View>

                        <Text style={[Typography.bodySm, styles.gridSubjName]} numberOfLines={1}>
                          {subj.name}
                        </Text>

                        <Text style={styles.gridTeacherText} numberOfLines={1}>
                          {slot.teacher || subj.teacher}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    /* Empty Period Slot with "—" in dark charcoal */
                    <View style={styles.gridEmptySlot}>
                      <Text style={styles.gridEmptyDash}>
                        {isBreakPeriod ? '☕ Recess / Lunch Break' : '— Free Slot —'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          /* LIST VIEW */
          <View style={styles.listContainer}>
            {PERIODS.map(({ period, time }) => {
              const slot = daySlots.find((s) => s.period === period);
              const subj = slot ? getSubject(slot.subjectId) : null;
              const isBreakPeriod = period === 5;

              if (!slot) {
                return (
                  <View key={period} style={styles.listEmptyRow}>
                    <Text style={styles.listEmptyPeriod}>Period {period} ({time})</Text>
                    <Text style={styles.listEmptyNote}>
                      {isBreakPeriod ? '☕ Recess / Free' : 'No class'}
                    </Text>
                  </View>
                );
              }

              return (
                <View key={period} style={styles.listItemCard}>
                  {/* 3dp Left Colored Stripe */}
                  <View style={[styles.coloredStripe, { backgroundColor: subj!.color }]} />

                  <View style={styles.listItemContent}>
                    {/* Period Time & Code Badge */}
                    <View style={styles.listHeaderRow}>
                      <Text style={styles.listTimeBadge}>
                        Period {period} • {time}
                      </Text>
                      <View style={[styles.codePill, { borderColor: `${subj!.color}50` }]}>
                        <Text style={[styles.codePillText, { color: subj!.color }]}>
                          {subj!.code}
                        </Text>
                      </View>
                    </View>

                    {/* Subject Name */}
                    <Text style={[Typography.titleMd, styles.listSubjName]} numberOfLines={1}>
                      {subj!.name}
                    </Text>

                    {/* Room & Teacher */}
                    <View style={styles.listMetaRow}>
                      <View style={styles.roomPill}>
                        <Feather name="map-pin" size={11} color={Colors.emeraldPrimary} />
                        <Text style={styles.roomPillText}>{slot.room || subj!.room}</Text>
                      </View>
                      <Text style={styles.teacherNameText}>{slot.teacher || subj!.teacher}</Text>
                    </View>

                    {/* Mark Attendance Row */}
                    <View style={styles.attendanceActionRow}>
                      <TouchableOpacity
                        style={styles.markPresentBtn}
                        onPress={() => adjustSubjectAttendance(slot.subjectId, 1, 0)}
                      >
                        <MaterialIcons name="check" size={14} color={Colors.statusPresent} />
                        <Text style={styles.markPresentText}>Mark Present</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.markAbsentBtn}
                        onPress={() => adjustSubjectAttendance(slot.subjectId, 0, 1)}
                      >
                        <MaterialIcons name="close" size={14} color={Colors.statusAbsent} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  topControlBar: {
    backgroundColor: '#0A0E0C',
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  daysScroll: {
    gap: 6,
    flexGrow: 1,
  },
  dayButton: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#131714',
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayButtonActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.22)',
    borderColor: Colors.emeraldPrimary,
  },
  dayText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  dayTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#121614',
    borderRadius: 14,
    padding: 3,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginLeft: 8,
  },
  modeButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 11,
  },
  modeButtonActive: {
    backgroundColor: Colors.emeraldPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  activeDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  periodsCountText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  // Grid Styles
  gridContainer: {
    gap: 8,
  },
  gridSlotRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  gridTimeColumn: {
    width: 48,
    alignItems: 'center',
  },
  gridPeriodNumber: {
    color: Colors.emeraldHighlight,
    fontSize: 12,
    fontWeight: '700',
  },
  gridTimeText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  gridSlotCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F1210',
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  coloredStripe: {
    width: 3.5,
  },
  gridSlotInner: {
    flex: 1,
    padding: 10,
    gap: 2,
  },
  gridTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridSubjCode: {
    fontWeight: '700',
  },
  gridRoomBadge: {
    backgroundColor: '#161917',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  gridRoomText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  gridSubjName: {
    color: Colors.textPrimary,
  },
  gridTeacherText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  gridEmptySlot: {
    flex: 1,
    backgroundColor: '#0A0C0B',
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridEmptyDash: {
    color: Colors.textDisabled,
    fontSize: 11,
  },
  // List Styles
  listContainer: {
    gap: 10,
  },
  listItemCard: {
    flexDirection: 'row',
    backgroundColor: '#0F1210',
    borderRadius: 14,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  listItemContent: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTimeBadge: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  codePill: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 0.6,
  },
  codePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listSubjName: {
    color: Colors.textPrimary,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#161A17',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  roomPillText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  teacherNameText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  attendanceActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  markPresentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.statusPresentBg,
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.35)',
    paddingVertical: 7,
  },
  markPresentText: {
    color: Colors.statusPresent,
    fontWeight: '600',
    fontSize: 11,
  },
  markAbsentBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.statusAbsentBg,
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 82, 82, 0.35)',
    paddingVertical: 7,
  },
  markAbsentText: {
    color: Colors.statusAbsent,
    fontWeight: '600',
    fontSize: 11,
  },
  listEmptyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#090B0A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  listEmptyPeriod: {
    color: Colors.textDisabled,
    fontSize: 11,
  },
  listEmptyNote: {
    color: Colors.textDisabled,
    fontSize: 11,
  },
});
