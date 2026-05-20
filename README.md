---
title: Club Connect
emoji: 🎬
colorFrom: gray
colorTo: blue
sdk: docker
app_port: 7860
---

# Club Connect

Campus event discovery platform that scrapes Instagram and parses captions into structured data. Backend built in Go, frontend in React Native.

## Setup

1. **Prerequisites:** Go 1.22+, PostgreSQL 16, Node.js.
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

- `cmd/server`: Entry point
- `internal/models`: DB schema
- `internal/services`: Scraper and parser logic
- `internal/handlers`: API endpoints
- `app/`: React Native mobile app

## License
MIT
