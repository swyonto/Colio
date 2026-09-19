import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../theme/colors';
import { useCampus } from '../../context/CampusContext';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  target?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 6,
  color,
  target = 75,
}) => {
  const { currentTheme } = useCampus();
  const clamped = Math.min(100, Math.max(0, percentage));
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const resolvedColor =
    color || (clamped >= target ? currentTheme.statusPresent : Colors.statusAbsent);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clamped,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: currentTheme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: resolvedColor,
            shadowColor: currentTheme.primary,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
