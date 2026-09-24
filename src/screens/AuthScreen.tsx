import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ColioLogo } from '../components/common/ColioLogo';
import { GoogleLogo } from '../components/common/GoogleLogo';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { triggerHapticFeedback } from '../utils/haptics';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthMode = 'login' | 'signup' | 'verify-email' | 'forgot-request';

export const AuthScreen: React.FC = () => {
  const {
    login,
    signup,
    checkEmailVerification,
    resendVerificationEmail,
    loginWithGoogle,
    signInWithGoogleToken,
    requestPasswordReset,
    currentTheme,
  } = useCampus();

  // Mode state
  const [mode, setMode] = useState<AuthMode>('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend countdown (for verify-email screen)
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Native Google Sign-In via expo-auth-session
  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
  });

  // Handle Google native auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const auth = (response as any).authentication;
      const idToken = auth?.idToken || (response as any).params?.id_token;
      const accessToken = auth?.accessToken || (response as any).params?.access_token;
      if (idToken) {
        setIsLoading(true);
        signInWithGoogleToken(idToken, accessToken).then((res) => {
          setIsLoading(false);
          if (!res.success) setError(res.error || 'Google sign-in failed.');
          else triggerHapticFeedback('success');
        });
      } else {
        setError('Google sign-in did not return a valid token. Please try again.');
      }
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
    }
  }, [response]);

  // Slide animation controllers
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer for resend (on verify-email screen)
  useEffect(() => {
    let timer: any = null;
    if (mode === 'verify-email' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) { setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [mode, resendCountdown]);

  const transitionToMode = (newMode: AuthMode) => {
    triggerHapticFeedback('selection');
    setError('');
    setSuccessNotice('');
    setMode(newMode);

    let targetValue = 0;
    if (newMode === 'signup') targetValue = 1;
    else if (newMode === 'verify-email') targetValue = 2;
    else if (newMode === 'forgot-request') targetValue = 3;

    Animated.spring(slideAnim, {
      toValue: targetValue,
      useNativeDriver: false,
      tension: 65,
      friction: 9,
    }).start();
  };

  // Top tab indicator interpolation (between 0 for login and 1 for signup)
  const tabIndicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
    extrapolate: 'clamp',
  });

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'transparent', score: 0 };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { label: 'Weak', color: '#FF5252', score: 1 };
    if (score <= 4) return { label: 'Medium', color: '#FFA000', score: 2 };
    return { label: 'Strong', color: '#4CAF50', score: 3 };
  };

  // Handle Login submission
  const handleLoginSubmit = async () => {
    setError('');
    setSuccessNotice('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please try again.');
        triggerHapticFeedback('warning');
      } else {
        triggerHapticFeedback('success');
      }
    } catch {
      setError('Could not connect. Please check network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup — creates Firebase Auth account + sends verification email
  const handleSignupSubmit = async () => {
    setError('');
    setSuccessNotice('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify');
      return;
    }

    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      const res = await signup(email.trim(), password, name.trim());
      if (res.success) {
        setResendCountdown(30);
        setCanResend(false);
        setSuccessNotice('Verification email sent to ' + email.trim());
        triggerHapticFeedback('success');
        transitionToMode('verify-email');
      } else {
        setError(res.error || 'Could not initiate signup. Try again.');
        triggerHapticFeedback('warning');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Check if user clicked the Firebase verification link in their email
  const handleCheckEmailLinkVerification = async () => {
    setError('');
    setSuccessNotice('');
    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      const res = await checkEmailVerification();
      if (res.success) {
        triggerHapticFeedback('success');
        setSuccessNotice('Email successfully verified! Redirecting to setup...');
      } else {
        setError(
          res.error ||
            'Email not verified yet. Please click the link in your email first (check Spam folder).'
        );
        triggerHapticFeedback('warning');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not verify status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Gmail / email client
  const handleOpenEmailInbox = async () => {
    triggerHapticFeedback('selection');
    try {
      if (Platform.OS === 'web') {
        window.open('https://mail.google.com', '_blank');
      } else {
        const canOpen = await Linking.canOpenURL('googlegmail://');
        if (canOpen) {
          await Linking.openURL('googlegmail://');
        } else {
          await Linking.openURL('https://mail.google.com');
        }
      }
    } catch {
      try {
        await Linking.openURL('mailto:');
      } catch {}
    }
  };



  // Resend Firebase verification email
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setIsLoading(true);
    triggerHapticFeedback('light');
    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        setResendCountdown(30);
        setCanResend(false);
        setSuccessNotice('Verification email resent to ' + email.trim() + '. Check inbox and spam.');
        triggerHapticFeedback('success');
      } else {
        setError(res.error || 'Failed to resend verification email.');
      }
    } catch {
      setError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Request Password Reset — Firebase sends email link (single step, no code entry in app)
  const handleForgotRequestSubmit = async () => {
    setError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter the email address linked to your account');
      return;
    }
    setIsLoading(true);
    triggerHapticFeedback('light');
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        setSuccessNotice('Password reset email sent to ' + email.trim() + '. Follow the link to reset your password. Check Spam if needed.');
        triggerHapticFeedback('success');
      } else {
        setError(res.error || 'Could not find account with this email.');
        triggerHapticFeedback('warning');
      }
    } catch {
      setError('Could not process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In: web = Firebase popup, native = expo-auth-session hook (response handled in useEffect)
  const handleContinueWithGoogle = async () => {
    setError('');
    setSuccessNotice('');
    triggerHapticFeedback('light');
    if (Platform.OS === 'web') {
      setIsLoading(true);
      try {
        const res = await loginWithGoogle();
        if (res.success) { triggerHapticFeedback('success'); }
        else { setError(res.error || 'Google authentication was not completed.'); triggerHapticFeedback('warning'); }
      } catch (err: any) {
        setError(err?.message || 'Google sign in failed. Please try again.');
      } finally { setIsLoading(false); }
    } else {
      if (request) { promptAsync(); }
      else { setError('Google Sign-In is not configured yet. Please use Email sign-in for now.'); }
    }
  };


  const strength = getPasswordStrength(password);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      <LinearGradient
        colors={[currentTheme.primary + '10', currentTheme.bgBase, currentTheme.bgBase]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.logoGlowRing,
                { borderColor: currentTheme.primary + '35', backgroundColor: currentTheme.bgCard },
              ]}
            >
              <ColioLogo size={46} />
            </View>

            <Text style={[styles.heroTitle, { color: currentTheme.textPrimary }]}>
              Colio <Text style={{ color: currentTheme.primary }}>CampusOS</Text>
            </Text>
            <Text style={[styles.heroSubtitle, { color: currentTheme.textSecondary }]}>
              {mode === 'verify-email'
                ? 'Check your email and click the verification link'
                : mode === 'forgot-request'
                ? 'Account Recovery'
                : 'Your secure student operating system'}
            </Text>
          </View>

          {/* Main Card with crisp 100% opacity */}
          <View
            style={[
              styles.authCard,
              {
                backgroundColor: currentTheme.bgCard,
                borderColor: currentTheme.borderGlass,
              },
            ]}
          >
            {/* Top Sliding Tab Indicator (Only on Login & Signup) */}
            {(mode === 'login' || mode === 'signup') && (
              <View
                style={[
                  styles.tabRow,
                  { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                ]}
              >
                <Animated.View
                  style={[
                    styles.tabIndicator,
                    {
                      backgroundColor: currentTheme.primary + '22',
                      borderColor: currentTheme.primary + '45',
                      left: tabIndicatorLeft,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={styles.tabButton}
                  onPress={() => transitionToMode('login')}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="log-in"
                    size={14}
                    color={mode === 'login' ? currentTheme.primary : currentTheme.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: mode === 'login' ? currentTheme.primary : currentTheme.textMuted,
                        fontWeight: mode === 'login' ? '700' : '500',
                      },
                    ]}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tabButton}
                  onPress={() => transitionToMode('signup')}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="user-plus"
                    size={14}
                    color={mode === 'signup' ? currentTheme.primary : currentTheme.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: mode === 'signup' ? currentTheme.primary : currentTheme.textMuted,
                        fontWeight: mode === 'signup' ? '700' : '500',
                      },
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Back Header for Sub-Modes */}
            {(mode === 'verify-email' || mode === 'forgot-request') && (
              <View style={styles.subScreenHeader}>
                <TouchableOpacity
                  onPress={() => transitionToMode(mode === 'verify-email' ? 'signup' : 'login')}
                  style={[
                    styles.backIconBtn,
                    { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                  ]}
                >
                  <Feather name="arrow-left" size={16} color={currentTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.subScreenTitle, { color: currentTheme.textPrimary }]}>
                  {mode === 'verify-email' ? 'Verify Your Email' : 'Forgot Password'}
                </Text>
              </View>
            )}

            {/* ======================================================== */}
            {/* VIEW 1: SIGNUP VIEW */}
            {/* ======================================================== */}
            {mode === 'signup' && (
              <>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    STUDENT EMAIL ADDRESS
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="mail" size={16} color={currentTheme.textMuted} />
                    <TextInput
                      style={[styles.textInput, { color: currentTheme.textPrimary }]}
                      placeholder="student@college.edu"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    CREATE PASSWORD
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="lock" size={16} color={currentTheme.textMuted} />
                    <TextInput
                      style={[styles.textInput, { color: currentTheme.textPrimary }]}
                      placeholder="Min 6 characters"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={16}
                        color={currentTheme.textMuted}
                      />
                    </TouchableOpacity>
                  </View>

                  {password.length > 0 && (
                    <View style={styles.strengthRow}>
                      <View style={styles.strengthTrack}>
                        <View
                          style={[
                            styles.strengthBar,
                            {
                              width: `${(strength.score / 3) * 100}%`,
                              backgroundColor: strength.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthLabel, { color: strength.color }]}>
                        {strength.label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    CONFIRM PASSWORD
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="shield" size={16} color={currentTheme.textMuted} />
                    <TextInput
                      style={[styles.textInput, { color: currentTheme.textPrimary }]}
                      placeholder="Re-enter password"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={16}
                        color={currentTheme.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={handleSignupSubmit}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                    />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.submitBtnText,
                          { color: currentTheme.isDark ? '#050907' : '#FFFFFF' },
                        ]}
                      >
                        Create Account & Send Verification Email
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={16}
                        color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: LOGIN VIEW */}
            {/* ======================================================== */}
            {mode === 'login' && (
              <>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    STUDENT EMAIL
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="mail" size={16} color={currentTheme.textMuted} />
                    <TextInput
                      style={[styles.textInput, { color: currentTheme.textPrimary }]}
                      placeholder="student@college.edu"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordLabelRow}>
                    <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                      PASSWORD
                    </Text>
                    <TouchableOpacity
                      onPress={() => transitionToMode('forgot-request')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.forgotText, { color: currentTheme.primary }]}>
                        Forgot?
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="lock" size={16} color={currentTheme.textMuted} />
                    <TextInput
                      style={[styles.textInput, { color: currentTheme.textPrimary }]}
                      placeholder="••••••••"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={16}
                        color={currentTheme.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={handleLoginSubmit}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                    />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.submitBtnText,
                          { color: currentTheme.isDark ? '#050907' : '#FFFFFF' },
                        ]}
                      >
                        Log In
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={16}
                        color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}



            {/* ======================================================== */}
            {/* VIEW 4: VERIFY EMAIL (Firebase link verification) */}
            {/* ======================================================== */}
            {mode === 'verify-email' && (
              <>
                <View style={styles.otpHeaderInfo}>
                  <Text style={[styles.otpSubText, { color: currentTheme.textSecondary }]}>
                    Official verification email sent to:
                  </Text>
                  <View style={styles.otpEmailBadge}>
                    <Text style={[styles.otpEmailText, { color: currentTheme.primary }]}>
                      {email}
                    </Text>
                    <TouchableOpacity
                      onPress={() => transitionToMode('signup')}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Feather name="edit-2" size={13} color={currentTheme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Verification Notice Card */}
                <View
                  style={[
                    styles.gmailNoticeCard,
                    {
                      backgroundColor: currentTheme.primary + '10',
                      borderColor: currentTheme.primary + '35',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.gmailNoticeIconWrap,
                      { backgroundColor: currentTheme.primary + '20' },
                    ]}
                  >
                    <Ionicons name="mail" size={20} color={currentTheme.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.gmailNoticeTitle, { color: currentTheme.primary }]}>
                      Verification Email Sent
                    </Text>
                    <Text style={[styles.gmailNoticeDesc, { color: currentTheme.textSecondary }]}>
                      We sent a verification link to your email. Open your inbox, click the link to verify, then tap below to continue.
                    </Text>
                  </View>
                </View>

                {/* Spam Folder Tip */}
                <View
                  style={[
                    styles.spamTipRow,
                    { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                  ]}
                >
                  <Feather name="info" size={13} color={currentTheme.primary} />
                  <Text style={[styles.spamTipText, { color: currentTheme.textMuted }]}>
                    Don't see it? Check your <Text style={{ color: currentTheme.textPrimary, fontWeight: '700' }}>Spam</Text> or <Text style={{ color: currentTheme.textPrimary, fontWeight: '700' }}>Junk</Text> folder.
                  </Text>
                </View>

                {/* Action 1: Open Mail Inbox */}
                <TouchableOpacity
                  style={[
                    styles.openGmailBtn,
                    {
                      backgroundColor: currentTheme.bgInner,
                      borderColor: currentTheme.borderGlass,
                    },
                  ]}
                  onPress={handleOpenEmailInbox}
                  activeOpacity={0.8}
                >
                  <Ionicons name="mail-open-outline" size={16} color={currentTheme.primary} />
                  <Text style={[styles.openGmailBtnText, { color: currentTheme.textPrimary }]}>
                    Open Email Inbox
                  </Text>
                </TouchableOpacity>

                {/* Action 2 (Primary): I've Clicked the Verification Link */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={handleCheckEmailLinkVerification}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                    />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.submitBtnText,
                          { color: currentTheme.isDark ? '#050907' : '#FFFFFF' },
                        ]}
                      >
                        I've Clicked the Verification Link
                      </Text>
                      <Feather
                        name="check-circle"
                        size={17}
                        color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                      />
                    </>
                  )}
                </TouchableOpacity>

                {/* Resend Row */}
                <View style={styles.resendRow}>
                  <Text style={[styles.resendHint, { color: currentTheme.textMuted }]}>
                    Didn't receive email?{' '}
                  </Text>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text style={[styles.resendBtnText, { color: currentTheme.primary }]}>
                        Resend Email
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.resendCountdownText, { color: currentTheme.textDisabled }]}>
                      Resend in {resendCountdown}s
                    </Text>
                  )}
                </View>

                {/* Cancel / Back Link */}
                <TouchableOpacity
                  style={styles.cancelLinkBtn}
                  onPress={() => transitionToMode('signup')}
                >
                  <Text style={[styles.cancelLinkText, { color: currentTheme.textMuted }]}>
                    ← Back to Sign Up
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ======================================================== */}
            {/* VIEW 5: FORGOT PASSWORD REQUEST */}
            {/* ======================================================== */}
            {mode === 'forgot-request' && (
              <>
                <Text style={[styles.forgotDesc, { color: currentTheme.textSecondary }]}>
                  Enter the email linked to your account. Firebase will send a secure password reset link directly to your inbox.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    REGISTERED EMAIL
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="mail" size={16} color={currentTheme.textMuted} />
                    <TextInput
                      style={[styles.textInput, { color: currentTheme.textPrimary }]}
                      placeholder="student@college.edu"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={handleForgotRequestSubmit}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                    />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.submitBtnText,
                          { color: currentTheme.isDark ? '#050907' : '#FFFFFF' },
                        ]}
                      >
                        Send Password Reset Link
                      </Text>
                      <Feather
                        name="send"
                        size={16}
                        color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                      />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelLinkBtn}
                  onPress={() => transitionToMode('login')}
                >
                  <Text style={[styles.cancelLinkText, { color: currentTheme.textMuted }]}>
                    Back to Log In
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Error Message */}
            {error ? (
              <View style={styles.errorRow}>
                <Feather name="alert-circle" size={14} color="#FF5252" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Success Notice */}
            {successNotice ? (
              <View style={styles.successRow}>
                <Feather name="check-circle" size={14} color="#4CAF50" />
                <Text style={styles.successText}>{successNotice}</Text>
              </View>
            ) : null}

            {/* ======================================================== */}
            {/* GOOGLE SIGN IN BUTTON (Only shown on Login & Signup) */}
            {/* ======================================================== */}
            {(mode === 'login' || mode === 'signup') && (
              <>
                <View style={styles.dividerRow}>
                  <View
                    style={[styles.dividerLine, { backgroundColor: currentTheme.borderGlass }]}
                  />
                  <Text style={[styles.dividerText, { color: currentTheme.textMuted }]}>OR</Text>
                  <View
                    style={[styles.dividerLine, { backgroundColor: currentTheme.borderGlass }]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.googleBtn,
                    {
                      backgroundColor: currentTheme.bgInner,
                      borderColor: currentTheme.borderGlass,
                    },
                  ]}
                  onPress={handleContinueWithGoogle}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <GoogleLogo size={20} />
                  <Text style={[styles.googleBtnText, { color: currentTheme.textPrimary }]}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer Features */}
          <View style={styles.footerSection}>
            <View style={styles.footerBadgeRow}>
              <Feather name="shield" size={12} color={currentTheme.textDisabled} />
              <Text style={[styles.footerText, { color: currentTheme.textDisabled }]}>
                Encrypted password hashing & Cloud Firestore sync
              </Text>
            </View>
            <View style={styles.footerBadgeRow}>
              <Feather name="lock" size={12} color={currentTheme.textDisabled} />
              <Text style={[styles.footerText, { color: currentTheme.textDisabled }]}>
                Strict zero-access authentication security
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  logoGlowRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  authCard: {
    borderRadius: 22,
    borderWidth: 0.8,
    padding: 22,
    gap: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 0.8,
    padding: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '48%',
    borderRadius: 10,
    borderWidth: 0.8,
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
  },
  subScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subScreenTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  googleHeroBox: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  googleHeroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  googleHeroSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  inputGroup: {
    gap: 5,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  forgotDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0.8,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  otpHeaderInfo: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  otpSubText: {
    fontSize: 13,
    textAlign: 'center',
  },
  otpEmailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  otpEmailText: {
    fontSize: 13,
    fontWeight: '700',
  },
  gmailNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  gmailNoticeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gmailNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  gmailNoticeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
    width: '100%',
  },
  otpBox: {
    width: 44,
    height: 52,
    maxWidth: 48,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  resendHint: {
    fontSize: 12,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resendCountdownText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    fontWeight: '600',
    flex: 1,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  successText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cancelLinkBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 0.8,
    gap: 12,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  footerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  spamTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 0.8,
  },
  spamTipText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  openGmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 2,
  },
  openGmailBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  codeVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 11,
    borderWidth: 1,
    gap: 8,
    marginTop: 2,
  },
  codeVerifyBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  googleFallbackBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  googleFallbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleFallbackTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  googleFallbackDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  googleFallbackSubmitBtn: {
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  googleFallbackSubmitText: {
    fontSize: 12,
    fontWeight: '700',
  },
  googleFallbackCancelBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  googleQuickLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  googleQuickLinkText: {
    fontSize: 12,
  },
});
