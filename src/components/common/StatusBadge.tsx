import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { useCampus } from '../../context/CampusContext';

interface StatusBadgeProps {
  label: string;
  variant?: 'present' | 'absent' | 'holiday' | 'pending' | 'now' | 'next' | 'neutral';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant = 'present' }) => {
  const { currentTheme } = useCampus();

  const getTheme = () => {
    switch (variant) {
      case 'absent':
        return { bg: Colors.statusAbsentBg, text: Colors.statusAbsent, border: 'rgba(255, 82, 82, 0.35)' };
      case 'holiday':
        return { bg: Colors.statusHolidayBg, text: Colors.statusHoliday, border: 'rgba(255, 193, 7, 0.35)' };
      case 'pending':
        return { bg: Colors.statusPendingBg, text: Colors.statusPending, border: 'rgba(255, 171, 64, 0.35)' };
      case 'now':
        return { bg: currentTheme.primary + '28', text: currentTheme.primary, border: currentTheme.primary + '60' };
      case 'next':
        return { bg: 'rgba(0, 176, 255, 0.15)', text: '#00B0FF', border: 'rgba(0, 176, 255, 0.40)' };
      case 'neutral':
        return { bg: 'rgba(255, 255, 255, 0.06)', text: currentTheme.textSecondary, border: currentTheme.borderGlass };
      case 'present':
      default:
        return { bg: currentTheme.primary + '20', text: currentTheme.primary, border: currentTheme.primary + '50' };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.6,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
