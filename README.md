---
title: Club Connect
emoji: 🎬
colorFrom: gray
colorTo: blue
sdk: docker
app_port: 7860
---

# Club Connect

An automated, cross-platform campus event and club discovery platform. Built with a Go backend that uses AI to scrape and parse Instagram posts, and a React Native frontend featuring a sleek, minimal, text-first design system.

## Setup

1. **Prerequisites:** Go 1.22+, PostgreSQL 16, Node.js (v18+), Python 3.10+ (for local AI parsing).
2. **Env:** Copy `.env.example` to `.env` and fill in DB/API details.
3. **Run Backend:**
```bash
go mod tidy
go run cmd/server/main.go
```
4. **Run Mobile/Web App:**
```bash
cd app
npm install
npx expo start
```

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/events` | List upcoming and past events |
| GET | `/api/clubs` | List registered clubs |
| POST | `/api/admin/scrape` | Trigger manual Instagram scrape and AI parsing |

## Structure

- `cmd/server`: Go backend entry point
- `internal/models`: DB schema definitions (GORM)
- `internal/services`: Discovery service (Instagram RapidAPI) and Parser service (Python + Gemini AI)
- `app/`: React Native / Expo web frontend
  - `app/components`: Minimalist UI components (Cards, Badges, etc.)
  - `app/screens`: Event feeds, Discovery, and Details
  - `app/store`: Zustand state management for time-based filtering (Upcoming vs Past)

## Features

- **AI-Powered Event Discovery:** Automatically fetches club Instagram posts and uses AI (Qwen/Gemini) to determine if they are actionable events, extracting dates and locations.
- **Sleek Text-First UI:** A premium, minimalist UI focused on typography (Helvetica/sans-serif) and clean navigation, designed to bypass Instagram CDN image restrictions.
- **Seamless Filtering:** Easily toggle between "Upcoming" and "Past" events.
- **Hugging Face Ready:** Fully configurable for deployment via Docker Spaces.

## License
MIT
