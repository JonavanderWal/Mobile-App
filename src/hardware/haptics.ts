import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Trilfeedback bij aanraken. Trillen is een extraatje: op apparaten zonder
 * trilmotor en in de browser mag het stilletjes overgeslagen worden.
 */
export function tapFeedback() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function successFeedback() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
