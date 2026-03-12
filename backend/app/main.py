from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_tables
from .api import auth, papers, workspaces, ai

app = FastAPI(title="ResearchHub AI API", version="1.0.0")

# Fix CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create database tables
create_tables()

# Include ALL routers
app.include_router(auth.router)
app.include_router(papers.router) 
app.include_router(workspaces.router)
app.include_router(ai.router)

@app.get("/")
async def root():
    return {"message": "ResearchHub AI API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

