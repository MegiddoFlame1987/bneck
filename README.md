# BNECK

Demo narzędzia dla shift managera: wąskie gardło linii, przepływ między maszynami i propozycje lean.

Fabryka **Oakmere Bar Co.** jest fikcyjna. Maszyny, awarie i liczby pochodzą z symulacji.

## Co jest w środku

| Plik | Co to jest |
|---|---|
| `index.html` | Cała strona w jednym pliku. Zakładki: Przegląd (kierownik), Linia (strumień z góry na dół, wąskie gardło, OEE, straty), Załoga (ILUO, obsada, rekomendacja), Operatorzy (tablety), Analiza, Działania |
| `test.js` | Test silnika: 5 zmian z kolejnymi poprawkami, sprawdza % planu i wąskie gardło |

## Uruchomienie

- Strona: otwórz `index.html` w przeglądarce. Bez builda, bez serwera.
- Test: `node test.js`
- Vercel: import repo, preset "Other", bez komendy build.

## Jak liczone jest wąskie gardło

Metoda okresów aktywnych (Roser). W danej chwili wąskim gardłem jest maszyna z najdłuższym nieprzerwanym okresem pracy albo własnego postoju. Brak wsadu i brak miejsca przerywają okres.

OEE: dostępność (bez własnych postojów) × wydajność (wobec tempa idealnego, czekanie na inną maszynę obniża wydajność) × jakość (dobre sztuki).

Załoga: poziom ILUO operatora mnoży czas usuwania postojów (I ×1,45, L ×1,15, U ×1,0, O ×0,8). W produkcie obsada i matryca przyjdą z Crewmap.

Propozycje w demo daje silnik reguł, nie model AI.
