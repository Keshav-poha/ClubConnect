# --- Build Stage ---
FROM golang:latest AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/server/main.go

# --- Run Stage ---
FROM ubuntu:22.04

# Install basic dependencies and curl
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -L https://ollama.com/download/ollama-linux-amd64 -o /usr/bin/ollama \
    && chmod +x /usr/bin/ollama

WORKDIR /app
COPY --from=builder /app/main .

# Script to start Ollama and pull model before starting main app
RUN echo '#!/bin/bash\n\
export OLLAMA_HOST=0.0.0.0:11434\n\
ollama serve &\n\
echo "Waiting for Ollama to start..."\n\
until curl -s http://127.0.0.1:11434/api/tags > /dev/null; do\n\
  sleep 2\n\
done\n\
echo "Ollama started! Pulling light AI model (phi3:mini)..."\n\
ollama pull phi3:mini\n\
echo "Current Models:"\n\
ollama list\n\
echo "AI ready, starting app..."\n\
./main' > /app/start.sh \
    && chmod +x /app/start.sh

ENV PORT=7860
ENV GIN_MODE=release
# Point parser to local ollama by default
ENV PARSER_URL=http://127.0.0.1:11434/api/generate

EXPOSE 7860
CMD ["/app/start.sh"]
