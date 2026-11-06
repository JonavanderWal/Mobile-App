import {
  COMPARISONS,
  convert,
  formatNumber,
  howManyFit,
  MAX_INPUT,
  parseInput,
  UNITS,
} from './converter';
import { isShake } from './shake';

describe('convert', () => {
  it('kent precies de zes gevraagde eenheden', () => {
    expect(UNITS.map((u) => u.id)).toEqual(['B', 'KB', 'MB', 'GB', 'TB', 'PB']);
  });

  it.each([
    ['B', 1],
    ['KB', 1e3],
    ['MB', 1e6],
    ['GB', 1e9],
    ['TB', 1e12],
    ['PB', 1e15],
  ] as const)('rekent 1 %s om naar bytes met basis 1000', (unit, bytes) => {
    expect(convert(1, unit, 'B', 1000)).toBe(bytes);
  });

  it.each([
    ['B', 1],
    ['KB', 1024],
    ['MB', 1048576],
    ['GB', 1073741824],
    ['TB', 1099511627776],
    ['PB', 1125899906842624],
  ] as const)('rekent 1 %s om naar bytes met basis 1024', (unit, bytes) => {
    expect(convert(1, unit, 'B', 1024)).toBe(bytes);
  });

  it('rekent ook omlaag naar een grotere eenheid', () => {
    expect(convert(1500, 'MB', 'GB', 1000)).toBe(1.5);
    expect(convert(512, 'MB', 'GB', 1024)).toBe(0.5);
  });

  it('laat de waarde gelijk bij dezelfde eenheid', () => {
    expect(convert(42, 'GB', 'GB', 1024)).toBe(42);
  });

  it('komt na heen en terug rekenen weer op de beginwaarde uit', () => {
    const there = convert(123.45, 'GB', 'KB', 1024);
    expect(convert(there, 'KB', 'GB', 1024)).toBeCloseTo(123.45, 10);
  });

  it('geeft 0 bij invoer 0', () => {
    expect(convert(0, 'PB', 'B', 1000)).toBe(0);
  });
});

describe('parseInput', () => {
  it('herkent lege invoer, ook met alleen spaties', () => {
    expect(parseInput('')).toEqual({ status: 'empty' });
    expect(parseInput('   ')).toEqual({ status: 'empty' });
  });

  it.each([
    ['5', 5],
    ['1,5', 1.5],
    ['1.5', 1.5],
    [',5', 0.5],
    ['.5', 0.5],
    ['5,', 5],
    ['0', 0],
    [' 7 ', 7],
  ])('accepteert "%s"', (text, value) => {
    expect(parseInput(text)).toEqual({ status: 'ok', value });
  });

  it.each(['abc', '1,2,3', '1.2.3', '12a', ',', '1e5', '1 000'])('weigert "%s"', (text) => {
    expect(parseInput(text).status).toBe('error');
  });

  it('geeft een eigen melding bij een negatief getal', () => {
    expect(parseInput('-1')).toEqual({
      status: 'error',
      message: 'Opslag kan niet negatief zijn.',
    });
  });

  it('accepteert het maximum, maar niets daarboven', () => {
    expect(parseInput(String(MAX_INPUT)).status).toBe('ok');
    expect(parseInput('1000000000000001').status).toBe('error');
  });
});

describe('formatNumber', () => {
  it.each([
    [0, '0'],
    [1, '1'],
    [1.5, '1,5'],
    [1000, '1.000'],
    [1234567.5, '1.234.567,5'],
    [1e15, '1.000.000.000.000.000'],
    [0.5, '0,5'],
    [0.001, '0,001'],
    [0.000001, '0,000001'],
  ])('toont %d als %s', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });

  it('toont grote hele getallen exact, zonder afronden', () => {
    expect(formatNumber(1125899906842624)).toBe('1.125.899.906.842.624');
    expect(formatNumber(convert(1, 'PB', 'B', 1024))).toBe('1.125.899.906.842.624');
  });

  it('haalt rekenruis weg', () => {
    expect(formatNumber(1.1 * 1000)).toBe('1.100');
    expect(formatNumber(0.1 + 0.2)).toBe('0,3');
  });

  it('rondt af op maximaal vier decimalen vanaf 1', () => {
    expect(formatNumber(1 / 0.3)).toBe('3,3333');
  });

  it('gebruikt machten van 10 bij extreem grote en kleine getallen', () => {
    expect(formatNumber(1e21)).toBe('1 × 10²¹');
    expect(formatNumber(1.5e18)).toBe('1,5 × 10¹⁸');
    expect(formatNumber(1e-15)).toBe('1 × 10⁻¹⁵');
  });
});

describe('howManyFit', () => {
  it('telt alleen hele exemplaren', () => {
    expect(howManyFit(10e6, 4e6)).toBe(2);
    expect(howManyFit(1e6, 4e6)).toBe(0);
  });

  it('verliest geen exemplaar door rekenruis', () => {
    expect(howManyFit(0.3 * 10, 1)).toBe(3);
    expect(howManyFit(2.9999999999999996, 1)).toBe(3);
  });

  it('heeft alleen positieve richtwaarden', () => {
    COMPARISONS.forEach((item) => expect(item.bytes).toBeGreaterThan(0));
  });
});

describe('isShake', () => {
  it('ziet stilliggen en normaal vasthouden niet als schudden', () => {
    expect(isShake(0, 0, 1)).toBe(false);
    expect(isShake(0.5, 0.5, 1.2)).toBe(false);
  });

  it('herkent hard schudden in elke richting', () => {
    expect(isShake(2.5, 0, 0)).toBe(true);
    expect(isShake(0, -2.5, 0)).toBe(true);
    expect(isShake(1.6, 1.6, 1)).toBe(true);
  });
});
