# --- Build Stage ---
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git for dependencies if needed
RUN apk add --no-cache git

# Copy dependency files first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the code
COPY . .

# Build the app - strip debug info for a smaller binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/server/main.go

# --- Run Stage ---
FROM alpine:3.19

# Install Chromium and dependencies for chromedp
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /app

# Copy the binary from the builder
COPY --from=builder /app/main .

# Standard environment variables
ENV PORT=7860
ENV GIN_MODE=release
ENV CHROME_BIN=/usr/bin/chromium-browser

# Hugging Face Spaces run on port 7860
EXPOSE 7860

# Run the app
CMD ["./main"]
