import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton, GlassButton } from '../components/common/Buttons';
import { ProgressBar } from '../components/common/ProgressBar';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { Expense, ExpenseCategory, QuickExpensePreset, TimeOfDay } from '../types/campus';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIME_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Day' },
  { id: 'Morning', label: 'Morning' },
  { id: 'Afternoon', label: 'Afternoon' },
  { id: 'Evening', label: 'Evening' },
  { id: 'Night', label: 'Night' },
];

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Books', 'College', 'Other'];

export const ExpensesScreen: React.FC = () => {
  const {
    expenses,
    presets,
    addExpense,
    updateExpense,
    deleteExpense,
    addPreset,
    updatePreset,
    deletePreset,
    currentMonthTotal,
    prevMonthTotal,
    momChangePercent,
    currentTheme,
  } = useCampus();

  // Multi-Month Selector Carousel (Section 9.4)
  const [selectedMonth, setSelectedMonth] = useState<'2026-09' | '2026-08'>('2026-09');

  // Filters
  const [activeTimeFilter, setActiveTimeFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // History View Mode (Cards vs Table) & Lazy Loading / Infinite Scroll
  const [historyViewMode, setHistoryViewModeState] = useState<'cards' | 'table'>('cards');
  const PAGE_SIZE = 8;
  const [visibleExpenseCount, setVisibleExpenseCount] = useState<number>(PAGE_SIZE);

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingPreset, setEditingPreset] = useState<QuickExpensePreset | null>(null);
  const [isAddPresetOpen, setIsAddPresetOpen] = useState(false);

  // Form states for manual expense
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Food');
  const [expTimeOfDay, setExpTimeOfDay] = useState<TimeOfDay>('Afternoon');

  // Form states for preset
  const [preTitle, setPreTitle] = useState('');
  const [preAmount, setPreAmount] = useState('');
  const [preCategory, setPreCategory] = useState<ExpenseCategory>('Food');

  // Load persisted view mode on mount
  useEffect(() => {
    AsyncStorage.getItem('@colio_expenses_view_mode').then((saved) => {
      if (saved === 'cards' || saved === 'table') setHistoryViewModeState(saved);
    }).catch(() => {});
  }, []);

  const setHistoryViewMode = (mode: 'cards' | 'table') => {
    setHistoryViewModeState(mode);
    AsyncStorage.setItem('@colio_expenses_view_mode', mode).catch(() => {});
  };

  // Reset pagination when month or filters change
  useEffect(() => {
    setVisibleExpenseCount(PAGE_SIZE);
  }, [selectedMonth, activeTimeFilter, activeCategoryFilter]);


  // Filtered expense entries
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const filteredExpenses = monthExpenses.filter((e) => {
    const matchTime = activeTimeFilter === 'all' || e.timeOfDay === activeTimeFilter;
    const matchCat = activeCategoryFilter === 'all' || e.category === activeCategoryFilter;
    return matchTime && matchCat;
  });

  const displayedExpenses = filteredExpenses.slice(0, visibleExpenseCount);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Transport: 0,
    Books: 0,
    College: 0,
    Other: 0,
  };
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleQuickLog = (preset: QuickExpensePreset) => {
    addExpense({
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      timeOfDay: 'Afternoon',
      date: `${selectedMonth}-18`,
      icon: preset.icon,
    });
  };

  const handleSaveExpense = () => {
    const amt = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amt) || amt <= 0) return;

    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        title: expTitle.trim(),
        amount: amt,
        category: expCategory,
        timeOfDay: expTimeOfDay,
      });
      setEditingExpense(null);
    } else {
      addExpense({
        title: expTitle.trim(),
        amount: amt,
        category: expCategory,
        timeOfDay: expTimeOfDay,
        date: `${selectedMonth}-18`,
      });
      setIsAddExpenseOpen(false);
    }
    setExpTitle('');
    setExpAmount('');
  };

  const handleSavePreset = () => {
    const amt = parseFloat(preAmount);
    if (!preTitle.trim() || isNaN(amt) || amt <= 0) return;

    if (editingPreset) {
      updatePreset({
        ...editingPreset,
        title: preTitle.trim(),
        amount: amt,
        category: preCategory,
      });
      setEditingPreset(null);
    } else {
      addPreset({
        title: preTitle.trim(),
        amount: amt,
        category: preCategory,
        icon: 'tag',
      });
      setIsAddPresetOpen(false);
    }
    setPreTitle('');
    setPreAmount('');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Month Carousel Header (Section 9.4) */}
      <View style={styles.monthCarouselBar}>
        <TouchableOpacity
          onPress={() => setSelectedMonth(selectedMonth === '2026-09' ? '2026-08' : '2026-09')}
          style={styles.monthArrowBtn}
        >
          <Feather name="chevron-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthCenter}>
          <Text style={[Typography.titleMd, styles.monthText]}>
            {selectedMonth === '2026-09' ? 'September 2026' : 'August 2026'}
          </Text>
          <Text style={styles.monthSublabel}>Tap arrows to toggle history</Text>
        </View>

        <TouchableOpacity
          onPress={() => setSelectedMonth(selectedMonth === '2026-09' ? '2026-08' : '2026-09')}
          style={styles.monthArrowBtn}
        >
          <Feather name="chevron-right" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spend Hero Card */}
        <EmeraldGlassCard>
          <View style={styles.heroRow}>
            <View>
              <Text style={[Typography.overline, { color: Colors.textMuted }]}>TOTAL MONTHLY SPEND</Text>
              <Text style={[Typography.displayLg, styles.heroAmount]}>
                ₹{monthTotal.toLocaleString('en-IN')}
              </Text>
            </View>

            {/* MoM Comparison Pill */}
            {selectedMonth === '2026-09' && (
              <View
                style={[
                  styles.momPill,
                  {
                    backgroundColor: momChangePercent > 0 ? Colors.statusPendingBg : Colors.statusPresentBg,
                    borderColor: momChangePercent > 0 ? 'rgba(255, 171, 64, 0.4)' : 'rgba(0, 230, 118, 0.4)',
                  },
                ]}
              >
                <Feather
                  name={momChangePercent > 0 ? 'trending-up' : 'trending-down'}
                  size={13}
                  color={momChangePercent > 0 ? Colors.statusPending : Colors.statusPresent}
                />
                <Text
                  style={[
                    styles.momPillText,
                    { color: momChangePercent > 0 ? Colors.statusPending : Colors.statusPresent },
                  ]}
                >
                  {momChangePercent > 0 ? `+${momChangePercent}%` : `${momChangePercent}%`} MoM
                </Text>
              </View>
            )}
          </View>

          {/* Category Breakdown Progress Bars */}
          <View style={styles.breakdownSection}>
            <Text style={[Typography.overline, styles.breakdownTitle]}>CATEGORY BREAKDOWN</Text>
            {CATEGORIES.map((cat) => {
              const catAmount = categoryTotals[cat] || 0;
              const catPct = monthTotal > 0 ? Math.round((catAmount / monthTotal) * 100) : 0;
              if (catAmount === 0) return null;

              return (
                <View key={cat} style={styles.catProgressRow}>
                  <View style={styles.catProgressHeader}>
                    <Text style={styles.catName}>{cat}</Text>
                    <Text style={styles.catAmount}>₹{catAmount} ({catPct}%)</Text>
                  </View>
                  <ProgressBar percentage={catPct} height={5} color={currentTheme.primary} />
                </View>
              );
            })}
          </View>
        </EmeraldGlassCard>

        {/* SECTION 9.2: EDITABLE QUICK EXPENSE PRESETS (CRUD) */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
              QUICK LOG PRESETS
            </Text>
            <TouchableOpacity
              onPress={() => {
                setPreTitle('');
                setPreAmount('');
                setPreCategory('Food');
                setIsAddPresetOpen(true);
              }}
              style={[styles.addPresetBtn, { backgroundColor: currentTheme.primary + '1F' }]}
            >
              <Feather name="plus" size={13} color={currentTheme.primary} />
              <Text style={[styles.addPresetBtnText, { color: currentTheme.primary }]}>New Preset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.presetsGrid}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetTile,
                  { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                ]}
                onPress={() => handleQuickLog(preset)}
                onLongPress={() => {
                  setEditingPreset(preset);
                  setPreTitle(preset.title);
                  setPreAmount(preset.amount.toString());
                  setPreCategory(preset.category);
                }}
                delayLongPress={350}
              >
                <View style={styles.presetTileTop}>
                  <Text style={[styles.presetTileTitle, { color: currentTheme.textSecondary }]} numberOfLines={1}>
                    {preset.title}
                  </Text>
                  <Feather name="edit-2" size={10} color={currentTheme.textDisabled} />
                </View>
                <Text style={[styles.presetTileAmount, { color: currentTheme.primary }]}>+₹{preset.amount}</Text>
                <Text style={[styles.presetTileCategory, { color: currentTheme.textMuted }]}>{preset.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 9.3: TIME-OF-DAY & CATEGORY FILTERS */}
        <View style={styles.filtersBlock}>
          {/* Time of Day Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {TIME_FILTERS.map((tf) => {
              const isSelected = activeTimeFilter === tf.id;
              return (
                <TouchableOpacity
                  key={tf.id}
                  style={[
                    styles.filterPill,
                    { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                    isSelected && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
                  ]}
                  onPress={() => setActiveTimeFilter(tf.id)}
                >
                  <Text style={[styles.filterPillText, isSelected && { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Category Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
            {['all', ...CATEGORIES].map((c) => {
              const isSelected = activeCategoryFilter === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.filterPill,
                    { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                    isSelected && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
                  ]}
                  onPress={() => setActiveCategoryFilter(c)}
                >
                  <Text style={[styles.filterPillText, isSelected && { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                    {c === 'all' ? 'All Categories' : c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* First-Time Tip Callout */}
        <View style={[styles.tipCallout, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.primary + '30' }]}>
          <Feather name="info" size={14} color={currentTheme.primary} />
          <Text style={[styles.tipText, { color: currentTheme.textSecondary }]}>
            Tip: Tap any expense to edit details or delete.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setExpTitle('');
              setExpAmount('');
              setExpCategory('Food');
              setExpTimeOfDay('Afternoon');
              setIsAddExpenseOpen(true);
            }}
            style={[styles.logCustomBtn, { backgroundColor: currentTheme.primary }]}
          >
            <Text style={[styles.logCustomBtnText, { color: currentTheme.isDark ? '#050907' : '#FFFFFF' }]}>+ Custom Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Expense History List / Table Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
              LOGGED EXPENSES ({filteredExpenses.length})
            </Text>

            {/* View Mode Toggle: Cards vs Table */}
            <View style={[styles.historyModeToggleContainer, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
              <TouchableOpacity
                style={[
                  styles.historyModeButton,
                  historyViewMode === 'cards' && { backgroundColor: currentTheme.primary },
                ]}
                onPress={() => setHistoryViewMode('cards')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather
                  name="grid"
                  size={12}
                  color={historyViewMode === 'cards' ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : currentTheme.textMuted}
                />
                <Text
                  style={[
                    styles.historyModeButtonText,
                    { color: historyViewMode === 'cards' ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : currentTheme.textMuted },
                  ]}
                >
                  Cards
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.historyModeButton,
                  historyViewMode === 'table' && { backgroundColor: currentTheme.primary },
                ]}
                onPress={() => setHistoryViewMode('table')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather
                  name="list"
                  size={12}
                  color={historyViewMode === 'table' ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : currentTheme.textMuted}
                />
                <Text
                  style={[
                    styles.historyModeButtonText,
                    { color: historyViewMode === 'table' ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : currentTheme.textMuted },
                  ]}
                >
                  Table
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {filteredExpenses.length === 0 ? (
            <View style={styles.emptyExpenseBox}>
              <Text style={[styles.emptyExpenseText, { color: currentTheme.textMuted }]}>
                No expense records found for this selection.
              </Text>
            </View>
          ) : historyViewMode === 'cards' ? (
            /* CARDS VIEW */
            displayedExpenses.map((exp) => (
              <TouchableOpacity
                key={exp.id}
                style={[
                  styles.expenseItemRow,
                  { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                ]}
                onPress={() => {
                  setEditingExpense(exp);
                  setExpTitle(exp.title);
                  setExpAmount(exp.amount.toString());
                  setExpCategory(exp.category);
                  setExpTimeOfDay(exp.timeOfDay);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.expenseItemLeft}>
                  <View style={[styles.categoryIconCircle, { backgroundColor: currentTheme.primary + '18' }]}>
                    <Feather
                      name={exp.category === 'Food' ? 'coffee' : exp.category === 'Transport' ? 'navigation' : exp.category === 'Books' ? 'book' : 'tag'}
                      size={15}
                      color={currentTheme.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
                      {exp.title}
                    </Text>
                    <Text style={[styles.expItemMeta, { color: currentTheme.textMuted }]}>
                      {exp.date} • {exp.time || (exp.timeOfDay === 'Morning' ? '09:30 AM' : exp.timeOfDay === 'Afternoon' ? '01:15 PM' : exp.timeOfDay === 'Evening' ? '05:45 PM' : '09:20 PM')} • {exp.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.expenseItemRight}>
                  <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                    ₹{exp.amount}
                  </Text>
                  <TouchableOpacity
                    onPress={() => deleteExpense(exp.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="trash-2" size={14} color={currentTheme.textDisabled} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            /* TABLE VIEW */
            <View style={[styles.tableContainer, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
              {/* Table Header */}
              <View style={[styles.tableHeaderRow, { backgroundColor: currentTheme.bgCardSecondary, borderBottomColor: currentTheme.borderGlass }]}>
                <Text style={[styles.thText, styles.thDate, { color: currentTheme.textMuted }]}>DATE</Text>
                <Text style={[styles.thText, styles.thDesc, { color: currentTheme.textMuted }]}>TITLE & CAT</Text>
                <Text style={[styles.thText, styles.thAmount, { color: currentTheme.textMuted }]}>AMOUNT</Text>
                <Text style={[styles.thText, styles.thAction, { color: currentTheme.textMuted }]}>ACT</Text>
              </View>

              {displayedExpenses.map((exp, idx) => (
                <TouchableOpacity
                  key={exp.id}
                  style={[
                    styles.tableRow,
                    {
                      borderBottomColor: currentTheme.borderGlass,
                      backgroundColor: idx % 2 === 0 ? 'transparent' : (currentTheme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'),
                    },
                  ]}
                  onPress={() => {
                    setEditingExpense(exp);
                    setExpTitle(exp.title);
                    setExpAmount(exp.amount.toString());
                    setExpCategory(exp.category);
                    setExpTimeOfDay(exp.timeOfDay);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.thDate}>
                    <Text style={[styles.tdDate, { color: currentTheme.textPrimary }]}>{exp.date.slice(5)}</Text>
                    <Text style={[styles.tdTime, { color: currentTheme.textMuted }]}>{exp.time || exp.timeOfDay}</Text>
                  </View>
                  <View style={styles.thDesc}>
                    <Text style={[styles.tdTitle, { color: currentTheme.textPrimary }]} numberOfLines={1}>{exp.title}</Text>
                    <View style={[styles.tableCatBadge, { backgroundColor: currentTheme.primary + '18' }]}>
                      <Text style={[styles.tableCatText, { color: currentTheme.primary }]}>{exp.category}</Text>
                    </View>
                  </View>
                  <View style={styles.thAmount}>
                    <Text style={[styles.tdAmount, { color: currentTheme.textPrimary }]}>₹{exp.amount}</Text>
                  </View>
                  <View style={styles.thAction}>
                    <TouchableOpacity
                      onPress={() => deleteExpense(exp.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="trash-2" size={13} color={currentTheme.textDisabled} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Lazy Loading / Progressive Loading Trigger */}
          {visibleExpenseCount < filteredExpenses.length && (
            <TouchableOpacity
              style={[
                styles.loadMoreBtn,
                { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
              ]}
              onPress={() => setVisibleExpenseCount((prev) => prev + PAGE_SIZE)}
              activeOpacity={0.8}
            >
              <Feather name="chevron-down" size={14} color={currentTheme.primary} />
              <Text style={[styles.loadMoreBtnText, { color: currentTheme.primary }]}>
                Load Older Expenses ({displayedExpenses.length} of {filteredExpenses.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Expense Dialog */}
      <GlassDialog
        visible={isAddExpenseOpen || Boolean(editingExpense)}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit Expense' : 'Log New Expense'}
      >
        <GlassInput
          label="Expense Title *"
          placeholder="e.g. Canteen Lunch, Xerox, Auto"
          value={expTitle}
          onChangeText={setExpTitle}
          autoFocus
        />

        <GlassInput
          label="Amount (₹) *"
          placeholder="e.g. 120"
          value={expAmount}
          onChangeText={setExpAmount}
          keyboardType="numeric"
        />

        {/* Category Choice */}
        <Text style={[Typography.labelSm, styles.dialogSectionLabel]}>CATEGORY</Text>
        <View style={styles.dialogChipsWrap}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.dialogSelectChip,
                expCategory === c && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
              ]}
              onPress={() => setExpCategory(c)}
            >
              <Text
                style={[
                  styles.dialogSelectChipText,
                  expCategory === c && { color: currentTheme.textPrimary, fontWeight: '700' },
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time of Day Choice */}
        <Text style={[Typography.labelSm, styles.dialogSectionLabel]}>TIME OF DAY</Text>
        <View style={styles.dialogChipsWrap}>
          {(['Morning', 'Afternoon', 'Evening', 'Night'] as TimeOfDay[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.dialogSelectChip,
                expTimeOfDay === t && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
              ]}
              onPress={() => setExpTimeOfDay(t)}
            >
              <Text
                style={[
                  styles.dialogSelectChipText,
                  expTimeOfDay === t && { color: currentTheme.textPrimary, fontWeight: '700' },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          <EmeraldButton label={editingExpense ? 'Update Expense' : 'Log Expense'} onPress={handleSaveExpense} />
          {editingExpense && (
            <GlassButton
              label="Delete Expense"
              onPress={() => {
                deleteExpense(editingExpense.id);
                setEditingExpense(null);
              }}
              textStyle={{ color: Colors.statusAbsent }}
            />
          )}
        </View>
      </GlassDialog>

      {/* Add / Edit Preset Dialog (Section 9.2) */}
      <GlassDialog
        visible={isAddPresetOpen || Boolean(editingPreset)}
        onClose={() => {
          setIsAddPresetOpen(false);
          setEditingPreset(null);
        }}
        title={editingPreset ? 'Edit Quick Preset' : 'New Quick Preset'}
      >
        <GlassInput
          label="Preset Title *"
          placeholder="e.g. Evening Chai"
          value={preTitle}
          onChangeText={setPreTitle}
          autoFocus
        />

        <GlassInput
          label="Fixed Amount (₹) *"
          placeholder="e.g. 30"
          value={preAmount}
          onChangeText={setPreAmount}
          keyboardType="numeric"
        />

        <Text style={[Typography.labelSm, styles.dialogSectionLabel]}>CATEGORY</Text>
        <View style={styles.dialogChipsWrap}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.dialogSelectChip,
                preCategory === c && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
              ]}
              onPress={() => setPreCategory(c)}
            >
              <Text
                style={[
                  styles.dialogSelectChipText,
                  preCategory === c && { color: currentTheme.textPrimary, fontWeight: '700' },
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          <EmeraldButton label="Save Preset" onPress={handleSavePreset} />
          {editingPreset && (
            <GlassButton
              label="Delete Preset"
              onPress={() => {
                deletePreset(editingPreset.id);
                setEditingPreset(null);
              }}
              textStyle={{ color: Colors.statusAbsent }}
            />
          )}
        </View>
      </GlassDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  monthCarouselBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0E0C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  monthArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#131714',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthCenter: {
    alignItems: 'center',
  },
  monthText: {
    color: Colors.textPrimary,
  },
  monthSublabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heroAmount: {
    color: Colors.textPrimary,
    marginTop: 2,
  },
  momPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.6,
  },
  momPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  breakdownSection: {
    gap: 8,
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  breakdownTitle: {
    color: Colors.textMuted,
    marginBottom: 2,
  },
  catProgressRow: {
    gap: 3,
  },
  catProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catName: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  catAmount: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addPresetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  addPresetBtnText: {
    color: Colors.emeraldPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetTile: {
    width: '48%',
    backgroundColor: '#0E1210',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.7,
    borderColor: 'rgba(0, 230, 118, 0.22)',
    gap: 2,
  },
  presetTileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetTileTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  presetTileAmount: {
    color: Colors.emeraldPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  presetTileCategory: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  filtersBlock: {
    gap: 8,
  },
  filterPillsRow: {
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#121614',
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderColor: Colors.emeraldPrimary,
  },
  filterPillText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  tipCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0C110E',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.20)',
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  logCustomBtn: {
    backgroundColor: Colors.emeraldPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  logCustomBtnText: {
    color: '#002114',
    fontSize: 11,
    fontWeight: '700',
  },
  historySection: {
    gap: 10,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyModeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    borderRadius: 8,
    borderWidth: 0.6,
    gap: 2,
  },
  historyModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historyModeButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 0.6,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.6,
  },
  thText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 0.6,
  },
  thDate: {
    width: 68,
  },
  tdDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  tdTime: {
    fontSize: 9,
    marginTop: 1,
  },
  thDesc: {
    flex: 1,
    paddingRight: 6,
  },
  tdTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableCatBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  tableCatText: {
    fontSize: 9,
    fontWeight: '700',
  },
  thAmount: {
    width: 65,
    alignItems: 'flex-end',
  },
  tdAmount: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  thAction: {
    width: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.6,
    marginTop: 4,
  },
  loadMoreBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyExpenseBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyExpenseText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  expenseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F1210',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  expenseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expItemTitle: {
    color: Colors.textPrimary,
  },
  expItemMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  expenseItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expItemAmount: {
    color: Colors.textPrimary,
  },
  dialogSectionLabel: {
    color: Colors.textMuted,
    marginTop: 10,
    marginBottom: 6,
  },
  dialogChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dialogSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#131714',
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dialogSelectChipActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderColor: Colors.emeraldPrimary,
  },
  dialogSelectChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  dialogSelectChipTextActive: {
    color: Colors.textPrimary,
  },
});
