import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { sendInstantTestNotification } from '../services/notifications';

interface MoreScreenProps {
  onOpenSection: (section: string) => void;
  onOpenProfile: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onOpenSection, onOpenProfile }) => {
  const { profile, documents, holidays, pendingTasksCount, currentTheme, syncToCloud, restoreFromCloud, lastSyncTime } = useCampus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleCloudBackup = async () => {
    setIsSyncing(true);
    const success = await syncToCloud();
    setIsSyncing(false);
    if (success) {
      Alert.alert('Cloud Backup Successful ☁️', 'Your timetable, attendance, tasks, and expenses are now securely synced to Google Firebase Firestore.');
    } else {
      Alert.alert('Backup Notice', 'Could not sync to cloud. Please check your internet connection and try again.');
    }
  };

  const handleCloudRestore = () => {
    Alert.alert(
      'Restore From Firebase Cloud?',
      'This will replace your current local data with the latest saved backup from Firestore.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Now',
          onPress: async () => {
            setIsRestoring(true);
            const success = await restoreFromCloud();
            setIsRestoring(false);
            if (success) {
              Alert.alert('Restored Successfully ✅', 'All attendance, timetable slots, tasks, and expenses were recovered from Google Firestore.');
            } else {
              Alert.alert('Restore Failed', 'No cloud backup was found or network connection failed.');
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    await sendInstantTestNotification(
      'Colio Push Alert 🎓',
      'Firebase Cloud Sync and Android Push Notifications are active!'
    );
  };

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

      {/* Cloud Sync & Firebase Notifications */}
      <View style={styles.modulesSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>CLOUD BACKUP & NOTIFICATIONS</Text>
          <View style={[styles.onlinePill, { backgroundColor: '#10B98120', borderColor: '#10B98150' }]}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlinePillText}>{lastSyncTime ? `Synced ${lastSyncTime}` : 'Firestore Ready'}</Text>
          </View>
        </View>

        {/* Sync to Cloud */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={handleCloudBackup}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '35' }]}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={currentTheme.primary} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={22} color={currentTheme.primary} />
            )}
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>
              {isSyncing ? 'Syncing with Firestore...' : 'Backup to Firebase Cloud'}
            </Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>
              Save attendance, timetable, tasks & expenses
            </Text>
          </View>
          <Feather name="upload-cloud" size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>

        {/* Restore from Cloud */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={handleCloudRestore}
          disabled={isRestoring}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: '#00B0FF20', borderColor: '#00B0FF40' }]}>
            {isRestoring ? (
              <ActivityIndicator size="small" color="#00B0FF" />
            ) : (
              <Ionicons name="cloud-download-outline" size={22} color="#00B0FF" />
            )}
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>
              {isRestoring ? 'Restoring records...' : 'Restore from Cloud Backup'}
            </Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>
              Recover all your saved college records
            </Text>
          </View>
          <Feather name="download-cloud" size={18} color={currentTheme.textMuted} />
        </TouchableOpacity>

        {/* Test Notification Button */}
        <TouchableOpacity
          style={[styles.hubTile, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
          onPress={handleTestNotification}
          activeOpacity={0.8}
        >
          <View style={[styles.tileIconBox, { backgroundColor: '#FFD60020', borderColor: '#FFD60040' }]}>
            <Ionicons name="notifications-outline" size={22} color="#FFD600" />
          </View>
          <View style={styles.tileInfo}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>
              Test Android Push Notification
            </Text>
            <Text style={[styles.tileSubtitle, { color: currentTheme.textMuted }]}>
              Trigger instant lecture reminder alert
            </Text>
          </View>
          <Feather name="send" size={18} color={currentTheme.textMuted} />
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlinePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
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
