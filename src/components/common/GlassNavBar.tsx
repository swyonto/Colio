import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
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
  const { activeTab, setActiveTab } = useCampus();
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / TABS.length;

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const slideAnim = useRef(new Animated.Value(activeIndex * tabWidth)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * tabWidth,
      damping: 18,
      stiffness: 140,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, tabWidth]);

  return (
    <View style={styles.container}>
      {/* Top Border Line */}
      <View style={styles.topBorder} />

      {/* Animated Sliding Pill Indicator */}
      <Animated.View
        style={[
          styles.activePillIndicator,
          {
            width: tabWidth - 14,
            transform: [{ translateX: slideAnim }],
            left: 7,
          },
        ]}
      />

      {/* Tab Buttons Row */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isSelected = tab.key === activeTab;
          const iconColor = isSelected ? Colors.navSelectedIcon : Colors.navUnselectedIcon;
          const labelColor = isSelected ? Colors.navSelectedLabel : Colors.navUnselectedLabel;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, { width: tabWidth }]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                {tab.iconType === 'feather' ? (
                  <Feather name={tab.icon as any} size={20} color={iconColor} />
                ) : (
                  <MaterialIcons name={tab.icon as any} size={21} color={iconColor} />
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
    backgroundColor: '#090D0B',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    borderTopWidth: 0.6,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
  },
  activePillIndicator: {
    position: 'absolute',
    top: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.navPillBg,
    borderWidth: 0.8,
    borderColor: Colors.navPillBorder,
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
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
