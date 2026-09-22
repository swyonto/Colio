import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabKey } from '../../types/campus';
import { useCampus } from '../../context/CampusContext';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof Feather.glyphMap;
  iconType: 'material' | 'feather';
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: 'home', iconType: 'feather' },
  { key: 'attend', label: 'Attend', icon: 'check-circle', iconType: 'feather' },
  { key: 'timetable', label: 'Timetable', icon: 'calendar', iconType: 'feather' },
  { key: 'expenses', label: 'Expenses', icon: 'credit-card', iconType: 'feather' },
  { key: 'more', label: 'More', icon: 'grid', iconType: 'feather' },
];

export const GlassNavBar: React.FC = () => {
  const { activeTab, setActiveTab, currentTheme } = useCampus();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / TABS.length;

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const slideAnim = useRef(new Animated.Value(activeIndex * tabWidth)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * tabWidth,
      damping: 18,
      stiffness: 140,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [activeIndex, tabWidth]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.bgSurface,
          borderTopColor: currentTheme.borderGlass,
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 10,
        },
      ]}
    >
      {/* Top Border Accent Line */}
      <View style={[styles.topBorder, { backgroundColor: currentTheme.primary + '35' }]} />

      {/* Animated Sliding Pill Indicator (+10px taller for ergonomic reach) */}
      <Animated.View
        style={[
          styles.activePillIndicator,
          {
            width: tabWidth - 10,
            transform: [{ translateX: slideAnim }],
            left: 5,
            backgroundColor: currentTheme.navPillBg,
            borderColor: currentTheme.navPillBorder,
          },
        ]}
      />

      {/* Tab Buttons Row (+10px taller) */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isSelected = tab.key === activeTab;
          const iconColor = isSelected ? currentTheme.navSelectedIcon : currentTheme.navUnselectedIcon;
          const labelColor = isSelected ? currentTheme.navSelectedLabel : currentTheme.navUnselectedLabel;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, { width: tabWidth }]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                {tab.iconType === 'feather' ? (
                  <Feather name={tab.icon as any} size={19} color={iconColor} />
                ) : (
                  <MaterialIcons name={tab.icon as any} size={20} color={iconColor} />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: labelColor,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 6,
    borderTopWidth: 0.8,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  activePillIndicator: {
    position: 'absolute',
    top: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  iconContainer: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
