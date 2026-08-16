import gzip
import http.client
import sys
import threading
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import server


@pytest.fixture
def running_server(tmp_path, monkeypatch):
    public_dir = tmp_path / "public"
    public_dir.mkdir()
    (public_dir / "index.html").write_text("<h1>hi</h1>", encoding="utf-8")
    (public_dir / "style.css").write_text("body{color:red}" * 200, encoding="utf-8")
    (public_dir / "favicon.svg").write_text("<svg></svg>", encoding="utf-8")
    (public_dir / "404.html").write_text("<h1>Nicht gefunden</h1>", encoding="utf-8")
    (public_dir / "secret.txt").write_text("top secret", encoding="utf-8")
    monkeypatch.setattr(server, "PUBLIC_DIR", public_dir)
    server.load_representation.cache_clear()

    httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.PortfolioHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield httpd.server_address
    finally:
        httpd.shutdown()
        thread.join()
        server.load_representation.cache_clear()


def test_health_endpoint(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/health")
    resp = conn.getresponse()
    assert resp.status == 200
    assert resp.read() == b'{"status": "ok"}'


def test_index_served_at_root(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/")
    resp = conn.getresponse()
    assert resp.status == 200
    assert resp.read() == b"<h1>hi</h1>"


def test_path_traversal_blocked(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/../server.py")
    resp = conn.getresponse()
    resp.read()
    assert resp.status == 404
    assert resp.getheader("Content-Type") == "text/html; charset=utf-8"


@pytest.mark.parametrize("path", ["/%2e%2e/server.py", "/..%2fserver.py", "/missing"])
def test_encoded_traversal_and_missing_paths_use_custom_404(running_server, path):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", path)
    resp = conn.getresponse()
    assert resp.status == 404
    assert resp.read() == b"<h1>Nicht gefunden</h1>"


def test_head_then_get_on_keepalive_connection(running_server):
    """Regression test: a HEAD request must not blank out a later GET's body
    on the same persistent connection."""
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("HEAD", "/health")
    head_resp = conn.getresponse()
    assert head_resp.read() == b""

    conn.request("GET", "/health")
    get_resp = conn.getresponse()
    assert get_resp.read() == b'{"status": "ok"}'


def test_favicon_ico_aliases_to_svg(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/favicon.ico")
    resp = conn.getresponse()
    assert resp.status == 200
    assert resp.getheader("Content-Type") == "image/svg+xml"
    assert resp.read() == b"<svg></svg>"


def test_gzip_compression_when_accepted(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/style.css", headers={"Accept-Encoding": "gzip"})
    resp = conn.getresponse()
    body = resp.read()
    assert resp.getheader("Content-Encoding") == "gzip"
    assert gzip.decompress(body) == b"body{color:red}" * 200


def test_static_representation_cache_reuses_compressed_body(running_server):
    server.load_representation.cache_clear()
    host, port = running_server
    for _ in range(2):
        conn = http.client.HTTPConnection(host, port)
        conn.request("GET", "/style.css", headers={"Accept-Encoding": "gzip"})
        response = conn.getresponse()
        assert response.status == 200
        response.read()
        conn.close()

    assert server.load_representation.cache_info().hits == 1


def test_no_compression_without_accept_encoding(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/style.css")
    resp = conn.getresponse()
    body = resp.read()
    assert resp.getheader("Content-Encoding") is None
    assert body == b"body{color:red}" * 200


@pytest.mark.parametrize("value", ["gzip;q=0", "br, gzip;q=0.0", "xgzip"])
def test_gzip_not_used_when_not_accepted(running_server, value):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/style.css", headers={"Accept-Encoding": value})
    resp = conn.getresponse()
    assert resp.getheader("Content-Encoding") is None
    assert resp.getheader("Vary") == "Accept-Encoding"
    assert resp.read() == b"body{color:red}" * 200


def test_etag_returns_304_on_match(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/favicon.svg")
    resp = conn.getresponse()
    resp.read()
    etag = resp.getheader("ETag")
    assert etag

    conn.request("GET", "/favicon.svg", headers={"If-None-Match": etag})
    resp2 = conn.getresponse()
    assert resp2.status == 304
    assert resp2.read() == b""


def test_etag_differs_between_encoded_representations(running_server):
    host, port = running_server
    plain = http.client.HTTPConnection(host, port)
    plain.request("GET", "/style.css")
    plain_resp = plain.getresponse()
    plain_resp.read()

    compressed = http.client.HTTPConnection(host, port)
    compressed.request("GET", "/style.css", headers={"Accept-Encoding": "gzip"})
    compressed_resp = compressed.getresponse()
    compressed_resp.read()

    assert plain_resp.getheader("ETag") != compressed_resp.getheader("ETag")
    assert plain_resp.getheader("Vary") == "Accept-Encoding"
    assert compressed_resp.getheader("Vary") == "Accept-Encoding"


def test_if_none_match_wildcard_returns_304(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/", headers={"If-None-Match": "*"})
    resp = conn.getresponse()
    assert resp.status == 304
    assert resp.read() == b""


def test_files_not_in_public_allowlist_are_not_served(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/secret.txt")
    resp = conn.getresponse()
    resp.read()
    assert resp.status == 404


@pytest.mark.parametrize(
    "header,expected_substring",
    [
        ("X-Frame-Options", "DENY"),
        ("X-Content-Type-Options", "nosniff"),
        ("Referrer-Policy", "strict-origin-when-cross-origin"),
        ("Permissions-Policy", "geolocation=()"),
        ("Cross-Origin-Opener-Policy", "same-origin"),
        ("Strict-Transport-Security", "max-age="),
        ("Content-Security-Policy", "default-src 'self'"),
    ],
)
def test_security_headers_present_on_static_response(running_server, header, expected_substring):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/")
    resp = conn.getresponse()
    resp.read()
    assert expected_substring in (resp.getheader(header) or "")


@pytest.mark.parametrize(
    "header,expected_substring",
    [
        ("X-Frame-Options", "DENY"),
        ("Content-Security-Policy", "default-src 'self'"),
    ],
)
def test_security_headers_present_on_json_response(running_server, header, expected_substring):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/health")
    resp = conn.getresponse()
    resp.read()
    assert expected_substring in (resp.getheader(header) or "")


@pytest.mark.parametrize("method", ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
def test_unsupported_method_uses_hardened_json_error(running_server, method):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request(method, "/")
    resp = conn.getresponse()
    body = resp.read()

    assert resp.status == 405
    assert resp.getheader("Allow") == "GET, HEAD"
    assert resp.getheader("Content-Type") == "application/json"
    assert resp.getheader("X-Frame-Options") == "DENY"
    assert "Python" not in (resp.getheader("Server") or "")
    assert b"Method not allowed" in body
