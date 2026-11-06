/**
 * Rekenlogica van de app. Dit bestand kent geen React of schermen,
 * zodat alles los met unit tests te controleren is.
 */

export type UnitId = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

/** 1000 = decimaal (zoals fabrikanten rekenen), 1024 = binair (zoals o.a. Windows rekent). */
export type Base = 1000 | 1024;

export type Unit = {
  id: UnitId;
  name: string;
  /** Aantal stappen vanaf bytes: 1 KB = basis^1 bytes, 1 MB = basis^2 bytes, enzovoort. */
  step: number;
};

export const UNITS: readonly Unit[] = [
  { id: 'B', name: 'Bytes', step: 0 },
  { id: 'KB', name: 'Kilobytes', step: 1 },
  { id: 'MB', name: 'Megabytes', step: 2 },
  { id: 'GB', name: 'Gigabytes', step: 3 },
  { id: 'TB', name: 'Terabytes', step: 4 },
  { id: 'PB', name: 'Petabytes', step: 5 },
];

/** Grootste invoer die de app accepteert. Daarboven wordt de uitkomst onnauwkeurig. */
export const MAX_INPUT = 1e15;

const stepOf = (id: UnitId): number => {
  const unit = UNITS.find((u) => u.id === id);
  if (!unit) throw new Error(`Onbekende eenheid: ${id}`);
  return unit.step;
};

/**
 * Rekent een waarde om. Er wordt altijd met een hele macht vermenigvuldigd of
 * gedeeld, omdat dat nauwkeuriger is dan vermenigvuldigen met een kleine breuk.
 */
export function convert(value: number, from: UnitId, to: UnitId, base: Base): number {
  const difference = stepOf(from) - stepOf(to);
  const factor = Math.pow(base, Math.abs(difference));
  return difference >= 0 ? value * factor : value / factor;
}

export type ParseResult =
  | { status: 'empty' }
  | { status: 'ok'; value: number }
  | { status: 'error'; message: string };

/** Controleert de invoer van de gebruiker. Zowel een komma als een punt telt als decimaalteken. */
export function parseInput(text: string): ParseResult {
  const trimmed = text.trim();
  if (trimmed === '') return { status: 'empty' };
  if (trimmed.startsWith('-')) {
    return { status: 'error', message: 'Opslag kan niet negatief zijn.' };
  }
  if (!/^(\d+([.,]\d*)?|[.,]\d+)$/.test(trimmed)) {
    return { status: 'error', message: 'Vul een geldig getal in, bijvoorbeeld 1,5.' };
  }
  const value = Number(trimmed.replace(',', '.'));
  if (value > MAX_INPUT) {
    return { status: 'error', message: 'Dit getal is te groot. Het maximum is 1 biljard.' };
  }
  return { status: 'ok', value };
}

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};

function formatScientific(value: number): string {
  const [mantissa, exponent] = value.toExponential(4).split('e');
  const cleanMantissa = String(Number(mantissa)).replace('.', ',');
  const power = String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('');
  return `${cleanMantissa} × 10${power}`;
}

/**
 * Zet een getal om naar Nederlandse notatie (1.234,5).
 * Heel grote en heel kleine getallen worden als macht van 10 getoond.
 */
export function formatNumber(value: number): string {
  if (value === 0) return '0';
  if (value >= 1e18 || value < 1e-6) return formatScientific(value);

  // Haalt rekenruis weg, zoals 1100.0000000000002 bij 1,1 × 1000.
  // Hele getallen hebben geen ruis en blijven exact (1 PB binair eindigt op ...624).
  const clean = Number.isInteger(value) ? value : Number(value.toPrecision(15));
  const rounded = clean >= 1 ? Number(clean.toFixed(4)) : Number(clean.toPrecision(6));

  const [whole, decimals] = rounded.toFixed(rounded >= 1 ? 4 : 12).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const trimmedDecimals = decimals.replace(/0+$/, '');
  return trimmedDecimals ? `${grouped},${trimmedDecimals}` : grouped;
}

export type Comparison = {
  id: string;
  label: string;
  icon: 'chatbubble-outline' | 'image-outline' | 'musical-notes-outline' | 'disc-outline' | 'film-outline';
  /** Grootte in bytes. Dit zijn richtwaarden. */
  bytes: number;
  sizeLabel: string;
};

export const COMPARISONS: readonly Comparison[] = [
  { id: 'sms', label: "Sms'jes", icon: 'chatbubble-outline', bytes: 160, sizeLabel: '160 B' },
  { id: 'photo', label: "Foto's", icon: 'image-outline', bytes: 4e6, sizeLabel: '4 MB' },
  { id: 'song', label: 'Muzieknummers', icon: 'musical-notes-outline', bytes: 5e6, sizeLabel: '5 MB' },
  { id: 'film', label: 'HD-films', icon: 'film-outline', bytes: 4e9, sizeLabel: '4 GB' },
  { id: 'bluray', label: "Blu-ray's", icon: 'disc-outline', bytes: 25e9, sizeLabel: '25 GB' },
];

/** Hoeveel hele exemplaren er in de opgegeven hoeveelheid bytes passen. */
export function howManyFit(totalBytes: number, itemBytes: number): number {
  // De kleine marge voorkomt dat rekenruis (2,9999999) één exemplaar kost.
  return Math.floor(totalBytes / itemBytes + 1e-9);
}
