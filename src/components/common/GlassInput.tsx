import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';

interface GlassInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const { currentTheme } = useCampus();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[Typography.labelSm, styles.label, { color: currentTheme.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isFocused ? currentTheme.bgElevated : currentTheme.bgInner,
            borderColor: isFocused ? currentTheme.primary : currentTheme.borderGlass,
          },
          Boolean(error) && styles.errorBorder,
        ]}
      >
        <TextInput
          style={[styles.input, { color: currentTheme.textPrimary }, style]}
          placeholderTextColor={currentTheme.textDisabled}
          selectionColor={currentTheme.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 0.8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorBorder: {
    borderColor: '#FF5252',
  },
  input: {
    fontSize: 14,
    padding: 0,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 11,
    marginTop: 4,
  },
});
