import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

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
  iconColor = Colors.emeraldHighlight,
  value,
  label,
  badgeText,
  badgeVariant = 'emerald',
  onPress,
  onLongPress,
}) => {
  const getBadgeColors = () => {
    switch (badgeVariant) {
      case 'amber':
        return { bg: Colors.statusPendingBg, text: Colors.statusPending, border: 'rgba(255, 171, 64, 0.25)' };
      case 'rose':
        return { bg: Colors.statusAbsentBg, text: Colors.statusAbsent, border: 'rgba(255, 82, 82, 0.25)' };
      case 'muted':
        return { bg: 'rgba(255, 255, 255, 0.05)', text: Colors.textMuted, border: 'rgba(255, 255, 255, 0.10)' };
      case 'emerald':
      default:
        return { bg: Colors.statusPresentBg, text: Colors.statusPresent, border: 'rgba(0, 230, 118, 0.25)' };
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
      <View style={styles.cardContainer}>
        {/* Pure Charcoal Base */}
        <LinearGradient
          colors={[Colors.bgCard, '#121312', Colors.bgCardSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Ambient Corner Glow */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0, 230, 118, 0.08)']}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Card Border */}
        <View style={styles.border} />

        {/* Inner Content - Uniform 14dp Padding */}
        <View style={styles.content}>
          {/* Top Row: Icon Box (34dp) on left, Diagonal ↗ Arrow on right */}
          <View style={styles.topRow}>
            <View style={[styles.iconBox, { borderColor: `${iconColor}33`, backgroundColor: `${iconColor}15` }]}>
              {iconType === 'feather' ? (
                <Feather name={icon as any} size={17} color={iconColor} />
              ) : (
                <MaterialIcons name={icon as any} size={18} color={iconColor} />
              )}
            </View>

            <View style={styles.arrowBox}>
              <Feather name="arrow-up-right" size={17} color={Colors.textMuted} />
            </View>
          </View>

          {/* Middle Row: Centered Optical Large Value */}
          <View style={styles.valueRow}>
            <Text style={[Typography.displayMd, styles.valueText]} numberOfLines={1} adjustsFontSizeToFit>
              {value}
            </Text>
          </View>

          {/* Bottom Row: Uppercase Micro-Label + Sub-Badge */}
          <View style={styles.bottomRow}>
            <Text style={[Typography.overline, styles.labelText]} numberOfLines={1}>
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
    backgroundColor: Colors.bgCard,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Spacing.miniCardRadius,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    borderWidth: 0.7,
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
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    color: Colors.textMuted,
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
    fontWeight: '600',
  },
});
