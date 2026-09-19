import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[Typography.labelSm, styles.label]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedBorder,
          Boolean(error) && styles.errorBorder,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textDisabled}
          selectionColor={Colors.emeraldPrimary}
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
    color: Colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: '#0F1310',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(0, 230, 118, 0.20)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  focusedBorder: {
    borderColor: Colors.emeraldPrimary,
    backgroundColor: '#111713',
  },
  errorBorder: {
    borderColor: Colors.statusAbsent,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  errorText: {
    color: Colors.statusAbsent,
    fontSize: 11,
    marginTop: 4,
  },
});
