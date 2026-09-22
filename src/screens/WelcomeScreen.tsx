import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ColioLogo } from '../components/common/ColioLogo';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';

interface WelcomeScreenProps {
  onStartSignUp: () => void;
  onQuickLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartSignUp,
  onQuickLogin,
}) => {
  const { currentTheme } = useCampus();

  const features = [
    {
      icon: 'clock',
      title: 'Smart Matrix Timetable',
      desc: 'Automatic current-day tracking with List and 2-column Grid modes.',
    },
    {
      icon: 'pie-chart',
      title: '75% Attendance Safeguard',
      desc: 'Real-time class calculation of bunking buffer & attendance criteria.',
    },
    {
      icon: 'credit-card',
      title: 'Campus Expense Tracker',
      desc: 'Fast quick-presets, month comparisons, and lazy-loaded history.',
    },
    {
      icon: 'book',
      title: 'Offline Study Library',
      desc: 'Instant in-app textbook & lecture notes reader with zero distractions.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Glow Header Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.logoGlowRing, { borderColor: currentTheme.primary + '40', shadowColor: currentTheme.primary }]}>
            <ColioLogo size={36} />
          </View>

          <View style={styles.titleWrap}>
            <Text style={[Typography.displayLg, styles.heroTitle, { color: currentTheme.textPrimary }]}>
              COLIO
            </Text>
            <View style={[styles.badgePill, { backgroundColor: currentTheme.primary + '1F', borderColor: currentTheme.primary + '40' }]}>
              <Text style={[styles.badgePillText, { color: currentTheme.primary }]}>
                STUDENT OPERATING SYSTEM v2.0
              </Text>
            </View>
          </View>

          <Text style={[styles.heroTagline, { color: currentTheme.textSecondary }]}>
            The high-performance workspace for your college lectures, attendance, expenses, and academics.
          </Text>
        </View>

        {/* Feature Grid Highlights */}
        <View style={styles.featuresContainer}>
          {features.map((feat, idx) => (
            <View
              key={idx}
              style={[
                styles.featureCard,
                { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
              ]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: currentTheme.primary + '15' }]}>
                <Feather name={feat.icon as any} size={18} color={currentTheme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                  {feat.title}
                </Text>
                <Text style={[styles.featureDesc, { color: currentTheme.textMuted }]}>
                  {feat.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: currentTheme.primary }]}
            onPress={onStartSignUp}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: currentTheme.isDark ? '#050907' : '#FFFFFF' }]}>
              Get Started / Sign Up
            </Text>
            <Feather
              name="arrow-right"
              size={18}
              color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
            ]}
            onPress={onQuickLogin}
            activeOpacity={0.85}
          >
            <Feather name="log-in" size={16} color={currentTheme.textPrimary} />
            <Text style={[styles.secondaryBtnText, { color: currentTheme.textPrimary }]}>
              Continue with Demo Student Profile
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimerText, { color: currentTheme.textMuted }]}>
            All student data is securely encrypted and stored 100% offline on your device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
    gap: 28,
  },
  heroSection: {
    alignItems: 'center',
    gap: 12,
  },
  logoGlowRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 4,
  },
  titleWrap: {
    alignItems: 'center',
    gap: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTagline: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    maxWidth: 340,
  },
  featuresContainer: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 0.7,
    gap: 14,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  actionSection: {
    gap: 12,
    marginTop: 6,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});
