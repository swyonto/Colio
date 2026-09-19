import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { ColioLogo } from './ColioLogo';
import { Colors } from '../../theme/colors';

interface AppSplashScreenProps {
  isLoading: boolean;
  onFinished?: () => void;
}

const { width } = Dimensions.get('window');

const LOADING_STEPS = [
  'Initializing Campus Intelligence...',
  'Syncing timetable & academic schedule...',
  'Computing attendance criteria & buffer...',
  'System ready.',
];

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ isLoading, onFinished }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);

  // Animation values
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenScale = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(1)).current;

  // 1. Initial Logo entrance & ambient halo pulse
  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Ambient Halo Pulse Loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.28,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.1,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.45,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseLoop.start();

    // Smooth Progress bar animation across 1000ms
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1050,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // Status text steps
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(textFade, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(textFade, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      setStatusIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 320);

    return () => {
      pulseLoop.stop();
      clearInterval(interval);
    };
  }, []);

  // 2. Handle exit transition when loading finishes
  useEffect(() => {
    if (!isLoading) {
      // Complete the progress to 100%
      progressAnim.setValue(1);

      // Smooth scale-up and fade-out to reveal the main app
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 380,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(screenScale, {
          toValue: 1.05,
          duration: 380,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
        onFinished?.();
      });
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['12%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: screenOpacity,
          transform: [{ scale: screenScale }],
        },
      ]}
      pointerEvents={isLoading ? 'auto' : 'none'}
    >
      <View style={styles.centerBox}>
        {/* Pulsing Emerald Halo */}
        <Animated.View
          style={[
            styles.haloGlow,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Scaled App Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <ColioLogo size={68} />
        </Animated.View>

        {/* App Title with Neon Highlight */}
        <View style={styles.brandGroup}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Campus</Text>
            <Text style={[styles.brandTitle, styles.brandTitleHighlight]}>OS</Text>
          </View>
          <Text style={styles.brandSubtitle}>STUDENT INTELLIGENCE SYSTEM</Text>
        </View>

        {/* Glowing Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        {/* Dynamic Status Text */}
        <Animated.Text style={[styles.statusText, { opacity: textFade }]}>
          {LOADING_STEPS[statusIndex]}
        </Animated.Text>
      </View>

      {/* Footer Version & Security Pill */}
      <View style={styles.footerRow}>
        <View style={styles.securePill}>
          <View style={styles.secureDot} />
          <Text style={styles.secureText}>CAMPUS LOCAL DATABASE ACTIVE</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050907',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.82,
  },
  haloGlow: {
    position: 'absolute',
    top: -24,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    shadowColor: Colors.emeraldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 35,
    elevation: 20,
  },
  logoWrapper: {
    marginBottom: 20,
    shadowColor: Colors.emeraldPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  brandGroup: {
    alignItems: 'center',
    marginBottom: 28,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandTitleHighlight: {
    color: Colors.emeraldPrimary,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 2.2,
    marginTop: 4,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.emeraldPrimary,
    borderRadius: 2,
    shadowColor: Colors.emeraldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    minHeight: 18,
  },
  footerRow: {
    position: 'absolute',
    bottom: 36,
    alignItems: 'center',
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.22)',
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emeraldPrimary,
  },
  secureText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.emeraldPrimary,
    letterSpacing: 0.8,
  },
});
