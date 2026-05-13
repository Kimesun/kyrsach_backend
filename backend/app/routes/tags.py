from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/tags", tags=["tags"])

@router.get("/", response_model=List[schemas.TagOut])
def get_my_tags(
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    tags = db.query(models.Tag).filter(models.Tag.owner_id == current_user.id).all()
    return tags

@router.post("/", response_model=schemas.TagOut, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag: schemas.TagCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Tag).filter(
        models.Tag.name == tag.name,
        models.Tag.owner_id == current_user.id
    ).first()
    if existing:
        return existing
    
    db_tag = models.Tag(name=tag.name, color=tag.color, owner_id=current_user.id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    tag = db.query(models.Tag).filter(
        models.Tag.id == tag_id,
        models.Tag.owner_id == current_user.id
    ).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"message": "Tag deleted"}