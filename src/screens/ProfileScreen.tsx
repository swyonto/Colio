import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { IdCardScreen } from './IdCardScreen';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { triggerHapticFeedback } from '../utils/haptics';

interface ProfileScreenProps {
  onBack: () => void;
}

const SEMESTER_OPTIONS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
];

const THEME_OPTIONS = [
  { id: 'dark-emerald', name: 'Cyber Emerald', type: 'dark', bg: '#050907', accent: '#00E676' },
  { id: 'dark-midnight', name: 'Midnight Obsidian', type: 'dark', bg: '#07070F', accent: '#8B5CF6' },
  { id: 'light-nordic', name: 'Nordic Frost', type: 'light', bg: '#F0F4F8', accent: '#0284C7' },
  { id: 'light-paper', name: 'Paper Minimal', type: 'light', bg: '#FAF7F2', accent: '#D97706' },
];

const AVATAR_PRESETS = [
  { id: 'p1', colors: ['#00E676', '#00B0FF'], label: 'Cyber' },
  { id: 'p2', colors: ['#FF5252', '#FF7A00'], label: 'Flare' },
  { id: 'p3', colors: ['#7C4DFF', '#00E5FF'], label: 'Neon' },
  { id: 'p4', colors: ['#FFC107', '#00E676'], label: 'Aurora' },
  { id: 'p5', colors: ['#E040FB', '#7C4DFF'], label: 'Violet' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const {
    profile,
    updateProfile,
    attendanceCriteria,
    setAttendanceCriteria,
    appTheme,
    setAppTheme,
    currentTheme,
    classRemindersEnabled,
    setClassRemindersEnabled,
    hapticsEnabled,
    setHapticsEnabled,
    notificationPrefs,
    updateNotificationPrefs,
    lastSyncTime,
    isSyncing,
    syncToCloud,
    resetAllData,
    logout,
    currentUser,
  } = useCampus();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [rollNumber, setRollNumber] = useState(profile.rollNumber);
  const [course, setCourse] = useState(profile.course || 'B.Sc Computer Science');
  const [semester, setSemester] = useState(profile.semester || 'Semester 5');
  const [college, setCollege] = useState(profile.college);
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri || '');
  const [avatarSize, setAvatarSize] = useState<'small' | 'medium' | 'large'>(profile.avatarSize || 'medium');
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState(profile.avatarPreset ?? 0);

  // Sync avatarSize, avatarPreset, and avatarUri from profile state
  useEffect(() => {
    if (profile.avatarSize) {
      setAvatarSize(profile.avatarSize);
    }
  }, [profile.avatarSize]);

  useEffect(() => {
    if (typeof profile.avatarPreset === 'number') {
      setSelectedAvatarPreset(profile.avatarPreset);
    }
  }, [profile.avatarPreset]);

  useEffect(() => {
    if (profile.avatarUri !== undefined) {
      setAvatarUri(profile.avatarUri);
    }
  }, [profile.avatarUri]);

  // Attendance Goal local state for instantaneous tactile updates
  const [goal, setGoal] = useState<number>(attendanceCriteria);

  useEffect(() => {
    setGoal(attendanceCriteria);
  }, [attendanceCriteria]);

  // Modals & Selectors
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const getInitials = (str: string) => {
    if (!str) return 'ST';
    return str
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getAvatarDimensions = () => {
    switch (avatarSize) {
      case 'small':
        return { ringSize: 68, borderRadius: 34, fontSize: 22 };
      case 'large':
        return { ringSize: 104, borderRadius: 52, fontSize: 36 };
      case 'medium':
      default:
        return { ringSize: 84, borderRadius: 42, fontSize: 28 };
    }
  };
  const avatarDim = getAvatarDimensions();

  const handleSelectAvatarSize = (sz: 'small' | 'medium' | 'large') => {
    triggerHapticFeedback('selection');
    setAvatarSize(sz);
    updateProfile({ avatarSize: sz });
  };

  const handleDeletePfp = () => {
    triggerHapticFeedback('warning');
    Alert.alert(
      'Delete Profile Picture (PFP)',
      'Are you sure you want to delete your profile picture? This will revert your profile back to standard academic initials.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete PFP',
          style: 'destructive',
          onPress: () => {
            setAvatarUri('');
            updateProfile({ avatarUri: '' });
            setShowAvatarPicker(false);
            triggerHapticFeedback('success');
          },
        },
      ]
    );
  };

  const handleConfirmResetAll = () => {
    triggerHapticFeedback('warning');
    Alert.alert(
      'Reset All Application Data?',
      'This will permanently delete all stored attendance records, timetable slots, logged expenses, uploaded PDFs, and profile settings, returning Colio to initial onboarding setup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            onBack();
          },
        },
      ]
    );
  };

  const handleSave = () => {
    triggerHapticFeedback('success');
    updateProfile({
      name: name.trim() || profile.name,
      rollNumber: rollNumber.trim() || profile.rollNumber,
      course: course.trim() || 'B.Sc Computer Science',
      semester,
      college: college.trim() || profile.college,
      avatarUri,
      avatarSize,
      avatarPreset: selectedAvatarPreset,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    triggerHapticFeedback('light');
    setName(profile.name);
    setRollNumber(profile.rollNumber);
    setCourse(profile.course || 'B.Sc Computer Science');
    setSemester(profile.semester || 'Semester 5');
    setCollege(profile.college);
    setAvatarUri(profile.avatarUri || '');
    setAvatarSize(profile.avatarSize || 'medium');
    setSelectedAvatarPreset(profile.avatarPreset ?? 0);
    setIsEditing(false);
  };

  // Adjust Attendance Goal Stepper
  const adjustAttendanceGoal = (delta: number) => {
    const nextVal = Math.min(95, Math.max(50, goal + delta));
    setGoal(nextVal);
    setAttendanceCriteria(nextVal);
  };

  const setTargetPreset = (targetVal: number) => {
    triggerHapticFeedback('selection');
    setGoal(targetVal);
    setAttendanceCriteria(targetVal);
  };

  // Avatar Upload / Selection
  const pickAvatarFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow photo gallery permissions to upload your profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        updateProfile({ avatarUri: uri });
        setShowAvatarPicker(false);
        triggerHapticFeedback('success');
      }
    } catch (err) {
      console.warn('Gallery picker error:', err);
    }
  };

  const takeAvatarPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow camera permissions to take a profile picture.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        updateProfile({ avatarUri: uri });
        setShowAvatarPicker(false);
        triggerHapticFeedback('success');
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const removeAvatarPhoto = () => {
    triggerHapticFeedback('warning');
    setAvatarUri('');
    updateProfile({ avatarUri: '' });
    setShowAvatarPicker(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.headerBar, { backgroundColor: currentTheme.bgSurface, borderBottomColor: currentTheme.borderGlass }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: currentTheme.bgCardSecondary }]}
          onPress={() => {
            triggerHapticFeedback('light');
            onBack();
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={currentTheme.textPrimary} />
        </TouchableOpacity>

        <Text style={[Typography.titleLg, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
          Student Profile
        </Text>

        <TouchableOpacity
          style={[
            styles.editToggleBtn,
            {
              backgroundColor: isEditing ? currentTheme.primary : currentTheme.primary + '18',
              borderColor: currentTheme.primary + '40',
            },
          ]}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              triggerHapticFeedback('selection');
              setIsEditing(true);
            }
          }}
          activeOpacity={0.8}
        >
          {isEditing ? (
            <Feather name="check" size={18} color={currentTheme.isDark ? '#050907' : '#FFFFFF'} />
          ) : (
            <Feather name="edit-2" size={16} color={currentTheme.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Profile Card (Editable with Photo Upload) */}
        <EmeraldGlassCard>
          <View style={styles.heroCol}>
            {/* Avatar with Camera Badge */}
            <TouchableOpacity
              style={styles.avatarTouchable}
              onPress={() => {
                triggerHapticFeedback('selection');
                setShowAvatarPicker(true);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={AVATAR_PRESETS[selectedAvatarPreset].colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.avatarGradientRing,
                  {
                    width: avatarDim.ringSize,
                    height: avatarDim.ringSize,
                    borderRadius: avatarDim.borderRadius,
                  },
                ]}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={[
                      styles.avatarImage,
                      {
                        width: '100%',
                        height: '100%',
                        borderRadius: avatarDim.borderRadius - 2,
                      },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarInnerFill,
                      {
                        backgroundColor: currentTheme.bgInner,
                        borderRadius: avatarDim.borderRadius - 2,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarInitialsText,
                        { color: currentTheme.textPrimary, fontSize: avatarDim.fontSize },
                      ]}
                    >
                      {getInitials(name)}
                    </Text>
                  </View>
                )}
              </LinearGradient>

              {/* Edit Camera Icon Badge */}
              <View style={[styles.cameraIconBadge, { backgroundColor: currentTheme.primary, borderColor: currentTheme.bgBase }]}>
                <Feather name="camera" size={12} color={currentTheme.isDark ? '#050907' : '#FFFFFF'} />
              </View>
            </TouchableOpacity>


            {/* Student Name */}
            {isEditing ? (
              <TextInput
                style={[
                  styles.heroNameInput,
                  { color: currentTheme.textPrimary, borderBottomColor: currentTheme.primary },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Student Name"
                placeholderTextColor={currentTheme.textMuted}
                textAlign="center"
              />
            ) : (
              <Text style={[Typography.headlineSm, { color: currentTheme.textPrimary, textAlign: 'center', fontWeight: '700' }]}>
                {name}
              </Text>
            )}

            {/* Roll Number Pill */}
            {isEditing ? (
              <TextInput
                style={[
                  styles.heroRollInput,
                  { color: currentTheme.primary, borderBottomColor: currentTheme.primary },
                ]}
                value={rollNumber}
                onChangeText={setRollNumber}
                placeholder="Roll Number"
                placeholderTextColor={currentTheme.textMuted}
                textAlign="center"
              />
            ) : (
              <View style={styles.badgeRowContainer}>
                <View style={[styles.rollBadgePill, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}>
                  <Text style={[styles.rollBadgeText, { color: currentTheme.primary }]}>{rollNumber}</Text>
                </View>

                {/* Micro Non-Disturbing Sync Status Indicator */}
                <TouchableOpacity
                  style={[
                    styles.syncBadgePill,
                    {
                      backgroundColor: isSyncing
                        ? '#38BDF815'
                        : lastSyncTime
                        ? '#10B98115'
                        : '#F59E0B15',
                      borderColor: isSyncing
                        ? '#38BDF840'
                        : lastSyncTime
                        ? '#10B98135'
                        : '#F59E0B35',
                    },
                  ]}
                  onPress={async () => {
                    triggerHapticFeedback('light');
                    await syncToCloud();
                  }}
                  disabled={isSyncing}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.syncStatusDot,
                      {
                        backgroundColor: isSyncing
                          ? '#38BDF8'
                          : lastSyncTime
                          ? '#10B981'
                          : '#F59E0B',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.syncBadgeText,
                      {
                        color: isSyncing
                          ? '#38BDF8'
                          : lastSyncTime
                          ? '#10B981'
                          : '#F59E0B',
                      },
                    ]}
                  >
                    {isSyncing
                      ? 'Syncing...'
                      : lastSyncTime
                      ? `Synced ${lastSyncTime}`
                      : 'Offline • Local'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* College Name */}
            {isEditing ? (
              <TextInput
                style={[
                  styles.heroCollegeInput,
                  { color: currentTheme.textPrimary, borderBottomColor: currentTheme.primary },
                ]}
                value={college}
                onChangeText={setCollege}
                placeholder="University / College"
                placeholderTextColor={currentTheme.textMuted}
                textAlign="center"
              />
            ) : (
              <View style={styles.collegeRow}>
                <Feather name="map-pin" size={12} color={currentTheme.textMuted} />
                <Text style={[styles.collegeText, { color: currentTheme.textMuted }]}>{college}</Text>
              </View>
            )}
          </View>
        </EmeraldGlassCard>

        {/* 2. Show Student ID Card Action Button */}
        <TouchableOpacity
          style={[
            styles.idCardActionBtn,
            {
              backgroundColor: currentTheme.bgSurface,
              borderColor: currentTheme.primary + '40',
            },
          ]}
          onPress={() => {
            triggerHapticFeedback('selection');
            setShowIdCardModal(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.idCardBtnLeft}>
            <View style={[styles.idCardIconCircle, { backgroundColor: currentTheme.primary + '20' }]}>
              <Feather name="credit-card" size={16} color={currentTheme.primary} />
            </View>
            <View>
              <Text style={[styles.idCardBtnTitle, { color: currentTheme.textPrimary }]}>Show Student ID Card</Text>
              <Text style={[styles.idCardBtnSub, { color: currentTheme.textMuted }]}>
                Digital Student Identity, Barcode & Uploads
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={currentTheme.primary} />
        </TouchableOpacity>

        {/* 3. Academic Information Section */}
        <View style={[styles.sectionCard, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
          <View style={[styles.sectionHeaderRow, { borderBottomColor: currentTheme.borderGlass }]}>
            <Feather name="book-open" size={15} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Academic Information</Text>
          </View>

          <View style={styles.fieldsList}>
            {/* Degree & Course */}
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: currentTheme.textMuted }]}>Degree & Course</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    {
                      color: currentTheme.textPrimary,
                      backgroundColor: currentTheme.bgInner,
                      borderColor: currentTheme.primary,
                    },
                  ]}
                  value={course}
                  onChangeText={setCourse}
                  placeholder="e.g. B.Sc Computer Science"
                  placeholderTextColor={currentTheme.textMuted}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: currentTheme.textPrimary }]}>{course}</Text>
              )}
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

            {/* Roll Number / Student ID */}
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: currentTheme.textMuted }]}>Roll Number / ID</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    {
                      color: currentTheme.textPrimary,
                      backgroundColor: currentTheme.bgInner,
                      borderColor: currentTheme.primary,
                    },
                  ]}
                  value={rollNumber}
                  onChangeText={setRollNumber}
                  placeholder="e.g. 23BCSE042"
                  placeholderTextColor={currentTheme.textMuted}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: currentTheme.textPrimary }]}>{rollNumber}</Text>
              )}
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

            {/* Current Semester */}
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: currentTheme.textMuted }]}>Current Semester</Text>
              <TouchableOpacity
                style={[
                  styles.semesterSelectorBtn,
                  {
                    backgroundColor: currentTheme.primary + '18',
                    borderColor: currentTheme.primary + '40',
                  },
                ]}
                onPress={() => {
                  triggerHapticFeedback('selection');
                  setShowSemesterModal(true);
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.semesterSelectorText, { color: currentTheme.primary }]}>{semester}</Text>
                <Feather name="chevron-down" size={14} color={currentTheme.primary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

            {/* University / College */}
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: currentTheme.textMuted }]}>University / College</Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    {
                      color: currentTheme.textPrimary,
                      backgroundColor: currentTheme.bgInner,
                      borderColor: currentTheme.primary,
                    },
                  ]}
                  value={college}
                  onChangeText={setCollege}
                  placeholder="University / College"
                  placeholderTextColor={currentTheme.textMuted}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: currentTheme.textPrimary }]}>{college}</Text>
              )}
            </View>
          </View>
        </View>

        {/* 4. App Preferences (Dynamic Themes & Attendance Stepper) */}
        <View style={[styles.sectionCard, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
          <View style={[styles.sectionHeaderRow, { borderBottomColor: currentTheme.borderGlass }]}>
            <Feather name="sliders" size={15} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>App Preferences</Text>
          </View>

          {/* Theme Selection: 2 Dark & 2 Light Themes */}
          <View style={styles.themeSection}>
            <Text style={[styles.subHeadingLabel, { color: currentTheme.textMuted }]}>APPEARANCE THEME</Text>
            <View style={styles.themesGrid}>
              {THEME_OPTIONS.map((th) => {
                const isSelected = appTheme === th.id;
                return (
                  <TouchableOpacity
                    key={th.id}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: isSelected ? currentTheme.primary + '18' : currentTheme.bgCardSecondary,
                        borderColor: isSelected ? currentTheme.primary : currentTheme.borderGlass,
                      },
                    ]}
                    onPress={() => {
                      triggerHapticFeedback('selection');
                      setAppTheme(th.id as any);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.themeColorDot, { backgroundColor: th.accent }]} />
                    <Text
                      style={[
                        styles.themeCardName,
                        { color: isSelected ? currentTheme.primary : currentTheme.textMuted },
                        isSelected && styles.themeCardNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {th.name}
                    </Text>
                    <View style={[styles.themeTypeBadge, { backgroundColor: currentTheme.bgElevated }]}>
                      <Text style={[styles.themeTypeBadgeText, { color: currentTheme.textMuted }]}>
                        {th.type.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

          {/* Attendance Target Goal Adjustment (Fixed Responsive Stepper + Quick Presets) */}
          <View style={styles.goalSection}>
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: currentTheme.textPrimary }]}>Attendance Target Goal</Text>
                <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>
                  Alerts trigger when attendance falls below this goal
                </Text>
              </View>

              <View
                style={[
                  styles.stepperContainer,
                  {
                    backgroundColor: currentTheme.bgCardSecondary,
                    borderColor: currentTheme.borderGlass,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustAttendanceGoal(-1)}
                  activeOpacity={0.6}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                >
                  <Feather name="minus" size={16} color={currentTheme.textPrimary} />
                </TouchableOpacity>

                <View style={styles.stepperValueBox}>
                  <Text style={[styles.stepperValue, { color: currentTheme.primary }]}>{goal}%</Text>
                </View>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustAttendanceGoal(1)}
                  activeOpacity={0.6}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                >
                  <Feather name="plus" size={16} color={currentTheme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Target Presets Row */}
            <View style={styles.presetChipsRow}>
              {[65, 75, 80, 85, 90].map((presetVal) => {
                const isSelected = goal === presetVal;
                return (
                  <TouchableOpacity
                    key={presetVal}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isSelected ? currentTheme.primary + '25' : currentTheme.bgCardSecondary,
                        borderColor: isSelected ? currentTheme.primary : currentTheme.borderGlass,
                      },
                    ]}
                    onPress={() => setTargetPreset(presetVal)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        {
                          color: isSelected ? currentTheme.primary : currentTheme.textMuted,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {presetVal}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

          {/* Haptic Feedback Toggle */}
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: currentTheme.textPrimary }]}>Tactile Haptics</Text>
              <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>
                Vibrate on buttons, attendance changes & checkmarks
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => {
                triggerHapticFeedback('selection');
                setHapticsEnabled(val);
              }}
              trackColor={{ false: currentTheme.bgElevated, true: currentTheme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 5. Smart Notifications & Campus Alarms */}
        <View style={[styles.sectionCard, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
          <View style={[styles.sectionHeaderRow, { borderBottomColor: currentTheme.borderGlass }]}>
            <Feather name="bell" size={15} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Smart Notifications & Alarms</Text>
          </View>

          {/* 1. Class Timetable Reminders */}
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="clock" size={15} color={currentTheme.primary} />
                <Text style={[styles.fieldLabel, { color: currentTheme.textPrimary }]}>Class Reminders</Text>
              </View>
              <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>
                Alert before each timetable lecture begins
              </Text>
            </View>
            <Switch
              value={notificationPrefs.classReminders}
              onValueChange={(val) => {
                triggerHapticFeedback('selection');
                updateNotificationPrefs({ classReminders: val });
              }}
              trackColor={{ false: currentTheme.bgElevated, true: currentTheme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Lead Time Selector Chips */}
          {notificationPrefs.classReminders && (
            <View style={{ marginTop: 8, marginBottom: 8, paddingHorizontal: 2 }}>
              <Text style={[styles.subHeadingLabel, { color: currentTheme.textMuted, marginBottom: 6, fontSize: 10 }]}>
                ALERT LEAD TIME
              </Text>
              <View style={styles.presetChipsRow}>
                {[5, 10, 15].map((leadVal) => {
                  const isSelected = (notificationPrefs.classReminderLeadMinutes || 10) === leadVal;
                  return (
                    <TouchableOpacity
                      key={leadVal}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: isSelected ? currentTheme.primary + '25' : currentTheme.bgCardSecondary,
                          borderColor: isSelected ? currentTheme.primary : currentTheme.borderGlass,
                        },
                      ]}
                      onPress={() => {
                        triggerHapticFeedback('selection');
                        updateNotificationPrefs({ classReminderLeadMinutes: leadVal });
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          {
                            color: isSelected ? currentTheme.primary : currentTheme.textMuted,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {leadVal}m before
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

          {/* 2. Assignment & Task Deadlines */}
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="check-square" size={15} color={currentTheme.primary} />
                <Text style={[styles.fieldLabel, { color: currentTheme.textPrimary }]}>Task & Assignment Deadlines</Text>
              </View>
              <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>
                Alerts on the evening before & 2h before due time
              </Text>
            </View>
            <Switch
              value={notificationPrefs.taskReminders}
              onValueChange={(val) => {
                triggerHapticFeedback('selection');
                updateNotificationPrefs({ taskReminders: val });
              }}
              trackColor={{ false: currentTheme.bgElevated, true: currentTheme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

          {/* 3. 75% Attendance Safeguard */}
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="shield" size={15} color="#FF9100" />
                <Text style={[styles.fieldLabel, { color: currentTheme.textPrimary }]}>75% Attendance Safeguard</Text>
              </View>
              <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>
                Immediate warning alert when a subject drops into danger zone
              </Text>
            </View>
            <Switch
              value={notificationPrefs.attendanceAlerts}
              onValueChange={(val) => {
                triggerHapticFeedback('selection');
                updateNotificationPrefs({ attendanceAlerts: val });
              }}
              trackColor={{ false: currentTheme.bgElevated, true: currentTheme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

          {/* 4. Daily Morning Routine Briefing */}
          <View style={styles.prefRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="sun" size={15} color="#FFD600" />
                <Text style={[styles.fieldLabel, { color: currentTheme.textPrimary }]}>Morning Routine Brief</Text>
              </View>
              <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>
                8:00 AM daily overview of total classes and first room
              </Text>
            </View>
            <Switch
              value={notificationPrefs.morningBriefing}
              onValueChange={(val) => {
                triggerHapticFeedback('selection');
                updateNotificationPrefs({ morningBriefing: val });
              }}
              trackColor={{ false: currentTheme.bgElevated, true: currentTheme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 5. Data & Application Reset */}
        <View style={[styles.sectionCard, { backgroundColor: currentTheme.bgSurface, borderColor: 'rgba(255, 82, 82, 0.25)' }]}>
          <View style={[styles.sectionHeaderRow, { borderBottomColor: 'rgba(255, 82, 82, 0.2)' }]}>
            <Feather name="alert-triangle" size={15} color="#FF5252" />
            <Text style={[styles.sectionTitle, { color: '#FF5252' }]}>Data & Application Reset</Text>
          </View>
          <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>
            Reset all saved timetable schedules, attendance records, expense history, uploaded PDFs, and profile settings to return to first-time setup.
          </Text>
          <TouchableOpacity
            style={[styles.resetAllBtn, { backgroundColor: 'rgba(255, 82, 82, 0.12)', borderColor: 'rgba(255, 82, 82, 0.35)' }]}
            onPress={handleConfirmResetAll}
            activeOpacity={0.8}
          >
            <Feather name="refresh-cw" size={14} color="#FF5252" />
            <Text style={styles.resetAllBtnText}>Reset All Data & Restart Setup</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Account & Logout */}
        <View style={[styles.sectionCard, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
          <View style={[styles.sectionHeaderRow, { borderBottomColor: currentTheme.borderGlass }]}>
            <Feather name="user" size={15} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.primary }]}>Account</Text>
          </View>
          {currentUser && (
            <View style={{ gap: 4, marginBottom: 8 }}>
              <Text style={[styles.fieldLabel, { color: currentTheme.textPrimary }]}>{currentUser.name}</Text>
              <Text style={[styles.fieldHint, { color: currentTheme.textMuted }]}>{currentUser.email}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.resetAllBtn, { backgroundColor: 'rgba(255, 82, 82, 0.12)', borderColor: 'rgba(255, 82, 82, 0.35)' }]}
            onPress={async () => {
              const doLogout = async () => {
                try {
                  onBack();
                  await logout();
                } catch (e) {
                  console.warn('Logout error:', e);
                }
              };

              if (Platform.OS === 'web') {
                if (typeof window !== 'undefined' && window.confirm('Are you sure you want to log out? Your data will remain saved.')) {
                  await doLogout();
                }
                return;
              }

              Alert.alert(
                'Log Out',
                'Are you sure you want to log out? Your data will remain saved locally.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log Out', style: 'destructive', onPress: doLogout },
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={14} color="#FF5252" />
            <Text style={styles.resetAllBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Action Save/Cancel Buttons in Edit Mode */}
        {isEditing && (
          <View style={styles.editActionsRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: currentTheme.bgCardSecondary }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelBtnText, { color: currentTheme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: currentTheme.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.saveBtnText, { color: currentTheme.isDark ? '#050907' : '#FFFFFF' }]}>
                Save Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Semester Selection Modal (Semester 1 to 6) */}
      <Modal visible={showSemesterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
            <View style={[styles.modalHeader, { borderBottomColor: currentTheme.borderGlass }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.textPrimary }]}>Select Current Semester</Text>
              <TouchableOpacity onPress={() => setShowSemesterModal(false)}>
                <Feather name="x" size={18} color={currentTheme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.semesterList}>
              {SEMESTER_OPTIONS.map((sem) => {
                const isSelected = semester === sem;
                return (
                  <TouchableOpacity
                    key={sem}
                    style={[
                      styles.semesterOptionBtn,
                      { backgroundColor: isSelected ? currentTheme.primary + '20' : currentTheme.bgCardSecondary },
                      isSelected && { borderColor: currentTheme.primary, borderWidth: 1 },
                    ]}
                    onPress={() => {
                      triggerHapticFeedback('selection');
                      setSemester(sem);
                      setShowSemesterModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.semesterOptionText,
                        { color: isSelected ? currentTheme.primary : currentTheme.textMuted },
                        isSelected && styles.semesterOptionTextSelected,
                      ]}
                    >
                      {sem}
                    </Text>
                    {isSelected && <Feather name="check" size={16} color={currentTheme.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar Customization Modal (Camera, Gallery, Presets, Sizing & Delete PFP) */}
      <Modal visible={showAvatarPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
            <View style={[styles.modalHeader, { borderBottomColor: currentTheme.borderGlass }]}>
              <Text style={[styles.modalTitle, { color: currentTheme.textPrimary }]}>Profile Picture</Text>
              <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
                <Feather name="x" size={18} color={currentTheme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Upload Action Buttons */}
            <View style={styles.avatarUploadActions}>
              <TouchableOpacity
                style={[styles.uploadActionOption, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
                onPress={pickAvatarFromGallery}
                activeOpacity={0.8}
              >
                <View style={[styles.uploadActionIconBox, { backgroundColor: currentTheme.primary + '20' }]}>
                  <Feather name="image" size={18} color={currentTheme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.uploadActionTitle, { color: currentTheme.textPrimary }]}>
                    Choose from Gallery
                  </Text>
                  <Text style={[styles.uploadActionSub, { color: currentTheme.textMuted }]}>
                    Upload photo from your device
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={currentTheme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadActionOption, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
                onPress={takeAvatarPhoto}
                activeOpacity={0.8}
              >
                <View style={[styles.uploadActionIconBox, { backgroundColor: currentTheme.primary + '20' }]}>
                  <Feather name="camera" size={18} color={currentTheme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.uploadActionTitle, { color: currentTheme.textPrimary }]}>
                    Take Photo
                  </Text>
                  <Text style={[styles.uploadActionSub, { color: currentTheme.textMuted }]}>
                    Capture profile photo using camera
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={currentTheme.textMuted} />
              </TouchableOpacity>

              {avatarUri ? (
                <TouchableOpacity
                  style={[styles.uploadActionOption, { backgroundColor: 'rgba(255, 82, 82, 0.12)', borderColor: 'rgba(255, 82, 82, 0.35)' }]}
                  onPress={removeAvatarPhoto}
                  activeOpacity={0.8}
                >
                  <View style={[styles.uploadActionIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.25)' }]}>
                    <Feather name="trash-2" size={18} color="#FF5252" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.uploadActionTitle, { color: '#FF5252', fontWeight: '700' }]}>
                      Delete Profile Picture (PFP)
                    </Text>
                    <Text style={[styles.uploadActionSub, { color: currentTheme.textMuted }]}>
                      Remove photo and restore initial avatar
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={[styles.fieldDivider, { backgroundColor: currentTheme.borderGlass }]} />

            {/* Gradient Avatar Ring Style Presets */}
            <Text style={[styles.avatarPickerHint, { color: currentTheme.textMuted }]}>
              Or choose a colorful gradient style:
            </Text>

            <View style={styles.avatarPresetsRow}>
              {AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = selectedAvatarPreset === idx;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.avatarPresetItem,
                      isSelected && [styles.avatarPresetItemSelected, { borderColor: currentTheme.primary }],
                    ]}
                    onPress={() => {
                      triggerHapticFeedback('selection');
                      setSelectedAvatarPreset(idx);
                      updateProfile({ avatarPreset: idx });
                      setShowAvatarPicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={preset.colors as [string, string]}
                      style={styles.avatarPresetRing}
                    >
                      <View style={[styles.avatarPresetInner, { backgroundColor: currentTheme.bgInner }]}>
                        {avatarUri ? (
                          <Image
                            source={{ uri: avatarUri }}
                            style={{ width: '100%', height: '100%', borderRadius: 16 }}
                          />
                        ) : (
                          <Text style={styles.avatarPresetInitial}>{getInitials(name)}</Text>
                        )}
                      </View>
                    </LinearGradient>
                    <Text style={[styles.avatarPresetLabel, { color: isSelected ? currentTheme.primary : currentTheme.textMuted, fontWeight: isSelected ? '700' : '500' }]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Digital Student ID Card Modal */}
      <Modal visible={showIdCardModal} animationType="slide">
        <IdCardScreen onBack={() => setShowIdCardModal(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 70,
    gap: 14,
  },
  heroCol: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  avatarTouchable: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarGradientRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInnerFill: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
  },
  avatarInitialsText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  heroNameInput: {
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1.2,
    paddingVertical: 2,
    minWidth: 180,
  },
  rollBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 0.6,
  },
  rollBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  syncBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.6,
  },
  syncStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  heroRollInput: {
    fontSize: 13,
    fontWeight: '600',
    borderBottomWidth: 1,
    paddingVertical: 2,
    minWidth: 120,
  },
  collegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collegeText: {
    fontSize: 12,
  },
  heroCollegeInput: {
    fontSize: 12,
    borderBottomWidth: 1,
    paddingVertical: 2,
    minWidth: 180,
  },
  idCardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 0.8,
  },
  idCardBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  idCardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCardBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  idCardBtnSub: {
    fontSize: 11,
    marginTop: 1,
  },
  sectionCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.6,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  fieldsList: {
    gap: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  fieldHint: {
    fontSize: 10,
    marginTop: 1,
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  fieldInput: {
    fontSize: 12,
    borderWidth: 0.8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'right',
    minWidth: 150,
  },
  fieldDivider: {
    height: 0.6,
  },
  semesterSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.6,
  },
  semesterSelectorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeSection: {
    gap: 8,
  },
  subHeadingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeCard: {
    width: '48%',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  themeCardName: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  themeCardNameSelected: {
    fontWeight: '700',
  },
  themeTypeBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  themeTypeBadgeText: {
    fontSize: 7,
    fontWeight: '800',
  },
  goalSection: {
    gap: 8,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 0.8,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValueBox: {
    paddingHorizontal: 6,
    minWidth: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  presetChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  presetChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  presetChipText: {
    fontSize: 11,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.8,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 0.6,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  semesterList: {
    gap: 8,
  },
  semesterOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  semesterOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  semesterOptionTextSelected: {
    fontWeight: '700',
  },
  avatarUploadActions: {
    gap: 8,
  },
  uploadActionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.8,
  },
  uploadActionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadActionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  uploadActionSub: {
    fontSize: 10,
    marginTop: 1,
  },
  avatarPickerHint: {
    fontSize: 11,
  },
  avatarPresetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  avatarPresetItem: {
    alignItems: 'center',
    gap: 6,
  },
  avatarPresetItemSelected: {
    opacity: 1,
  },
  avatarPresetRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPresetInner: {
    width: '100%',
    height: '100%',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPresetInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarPresetLabel: {
    fontSize: 10,
  },
  avatarSizePillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  avatarSizeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  avatarSizeChipText: {
    fontSize: 11,
  },
  resetAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 0.8,
    marginTop: 6,
  },
  resetAllBtnText: {
    color: '#FF5252',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSizePillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  sizePillText: {
    fontSize: 11,
  },
});
