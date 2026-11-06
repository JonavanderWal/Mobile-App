import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { successFeedback, tapFeedback } from '../hardware/haptics';
import { useShake } from '../hardware/useShake';
import { convert, formatNumber, Unit, UNITS } from '../lib/converter';
import { monoFont } from '../theme/fonts';

export function ConverterScreen() {
  const { input, setInput, unit, setUnit, parsed, base, colors } = useApp();
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isFocused = useIsFocused();

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const clear = () => {
    setInput('');
    setCopiedUnit(null);
  };

  useShake(() => {
    clear();
    successFeedback();
  }, isFocused);

  const copy = async (target: Unit, text: string) => {
    try {
      await Clipboard.setStringAsync(`${text} ${target.id}`);
    } catch {
      return; // Niet gelukt: dan ook geen "Gekopieerd" tonen.
    }
    successFeedback();
    setCopiedUnit(target.id);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedUnit(null), 1500);
  };

  const hasError = parsed.status === 'error';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.muted }]} nativeID="waarde-label">
          WAARDE
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            maxLength={20}
            accessibilityLabel={`Waarde in ${unit}`}
            style={[
              styles.input,
              { color: hasError ? colors.error : colors.text },
            ]}
          />
          <Pressable
            onPress={() => {
              tapFeedback();
              clear();
            }}
            accessibilityRole="button"
            accessibilityLabel="Invoer wissen"
            hitSlop={8}
            style={[styles.clearButton, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        {hasError && parsed.status === 'error' ? (
          <Text accessibilityLiveRegion="polite" style={[styles.message, { color: colors.error }]}>
            {parsed.message}
          </Text>
        ) : (
          <Text style={[styles.message, { color: colors.muted }]}>
            Schud je telefoon om te wissen
          </Text>
        )}

        <View
          accessibilityRole="radiogroup"
          style={[styles.segments, { backgroundColor: colors.surfaceAlt }]}
        >
          {UNITS.map((u) => {
            const selected = u.id === unit;
            return (
              <Pressable
                key={u.id}
                onPress={() => {
                  tapFeedback();
                  setUnit(u.id);
                }}
                accessibilityRole="radio"
                accessibilityLabel={u.name}
                aria-checked={selected}
                style={[styles.segment, selected && { backgroundColor: colors.accent }]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: selected ? colors.onAccent : colors.text },
                  ]}
                >
                  {u.id}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        UITKOMST · 1 KB = {base === 1000 ? '1000' : '1024'} B
      </Text>

      {UNITS.map((target) => {
        const isSource = target.id === unit;
        const text =
          parsed.status === 'ok'
            ? formatNumber(convert(parsed.value, unit, target.id, base))
            : null;
        const copied = copiedUnit === target.id;
        return (
          <Pressable
            key={target.id}
            disabled={text === null}
            onPress={() => text !== null && copy(target, text)}
            accessibilityRole="button"
            accessibilityLabel={
              text === null ? `${target.name}: geen uitkomst` : `${text} ${target.name}, tik om te kopiëren`
            }
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: isSource ? colors.accentSoft : colors.surface,
                borderColor: isSource ? colors.accent : colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowName, { color: colors.muted }]}>{target.name}</Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                style={[styles.rowValue, { color: colors.text }]}
              >
                {text ?? '–'}
              </Text>
            </View>
            {text !== null && (
              <View style={styles.rowAction}>
                <Text style={[styles.rowUnit, { color: colors.muted }]}>{target.id}</Text>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={copied ? colors.accent : colors.muted}
                />
              </View>
            )}
          </Pressable>
        );
      })}

      <Text style={[styles.hint, { color: colors.muted }]}>Tik op een uitkomst om te kopiëren</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, minWidth: 0, fontFamily: monoFont, fontSize: 36, paddingVertical: 8 },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { fontSize: 13, marginBottom: 12 },
  segments: { flexDirection: 'row', borderRadius: 10, padding: 3 },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: { fontFamily: monoFont, fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginBottom: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 12, marginBottom: 2 },
  rowValue: { fontFamily: monoFont, fontSize: 19 },
  rowAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowUnit: { fontFamily: monoFont, fontSize: 13 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 6 },
});
