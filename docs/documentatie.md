# Documentatie Opslag Converter

| | |
| --- | --- |
| **Keuzedeel** | D1: Mobile application development |
| **Kerntaak** | D1-K1: Realiseert (onderdelen van) een mobiele applicatie |
| **Student** | Jona van der Wal |
| **Datum** | *[datum invullen]* |
| **Versie app** | 1.0.0 |

## 1. De opdracht en de eisen

Ik moest een app maken die een ingevoerde opslagwaarde omrekent naar andere opslagwaarden.

| # | Eis | Hoe ik het heb opgelost |
| --- | --- | --- |
| E1 | Omrekenen naar bytes, kilobytes, megabytes, gigabytes, terabytes en petabytes | Het scherm Converter toont alle zes tegelijk |
| E2 | Drie schermen | Converter, Vergelijk en Instellingen |
| E3 | Light/darkmode-toggle als optie | Schakelaar op het scherm Instellingen, de keuze blijft bewaard |
| E4 | Ontwerp past bij het onderwerp | Stijl van serverapparatuur, zie hoofdstuk 5 |
| E5 | Verzorgde documentatie | README, dit document en het testrapport |

De opdracht zegt niet of 1 KB gelijk is aan 1000 of 1024 bytes. Beide komen in de praktijk voor, dus ik laat de gebruiker kiezen. De standaard is 1000, omdat dat de officiële SI-betekenis van "kilo" is.

## 2. Keuze voor het type app (D1-K1-W1)

Ik heb de drie types apps met elkaar vergeleken:

| Criterium | Native | Hybride / cross-platform | Web (PWA) |
| --- | --- | --- | --- |
| Eén codebase voor Android en iOS | Nee | Ja | Ja |
| Toegang tot hardware | Volledig | Ruim, via modules | Beperkt, verschilt per browser |
| Gevoel en snelheid | Beste | Goed | Afhankelijk van de browser |
| Ontwikkeltijd voor deze opdracht | Hoog: twee apps | Laag | Laag |
| Testen op iPhone vanaf Windows | Niet mogelijk zonder Mac | Mogelijk | Mogelijk |

**Mijn keuze: hybride / cross-platform.** De app heeft geen zware berekeningen of grafische eisen, dus de extra snelheid van native levert weinig op. Met één codebase bespaar ik veel tijd, en anders dan bij een webapp kan ik de trilmotor en versnellingsmeter betrouwbaar gebruiken. React Native is wel een bijzonder geval binnen deze groep: het gebruikt echte native schermelementen in plaats van een webweergave.

**Overleg:** dit is een individueel project, dus er waren geen collega's of een team om mee te overleggen. De wensen heb ik uit de opdracht gehaald en de keuze heb ik zelfstandig gemaakt met de vergelijking hierboven. Ik leg de keuze via deze documentatie voor aan mijn docent.

## 3. Keuze voor omgeving, taal en hardware (D1-K1-W2)

### Ontwikkelomgeving en programmeertaal

| Optie | Taal | Voordelen | Nadelen |
| --- | --- | --- | --- |
| **React Native + Expo** | TypeScript | Testen op een eigen telefoon zonder Android Studio, sluit aan bij webkennis, grote community | Afhankelijk van Expo-modules en hun versies |
| Flutter | Dart | Snelle en consistente weergave | Nieuwe taal leren, SDK en Android-tools installeren |
| Android Studio | Kotlin | Volledige controle, officiële tools | Alleen Android, zware installatie |
| Xcode | Swift | Volledige controle op iOS | Alleen iOS, vereist een Mac |

**Mijn keuze: React Native met Expo (SDK 58), in TypeScript.** Daar had ik drie redenen voor:

1. **Het past bij mijn computer.** Ik werk op Windows en had Node.js al geïnstalleerd, maar geen Android SDK, Java of Flutter. Xcode is op Windows niet beschikbaar.
2. **TypeScript vangt fouten vroeg af.** Een verkeerde eenheid of ontbrekende waarde valt al op voordat de app draait.
3. **Expo Router houdt het overzichtelijk.** Dit is de aanbevolen navigatie van Expo. Elk bestand in `src/app` is een scherm.

**Overleg:** ook deze keuze heb ik zelfstandig gemaakt, omdat dit een individueel project is.

### Hardwarefuncties

| Hardware | Functie in de app | Aangesproken via | Waarom |
| --- | --- | --- | --- |
| Touchscreen | Tikken op eenheden en uitkomsten, knoppen van minimaal 44 punten hoog | `Pressable` uit React Native | De hoofdbediening van de app |
| Trilmotor | Korte tik bij een keuze, bevestiging bij kopiëren en wissen | `expo-haptics` | Je voelt dat de actie gelukt is, ook zonder te kijken |
| Versnellingsmeter | Schudden wist de invoer | `Accelerometer` uit `expo-sensors` | Snel opnieuw beginnen met één hand |

