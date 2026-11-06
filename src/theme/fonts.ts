import { Platform } from 'react-native';

/** Vaste letterbreedte voor getallen: past bij het technische onderwerp en cijfers staan recht onder elkaar. */
export const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, Menlo, Consolas, monospace',
});
