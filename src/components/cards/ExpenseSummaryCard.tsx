import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { QuickExpensePreset, Expense } from '../../types/campus';
import { triggerHapticFeedback } from '../../utils/haptics';

interface ExpenseSummaryCardProps {
  onNavigateToExpenses: () => void;
}

export const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({ onNavigateToExpenses }) => {
  const { currentMonthTotal, momChangePercent, presets, addExpense, expenses, currentTheme } = useCampus();

  const handleQuickLog = (preset: QuickExpensePreset) => {
    triggerHapticFeedback('success');
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    addExpense({
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      timeOfDay: 'Afternoon',
      time: formattedTime,
      date: now.toISOString().split('T')[0],
      icon: preset.icon,
    });
  };

  const isMoMIncrease = momChangePercent > 0;
  // Get last 3 expenses
  const recentExpenses = expenses.slice(0, 3);

  const formatExpenseTime = (item: Expense): string => {
    if (item.time) return item.time;
    switch (item.timeOfDay) {
      case 'Morning':
        return '09:30 AM';
      case 'Afternoon':
        return '01:15 PM';
      case 'Evening':
        return '05:45 PM';
      case 'Night':
        return '09:20 PM';
      default:
        return '12:30 PM';
    }
  };

  const getCategoryIcon = (cat: string): keyof typeof Feather.glyphMap => {
    switch (cat) {
      case 'Food':
        return 'coffee';
      case 'Transport':
        return 'navigation';
      case 'Books':
        return 'book';
      case 'College':
        return 'briefcase';
      default:
        return 'credit-card';
    }
  };

  return (
    <EmeraldGlassCard onPress={onNavigateToExpenses}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '18' }]}>
            <Feather name="credit-card" size={17} color={currentTheme.primary} />
          </View>
          <Text style={[Typography.titleMd, { color: currentTheme.textPrimary }]}>Monthly Expenses</Text>
        </View>

        <View style={[styles.arrowCircle, { backgroundColor: currentTheme.primary + '14' }]}>
          <Feather name="arrow-up-right" size={16} color={currentTheme.primary} />
        </View>
      </View>

      {/* Main Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.totalRow}>
          <View style={styles.amountCol}>
            <Text
              style={[Typography.displayLg, styles.amountText, { color: currentTheme.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              ₹{currentMonthTotal.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.monthLabel, { color: currentTheme.textMuted }]} numberOfLines={1}>
              Spent this month
            </Text>
          </View>

          {/* MoM Change Pill */}
          <View
            style={[
              styles.indicatorBadge,
              {
                backgroundColor: isMoMIncrease ? 'rgba(255, 82, 82, 0.12)' : currentTheme.statusPresentBg,
                borderColor: isMoMIncrease ? 'rgba(255, 82, 82, 0.3)' : currentTheme.primary + '35',
              },
            ]}
          >
            <Feather
              name={isMoMIncrease ? 'trending-up' : 'trending-down'}
              size={12}
              color={isMoMIncrease ? '#FF5252' : currentTheme.primary}
            />
            <Text
              style={[
                styles.indicatorText,
                { color: isMoMIncrease ? '#FF5252' : currentTheme.primary },
              ]}
              numberOfLines={1}
            >
              {Math.abs(momChangePercent)}% MoM
            </Text>
          </View>
        </View>
      </View>

      {/* Horizontal Quick Expense Preset Buttons */}
      <View style={styles.quickPresetsSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScrollContent}
        >
          {presets.slice(0, 4).map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.actionRowBtn,
                {
                  backgroundColor: currentTheme.bgInner,
                  borderColor: currentTheme.borderGlass,
                },
              ]}
              onPress={() => handleQuickLog(preset)}
              activeOpacity={0.8}
            >
              <Feather name={getCategoryIcon(preset.category)} size={13} color={currentTheme.primary} />
              <Text style={[styles.actionBtnLabel, { color: currentTheme.primary }]}>
                {preset.title}
              </Text>
              <Text style={[styles.actionBtnSubtext, { color: currentTheme.textMuted }]}>
                ₹{preset.amount}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Direct Log Button */}
          <TouchableOpacity
            style={[
              styles.actionPrimaryBtn,
              { backgroundColor: currentTheme.primary },
            ]}
            onPress={onNavigateToExpenses}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={13} color={currentTheme.isDark ? '#050907' : '#FFFFFF'} />
            <Text
              style={[
                styles.actionPrimaryBtnText,
                { color: currentTheme.isDark ? '#050907' : '#FFFFFF' },
              ]}
            >
              Log
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Recent Activity List Preview */}
      <View style={[styles.historyContainer, { borderTopColor: currentTheme.borderGlass }]}>
        <View style={styles.historyHeaderRow}>
          <Text style={[Typography.overline, styles.historyHeaderText, { color: currentTheme.textMuted }]}>
            RECENT TRANSACTIONS
          </Text>
          <Text style={[styles.historyCountText, { color: currentTheme.textMuted }]}>
            Showing {recentExpenses.length} of {expenses.length}
          </Text>
        </View>

        {recentExpenses.length === 0 ? (
          <Text style={[styles.emptyHistoryText, { color: currentTheme.textMuted }]}>
            No expenses logged yet this month.
          </Text>
        ) : (
          <View style={styles.historyList}>
            {recentExpenses.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.historyItemRow,
                  {
                    backgroundColor: currentTheme.bgInner,
                    borderColor: currentTheme.borderGlass,
                  },
                ]}
              >
                <View style={[styles.itemIconBox, { backgroundColor: currentTheme.primary + '16' }]}>
                  <Feather name={getCategoryIcon(item.category)} size={13} color={currentTheme.primary} />
                </View>

                <View style={styles.itemDetails}>
                  <Text style={[Typography.bodySm, styles.itemTitle, { color: currentTheme.textPrimary }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    <View style={[styles.categoryPill, { backgroundColor: currentTheme.bgCardSecondary }]}>
                      <Text style={[styles.categoryPillText, { color: currentTheme.textMuted }]}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={[styles.metaDot, { color: currentTheme.textMuted }]}>•</Text>
                    <Text style={[styles.itemTimeText, { color: currentTheme.textMuted }]}>
                      {formatExpenseTime(item)}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemAmountBox}>
                  <Text style={styles.itemAmountText}>-₹{item.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </EmeraldGlassCard>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
  },
  amountCol: {
    flex: 1,
    minWidth: 140,
  },
  amountText: {},
  monthLabel: {
    marginTop: 2,
    fontSize: 11,
  },
  indicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.6,
    flexShrink: 0,
    alignSelf: 'center',
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickPresetsSection: {
    marginBottom: 14,
  },
  quickScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.7,
  },
  actionBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnSubtext: {
    fontSize: 10,
  },
  actionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionPrimaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyContainer: {
    borderTopWidth: 0.6,
    paddingTop: 10,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyHeaderText: {},
  historyCountText: {
    fontSize: 10,
  },
  emptyHistoryText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  historyList: {
    gap: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  itemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 10,
  },
  itemTimeText: {
    fontSize: 10,
  },
  itemAmountBox: {
    alignItems: 'flex-end',
  },
  itemAmountText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 13,
  },
});
