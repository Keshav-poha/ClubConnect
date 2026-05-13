# Club Connect 🎬

> Campus event discovery powered by Instagram scraping and intelligent parsing.

Club Connect automatically discovers events from university societies by scraping their Instagram accounts and using a text parsing service to convert captions into structured event data. Events are presented in a cinematic "Noir Brutalism" interface.

## Quick Start

### Prerequisites

- **Go 1.22+** installed
- **PostgreSQL 16** running locally
- **Parser API key** (for caption parsing)

### Setup

```bash
# Clone the repo
git clone https://github.com/clubconnect/clubconnect.git
cd clubconnect

# Copy environment template
cp .env.example .env
# Edit .env with your database credentials and Parser API key

# Install dependencies
go mod tidy

# Run the server
go run cmd/server/main.go
```

### API Endpoints

| Method | Path                | Description                |
| ------ | ------------------- | -------------------------- |
| GET    | `/api/health`       | Health check               |
| GET    | `/api/events`       | List upcoming events       |
| GET    | `/api/events/:id`   | Get event details          |
| GET    | `/api/clubs`        | List all tracked clubs     |
| GET    | `/api/clubs/:id`    | Get club + its events      |
| POST   | `/api/admin/clubs`  | Add a new club to track    |
| POST   | `/api/admin/scrape` | Trigger manual scrape      |

### Project Structure

```
clubconnect/
├── cmd/server/main.go        # Entry point
├── internal/
│   ├── config/               # Environment configuration
│   ├── database/             # PostgreSQL + GORM setup
│   ├── models/               # Club, Event, ScrapeLog
│   ├── handlers/             # HTTP request handlers
│   ├── services/             # Business logic layer
│   ├── middleware/            # Logger, CORS, Rate Limiter
│   └── router/               # Gin route registration
├── app/                      # React Native mobile app (Phase 3)
└── README.md
```

## Architecture

The project is structured into three phases: Go Engine, API Layer, and Mobile App (React Native/Expo). The database schema revolves around Clubs, Events, and ScrapeLogs.

## License

MIT
