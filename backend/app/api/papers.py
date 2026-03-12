from fastapi import APIRouter, Depends, HTTPException, Query,UploadFile, File
from sqlalchemy.orm import Session
from io import BytesIO
import PyPDF2
from typing import List, Optional
import requests
from pydantic import BaseModel
import arxiv
from datetime import datetime

from ..database import get_db
from ..security import get_current_user
from ..models import Paper
router = APIRouter(prefix="/papers", tags=["papers"])

class PaperResponse(BaseModel):
    id: str
    title: str
    authors: str
    abstract: str = ""
    url: str = ""
    publication_date: str = ""
    venue: str = ""
    citation_count: int = 0
    source: str = ""  # arXiv, OpenAlex, or Semantic Scholar

@router.get("/search")
async def search_papers(
    query: str = Query(..., description="Search query"),
    source: str = Query("all", description="Source: arxiv, openalex, semantic_scholar, or all"),
    limit: int = Query(10, ge=1, le=50),
    current_user = Depends(get_current_user)
):
    """Search papers from multiple sources"""
    
    all_papers = []
    
    # 1. Search arXiv
    if source in ["all", "arxiv"]:
        try:
            arxiv_papers = search_arxiv(query, limit)
            all_papers.extend(arxiv_papers)
        except Exception as e:
            print(f"arXiv search failed: {e}")
    
    # 2. Search OpenAlex
    if source in ["all", "openalex"]:
        try:
            openalex_papers = search_openalex(query, limit)
            all_papers.extend(openalex_papers)
        except Exception as e:
            print(f"OpenAlex search failed: {e}")
    
    # 3. Search Semantic Scholar
    if source in ["all", "semantic_scholar"]:
        try:
            semantic_papers = search_semantic_scholar(query, limit)
            all_papers.extend(semantic_papers)
        except Exception as e:
            print(f"Semantic Scholar search failed: {e}")
    
    # Return limited results
    return {"papers": all_papers[:limit]}

def search_arxiv(query: str, limit: int) -> List[dict]:
    """Search arXiv papers"""
    try:
        search = arxiv.Search(
            query=query,
            max_results=limit,
            sort_by=arxiv.SortCriterion.Relevance
        )
        
        papers = []
        for result in search.results():
            papers.append({
                "id": result.entry_id.split('/')[-1],
                "title": result.title,
                "authors": ", ".join([author.name for author in result.authors]),
                "abstract": result.summary,
                "url": result.entry_id,
                "publication_date": result.published.strftime("%Y-%m-%d"),
                "venue": "arXiv",
                "citation_count": 0,
                "source": "arXiv"
            })
        
        return papers
    except Exception as e:
        print(f"arXiv error: {e}")
        return []

def search_openalex(query: str, limit: int) -> List[dict]:
    """Search OpenAlex papers"""
    try:
        url = "https://api.openalex.org/works"
        params = {
            "search": query,
            "per_page": limit,
            "mailto": "your-email@example.com"  # Replace with your email
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        papers = []
        for work in data.get("results", []):
            authors = [authorship.get("author", {}).get("display_name", "") 
                      for authorship in work.get("authorships", [])]
            
            papers.append({
                "id": work.get("id", "").split('/')[-1],
                "title": work.get("title", "Untitled"),
                "authors": ", ".join(authors[:3]) if authors else "Unknown",
                "abstract": work.get("abstract", "") or work.get("abstract_inverted_index", "") or "No abstract available",
                "url": work.get("doi", "") or work.get("id", ""),
                "publication_date": work.get("publication_date", ""),
                "venue": work.get("primary_location", {}).get("source", {}).get("display_name", "Unknown"),
                "citation_count": work.get("cited_by_count", 0),
                "source": "OpenAlex"
            })
        
        return papers
    except Exception as e:
        print(f"OpenAlex error: {e}")
        return []

def search_semantic_scholar(query: str, limit: int) -> List[dict]:
    """Search Semantic Scholar papers"""
    try:
        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": query,
            "limit": limit,
            "fields": "paperId,title,authors,abstract,year,venue,citationCount,url,publicationDate"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        papers = []
        for item in data.get("data", []):
            authors_list = [a.get("name", "") for a in item.get("authors", [])]
            
            papers.append({
                "id": item.get("paperId", ""),
                "title": item.get("title", "Untitled"),
                "authors": ", ".join(authors_list[:3]) if authors_list else "Unknown",
                "abstract": item.get("abstract") or "No abstract available",
                "url": item.get("url", ""),
                "publication_date": item.get("publicationDate", ""),
                "venue": item.get("venue", "Unknown"),
                "citation_count": item.get("citationCount", 0),
                "source": "Semantic Scholar"
            })
        
        return papers
    except Exception as e:
        print(f"Semantic Scholar error: {e}")
        return []

@router.get("/{paper_id}")
async def get_paper(
    paper_id: str,
    current_user = Depends(get_current_user)
):
    """Get specific paper"""
    # Try to fetch from Semantic Scholar
    try:
        url = f"https://api.semanticscholar.org/graph/v1/paper/{paper_id}"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        return {
            "id": data.get("paperId", ""),
            "title": data.get("title", ""),
            "authors": ", ".join([a.get("name", "") for a in data.get("authors", [])]),
            "abstract": data.get("abstract", ""),
            "url": data.get("url", ""),
            "publication_date": data.get("publicationDate", ""),
            "venue": data.get("venue", ""),
            "citation_count": data.get("citationCount", 0)
        }
    except:
        raise HTTPException(status_code=404, detail="Paper not found")
    
@router.post("/extract-pdf")
async def extract_pdf(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Extract text from uploaded PDF file"""
    try:
        if not file.filename or not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read the PDF
        pdf_content = await file.read()
        if not pdf_content:
            raise HTTPException(status_code=400, detail="Empty file")
        
        pdf_file = BytesIO(pdf_content)
        
        try:
            # Extract text using PyPDF2
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num} ---\n{page_text}\n"
                except:
                    pass
            
            if not text.strip():
                text = "No readable text found in PDF. The PDF might be scanned or contain only images."
            
            return {"text": text}
        except Exception as pdf_error:
            print(f"PyPDF2 error: {pdf_error}")
            raise HTTPException(status_code=500, detail=f"PDF parsing error: {str(pdf_error)}")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"PDF extraction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF: {str(e)}")
