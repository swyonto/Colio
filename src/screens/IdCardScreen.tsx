import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { EmeraldButton, GlassButton } from '../components/common/Buttons';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { triggerHapticFeedback } from '../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const IdCardScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { profile, updateProfile, currentTheme } = useCampus();
  const [isBackSide, setIsBackSide] = useState(false);
  const [cardRotation, setCardRotation] = useState(0);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [fullscreenRotation, setFullscreenRotation] = useState(0);

  const currentImageUri = isBackSide ? profile.idCardBackUri : profile.idCardFrontUri;

  const pickCardImage = async (side: 'front' | 'back', source: 'gallery' | 'camera') => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Camera Permission Required', 'Please enable camera permissions to photograph your ID card.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.9,
        });
        if (!result.canceled && result.assets && result.assets[0]?.uri) {
          const uri = result.assets[0].uri;
          if (side === 'front') {
            updateProfile({ idCardFrontUri: uri });
          } else {
            updateProfile({ idCardBackUri: uri });
          }
          triggerHapticFeedback('success');
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please enable gallery permissions to upload your ID card.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.9,
        });
        if (!result.canceled && result.assets && result.assets[0]?.uri) {
          const uri = result.assets[0].uri;
          if (side === 'front') {
            updateProfile({ idCardFrontUri: uri });
          } else {
            updateProfile({ idCardBackUri: uri });
          }
          triggerHapticFeedback('success');
        }
      }
    } catch (err) {
      console.warn('ID card upload error:', err);
    }
  };

  const promptUploadOptions = (side: 'front' | 'back') => {
    Alert.alert(
      `Upload ${side === 'front' ? 'Front' : 'Back'} ID Card`,
      'Choose source to upload your physical ID card photo:',
      [
        {
          text: 'Choose from Gallery',
          onPress: () => pickCardImage(side, 'gallery'),
        },
        {
          text: 'Take Photo with Camera',
          onPress: () => pickCardImage(side, 'camera'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const removeCardImage = (side: 'front' | 'back') => {
    triggerHapticFeedback('warning');
    if (side === 'front') {
      updateProfile({ idCardFrontUri: '' });
    } else {
      updateProfile({ idCardBackUri: '' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: currentTheme.bgSurface, borderBottomColor: currentTheme.borderGlass }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: currentTheme.bgCardSecondary }]}>
            <Feather name="arrow-left" size={20} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleLg, { color: currentTheme.textPrimary }]}>Student ID Card</Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.textMuted }]}>
            Official Credentials & Gate Pass
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Front / Back Card Tab Pills */}
        <View style={[styles.tabPillRow, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
          <TouchableOpacity
            style={[
              styles.tabPill,
              !isBackSide && [styles.tabPillActive, { backgroundColor: currentTheme.primary + '25' }],
            ]}
            onPress={() => {
              triggerHapticFeedback('selection');
              setIsBackSide(false);
            }}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: !isBackSide ? currentTheme.primary : currentTheme.textMuted },
                !isBackSide && styles.tabPillTextActive,
              ]}
            >
              Front Side {profile.idCardFrontUri ? '✓' : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              isBackSide && [styles.tabPillActive, { backgroundColor: currentTheme.primary + '25' }],
            ]}
            onPress={() => {
              triggerHapticFeedback('selection');
              setIsBackSide(true);
            }}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: isBackSide ? currentTheme.primary : currentTheme.textMuted },
                isBackSide && styles.tabPillTextActive,
              ]}
            >
              Back Side {profile.idCardBackUri ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CARD CONTAINER (Renders Uploaded Photo OR Digital Simulated Card) */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            triggerHapticFeedback('selection');
            if (currentImageUri) {
              setFullscreenRotation(cardRotation);
              setIsFullscreenPreview(true);
            } else {
              promptUploadOptions(isBackSide ? 'back' : 'front');
            }
          }}
        >
          <View
            style={[
              styles.cardOuter,
              { borderColor: currentTheme.primary + '50' },
              currentImageUri ? styles.cardOuterWithImage : styles.cardOuterDigital,
            ]}
          >
            {/* Background Gradient */}
            <LinearGradient
              colors={[currentTheme.bgCard, currentTheme.bgCardSecondary, currentTheme.bgElevated]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* If User Has Uploaded an ID Card Image for this side */}
            {currentImageUri ? (
              <View style={styles.uploadedCardContainer}>
                <Image
                  source={{ uri: currentImageUri }}
                  style={[
                    styles.uploadedCardImage,
                    { transform: [{ rotate: `${cardRotation}deg` }] },
                  ]}
                  resizeMode={cardRotation % 180 !== 0 ? 'contain' : 'cover'}
                />
              </View>
            ) : !isBackSide ? (
              /* DIGITAL SIMULATED FRONT OF ID CARD */
              <View style={styles.cardInnerFront}>
                {/* Institution Header */}
                <View style={styles.idCardHeader}>
                  <View style={styles.idLogoGroup}>
                    <View style={[styles.idGradCapCircle, { backgroundColor: currentTheme.primary + '30', borderColor: currentTheme.primary }]}>
                      <MaterialIcons name="school" size={18} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={[styles.collegeName, { color: currentTheme.textPrimary }]}>
                        {profile.college || 'National Institute of Technology'}
                      </Text>
                      <Text style={[styles.appNicknameTag, { color: currentTheme.primary }]}>
                        {profile.appNickname || 'CampusHub'} Student Card
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.validityBadge, { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary }]}>
                    <Text style={[styles.validityText, { color: currentTheme.primary }]}>VALID 2023–2027</Text>
                  </View>
                </View>

                {/* Student Profile Row */}
                <View style={styles.studentDetailsRow}>
                  {/* Student Photo */}
                  <View style={[styles.photoContainer, { borderColor: currentTheme.primary + '60' }]}>
                    {profile.avatarUri ? (
                      <Image source={{ uri: profile.avatarUri }} style={styles.photoAvatar} />
                    ) : (
                      <LinearGradient colors={[currentTheme.bgCardSecondary, currentTheme.bgSurface]} style={styles.photoInner}>
                        <Feather name="user" size={36} color={currentTheme.primary} />
                      </LinearGradient>
                    )}
                    <View style={[styles.photoActiveDot, { backgroundColor: currentTheme.primary }]} />
                  </View>

                  {/* Info Column */}
                  <View style={styles.infoCol}>
                    <Text style={[Typography.titleMd, { color: currentTheme.textPrimary }]}>
                      {profile.name || 'Student Name'}
                    </Text>
                    <Text style={[styles.rollNumberText, { color: currentTheme.textSecondary }]}>
                      Roll No: <Text style={{ color: currentTheme.primary, fontWeight: '700' }}>{profile.rollNumber || '23BCSE042'}</Text>
                    </Text>

                    <View style={styles.detailPair}>
                      <Text style={[styles.detailLabel, { color: currentTheme.textMuted }]}>Course:</Text>
                      <Text style={[styles.detailVal, { color: currentTheme.textPrimary }]}>{profile.course || 'B.Tech Computer Science'}</Text>
                    </View>

                    <View style={styles.detailPair}>
                      <Text style={[styles.detailLabel, { color: currentTheme.textMuted }]}>Branch:</Text>
                      <Text style={[styles.detailVal, { color: currentTheme.textPrimary }]}>{profile.branch || 'CSE - Core'}</Text>
                    </View>

                    <View style={styles.detailPair}>
                      <Text style={[styles.detailLabel, { color: currentTheme.textMuted }]}>Semester:</Text>
                      <Text style={[styles.detailVal, { color: currentTheme.textPrimary }]}>{profile.semester || 'Semester 5'}</Text>
                    </View>
                  </View>
                </View>

                {/* Card Footer with Hologram & Barcode */}
                <View style={[styles.idCardFooter, { borderTopColor: currentTheme.borderGlass }]}>
                  <View style={styles.barcodeBox}>
                    <Text style={[styles.barcodeLines, { color: currentTheme.textSecondary }]}>||| | |||| | ||| ||||| || |||| |||</Text>
                    <Text style={[styles.barcodeId, { color: currentTheme.textMuted }]}>{profile.rollNumber || '23BCSE042'}</Text>
                  </View>
                  <View style={[styles.hologramStamp, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary }]}>
                    <Feather name="shield" size={14} color={currentTheme.primary} />
                    <Text style={[styles.hologramText, { color: currentTheme.primary }]}>AUTHENTIC</Text>
                  </View>
                </View>
              </View>
            ) : (
              /* DIGITAL SIMULATED BACK OF ID CARD */
              <View style={styles.cardInnerBack}>
                <Text style={[Typography.overline, { color: currentTheme.primary }]}>TERMS & INSTRUCTIONS</Text>
                <Text style={[styles.backClauseText, { color: currentTheme.textSecondary }]}>
                  1. This card is non-transferable and must be presented on demand by college security and library staff.
                </Text>
                <Text style={[styles.backClauseText, { color: currentTheme.textSecondary }]}>
                  2. If found, please return to NIT Academic Cell, Student Affairs Office.
                </Text>
                <Text style={[styles.backClauseText, { color: currentTheme.textSecondary }]}>
                  3. Emergency Contact: +91 98765 43210 (Campus Security)
                </Text>

                <View style={[styles.qrCodeBox, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.primary + '40' }]}>
                  <Feather name="grid" size={42} color={currentTheme.textPrimary} />
                  <Text style={[styles.qrCodeHint, { color: currentTheme.textMuted }]}>Scan for Digital Verification</Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Buttons: Fullscreen Preview / Upload + Rotate to Landscape */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={[styles.previewActionBtn, { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary }]}
            onPress={() => {
              triggerHapticFeedback('selection');
              if (currentImageUri) {
                setFullscreenRotation(cardRotation);
                setIsFullscreenPreview(true);
              } else {
                promptUploadOptions(isBackSide ? 'back' : 'front');
              }
            }}
            activeOpacity={0.8}
          >
            <Feather name={currentImageUri ? 'maximize-2' : 'camera'} size={15} color={currentTheme.primary} />
            <Text style={[styles.previewActionBtnText, { color: currentTheme.primary }]}>
              {currentImageUri ? 'Fullscreen Preview' : `Upload ${isBackSide ? 'Back' : 'Front'} Photo`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.previewActionBtn, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}
            onPress={() => {
              triggerHapticFeedback('selection');
              setCardRotation((prev) => (prev + 90) % 360);
            }}
            activeOpacity={0.8}
          >
            <Feather name="rotate-cw" size={15} color={currentTheme.textPrimary} />
            <Text style={[styles.previewActionBtnText, { color: currentTheme.textPrimary }]}>
              {cardRotation === 0 ? 'Rotate to Landscape' : `Rotate (${cardRotation}°)`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upload Physical Card Section */}
        <View style={[styles.uploadSectionCard, { backgroundColor: currentTheme.bgSurface, borderColor: currentTheme.borderGlass }]}>
          <View style={styles.uploadSectionHeader}>
            <Feather name="upload-cloud" size={16} color={currentTheme.primary} />
            <Text style={[styles.uploadSectionTitle, { color: currentTheme.textPrimary }]}>
              Upload Physical ID Card Photo
            </Text>
          </View>
          <Text style={[styles.uploadSectionSub, { color: currentTheme.textMuted }]}>
            Upload photos of your real college ID card to preview either side anytime:
          </Text>

          {/* Front Side Upload Row */}
          <View style={[styles.uploadRow, { borderBottomColor: currentTheme.borderGlass }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.uploadLabel, { color: currentTheme.textPrimary }]}>
                Front Side Photo
              </Text>
              <Text style={[styles.uploadStatus, { color: profile.idCardFrontUri ? currentTheme.primary : currentTheme.textMuted }]}>
                {profile.idCardFrontUri ? '✓ Front Card Uploaded' : 'Not uploaded yet (using digital card)'}
              </Text>
            </View>

            <View style={styles.uploadBtnGroup}>
              <TouchableOpacity
                style={[styles.uploadBtn, { backgroundColor: currentTheme.primary }]}
                onPress={() => promptUploadOptions('front')}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={13} color="#050907" />
                <Text style={styles.uploadBtnText}>
                  {profile.idCardFrontUri ? 'Change' : 'Upload'}
                </Text>
              </TouchableOpacity>

              {profile.idCardFrontUri ? (
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: 'rgba(255, 82, 82, 0.15)' }]}
                  onPress={() => removeCardImage('front')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={14} color="#FF5252" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Back Side Upload Row */}
          <View style={styles.uploadRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.uploadLabel, { color: currentTheme.textPrimary }]}>
                Back Side Photo
              </Text>
              <Text style={[styles.uploadStatus, { color: profile.idCardBackUri ? currentTheme.primary : currentTheme.textMuted }]}>
                {profile.idCardBackUri ? '✓ Back Card Uploaded' : 'Not uploaded yet (using digital card)'}
              </Text>
            </View>

            <View style={styles.uploadBtnGroup}>
              <TouchableOpacity
                style={[styles.uploadBtn, { backgroundColor: currentTheme.primary }]}
                onPress={() => promptUploadOptions('back')}
                activeOpacity={0.8}
              >
                <Feather name="camera" size={13} color="#050907" />
                <Text style={styles.uploadBtnText}>
                  {profile.idCardBackUri ? 'Change' : 'Upload'}
                </Text>
              </TouchableOpacity>

              {profile.idCardBackUri ? (
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: 'rgba(255, 82, 82, 0.15)' }]}
                  onPress={() => removeCardImage('back')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={14} color="#FF5252" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FULLSCREEN PREVIEW MODAL (With Rotate to Landscape & Front / Back Controls) */}
      <Modal visible={isFullscreenPreview} transparent animationType="fade">
        <View style={styles.fullscreenModalOverlay}>
          {/* Header Controls */}
          <View style={styles.fullscreenHeaderRow}>
            <TouchableOpacity
              style={styles.fullscreenControlBtn}
              onPress={() => setIsFullscreenPreview(false)}
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.fullscreenControlsGroup}>
              {/* Flip Side */}
              <TouchableOpacity
                style={styles.fullscreenControlPill}
                onPress={() => {
                  triggerHapticFeedback('selection');
                  setIsBackSide(!isBackSide);
                }}
              >
                <Feather name="repeat" size={14} color="#FFFFFF" />
                <Text style={styles.fullscreenControlText}>
                  {isBackSide ? 'Back' : 'Front'}
                </Text>
              </TouchableOpacity>

              {/* Rotate to Landscape / 90° */}
              <TouchableOpacity
                style={styles.fullscreenControlPill}
                onPress={() => {
                  triggerHapticFeedback('selection');
                  setFullscreenRotation((prev) => (prev + 90) % 360);
                }}
              >
                <Feather name="rotate-cw" size={14} color="#FFFFFF" />
                <Text style={styles.fullscreenControlText}>
                  {fullscreenRotation === 0 ? 'Rotate to Landscape' : `Rotated ${fullscreenRotation}°`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fullscreen Card Container */}
          <View style={styles.fullscreenCardWrapper}>
            <View
              style={[
                styles.fullscreenCardInner,
                fullscreenRotation % 180 !== 0 ? styles.fullscreenCardLandscapeRotated : styles.fullscreenCardNormal,
                {
                  transform: [{ rotate: `${fullscreenRotation}deg` }],
                },
              ]}
            >
              {currentImageUri ? (
                <Image
                  source={{ uri: currentImageUri }}
                  style={styles.fullscreenCardImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.fullscreenFallbackNotice}>
                  <Text style={[styles.collegeName, { color: '#FFFFFF', fontSize: 16 }]}>
                    {profile.college || 'National Institute of Technology'}
                  </Text>
                  <Text style={{ color: currentTheme.primary, fontSize: 14, fontWeight: '700', marginTop: 4 }}>
                    {profile.name} • {profile.rollNumber}
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                    {profile.course} • {profile.semester}
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 11, marginTop: 12 }}>
                    {isBackSide ? 'Back Side • Scan for Verification' : 'Front Side • Student Identity'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 12,
    borderBottomWidth: 0.6,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 0.8,
  },
  toggleBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  tabPillRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 0.6,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabPillActive: {},
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabPillTextActive: {
    fontWeight: '700',
  },
  cardOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.2,
  },
  cardOuterDigital: {
    minHeight: 280,
  },
  cardOuterWithImage: {
    width: '100%',
    aspectRatio: 1.586,
  },
  uploadedCardContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadedCardImage: {
    width: '100%',
    height: '100%',
  },
  cardInnerFront: {
    padding: 18,
    gap: 16,
  },
  cardInnerFrontLandscape: {
    padding: 14,
    gap: 10,
  },
  cardInnerBack: {
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  idLogoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  idGradCapCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeName: {
    fontSize: 12,
    fontWeight: '700',
  },
  appNicknameTag: {
    fontSize: 10,
    fontWeight: '600',
  },
  validityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  validityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  studentDetailsRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  studentDetailsRowLandscape: {
    gap: 10,
  },
  photoContainer: {
    width: 78,
    height: 94,
    borderRadius: 10,
    borderWidth: 1.2,
    overflow: 'hidden',
    position: 'relative',
  },
  photoAvatar: {
    width: '100%',
    height: '100%',
  },
  photoInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoActiveDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  rollNumberText: {
    fontSize: 12,
  },
  detailPair: {
    flexDirection: 'row',
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    width: 60,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.6,
    paddingTop: 10,
  },
  barcodeBox: {
    gap: 2,
  },
  barcodeLines: {
    letterSpacing: 2,
    fontSize: 13,
    fontWeight: '900',
  },
  barcodeId: {
    fontSize: 9,
  },
  hologramStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.6,
  },
  hologramText: {
    fontSize: 9,
    fontWeight: '800',
  },
  backClauseText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  qrCodeBox: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.6,
  },
  qrCodeHint: {
    fontSize: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  previewActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  uploadSectionCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.8,
    gap: 10,
  },
  uploadSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  uploadSectionSub: {
    fontSize: 11,
    marginBottom: 4,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.6,
  },
  uploadLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadStatus: {
    fontSize: 11,
    marginTop: 2,
  },
  uploadBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: '#050907',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fullscreenModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    padding: 16,
    justifyContent: 'center',
  },
  fullscreenHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 20,
  },
  fullscreenControlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenControlsGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  fullscreenControlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullscreenControlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenCardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCardInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCardNormal: {
    width: Math.min(SCREEN_WIDTH - 32, 420),
    aspectRatio: 1.586,
  },
  fullscreenCardLandscapeRotated: {
    width: Math.min(SCREEN_HEIGHT * 0.72, 580),
    aspectRatio: 1.586,
  },
  fullscreenCardImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenFallbackNotice: {
    padding: 24,
    backgroundColor: '#0F1511',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    width: '90%',
  },
});
