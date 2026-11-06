import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../context/AppContext';

function ThemedTabs() {
  const { isDark, colors } = useApp();
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.accent,
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          // Niet laten krimpen, anders wordt de onderkant van de "g" en "j" afgekapt.
          tabBarLabelStyle: { fontSize: 11, lineHeight: 14, flexShrink: 0 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Converter',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="swap-vertical" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="vergelijk"
          options={{
            title: 'Vergelijk',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="server-outline" size={size} color={color as string} />
            ),
          }}
        />
        <Tabs.Screen
          name="instellingen"
          options={{
            title: 'Instellingen',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color as string} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <ThemedTabs />
    </AppProvider>
  );
}
