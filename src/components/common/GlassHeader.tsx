import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ColioLogo } from './ColioLogo';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { triggerHapticFeedback } from '../../utils/haptics';

interface GlassHeaderProps {
  onPressProfile?: () => void;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({ onPressProfile }) => {
  const { profile, searchQuery, setSearchQuery, isSearchExpanded, setIsSearchExpanded } = useCampus();
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
    <View style={styles.headerContainer}>
      {/* Top Glass Background */}
      <LinearGradient
        colors={['#070B09', '#0A0E0C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.bottomBorder} />

      {/* When Search is Expanded: Full Horizontal Search Bar */}
      {isSearchExpanded ? (
        <View style={styles.searchExpandedRow}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={17} color={Colors.emeraldPrimary} style={styles.searchInnerIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search subjects, tasks, documents..."
              placeholderTextColor={Colors.textDisabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x-circle" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.closeSearchButton}
            onPress={handleCloseSearch}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      ) : (
        /* Normal Header: Custom Logo + Colio Logotype + Search Icon + Avatar */
        <View style={styles.headerMainRow}>
          <View style={styles.brandingGroup}>
            <ColioLogo size={36} />
            <View style={styles.brandTextGroup}>
              {(!profile.appNickname || profile.appNickname === 'Colio' || profile.appNickname === 'CampusHub') ? (
                <View style={styles.colioLogoTitleRow}>
                  <Text style={styles.colioPrefix}>Col</Text>
                  <Text style={styles.colioSuffix}>io</Text>
                  <View style={styles.colioDot} />
                </View>
              ) : (
                <Text style={[Typography.titleLg, styles.appNameText]} numberOfLines={1}>
                  {profile.appNickname}
                </Text>
              )}
            </View>
          </View>

          {/* Right Action Icons: Collapsible 38dp Circular Search + Avatar Pill */}
          <View style={styles.rightActionsGroup}>
            {/* 38dp Circular Search Button */}
            <TouchableOpacity
              style={styles.searchCircleButton}
              onPress={handleOpenSearch}
              activeOpacity={0.8}
            >
              <Feather name="search" size={18} color={Colors.emeraldPrimary} />
            </TouchableOpacity>

            {/* Profile Avatar Pill with Student Initials */}
            <TouchableOpacity
              style={styles.avatarPill}
              onPress={() => {
                triggerHapticFeedback('selection');
                onPressProfile?.();
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#141414', '#1A1A1A']}
                style={styles.avatarInner}
              >
                <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
              </LinearGradient>
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
    paddingTop: Platform.OS === 'ios' ? 52 : 42,
    paddingBottom: 14,
    position: 'relative',
    backgroundColor: '#070B09',
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  colioSuffix: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.emeraldPrimary,
    letterSpacing: -0.4,
  },
  colioDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00E676',
    marginLeft: 3,
    marginBottom: 3,
  },
  appNameText: {
    color: Colors.textPrimary,
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
    backgroundColor: '#121513',
    borderWidth: 0.8,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.45)',
    overflow: 'hidden',
  },
  avatarInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: Colors.emeraldPrimary,
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
    backgroundColor: '#101311',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.40)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInnerIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  closeSearchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161917',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
