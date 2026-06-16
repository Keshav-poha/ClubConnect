---
title: ClubConnect
emoji: 🎓
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
---

# 🚀 ClubConnect

> An automated, cross-platform campus event and club discovery platform with AI-powered data extraction and advanced form management.

ClubConnect bridges the gap between university societies and students. It uses a **Go backend** combined with **AI parsing** to automatically scrape and structure event data from Instagram, while providing a beautiful **React Native (Expo)** frontend for students to discover events and apply to clubs.

---

## 🏗 Architecture

The system is built on a modern decoupled architecture, combining a high-performance Go backend with a responsive React Native frontend, and an integrated AI pipeline for social media data extraction.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Client Applications]
        Web[Web App (React Native Web)]
        Mobile[Mobile App (Expo/React Native)]
    end

    %% API Gateway & Routing
    subgraph Backend [Go Server]
        Router[Gin HTTP Router]
        Auth[Auth Middleware]
        
        %% Handlers
        subgraph Handlers
            PublicH[Public API Handlers]
            AdminH[Admin API Handlers]
            ProxyH[CORS Image Proxy]
        end
        
        %% Services
        subgraph Services
            Insta[Instagram Scraper Service]
            AIParser[AI Parsing Service (Qwen/Gemini)]
            FormService[Form & Ranking System]
        end
        
        %% Database
        DB[(PostgreSQL / SQLite)]
    end

    %% External Connections
    subgraph External [External APIs]
        Instagram[Instagram CDN]
        HuggingFace[Hugging Face Spaces]
    end

    %% Connections
    Web <--> Router
    Mobile <--> Router
    
    Router --> Auth
    Router --> PublicH
    Auth --> AdminH
    Router --> ProxyH
    
    PublicH --> DB
    AdminH --> FormService
    FormService --> DB
    
    AdminH -.-> Insta
    Insta --> AIParser
    AIParser --> DB
    
    ProxyH --> Instagram
    Backend -.-> HuggingFace
```

---

## ✨ Key Features

### 📅 AI-Powered Event Discovery
- **Automated Scraping:** Periodically fetches posts from club Instagram accounts via RapidAPI.
- **Smart Parsing:** Utilizes lightweight AI models (like Qwen 2.5) to analyze post captions, determine if a post is an actionable event, and automatically extract precise **Dates** and **Locations**.
- **CDN Proxy:** Bypasses browser CORS and CORB restrictions to natively stream Instagram CDN images (including `fbcdn.net`) directly to the frontend.

### 📝 Advanced Form Management System
- **Dynamic Application Forms:** Admins can create rich, dynamic recruitment forms with Text, Checkbox, File Upload, and Dropdown fields.
- **Deadline Enforcement:** Set strict deadlines (e.g., `YYYY-MM-DD`). The frontend dynamically locks applications and displays a "CLOSED" badge once the deadline passes.
- **Applicant Ranking System:** Admins can review submissions securely and assign a score (0-100) to each applicant.
- **Top Rankers Dashboard:** With a single click, instantly sort responses by score to bubble top candidates to the top of the list.

### 🎨 Stunning UI/UX
- **Claymorphism & Brutalism:** Uses modern, soft, 3D-like claymorphism UI components (`ClayTextInput`, `ClayCard`, `ClayDropdown`) mixed with clean typography.
- **Zustand State Management:** Hyper-fast client-side state management for fluid animations and instant UI updates.
- **Cross-Platform:** Write once, run seamlessly on iOS, Android, and Web browsers.

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React Native, Expo, React Navigation, Zustand |
| **Backend Framework** | Go (Golang) 1.22+, Gin HTTP Framework |
| **Database** | GORM, PostgreSQL (Production), SQLite (Local) |
| **AI & NLP** | Python, PyTorch, Transformers (Qwen-0.5B) |
| **Deployment** | Docker, Hugging Face Spaces |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Go** (v1.22 or higher)
- **Node.js** (v18 or higher)
- **Python** (3.10+ for local AI parsing)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=7860
DB_HOST=localhost # Leave blank or localhost to default to SQLite
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=clubconnect
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key
INSTAGRAM_RAPIDAPI_KEY=your_api_key
```

### 3. Running the Backend
```bash
go mod tidy
go run cmd/server/main.go
```
*The server will start on port `7860`.*

### 4. Running the Frontend
```bash
cd app
npm install
npx expo start
```
*Press `w` to open the web version, or scan the QR code using the Expo Go app on your phone.*

---

## 📁 Project Structure

```text
ClubConnect/
├── app/                        # React Native Frontend
│   ├── components/             # Reusable UI components (Claymorphism)
│   ├── navigation/             # Tab and Stack navigators
│   ├── screens/                # App Views (Dashboard, Forms, Discovery)
│   └── store/                  # Zustand state slices
├── cmd/
│   └── server/                 # Go application entry point
├── internal/                   # Backend Logic
│   ├── database/               # DB connection and auto-migrations
│   ├── handlers/               # Gin route controllers (Admin, Public, Proxy)
│   ├── middleware/             # JWT Auth and CORS
│   ├── models/                 # GORM Database schemas
│   └── services/               # Instagram scraper and AI parsers
└── Dockerfile                  # Multi-stage build for HF Spaces
```

---

## 📄 License

This project is licensed under the MIT License.
