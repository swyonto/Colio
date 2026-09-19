import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { ProgressBar } from '../common/ProgressBar';
import { CircularProgress } from '../common/CircularProgress';
import { GlassDialog } from '../common/GlassDialog';
import { GlassInput } from '../common/GlassInput';
import { EmeraldButton } from '../common/Buttons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';

interface AttendanceSummaryCardProps {
  onNavigateToAttend: () => void;
}

export const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({ onNavigateToAttend }) => {
  const {
    overallAttendance,
    totalPresent,
    totalClasses,
    classesCanMiss,
    classesNeeded,
    attendanceCriteria = 68,
    subjects,
    setSubjectAttendance,
  } = useCampus();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [editPresent, setEditPresent] = useState('');
  const [editAbsent, setEditAbsent] = useState('');

  const isTargetMet = overallAttendance >= attendanceCriteria;

  const handleOpenEdit = () => {
    const subj = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
    if (subj) {
      setSelectedSubjectId(subj.id);
      setEditPresent(subj.present.toString());
      setEditAbsent(subj.absent.toString());
    }
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const p = parseInt(editPresent, 10);
    const a = parseInt(editAbsent, 10);
    if (!isNaN(p) && !isNaN(a) && selectedSubjectId) {
      setSubjectAttendance(selectedSubjectId, p, a);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <EmeraldGlassCard
        statusVariant={isTargetMet ? 'emerald' : 'rose'}
        onPress={onNavigateToAttend}
        onLongPress={handleOpenEdit}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="fact-check" size={16} color={Colors.emeraldPrimary} />
            </View>
            <Text style={[Typography.titleMd, styles.cardTitle]}>Attendance Card</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleOpenEdit}
              style={styles.iconEditBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="edit-2" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.arrowCircle}>
              <Feather name="arrow-up-right" size={16} color={Colors.emeraldPrimary} />
            </View>
          </View>
        </View>

        {/* Stats Row with 87% and Circle Progress Bar */}
        <View style={styles.cardMainRow}>
          <View style={styles.statsLeftColumn}>
            <Text style={[Typography.displayLg, styles.percentageNumber]}>
              {overallAttendance}%
            </Text>

            {/* Criteria Status Pill */}
            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor: isTargetMet ? Colors.statusPresentBg : Colors.statusAbsentBg,
                  borderColor: isTargetMet ? 'rgba(0, 230, 118, 0.35)' : 'rgba(255, 82, 82, 0.35)',
                },
              ]}
            >
              <MaterialIcons
                name={isTargetMet ? 'verified' : 'warning'}
                size={13}
                color={isTargetMet ? Colors.statusPresent : Colors.statusAbsent}
              />
              <Text
                style={[
                  styles.statusChipText,
                  { color: isTargetMet ? Colors.statusPresent : Colors.statusAbsent },
                ]}
              >
                {isTargetMet ? `${attendanceCriteria}% Target • Met ✓` : `Below ${attendanceCriteria}% Target`}
              </Text>
            </View>
          </View>

          {/* Circle progress bar with red yellow green */}
          <View style={styles.circularWrapper}>
            <CircularProgress
              percentage={overallAttendance}
              size={76}
              strokeWidth={7}
              criteria={attendanceCriteria}
            />
          </View>
        </View>

        {/* Horizontal Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar percentage={overallAttendance} height={7} target={attendanceCriteria} />
        </View>

        {/* 3 Metric Columns: Classes Attended | Total Classes | Can be Missed */}
        <View style={styles.metricsThreeColRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricColLabel}>ATTENDED</Text>
            <Text style={[styles.metricColValue, { color: Colors.emeraldPrimary }]}>{totalPresent}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricColLabel}>TOTAL</Text>
            <Text style={[styles.metricColValue, { color: Colors.textPrimary }]}>{totalClasses}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCol}>
            <Text style={styles.metricColLabel}>
              {isTargetMet ? 'CAN BE MISSED' : 'NEEDED'}
            </Text>
            <Text
              style={[
                styles.metricColValue,
                { color: isTargetMet ? Colors.emeraldHighlight : Colors.statusAbsent },
              ]}
            >
              {isTargetMet ? `${classesCanMiss}` : `${classesNeeded}`}
            </Text>
          </View>
        </View>
      </EmeraldGlassCard>

      {/* Quick Attendance Editor Dialog */}
      <GlassDialog
        visible={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Subject Attendance"
      >
        <Text style={[Typography.bodySm, styles.dialogSubtitle]}>
          Adjust recorded present and absent classes for accurate tracking.
        </Text>

        {/* Subject Selector Chips */}
        <View style={styles.subjectChipsScroll}>
          {subjects.map((s) => {
            const isSelected = s.id === selectedSubjectId;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.subjectSelectChip, isSelected && styles.subjectSelectChipActive]}
                onPress={() => {
                  setSelectedSubjectId(s.id);
                  setEditPresent(s.present.toString());
                  setEditAbsent(s.absent.toString());
                }}
              >
                <Text
                  style={[styles.subjectSelectChipText, isSelected && styles.subjectSelectChipTextActive]}
                >
                  {s.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <GlassInput
          label="Present Classes Count"
          value={editPresent}
          onChangeText={setEditPresent}
          keyboardType="numeric"
        />

        <GlassInput
          label="Absent Classes Count"
          value={editAbsent}
          onChangeText={setEditAbsent}
          keyboardType="numeric"
        />

        <View style={{ marginTop: 14 }}>
          <EmeraldButton label="Save Changes" onPress={handleSaveEdit} />
        </View>
      </GlassDialog>
    </>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconEditBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#161917',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 230, 118, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsLeftColumn: {
    flex: 1,
    gap: 6,
  },
  percentageNumber: {
    color: Colors.textPrimary,
  },
  circularWrapper: {
    marginLeft: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 0.6,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressContainer: {
    marginVertical: 10,
  },
  metricsThreeColRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D0A',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricColLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  metricColValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricDivider: {
    width: 0.6,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dialogSubtitle: {
    color: Colors.textMuted,
    marginBottom: 12,
  },
  subjectChipsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  subjectSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#141815',
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  subjectSelectChipActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.18)',
    borderColor: Colors.emeraldPrimary,
  },
  subjectSelectChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  subjectSelectChipTextActive: {
    color: Colors.textPrimary,
  },
});
