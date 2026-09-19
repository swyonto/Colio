import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { TimetableSlot } from '../../types/campus';
import { triggerHapticFeedback } from '../../utils/haptics';

interface TimetableSummaryCardProps {
  onNavigateToTimetable: () => void;
}

const STORAGE_KEY_CANCELLED = '@colio_cancelled_classes_v1';

export const TimetableSummaryCard: React.FC<TimetableSummaryCardProps> = ({ onNavigateToTimetable }) => {
  const { todayClasses, subjects, adjustSubjectAttendance } = useCampus();
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
      color: Colors.emeraldPrimary,
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
  const previewSlots = todayClasses.slice(startIndex, startIndex + 3);

  // Fallback to first 3 if all slots are done or empty
  const displaySlots = previewSlots.length > 0 ? previewSlots : todayClasses.slice(0, 3);

  return (
    <EmeraldGlassCard onPress={onNavigateToTimetable}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Feather name="calendar" size={17} color={Colors.emeraldPrimary} />
          </View>
          <Text style={[Typography.titleMd, styles.cardTitle]}>Today's Schedule</Text>
          <View style={styles.todayCountPill}>
            <Text style={styles.todayCountText}>{todayClasses.length} Classes</Text>
          </View>
        </View>

        <View style={styles.arrowCircle}>
          <Feather name="arrow-up-right" size={16} color={Colors.emeraldPrimary} />
        </View>
      </View>

      {/* Classes List */}
      {displaySlots.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No classes scheduled for today! 🎉</Text>
        </View>
      ) : (
        <View style={styles.classesList}>
          {displaySlots.map((slot) => {
            const subj = getSubject(slot.subjectId);
            const timing = getSlotTiming(slot);
            const isCancelled = cancelledSlotIds.includes(slot.id);

            return (
              <View
                key={slot.id}
                style={[
                  styles.classItemContainer,
                  isCancelled && styles.classItemCancelled,
                  timing.status === 'NOW' && !isCancelled && styles.classItemActive,
                ]}
              >
                {/* 3.5dp Left Color Stripe */}
                <View
                  style={[
                    styles.colorStripe,
                    { backgroundColor: isCancelled ? Colors.textDisabled : subj.color },
                  ]}
                />

                <View style={styles.classItemContent}>
                  {/* Top Line: Time + Period Badge + Real Timing Indicator */}
                  <View style={styles.slotTopRow}>
                    <Text style={[Typography.labelSm, styles.timeText, isCancelled && styles.textStriked]}>
                      {slot.startTime} – {slot.endTime} • Period {slot.period}
                    </Text>

                    {/* Edge Case: Cancelled Badge or Real-Time Indicator */}
                    {isCancelled ? (
                      <View style={styles.cancelledBadge}>
                        <Feather name="slash" size={9} color={Colors.statusAbsent} />
                        <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
                      </View>
                    ) : (
                      <>
                        {timing.status === 'NOW' && (
                          <View style={styles.nowBadge}>
                            <View style={styles.livePulseDot} />
                            <Text style={styles.nowBadgeText}>NOW</Text>
                          </View>
                        )}
                        {timing.status === 'NEXT' && (
                          <View style={styles.nextBadge}>
                            <Text style={styles.nextBadgeText}>{timing.label}</Text>
                          </View>
                        )}
                        {timing.status === 'SOON' && (
                          <View style={styles.soonBadge}>
                            <Text style={styles.soonBadgeText}>{timing.label}</Text>
                          </View>
                        )}
                        {timing.status === 'COMPLETED' && (
                          <View style={styles.completedBadge}>
                            <Feather name="check" size={10} color={Colors.textMuted} />
                            <Text style={styles.completedBadgeText}>DONE</Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>

                  {/* Middle Line: Subject Title & Code */}
                  <View style={styles.slotNameRow}>
                    <Text
                      style={[
                        Typography.titleSm,
                        styles.subjectName,
                        isCancelled && styles.subjectCancelledText,
                      ]}
                      numberOfLines={1}
                    >
                      {subj.name}
                    </Text>
                    <View
                      style={[
                        styles.codeBadge,
                        { borderColor: isCancelled ? 'rgba(255, 255, 255, 0.1)' : `${subj.color}40` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.codeBadgeText,
                          { color: isCancelled ? Colors.textMuted : subj.color },
                        ]}
                      >
                        {subj.code}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Line: Room, Teacher & Edge Case Action / Attendance Buttons */}
                  <View style={styles.slotBottomRow}>
                    <View style={styles.detailsGroup}>
                      <View style={styles.roomPill}>
                        <Feather name="map-pin" size={11} color={Colors.textMuted} />
                        <Text style={styles.roomText}>{slot.room || subj.room}</Text>
                      </View>
                      <Text style={styles.teacherText} numberOfLines={1}>
                        {slot.teacher || subj.teacher}
                      </Text>
                    </View>

                    {/* Actions: If cancelled, provide safe Undo; otherwise Quick Mark + Cancel toggle */}
                    {isCancelled ? (
                      <TouchableOpacity
                        style={styles.undoCancelBtn}
                        onPress={() => toggleCancelClass(slot.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Feather name="rotate-ccw" size={11} color={Colors.textSecondary} />
                        <Text style={styles.undoCancelText}>Restore</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.actionButtons}>
                        {/* Attendance Buttons: safe from penalty */}
                        <TouchableOpacity
                          style={styles.markPresentBtn}
                          onPress={() => adjustSubjectAttendance(slot.subjectId, 1, 0)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <MaterialIcons name="check" size={13} color={Colors.statusPresent} />
                          <Text style={styles.markPresentText}>Present</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.markAbsentBtn}
                          onPress={() => adjustSubjectAttendance(slot.subjectId, 0, 1)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <MaterialIcons name="close" size={13} color={Colors.statusAbsent} />
                          <Text style={styles.markAbsentText}>Absent</Text>
                        </TouchableOpacity>

                        {/* Edge Case Toggle: Cancel Class */}
                        <TouchableOpacity
                          style={styles.cancelClassIconBtn}
                          onPress={() => toggleCancelClass(slot.id)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="slash" size={12} color={Colors.textMuted} />
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
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: Colors.textPrimary,
  },
  todayCountPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  todayCountText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 230, 118, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classesList: {
    gap: 10,
  },
  classItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#0C0F0D',
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    overflow: 'hidden',
  },
  classItemActive: {
    borderColor: 'rgba(0, 230, 118, 0.45)',
    backgroundColor: '#0E1310',
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
    color: Colors.textMuted,
  },
  textStriked: {
    textDecorationLine: 'line-through',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderWidth: 0.5,
    borderColor: Colors.emeraldPrimary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.emeraldPrimary,
  },
  nowBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.emeraldPrimary,
    letterSpacing: 0.5,
  },
  nextBadge: {
    backgroundColor: 'rgba(0, 176, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: '#00B0FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00B0FF',
    letterSpacing: 0.5,
  },
  soonBadge: {
    backgroundColor: 'rgba(255, 171, 64, 0.15)',
    borderWidth: 0.5,
    borderColor: '#FFAB40',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  soonBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFAB40',
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  completedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 82, 82, 0.18)',
    borderWidth: 0.6,
    borderColor: 'rgba(255, 82, 82, 0.40)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  cancelledBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.statusAbsent,
    letterSpacing: 0.5,
  },
  subjectCancelledText: {
    textDecorationLine: 'line-through',
    color: Colors.textDisabled,
  },
  undoCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  undoCancelText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cancelClassIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectName: {
    color: Colors.textPrimary,
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
  slotBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  detailsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#161917',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roomText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  teacherText: {
    fontSize: 11,
    color: Colors.textMuted,
    maxWidth: 90,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  markPresentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.statusPresentBg,
    borderColor: 'rgba(0, 230, 118, 0.35)',
    borderWidth: 0.5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  markPresentText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.statusPresent,
  },
  markAbsentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.statusAbsentBg,
    borderColor: 'rgba(255, 82, 82, 0.35)',
    borderWidth: 0.5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  markAbsentText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.statusAbsent,
  },
  emptyState: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
