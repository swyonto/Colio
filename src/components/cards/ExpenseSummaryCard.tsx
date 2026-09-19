import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { QuickExpensePreset } from '../../types/campus';
import { triggerHapticFeedback } from '../../utils/haptics';

interface ExpenseSummaryCardProps {
  onNavigateToExpenses: () => void;
}

export const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({ onNavigateToExpenses }) => {
  const { currentMonthTotal, momChangePercent, presets, addExpense, expenses } = useCampus();

  const handleQuickLog = (preset: QuickExpensePreset) => {
    triggerHapticFeedback('success');
    addExpense({
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      timeOfDay: 'Afternoon',
      date: new Date().toISOString().split('T')[0],
      icon: preset.icon,
    });
  };

  const isMoMIncrease = momChangePercent > 0;
  // Get last 3 expenses
  const recentExpenses = expenses.slice(0, 3);

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
          <View style={styles.iconCircle}>
            <Feather name="credit-card" size={17} color={Colors.emeraldPrimary} />
          </View>
          <Text style={[Typography.titleMd, styles.cardTitle]}>Monthly Expenses</Text>
        </View>

        <View style={styles.arrowCircle}>
          <Feather name="arrow-up-right" size={16} color={Colors.emeraldPrimary} />
        </View>
      </View>

      {/* 1. Total Expense Display & 2. Clear Indicator Badge */}
      <View style={styles.statsContainer}>
        <View style={styles.totalRow}>
          <Text style={[Typography.displayLg, styles.amountText]}>
            ₹{currentMonthTotal.toLocaleString('en-IN')}
          </Text>

          {/* Clear Indicator Badge */}
          <View
            style={[
              styles.indicatorBadge,
              {
                backgroundColor: isMoMIncrease ? Colors.statusPendingBg : Colors.statusPresentBg,
                borderColor: isMoMIncrease ? 'rgba(255, 171, 64, 0.40)' : 'rgba(0, 230, 118, 0.40)',
              },
            ]}
          >
            <Feather
              name={isMoMIncrease ? 'alert-circle' : 'check-circle'}
              size={12}
              color={isMoMIncrease ? Colors.statusPending : Colors.statusPresent}
            />
            <Text
              style={[
                styles.indicatorText,
                { color: isMoMIncrease ? Colors.statusPending : Colors.statusPresent },
              ]}
            >
              {isMoMIncrease ? `+${momChangePercent}% vs Aug` : `${momChangePercent}% On Track`}
            </Text>
          </View>
        </View>

        <Text style={[Typography.bodySm, styles.monthLabel]}>
          September 2026 total spend • Budget under control
        </Text>
      </View>

      {/* 3. Expense Action Buttons (Flex in Row - No offset issues) */}
      <View style={styles.buttonActionRow}>
        {presets.slice(0, 3).map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={styles.actionRowBtn}
            onPress={() => handleQuickLog(preset)}
            activeOpacity={0.8}
          >
            <Feather name={getCategoryIcon(preset.category)} size={12} color={Colors.emeraldPrimary} />
            <Text style={styles.actionBtnLabel} numberOfLines={1}>
              +₹{preset.amount}
            </Text>
            <Text style={styles.actionBtnSubtext} numberOfLines={1}>
              {preset.title.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Custom Add Expense Button */}
        <TouchableOpacity
          style={styles.actionPrimaryBtn}
          onPress={onNavigateToExpenses}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={13} color="#050907" />
          <Text style={styles.actionPrimaryBtnText}>Log</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Last 3 Expense History (Type, Time, Amount) */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeaderRow}>
          <Text style={[Typography.overline, styles.historyHeaderText]}>RECENT ACTIVITY</Text>
          <Text style={styles.historyCountText}>Last 3 transactions</Text>
        </View>

        {recentExpenses.length === 0 ? (
          <Text style={styles.emptyHistoryText}>No expenses logged yet.</Text>
        ) : (
          <View style={styles.historyList}>
            {recentExpenses.map((item) => (
              <View key={item.id} style={styles.historyItemRow}>
                {/* Left: Category Icon Box */}
                <View style={styles.itemIconBox}>
                  <Feather name={getCategoryIcon(item.category)} size={13} color={Colors.emeraldHighlight} />
                </View>

                {/* Middle: Title, Category Type & Time */}
                <View style={styles.itemDetails}>
                  <Text style={[Typography.bodySm, styles.itemTitle]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{item.category}</Text>
                    </View>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.itemTimeText}>
                      {item.timeOfDay || 'Daytime'}
                    </Text>
                  </View>
                </View>

                {/* Right: Amount */}
                <View style={styles.itemAmountBox}>
                  <Text style={[Typography.labelMd, styles.itemAmountText]}>
                    -₹{item.amount}
                  </Text>
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
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: Colors.textPrimary,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 230, 118, 0.10)',
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
  },
  amountText: {
    color: Colors.textPrimary,
  },
  monthLabel: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  indicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.6,
  },
  indicatorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  buttonActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  actionRowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#111512',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 0.7,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  actionBtnLabel: {
    color: Colors.emeraldPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnSubtext: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  actionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: Colors.emeraldPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionPrimaryBtnText: {
    color: '#050907',
    fontSize: 11,
    fontWeight: '700',
  },
  historyContainer: {
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyHeaderText: {
    color: Colors.textMuted,
  },
  historyCountText: {
    fontSize: 10,
    color: Colors.textDisabled,
  },
  emptyHistoryText: {
    color: Colors.textMuted,
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
    backgroundColor: '#0A0D0B',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 230, 118, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 10,
    color: Colors.textDisabled,
  },
  itemTimeText: {
    fontSize: 10,
    color: Colors.textMuted,
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
