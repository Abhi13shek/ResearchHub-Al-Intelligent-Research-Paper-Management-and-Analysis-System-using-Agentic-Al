import os
import uuid
from typing import Dict, Any
import pdfplumber
from PyPDF2 import PdfReader


class PDFService:
    def __init__(self):
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_uploaded_pdf(self, content: bytes, filename: str) -> str:
        """Save uploaded PDF file and return the file path"""
        file_id = str(uuid.uuid4())
        file_path = os.path.join(self.upload_dir, f"{file_id}_{filename}")
        with open(file_path, "wb") as f:
            f.write(content)
        return file_path

    async def extract_text(self, file_path: str) -> Dict[str, Any]:
        """Extract text from PDF file"""
        try:
            # Try pdfplumber first (better for complex layouts)
            with pdfplumber.open(file_path) as pdf:
                text = ""
                page_count = len(pdf.pages)
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                if text.strip():
                    return {
                        "success": True,
                        "text": text.strip(),
                        "page_count": page_count,
                        "method": "pdfplumber"
                    }
            
            # Fallback to PyPDF2
            with open(file_path, "rb") as file:
                reader = PdfReader(file)
                text = ""
                page_count = len(reader.pages)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                
                return {
                    "success": True,
                    "text": text.strip(),
                    "page_count": page_count,
                    "method": "pypdf2"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text": "",
                "page_count": 0
            }

    async def get_pdf_info(self, file_path: str) -> Dict[str, Any]:
        """Get basic information about PDF file"""
        try:
            with pdfplumber.open(file_path) as pdf:
                return {
                    "page_count": len(pdf.pages),
                    "metadata": pdf.metadata or {}
                }
        except Exception as e:
            return {"error": str(e)}

