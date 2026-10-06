# ==========================================
# Multi-Stage Dockerfile for Render Deployment
# Stage 1: Build React static assets with Vite
# Stage 2: Production FastAPI backend server
# ==========================================

# Stage 1: Node.js Frontend Builder
FROM node:20-slim AS frontend-builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy frontend source files
COPY index.html vite.config.ts tsconfig.json ./
COPY src/ ./src/

# Build production static bundle
RUN npm run build

# ==========================================
# Stage 2: Python FastAPI Runtime
# ==========================================
FROM python:3.10-slim AS runtime
WORKDIR /app

# Install system dependencies for PostgreSQL client
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy compiled React frontend into backend static directory
COPY --from=frontend-builder /app/dist ./backend/app/static

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=10000
ENV ENVIRONMENT=production
ENV STATIC_DIR=/app/backend/app/static

EXPOSE 10000

# Production startup command
CMD ["sh", "-c", "alembic -c backend/migrations/alembic.ini upgrade head || true; uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
