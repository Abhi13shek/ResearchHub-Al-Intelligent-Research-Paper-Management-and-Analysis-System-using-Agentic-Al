import aiohttp
from bs4 import BeautifulSoup
from typing import Optional, Dict, List


class WebScraperService:
    async def scrape_paper_metadata(self, url: str) -> Optional[Dict]:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, "html.parser")
                        metadata = {
                            "title": self._extract_title(soup),
                            "abstract": self._extract_abstract(soup),
                            "authors": self._extract_authors(soup),
                        }
                        return metadata
        except Exception as e:
            print(f"Error scraping {url}: {e}")
        return None

    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        title_selectors = [
            ("meta", {"name": "citation_title"}),
            ("meta", {"property": "og:title"}),
            ("h1", {"class": "title"}),
            ("h1", {}),
        ]
        for tag, attrs in title_selectors:
            element = soup.find(tag, attrs)
            if element:
                return element.get("content") or element.get_text(strip=True)
        return None

    def _extract_abstract(self, soup: BeautifulSoup) -> Optional[str]:
        abstract_selectors = [
            ("meta", {"name": "citation_abstract"}),
            ("div", {"class": "abstract"}),
            ("section", {"id": "abstract"}),
        ]
        for tag, attrs in abstract_selectors:
            element = soup.find(tag, attrs)
            if element:
                return element.get("content") or element.get_text(strip=True)
        return None

    def _extract_authors(self, soup: BeautifulSoup) -> List[str]:
        authors: List[str] = []
        author_metas = soup.find_all("meta", {"name": "citation_author"})
        if author_metas:
            return [meta.get("content") for meta in author_metas if meta.get("content")]
        author_divs = soup.find_all("div", {"class": "author"})
        if author_divs:
            return [div.get_text(strip=True) for div in author_divs]
        return authors