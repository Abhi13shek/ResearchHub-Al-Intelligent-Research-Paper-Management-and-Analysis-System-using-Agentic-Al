from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.models import User, Paper
from backend.app.security import get_current_user
from app.services.ai_service import AIService
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ChatRequest(BaseModel):
    paper_ids: List[int]
    question: str

@router.post("/chat")
async def chat_with_papers(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Ask questions about selected papers using AI"""
    
    if not request.paper_ids:
        raise HTTPException(status_code=400, detail="No papers selected")
    
    # Get papers content
    papers = []
    for paper_id in request.paper_ids:
        paper = session.get(Paper, paper_id)
        if paper:
            papers.append({
                "title": paper.title,
                "abstract": paper.abstract,
                "full_text": paper.full_text
            })
    
    if not papers:
        raise HTTPException(status_code=404, detail="Papers not found")
    
    # Create context from papers
    context = "\n\n".join([
        f"Paper: {p['title']}\n{p['abstract'] or p['full_text'] or ''}"
        for p in papers
    ])
    
    # Ask AI
    ai_service = AIService()
    response = await ai_service.chat_with_context(context, request.question)
    
    return {"answer": response}
