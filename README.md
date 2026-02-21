Language Flashcards PWA

Prosta aplikacja typu flashcards do nauki słówek jako Progressive Web App (PWA).
Działa offline, zapisuje postęp w przeglądarce i wykorzystuje Service Worker do cachowania zasobów.

Live demo: https://6999144929d0780008428bdc--heroic-custard-3e0a60.netlify.app/index.html

Wymagania

przeglądarka z obsługą:

Service Worker
LocalStorage
Web Notifications (opcjonalnie)
Vibration API (opcjonalnie)

Uruchomienie lokalne

1. Klon repozytorium
git clone https://github.com/<username>/language_flashcards.git
cd language_flashcards
2. Uruchom lokalny serwer
opcja 1 — VS Code Live Server

zainstaluj rozszerzenie Live Server

kliknij "Open with Live Server"

opcja 2 — Node http-server
npx http-server

Technologie:

Vanilla JavaScript (ES6+)
HTML5
CSS3 (responsive layout)
Progressive Web App:
Service Worker
Web App Manifest
Cache API
LocalStorage — zapis postępu użytkownika
Fetch API — ładowanie słów z JSON
Web Notifications API
Vibration API

Funkcjonalności

Nauka słówek:
losowanie słów wg priorytetu:
  poziom nauki (weight)
  liczba użyć
  czas od ostatniego użycia
cooldown zapobiegający powtarzaniu słowa od razu
tryb odpowiedzi z walidacją tłumaczenia

Statystyki:
poziom nauki (0–10)
liczba użyć słowa
czas ostatniego użycia
tabela ze wszystkimi słowami

Offline / PWA:
cachowanie zasobów aplikacji
działanie offline
instalacja jako aplikacja
przypomnienia o nauce (1x dziennie)
wibracje przy odpowiedziach

Struktura projektu:
/icons
index.html
learn.html
stats.html
app.js
sw.js
style.css
manifest.webmanifest
words.json

