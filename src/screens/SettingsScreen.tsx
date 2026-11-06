import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { tapFeedback } from '../hardware/haptics';
import { Base } from '../lib/converter';

const BASES: { value: Base; title: string; description: string }[] = [
  {
    value: 1000,
    title: 'Decimaal: 1 KB = 1000 B',
    description: 'Zoals fabrikanten van harde schijven en macOS rekenen.',
  },
  {
    value: 1024,
    title: 'Binair: 1 KB = 1024 B',
    description: 'Zoals Windows rekent. Heet officieel KiB, MiB, enzovoort.',
  },
];

const HARDWARE = [
  { icon: 'hand-left-outline', text: 'Touchscreen: tik op een uitkomst om die te kopiëren.' },
  { icon: 'pulse-outline', text: 'Trilmotor: je voelt een tik bij elke keuze.' },
  { icon: 'phone-portrait-outline', text: 'Versnellingsmeter: schud je telefoon om te wissen.' },
] as const;

export function SettingsScreen() {
  const { isDark, setIsDark, base, setBase, colors } = useApp();
  const cardStyle = [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>WEERGAVE</Text>
      <View style={[cardStyle, styles.switchRow]}>
        <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.accent} />
        <Text style={[styles.switchLabel, { color: colors.text }]}>Donkere modus</Text>
        <Switch
          value={isDark}
          onValueChange={(value) => {
            tapFeedback();
            setIsDark(value);
          }}
          accessibilityLabel="Donkere modus"
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.muted }]}>REKENBASIS</Text>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {BASES.map((option) => {
          const selected = option.value === base;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                tapFeedback();
                setBase(option.value);
              }}
              accessibilityRole="radio"
              aria-checked={selected}
              style={[
                cardStyle,
                styles.option,
                selected && { borderColor: colors.accent, backgroundColor: colors.accentSoft },
              ]}
            >
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected ? colors.accent : colors.muted}
              />
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.muted }]}>
                  {option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.muted }]}>HARDWARE IN DEZE APP</Text>
      <View style={[cardStyle, styles.hardware]}>
        {HARDWARE.map((item) => (
          <View key={item.icon} style={styles.hardwareRow}>
            <Ionicons name={item.icon} size={20} color={colors.accent} />
            <Text style={[styles.hardwareText, { color: colors.text }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.footer, { color: colors.muted }]}>Opslag Converter · versie 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginBottom: 2 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  options: { gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600' },
  optionDescription: { fontSize: 13, marginTop: 2 },
  hardware: { gap: 12 },
  hardwareRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hardwareText: { flex: 1, fontSize: 14 },
  footer: { fontSize: 12, textAlign: 'center', marginTop: 12 },
});
