from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import json
from app.database import get_session
from app.models import User, Annotation
from app.schemas import AnnotationCreate, AnnotationResponse
from backend.app.security import get_current_user

router = APIRouter()


@router.post("/", response_model=AnnotationResponse)
async def create_annotation(
    annotation_data: AnnotationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    annotation = Annotation(
        paper_id=annotation_data.paper_id,
        user_id=current_user.id,
        annotation_type=annotation_data.annotation_type,
        content=annotation_data.content,
        position=json.dumps(annotation_data.position) if annotation_data.position else None,
        color=annotation_data.color,
        page_number=annotation_data.page_number,
    )
    session.add(annotation)
    session.commit()
    session.refresh(annotation)
    return annotation


@router.get("/paper/{paper_id}")
async def get_paper_annotations(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    annotations = session.exec(
        select(Annotation).where(Annotation.paper_id == paper_id, Annotation.user_id == current_user.id)
    ).all()
    return annotations


@router.put("/{annotation_id}")
async def update_annotation(
    annotation_id: int,
    content: str = None,
    color: str = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    annotation = session.get(Annotation, annotation_id)
    if not annotation or annotation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Annotation not found")
    if content:
        annotation.content = content
    if color:
        annotation.color = color
    session.add(annotation)
    session.commit()
    return {"message": "Annotation updated successfully"}


@router.delete("/{annotation_id}")
async def delete_annotation(
    annotation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    annotation = session.get(Annotation, annotation_id)
    if not annotation or annotation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Annotation not found")
    session.delete(annotation)
    session.commit()
    return {"message": "Annotation deleted successfully"}