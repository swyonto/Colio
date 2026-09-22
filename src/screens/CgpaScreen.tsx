import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassInput } from '../components/common/GlassInput';
import { ProgressBar } from '../components/common/ProgressBar';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';

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
  const { currentTheme } = useCampus();
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
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Header */}
      <View style={[styles.headerBar, { backgroundColor: currentTheme.bgCardSecondary, borderBottomColor: currentTheme.borderGlass }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: currentTheme.bgCard }]}>
            <Feather name="arrow-left" size={18} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
            CGPA Calculator
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.textMuted }]}>
            Weighted Credit Grade Estimator
          </Text>
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
            <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
              CUMULATIVE GRADE POINT AVERAGE
            </Text>
            <Text style={[Typography.displayXl, styles.cgpaValue, { color: currentTheme.primary }]}>
              {currentCgpa}
            </Text>

            <View style={styles.badgeRow}>
              <View style={[styles.targetBadge, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '35' }]}>
                <Feather name="target" size={12} color={currentTheme.primary} />
                <Text style={[styles.targetBadgeText, { color: currentTheme.primary }]}>Target: {targetCgpa}</Text>
              </View>
              <Text style={[styles.creditsNote, { color: currentTheme.textMuted }]}>
                {totalCredits} Total Credits Earned Across {semesters.length} Semesters
              </Text>
            </View>

            <View style={{ width: '100%', marginTop: 8 }}>
              <ProgressBar percentage={(parseFloat(currentCgpa) / 10) * 100} height={8} color={currentTheme.primary} />
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Semester Scores */}
        <View style={styles.semesterList}>
          <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>SEMESTER SGPA BREAKDOWN</Text>

          {semesters.map((s, idx) => (
            <View
              key={s.sem}
              style={[styles.semCard, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>{s.sem}</Text>
                <Text style={[styles.semCredits, { color: currentTheme.textMuted }]}>{s.credits} Credits</Text>
              </View>

              <View style={styles.sgpaInputWrap}>
                <Text style={[styles.sgpaLabel, { color: currentTheme.textSecondary }]}>SGPA:</Text>
                <TextInput
                  value={s.sgpa.toString()}
                  onChangeText={(val) => updateSemesterSgpa(idx, val)}
                  keyboardType="numeric"
                  style={[styles.inlineInput, { color: currentTheme.primary }]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Target Simulator */}
        <EmeraldGlassCard>
          <Text style={[Typography.overline, { color: currentTheme.textMuted, marginBottom: 8 }]}>
            TARGET SIMULATOR
          </Text>
          <GlassInput
            label="Desired Target CGPA"
            value={targetCgpa}
            onChangeText={setTargetCgpa}
            keyboardType="numeric"
          />
          <Text style={[Typography.bodySm, { color: currentTheme.textMuted, marginTop: 4, fontSize: 11 }]}>
            Calculates required minimum SGPA in remaining semesters to achieve your target graduation honors.
          </Text>
        </EmeraldGlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.6,
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.6,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  creditsNote: {
    fontSize: 11,
  },
  semesterList: {
    gap: 10,
  },
  semCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.7,
  },
  semCredits: {
    fontSize: 11,
  },
  sgpaInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  sgpaLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  inlineInput: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
});