Gps en camera heb ik niet gebruikt. Ze voegen niets toe aan een omrekenapp en zouden alleen onnodig om toestemming vragen.

**Zo werkt het schudden:** de sensor meet tien keer per seconde de versnelling op drie assen. De totale kracht is `√(x² + y² + z²)`. Stilliggend is die ongeveer 1 g; boven 2,2 g telt het als schudden. Daarna wacht de app een seconde, zodat één keer schudden één actie is. De sensor staat alleen aan op het scherm Converter om de accu te sparen. Zonder sensor blijft de app gewoon werken, want de wisknop doet hetzelfde.

## 4. Technische opbouw (D1-K1-W3)

```text
Scherm (src/screens)      toont gegevens en vangt aanrakingen op
        │
AppContext (src/context)  bewaart invoer, thema en rekenbasis
        │
Logica (src/lib)          rekent en controleert, kent geen schermen
```

- **Logica en schermen zijn gescheiden.** Alle berekeningen staan in `src/lib/converter.ts`. Daardoor kan ik ze zonder telefoon automatisch testen.
- **De toestand is gedeeld.** De invoer staat in `AppContext`, zodat het scherm Vergelijk dezelfde waarde gebruikt als de Converter.
- **Instellingen blijven bewaard.** Thema en rekenbasis sla ik op met AsyncStorage. Zolang de gebruiker geen thema kiest, volgt de app het thema van de telefoon.

### Rekenen

Elke eenheid heeft een stapnummer: B = 0, KB = 1, tot en met PB = 5. Omrekenen gaat zo:

```text
uitkomst = waarde × basis^(stap van - stap naar)
```

Bij een negatief verschil deel ik door de positieve macht, omdat dat nauwkeuriger is dan vermenigvuldigen met een kleine breuk.

### Invoer en weergave

- Zowel `1,5` als `1.5` is geldig. Een punt is dus altijd een decimaalteken: `1.000` betekent 1.
- Negatieve getallen, tekst en waarden boven 1 biljard (10¹⁵) worden geweigerd met een duidelijke melding.
- Uitkomsten staan in Nederlandse notatie (`1.234,5`). Heel grote en kleine getallen worden als macht van 10 getoond (`1 × 10²¹`).

### Bekende beperkingen

- JavaScript rekent met getallen die tot 2⁵³ (ongeveer 9 biljard) exact zijn. Daarboven kunnen de laatste cijfers afwijken, bijvoorbeeld bij een uitkomst in bytes vanaf 8 PB.
- De groottes op het scherm Vergelijk zijn richtwaarden. Een echte foto of film kan flink kleiner of groter zijn.
- `npm audit` meldt 5 kwetsbaarheden van gemiddeld niveau in `glob` en `minimatch`, via de Expo-tools. De automatische oplossing (`npm audit fix --force`) kan het project breken, dus die heb ik niet uitgevoerd.

### Voortgang en opgeloste problemen

| Probleem | Oplossing |
| --- | --- |
| 1 PB binair werd getoond als `...842.620` in plaats van `...842.624` | Hele getallen rond ik niet meer af; test toegevoegd |
| Onderkant van tabteksten ("Vergelijk") werd afgekapt | Tabtekst mag niet meer krimpen |
| Keuzerondjes gaven hun status niet door aan screenreaders | Overgestapt op `aria-checked` |
| Lint: ref werd tijdens het tekenen aangepast in `useShake` | Aanpassing verplaatst naar `useEffect` |
| Tabbalk was te krap, de tekst stond bijna op de onderrand | Tabbalk hoger gemaakt, met de veilige zone van de telefoon meegerekend |

**Planning en urenverantwoording:** *[eigen planning en bestede tijd invullen]*

## 5. Ontwerp

Het ontwerp is afgeleid van serverapparatuur in een datacenter, omdat daar de opslag staat.

- **Kleur:** een donkere behuizing met teal als kleur van een statuslampje. Teal markeert steeds wat actief is.
- **Eenheidskiezer:** zes segmenten naast elkaar, van klein naar groot, als een oplopende schaal.
- **Lettertype:** getallen staan in een letter met vaste breedte, die technisch oogt en goed leesbaar is.
- **App-icoon:** drie serverschijven met statuslampjes.

Light- en darkmode hebben dezelfde opbouw en elk een eigen kleurenset in `src/theme/colors.ts`.

### Screenshots

*[Screenshots van de telefoon toevoegen: de drie schermen, in light en in dark.]*
