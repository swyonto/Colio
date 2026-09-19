import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { triggerHapticFeedback } from '../../utils/haptics';
import { useCampus } from '../../context/CampusContext';

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
  const { currentTheme } = useCampus();

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
        colors={[currentTheme.primaryDim || currentTheme.primary, currentTheme.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.emeraldGradient}
      >
        {icon}
        <Text
          style={[
            Typography.labelLg,
            styles.emeraldText,
            { color: currentTheme.isDark ? '#050907' : '#FFFFFF' },
            textStyle,
          ]}
        >
          {label}
        </Text>
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
  const { currentTheme } = useCampus();

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
      style={[
        styles.buttonWrapper,
        styles.glassContainer,
        {
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderGlass,
        },
        style,
        disabled && styles.disabledButton,
      ]}
    >
      {icon}
      <Text style={[Typography.labelLg, styles.glassText, { color: currentTheme.textPrimary }, textStyle]}>
        {label}
      </Text>
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
    fontWeight: '700',
    fontSize: 14,
  },
  glassContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0.8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  glassText: {
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
});
