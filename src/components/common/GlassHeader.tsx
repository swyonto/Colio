import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ColioLogo } from './ColioLogo';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { triggerHapticFeedback } from '../../utils/haptics';

interface GlassHeaderProps {
  onPressProfile?: () => void;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({ onPressProfile }) => {
  const { profile, searchQuery, setSearchQuery, isSearchExpanded, setIsSearchExpanded, currentTheme } = useCampus();
  const inputRef = useRef<TextInput>(null);

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleOpenSearch = () => {
    triggerHapticFeedback('light');
    setIsSearchExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCloseSearch = () => {
    triggerHapticFeedback('light');
    setSearchQuery('');
    setIsSearchExpanded(false);
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Glass Background */}
      <LinearGradient
        colors={[currentTheme.bgBase, currentTheme.bgSurface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.bottomBorder, { backgroundColor: currentTheme.borderGlass }]} />

      {/* When Search is Expanded: Full Horizontal Search Bar */}
      {isSearchExpanded ? (
        <View style={styles.searchExpandedRow}>
          <View
            style={[
              styles.searchInputContainer,
              {
                backgroundColor: currentTheme.bgInner,
                borderColor: currentTheme.primary + '60',
              },
            ]}
          >
            <Feather name="search" size={17} color={currentTheme.primary} style={styles.searchInnerIcon} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: currentTheme.textPrimary }]}
              placeholder="Search subjects, tasks, documents..."
              placeholderTextColor={currentTheme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x-circle" size={16} color={currentTheme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.closeSearchButton, { backgroundColor: currentTheme.bgCardSecondary }]}
            onPress={handleCloseSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={20} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        </View>
      ) : (
        /* Normal Header: Custom Logo + Colio Logotype + Search Icon + Avatar */
        <View style={styles.headerMainRow}>
          <View style={styles.brandingGroup}>
            <ColioLogo size={36} />
            <View style={styles.brandTextGroup}>
              {(!profile.appNickname || profile.appNickname === 'Calio' || profile.appNickname === 'Colio' || profile.appNickname === 'CampusHub') ? (
                <View style={styles.colioLogoTitleRow}>
                  <Text style={[styles.colioPrefix, { color: currentTheme.isDark ? '#FFFFFF' : currentTheme.textPrimary }]}>
                    Cal
                  </Text>
                  <Text style={[styles.colioSuffix, { color: currentTheme.primary }]}>io</Text>
                  <View style={[styles.colioDot, { backgroundColor: currentTheme.primary }]} />
                </View>
              ) : (
                <Text style={[Typography.titleLg, styles.appNameText, { color: currentTheme.textPrimary }]} numberOfLines={1}>
                  {profile.appNickname}
                </Text>
              )}
            </View>
          </View>

          {/* Right Action Icons: Collapsible 38dp Circular Search + Avatar Pill */}
          <View style={styles.rightActionsGroup}>
            {/* 38dp Circular Search Button */}
            <TouchableOpacity
              style={[
                styles.searchCircleButton,
                {
                  backgroundColor: currentTheme.bgSurface,
                  borderColor: currentTheme.primary + '40',
                },
              ]}
              onPress={handleOpenSearch}
              activeOpacity={0.8}
            >
              <Feather name="search" size={18} color={currentTheme.primary} />
            </TouchableOpacity>

            {/* Profile Avatar Pill with User Image or Student Initials */}
            <TouchableOpacity
              style={[
                styles.avatarPill,
                {
                  borderColor: currentTheme.primary + '60',
                },
              ]}
              onPress={() => {
                triggerHapticFeedback('selection');
                onPressProfile?.();
              }}
              activeOpacity={0.8}
            >
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarPillImage} />
              ) : (
                <LinearGradient
                  colors={[currentTheme.bgCardSecondary, currentTheme.bgElevated]}
                  style={styles.avatarInner}
                >
                  <Text style={[styles.avatarInitials, { color: currentTheme.primary }]}>
                    {getInitials(profile.name)}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    position: 'relative',
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.6,
  },
  headerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  colioLogoTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  colioPrefix: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  colioSuffix: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  colioDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 3,
    marginBottom: 3,
  },
  appNameText: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  rightActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchCircleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    overflow: 'hidden',
  },
  avatarPillImage: {
    width: '100%',
    height: '100%',
  },
  avatarInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchExpandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInnerIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  closeSearchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
