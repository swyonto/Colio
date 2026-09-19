import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ColioLogoProps {
  size?: number;
}

export const ColioLogo: React.FC<ColioLogoProps> = ({ size = 36 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Defs>
          {/* Outer Ring / Shield Gradient */}
          <LinearGradient id="colioGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00E676" />
            <Stop offset="50%" stopColor="#00C853" />
            <Stop offset="100%" stopColor="#00B0FF" />
          </LinearGradient>

          {/* Subtle Inner Glow */}
          <LinearGradient id="colioInnerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00E676" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#00E676" stopOpacity="0.03" />
          </LinearGradient>

          {/* Accent Core Gradient */}
          <LinearGradient id="colioAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#69F0AE" />
            <Stop offset="100%" stopColor="#00E676" />
          </LinearGradient>
        </Defs>

        {/* Squircle Background Base */}
        <Rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="#0D1310"
          stroke="url(#colioGradPrimary)"
          strokeWidth="1.5"
        />

        {/* Ambient Inner Fill */}
        <Rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="11"
          fill="url(#colioInnerGlow)"
        />

        {/* Dynamic Stylized 'C' & Orbit Emblem */}
        <Path
          d="M32 16.5C29.8 14.3 26.6 13 23 13C16.9 13 12 17.9 12 24C12 30.1 16.9 35 23 35C26.6 35 29.8 33.7 32 31.5"
          stroke="url(#colioGradPrimary)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Futuristic Core Spark / Node (Top Right Orbit) */}
        <Circle cx="33" cy="16.5" r="2.8" fill="#00E676" />
        <Circle cx="33" cy="16.5" r="1.2" fill="#FFFFFF" />

        {/* Inner Graduation Diamond / Pivot Accent */}
        <Path
          d="M23 20L27 24L23 28L19 24Z"
          fill="url(#colioAccentGrad)"
          opacity="0.9"
        />

        {/* Micro Glow Dot (Bottom Accent) */}
        <Circle cx="33" cy="31.5" r="2.2" fill="#00B0FF" opacity="0.85" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
