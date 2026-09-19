import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing } from '../../theme/spacing';
import { useCampus } from '../../context/CampusContext';

interface EmeraldGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  onLongPress?: () => void;
  statusVariant?: 'emerald' | 'rose' | 'amber' | 'neutral';
  noPadding?: boolean;
}

export const EmeraldGlassCard: React.FC<EmeraldGlassCardProps> = ({
  children,
  style,
  onPress,
  onLongPress,
  statusVariant = 'emerald',
  noPadding = false,
}) => {
  const { currentTheme } = useCampus();

  const getGlowColor = () => {
    switch (statusVariant) {
      case 'rose':
        return 'rgba(255, 82, 82, 0.14)';
      case 'amber':
        return 'rgba(255, 171, 64, 0.12)';
      case 'neutral':
        return currentTheme.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
      case 'emerald':
      default:
        return currentTheme.glowColor;
    }
  };

  const content = (
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: currentTheme.bgCard },
        style,
      ]}
    >
      {/* Theme Card Surface Gradient */}
      <LinearGradient
        colors={[currentTheme.bgCard, currentTheme.bgCardSecondary, currentTheme.bgCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Localized Bottom-Right Radial Glow Simulation */}
      <LinearGradient
        colors={['transparent', 'transparent', getGlowColor()]}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Theme Glass Border Overlay */}
      <View style={[styles.borderOverlay, { borderColor: currentTheme.borderGlass }]} />

      {/* Inner Content */}
      <View style={[styles.innerContent, noPadding && styles.zeroPadding]}>
        {children}
      </View>
    </View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
    position: 'relative',
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Spacing.cardRadius,
    borderWidth: 0.8,
  },
  innerContent: {
    padding: Spacing.space4,
    position: 'relative',
    zIndex: 2,
  },
  zeroPadding: {
    padding: 0,
  },
});
