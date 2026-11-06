/**
 * Kleuren van de app. Het thema is afgeleid van datacenterapparatuur:
 * donkere behuizing, met teal als kleur van een oplichtend statuslampje.
 */
export type Colors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  error: string;
};

export const lightColors: Colors = {
  background: '#F2F5F9',
  surface: '#FFFFFF',
  surfaceAlt: '#E6ECF4',
  text: '#0F1B2D',
  muted: '#55657C',
  border: '#D6DEE9',
  accent: '#0B7F71',
  onAccent: '#FFFFFF',
  accentSoft: '#DDF3EF',
  error: '#C2302B',
};

export const darkColors: Colors = {
  background: '#0B1220',
  surface: '#141D2E',
  surfaceAlt: '#1D2940',
  text: '#E8EEF8',
  muted: '#9AAAC2',
  border: '#26334B',
  accent: '#35D0BA',
  onAccent: '#062A25',
  accentSoft: '#12332F',
  error: '#FF8A85',
};
