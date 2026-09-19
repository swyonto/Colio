import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassInput } from '../components/common/GlassInput';
import { ProgressBar } from '../components/common/ProgressBar';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface SemesterRecord {
  sem: string;
  sgpa: number;
  credits: number;
}

const INITIAL_SEMS: SemesterRecord[] = [
  { sem: 'Semester 1', sgpa: 8.6, credits: 21 },
  { sem: 'Semester 2', sgpa: 8.9, credits: 22 },
  { sem: 'Semester 3', sgpa: 8.4, credits: 23 },
  { sem: 'Semester 4', sgpa: 9.1, credits: 22 },
];

export const CgpaScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [semesters, setSemesters] = useState<SemesterRecord[]>(INITIAL_SEMS);
  const [targetCgpa, setTargetCgpa] = useState('9.0');

  // Compute CGPA: SUM(sgpa * credits) / SUM(credits)
  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const weightedSum = semesters.reduce((sum, s) => sum + s.sgpa * s.credits, 0);
  const currentCgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';

  const updateSemesterSgpa = (index: number, newSgpaStr: string) => {
    const val = parseFloat(newSgpaStr);
    setSemesters((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], sgpa: isNaN(val) ? 0 : Math.min(10, Math.max(0, val)) };
      return copy;
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleLg, styles.headerTitle]}>CGPA Calculator</Text>
          <Text style={styles.headerSubtitle}>Weighted Credit Grade Estimator</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cumulative Grade Gauge Card */}
        <EmeraldGlassCard>
          <View style={styles.gaugeContent}>
            <Text style={[Typography.overline, { color: Colors.textMuted }]}>CUMULATIVE GRADE POINT AVERAGE</Text>
            <Text style={[Typography.displayXl, styles.cgpaValue]}>{currentCgpa}</Text>

            <View style={styles.badgeRow}>
              <View style={styles.targetBadge}>
                <Feather name="target" size={12} color={Colors.emeraldPrimary} />
                <Text style={styles.targetBadgeText}>Target: {targetCgpa}</Text>
              </View>
              <Text style={styles.creditsNote}>
                {totalCredits} Total Credits Earned Across 4 Semesters
              </Text>
            </View>

            <View style={{ width: '100%', marginTop: 8 }}>
              <ProgressBar percentage={(parseFloat(currentCgpa) / 10) * 100} height={8} />
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Semester Scores */}
        <View style={styles.semesterList}>
          <Text style={[Typography.overline, { color: Colors.textMuted }]}>SEMESTER SGPA BREAKDOWN</Text>

          {semesters.map((s, idx) => (
            <View key={s.sem} style={styles.semCard}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.titleSm, styles.semTitle]}>{s.sem}</Text>
                <Text style={styles.semCredits}>{s.credits} Credits</Text>
              </View>

              <View style={styles.sgpaInputWrap}>
                <Text style={styles.sgpaLabel}>SGPA:</Text>
                <GlassInput
                  label=""
                  value={s.sgpa.toString()}
                  onChangeText={(val) => updateSemesterSgpa(idx, val)}
                  keyboardType="numeric"
                  style={styles.inlineInput}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 12,
    backgroundColor: '#0A0E0C',
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#131714',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  gaugeContent: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  cgpaValue: {
    color: Colors.emeraldPrimary,
    fontWeight: '800',
  },
  badgeRow: {
    alignItems: 'center',
    gap: 4,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  targetBadgeText: {
    color: Colors.emeraldPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  creditsNote: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  semesterList: {
    gap: 10,
  },
  semCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1210',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  semTitle: {
    color: Colors.textPrimary,
  },
  semCredits: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  sgpaInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  sgpaLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  inlineInput: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.emeraldHighlight,
  },
});
