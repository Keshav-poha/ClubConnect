# --- Build Stage ---
FROM golang:alpine AS builder

WORKDIR /app

# Install git
RUN apk add --no-cache git

# Copy everything
COPY . .

# Force tidy to ensure compatibility
RUN go mod tidy

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/server/main.go

# --- Run Stage ---
FROM alpine:3.19

# Install only basic dependencies (no more chromium!)
RUN apk add --no-cache \
    ca-certificates \
    tzdata

WORKDIR /app
COPY --from=builder /app/main .

ENV PORT=7860
ENV GIN_MODE=release

EXPOSE 7860
CMD ["./main"]
