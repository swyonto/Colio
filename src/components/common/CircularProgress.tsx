import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useCampus } from '../../context/CampusContext';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  criteria?: number;
  showLabel?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 84,
  strokeWidth = 7.5,
  criteria = 68,
  showLabel = true,
}) => {
  const { currentTheme } = useCampus();
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Determine color according to closeness to criteria (68%)
  const getColor = () => {
    if (clamped < criteria) {
      return {
        stroke: '#FF5252',
        bgTrack: 'rgba(255, 82, 82, 0.12)',
        glow: 'rgba(255, 82, 82, 0.35)',
      };
    }
    if (clamped <= criteria + 7) {
      return {
        stroke: '#FFC107',
        bgTrack: 'rgba(255, 193, 7, 0.12)',
        glow: 'rgba(255, 193, 7, 0.35)',
      };
    }
    return {
      stroke: currentTheme.primary,
      bgTrack: currentTheme.primary + '20',
      glow: currentTheme.primary + '55',
    };
  };

  const colorScheme = getColor();
  const [animatedPercent, setAnimatedPercent] = useState(clamped);
  const animatedValue = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value }) => {
      setAnimatedPercent(value);
    });

    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 600,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [clamped]);

  const strokeDashoffset = circumference - (circumference * animatedPercent) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track Ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorScheme.bgTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Foreground Progress Ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorScheme.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          originX={size / 2}
          originY={size / 2}
          rotation="-90"
        />
      </Svg>

      {/* Centered Percentage Label (optional) */}
      {showLabel && (
        <View style={styles.centerContent}>
          <Text style={[styles.percentValue, { color: colorScheme.stroke }]}>
            {clamped}
            <Text style={styles.percentSymbol}>%</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  percentSymbol: {
    fontSize: 11,
    fontWeight: '700',
  },
});
