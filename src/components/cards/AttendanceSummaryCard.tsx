import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { ProgressBar } from '../common/ProgressBar';
import { GlassDialog } from '../common/GlassDialog';
import { GlassInput } from '../common/GlassInput';
import { EmeraldButton } from '../common/Buttons';
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
    currentTheme,
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
            <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '18' }]}>
              <MaterialIcons name="fact-check" size={16} color={currentTheme.primary} />
            </View>
            <Text style={[Typography.titleMd, { color: currentTheme.textPrimary }]}>Attendance Card</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleOpenEdit}
              style={[styles.iconEditBtn, { backgroundColor: currentTheme.bgCardSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="edit-2" size={14} color={currentTheme.textMuted} />
            </TouchableOpacity>
            <View style={[styles.arrowCircle, { backgroundColor: currentTheme.primary + '14' }]}>
              <Feather name="arrow-up-right" size={16} color={currentTheme.primary} />
            </View>
          </View>
        </View>

        {/* Stats Row with Bold Percentage and Target Met Chip */}
        <View style={styles.cardMainRow}>
          <View style={styles.statsLeftColumn}>
            <Text style={[Typography.displayLg, { color: currentTheme.textPrimary }]}>
              {overallAttendance}%
            </Text>
            <Text style={[styles.fractionLabel, { color: currentTheme.textMuted }]}>
              {totalPresent} of {totalClasses} classes attended
            </Text>
          </View>

          {/* Criteria Status Pill */}
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: isTargetMet ? currentTheme.statusPresentBg : 'rgba(255, 82, 82, 0.14)',
                borderColor: isTargetMet ? currentTheme.primary + '40' : 'rgba(255, 82, 82, 0.35)',
              },
            ]}
          >
            <Feather
              name={isTargetMet ? 'check-circle' : 'alert-circle'}
              size={12}
              color={isTargetMet ? currentTheme.primary : '#FF5252'}
            />
            <Text
              style={[
                styles.statusChipText,
                { color: isTargetMet ? currentTheme.primary : '#FF5252' },
              ]}
            >
              {isTargetMet ? `${attendanceCriteria}% Target • Met ✓` : `Below ${attendanceCriteria}% Target`}
            </Text>
          </View>
        </View>

        {/* Clean Line Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar percentage={overallAttendance} height={7} target={attendanceCriteria} />
        </View>

        {/* Three Micro-Metrics Row */}
        <View style={[styles.metricsThreeColRow, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
          <View style={styles.metricCol}>
            <Text style={[styles.metricColLabel, { color: currentTheme.textMuted }]}>ATTENDED</Text>
            <Text style={[styles.metricColValue, { color: currentTheme.primary }]}>
              {totalPresent}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: currentTheme.borderGlass }]} />

          <View style={styles.metricCol}>
            <Text style={[styles.metricColLabel, { color: currentTheme.textMuted }]}>TOTAL CLASSES</Text>
            <Text style={[styles.metricColValue, { color: currentTheme.textPrimary }]}>
              {totalClasses}
            </Text>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: currentTheme.borderGlass }]} />

          <View style={styles.metricCol}>
            <Text style={[styles.metricColLabel, { color: currentTheme.textMuted }]}>CAN MISS</Text>
            <Text
              style={[
                styles.metricColValue,
                { color: isTargetMet ? currentTheme.primary : '#FF5252' },
              ]}
            >
              {classesCanMiss}
            </Text>
          </View>
        </View>
      </EmeraldGlassCard>

      {/* Quick Edit Dialog */}
      <GlassDialog
        visible={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Subject Attendance"
      >
        <Text style={[Typography.bodySm, styles.dialogSubtitle, { color: currentTheme.textMuted }]}>
          Select subject to manually adjust attended or absent classes:
        </Text>

        <View style={styles.subjectChipsScroll}>
          {subjects.map((s) => {
            const isSelected = s.id === selectedSubjectId;
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.subjectSelectChip,
                  { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                  isSelected && { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary },
                ]}
                onPress={() => {
                  setSelectedSubjectId(s.id);
                  setEditPresent(s.present.toString());
                  setEditAbsent(s.absent.toString());
                }}
              >
                <Text
                  style={[
                    styles.subjectSelectChipText,
                    { color: isSelected ? currentTheme.primary : currentTheme.textMuted },
                    isSelected && styles.subjectSelectChipTextActive,
                  ]}
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
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    gap: 2,
  },
  fractionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
    borderWidth: 0.6,
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
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 0.6,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricColLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricColValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricDivider: {
    width: 0.6,
    height: 22,
  },
  dialogSubtitle: {
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
    borderWidth: 0.7,
  },
  subjectSelectChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subjectSelectChipTextActive: {
    fontWeight: '700',
  },
});
