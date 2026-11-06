# Documentatie Opslag Converter

| | |
| --- | --- |
| **Keuzedeel** | D1: Mobile application development |
| **Kerntaak** | D1-K1: Realiseert (onderdelen van) een mobiele applicatie |
| **Student** | *[naam invullen]* |
| **Datum** | *[datum invullen]* |
| **Versie app** | 1.0.0 |

> **Nog zelf in te vullen:** de delen in *[schuine haken]*. Het keuzedeel vraagt om keuzes in overleg met collega's of je team. Dat overleg moet echt plaatsvinden, dus leg het hier vast nadat het is gebeurd.

## 1. De opdracht en de eisen

Er moet een app komen die een ingevoerde opslagwaarde omrekent naar andere opslagwaarden.

| # | Eis | Hoe het is opgelost |
| --- | --- | --- |
| E1 | Omrekenen naar bytes, kilobytes, megabytes, gigabytes, terabytes en petabytes | Scherm Converter toont alle zes tegelijk |
| E2 | Drie schermen | Converter, Vergelijk en Instellingen |
| E3 | Light/darkmode-toggle als optie | Schakelaar op scherm Instellingen, keuze blijft bewaard |
| E4 | Ontwerp past bij het onderwerp | Stijl van serverapparatuur, zie hoofdstuk 5 |
| E5 | Verzorgde documentatie | README, dit document en het testrapport |

De opdracht zegt niet of 1 KB gelijk is aan 1000 of 1024 bytes. Beide komen in de praktijk voor, dus de gebruiker kan kiezen. De standaard is 1000, de officiële SI-betekenis van "kilo".

## 2. Keuze voor het type app (D1-K1-W1)

| Criterium | Native | Hybride / cross-platform | Web (PWA) |
| --- | --- | --- | --- |
| Eén codebase voor Android en iOS | Nee | Ja | Ja |
| Toegang tot hardware | Volledig | Ruim, via modules | Beperkt, verschilt per browser |
| Gevoel en snelheid | Beste | Goed | Afhankelijk van de browser |
| Ontwikkeltijd voor deze opdracht | Hoog: twee apps | Laag | Laag |
| Testen op iPhone vanaf Windows | Niet mogelijk zonder Mac | Mogelijk | Mogelijk |

**Keuze: hybride / cross-platform.** De app heeft geen zware berekeningen of grafische eisen, dus de extra snelheid van native levert weinig op. Eén codebase bespaart veel tijd, en anders dan bij een webapp zijn de trilmotor en versnellingsmeter betrouwbaar te gebruiken. React Native, dat hier is gebruikt, is een bijzonder geval binnen deze groep: het gebruikt echte native schermelementen in plaats van een webweergave.

**Overleg:** *[Met wie besproken, wanneer, wat de wensen van de opdrachtgever waren en wat de uitkomst was. Hoe is de keuze gecommuniceerd?]*

## 3. Keuze voor omgeving, taal en hardware (D1-K1-W2)

### Ontwikkelomgeving en programmeertaal

| Optie | Taal | Voordelen | Nadelen |
| --- | --- | --- | --- |
| **React Native + Expo** | TypeScript | Testen op een eigen telefoon zonder Android Studio, sluit aan bij webkennis, grote community | Afhankelijk van Expo-modules en hun versies |
| Flutter | Dart | Snelle en consistente weergave | Nieuwe taal leren, SDK en Android-tools installeren |
| Android Studio | Kotlin | Volledige controle, officiële tools | Alleen Android, zware installatie |
| Xcode | Swift | Volledige controle op iOS | Alleen iOS, vereist een Mac |

**Keuze: React Native met Expo (SDK 58), in TypeScript, met Visual Studio Code of een andere code-editor.**

1. **Past bij de ontwikkelomgeving:** op de ontwikkel-pc met Windows stond Node.js al, maar geen Android SDK, Java of Flutter. Xcode is op Windows niet beschikbaar.
2. **TypeScript vangt fouten vroeg af:** een verkeerde eenheid of ontbrekende waarde valt al op vóór de app draait.
3. **Expo Router** is de aanbevolen navigatie van Expo. Elk bestand in `src/app` is een scherm, wat de drie schermen overzichtelijk houdt.

**Overleg:** *[Met wie besproken en wat de uitkomst was.]*

### Hardwarefuncties

