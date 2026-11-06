# Testrapport Opslag Converter (D1-K1-W4)

| | |
| --- | --- |
| **App-versie** | 1.0.0 |
| **Getest door** | Jona van der Wal |

## Samenvatting

Ik heb de app op vier manieren getest. Alle tests zijn geslaagd.

| Testsoort | Omgeving | Resultaat |
| --- | --- | --- |
| Unit tests van de rekenlogica | Jest op Windows | Geslaagd: 53 van 53 |
| Statische controles | TypeScript, ESLint, expo-doctor | Geslaagd |
| Functionele test | Browser, mobiel formaat 375 × 812 | Geslaagd |
| Test op de telefoon | Echte hardware, via Expo Go | Geslaagd |

## 1. Unit tests

Deze tests start je met `npm test`. Ze staan in `src/lib/converter.test.ts`.

| Onderdeel | Wat ik getest heb |
| --- | --- |
| `convert` | Alle zes de eenheden met basis 1000 en 1024, omhoog en omlaag, heen en terug, waarde 0 |
| `parseInput` | Lege invoer, komma en punt, ongeldige tekst, negatieve getallen, grens van het maximum |
| `formatNumber` | Nederlandse notatie, rekenruis, exacte grote getallen, machten van 10 |
| `howManyFit` | Alleen hele exemplaren, geen verlies door rekenruis |
| `isShake` | Stilliggen en vasthouden tellen niet, hard schudden in elke richting wel |

## 2. Statische controles

| Opdracht | Resultaat |
| --- | --- |
| `npx tsc --noEmit` | Geen fouten |
| `npx expo lint` | Geen fouten, nadat ik 2 meldingen had opgelost |
| `npx expo-doctor` | 20 van 20 controles geslaagd |

## 3. Functionele test in de browser

Deze test heb ik op 5-11-2026 gedaan op de webversie, in mobiel formaat.

| # | Stap | Verwacht | Resultaat |
| --- | --- | --- | --- |
| B1 | Invoer `2,5` GB | 2.500.000.000 B, 2.500 MB, 0,0025 TB | Geslaagd |
| B2 | Invoer `1.5` GB | Punt telt als decimaalteken: 1,5 GB | Geslaagd |
| B3 | Invoer `abc` | Melding "geldig getal", geen uitkomst | Geslaagd |
| B4 | Invoer `-3` | Melding "negatief", geen uitkomst | Geslaagd |
| B5 | Lege invoer | Geen uitkomst, geen foutmelding | Geslaagd |
| B6 | Invoer `0` | Overal 0 | Geslaagd |
| B7 | Invoer `1000000000000000` | Geaccepteerd, grote uitkomsten als macht van 10 | Geslaagd |
| B8 | Invoer `1000000000000001` | Melding "te groot" | Geslaagd |
| B9 | Basis 1024, 1 GB | 1.073.741.824 B en 1.024 MB | Geslaagd |
| B10 | Basis 1024, 1 PB | 1.125.899.906.842.624 B | Geslaagd, na reparatie |
| B11 | Donkere modus uit | Hele app wordt licht | Geslaagd |
| B12 | Pagina herladen | Thema en basis blijven bewaard | Geslaagd |
| B13 | Tik op uitkomst | Vinkje verschijnt en verdwijnt weer | Geslaagd |
| B14 | Tik op wisknop | Invoer leeg, geen uitkomsten | Geslaagd |
| B15 | Vergelijk bij lege invoer | Melding om eerst een waarde in te vullen | Geslaagd |
| B16 | Vergelijk bij 1 GB | 250 foto's, 200 muzieknummers, 0 HD-films | Geslaagd |
| B17 | Wisselen tussen de 3 schermen | Alle schermen openen, geen consolefouten | Geslaagd |

In de browser kon ik niet controleren of de gekopieerde tekst echt op het klembord staat, omdat de browser het teruglezen blokkeerde. Trillen en schudden werken daar ook niet. Die onderdelen heb ik op de telefoon getest.

## 4. Test op de telefoon

| # | Stap | Verwacht | Geslaagd? |
| --- | --- | --- | --- |
| T1 | Project openen in Expo Go | App start zonder melding over de SDK-versie | Ja |
| T2 | Tik op het invoerveld | Numeriek toetsenbord met decimaalteken | Ja |
| T3 | Waarde invoeren en eenheid wisselen | Uitkomsten kloppen en veranderen direct | Ja |
| T4 | Tik op een eenheid | Korte tik van de trilmotor voelbaar | Ja |
| T5 | Tik op een uitkomst, plak in een notitie | Trilling, vinkje en juiste tekst, zoals `1.000 MB` | Ja |
| T6 | Schud de telefoon op Converter | Invoer leeg, trilling voelbaar | Ja |
| T7 | Eén keer schudden | Maar één actie uitgevoerd | Ja |
| T8 | Telefoon normaal vasthouden en lopen | Invoer wordt niet per ongeluk gewist | Ja |
| T9 | Schudden op Vergelijk of Instellingen | Er gebeurt niets | Ja |
| T10 | Darkmode wisselen | Alle 3 de schermen, tabbalk en statusbalk wisselen mee | Ja |
| T11 | App helemaal afsluiten en opnieuw openen | Thema en basis zijn bewaard | Ja |
| T12 | Langste uitkomst bekijken (1 biljard PB) | Tekst past in de rij | Ja |
| T13 | Tabbalk en bovenrand bekijken | Niets valt onder de notch of de navigatiebalk, tabbalk heeft ruimte onder de tekst | Ja, na aanpassing G6 |

## 5. Gevonden en opgeloste gebreken

| # | Gebrek | Gevonden door | Oplossing | Hertest |
| --- | --- | --- | --- | --- |
| G1 | 1 PB binair toonde `...842.620` in plaats van `...842.624` | Browsertest | Hele getallen rond ik niet meer af, unit test toegevoegd | Geslaagd |
| G2 | Onderkant van de tabteksten afgekapt | Browsertest | Tabtekst mag niet meer krimpen | Geslaagd |
| G3 | Keuzerondjes gaven `aria-checked` niet door | Browsertest | Overgestapt op `aria-checked` | Geslaagd |
| G4 | Lintfout: ref aangepast tijdens het tekenen | ESLint | Verplaatst naar `useEffect` | Geslaagd |
| G5 | Lintfout: tabicoon zonder componentnaam | ESLint | Icoon direct in de opties gedefinieerd | Geslaagd |
| G6 | Tabbalk te krap: tekst stond ongeveer 1 pixel van de onderrand | Eigen controle van de app | Tabbalk hoger gemaakt (64 punten plus veilige zone van de telefoon), nu 10 pixels ruimte | Geslaagd in de browser en op de telefoon (T13) |

## 6. Conclusie

De app werkt zoals bedoeld, zowel in de browser als op de telefoon. De berekeningen kloppen, foute invoer wordt netjes afgevangen en de trilmotor en versnellingsmeter doen wat ze moeten doen. De gebreken die ik tijdens het testen vond, zijn opgelost en opnieuw getest.
