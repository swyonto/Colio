import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';

interface MoreScreenProps {
  onOpenSection: (section: string) => void;
  onOpenProfile: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onOpenSection, onOpenProfile }) => {
  const { profile, documents, holidays, pendingTasksCount, currentTheme } = useCampus();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.bgBase }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Student Profile Overview Card */}
      <EmeraldGlassCard onPress={onOpenProfile}>
        <View style={styles.profileRow}>
          <View style={[styles.avatarCircle, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.primary }]}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
            ) : (
              <Text style={[styles.avatarText, { color: currentTheme.primary }]}>
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'ST'}
              </Text>
            )}
          </View>

          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.nameHeaderRow}>
              <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>{profile.name}</Text>
              <Feather name="edit-2" size={14} color={currentTheme.primary} />
            </View>
            <Text style={[styles.profileMeta, { color: currentTheme.textSecondary }]}>
              {profile.rollNumber} • {profile.course}
            </Text>
            <Text style={[styles.profileCollege, { color: currentTheme.textMuted }]}>{profile.college}</Text>
          </View>
        </View>

        <View style={[styles.appNicknameBadgeRow, { borderTopColor: currentTheme.borderGlass }]}>
          <Text style={[styles.appNicknameLabel, { color: currentTheme.textMuted }]}>App Header Display Name:</Text>
          <View style={[styles.appNicknamePill, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '40' }]}>
            <Text style={[styles.appNicknameVal, { color: currentTheme.primary }]}>"{profile.appNickname || 'Colio'}"</Text>
          </View>
        </View>
      </EmeraldGlassCard>

      {/* Academic Modules Hub */}
      <View style={styles.modulesSection}>
        <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>ACADEMIC SUITE</Text>

        {/* 1. Books & Documents */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={() => onOpenSection('books')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '35' }]}>
            <MaterialIcons name="picture-as-pdf" size={22} color={currentTheme.primary} />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>Books & PDFs</Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>{documents.length} offline cached academic documents</Text>
          </View>
          <Feather name="chevron-right" size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>

        {/* 2. Digital ID Card */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={() => onOpenSection('idcard')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '35' }]}>
            <Feather name="credit-card" size={20} color={currentTheme.primary} />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>Digital Student ID</Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>Fullscreen & landscape security card</Text>
          </View>
          <Feather name="chevron-right" size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>

        {/* 3. Holidays & Leaves */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={() => onOpenSection('holidays')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: '#FFD60020', borderColor: '#FFD60040' }]}>
            <MaterialIcons name="event-available" size={22} color="#FFD600" />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>Academic Calendar & Leaves</Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>{holidays.length} semester breaks & duty leaves</Text>
          </View>
          <Feather name="chevron-right" size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>

        {/* 4. CGPA Calculator */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={() => onOpenSection('cgpa')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: '#00B0FF20', borderColor: '#00B0FF40' }]}>
            <Feather name="award" size={20} color="#00B0FF" />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>CGPA & Target Forecaster</Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>Semester grade & target SGPA simulator</Text>
          </View>
          <Feather name="chevron-right" size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>

        {/* 5. Tasks & Deadlines */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={() => onOpenSection('tasks')}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: '#FF910020', borderColor: '#FF910040' }]}>
            <Feather name="check-square" size={20} color="#FF9100" />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>Tasks & Deadlines</Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>{pendingTasksCount} pending assignments & quizzes</Text>
          </View>
          <Feather name="chevron-right" size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* App Version Info */}
      <View style={[styles.appInfoCard, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
        <View style={styles.appBadgeRow}>
          <MaterialIcons name="school" size={18} color={currentTheme.primary} />
          <Text style={[styles.appInfoTitle, { color: currentTheme.textPrimary }]}>Colio</Text>
          <View style={[styles.versionTag, { backgroundColor: currentTheme.primary + '20' }]}>
            <Text style={[styles.versionText, { color: currentTheme.primary }]}>v2.0 Production</Text>
          </View>
        </View>
        <Text style={[styles.appInfoDesc, { color: currentTheme.textMuted }]}>
          Offline-first student academic operating system. Pure glassmorphism with dynamic theme personalization.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  nameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileMeta: {
    fontSize: 12,
  },
  profileCollege: {
    fontSize: 11,
  },
  appNicknameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 0.6,
    paddingTop: 8,
  },
  appNicknameLabel: {
    fontSize: 11,
  },
  appNicknamePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  appNicknameVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  modulesSection: {
    gap: 10,
  },
  hubTile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.7,
    gap: 12,
  },
  tileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileInfo: {
    flex: 1,
    gap: 2,
  },
  tileSubtitle: {
    fontSize: 11,
  },
  appInfoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.6,
    gap: 6,
    alignItems: 'center',
  },
  appBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '800',
  },
  appInfoDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
