import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialogContainer}>
              {/* Header Row */}
              <View style={styles.headerRow}>
                <Text style={[Typography.titleLg, styles.titleText]}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name="x" size={20} color={Colors.textMuted} />
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
    backgroundColor: 'rgba(5, 9, 7, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.space4,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.bgElevated,
    borderRadius: Spacing.dialogRadius,
    borderWidth: 0.9,
    borderColor: 'rgba(0, 230, 118, 0.28)',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleText: {
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C201D',
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
