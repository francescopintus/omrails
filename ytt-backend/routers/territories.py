from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.territory import Territory
from core.deps import get_current_user, get_current_user_optional
from schemas.base import BaseOut
import uuid, re

router = APIRouter(prefix="/territories", tags=["territories"])

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s]+', '-', text)
    return re.sub(r'[^\w-]', '', text)

class TerritoryIn(BaseModel):
    title: str
    description: Optional[str] = None
    lat_center: Optional[float] = None
    lng_center: Optional[float] = None
    zoom_level: int = 10
    parent_id: Optional[str] = None
    level: int = 1
    tags: Optional[str] = None
    cover_image_url: Optional[str] = None

class TerritoryOut(BaseOut):
    id: str; title: str; slug: str; description: Optional[str]
    lat_center: Optional[float]; lng_center: Optional[float]
    zoom_level: int; level: int; tags: Optional[str]
    cover_image_url: Optional[str]; is_published: bool; is_featured: bool

@router.get("/", response_model=List[TerritoryOut])
def list_territories(featured: bool = False, level: Optional[int] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    q = db.query(Territory)
    if not current_user:
        q = q.filter(Territory.is_published == True)
    if featured:
        q = q.filter(Territory.is_featured == True)
    if level:
        q = q.filter(Territory.level == level)
    return q.order_by(Territory.title).all()

@router.get("/{slug}", response_model=TerritoryOut)
def get_territory(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    t = db.query(Territory).filter(Territory.slug == slug).first()
    if not t or (not t.is_published and not current_user):
        raise HTTPException(status_code=404, detail="Territory not found")
    return t

@router.post("/", response_model=TerritoryOut)
def create_territory(data: TerritoryIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    slug = base = slugify(data.title)
    i = 1
    while db.query(Territory).filter(Territory.slug == slug).first():
        slug = f"{base}-{i}"; i += 1
    t = Territory(**data.model_dump(exclude={"parent_id"}), slug=slug)
    if data.parent_id:
        t.parent_id = uuid.UUID(data.parent_id)
    db.add(t); db.commit(); db.refresh(t)
    return t

@router.patch("/{slug}/publish")
def publish_territory(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    t = db.query(Territory).filter(Territory.slug == slug).first()
    if not t: raise HTTPException(status_code=404, detail="Not found")
    t.is_published = True; db.commit()
    return {"status": "published"}
