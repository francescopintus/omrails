from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.tripbook import TripBook, TripBookBlock, TripBookVisibility
from core.deps import get_current_user, get_current_user_optional
from schemas.base import BaseOut
import uuid, re
from datetime import datetime

router = APIRouter(prefix="/tripbooks", tags=["tripbooks"])

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s]+', '-', text)
    return re.sub(r'[^\w-]', '', text)

class TripBookIn(BaseModel):
    title: str; description: Optional[str] = None; cover_image_url: Optional[str] = None
    visibility: TripBookVisibility = TripBookVisibility.private; tags: Optional[str] = None

class BlockIn(BaseModel):
    block_type: str; position: str = "0"; content: Optional[str] = None
    linked_place_id: Optional[str] = None; linked_operator_id: Optional[str] = None
    media_url: Optional[str] = None

class BlockOut(BaseOut):
    id: str; block_type: str; position: str; content: Optional[str]; media_url: Optional[str]

class TripBookOut(BaseOut):
    id: str; title: str; slug: str; description: Optional[str]
    cover_image_url: Optional[str]; visibility: str; tags: Optional[str]
    is_featured: bool; published_at: Optional[datetime]; created_at: datetime

@router.get("/", response_model=List[TripBookOut])
def list_tripbooks(db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    return db.query(TripBook).filter(TripBook.visibility == TripBookVisibility.public).order_by(TripBook.created_at.desc()).all()

@router.get("/my", response_model=List[TripBookOut])
def my_tripbooks(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(TripBook).filter(TripBook.owner_id == current_user.id).order_by(TripBook.created_at.desc()).all()

@router.get("/{slug}", response_model=TripBookOut)
def get_tripbook(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    tb = db.query(TripBook).filter(TripBook.slug == slug).first()
    if not tb: raise HTTPException(status_code=404, detail="TripBook not found")
    if tb.visibility == TripBookVisibility.private:
        if not current_user or str(current_user.id) != str(tb.owner_id):
            raise HTTPException(status_code=403, detail="Private TripBook")
    return tb

@router.post("/", response_model=TripBookOut)
def create_tripbook(data: TripBookIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    slug = base = slugify(data.title)
    i = 1
    while db.query(TripBook).filter(TripBook.slug == slug).first():
        slug = f"{base}-{i}"; i += 1
    tb = TripBook(**data.model_dump(), slug=slug, owner_id=current_user.id)
    db.add(tb); db.commit(); db.refresh(tb)
    return tb

@router.patch("/{slug}/publish")
def publish_tripbook(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tb = db.query(TripBook).filter(TripBook.slug == slug, TripBook.owner_id == current_user.id).first()
    if not tb: raise HTTPException(status_code=404, detail="Not found")
    tb.visibility = TripBookVisibility.public
    tb.published_at = datetime.utcnow()
    db.commit()
    return {"status": "published"}
