import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { Base, parseInput, ParseResult, UnitId } from '../lib/converter';
import { Colors, darkColors, lightColors } from '../theme/colors';

const STORAGE_KEY = 'opslag-converter/settings';

type StoredSettings = { isDark?: boolean; base?: Base };

type AppState = {
  /** De invoer staat hier, zodat het Vergelijk-scherm dezelfde waarde gebruikt. */
  input: string;
  setInput: (text: string) => void;
  unit: UnitId;
  setUnit: (unit: UnitId) => void;
  parsed: ParseResult;
  base: Base;
  setBase: (base: Base) => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  colors: Colors;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [input, setInput] = useState('1');
  const [unit, setUnit] = useState<UnitId>('GB');
  const [stored, setStored] = useState<StoredSettings>({});
  const [loaded, setLoaded] = useState(false);

  // Instellingen ophalen bij het opstarten. Lukt dat niet, dan gelden de standaardwaarden.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) setStored(JSON.parse(json));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const value = useMemo<AppState>(() => {
    const save = (next: StoredSettings) => {
      setStored(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    };
    // Zolang de gebruiker niets gekozen heeft, volgt de app het thema van de telefoon.
    const isDark = stored.isDark ?? systemScheme === 'dark';
    return {
      input,
      setInput,
      unit,
      setUnit,
      parsed: parseInput(input),
      base: stored.base ?? 1000,
      setBase: (base) => save({ ...stored, base }),
      isDark,
      setIsDark: (dark) => save({ ...stored, isDark: dark }),
      colors: isDark ? darkColors : lightColors,
    };
  }, [input, unit, stored, systemScheme]);

  // Wacht op de instellingen, zodat het scherm niet kort in het verkeerde thema opflitst.
  if (!loaded) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const state = useContext(AppContext);
  if (!state) throw new Error('useApp moet binnen AppProvider gebruikt worden');
  return state;
}
