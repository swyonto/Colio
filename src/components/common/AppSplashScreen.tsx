import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';
import { ColioLogo } from './ColioLogo';
import { Colors } from '../../theme/colors';
import { useCampus } from '../../context/CampusContext';

interface AppSplashScreenProps {
  isLoading: boolean;
  onFinished?: () => void;
}

const { width } = Dimensions.get('window');
const isNative = Platform.OS !== 'web';

const LOADING_STEPS = [
  'Initializing Colio Student OS...',
  'Syncing timetable & matrix schedule...',
  'Computing 75% attendance buffer...',
  'System ready.',
];

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ isLoading, onFinished }) => {
  const { currentTheme } = useCampus();
  const [statusIndex, setStatusIndex] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);

  // Animations
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0.08)).current;
  const textFade = useRef(new Animated.Value(1)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenScale = useRef(new Animated.Value(1)).current;

  // 1. Initial Logo entrance & ambient halo pulse
  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: isNative,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: isNative,
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
            useNativeDriver: isNative,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.1,
            duration: 1400,
            useNativeDriver: isNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1400,
            easing: Easing.in(Easing.quad),
            useNativeDriver: isNative,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.45,
            duration: 1400,
            useNativeDriver: isNative,
          }),
        ]),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  // 2. Linear progress bar & step text progression
  useEffect(() => {
    if (!isLoading) return;

    // Animate progress smoothly to ~90% while loading
    Animated.timing(progressAnim, {
      toValue: 0.88,
      duration: 1800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // Step text ticker
    const interval = setInterval(() => {
      // Fade text out
      Animated.timing(textFade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: isNative,
      }).start(() => {
        setStatusIndex((prev) => {
          const next = (prev + 1) % (LOADING_STEPS.length - 1);
          return next;
        });
        // Fade text in
        Animated.timing(textFade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: isNative,
        }).start();
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isLoading]);

  // 3. Exit transition when loading completes
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
          useNativeDriver: isNative,
        }),
        Animated.timing(screenScale, {
          toValue: 1.05,
          duration: 380,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: isNative,
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
          backgroundColor: currentTheme.bgBase,
          opacity: screenOpacity,
          transform: [{ scale: screenScale }],
          pointerEvents: isLoading ? 'auto' : 'none',
        },
      ]}
    >
      <View style={styles.centerBox}>
        {/* Pulsing Halo */}
        <Animated.View
          style={[
            styles.haloGlow,
            {
              backgroundColor: currentTheme.primary + '25',
              shadowColor: currentTheme.primary,
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
              shadowColor: currentTheme.primary,
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <ColioLogo size={68} />
        </Animated.View>

        {/* App Title */}
        <View style={styles.brandGroup}>
          <View style={styles.titleRow}>
            <Text style={[styles.brandTitle, { color: currentTheme.textPrimary }]}>COL</Text>
            <Text style={[styles.brandTitle, { color: currentTheme.primary }]}>IO</Text>
          </View>
          <Text style={[styles.brandSubtitle, { color: currentTheme.textMuted }]}>
            STUDENT OPERATING SYSTEM
          </Text>
        </View>

        {/* Glowing Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: currentTheme.primary,
                shadowColor: currentTheme.primary,
              },
            ]}
          />
        </View>

        {/* Dynamic Status Text */}
        <Animated.Text style={[styles.statusText, { opacity: textFade, color: currentTheme.textMuted }]}>
          {LOADING_STEPS[statusIndex]}
        </Animated.Text>
      </View>

      {/* Footer Version & Security Pill */}
      <View style={styles.footerRow}>
        <View style={[styles.securePill, { backgroundColor: currentTheme.primary + '15', borderColor: currentTheme.primary + '35' }]}>
          <View style={[styles.secureDot, { backgroundColor: currentTheme.primary }]} />
          <Text style={[styles.secureText, { color: currentTheme.primary }]}>
            100% OFFLINE ENCRYPTED DATA
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 35,
    elevation: 20,
  },
  logoWrapper: {
    marginBottom: 20,
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
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
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
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  statusText: {
    fontSize: 11,
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
    borderWidth: 0.6,
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  secureText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
