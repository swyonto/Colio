import { Platform } from 'react-native';

export const triggerHapticFeedback = async (type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' = 'light') => {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    if (!Haptics) return;
    
    switch (type) {
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'light':
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch {
    // Graceful fallback if haptics hardware not available
  }
};
