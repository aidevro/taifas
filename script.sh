#!/bin/bash

set -e

echo "🚀 Generating docker-compose.yml and traefik config..."

# Step 1: Create docker-compose.yml
cat <<'EOF' > docker-compose.yml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    command:
      - "--entrypoints.web.address=:80"
      - "--providers.docker=true"
      - "--providers.docker.network=taifas-net"
      - "--api.dashboard=true"
      - "--api.insecure=true"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=PathPrefix(`/`)"
      - "traefik.http.routers.web.entrypoints=web"
      - "traefik.http.services.web.loadbalancer.server.port=80"
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: api
    environment:
      - MONGO_URI=mongodb://mongodb:27017/taifas
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - AUTH_SERVICE_URL=http://auth:3001
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=PathPrefix(`/api`)"
      - "traefik.http.routers.api.entrypoints=web"
      - "traefik.http.services.api.loadbalancer.server.port=3000"
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  auth:
    build:
      context: ./auth
      dockerfile: Dockerfile
    container_name: auth
    environment:
      - MONGO_URI=mongodb://mongodb:27017/taifas
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.auth.rule=PathPrefix(`/auth`)"
      - "traefik.http.routers.auth.entrypoints=web"
      - "traefik.http.services.auth.loadbalancer.server.port=3001"
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  streaming:
    build:
      context: ./streaming
      dockerfile: Dockerfile
    container_name: streaming
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.streaming.rule=PathPrefix(`/socket.io`)"
      - "traefik.http.routers.streaming.entrypoints=web"
      - "traefik.http.services.streaming.loadbalancer.server.port=3002"
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:5.0
    container_name: mongodb
    volumes:
      - mongodb-data:/data/db
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:6.2
    container_name: redis
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: minio
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    ports:
      - "9001:9001"
    networks:
      - taifas-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongodb-data:
  minio-data:

networks:
  taifas-net:
    driver: bridge
EOF

echo "✅ docker-compose.yml regenerated."

# Optional: remove nginx.conf if not needed anymore
rm -f nginx.conf

echo "🔁 Restarting environment..."
docker-compose down
docker-compose up -d --build

echo "✅ Environment rebuilt. Check containers and Traefik dashboard at http://localhost:8080/dashboard"
