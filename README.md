# BNECK

Demo narzędzia dla shift managera: wąskie gardło linii, przepływ między maszynami i propozycje lean.

Fabryka **Oakmere Bar Co.** jest fikcyjna. Maszyny, awarie i liczby pochodzą z symulacji.

## Co jest w środku

| Plik | Co to jest |
|---|---|
| `index.html` | Cała strona w jednym pliku: symulacja, mapa strumienia, tablety operatorów, analiza, propozycje |
| `test.js` | Test silnika: 5 zmian z kolejnymi poprawkami, sprawdza % planu i wąskie gardło |

## Uruchomienie

- Strona: otwórz `index.html` w przeglądarce. Bez builda, bez serwera.
- Test: `node test.js`
- Vercel: import repo, preset "Other", bez komendy build.

## Jak liczone jest wąskie gardło

Metoda okresów aktywnych (Roser). W danej chwili wąskim gardłem jest maszyna z najdłuższym nieprzerwanym okresem pracy albo własnego postoju. Brak wsadu i brak miejsca przerywają okres.

Propozycje w demo daje silnik reguł, nie model AI.
