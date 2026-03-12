#!/usr/bin/env bash
set -e

PORT=8085
WWW_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starte nice-bauch auf Port $PORT im Verzeichnis $WWW_DIR"

# Firewall öffnen, falls ufw aktiv ist
if command -v ufw >/dev/null 2>&1; then
  echo "Öffne Port $PORT in ufw (sudo erforderlich)"
  sudo ufw allow $PORT/tcp || echo "Port $PORT bereits freigegeben"
fi

# Prüfen ob python3 vorhanden ist
if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 nicht gefunden! Installiere mit:"
  echo "sudo apt update && sudo apt install -y python3"
  exit 1
fi

# Server starten
cd "$WWW_DIR"
echo "Server erreichbar unter: http://$(hostname -I | awk '{print $1}'):$PORT"
python3 -m http.server $PORT --bind 0.0.0.0
