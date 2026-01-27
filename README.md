# Personal Finance Manager

## Autorzy

Projekt został przygotowany przez:

- **Paweł Wilga (55208**
- **Piotr Wilga (55209)**

---

## Instrukcja uruchomienia

### 1. Skonfiguruj `.env`

W katalogu `PersonalFinanceManager` skonfiguruj plik `.env`. Będą w nim przechowywane poufne dane (m.in.: hasła do bazy danych oraz jej ustawienia. Pamiętaj, by nie wypychać tego pliku do GitHub'a. Możesz skorzystać z przykładowego pliku `.env-example`.


### 2. (Opcjonalnie) Skonfiguruj `appsettings.json`

W katalogu `WebApi` znajdziesz plik `appsettings.json`. Znajdują się w nim m.in.:

- sekcja `Jwt` z kluczem tokenu autoryzacyjnego (minimum 32 znaki)
- **sekcja `ExchangeRateApi` – tutaj wpisz swój klucz API**

#### Przykład:

```json
"ExchangeRateApi": {
  "Key": "TWOJ_KLUCZ_API",
  "CacheDurationMinutes": 15
}
```

Aby uzyskać klucz, załóż darmowe konto na:
https://app.exchangerate-api.com/

Możesz dostosować `CacheDurationMinutes` (np. 60), aby zmniejszyć liczbę zapytań do zewnętrznego API.

### 3. Uruchom kontenery Dockera

- Upewnij się, że masz zainstalowany **Docker Desktop** (wymagany na Windows).
- Otwórz terminal w głównym katalogu projektu (tam gdzie jest plik `docker-compose.yml`)
- Uruchom komendę:

```bash
docker compose up --build
```

To polecenie:

- zbuduje i uruchomi kontenery:
  - `pfm-db` (SQL Server)
  - `pfm-webapi` (Web API)
  - `pfm-frontend` (interfejs użytkownika NodeJS)
- utworzy wspólną sieć `app-network`, dzięki której kontenery się komunikują

### 4. Dostęp do aplikacji

- **Frontend **: http://localhost:3000  

---

### 5. Dostęp w trybie deweloperskim

Możliwe jest uruchomienie aplikacji w trybie deweloperskim. Umożliwia on dostęp do swagger'a oraz bazy danych, (na przykład w celu naprawy lub rozwoju). Aby uruchomić aplikację w tym trybie najprościej jest skorzystać z pliku `docker-compose.override.yml`, który nadpisze konfigurację podstawową, dodając do niej potrzebne przekierowania portów. Możesz skorzystać z przykładowego pliku `docker-compose.override-example.yml`. Następnie uruchom polecenie:

```bash
docker compose up --build
```

Dostęp do usług uzyskasz na poniższych portach.

- **WebAPI (Swagger lub testy)**: http://localhost:5000 lub https://localhost:5001  
- **Baza danych**: możesz połączyć się z hosta na porcie `1433` (np. przez SSMS lub Azure Data Studio)

---

**Personal Finance Manager** to aplikacja webowa służąca do zarządzania finansami osobistymi. Umożliwia użytkownikom pełną kontrolę nad kontami bankowymi, transakcjami oraz oszczędnościami. Aplikacja oferuje przejrzysty interfejs, przemyślaną architekturę i możliwość łatwego rozszerzania w przyszłości.

---

## Kluczowe funkcje

- **Zarządzanie kontami** – możliwość dodawania, edytowania i usuwania kont w wielu walutach.
- **Rejestrowanie transakcji** – przypisywanie transakcji do kont i kategorii.
- **Wsparcie dla wielu użytkowników** – każdy użytkownik posiada własne, odseparowane dane.
- **Filtrowanie danych** – przeszukiwanie transakcji po dacie, kwocie, kategorii itd.
- **Obsługa wielu walut** – przeliczanie wartości na podstawie aktualnych kursów wymiany.
- **Autoryzacja i bezpieczeństwo** – logowanie użytkowników z wykorzystaniem tokenów JWT.
- **Pobieranie kursów walut** – integracja z zewnętrznym API (ExchangeRate-API) z lokalnym cache'owaniem.

---

## Architektura i technologie

Projekt składa się z trzech głównych komponentów działających jako osobne kontenery Dockera, połączone w sieci `app-network`:

- **Web API (.NET 8 + ASP.NET Core)** – serwer backendowy obsługujący logikę biznesową i dostęp do bazy danych.
- **Baza danych (MS SQL Server)** – przechowuje dane użytkowników, kont i transakcji. Inicjalizowana automatycznie z plików `.sql` po zbudowaniu projektu.
- **Frontend (NodeJS + ExpressJS)** – interfejs użytkownika działający w przeglądarce (uruchamiany w osobnym kontenerze).

Technologie użyte w projekcie:

- **Backend**: ASP.NET Core Web API (.NET 8)
- **Frontend**: NodeJS/ExpressJS
- **Baza danych**: Microsoft SQL Server (kontener z obsługą DACPAC)
- **Docker**: docker-compose, konteneryzacja całego środowiska
- **Autoryzacja**: JWT
## Zewnętrzne API
- **ExchangeRate-API**: [https://www.exchangerate-api.com/](https://www.exchangerate-api.com/)
- **NBP Web API**: [http://api.nbp.pl/](http://api.nbp.pl/)

