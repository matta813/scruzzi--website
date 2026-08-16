import base64
import hashlib
import inspect
import json
import re
import struct
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree

import server

ROOT = Path(__file__).resolve().parent.parent


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.fragment_links = []
        self.local_assets = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if element_id := attributes.get("id"):
            self.ids.append(element_id)
        if (href := attributes.get("href", "")).startswith("#"):
            self.fragment_links.append(href[1:])
        for attribute in ("href", "src", "content"):
            value = attributes.get(attribute, "")
            if value != "/" and value.startswith("/") and not value.startswith("//"):
                self.local_assets.append(urlsplit(value).path.removeprefix("/"))


def parse_site(filename="index.html"):
    parser = SiteParser()
    parser.feed((ROOT / filename).read_text(encoding="utf-8"))
    return parser


def test_document_ids_are_unique_and_fragment_links_resolve():
    parser = parse_site()
    assert len(parser.ids) == len(set(parser.ids))
    assert set(parser.fragment_links) <= set(parser.ids)


def test_all_local_assets_are_packaged():
    assets = set(parse_site().local_assets) | set(parse_site("404.html").local_assets)
    assert assets
    assert not {asset for asset in assets if not (ROOT / asset).is_file()}


def test_structured_data_is_valid_json_and_allowed_by_csp():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    match = re.search(r'<script type="application/ld\+json">\n(.*?)</script>', html, re.DOTALL)
    assert match
    payload = match.group(1)
    assert json.loads(payload)["@type"] == "Person"

    digest = base64.b64encode(hashlib.sha256(payload.encode()).digest()).decode()
    assert f"'sha256-{digest}'" in inspect.getsource(server.PortfolioHandler.send_common_headers)


def test_social_metadata_and_crawler_files_are_present():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert 'property="og:image"' in html
    assert 'rel="canonical" href="https://scruzzi.com/"' in html
    assert 'name="twitter:card" content="summary_large_image"' in html
    assert (ROOT / "social-preview.png").is_file()
    assert "Sitemap: https://scruzzi.com/sitemap.xml" in (ROOT / "robots.txt").read_text()
    root = ElementTree.parse(ROOT / "sitemap.xml").getroot()
    assert root.tag.endswith("urlset")
    assert root.find("{http://www.sitemaps.org/schemas/sitemap/0.9}url/{http://www.sitemaps.org/schemas/sitemap/0.9}loc").text == "https://scruzzi.com/"


def test_document_has_language_viewport_and_single_main_heading():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert '<html lang="de"' in html
    assert 'name="viewport"' in html
    assert len(re.findall(r"<h1(?:\s|>)", html)) == 1
    assert "<main" in html


def test_project_cards_include_concrete_results():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert html.count('class="project-result"') == 5


def test_portfolio_includes_architecture_and_source_evidence():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert 'class="architecture-flow reveal"' in html
    assert 'href="https://github.com/matta813/scruzzi--website"' in html


def test_social_preview_is_optimized_for_link_previews():
    preview = ROOT / "social-preview.png"
    assert preview.stat().st_size < 250_000
    with preview.open("rb") as image:
        assert image.read(8) == b"\x89PNG\r\n\x1a\n"
        image.read(8)
        width, height = struct.unpack(">II", image.read(8))
    assert (width, height) == (1200, 630)


def test_reveal_animation_is_progressive_enhancement():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "style.css").read_text(encoding="utf-8")
    assert 'class="no-js"' in html
    assert ".js .reveal" in css
    assert "\n.reveal {" not in css


def test_card_grids_fit_narrow_viewports():
    css = (ROOT / "style.css").read_text(encoding="utf-8")
    assert "minmax(min(100%, 285px), 1fr)" in css
    assert "minmax(min(100%, 300px), 1fr)" in css


def test_mobile_navigation_supports_complete_dismissal():
    javascript = (ROOT / "main.js").read_text(encoding="utf-8")
    assert 'event.target.closest(".nav")' in javascript
    assert 'matchMedia("(max-width: 560px)").addEventListener("change"' in javascript
    assert "closeMenu({ restoreFocus: true })" in javascript
