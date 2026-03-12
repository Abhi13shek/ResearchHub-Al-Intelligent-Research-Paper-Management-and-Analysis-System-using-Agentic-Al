from groq import Groq
from typing import Optional
from app.core.config import settings

class AIService:
    def __init__(self):
        if hasattr(settings, 'GROQ_API_KEY') and settings.GROQ_API_KEY:
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            self.model = "llama-3.3-70b-versatile"  # Fast, free model
        else:
            self.client = None
            self.model = None

    async def summarize_paper(self, paper_content: str, summary_type: str = "full") -> str:
        """Generate AI summary of a paper"""
        if not self.client:
            return "AI service not configured. Please add GROQ_API_KEY to .env file."
        
        try:
            prompt = f"""Summarize the following research paper with focus on {summary_type}:

{paper_content}

Provide a clear, concise summary."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=1024
            )
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Error: {str(e)}"

    async def compare_papers(self, papers: list) -> str:
        """Compare multiple research papers"""
        if not self.client:
            return "AI service not configured. Please add GROQ_API_KEY to .env file."
        
        try:
            paper_texts = []
            for i, paper in enumerate(papers, 1):
                paper_text = f"""Paper {i}: {paper.title}
Authors: {', '.join(paper.authors) if paper.authors else 'Unknown'}
Abstract: {paper.abstract or 'No abstract available'}"""
                paper_texts.append(paper_text)
            
            prompt = f"""Compare and contrast these research papers:

{chr(10).join(paper_texts)}

Provide:
1. Main research questions
2. Methodologies
3. Key findings
4. Similarities and differences
5. Overall contribution"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2048
            )
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Error: {str(e)}"

    async def generate_literature_review(self, papers: list) -> str:
        """Generate a literature review from papers"""
        if not self.client:
            return "AI service not configured. Please add GROQ_API_KEY to .env file."
        
        try:
            paper_texts = []
            for paper in papers:
                paper_text = f"{paper.title}\n{paper.abstract or ''}"
                paper_texts.append(paper_text)
            
            prompt = f"""Write a comprehensive literature review based on these papers:

{chr(10).join(paper_texts)}

Include:
- Introduction to the research area
- Summary of each paper's contribution
- Common themes and patterns
- Gaps in current research
- Future directions"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=3000
            )
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Error: {str(e)}"

    async def chat_with_context(self, context: str, question: str) -> str:
        """Chat with AI about papers"""
        if not self.client:
            return "AI service not configured. Please add GROQ_API_KEY to .env file."
        
        try:
            prompt = f"""You are a helpful research assistant. Answer questions based on the following research papers:

{context}

Question: {question}

Please provide a detailed, accurate answer based only on the information in the papers above. If the information is not in the papers, say so."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=1500
            )
            return response.choices[0].message.content
        
        except Exception as e:
            return f"Error: {str(e)}"


