#!/usr/bin/env bash
set -e

PORT=8085
IMAGE="192.168.1.41:3000/mattia/nice-bauch:latest"
CONTAINER_NAME="nice-bauch"

echo "Setze nice-bauch Docker-Container auf Port $PORT auf..."

# Firewall öffnen, falls ufw aktiv ist
if command -v ufw >/dev/null 2>&1; then
  echo "Öffne Port $PORT in ufw (sudo erforderlich)"
  sudo ufw allow $PORT/tcp || echo "Port $PORT bereits freigegeben"
fi

# Prüfen ob docker vorhanden ist
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker nicht gefunden! Installiere mit:"
  echo "sudo apt update && sudo apt install -y docker.io"
  exit 1
fi

# Alten Container stoppen und entfernen
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Stoppe und entferne alten Container..."
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
fi

# Neuen Container starten
echo "Starte neuen Container auf Port $PORT..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "$PORT:80" \
  "$IMAGE"

echo "Server erreichbar unter: http://$(hostname -I | awk '{print $1}'):$PORT"
docker ps -f name=$CONTAINER_NAME
