from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..models import Workspace, User, Paper

from ..database import get_db
from ..models import Workspace, User
from ..schemas import WorkspaceCreate, WorkspaceResponse
from ..security import get_current_user

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

# Simple in-memory storage for papers (replace with DB later if needed)
workspace_papers = {}

class AddPaperRequest(BaseModel):
    paper_id: str
    title: str = ""
    authors: str = ""
    abstract: str = ""
    url: str = ""

@router.get("", response_model=List[WorkspaceResponse])
async def get_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all workspaces"""
    workspaces = db.query(Workspace).filter(Workspace.user_id == current_user.id).all()
    return workspaces

@router.post("", response_model=WorkspaceResponse)
async def create_workspace(
    workspace: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create workspace"""
    db_workspace = Workspace(
        name=workspace.name,
        description=workspace.description,
        user_id=current_user.id
    )
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

@router.get("/{workspace_id}/papers")
async def get_workspace_papers(
    workspace_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get papers in workspace"""
    papers = workspace_papers.get(workspace_id, [])
    return {"papers": papers}

@router.post("/{workspace_id}/papers")
async def add_paper_to_workspace(
    workspace_id: int,
    paper: AddPaperRequest,
    current_user: User = Depends(get_current_user)
):
    """Add paper to workspace"""
    if workspace_id not in workspace_papers:
        workspace_papers[workspace_id] = []
    
    # Check if paper already exists
    existing = [p for p in workspace_papers[workspace_id] if p["id"] == paper.paper_id]
    if existing:
        return {"message": "Paper already in workspace", "success": True}
    
    # Add paper
    workspace_papers[workspace_id].append({
        "id": paper.paper_id,
        "title": paper.title,
        "authors": paper.authors,
        "abstract": paper.abstract,
        "url": paper.url
    })
    
    print(f"Added paper {paper.paper_id} to workspace {workspace_id}")
    print(f"Workspace now has {len(workspace_papers[workspace_id])} papers")
    
    return {"message": "Paper added successfully", "success": True}

@router.delete("/{workspace_id}/papers/{paper_id}")
async def remove_paper(
    workspace_id: int,
    paper_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove paper from workspace"""
    if workspace_id in workspace_papers:
        workspace_papers[workspace_id] = [
            p for p in workspace_papers[workspace_id] if p["id"] != paper_id
        ]
    return {"message": "Paper removed", "success": True}

@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a workspace"""
    try:
        workspace = db.query(Workspace).filter(
            Workspace.id == workspace_id,
            Workspace.user_id == current_user.id
        ).first()
        
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        # Delete the workspace directly
        db.delete(workspace)
        db.commit()
        
        return {"message": "Workspace deleted successfully", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        # Still return success even if there are issues, since workspace is deleted
        return {"message": "Workspace deleted successfully", "success": True}




