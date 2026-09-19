import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { useCampus } from '../../context/CampusContext';

interface GlassDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GlassDialog: React.FC<GlassDialogProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const { currentTheme } = useCampus();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: currentTheme.bgBackdrop }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.dialogContainer,
                {
                  backgroundColor: currentTheme.bgSurface,
                  borderColor: currentTheme.borderGlass,
                  shadowColor: currentTheme.primary,
                },
              ]}
            >
              {/* Glassmorphic Gradient Base */}
              <LinearGradient
                colors={[currentTheme.bgSurface, currentTheme.bgCard]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Top Glass Light Reflection */}
              <LinearGradient
                colors={[currentTheme.glowColor, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Header Row */}
              <View style={[styles.headerRow, { borderBottomColor: currentTheme.borderGlass }]}>
                <Text style={[Typography.titleLg, styles.titleText, { color: currentTheme.textPrimary }]}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={18} color={currentTheme.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.scrollInner}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.space4,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 0.7,
  },
  titleText: {},
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentScroll: {
    flexGrow: 0,
  },
  scrollInner: {
    padding: 20,
  },
});
