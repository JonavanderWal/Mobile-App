# Opslag Converter

Mobiele app die een opslagwaarde direct omrekent naar bytes, kilobytes, megabytes, gigabytes, terabytes en petabytes. Gemaakt voor keuzedeel D1: Mobile application development.

## Functies

| Scherm | Wat je er doet |
| --- | --- |
| **Converter** | Waarde invoeren, eenheid kiezen en alle zes de uitkomsten tegelijk zien. Tik op een uitkomst om die te kopiëren. Schud je telefoon om te wissen. |
| **Vergelijk** | Zien hoeveel foto's, muzieknummers en films in de ingevoerde hoeveelheid passen, plus een tabel met alle eenheden. |
| **Instellingen** | Light/darkmode wisselen en kiezen tussen rekenen met 1000 of 1024. Je keuzes blijven bewaard. |

## De app starten

Je hebt [Node.js](https://nodejs.org) nodig (minimaal 22.13) en voor het testen op een telefoon de app **Expo Go**.

```bash
npm install
```

```bash
npm start
```

Scan daarna de QR-code met Expo Go (Android) of de Camera-app (iPhone). Telefoon en computer moeten op hetzelfde wifi-netwerk zitten. Lukt dat niet, gebruik dan `npx expo start --tunnel`.

Meldt Expo Go dat de SDK-versie niet wordt ondersteund, kijk dan op [expo.dev/go](https://expo.dev/go) voor de juiste Expo Go-versie (SDK 58).

Bekijken in de browser kan ook met `npm run web`, maar daar werken trillen en schudden niet.

## Controleren

| Opdracht | Wat het doet |
| --- | --- |
| `npm test` | Draait de unit tests |
| `npm run typecheck` | Controleert de TypeScript-types |
| `npm run lint` | Controleert de codestijl |

## Projectstructuur

```text
src/
  app/        Routes: elk bestand is een scherm, _layout.tsx bevat de tabbalk
  screens/    De drie schermen
  context/    Gedeelde toestand: invoer, thema en rekenbasis
  hardware/   Koppelingen met de trilmotor en de versnellingsmeter
  lib/        Rekenlogica en unit tests, zonder afhankelijkheid van schermen
  theme/      Kleuren en lettertype
docs/         Documentatie en testrapport
```

## Documentatie

- [Technische documentatie en keuzes](docs/documentatie.md)
- [Testrapport](docs/testrapport.md)
