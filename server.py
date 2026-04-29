#!/usr/bin/env python3
import json
import mimetypes
import os
import re
import sqlite3
from http import HTTPStatus
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlparse


APP_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = APP_DIR / "public"
DB_PATH = Path(os.environ.get("NICE_BAUCH_DB", "/data/nice-bauch.sqlite"))
DEVICE_ID_RE = re.compile(r"^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$", re.IGNORECASE)


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS device_counts (
                device_id TEXT PRIMARY KEY,
                count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


def get_count(device_id):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT OR IGNORE INTO device_counts (device_id)
            VALUES (?)
        """, (device_id,))
        row = conn.execute("""
            SELECT count, updated_at
            FROM device_counts
            WHERE device_id = ?
        """, (device_id,)).fetchone()
        return {"deviceId": device_id, "count": row[0], "updatedAt": row[1]}


def increment_count(device_id):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO device_counts (device_id, count, updated_at)
            VALUES (?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(device_id) DO UPDATE SET
                count = count + 1,
                updated_at = CURRENT_TIMESTAMP
        """, (device_id,))
        row = conn.execute("""
            SELECT count, updated_at
            FROM device_counts
            WHERE device_id = ?
        """, (device_id,)).fetchone()
        return {"deviceId": device_id, "count": row[0], "updatedAt": row[1]}


def reset_count(device_id):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO device_counts (device_id, count, updated_at)
            VALUES (?, 0, CURRENT_TIMESTAMP)
            ON CONFLICT(device_id) DO UPDATE SET
                count = 0,
                updated_at = CURRENT_TIMESTAMP
        """, (device_id,))
        row = conn.execute("""
            SELECT count, updated_at
            FROM device_counts
            WHERE device_id = ?
        """, (device_id,)).fetchone()
        return {"deviceId": device_id, "count": row[0], "updatedAt": row[1]}


class NiceBauchHandler(BaseHTTPRequestHandler):
    server_version = "NiceBauch/1.0"

    def do_GET(self):
        if self.path == "/health":
            self.respond_json({"status": "ok"})
            return

        api_match = self.match_api_path()
        if api_match is None and urlparse(self.path).path.startswith("/api/"):
            self.respond_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        if api_match and not self.validate_device_id(api_match["device_id"]):
            return

        if api_match and api_match["action"] is None:
            self.handle_api_get(api_match["device_id"])
            return

        self.serve_static()

    def do_POST(self):
        api_match = self.match_api_path()
        if not api_match:
            self.respond_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        if not self.validate_device_id(api_match["device_id"]):
            return

        action = api_match["action"]
        if action == "increment":
            self.handle_api_result(increment_count(api_match["device_id"]))
        elif action == "reset":
            self.handle_api_result(reset_count(api_match["device_id"]))
        else:
            self.respond_error(HTTPStatus.NOT_FOUND, "Not found")

    def match_api_path(self):
        parts = [part for part in urlparse(self.path).path.split("/") if part]
        if len(parts) not in (3, 4) or parts[:2] != ["api", "devices"]:
            return None

        device_id = unquote(parts[2])
        return {
            "device_id": device_id,
            "action": parts[3] if len(parts) == 4 else None
        }

    def validate_device_id(self, device_id):
        if DEVICE_ID_RE.match(device_id):
            return True

        self.respond_error(HTTPStatus.BAD_REQUEST, "Invalid device id")
        return False

    def handle_api_get(self, device_id):
        self.handle_api_result(get_count(device_id))

    def handle_api_result(self, payload):
        self.respond_json(payload)

    def serve_static(self):
        request_path = unquote(urlparse(self.path).path).lstrip("/")
        relative_path = request_path or "index.html"
        static_path = (PUBLIC_DIR / relative_path).resolve()

        if not static_path.is_file() or PUBLIC_DIR not in static_path.parents:
            self.respond_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        content_type = mimetypes.guess_type(static_path.name)[0] or "application/octet-stream"
        cache_control = "no-store" if static_path.name == "index.html" else "public, max-age=15552000"

        self.send_response(HTTPStatus.OK)
        self.send_common_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", cache_control)
        self.end_headers()
        self.wfile.write(static_path.read_bytes())

    def respond_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_common_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def respond_error(self, status, message):
        self.respond_json({"error": message}, status)

    def send_common_headers(self):
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data:; "
            "connect-src 'self';"
        )

    def log_message(self, format, *args):
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args))


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), NiceBauchHandler)
    print(f"nice-bauch server listening on :{port}")
    server.serve_forever()
