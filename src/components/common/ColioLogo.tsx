import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useCampus } from '../../context/CampusContext';

interface ColioLogoProps {
  size?: number;
}

export const ColioLogo: React.FC<ColioLogoProps> = ({ size = 36 }) => {
  const { currentTheme } = useCampus();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Defs>
          {/* Outer Ring / Shield Gradient */}
          <LinearGradient id="colioGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={currentTheme.primary} />
            <Stop offset="50%" stopColor={currentTheme.primaryDim} />
            <Stop offset="100%" stopColor={currentTheme.primaryHighlight} />
          </LinearGradient>

          {/* Subtle Inner Glow */}
          <LinearGradient id="colioInnerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={currentTheme.primary} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={currentTheme.primary} stopOpacity="0.03" />
          </LinearGradient>

          {/* Accent Core Gradient */}
          <LinearGradient id="colioAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={currentTheme.primaryHighlight} />
            <Stop offset="100%" stopColor={currentTheme.primary} />
          </LinearGradient>
        </Defs>

        {/* Squircle Background Base */}
        <Rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill={currentTheme.bgSurface}
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
        <Circle cx="33" cy="16.5" r="2.8" fill={currentTheme.primary} />
        <Circle cx="33" cy="16.5" r="1.2" fill={currentTheme.isDark ? '#FFFFFF' : '#0F172A'} />

        {/* Inner Graduation Diamond / Pivot Accent */}
        <Path
          d="M23 20L27 24L23 28L19 24Z"
          fill="url(#colioAccentGrad)"
          opacity="0.9"
        />

        {/* Micro Glow Dot (Bottom Accent) */}
        <Circle cx="33" cy="31.5" r="2.2" fill={currentTheme.primaryHighlight} opacity="0.85" />
      </Svg>
    </View>
  );
};

export const CalioLogo = ColioLogo;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
