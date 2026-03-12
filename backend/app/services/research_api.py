import arxiv
import aiohttp
from typing import List, Dict, Any
import asyncio


class ResearchAPIService:
    async def search_arxiv(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance,
        )
        results: List[Dict[str, Any]] = []
        for paper in search.results():
            results.append(
                {
                    "title": paper.title,
                    "authors": [author.name for author in paper.authors],
                    "abstract": paper.summary,
                    "arxiv_id": paper.entry_id.split("/")[-1],
                    "publication_date": paper.published.strftime("%Y-%m-%d") if getattr(paper, "published", None) else None,
                    "pdf_url": paper.pdf_url,
                    "source": "arxiv",
                }
            )
        return results

    async def search_semantic_scholar(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": query,
            "limit": max_results,
            "fields": "title,authors,abstract,year,publicationDate,journal,externalIds",
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        results: List[Dict[str, Any]] = []
                        for paper in data.get("data", []):
                            results.append(
                                {
                                    "title": paper.get("title", ""),
                                    "authors": [a.get("name", "") for a in paper.get("authors", [])],
                                    "abstract": paper.get("abstract", ""),
                                    "doi": (paper.get("externalIds") or {}).get("DOI"),
                                    "publication_date": paper.get("publicationDate"),
                                    "journal": (paper.get("journal") or {}).get("name"),
                                    "source": "semantic_scholar",
                                }
                            )
                        return results
        except Exception as e:
            print(f"Error searching Semantic Scholar: {e}")
        return []

    async def search_openalex(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        url = "https://api.openalex.org/works"
        params = {"search": query, "per_page": max_results}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        results: List[Dict[str, Any]] = []
                        for paper in data.get("results", []):
                            results.append(
                                {
                                    "title": paper.get("title", ""),
                                    "authors": [
                                        a.get("author", {}).get("display_name", "")
                                        for a in paper.get("authorships", [])
                                    ],
                                    "abstract": paper.get("abstract"),
                                    "doi": paper.get("doi"),
                                    "publication_date": paper.get("publication_date"),
                                    "journal": (paper.get("primary_location") or {}).get("source", {}).get("display_name"),
                                    "source": "openalex",
                                }
                            )
                        return results
        except Exception as e:
            print(f"Error searching OpenAlex: {e}")
        return []

    async def search_all(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        tasks = [
            self.search_arxiv(query, max_results // 3),
            self.search_semantic_scholar(query, max_results // 3),
            self.search_openalex(query, max_results // 3),
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        combined: List[Dict[str, Any]] = []
        for result in results:
            if isinstance(result, list):
                combined.extend(result)
        return combined[:max_results]