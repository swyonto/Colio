import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { EmeraldButton } from '../components/common/Buttons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';

export const IdCardScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { profile } = useCampus();
  const [isLandscape, setIsLandscape] = useState(false);
  const [isBackSide, setIsBackSide] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.headerBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleLg, styles.headerTitle]}>Digital ID Card</Text>
          <Text style={styles.headerSubtitle}>Official Student Credentials</Text>
        </View>

        {/* Landscape Mode Toggle (Section 11.2) */}
        <TouchableOpacity
          onPress={() => setIsLandscape(!isLandscape)}
          style={[styles.toggleBtn, isLandscape && styles.toggleBtnActive]}
        >
          <Feather name="rotate-cw" size={16} color={isLandscape ? Colors.emeraldPrimary : Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Front / Back Card */}
        <View style={styles.tabPillRow}>
          <TouchableOpacity
            style={[styles.tabPill, !isBackSide && styles.tabPillActive]}
            onPress={() => setIsBackSide(false)}
          >
            <Text style={[styles.tabPillText, !isBackSide && styles.tabPillTextActive]}>
              Front Side
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabPill, isBackSide && styles.tabPillActive]}
            onPress={() => setIsBackSide(true)}
          >
            <Text style={[styles.tabPillText, isBackSide && styles.tabPillTextActive]}>
              Back Side
            </Text>
          </TouchableOpacity>
        </View>

        {/* Digital ID Card Physical Simulation */}
        <View style={[styles.cardOuter, isLandscape && styles.cardOuterLandscape]}>
          <LinearGradient
            colors={['#101512', '#0A0E0C', '#141A16']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Subtle Emerald Watermark Glow */}
          <LinearGradient
            colors={['rgba(0, 230, 118, 0.15)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 0.8 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardBorder} />

          {!isBackSide ? (
            /* FRONT OF ID CARD */
            <View style={styles.cardInnerFront}>
              {/* Institution Header */}
              <View style={styles.idCardHeader}>
                <View style={styles.idLogoGroup}>
                  <View style={styles.idGradCapCircle}>
                    <MaterialIcons name="school" size={18} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.collegeName}>{profile.college || 'National Institute of Technology'}</Text>
                    <Text style={styles.appNicknameTag}>{profile.appNickname || 'CampusHub'} Student Card</Text>
                  </View>
                </View>

                <View style={styles.validityBadge}>
                  <Text style={styles.validityText}>VALID 2023–2027</Text>
                </View>
              </View>

              {/* Student Profile Row */}
              <View style={styles.studentDetailsRow}>
                {/* Photo Placeholder */}
                <View style={styles.photoContainer}>
                  <LinearGradient colors={['#1C2420', '#121815']} style={styles.photoInner}>
                    <Feather name="user" size={36} color={Colors.emeraldPrimary} />
                  </LinearGradient>
                  <View style={styles.photoActiveDot} />
                </View>

                {/* Info Column */}
                <View style={styles.infoCol}>
                  <Text style={[Typography.titleMd, styles.studentNameText]}>
                    {profile.name || 'Aarav Sharma'}
                  </Text>
                  <Text style={styles.rollNumberText}>
                    Roll No: <Text style={{ color: Colors.emeraldHighlight, fontWeight: '700' }}>{profile.rollNumber || '23BCSE042'}</Text>
                  </Text>

                  <View style={styles.detailPair}>
                    <Text style={styles.detailLabel}>Course:</Text>
                    <Text style={styles.detailVal}>{profile.course || 'B.Tech Computer Science'}</Text>
                  </View>

                  <View style={styles.detailPair}>
                    <Text style={styles.detailLabel}>Branch:</Text>
                    <Text style={styles.detailVal}>{profile.branch || 'CSE - Core'}</Text>
                  </View>

                  <View style={styles.detailPair}>
                    <Text style={styles.detailLabel}>Semester:</Text>
                    <Text style={styles.detailVal}>{profile.semester || 'Semester 5'}</Text>
                  </View>
                </View>
              </View>

              {/* Card Footer with Hologram & Barcode */}
              <View style={styles.idCardFooter}>
                <View style={styles.barcodeBox}>
                  <Text style={styles.barcodeLines}>||| | |||| | ||| ||||| || |||| |||</Text>
                  <Text style={styles.barcodeId}>{profile.rollNumber || '23BCSE042'}</Text>
                </View>
                <View style={styles.hologramStamp}>
                  <Feather name="shield" size={14} color={Colors.emeraldPrimary} />
                  <Text style={styles.hologramText}>AUTHENTIC</Text>
                </View>
              </View>
            </View>
          ) : (
            /* BACK OF ID CARD */
            <View style={styles.cardInnerBack}>
              <Text style={[Typography.overline, { color: Colors.emeraldHighlight }]}>TERMS & INSTRUCTIONS</Text>
              <Text style={styles.backClauseText}>
                1. This card is non-transferable and must be presented on demand by college security and library staff.
              </Text>
              <Text style={styles.backClauseText}>
                2. If found, please return to NIT Academic Cell, Student Affairs Office.
              </Text>
              <Text style={styles.backClauseText}>
                3. Emergency Contact: +91 98765 43210 (Campus Security)
              </Text>

              <View style={styles.qrCodeBox}>
                <Feather name="grid" size={42} color={Colors.textPrimary} />
                <Text style={styles.qrCodeHint}>Scan for Digital Verification</Text>
              </View>
            </View>
          )}
        </View>

        {/* Security & Access Notice */}
        <EmeraldGlassCard>
          <View style={styles.secureNoticeRow}>
            <Feather name="lock" size={18} color={Colors.emeraldPrimary} />
            <View style={{ flex: 1 }}>
              <Text style={[Typography.titleSm, { color: Colors.textPrimary }]}>
                Offline Cryptographic Stamp
              </Text>
              <Text style={[Typography.bodySm, { color: Colors.textMuted, marginTop: 2 }]}>
                Digital credentials are stored locally on your device for fast gate pass verification.
              </Text>
            </View>
          </View>
        </EmeraldGlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 12,
    backgroundColor: '#0A0E0C',
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#131714',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121614',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: Colors.emeraldPrimary,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
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
    backgroundColor: '#0F1210',
    borderRadius: 12,
    padding: 4,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabPillActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.18)',
  },
  tabPillText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabPillTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  cardOuter: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0B0F0D',
    minHeight: 280,
  },
  cardOuterLandscape: {
    minHeight: 230,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.35)',
  },
  cardInnerFront: {
    padding: 18,
    gap: 16,
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
    backgroundColor: 'rgba(0, 230, 118, 0.25)',
    borderWidth: 1,
    borderColor: Colors.emeraldPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  appNicknameTag: {
    color: Colors.emeraldHighlight,
    fontSize: 10,
    fontWeight: '600',
  },
  validityBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.emeraldPrimary,
  },
  validityText: {
    color: Colors.emeraldPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
  studentDetailsRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  photoContainer: {
    width: 78,
    height: 94,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 230, 118, 0.45)',
    overflow: 'hidden',
    position: 'relative',
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
    backgroundColor: Colors.emeraldPrimary,
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  studentNameText: {
    color: Colors.textPrimary,
  },
  rollNumberText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  detailPair: {
    flexDirection: 'row',
    gap: 6,
  },
  detailLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    width: 60,
  },
  detailVal: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  barcodeBox: {
    gap: 2,
  },
  barcodeLines: {
    color: Colors.textSecondary,
    letterSpacing: 2,
    fontSize: 13,
    fontWeight: '900',
  },
  barcodeId: {
    color: Colors.textMuted,
    fontSize: 9,
  },
  hologramStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.6,
    borderColor: Colors.emeraldPrimary,
  },
  hologramText: {
    color: Colors.emeraldPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
  backClauseText: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  qrCodeBox: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#121614',
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  qrCodeHint: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  secureNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
