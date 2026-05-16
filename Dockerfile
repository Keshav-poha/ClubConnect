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

# Create writable directories for Ollama
RUN mkdir -p /app/ollama /app/models
ENV OLLAMA_HOME=/app/ollama
ENV OLLAMA_MODELS=/app/models
ENV HOME=/app/ollama

# Script to start Ollama and pull model before starting main app
RUN echo '#!/bin/bash\n\
export OLLAMA_HOST=127.0.0.1:11434\n\
echo "Starting Ollama server..."\n\
ollama serve > /app/ollama.log 2>&1 &\n\
\n\
echo "Waiting for Ollama to wake up..."\n\
for i in {1..20}; do\n\
  if curl -s http://127.0.0.1:11434/api/tags > /dev/null; then\n\
    echo "Ollama is awake!"\n\
    break\n\
  fi\n\
  echo "Still waiting... ($i/20)"\n\
  sleep 3\n\
done\n\
\n\
if ! curl -s http://127.0.0.1:11434/api/tags > /dev/null; then\n\
  echo "CRITICAL: Ollama failed to start. Logs follow:"\n\
  cat /app/ollama.log\n\
fi\n\
\n\
echo "Ensuring model exists..."\n\
ollama pull phi3:mini\n\
\n\
echo "AI ready, starting app..."\n\
./main' > /app/start.sh \
    && chmod +x /app/start.sh

ENV PORT=7860
ENV GIN_MODE=release
# Point parser to local ollama by default
ENV PARSER_URL=http://127.0.0.1:11434/api/generate

EXPOSE 7860
CMD ["/app/start.sh"]
