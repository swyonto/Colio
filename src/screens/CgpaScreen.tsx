import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassInput } from '../components/common/GlassInput';
import { ProgressBar } from '../components/common/ProgressBar';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';

interface SemesterRecord {
  id: string;
  sem: string;
  sgpa: number;
  credits: number;
}

const STORAGE_KEYS = {
  SEMESTERS: '@colio_cgpa_semesters_v2',
  TARGET: '@colio_cgpa_target_v2',
};

const INITIAL_SEMS: SemesterRecord[] = [
  { id: 'sem-1', sem: 'Semester 1', sgpa: 8.6, credits: 21 },
  { id: 'sem-2', sem: 'Semester 2', sgpa: 8.9, credits: 22 },
  { id: 'sem-3', sem: 'Semester 3', sgpa: 8.4, credits: 23 },
  { id: 'sem-4', sem: 'Semester 4', sgpa: 9.1, credits: 22 },
];

export const CgpaScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { currentTheme } = useCampus();
  const [semesters, setSemesters] = useState<SemesterRecord[]>(INITIAL_SEMS);
  const [targetCgpa, setTargetCgpa] = useState('9.0');
  const [totalDegreeSems, setTotalDegreeSems] = useState(8);

  // Load persisted CGPA data on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedSems, savedTarget] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SEMESTERS),
          AsyncStorage.getItem(STORAGE_KEYS.TARGET),
        ]);
        if (savedSems) {
          const parsed = JSON.parse(savedSems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSemesters(parsed);
          }
        }
        if (savedTarget) {
          setTargetCgpa(savedTarget);
        }
      } catch (err) {
        console.warn('Error hydrating CGPA state:', err);
      }
    })();
  }, []);

  // Save changes to AsyncStorage
  const persistSemesters = (updated: SemesterRecord[]) => {
    setSemesters(updated);
    AsyncStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(updated)).catch(() => {});
  };

  const handleTargetChange = (val: string) => {
    setTargetCgpa(val);
    AsyncStorage.setItem(STORAGE_KEYS.TARGET, val).catch(() => {});
  };

  // Compute Current CGPA: SUM(sgpa * credits) / SUM(credits)
  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const weightedSum = semesters.reduce((sum, s) => sum + s.sgpa * s.credits, 0);
  const currentCgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';

  const updateSemesterSgpa = (index: number, newSgpaStr: string) => {
    const val = parseFloat(newSgpaStr);
    const updated = semesters.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, sgpa: isNaN(val) ? 0 : Math.min(10, Math.max(0, val)) };
    });
    persistSemesters(updated);
  };

  const updateSemesterCredits = (index: number, newCreditsStr: string) => {
    const val = parseInt(newCreditsStr, 10);
    const updated = semesters.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, credits: isNaN(val) ? 1 : Math.max(1, Math.min(40, val)) };
    });
    persistSemesters(updated);
  };

  const handleAddSemester = () => {
    const nextNum = semesters.length + 1;
    const newSem: SemesterRecord = {
      id: `sem-${Date.now()}`,
      sem: `Semester ${nextNum}`,
      sgpa: 8.5,
      credits: 22,
    };
    persistSemesters([...semesters, newSem]);
  };

  const handleDeleteSemester = (index: number) => {
    if (semesters.length <= 1) {
      Alert.alert('Cannot Remove', 'You must have at least one semester.');
      return;
    }
    const updated = semesters.filter((_, idx) => idx !== index);
    persistSemesters(updated);
  };

  // Mathematical Target Simulator Logic
  const targetVal = parseFloat(targetCgpa) || 9.0;
  const remainingSems = Math.max(0, totalDegreeSems - semesters.length);
  const avgCreditsPerSem = semesters.length > 0 ? Math.round(totalCredits / semesters.length) : 22;
  const remainingCredits = remainingSems * avgCreditsPerSem;
  const totalPlannedCredits = totalCredits + remainingCredits;

  let simulationMessage = '';
  let simulationColor = currentTheme.primary;
  let requiredSgpaText = '';

  if (remainingSems === 0) {
    simulationMessage = `All ${totalDegreeSems} semesters completed! Final graduation CGPA is ${currentCgpa}.`;
    simulationColor = currentTheme.primary;
  } else {
    // Required Grade Points in remaining semesters
    const requiredTotalPoints = targetVal * totalPlannedCredits;
    const neededPoints = requiredTotalPoints - weightedSum;
    const requiredSgpa = remainingCredits > 0 ? neededPoints / remainingCredits : 0;
    const maxAchievableCgpa = (
      (weightedSum + 10.0 * remainingCredits) /
      totalPlannedCredits
    ).toFixed(2);

    if (requiredSgpa <= 0) {
      requiredSgpaText = '0.00 SGPA';
      simulationMessage = `Target of ${targetVal} is already secured! Even with 0 SGPA in remaining semesters, your score is above target.`;
      simulationColor = '#00E676';
    } else if (requiredSgpa <= 10.0) {
      requiredSgpaText = `${requiredSgpa.toFixed(2)} SGPA`;
      simulationMessage = `Need an average SGPA of ${requiredSgpa.toFixed(2)} across your remaining ${remainingSems} semester${
        remainingSems > 1 ? 's' : ''
      } (${remainingCredits} credits). Maximum possible CGPA is ${maxAchievableCgpa}.`;
      simulationColor = currentTheme.primary;
    } else {
      requiredSgpaText = 'Unreachable';
      simulationMessage = `A target of ${targetVal} is mathematically out of reach (requires ${requiredSgpa.toFixed(
        2
      )} > 10.0). The highest possible CGPA you can graduate with is ${maxAchievableCgpa}.`;
      simulationColor = '#FF5252';
    }
  }

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
            CGPA Calculator & Target Simulator
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.textMuted }]}>
            Weighted Credit Grade Estimator & Degree Planner
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
              CUMULATIVE GRADE POINT AVERAGE (CGPA)
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
                {totalCredits} Total Credits • {semesters.length} Completed Semesters
              </Text>
            </View>

            <View style={{ width: '100%', marginTop: 8 }}>
              <ProgressBar percentage={(parseFloat(currentCgpa) / 10) * 100} height={8} color={currentTheme.primary} />
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Target Simulator Card */}
        <EmeraldGlassCard>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
                DEGREE TARGET SIMULATOR
              </Text>
              {requiredSgpaText ? (
                <View style={[styles.reqBadge, { backgroundColor: simulationColor + '20', borderColor: simulationColor + '50' }]}>
                  <Text style={[styles.reqBadgeText, { color: simulationColor }]}>
                    Required: {requiredSgpaText}
                  </Text>
                </View>
              ) : null}
            </View>

            <GlassInput
              label="Desired Degree Target CGPA"
              value={targetCgpa}
              onChangeText={handleTargetChange}
              keyboardType="numeric"
              placeholder="9.0"
            />

            <View style={[styles.simulationBox, { backgroundColor: currentTheme.bgCardSecondary, borderColor: simulationColor + '40' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <Feather name="info" size={15} color={simulationColor} style={{ marginTop: 2 }} />
                <Text style={[styles.simulationText, { color: currentTheme.textPrimary }]}>
                  {simulationMessage}
                </Text>
              </View>
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Semester Scores */}
        <View style={styles.semesterList}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
              SEMESTER SGPA BREAKDOWN ({semesters.length} RECORDED)
            </Text>
            <TouchableOpacity
              onPress={handleAddSemester}
              style={[styles.addSemBtn, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={13} color={currentTheme.primary} />
              <Text style={[styles.addSemBtnText, { color: currentTheme.primary }]}>Add Semester</Text>
            </TouchableOpacity>
          </View>

          {semesters.map((s, idx) => (
            <View
              key={s.id || idx}
              style={[styles.semCard, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>{s.sem}</Text>
                <View style={styles.creditsRow}>
                  <Text style={[styles.semCreditsLabel, { color: currentTheme.textMuted }]}>Credits:</Text>
                  <TextInput
                    value={s.credits.toString()}
                    onChangeText={(val) => updateSemesterCredits(idx, val)}
                    keyboardType="numeric"
                    style={[styles.inlineCreditInput, { color: currentTheme.textSecondary, borderColor: currentTheme.borderGlass }]}
                  />
                </View>
              </View>

              <View style={styles.sgpaInputWrap}>
                <Text style={[styles.sgpaLabel, { color: currentTheme.textSecondary }]}>SGPA:</Text>
                <TextInput
                  value={s.sgpa.toString()}
                  onChangeText={(val) => updateSemesterSgpa(idx, val)}
                  keyboardType="numeric"
                  style={[styles.inlineInput, { color: currentTheme.primary, borderColor: currentTheme.borderGlass }]}
                />
              </View>

              {semesters.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleDeleteSemester(idx)}
                  style={styles.deleteSemBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={14} color={currentTheme.textDisabled} />
                </TouchableOpacity>
              )}
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
  reqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  reqBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  simulationBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.8,
    marginTop: 4,
  },
  simulationText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  semesterList: {
    gap: 10,
  },
  addSemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.6,
  },
  addSemBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  semCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 0.7,
    gap: 10,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  semCreditsLabel: {
    fontSize: 11,
  },
  inlineCreditInput: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.6,
    minWidth: 36,
    textAlign: 'center',
  },
  sgpaInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sgpaLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  inlineInput: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.6,
    minWidth: 54,
  },
  deleteSemBtn: {
    padding: 6,
  },
});
