# --- Node Build Stage ---
FROM node:20 AS frontend-builder
WORKDIR /workspace
COPY app/package*.json ./app/
RUN cd app && npm ci
COPY app/ ./app/
RUN cd app && npx expo export -p web

# --- Go Build Stage ---
FROM golang:latest AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/server/main.go

# --- Run Stage ---
FROM ubuntu:22.04
ARG DEBIAN_FRONTEND=noninteractive

# Install Python and basic tools
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tzdata \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install AI libraries
RUN pip3 install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip3 install --no-cache-dir transformers accelerate

# Pre-download the ultra-light AI model (Qwen 0.5B)
RUN python3 -c 'from transformers import AutoModelForCausalLM, AutoTokenizer; \
    model_name = "Qwen/Qwen2.5-0.5B-Instruct"; \
    AutoTokenizer.from_pretrained(model_name); \
    AutoModelForCausalLM.from_pretrained(model_name)'

WORKDIR /app
RUN chmod 777 /app
COPY --from=builder /app/main .
COPY internal/services/extract.py internal/services/extract.py
COPY --from=frontend-builder /workspace/app/dist ./public

ENV PORT=7860
ENV GIN_MODE=release

EXPOSE 7860
CMD ["./main"]
