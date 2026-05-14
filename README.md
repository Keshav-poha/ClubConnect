# Club Connect

Campus event discovery platform that scrapes Instagram and parses captions into structured data. Backend built in Go, frontend in React Native.

## Setup

1. **Prerequisites:** Go 1.22+, PostgreSQL 16.
2. **Env:** Copy `.env.example` to `.env` and fill in DB/API details.
3. **Run:**
```bash
go mod tidy
go run cmd/server/main.go
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
