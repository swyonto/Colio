import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

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
  const getGlowColor = () => {
    switch (statusVariant) {
      case 'rose':
        return 'rgba(255, 82, 82, 0.12)';
      case 'amber':
        return 'rgba(255, 171, 64, 0.10)';
      case 'neutral':
        return 'rgba(255, 255, 255, 0.04)';
      case 'emerald':
      default:
        return 'rgba(0, 230, 118, 0.10)';
    }
  };

  const content = (
    <View style={[styles.cardContainer, style]}>
      {/* Base Dark Charcoal Gradient - Zero Green base tint */}
      <LinearGradient
        colors={[Colors.bgCard, Colors.bgCardSecondary, Colors.bgCard]}
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

      {/* Subtle Border Overlay */}
      <View style={styles.borderOverlay} />

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
    backgroundColor: Colors.bgCard,
  },
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Spacing.cardRadius,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
