import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { TimetableSlot } from '../../types/campus';
import { triggerHapticFeedback } from '../../utils/haptics';

interface TimetableSummaryCardProps {
  onNavigateToTimetable: () => void;
}

const STORAGE_KEY_CANCELLED = '@colio_cancelled_classes_v1';

export const TimetableSummaryCard: React.FC<TimetableSummaryCardProps> = ({ onNavigateToTimetable }) => {
  const { todayClasses, subjects, adjustSubjectAttendance, currentTheme } = useCampus();
  const [cancelledSlotIds, setCancelledSlotIds] = useState<string[]>([]);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Keep current time updated every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);

    // Load cancelled classes
    AsyncStorage.getItem(STORAGE_KEY_CANCELLED).then((res) => {
      if (res) {
        try {
          setCancelledSlotIds(JSON.parse(res));
        } catch {}
      }
    });

    return () => clearInterval(timer);
  }, []);

  const toggleCancelClass = (slotId: string) => {
    triggerHapticFeedback('medium');
    setCancelledSlotIds((prev) => {
      const updated = prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId];
      AsyncStorage.setItem(STORAGE_KEY_CANCELLED, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const getSubject = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId) || {
      name: 'Class Session',
      code: 'CLASS',
      color: currentTheme.primary,
      room: 'TBA',
      teacher: 'Faculty',
    };
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Determine timing status for each slot relative to real current clock
  const getSlotTiming = (slot: TimetableSlot) => {
    const startM = parseTimeToMinutes(slot.startTime);
    const endM = parseTimeToMinutes(slot.endTime);

    if (currentTimeMinutes >= startM && currentTimeMinutes < endM) {
      return { status: 'NOW', label: 'NOW', diffMin: 0 };
    }
    if (currentTimeMinutes < startM) {
      const diff = startM - currentTimeMinutes;
      if (diff <= 60) {
        return { status: 'NEXT', label: `IN ${diff}m`, diffMin: diff };
      }
      if (diff <= 120) {
        const hours = Math.round(diff / 60);
        return { status: 'SOON', label: `IN ~${hours}h`, diffMin: diff };
      }
      return { status: 'UPCOMING', label: slot.startTime, diffMin: diff };
    }
    return { status: 'COMPLETED', label: 'DONE', diffMin: -1 };
  };

  // Find active slots: prioritize showing current/upcoming classes
  const activeIndex = todayClasses.findIndex((slot) => {
    const endM = parseTimeToMinutes(slot.endTime);
    return currentTimeMinutes < endM;
  });

  const startIndex = activeIndex >= 0 ? Math.max(0, activeIndex) : 0;
  const displaySlots = todayClasses.slice(startIndex, startIndex + 3);

  const handleMarkAttendance = (subjectId: string, type: 'present' | 'absent') => {
    triggerHapticFeedback('light');
    adjustSubjectAttendance(subjectId, type === 'present' ? 1 : 0, type === 'absent' ? 1 : 0);
  };

  return (
    <EmeraldGlassCard onPress={onNavigateToTimetable}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '18' }]}>
            <Feather name="calendar" size={16} color={currentTheme.primary} />
          </View>
          <Text style={[Typography.titleMd, { color: currentTheme.textPrimary }]}>Today's Schedule</Text>
          <View style={[styles.todayCountPill, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
            <Text style={[styles.todayCountText, { color: currentTheme.textMuted }]}>
              {todayClasses.length} {todayClasses.length === 1 ? 'Period' : 'Periods'}
            </Text>
          </View>
        </View>

        <View style={[styles.arrowCircle, { backgroundColor: currentTheme.primary + '14' }]}>
          <Feather name="arrow-up-right" size={16} color={currentTheme.primary} />
        </View>
      </View>

      {/* Class Slots */}
      {displaySlots.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="coffee" size={24} color={currentTheme.textMuted} />
          <Text style={[Typography.bodyMd, styles.emptyText, { color: currentTheme.textMuted }]}>
            No more classes scheduled for today!
          </Text>
        </View>
      ) : (
        <View style={styles.classesList}>
          {displaySlots.map((slot) => {
            const subj = getSubject(slot.subjectId);
            const timing = getSlotTiming(slot);
            const isCancelled = cancelledSlotIds.includes(slot.id);
            const isLive = timing.status === 'NOW' && !isCancelled;

            return (
              <View
                key={slot.id}
                style={[
                  styles.classItemContainer,
                  {
                    backgroundColor: isLive ? currentTheme.bgCardSecondary : currentTheme.bgInner,
                    borderColor: isLive ? currentTheme.primary + '60' : currentTheme.borderGlass,
                  },
                  isCancelled && styles.classItemCancelled,
                ]}
              >
                {/* Subject Color Stripe Indicator */}
                <View style={[styles.colorStripe, { backgroundColor: isCancelled ? '#FF5252' : subj.color }]} />

                <View style={styles.classItemContent}>
                  {/* Top: Time and Timing Status Badge */}
                  <View style={styles.slotTopRow}>
                    <Text
                      style={[
                        Typography.labelSm,
                        styles.timeText,
                        { color: currentTheme.textMuted },
                        isCancelled && styles.textStriked,
                      ]}
                    >
                      {slot.startTime} – {slot.endTime}
                    </Text>

                    {isCancelled ? (
                      <View style={styles.cancelledBadge}>
                        <Text style={styles.cancelledText}>CANCELLED</Text>
                      </View>
                    ) : isLive ? (
                      <View style={[styles.nowBadge, { backgroundColor: currentTheme.primary + '22', borderColor: currentTheme.primary }]}>
                        <View style={[styles.livePulseDot, { backgroundColor: currentTheme.primary }]} />
                        <Text style={[styles.nowBadgeText, { color: currentTheme.primary }]}>IN PROGRESS</Text>
                      </View>
                    ) : timing.status === 'NEXT' ? (
                      <View style={[styles.nextBadge, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '40' }]}>
                        <Text style={[styles.nextBadgeText, { color: currentTheme.primary }]}>{timing.label}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Middle: Subject Code & Name */}
                  <View style={styles.slotNameRow}>
                    <View
                      style={[
                        styles.codeBadge,
                        {
                          backgroundColor: `${subj.color}20`,
                          borderColor: `${subj.color}45`,
                        },
                      ]}
                    >
                      <Text style={[styles.codeBadgeText, { color: subj.color }]}>
                        {subj.code}
                      </Text>
                    </View>

                    <Text
                      style={[
                        Typography.titleSm,
                        styles.subjectName,
                        { color: currentTheme.textPrimary },
                        isCancelled && styles.textStriked,
                      ]}
                      numberOfLines={1}
                    >
                      {subj.name}
                    </Text>

                    {/* Room Indicator on Top Right */}
                    <View style={styles.topRightGroup}>
                      <View style={[styles.roomPill, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '35' }]}>
                        <MaterialIcons name="meeting-room" size={10} color={currentTheme.primary} />
                        <Text style={[styles.roomText, { color: currentTheme.primary }]}>{slot.room}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Bottom: Faculty & Quick Attendance Buttons */}
                  <View style={styles.slotBottomRow}>
                    <View style={styles.teacherGroup}>
                      <Feather name="user" size={11} color={currentTheme.textMuted} />
                      <Text style={[styles.teacherText, { color: currentTheme.textMuted }]} numberOfLines={1}>
                        {slot.teacher}
                      </Text>
                    </View>

                    {/* Quick Attendance Logging Actions */}
                    {!isCancelled && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.markPresentBtn, { backgroundColor: currentTheme.statusPresentBg, borderColor: currentTheme.primary + '40' }]}
                          onPress={() => handleMarkAttendance(subj.id, 'present')}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="check" size={11} color={currentTheme.statusPresent} />
                          <Text style={[styles.actionBtnText, { color: currentTheme.statusPresent }]}>
                            Present
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.markAbsentBtn}
                          onPress={() => handleMarkAttendance(subj.id, 'absent')}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="x" size={11} color="#FF5252" />
                          <Text style={[styles.actionBtnText, { color: '#FF5252' }]}>
                            Absent
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </EmeraldGlassCard>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCountPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  todayCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classesList: {
    gap: 10,
  },
  classItemContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 0.6,
    overflow: 'hidden',
  },
  classItemCancelled: {
    opacity: 0.7,
    borderColor: 'rgba(255, 82, 82, 0.25)',
  },
  colorStripe: {
    width: 3.5,
  },
  classItemContent: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
  },
  textStriked: {
    textDecorationLine: 'line-through',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  nowBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  nextBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cancelledText: {
    fontSize: 9,
    color: '#FF5252',
    fontWeight: '700',
  },
  slotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectName: {
    flex: 1,
  },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  teacherGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  roomText: {
    fontSize: 10,
    fontWeight: '700',
  },
  teacherText: {
    fontSize: 11,
    maxWidth: 140,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  markPresentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 0.5,
  },
  markAbsentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 82, 82, 0.14)',
    borderColor: 'rgba(255, 82, 82, 0.35)',
    borderWidth: 0.5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
