from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    avatar_color: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    avatar_color: Optional[str] = None

# Tag Schemas
class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#667eea"

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: int

    class Config:
        from_attributes = True

# Journal Schemas
class JournalBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#667eea"
    icon: Optional[str] = "📁"

class JournalCreate(JournalBase):
    pass

class JournalOut(JournalBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

# Entry Schemas
class EntryBase(BaseModel):
    title: str
    content: str
    is_public: bool = False
    published_date: Optional[datetime] = None
    journal_id: Optional[int] = None

class EntryCreate(EntryBase):
    tag_names: Optional[List[str]] = []

class EntryOut(EntryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    owner_id: int
    tags: List[TagOut] = []
    journal: Optional[JournalOut] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None