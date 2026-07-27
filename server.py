#!/usr/bin/env python3
"""Minimal static file server for the portfolio site.

Serves /app/public on :8080 with security headers and a /health endpoint
for container / Kubernetes probes.
"""
import gzip
import hashlib
import json
import mimetypes
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

APP_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = APP_DIR / "public"

CACHE_POLICIES = {
    ".css": "public, max-age=3600",
    ".js": "public, max-age=3600",
    ".svg": "public, max-age=86400",
    ".png": "public, max-age=86400",
    ".ico": "public, max-age=86400",
    ".txt": "public, max-age=86400",
    ".woff2": "public, max-age=31536000, immutable",
}

COMPRESSIBLE_TYPES = {
    "text/html",
    "text/css",
    "text/plain",
    "application/javascript",
    "application/json",
    "image/svg+xml",
}

# Legacy path browsers request regardless of <link rel="icon">.
ALIASES = {"favicon.ico": "favicon.svg"}


class PortfolioHandler(BaseHTTPRequestHandler):
    server_version = "scruzzi-web/2.0"
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        if urlparse(self.path).path == "/health":
            self.respond_json({"status": "ok"})
            return
        self.serve_static()

    def do_HEAD(self):
        self.do_GET()

    @property
    def head_only(self):
        return self.command == "HEAD"

    def serve_static(self):
        request_path = unquote(urlparse(self.path).path).lstrip("/")
        relative_path = request_path or "index.html"
        relative_path = ALIASES.get(relative_path, relative_path)
        static_path = (PUBLIC_DIR / relative_path).resolve()

        if not static_path.is_file() or PUBLIC_DIR not in static_path.parents:
            self.respond_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        content_type = mimetypes.guess_type(static_path.name)[0] or "application/octet-stream"
        cache_control = CACHE_POLICIES.get(static_path.suffix, "no-store")
        body = static_path.read_bytes()
        etag = f'"{hashlib.sha256(body).hexdigest()[:16]}"'

        if etag in self.parse_if_none_match():
            self.send_response(HTTPStatus.NOT_MODIFIED)
            self.send_common_headers()
            self.send_header("Cache-Control", cache_control)
            self.send_header("ETag", etag)
            self.end_headers()
            return

        encoding = None
        if content_type in COMPRESSIBLE_TYPES and "gzip" in self.headers.get("Accept-Encoding", ""):
            body = gzip.compress(body, compresslevel=6)
            encoding = "gzip"

        self.send_response(HTTPStatus.OK)
        self.send_common_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", cache_control)
        self.send_header("ETag", etag)
        if encoding:
            self.send_header("Content-Encoding", encoding)
            self.send_header("Vary", "Accept-Encoding")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if not self.head_only:
            self.wfile.write(body)

    def parse_if_none_match(self):
        raw = self.headers.get("If-None-Match")
        return {tag.strip() for tag in raw.split(",")} if raw else set()

    def respond_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_common_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if not self.head_only:
            self.wfile.write(body)

    def respond_error(self, status, message):
        self.respond_json({"error": message}, status)

    def send_common_headers(self):
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        # Browsers only honor this over HTTPS, so it's a no-op on plain HTTP — safe to always send.
        self.send_header("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "base-uri 'self'; "
            "frame-ancestors 'self';"
        )

    def log_message(self, format, *args):
        # args are printf-style from the base class, not an f-string-friendly value.
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args))  # noqa: UP031


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), PortfolioHandler)
    print(f"portfolio server listening on :{port}")
    server.serve_forever()
