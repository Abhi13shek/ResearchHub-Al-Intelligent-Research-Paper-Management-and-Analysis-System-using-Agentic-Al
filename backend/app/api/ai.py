from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

from ..security import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

if GROQ_API_KEY:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
    except:
        groq_client = None
else:
    groq_client = None

class ChatRequest(BaseModel):
    context: str = ""
    question: str

@router.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    current_user = Depends(get_current_user)
):
    """Chat with Groq AI"""
    
    if not groq_client:
        return {"answer": "AI service not configured. Add GROQ_API_KEY to .env"}
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful research assistant. Provide clear, detailed answers about research papers."
                },
                {
                    "role": "user",
                    "content": f"Context: {request.context}\n\nQuestion: {request.question}"
                }
            ],
            model="llama-3.3-70b-versatile",  # WORKING MODEL
            temperature=0.7,
            max_tokens=1024
        )
        
        answer = chat_completion.choices[0].message.content
        return {"answer": answer}
    
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}

@router.post("/summarize/{paper_id}")
async def summarize_paper(
    paper_id: str,
    current_user = Depends(get_current_user)
):
    """Summarize a paper"""
    
    if not groq_client:
        return {"paper_id": paper_id, "summary": "AI not configured"}
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": f"Provide a concise summary of research paper ID: {paper_id} in 3-5 bullet points."
            }],
            model="llama3-8b-8192",
            temperature=0.5,
            max_tokens=512
        )
        
        summary = chat_completion.choices[0].message.content
        return {"paper_id": paper_id, "summary": summary}
    
    except Exception as e:
        return {"paper_id": paper_id, "summary": f"Error: {str(e)}"}

@router.post("/literature-review")
async def generate_review(
    request: dict,
    current_user = Depends(get_current_user)
):
    """Generate literature review"""
    
    if not groq_client:
        return {"literature_review": "AI not configured"}
    
    paper_ids = request.get("paper_ids", [])
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": f"Generate a comprehensive literature review for {len(paper_ids)} research papers. Include: 1) Overview, 2) Key findings, 3) Research gaps, 4) Conclusions."
            }],
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            max_tokens=2048
        )
        
        review = chat_completion.choices[0].message.content
        return {"literature_review": review}
    
    except Exception as e:
        return {"literature_review": f"Error: {str(e)}"}

@router.post("/insights")
async def extract_insights(
    request: dict,
    current_user = Depends(get_current_user)
):
    """Extract insights from papers"""
    
    if not groq_client:
        return {"insights": "AI not configured"}
    
    paper_ids = request.get("paper_ids", [])
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": f"Extract key insights, trends, and findings from {len(paper_ids)} research papers. Provide actionable insights."
            }],
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            max_tokens=1024
        )
        
        insights = chat_completion.choices[0].message.content
        return {"insights": insights}
    
    except Exception as e:
        return {"insights": f"Error: {str(e)}"}


