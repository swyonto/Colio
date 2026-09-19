import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { StatMiniCard } from '../components/common/StatMiniCard';
import { AttendanceSummaryCard } from '../components/cards/AttendanceSummaryCard';
import { TimetableSummaryCard } from '../components/cards/TimetableSummaryCard';
import { TaskSummaryCard } from '../components/cards/TaskSummaryCard';
import { ExpenseSummaryCard } from '../components/cards/ExpenseSummaryCard';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { HomeSkeleton } from '../components/common/SkeletonLoader';

interface HomeScreenProps {
  onNavigateTab: (tab: any) => void;
  onOpenMoreSection: (section: string) => void;
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenMoreSection,
  onOpenProfile,
}) => {
  const {
    overallAttendance,
    classesCanMiss,
    pendingTasksCount,
    currentMonthTotal,
    documents,
    searchQuery,
    subjects,
    tasks,
    expenses,
    attendanceCriteria = 68,
    currentTheme,
  } = useCampus();

  // Quick edit modal for 2x2 stat cards
  const [statEditModal, setStatEditModal] = useState<string | null>(null);
  const [statInputVal, setStatInputVal] = useState('');

  // Filtered search results if search query is active
  const isSearching = searchQuery.trim().length > 0;
  const filteredSubjects = subjects.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDocs = documents.filter(
    (d) => d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.bgBase }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* If Global Search Active, show search results */}
      {isSearching ? (
        <View style={styles.searchResultsContainer}>
          <Text style={[Typography.titleMd, styles.searchHeader]}>
            Search Results for "{searchQuery}"
          </Text>

          {filteredSubjects.length > 0 && (
            <View style={styles.searchSection}>
              <Text style={[Typography.overline, styles.sectionTitle]}>SUBJECTS</Text>
              {filteredSubjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.searchItem}
                  onPress={() => onNavigateTab('attend')}
                >
                  <Text style={[Typography.titleSm, { color: s.color }]}>{s.code}</Text>
                  <Text style={[Typography.bodyMd, styles.searchItemText]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {filteredTasks.length > 0 && (
            <View style={styles.searchSection}>
              <Text style={[Typography.overline, styles.sectionTitle]}>TASKS</Text>
              {filteredTasks.map((t) => (
                <View key={t.id} style={styles.searchItem}>
                  <Text style={[Typography.bodyMd, styles.searchItemText]}>{t.title}</Text>
                </View>
              ))}
            </View>
          )}

          {filteredDocs.length > 0 && (
            <View style={styles.searchSection}>
              <Text style={[Typography.overline, styles.sectionTitle]}>DOCUMENTS</Text>
              {filteredDocs.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.searchItem}
                  onPress={() => onOpenMoreSection('books')}
                >
                  <Text style={[Typography.bodyMd, styles.searchItemText]}>{d.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {filteredSubjects.length === 0 && filteredTasks.length === 0 && filteredDocs.length === 0 && (
            <Text style={styles.noResultsText}>No results found matching your query.</Text>
          )}
        </View>
      ) : (
        <>
          {/* Section 4: 2×2 Stat Mini Cards Grid with Optical Symmetry */}
          <View style={styles.statGrid}>
            <View style={styles.statRow}>
              {/* Card 1: Attendance */}
              <StatMiniCard
                icon="check-circle"
                iconColor={overallAttendance >= attendanceCriteria ? currentTheme.statusPresent : Colors.statusAbsent}
                value={`${overallAttendance}%`}
                label="ATTENDANCE"
                badgeText={`Can miss ${classesCanMiss}`}
                badgeVariant={overallAttendance >= attendanceCriteria ? 'emerald' : 'rose'}
                onPress={() => onNavigateTab('attend')}
                onLongPress={() => {
                  setStatEditModal('Attendance');
                  setStatInputVal(overallAttendance.toString());
                }}
              />

              {/* Card 2: Expenses */}
              <StatMiniCard
                icon="payments"
                iconColor={currentTheme.primary}
                value={`₹${currentMonthTotal}`}
                label="EXPENSES"
                badgeText="On Track"
                badgeVariant="emerald"
                onPress={() => onNavigateTab('expenses')}
                onLongPress={() => {
                  setStatEditModal('Expenses');
                  setStatInputVal(currentMonthTotal.toString());
                }}
              />
            </View>

            <View style={styles.statRow}>
              {/* Card 3: Tasks */}
              <StatMiniCard
                icon="assignment"
                iconColor={currentTheme.primary}
                value={`${pendingTasksCount} Tasks`}
                label="TASKS"
                badgeText={pendingTasksCount === 0 ? 'Clear ✓' : `${pendingTasksCount} Due`}
                badgeVariant={pendingTasksCount === 0 ? 'emerald' : 'muted'}
                onPress={() => onNavigateTab('home')}
                onLongPress={() => {
                  setStatEditModal('Tasks');
                  setStatInputVal(pendingTasksCount.toString());
                }}
              />

              {/* Card 4: Books / Docs */}
              <StatMiniCard
                icon="menu-book"
                iconColor={currentTheme.primary}
                value={`${documents.length} Docs`}
                label="DOCS"
                badgeText="Library"
                badgeVariant="emerald"
                onPress={() => onOpenMoreSection('books')}
                onLongPress={() => {
                  setStatEditModal('Docs');
                  setStatInputVal(documents.length.toString());
                }}
              />
            </View>
          </View>

          {/* Quick Actions Horizontal Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsScroll}
            contentContainerStyle={styles.quickActionsContainer}
          >
            <TouchableOpacity
              style={[styles.quickActionChip, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
              onPress={() => onOpenMoreSection('books')}
            >
              <Feather name="book-open" size={14} color={currentTheme.primary} />
              <Text style={[styles.quickActionText, { color: currentTheme.textPrimary }]}>Books & PDFs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionChip, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
              onPress={() => onOpenMoreSection('idcard')}
            >
              <Feather name="credit-card" size={14} color={currentTheme.primary} />
              <Text style={[styles.quickActionText, { color: currentTheme.textPrimary }]}>Digital ID</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionChip, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
              onPress={() => onOpenMoreSection('holidays')}
            >
              <Feather name="sun" size={14} color={currentTheme.primary} />
              <Text style={[styles.quickActionText, { color: currentTheme.textPrimary }]}>Holidays</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionChip, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
              onPress={() => onOpenMoreSection('cgpa')}
            >
              <Feather name="award" size={14} color={currentTheme.primary} />
              <Text style={[styles.quickActionText, { color: currentTheme.textPrimary }]}>CGPA Calc</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Section 5: Overall Attendance Card */}
          <AttendanceSummaryCard onNavigateToAttend={() => onNavigateTab('attend')} />

          {/* Today's Schedule Card */}
          <TimetableSummaryCard onNavigateToTimetable={() => onNavigateTab('timetable')} />

          {/* Section 6: Tasks Card */}
          <TaskSummaryCard onNavigateToTasks={() => onNavigateTab('home')} />

          {/* Section 9: Monthly Expenses Card */}
          <ExpenseSummaryCard onNavigateToExpenses={() => onNavigateTab('expenses')} />
        </>
      )}

      {/* Mini Card Quick Edit Dialog */}
      <GlassDialog
        visible={Boolean(statEditModal)}
        onClose={() => setStatEditModal(null)}
        title={`Adjust ${statEditModal}`}
      >
        <Text style={[Typography.bodySm, { color: Colors.textMuted, marginBottom: 12 }]}>
          Override value for dashboard calculations and tracking.
        </Text>
        <GlassInput
          label="Value"
          value={statInputVal}
          onChangeText={setStatInputVal}
          keyboardType="numeric"
        />
        <View style={{ marginTop: 14 }}>
          <EmeraldButton label="Update Value" onPress={() => setStatEditModal(null)} />
        </View>
      </GlassDialog>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 125,
    gap: 16,
  },
  statGrid: {
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionsScroll: {
    marginVertical: -4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121613',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  quickActionText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  searchResultsContainer: {
    gap: 12,
  },
  searchHeader: {
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionTitle: {
    color: Colors.textMuted,
    marginBottom: 6,
  },
  searchSection: {
    backgroundColor: '#0F1310',
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  searchItemText: {
    color: Colors.textPrimary,
  },
  noResultsText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: 24,
  },
});
