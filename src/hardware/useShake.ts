import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { isShake, SHAKE_COOLDOWN_MS } from '../lib/shake';

/**
 * Roept `onShake` aan als de telefoon geschud wordt. De sensor staat alleen aan
 * zolang `enabled` waar is, zodat hij op andere schermen geen accu verbruikt.
 */
export function useShake(onShake: () => void, enabled: boolean) {
  const callback = useRef(onShake);

  useEffect(() => {
    callback.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    let subscription: { remove: () => void } | undefined;
    let cancelled = false;
    let lastShake = 0;

    Accelerometer.isAvailableAsync()
      .then((available) => {
        if (!available || cancelled) return;
        Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const now = Date.now();
          if (isShake(x, y, z) && now - lastShake > SHAKE_COOLDOWN_MS) {
            lastShake = now;
            callback.current();
          }
        });
      })
      // Zonder sensor werkt de app gewoon door: de Wis-knop doet hetzelfde.
      .catch(() => {});

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);
}
