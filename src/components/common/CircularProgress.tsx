import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  criteria?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 84,
  strokeWidth = 7.5,
  criteria = 68,
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Determine color according to closeness to criteria (68%)
  // Red: below criteria
  // Yellow/Amber: boundary zone close to criteria (68% - 75%)
  // Green/Emerald: safe zone (>= 76%)
  const getColor = () => {
    if (clamped < criteria) {
      return {
        stroke: '#FF5252',
        bgTrack: 'rgba(255, 82, 82, 0.12)',
        glow: 'rgba(255, 82, 82, 0.35)',
      };
    }
    if (clamped < criteria + 8) {
      return {
        stroke: '#FFC107',
        bgTrack: 'rgba(255, 193, 7, 0.12)',
        glow: 'rgba(255, 193, 7, 0.35)',
      };
    }
    return {
      stroke: '#00E676',
      bgTrack: 'rgba(0, 230, 118, 0.12)',
      glow: 'rgba(0, 230, 118, 0.35)',
    };
  };

  const colorScheme = getColor();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

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
        <AnimatedCircle
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

      {/* Centered Percentage Label */}
      <View style={styles.centerContent}>
        <Text style={[styles.percentValue, { color: colorScheme.stroke }]}>
          {clamped}
          <Text style={styles.percentSymbol}>%</Text>
        </Text>
      </View>
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
