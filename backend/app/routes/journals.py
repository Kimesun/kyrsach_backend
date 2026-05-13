from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/journals", tags=["journals"])

@router.get("/", response_model=List[schemas.JournalOut])
def get_my_journals(
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    journals = db.query(models.Journal).filter(models.Journal.owner_id == current_user.id).all()
    return journals

@router.post("/", response_model=schemas.JournalOut, status_code=status.HTTP_201_CREATED)
def create_journal(
    journal: schemas.JournalCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_journal = models.Journal(
        name=journal.name,
        description=journal.description,
        color=journal.color,
        icon=journal.icon,
        owner_id=current_user.id
    )
    db.add(db_journal)
    db.commit()
    db.refresh(db_journal)
    return db_journal

@router.put("/{journal_id}", response_model=schemas.JournalOut)
def update_journal(
    journal_id: int,
    journal_update: schemas.JournalCreate,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    journal = db.query(models.Journal).filter(
        models.Journal.id == journal_id,
        models.Journal.owner_id == current_user.id
    ).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    
    journal.name = journal_update.name
    journal.description = journal_update.description
    journal.color = journal_update.color
    journal.icon = journal_update.icon
    
    db.commit()
    db.refresh(journal)
    return journal

@router.delete("/{journal_id}")
def delete_journal(
    journal_id: int,
    current_user=Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    journal = db.query(models.Journal).filter(
        models.Journal.id == journal_id,
        models.Journal.owner_id == current_user.id
    ).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    db.delete(journal)
    db.commit()
    return {"message": "Journal deleted"}