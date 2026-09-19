import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { triggerHapticFeedback } from '../../utils/haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const EmeraldButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  icon,
}) => {
  const handlePress = () => {
    if (disabled) return;
    triggerHapticFeedback('medium');
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.buttonWrapper, style, disabled && styles.disabledButton]}
    >
      <LinearGradient
        colors={[Colors.emeraldSecondary, Colors.emeraldPrimary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.emeraldGradient}
      >
        {icon}
        <Text style={[Typography.labelLg, styles.emeraldText, textStyle]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const GlassButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  icon,
}) => {
  const handlePress = () => {
    if (disabled) return;
    triggerHapticFeedback('light');
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.buttonWrapper, styles.glassContainer, style, disabled && styles.disabledButton]}
    >
      {icon}
      <Text style={[Typography.labelLg, styles.glassText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: Spacing.buttonRadius,
    overflow: 'hidden',
  },
  emeraldGradient: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emeraldText: {
    color: '#002114',
    fontWeight: '700',
    fontSize: 14,
  },
  glassContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161A17',
    borderWidth: 0.8,
    borderColor: 'rgba(0, 230, 118, 0.22)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  glassText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
});
