---
title: Club Connect
emoji: 🎬
colorFrom: gray
colorTo: blue
sdk: docker
app_port: 7860
---

# Club Connect

An exclusive, high-performance cross-platform mobile application for campus event and club discovery. Built with a Go backend and a React Native frontend featuring a "Noir Brutalism" design system.

## Setup

1. **Prerequisites:** Go 1.22+, PostgreSQL 16, Node.js (v18+).
2. **Env:** Copy `.env.example` to `.env` and fill in DB/API details.
3. **Run Backend:**
```bash
go mod tidy
go run cmd/server/main.go
```
4. **Run Mobile App:**
```bash
cd app
npm install
npx expo start
```

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/events` | List events |
| GET | `/api/clubs` | List clubs |
| POST | `/api/admin/scrape` | Trigger scrape |

## Structure

- `cmd/server`: Go backend entry point
- `internal/models`: DB schema
- `internal/services`: Scraper and parser logic
- `internal/handlers`: API endpoints
- `app/`: React Native mobile application
  - `app/components`: Reusable Noir Brutalism UI components
  - `app/screens`: Event feeds, Discovery, and Saved bookmarks
  - `app/store`: Zustand state management with AsyncStorage persistence
  - `app/navigation`: React Navigation stack and bottom tabs

## License
MIT