| Hardware | Functie in de app | Aangesproken via | Waarom |
| --- | --- | --- | --- |
| Touchscreen | Tikken op eenheden en uitkomsten, knoppen van minimaal 44 punten hoog | `Pressable` uit React Native | De hoofdbediening van de app |
| Trilmotor | Korte tik bij een keuze, bevestiging bij kopiëren en wissen | `expo-haptics` | Je voelt dat de actie gelukt is, ook zonder te kijken |
| Versnellingsmeter | Schudden wist de invoer | `Accelerometer` uit `expo-sensors` | Snel opnieuw beginnen met één hand |

**Niet gebruikt:** gps en camera, omdat ze niets toevoegen aan een omrekenapp en alleen onnodig om toestemming zouden vragen.

**Zo werkt het schudden:** de sensor meet tien keer per seconde de versnelling op drie assen. De totale kracht is `√(x² + y² + z²)`. Stilliggend is die ongeveer 1 g; boven 2,2 g telt het als schudden. Daarna wordt een seconde gewacht, zodat één keer schudden één actie is. De sensor staat alleen aan op het Converter-scherm om de accu te sparen. Zonder sensor blijft de app werken: de wisknop doet hetzelfde.

## 4. Technische opbouw (D1-K1-W3)

```text
Scherm (src/screens)      toont gegevens en vangt aanrakingen op
        │
AppContext (src/context)  bewaart invoer, thema en rekenbasis
        │
Logica (src/lib)          rekent en controleert, kent geen schermen
```

- **Scheiding van logica en schermen.** Alle berekeningen staan in `src/lib/converter.ts`. Daardoor zijn ze zonder telefoon automatisch te testen.
- **Gedeelde toestand.** De invoer staat in `AppContext`, zodat het scherm Vergelijk dezelfde waarde gebruikt als de Converter.
- **Bewaren van instellingen.** Thema en rekenbasis worden opgeslagen met AsyncStorage. Zolang de gebruiker geen thema kiest, volgt de app het thema van de telefoon.

### Rekenen

Elke eenheid heeft een stapnummer: B = 0, KB = 1, tot en met PB = 5. Omrekenen is:

```text
uitkomst = waarde × basis^(stap van - stap naar)
```

Bij een negatief verschil wordt gedeeld door de positieve macht, omdat dat nauwkeuriger is dan vermenigvuldigen met een kleine breuk.

### Invoer en weergave

- Zowel `1,5` als `1.5` is geldig. Een punt is dus altijd een decimaalteken: `1.000` betekent 1.
- Negatieve getallen, tekst en waarden boven 1 biljard (10¹⁵) worden geweigerd met een duidelijke melding.
- Uitkomsten staan in Nederlandse notatie (`1.234,5`). Heel grote en kleine getallen worden als macht van 10 getoond (`1 × 10²¹`).

### Bekende beperkingen

- JavaScript rekent met getallen die tot 2⁵³ (ongeveer 9 biljard) exact zijn. Daarboven kunnen de laatste cijfers afwijken, bijvoorbeeld bij een uitkomst in bytes vanaf 8 PB.
- De groottes op het scherm Vergelijk zijn richtwaarden. Een echte foto of film kan flink kleiner of groter zijn.
- `npm audit` meldt 5 kwetsbaarheden van gemiddeld niveau in `glob` en `minimatch`, via de Expo-tools. De automatische oplossing (`npm audit fix --force`) kan het project breken en is daarom niet uitgevoerd.

### Voortgang en opgeloste problemen

| Probleem | Oplossing |
| --- | --- |
| 1 PB binair werd getoond als `...842.620` in plaats van `...842.624` | Hele getallen worden niet meer afgerond; test toegevoegd |
| Onderkant van tabteksten ("Vergelijk") werd afgekapt | Tabtekst mag niet meer krimpen |
| Keuzerondjes gaven hun status niet door aan screenreaders | Overgestapt op `aria-checked` |
| Lint: ref werd tijdens het tekenen aangepast in `useShake` | Aanpassing verplaatst naar `useEffect` |

**Planning en urenverantwoording:** *[eigen planning en bestede tijd invullen]*

## 5. Ontwerp

Het ontwerp is afgeleid van serverapparatuur in een datacenter, omdat daar de opslag staat.

- **Kleur:** donkere behuizing met teal als kleur van een statuslampje. Teal markeert steeds wat actief is.
- **Eenheidskiezer:** zes segmenten naast elkaar, van klein naar groot, als een oplopende schaal.
- **Lettertype:** getallen staan in een letter met vaste breedte, die technisch oogt en goed leesbaar is.
- **App-icoon:** drie serverschijven met statuslampjes.

Light- en darkmode gebruiken dezelfde opbouw en hebben elk een eigen kleurenset in `src/theme/colors.ts`.

### Screenshots

*[Voeg hier screenshots van je eigen telefoon toe: de drie schermen, in light en in dark.]*
