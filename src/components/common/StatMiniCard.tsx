import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { useCampus } from '../../context/CampusContext';

interface StatMiniCardProps {
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof Feather.glyphMap;
  iconType?: 'material' | 'feather';
  iconColor?: string;
  value: string | number;
  label: string;
  badgeText?: string;
  badgeVariant?: 'emerald' | 'amber' | 'rose' | 'muted';
  onPress?: () => void;
  onLongPress?: () => void;
}

export const StatMiniCard: React.FC<StatMiniCardProps> = ({
  icon,
  iconType = 'material',
  iconColor,
  value,
  label,
  badgeText,
  badgeVariant = 'emerald',
  onPress,
  onLongPress,
}) => {
  const { currentTheme } = useCampus();

  const effectiveIconColor = iconColor || currentTheme.primary;

  const getBadgeColors = () => {
    switch (badgeVariant) {
      case 'amber':
        return { bg: Colors.statusPendingBg, text: Colors.statusPending, border: 'rgba(255, 171, 64, 0.25)' };
      case 'rose':
        return { bg: Colors.statusAbsentBg, text: Colors.statusAbsent, border: 'rgba(255, 82, 82, 0.25)' };
      case 'muted':
        return {
          bg: currentTheme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          text: currentTheme.textMuted,
          border: currentTheme.borderGlass,
        };
      case 'emerald':
      default:
        return {
          bg: currentTheme.statusPresentBg,
          text: currentTheme.statusPresent,
          border: currentTheme.primary + '40',
        };
    }
  };

  const badge = getBadgeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={styles.wrapper}
    >
      <View style={[styles.cardContainer, { backgroundColor: currentTheme.bgCard }]}>
        {/* Dynamic Card Surface Base */}
        <LinearGradient
          colors={[currentTheme.bgCard, currentTheme.bgCardSecondary, currentTheme.bgCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Ambient Corner Glow */}
        <LinearGradient
          colors={['transparent', 'transparent', currentTheme.glowColor]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Card Border */}
        <View style={[styles.border, { borderColor: currentTheme.borderGlass }]} />

        {/* Inner Content */}
        <View style={styles.content}>
          {/* Top Row: Icon Box on left, Diagonal ↗ Arrow on right */}
          <View style={styles.topRow}>
            <View
              style={[
                styles.iconBox,
                {
                  borderColor: `${effectiveIconColor}33`,
                  backgroundColor: `${effectiveIconColor}15`,
                },
              ]}
            >
              {iconType === 'feather' ? (
                <Feather name={icon as any} size={17} color={effectiveIconColor} />
              ) : (
                <MaterialIcons name={icon as any} size={18} color={effectiveIconColor} />
              )}
            </View>

            <View style={styles.arrowBox}>
              <Feather name="arrow-up-right" size={17} color={currentTheme.textMuted} />
            </View>
          </View>

          {/* Middle Row: Centered Optical Large Value */}
          <View style={styles.valueRow}>
            <Text
              style={[Typography.displayMd, styles.valueText, { color: currentTheme.textPrimary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {value}
            </Text>
          </View>

          {/* Bottom Row: Uppercase Micro-Label + Sub-Badge */}
          <View style={styles.bottomRow}>
            <Text style={[Typography.overline, styles.labelText, { color: currentTheme.textMuted }]} numberOfLines={1}>
              {label}
            </Text>
            {badgeText && (
              <View style={[styles.badgePill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                <Text style={[styles.badgeText, { color: badge.text }]} numberOfLines={1}>
                  {badgeText}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: '46%',
  },
  cardContainer: {
    borderRadius: Spacing.miniCardRadius,
    overflow: 'hidden',
    position: 'relative',
    height: 148,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Spacing.miniCardRadius,
    borderWidth: 0.8,
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueRow: {
    justifyContent: 'center',
    marginVertical: 4,
  },
  valueText: {
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    flex: 1,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
