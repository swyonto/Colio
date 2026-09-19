import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';

interface MoreScreenProps {
  onOpenSection: (section: string) => void;
  onOpenProfile: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onOpenSection, onOpenProfile }) => {
  const { profile, documents, holidays, pendingTasksCount } = useCampus();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Student Profile Overview Card */}
      <EmeraldGlassCard onPress={onOpenProfile}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'ST'}
            </Text>
          </View>

          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.nameHeaderRow}>
              <Text style={[Typography.titleMd, styles.profileName]}>{profile.name}</Text>
              <Feather name="edit-2" size={14} color={Colors.emeraldPrimary} />
            </View>
            <Text style={styles.profileMeta}>
              {profile.rollNumber} • {profile.course}
            </Text>
            <Text style={styles.profileCollege}>{profile.college}</Text>
          </View>
        </View>

        <View style={styles.appNicknameBadgeRow}>
          <Text style={styles.appNicknameLabel}>App Header Display Name:</Text>
          <View style={styles.appNicknamePill}>
            <Text style={styles.appNicknameVal}>"{profile.appNickname || 'CampusHub'}"</Text>
          </View>
        </View>
      </EmeraldGlassCard>

      {/* Academic Modules Hub */}
      <View style={styles.modulesSection}>
        <Text style={[Typography.overline, { color: Colors.textMuted }]}>ACADEMIC SUITE</Text>

        {/* 1. Books & Documents */}
        <TouchableOpacity
          style={styles.hubTile}
          onPress={() => onOpenSection('books')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: 'rgba(105, 240, 174, 0.12)' }]}>
            <MaterialIcons name="picture-as-pdf" size={22} color={Colors.emeraldHighlight} />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, styles.tileTitle]}>Books & PDFs</Text>
            <Text style={styles.tileSubtitle}>{documents.length} offline cached academic documents</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* 2. Digital ID Card */}
        <TouchableOpacity
          style={styles.hubTile}
          onPress={() => onOpenSection('idcard')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
            <Feather name="credit-card" size={20} color={Colors.emeraldPrimary} />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, styles.tileTitle]}>Digital Student ID</Text>
            <Text style={styles.tileSubtitle}>Fullscreen & landscape security card</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* 3. Holidays & Leaves */}
        <TouchableOpacity
          style={styles.hubTile}
          onPress={() => onOpenSection('holidays')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: 'rgba(255, 193, 7, 0.12)' }]}>
            <Feather name="sun" size={20} color={Colors.statusHoliday} />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, styles.tileTitle]}>Academic Holidays</Text>
            <Text style={styles.tileSubtitle}>{holidays.length} upcoming gazetted holidays & duty leaves</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* 4. CGPA Calculator */}
        <TouchableOpacity
          style={styles.hubTile}
          onPress={() => onOpenSection('cgpa')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: 'rgba(0, 176, 255, 0.12)' }]}>
            <Feather name="award" size={20} color="#00B0FF" />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, styles.tileTitle]}>CGPA Calculator</Text>
            <Text style={styles.tileSubtitle}>Weighted semester SGPA & target estimator</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* 5. Full Tasks List */}
        <TouchableOpacity
          style={styles.hubTile}
          onPress={() => onOpenSection('tasks')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: 'rgba(255, 171, 64, 0.12)' }]}>
            <Feather name="check-square" size={20} color={Colors.statusPending} />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, styles.tileTitle]}>Tasks & Deadlines</Text>
            <Text style={styles.tileSubtitle}>{pendingTasksCount} pending assignments & quizzes</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* App Version Info */}
      <View style={styles.appInfoCard}>
        <View style={styles.appBadgeRow}>
          <MaterialIcons name="school" size={18} color={Colors.emeraldPrimary} />
          <Text style={styles.appInfoTitle}>CampusOS</Text>
          <View style={styles.versionTag}>
            <Text style={styles.versionText}>v2.1 Dark Emerald</Text>
          </View>
        </View>
        <Text style={styles.appInfoDesc}>
          Offline-first student academic companion. Pure charcoal Supabase-style glassmorphism with emerald lighting.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#161C18',
    borderWidth: 1.2,
    borderColor: Colors.emeraldPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.emeraldPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  nameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    color: Colors.textPrimary,
  },
  profileMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  profileCollege: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  appNicknameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  appNicknameLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  appNicknamePill: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  appNicknameVal: {
    color: Colors.emeraldHighlight,
    fontSize: 11,
    fontWeight: '700',
  },
  modulesSection: {
    gap: 10,
  },
  hubTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1210',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  tileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileInfo: {
    flex: 1,
    gap: 2,
  },
  tileTitle: {
    color: Colors.textPrimary,
  },
  tileSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  appInfoCard: {
    backgroundColor: '#0A0D0B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.6,
    borderColor: 'rgba(0, 230, 118, 0.20)',
    gap: 6,
    alignItems: 'center',
  },
  appBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appInfoTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  versionTag: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  versionText: {
    color: Colors.emeraldPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  appInfoDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
