import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue, StyleProp, ViewStyle, ScrollView, Platform } from 'react-native';
import { Colors } from '../../theme/colors';

const isNative = Platform.OS !== 'web';

// 1. Base Shimmer/Pulse Skeleton Box
interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 850,
          useNativeDriver: isNative,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 850,
          useNativeDriver: isNative,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

// 2. Multi-line Text Skeleton
interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 2,
  lineHeight = 14,
  gap = 6,
  lastLineWidth = '60%',
  style,
}) => {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBox
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          borderRadius={lineHeight / 3}
        />
      ))}
    </View>
  );
};

// 3. Card Container Skeleton
export const SkeletonCard: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => {
  return <View style={[styles.skeletonCard, style]}>{children}</View>;
};

// 4. Home Screen Skeleton
export const HomeSkeleton: React.FC = () => {
  return (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Search bar placeholder */}
      <SkeletonBox height={46} borderRadius={12} />

      {/* 4 Quick Stat Mini Cards Row */}
      <View style={styles.statsRow}>
        <SkeletonBox width="23%" height={68} borderRadius={12} />
        <SkeletonBox width="23%" height={68} borderRadius={12} />
        <SkeletonBox width="23%" height={68} borderRadius={12} />
        <SkeletonBox width="23%" height={68} borderRadius={12} />
      </View>

      {/* Schedule Banner Card */}
      <SkeletonCard>
        <View style={styles.cardHeaderRow}>
          <SkeletonBox width={120} height={18} borderRadius={4} />
          <SkeletonBox width={60} height={18} borderRadius={10} />
        </View>
        <SkeletonBox width="70%" height={24} borderRadius={6} style={{ marginVertical: 12 }} />
        <SkeletonBox width="45%" height={14} borderRadius={4} />
      </SkeletonCard>

      {/* Task Summary Card */}
      <SkeletonCard>
        <View style={styles.cardHeaderRow}>
          <SkeletonBox width={90} height={18} borderRadius={4} />
          <SkeletonBox width={26} height={20} borderRadius={10} />
        </View>
        <View style={{ gap: 10, marginTop: 14 }}>
          <View style={styles.taskItemRow}>
            <SkeletonBox width={20} height={20} borderRadius={6} />
            <SkeletonBox width="65%" height={16} borderRadius={4} />
          </View>
          <View style={styles.taskItemRow}>
            <SkeletonBox width={20} height={20} borderRadius={6} />
            <SkeletonBox width="75%" height={16} borderRadius={4} />
          </View>
          <View style={styles.taskItemRow}>
            <SkeletonBox width={20} height={20} borderRadius={6} />
            <SkeletonBox width="50%" height={16} borderRadius={4} />
          </View>
        </View>
      </SkeletonCard>

      {/* Expense Summary Card */}
      <SkeletonCard>
        <View style={styles.cardHeaderRow}>
          <SkeletonBox width={130} height={18} borderRadius={4} />
          <SkeletonBox width={70} height={18} borderRadius={10} />
        </View>
        <SkeletonBox width={110} height={28} borderRadius={6} style={{ marginTop: 10 }} />
      </SkeletonCard>
    </ScrollView>
  );
};

// 5. Attendance Screen Skeleton
export const AttendanceSkeleton: React.FC = () => {
  return (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Day selector tabs placeholder */}
      <View style={styles.tabsRow}>
        <SkeletonBox width={75} height={32} borderRadius={16} />
        <SkeletonBox width={50} height={32} borderRadius={16} />
        <SkeletonBox width={50} height={32} borderRadius={16} />
        <SkeletonBox width={50} height={32} borderRadius={16} />
        <SkeletonBox width={50} height={32} borderRadius={16} />
      </View>

      {/* Top Attendance Card Skeleton */}
      <SkeletonCard>
        <View style={styles.cardHeaderRow}>
          <SkeletonBox width={130} height={18} borderRadius={4} />
        </View>

        {/* Percentage + Goal Badge */}
        <View style={styles.percentageRow}>
          <SkeletonBox width={90} height={42} borderRadius={8} />
          <SkeletonBox width={120} height={30} borderRadius={8} />
        </View>

        {/* Progress bar line */}
        <SkeletonBox width="100%" height={7} borderRadius={4} style={{ marginVertical: 14 }} />

        {/* 4-column metrics row */}
        <View style={styles.fourColRow}>
          <SkeletonBox width="22%" height={40} borderRadius={8} />
          <SkeletonBox width="22%" height={40} borderRadius={8} />
          <SkeletonBox width="22%" height={40} borderRadius={8} />
          <SkeletonBox width="22%" height={40} borderRadius={8} />
        </View>
      </SkeletonCard>

      {/* Notice Card */}
      <SkeletonBox width="100%" height={38} borderRadius={10} />

      {/* Section Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 }}>
        <SkeletonBox width={4} height={18} borderRadius={2} />
        <SkeletonBox width={140} height={18} borderRadius={4} />
      </View>

      {/* Subject Cards (3 items) */}
      {Array.from({ length: 3 }).map((_, idx) => (
        <SkeletonCard key={idx}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <SkeletonBox width={32} height={32} borderRadius={16} />
              <View style={{ gap: 5 }}>
                <SkeletonBox width={160} height={16} borderRadius={4} />
                <SkeletonBox width={110} height={12} borderRadius={4} />
              </View>
            </View>
            <SkeletonBox width={55} height={24} borderRadius={6} />
          </View>

          {/* Progress bar */}
          <SkeletonBox width="100%" height={4} borderRadius={2} style={{ marginVertical: 12 }} />

          {/* Buttons row */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonBox width="31%" height={34} borderRadius={8} />
            <SkeletonBox width="31%" height={34} borderRadius={8} />
            <SkeletonBox width="31%" height={34} borderRadius={8} />
          </View>
        </SkeletonCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#131A15',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.6,
  },
  skeletonCard: {
    backgroundColor: '#090D0A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 6,
  },
  fourColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
