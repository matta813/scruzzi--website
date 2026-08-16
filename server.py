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
from functools import lru_cache
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

APP_DIR = Path(__file__).resolve().parent


def resolve_public_dir(app_dir, configured=None):
    """Use an explicit path, the container layout, or the repository root."""
    if configured:
        return Path(configured).expanduser().resolve()
    packaged_dir = app_dir / "public"
    return packaged_dir if packaged_dir.is_dir() else app_dir


PUBLIC_DIR = resolve_public_dir(APP_DIR, os.environ.get("PUBLIC_DIR"))

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

ASSET_VERSION = "2"
VERSIONED_ASSETS = {"style.css", "main.js", "theme.js"}

# Only explicitly packaged public files are served. Keeping routing separate
# from filesystem paths prevents request data from reaching path operations.
PUBLIC_FILES = {
    "": "index.html",
    "index.html": "index.html",
    "404.html": "404.html",
    "style.css": "style.css",
    "main.js": "main.js",
    "theme.js": "theme.js",
    "favicon.svg": "favicon.svg",
    "favicon.ico": "favicon.svg",
    "robots.txt": "robots.txt",
    "sitemap.xml": "sitemap.xml",
    "social-preview.png": "social-preview.png",
}


def read_public_file(filename):
    """Read an allowlisted asset using constant path components only."""
    match filename:
        case "index.html":
            path = PUBLIC_DIR / "index.html"
        case "404.html":
            path = PUBLIC_DIR / "404.html"
        case "style.css":
            path = PUBLIC_DIR / "style.css"
        case "main.js":
            path = PUBLIC_DIR / "main.js"
        case "theme.js":
            path = PUBLIC_DIR / "theme.js"
        case "favicon.svg":
            path = PUBLIC_DIR / "favicon.svg"
        case "robots.txt":
            path = PUBLIC_DIR / "robots.txt"
        case "sitemap.xml":
            path = PUBLIC_DIR / "sitemap.xml"
        case "social-preview.png":
            path = PUBLIC_DIR / "social-preview.png"
        case _:
            raise ValueError("asset is not allowlisted")
    return path.read_bytes()


@lru_cache(maxsize=32)
def load_representation(filename, encoding):
    """Load and optionally compress an unchanged static asset once."""
    body = read_public_file(filename)
    if encoding == "gzip":
        body = gzip.compress(body, compresslevel=6, mtime=0)
    etag = f'"{hashlib.sha256(body).hexdigest()[:16]}"'
    return body, etag


class PortfolioServer(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 128


class PortfolioHandler(BaseHTTPRequestHandler):
    server_version = "scruzzi-web"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    def setup(self):
        super().setup()
        self.connection.settimeout(15)

    def do_GET(self):
        if urlparse(self.path).path == "/health":
            self.respond_json({"status": "ok"})
            return
        self.serve_static()

    def do_HEAD(self):
        self.do_GET()

    def do_POST(self):
        self.respond_method_not_allowed()

    do_PUT = do_POST
    do_PATCH = do_POST
    do_DELETE = do_POST
    do_OPTIONS = do_POST

    def send_error(self, code, message=None, explain=None):
        """Return consistent JSON errors without the stdlib HTML/version disclosure."""
        status = HTTPStatus(code)
        self.respond_error(status, message or status.phrase)

    @property
    def head_only(self):
        return self.command == "HEAD"

    def serve_static(self):
        request_url = urlparse(self.path)
        request_path = unquote(request_url.path).lstrip("/")
        filename = PUBLIC_FILES.get(request_path)
        if filename is None:
            self.respond_not_found()
            return

        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        cache_control = CACHE_POLICIES.get(Path(filename).suffix, "no-store")
        if filename in VERSIONED_ASSETS and request_url.query == f"v={ASSET_VERSION}":
            cache_control = "public, max-age=31536000, immutable"
        compressible = content_type in COMPRESSIBLE_TYPES
        encoding = "gzip" if compressible and self.accepts_encoding("gzip") else None
        body, etag = load_representation(filename, encoding)
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

    def respond_method_not_allowed(self):
        body = json.dumps({"error": "Method not allowed"}).encode("utf-8")
        self.send_response(HTTPStatus.METHOD_NOT_ALLOWED)
        self.send_common_headers()
        self.send_header("Allow", "GET, HEAD")
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

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
            "script-src 'self' 'sha256-dwqWjq4pVEc/xk4ngiH07JLyMZyCHmwcNqML1GQ26wo='; "
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
    server = PortfolioServer(("0.0.0.0", port), PortfolioHandler)
    print(f"portfolio server listening on :{port}")
    server.serve_forever()
