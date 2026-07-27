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
    server_version = "scruzzi-web"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    def do_GET(self):
        if urlparse(self.path).path == "/health":
            self.respond_json({"status": "ok"})
            return
        self.serve_static()

    def do_HEAD(self):
        self.do_GET()

    def send_error(self, code, message=None, explain=None):
        """Return consistent JSON errors without the stdlib HTML/version disclosure."""
        status = HTTPStatus(code)
        self.respond_error(status, message or status.phrase)

    @property
    def head_only(self):
        return self.command == "HEAD"

    def serve_static(self):
        request_path = unquote(urlparse(self.path).path).lstrip("/")
        relative_path = request_path or "index.html"
        relative_path = ALIASES.get(relative_path, relative_path)
        static_path = (PUBLIC_DIR / relative_path).resolve()

        if not static_path.is_file() or PUBLIC_DIR not in static_path.parents:
            self.respond_not_found()
            return

        content_type = mimetypes.guess_type(static_path.name)[0] or "application/octet-stream"
        cache_control = CACHE_POLICIES.get(static_path.suffix, "no-store")
        body = static_path.read_bytes()
        compressible = content_type in COMPRESSIBLE_TYPES
        encoding = "gzip" if compressible and self.accepts_encoding("gzip") else None
        if encoding:
            body = gzip.compress(body, compresslevel=6, mtime=0)

        etag = f'"{hashlib.sha256(body).hexdigest()[:16]}"'
        validators = self.parse_if_none_match()
        if "*" in validators or etag in validators:
            self.send_response(HTTPStatus.NOT_MODIFIED)
            self.send_common_headers()
            self.send_header("Cache-Control", cache_control)
            self.send_header("ETag", etag)
            if compressible:
                self.send_header("Vary", "Accept-Encoding")
            self.end_headers()
            return

        self.send_response(HTTPStatus.OK)
        self.send_common_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", cache_control)
        self.send_header("ETag", etag)
        if compressible:
            self.send_header("Vary", "Accept-Encoding")
        if encoding:
            self.send_header("Content-Encoding", encoding)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if not self.head_only:
            self.wfile.write(body)

    def parse_if_none_match(self):
        raw = self.headers.get("If-None-Match")
        return {tag.strip() for tag in raw.split(",")} if raw else set()

    def accepts_encoding(self, wanted):
        """Parse Accept-Encoding quality values for one supported encoding."""
        qualities = {}
        for item in self.headers.get("Accept-Encoding", "").split(","):
            parts = [part.strip() for part in item.split(";")]
            encoding = parts[0].lower()
            if not encoding:
                continue
            quality = 1.0
            for parameter in parts[1:]:
                if parameter.lower().startswith("q="):
                    try:
                        quality = float(parameter[2:])
                    except ValueError:
                        quality = 0.0
            qualities[encoding] = max(0.0, min(quality, 1.0))
        return qualities.get(wanted, qualities.get("*", 0.0)) > 0

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

    def respond_not_found(self):
        error_page = PUBLIC_DIR / "404.html"
        if not error_page.is_file():
            self.respond_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        body = error_page.read_bytes()
        self.send_response(HTTPStatus.NOT_FOUND)
        self.send_common_headers()
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if not self.head_only:
            self.wfile.write(body)

    def respond_error(self, status, message):
        self.respond_json({"error": message}, status)

    def send_common_headers(self):
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        # Browsers only honor this over HTTPS, so it's a no-op on plain HTTP — safe to always send.
        self.send_header("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "script-src 'self' 'sha256-zaGNO1Ry0Q7+RgcJom0gzOg8neamY2e1po29WeD2Qng='; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "base-uri 'self'; "
            "frame-ancestors 'none';"
        )

    def log_message(self, format, *args):
        # args are printf-style from the base class, not an f-string-friendly value.
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args))  # noqa: UP031


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), PortfolioHandler)
    print(f"portfolio server listening on :{port}")
    server.serve_forever()
