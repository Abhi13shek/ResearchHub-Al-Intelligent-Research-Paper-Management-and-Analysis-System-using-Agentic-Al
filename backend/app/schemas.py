from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    institution: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    institution: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Workspace schemas
class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Paper schemas
class PaperResponse(BaseModel):
    id: str
    title: str
    authors: str
    abstract: Optional[str] = ""
    url: Optional[str] = ""
    doi: Optional[str] = ""
    publication_date: Optional[str] = ""
    venue: Optional[str] = ""
    citation_count: int = 0

    class Config:
        from_attributes = True

