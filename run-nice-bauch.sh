#!/usr/bin/env bash
set -e

echo "Starte nice-bauch Deployment mit Docker Compose..."

# Firewall öffnen, falls ufw aktiv ist
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 8085/tcp || echo "Port 8085 bereits freigegeben"
fi

# Prüfen ob Docker Compose vorhanden und wirklich nutzbar ist
if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1 && docker-compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
else
  echo "Docker Compose nicht gefunden!"
  echo "Falls du Docker Desktop nutzt, aktiviere die WSL-Integration für diese Distribution."
  exit 1
fi

# Deployment mit Docker Compose
echo "Ziehe aktuelles GitHub Container Registry Image..."
$DOCKER_COMPOSE pull

echo "Starte Container..."
$DOCKER_COMPOSE up -d --force-recreate

# Cross-platform check for IP address
if command -v ipconfig >/dev/null 2>&1; then
  IP_ADDR=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
elif command -v hostname >/dev/null 2>&1 && hostname -I >/dev/null 2>&1; then
  IP_ADDR=$(hostname -I | awk '{print $1}')
else
  IP_ADDR="localhost"
fi

echo "Server erreichbar unter: http://${IP_ADDR}:8085"
$DOCKER_COMPOSE ps
