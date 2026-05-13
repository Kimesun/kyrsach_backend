from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/entries", tags=["entries"])

@router.get("/", response_model=List[schemas.EntryOut])
def get_my_entries(
    journal_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Entry).filter(models.Entry.owner_id == current_user.id)
    
    if journal_id:
        query = query.filter(models.Entry.journal_id == journal_id)
    
    if tag_id:
        query = query.filter(models.Entry.tags.any(models.Tag.id == tag_id))
    
    if search:
        query = query.filter(
            (models.Entry.title.ilike(f"%{search}%")) |
            (models.Entry.content.ilike(f"%{search}%"))
        )
    
    if start_date:
        query = query.filter(models.Entry.published_date >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(models.Entry.published_date <= datetime.fromisoformat(end_date))
    
    return query.order_by(models.Entry.published_date.desc()).all()

@router.post("/", response_model=schemas.EntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    entry: schemas.EntryCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db_entry = models.Entry(
            title=entry.title,
            content=entry.content,
            is_public=entry.is_public,
            published_date=entry.published_date or datetime.utcnow(),
            journal_id=entry.journal_id,
            owner_id=current_user.id
        )
        db.add(db_entry)
        db.flush()
        
        for tag_name in entry.tag_names:
            tag = db.query(models.Tag).filter(
                models.Tag.name == tag_name,
                models.Tag.owner_id == current_user.id
            ).first()
            if not tag:
                tag = models.Tag(name=tag_name, owner_id=current_user.id)
                db.add(tag)
                db.flush()
            db_entry.tags.append(tag)
        
        db.commit()
        db.refresh(db_entry)
        return db_entry
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/public", response_model=List[schemas.EntryOut])
def get_public_entries(db: Session = Depends(get_db)):
    return db.query(models.Entry).filter(models.Entry.is_public == True).order_by(models.Entry.published_date.desc()).all()

@router.get("/{entry_id}", response_model=schemas.EntryOut)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if entry.owner_id != current_user.id and not entry.is_public:
        raise HTTPException(status_code=403, detail="Access denied")
    return entry

@router.put("/{entry_id}", response_model=schemas.EntryOut)
def update_entry(
    entry_id: int,
    entry_update: schemas.EntryCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.owner_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    entry.title = entry_update.title
    entry.content = entry_update.content
    entry.is_public = entry_update.is_public
    entry.journal_id = entry_update.journal_id
    if entry_update.published_date:
        entry.published_date = entry_update.published_date
    
    entry.tags.clear()
    for tag_name in entry_update.tag_names:
        tag = db.query(models.Tag).filter(
            models.Tag.name == tag_name,
            models.Tag.owner_id == current_user.id
        ).first()
        if not tag:
            tag = models.Tag(name=tag_name, owner_id=current_user.id)
            db.add(tag)
            db.flush()
        entry.tags.append(tag)
    
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.owner_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}