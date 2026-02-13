# RiddleLAB Frontend

Frontend aplikacji RiddleLAB

## Wymagania

- Docker **lub** Node.js 18+
- npm

## Struktura projektu

Projekt powinien być sklonowany w strukturze:

```
riddlelab/
  api/        # backend (Laravel)
  frontend/   # frontend (to repozytorium)
```

## Integracja z backendem

**Uwaga:**  
Do poprawnego działania wymagane jest uruchomienie backendu (API) z repozytorium:  
[https://github.com/maszjan/riddlelab-api](https://github.com/maszjan/riddlelab-api)

**Docker Compose uruchom w katalogu `riddlelab/api`!**  
Frontend zostanie automatycznie podniesiony jako jeden z serwisów.

Postępuj zgodnie z instrukcją w README backendu, aby uruchomić API i frontend.

Upewnij się, że zmienna `VITE_API_URL` w pliku `.env` wskazuje na adres API (np. `http://localhost:8080/api`).

## Instalacja i uruchomienie

### 1. Klonowanie repozytoriów

```sh
git clone https://github.com/maszjan/riddlelab riddlelab/frontend
git clone https://github.com/maszjan/riddlelab-api riddlelab/api
```

### 2. Konfiguracja środowiska

Skopiuj plik `.env` lub `.env.example` i ustaw adres backendu (`VITE_API_URL`).

### 3. Uruchomienie przez Docker (zalecane)

Przejdź do katalogu backendu i uruchom Docker Compose:

```sh
cd ../api
docker compose up --build
```

Aplikacja frontendowa będzie dostępna pod [http://localhost:5200](http://localhost:5200).

### 4. Uruchomienie lokalnie (bez Dockera)

```sh
npm install
npm run dev
```

## Użyte biblioteki

- **konva.js** – do modułu edycji map (edytor pokoi)
- **kaplay.js** – do obsługi modułu gry
- **React, TypeScript, TailwindCSS, Vite** – główny stack

## Ważne pliki i katalogi

- `src/` – główny kod aplikacji
- `public/` – statyczne zasoby
- `.Dockerfile` – obraz aplikacji
- `.env` – konfiguracja środowiska

---

Plik `.env.example`

W repozytorium znajduje się plik `.env.example`, który zawiera przykładowe zmienne środowiskowe wymagane do uruchomienia frontendu.  
Przed pierwszym uruchomieniem skopiuj go do `.env` i dostosuj wartości do swojego środowiska:

```sh
cp .env.example .env
```

Przykładowa zawartość `.env.example`:

```
VITE_API_URL=http://localhost:8080
VITE_PUSHER_APP_KEY=XXXXXXXXXXXX
VITE_PUSHER_APP_CLUSTER=eu
VITE_ENV=development
```

**Opis zmiennych:**

- `VITE_API_URL` – adres backendu (API), np. `http://localhost:8080`
- `VITE_PUSHER_APP_KEY` – klucz aplikacji Pusher (konieczne)
- `VITE_PUSHER_APP_CLUSTER` – klaster Pushera (zazwyczaj eu)
- `VITE_ENV` – środowisko uruchomienia (`development` lub `production`)

Pamiętaj, aby zawsze mieć poprawnie skonfigurowany plik `.env` przed uruchomieniem aplikacji!
