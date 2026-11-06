import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { COMPARISONS, convert, formatNumber, howManyFit, UNITS } from '../lib/converter';
import { monoFont } from '../theme/fonts';

export function CompareScreen() {
  const { parsed, unit, base, colors } = useApp();
  const bytes = parsed.status === 'ok' ? convert(parsed.value, unit, 'B', base) : null;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.hero, { backgroundColor: colors.accent }]}>
        <Text style={[styles.heroLabel, { color: colors.onAccent }]}>In deze hoeveelheid past</Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.heroValue, { color: colors.onAccent }]}
        >
          {parsed.status === 'ok' ? `${formatNumber(parsed.value)} ${unit}` : 'Geen waarde'}
        </Text>
      </View>

      {bytes === null && (
        <Text style={[styles.empty, { color: colors.muted }]}>
          Vul eerst een geldige waarde in op het scherm Converter.
        </Text>
      )}

      {COMPARISONS.map((item) => (
        <View
          key={item.id}
          accessible
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name={item.icon} size={20} color={colors.accent} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowName, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.rowSize, { color: colors.muted }]}>
              ongeveer {item.sizeLabel} per stuk
            </Text>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.count, { color: colors.text }]}
          >
            {bytes === null ? '–' : formatNumber(howManyFit(bytes, item.bytes))}
          </Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        EENHEDEN · BASIS {base}
      </Text>
      <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {UNITS.slice(1).map((u, index) => (
          <View
            key={u.id}
            style={[
              styles.tableRow,
              index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
            ]}
          >
            <Text style={[styles.tableUnit, { color: colors.text }]}>1 {u.id}</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.tableValue, { color: colors.muted }]}
            >
              {formatNumber(convert(1, u.id, 'B', base))} B
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  hero: { borderRadius: 16, padding: 18, marginBottom: 8 },
  heroLabel: { fontSize: 14, marginBottom: 4 },
  heroValue: { fontFamily: monoFont, fontSize: 30, fontWeight: '700' },
  empty: { fontSize: 14, marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flexShrink: 0 },
  rowName: { fontSize: 15, fontWeight: '600' },
  rowSize: { fontSize: 12, marginTop: 2 },
  count: { flex: 1, minWidth: 0, textAlign: 'right', fontFamily: monoFont, fontSize: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 12, marginBottom: 2 },
  table: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: 12 },
  tableUnit: { fontFamily: monoFont, fontSize: 14, fontWeight: '700' },
  tableValue: { flex: 1, minWidth: 0, textAlign: 'right', fontFamily: monoFont, fontSize: 14 },
});
