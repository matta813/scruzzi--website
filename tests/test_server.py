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
    (public_dir / "secret.txt").write_text("top secret", encoding="utf-8")
    monkeypatch.setattr(server, "PUBLIC_DIR", public_dir)

    httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.PortfolioHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield httpd.server_address
    finally:
        httpd.shutdown()
        thread.join()


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


def test_no_compression_without_accept_encoding(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/style.css")
    resp = conn.getresponse()
    body = resp.read()
    assert resp.getheader("Content-Encoding") is None
    assert body == b"body{color:red}" * 200


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


def test_txt_file_served_with_cache_policy(running_server):
    host, port = running_server
    conn = http.client.HTTPConnection(host, port)
    conn.request("GET", "/secret.txt")
    resp = conn.getresponse()
    assert resp.status == 200
    assert resp.getheader("Cache-Control") == "public, max-age=86400"
