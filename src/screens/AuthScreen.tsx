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
  Alert,
  Linking,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ColioLogo } from '../components/common/ColioLogo';
import { GoogleLogo } from '../components/common/GoogleLogo';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { triggerHapticFeedback } from '../utils/haptics';
import AsyncStorage from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthMode = 'login' | 'signup' | 'verify-otp' | 'forgot-request' | 'forgot-reset';

export const AuthScreen: React.FC = () => {
  const {
    login,
    signup,
    verifySignup,
    checkEmailVerification,
    resendVerificationEmail,
    loginWithGoogle,
    requestPasswordReset,
    completePasswordReset,
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

  // OTP Verification state (6 boxes)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  // Forgot Password state
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Fallback Google Sign-In state (when Firebase Google Provider is not enabled in Firebase Console)
  const [showGoogleFallbackModal, setShowGoogleFallbackModal] = useState(false);
  const [googleFallbackEmail, setGoogleFallbackEmail] = useState('');
  const [googleFallbackName, setGoogleFallbackName] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Slide animation controllers
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any = null;
    if ((mode === 'verify-otp' || mode === 'forgot-reset') && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, resendCountdown]);

  // Hydrate pending email from storage if available
  useEffect(() => {
    if (mode === 'verify-otp') {
      AsyncStorage.getItem('@colio_pending_otp_v2').then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (parsed.email && !email) {
              setEmail(parsed.email);
            }
          } catch {}
        }
      });
    }
  }, [mode]);

  const transitionToMode = (newMode: AuthMode) => {
    triggerHapticFeedback('selection');
    setError('');
    setSuccessNotice('');
    setMode(newMode);

    let targetValue = 0;
    if (newMode === 'signup') targetValue = 1;
    else if (newMode === 'verify-otp') targetValue = 2;
    else if (newMode === 'forgot-request') targetValue = 3;
    else if (newMode === 'forgot-reset') targetValue = 4;

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

  // Handle Signup submission -> sends 6-digit OTP
  const handleSignupSubmit = async () => {
    setError('');
    setSuccessNotice('');

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
      // User sets their name on the Setup page as requested
      const signupName = name.trim() || email.trim().split('@')[0];
      const res = await signup(email.trim(), password, signupName);
      if (res.success) {
        setOtpDigits(['', '', '', '', '', '']);
        setResendCountdown(30);
        setCanResend(false);
        setSuccessNotice('Official verification link sent to ' + email.trim());
        triggerHapticFeedback('success');
        transitionToMode('verify-otp');
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


  // Handle OTP digit changes with multi-character & paste support on all boxes
  const handleOtpChange = (text: string, index: number) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    if (numericOnly.length >= 6) {
      const pastedDigits = numericOnly.slice(0, 6).split('');
      setOtpDigits(pastedDigits);
      otpInputRefs.current[5]?.focus();
      return;
    }
    if (numericOnly.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < numericOnly.length && index + i < 6; i++) {
        newDigits[index + i] = numericOnly[i];
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(5, index + numericOnly.length);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const cleanChar = numericOnly.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify entered 6-digit OTP
  const handleVerifyOtpSubmit = async () => {
    setError('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      const res = await verifySignup(email.trim(), fullOtp);
      if (res.success) {
        triggerHapticFeedback('success');
      } else {
        setError(res.error || 'Invalid or expired verification code.');
        triggerHapticFeedback('warning');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend official Firebase verification email
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        setResendCountdown(30);
        setCanResend(false);
        setSuccessNotice('Official verification email resent to ' + email.trim() + '. Please check your inbox and spam folder.');
        triggerHapticFeedback('success');
      } else {
        // Fallback: re-trigger signup email dispatch
        const signupName = name.trim() || email.trim().split('@')[0];
        const signupRes = await signup(email.trim(), password, signupName);
        if (signupRes.success) {
          setResendCountdown(30);
          setCanResend(false);
          setSuccessNotice('Verification email resent to ' + email.trim());
          triggerHapticFeedback('success');
        } else {
          setError(signupRes.error || 'Failed to resend verification email.');
        }
      }
    } catch {
      setError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Request Password Reset (Step 1)
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
        setResetCode('');
        setResendCountdown(30);
        setCanResend(false);
        setSuccessNotice('Official password recovery email sent to your Gmail.');
        triggerHapticFeedback('success');
        transitionToMode('forgot-reset');
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

  // Complete Password Reset (Step 2)
  const handleForgotResetSubmit = async () => {
    setError('');
    if (!resetCode.trim()) {
      setError('Please enter the 6-digit recovery code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please verify');
      return;
    }

    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      const res = await completePasswordReset(email.trim(), resetCode.trim(), newPassword);
      if (res.success) {
        triggerHapticFeedback('success');
        Alert.alert(
          'Password Reset Successful',
          'Your password has been securely updated. You can now log in with your new password.',
          [{ text: 'Log In Now', onPress: () => transitionToMode('login') }]
        );
      } else {
        setError(res.error || 'Invalid or expired recovery code.');
        triggerHapticFeedback('warning');
      }
    } catch {
      setError('Could not update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google Sign-In — invokes Google API and opens Google account selection
  const handleContinueWithGoogle = async () => {
    setError('');
    setSuccessNotice('');
    setIsLoading(true);
    triggerHapticFeedback('light');

    try {
      // Direct call to official Google API (Firebase GoogleAuthProvider popup on web)
      const res = await loginWithGoogle();
      if (res.success) {
        triggerHapticFeedback('success');
      } else {
        setError(res.error || 'Google authentication was not completed.');
        if (
          res.error &&
          (res.error.includes('Firebase Console') ||
            res.error.includes('configuration-not-found') ||
            res.error.includes('CONFIGURATION_NOT_FOUND'))
        ) {
          setShowGoogleFallbackModal(true);
        }
        triggerHapticFeedback('warning');
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError(err?.message || 'Google sign in failed. Please try again.');
      setShowGoogleFallbackModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectGoogleLogin = async () => {
    if (!googleFallbackEmail.trim() || !/\S+@\S+\.\S+/.test(googleFallbackEmail.trim())) {
      setError('Please enter a valid Google email address.');
      return;
    }
    setIsLoading(true);
    triggerHapticFeedback('light');
    try {
      const res = await loginWithGoogle({
        email: googleFallbackEmail.trim(),
        name: googleFallbackName.trim() || googleFallbackEmail.split('@')[0],
      });
      if (res.success) {
        setShowGoogleFallbackModal(false);
        triggerHapticFeedback('success');
      } else {
        setError(res.error || 'Could not complete Google sign-in.');
        triggerHapticFeedback('warning');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(mode === 'forgot-reset' ? newPassword : password);

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
              {mode === 'verify-otp'
                ? 'Verify your email with the 6-digit code'
                : mode === 'forgot-request' || mode === 'forgot-reset'
                ? 'Account Recovery & Password Reset'
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
            {(mode === 'verify-otp' || mode === 'forgot-request' || mode === 'forgot-reset') && (
              <View style={styles.subScreenHeader}>
                <TouchableOpacity
                  onPress={() =>
                    transitionToMode(mode === 'verify-otp' ? 'signup' : 'login')
                  }
                  style={[
                    styles.backIconBtn,
                    { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                  ]}
                >
                  <Feather name="arrow-left" size={16} color={currentTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.subScreenTitle, { color: currentTheme.textPrimary }]}>
                  {mode === 'verify-otp'
                    ? 'Email Verification'
                    : mode === 'forgot-request'
                    ? 'Forgot Password'
                    : 'Set New Password'}
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
            {/* VIEW 4: VERIFY EMAIL OTP */}
            {/* ======================================================== */}
            {/* ======================================================== */}
            {/* VIEW 4: VERIFY EMAIL (Real Firebase Verification) */}
            {/* ======================================================== */}
            {mode === 'verify-otp' && (
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
                    <Ionicons name="shield-checkmark-outline" size={20} color={currentTheme.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.gmailNoticeTitle, { color: currentTheme.primary }]}>
                      Enter 6-Digit Verification Code
                    </Text>
                    <Text style={[styles.gmailNoticeDesc, { color: currentTheme.textSecondary }]}>
                      Enter the 6-digit code sent to your email to verify and activate your student account.
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

                {/* 6-Digit Input Boxes */}
                <View style={styles.otpBoxesRow}>
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        otpInputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpBox,
                        {
                          backgroundColor: currentTheme.bgInner,
                          borderColor: digit ? currentTheme.primary : currentTheme.borderGlass,
                          color: currentTheme.textPrimary,
                        },
                      ]}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {/* Primary Action Button: Verify & Continue */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={handleVerifyOtpSubmit}
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
                        Verify & Continue
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={17}
                        color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                      />
                    </>
                  )}
                </TouchableOpacity>

                {/* Resend Row */}
                <View style={styles.resendRow}>
                  <Text style={[styles.resendHint, { color: currentTheme.textMuted }]}>
                    Didn't receive code?{' '}
                  </Text>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text style={[styles.resendBtnText, { color: currentTheme.primary }]}>
                        Resend Code
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
            {/* VIEW 5: FORGOT PASSWORD REQUEST (Step 1) */}
            {/* ======================================================== */}
            {mode === 'forgot-request' && (
              <>
                <Text style={[styles.forgotDesc, { color: currentTheme.textSecondary }]}>
                  Enter the email address registered with your account. We'll send you a 6-digit recovery code to reset your password.
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
                        Send Recovery Code
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

            {/* ======================================================== */}
            {/* VIEW 6: FORGOT PASSWORD RESET (Step 2) */}
            {/* ======================================================== */}
            {mode === 'forgot-reset' && (
              <>
                {/* Instructions: Recovery code sent to user Gmail */}
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
                      Recovery Code Sent to Gmail
                    </Text>
                    <Text style={[styles.gmailNoticeDesc, { color: currentTheme.textSecondary }]}>
                      A 6-digit recovery code was sent to <Text style={{ fontWeight: '700', color: currentTheme.textPrimary }}>{email}</Text>. Enter the code below to reset your password.
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    6-DIGIT RECOVERY CODE
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: currentTheme.bgInner, borderColor: currentTheme.borderGlass },
                    ]}
                  >
                    <Feather name="key" size={16} color={currentTheme.textMuted} />
                    <TextInput
                      style={[styles.textInput, { color: currentTheme.textPrimary, letterSpacing: 2 }]}
                      placeholder="123456"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={resetCode}
                      onChangeText={setResetCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    NEW PASSWORD
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
                      value={newPassword}
                      onChangeText={setNewPassword}
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

                  {newPassword.length > 0 && (
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textMuted }]}>
                    CONFIRM NEW PASSWORD
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
                      placeholder="Re-enter new password"
                      placeholderTextColor={currentTheme.textDisabled}
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
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

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: currentTheme.primary }]}
                  onPress={handleForgotResetSubmit}
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
                        Update Password
                      </Text>
                      <Feather
                        name="check-circle"
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
                    Cancel & Return to Log In
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

                {/* Direct Google Login fallback when Firebase Console Google provider is unconfigured */}
                {showGoogleFallbackModal ? (
                  <View
                    style={[
                      styles.googleFallbackBox,
                      {
                        backgroundColor: currentTheme.bgInner,
                        borderColor: currentTheme.primary + '40',
                      },
                    ]}
                  >
                    <View style={styles.googleFallbackHeader}>
                      <GoogleLogo size={16} />
                      <Text
                        style={[
                          styles.googleFallbackTitle,
                          { color: currentTheme.textPrimary },
                        ]}
                      >
                        Quick Google Account Sign In
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.googleFallbackDesc,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      Firebase Google Provider is not enabled in Firebase Console for 'calio2026'. Enter your Google email to sign in directly:
                    </Text>
                    <View
                      style={[
                        styles.inputWrap,
                        {
                          backgroundColor: currentTheme.bgCard,
                          borderColor: currentTheme.borderGlass,
                        },
                      ]}
                    >
                      <Feather name="mail" size={16} color={currentTheme.textMuted} />
                      <TextInput
                        style={[styles.textInput, { color: currentTheme.textPrimary }]}
                        placeholder="yourname@gmail.com"
                        placeholderTextColor={currentTheme.textDisabled}
                        value={googleFallbackEmail}
                        onChangeText={setGoogleFallbackEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <TouchableOpacity
                        style={[
                          styles.googleFallbackSubmitBtn,
                          { backgroundColor: currentTheme.primary, flex: 1 },
                        ]}
                        onPress={handleDirectGoogleLogin}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.googleFallbackSubmitText,
                            { color: currentTheme.isDark ? '#050907' : '#FFFFFF' },
                          ]}
                        >
                          Sign In with Google
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.googleFallbackCancelBtn,
                          { borderColor: currentTheme.borderGlass },
                        ]}
                        onPress={() => setShowGoogleFallbackModal(false)}
                      >
                        <Text style={{ color: currentTheme.textMuted, fontSize: 12 }}>
                          Dismiss
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.googleQuickLink}
                    onPress={() => setShowGoogleFallbackModal(true)}
                  >
                    <Text style={[styles.googleQuickLinkText, { color: currentTheme.textMuted }]}>
                      Trouble with Google Popup?{' '}
                      <Text style={{ color: currentTheme.primary, fontWeight: '700' }}>
                        Quick Google Sign In
                      </Text>
                    </Text>
                  </TouchableOpacity>
                )}
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
