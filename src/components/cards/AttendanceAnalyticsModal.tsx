import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { GlassDialog } from '../common/GlassDialog';
import { ProgressBar } from '../common/ProgressBar';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { Subject } from '../../types/campus';
import { triggerHapticFeedback } from '../../utils/haptics';

interface AttendanceAnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
  currentMonthLabel: string;
  previousMonthLabel: string;
  currentMonthPct: number;
  previousMonthPct: number;
  currentMonthHeld: number;
  currentMonthAttended: number;
  previousMonthHeld: number;
  previousMonthAttended: number;
  attendanceCriteria: number;
  subjects: Subject[];
  classesCanMiss: number;
  classesNeeded: number;
  onOpenEdit: () => void;
}

export const AttendanceAnalyticsModal: React.FC<AttendanceAnalyticsModalProps> = ({
  visible,
  onClose,
  currentMonthLabel,
  previousMonthLabel,
  currentMonthPct,
  previousMonthPct,
  currentMonthHeld,
  currentMonthAttended,
  previousMonthHeld,
  previousMonthAttended,
  attendanceCriteria,
  subjects,
  classesCanMiss,
  classesNeeded,
  onOpenEdit,
}) => {
  const { currentTheme } = useCampus();
  const [filterMode, setFilterMode] = useState<'all' | 'high' | 'critical'>('all');

  // Month-over-month delta
  const pctDiff = currentMonthPct - previousMonthPct;
  const isImproved = pctDiff >= 0;

  // Process subject stats and trending status
  const subjectAnalytics = useMemo(() => {
    return subjects.map((subj) => {
      const total = subj.present + subj.absent;
      const pct = total > 0 ? Math.round((subj.present / total) * 100) : 100;
      const ratio = attendanceCriteria / 100;
      const canMiss = total > 0 ? Math.max(0, Math.floor((subj.present - ratio * total) / ratio)) : 0;
      const needed = total > 0 && pct < attendanceCriteria
        ? Math.max(1, Math.ceil((ratio * total - subj.present) / (1 - ratio)))
        : 0;

      let trend: 'high' | 'safe' | 'critical' = 'safe';
      if (pct >= 85) trend = 'high';
      else if (pct < attendanceCriteria) trend = 'critical';

      return {
        ...subj,
        total,
        pct,
        canMiss,
        needed,
        trend,
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [subjects, attendanceCriteria]);

  // Top trending & lowest subjects
  const topSubject = subjectAnalytics[0];
  const lowestSubject = subjectAnalytics[subjectAnalytics.length - 1];

  const filteredSubjects = useMemo(() => {
    if (filterMode === 'high') return subjectAnalytics.filter((s) => s.trend === 'high');
    if (filterMode === 'critical') return subjectAnalytics.filter((s) => s.trend === 'critical');
    return subjectAnalytics;
  }, [subjectAnalytics, filterMode]);

  return (
    <GlassDialog visible={visible} onClose={onClose} title="Attendance Analytics & Trends">
      {/* 1. Hero Card: Month-over-Month Comparison */}
      <View style={[styles.heroCard, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroTitleGroup}>
            <View style={[styles.heroIconBadge, { backgroundColor: currentTheme.primary + '18' }]}>
              <Feather name="trending-up" size={16} color={currentTheme.primary} />
            </View>
            <View>
              <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                Month Comparison
              </Text>
              <Text style={[styles.heroSubtitle, { color: currentTheme.textMuted }]}>
                {previousMonthLabel} vs {currentMonthLabel}
              </Text>
            </View>
          </View>

          {/* Improvement Pill */}
          <View
            style={[
              styles.trendDeltaBadge,
              {
                backgroundColor: isImproved ? currentTheme.statusPresentBg : 'rgba(255, 82, 82, 0.14)',
                borderColor: isImproved ? currentTheme.primary + '40' : 'rgba(255, 82, 82, 0.35)',
              },
            ]}
          >
            <Feather
              name={isImproved ? 'arrow-up-right' : 'arrow-down-right'}
              size={12}
              color={isImproved ? currentTheme.statusPresent : '#FF5252'}
            />
            <Text
              style={[
                styles.trendDeltaText,
                { color: isImproved ? currentTheme.statusPresent : '#FF5252' },
              ]}
            >
              {isImproved ? `+${pctDiff}% Trend` : `${pctDiff}% Trend`}
            </Text>
          </View>
        </View>

        {/* Comparison Dual Cards */}
        <View style={styles.dualMonthRow}>
          {/* Previous Month Card */}
          <View style={[styles.monthStatCol, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
            <Text style={[styles.monthStatLabel, { color: currentTheme.textMuted }]}>{previousMonthLabel.toUpperCase()}</Text>
            <Text style={[styles.monthStatPct, { color: currentTheme.textSecondary }]}>
              {previousMonthPct > 0 ? `${previousMonthPct}%` : '--%'}
            </Text>
            <Text style={[styles.monthStatClasses, { color: currentTheme.textMuted }]}>
              {previousMonthHeld > 0 ? `${previousMonthAttended}/${previousMonthHeld} Classes` : 'No past record'}
            </Text>
          </View>

          <View style={styles.arrowBetweenCols}>
            <Feather name="arrow-right" size={16} color={currentTheme.textMuted} />
          </View>

          {/* Current Month Card */}
          <View style={[styles.monthStatCol, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.primary + '35' }]}>
            <Text style={[styles.monthStatLabel, { color: currentTheme.primary }]}>{currentMonthLabel.toUpperCase()}</Text>
            <Text style={[styles.monthStatPct, { color: currentTheme.primary, fontWeight: '800' }]}>
              {currentMonthPct}%
            </Text>
            <Text style={[styles.monthStatClasses, { color: currentTheme.textMuted }]}>
              {currentMonthAttended}/{currentMonthHeld} Classes
            </Text>
          </View>
        </View>

        {/* Date Span & Attendance Note */}
        <View style={styles.heroFooterRow}>
          <Feather name="calendar" size={12} color={currentTheme.textMuted} />
          <Text style={[styles.heroFooterText, { color: currentTheme.textMuted }]}>
            Attended {currentMonthAttended} of {currentMonthHeld} held classes this month ({currentMonthPct}% vs {attendanceCriteria}% goal).
          </Text>
        </View>
      </View>

      {/* 2. Key Insights Quick Strip */}
      <View style={styles.insightsStripRow}>
        {topSubject && (
          <View style={[styles.insightPillCard, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
            <Text style={[styles.insightPillLabel, { color: currentTheme.textMuted }]}>🔥 TOP SUBJECT</Text>
            <Text style={[styles.insightPillTitle, { color: currentTheme.primary }]} numberOfLines={1}>
              {topSubject.name} ({topSubject.pct}%)
            </Text>
          </View>
        )}

        {lowestSubject && lowestSubject.pct < attendanceCriteria && (
          <View style={[styles.insightPillCard, { backgroundColor: currentTheme.bgCardSecondary, borderColor: 'rgba(255, 82, 82, 0.3)' }]}>
            <Text style={[styles.insightPillLabel, { color: '#FF5252' }]}>⚠️ NEEDS ATTENTION</Text>
            <Text style={[styles.insightPillTitle, { color: '#FF5252' }]} numberOfLines={1}>
              {lowestSubject.name} ({lowestSubject.pct}%)
            </Text>
          </View>
        )}
      </View>

      {/* 3. Subject Trends Breakdown (Colored Lines & Bars) */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
            Subject Performance Trends
          </Text>
          <View style={[styles.countBadge, { backgroundColor: currentTheme.primary + '18' }]}>
            <Text style={[styles.countBadgeText, { color: currentTheme.primary }]}>{filteredSubjects.length}</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterTabsRow, { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass }]}>
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'all' && [styles.filterTabActive, { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary }]]}
          onPress={() => {
            triggerHapticFeedback('selection');
            setFilterMode('all');
          }}
        >
          <Text style={[styles.filterTabText, { color: filterMode === 'all' ? currentTheme.primary : currentTheme.textMuted }, filterMode === 'all' && styles.filterTabTextActive]}>
            All ({subjectAnalytics.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'high' && [styles.filterTabActive, { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary }]]}
          onPress={() => {
            triggerHapticFeedback('selection');
            setFilterMode('high');
          }}
        >
          <Text style={[styles.filterTabText, { color: filterMode === 'high' ? currentTheme.primary : currentTheme.textMuted }, filterMode === 'high' && styles.filterTabTextActive]}>
            🔥 High ({subjectAnalytics.filter((s) => s.trend === 'high').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'critical' && [styles.filterTabActive, { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary }]]}
          onPress={() => {
            triggerHapticFeedback('selection');
            setFilterMode('critical');
          }}
        >
          <Text style={[styles.filterTabText, { color: filterMode === 'critical' ? '#FF5252' : currentTheme.textMuted }, filterMode === 'critical' && styles.filterTabTextActive]}>
            ⚠️ Below Goal ({subjectAnalytics.filter((s) => s.trend === 'critical').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subject Line & Colored Progress List */}
      <View style={styles.subjectsListWrap}>
        {filteredSubjects.map((subj) => {
          const isSafe = subj.pct >= attendanceCriteria;
          return (
            <View
              key={subj.id}
              style={[
                styles.subjectTrendCard,
                { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
              ]}
            >
              {/* Header: Name, Code & Percent Badge */}
              <View style={styles.subjTrendHeader}>
                <View style={styles.subjNameCol}>
                  <View style={styles.subjNameRow}>
                    <View style={[styles.subjDot, { backgroundColor: subj.color }]} />
                    <Text style={[styles.subjNameText, { color: currentTheme.textPrimary }]} numberOfLines={1}>
                      {subj.name}
                    </Text>
                    <Text style={[styles.subjCodeBadge, { color: currentTheme.textMuted }]}>
                      {subj.code}
                    </Text>
                  </View>
                  <Text style={[styles.subjDetailText, { color: currentTheme.textMuted }]}>
                    {subj.present} attended of {subj.total} held
                  </Text>
                </View>

                {/* Percentage & Trend Pill */}
                <View style={styles.subjRightCol}>
                  <Text style={[styles.subjPctText, { color: isSafe ? currentTheme.primary : '#FF5252' }]}>
                    {subj.pct}%
                  </Text>
                  <View
                    style={[
                      styles.subjTrendPill,
                      {
                        backgroundColor:
                          subj.trend === 'high'
                            ? currentTheme.primary + '18'
                            : isSafe
                            ? currentTheme.bgInner
                            : 'rgba(255, 82, 82, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subjTrendPillText,
                        {
                          color:
                            subj.trend === 'high'
                              ? currentTheme.primary
                              : isSafe
                              ? currentTheme.textSecondary
                              : '#FF5252',
                        },
                      ]}
                    >
                      {subj.trend === 'high'
                        ? '🔥 Trending High'
                        : isSafe
                        ? '✓ On Goal'
                        : '⚠️ Needs Attention'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Line with Target Line Marker */}
              <View style={styles.progressLineWrapper}>
                <ProgressBar
                  percentage={subj.pct}
                  height={6}
                  color={isSafe ? subj.color : '#FF5252'}
                  target={attendanceCriteria}
                />
              </View>

              {/* Advice Footer Row */}
              <View style={styles.subjAdviceRow}>
                <Feather
                  name={isSafe ? 'check' : 'alert-circle'}
                  size={11}
                  color={isSafe ? currentTheme.primary : '#FF5252'}
                />
                <Text
                  style={[
                    styles.subjAdviceText,
                    { color: isSafe ? currentTheme.textMuted : '#FF5252' },
                  ]}
                >
                  {isSafe
                    ? `Can miss ${subj.canMiss} more classes safely without dropping below ${attendanceCriteria}%.`
                    : `Must attend next ${subj.needed} class${subj.needed !== 1 ? 'es' : ''} to reach ${attendanceCriteria}% target.`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Action Footer */}
      <View style={styles.modalFooterActions}>
        <TouchableOpacity
          style={[styles.editHistoryCtaBtn, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
          onPress={() => {
            onClose();
            onOpenEdit();
          }}
        >
          <Feather name="edit-3" size={14} color={currentTheme.primary} />
          <Text style={[styles.editHistoryCtaText, { color: currentTheme.primary }]}>
            Edit / Log Month Records
          </Text>
        </TouchableOpacity>
      </View>
    </GlassDialog>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.8,
    marginBottom: 12,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  trendDeltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.8,
  },
  trendDeltaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dualMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthStatCol: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.8,
    alignItems: 'center',
  },
  arrowBetweenCols: {
    paddingHorizontal: 8,
  },
  monthStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  monthStatPct: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  monthStatClasses: {
    fontSize: 10,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroFooterText: {
    fontSize: 11,
    flex: 1,
  },
  insightsStripRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  insightPillCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.8,
  },
  insightPillLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  insightPillTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterTabsRow: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    borderWidth: 0.8,
    marginBottom: 12,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'transparent',
  },
  filterTabActive: {},
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterTabTextActive: {
    fontWeight: '700',
  },
  subjectsListWrap: {
    gap: 10,
  },
  subjectTrendCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  subjTrendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjNameCol: {
    flex: 1,
    marginRight: 10,
  },
  subjNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  subjDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjNameText: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  subjCodeBadge: {
    fontSize: 11,
  },
  subjDetailText: {
    fontSize: 11,
    marginLeft: 14,
  },
  subjRightCol: {
    alignItems: 'flex-end',
    gap: 3,
  },
  subjPctText: {
    fontSize: 16,
    fontWeight: '800',
  },
  subjTrendPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjTrendPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressLineWrapper: {
    marginBottom: 6,
  },
  subjAdviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subjAdviceText: {
    fontSize: 10.5,
    flex: 1,
  },
  modalFooterActions: {
    marginTop: 14,
  },
  editHistoryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  editHistoryCtaText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
