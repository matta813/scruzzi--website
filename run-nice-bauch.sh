#!/usr/bin/env bash
set -e

echo "Starte nice-bauch Deployment mit Docker Compose..."

# Firewall öffnen, falls ufw aktiv ist
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 8085/tcp || echo "Port 8085 bereits freigegeben"
fi

# Prüfen ob docker-compose oder docker compose vorhanden ist
if command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
else
  echo "Docker Compose nicht gefunden!"
  exit 1
fi

# Lokaler Build als Fallback (falls Registry-Login fehlt)
echo "Baue Image lokal (als Fallback)..."
docker build -t ghcr.io/scruzzimattia-blip/scruzzi-website/nice-bauch:latest .

# Deployment mit Docker Compose
echo "Führe $DOCKER_COMPOSE up -d aus..."
$DOCKER_COMPOSE up -d --force-recreate

echo "Server erreichbar unter: http://$(hostname -I | awk '{print $1}'):8085"
$DOCKER_COMPOSE ps
