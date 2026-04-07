from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.place import Place
from core.deps import get_current_user, get_current_user_optional
from schemas.base import BaseOut
import uuid, re

router = APIRouter(prefix="/places", tags=["places"])

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s]+', '-', text)
    return re.sub(r'[^\w-]', '', text)

class PlaceIn(BaseModel):
    name: str; place_type: Optional[str] = None; description: Optional[str] = None
    lat: Optional[float] = None; lng: Optional[float] = None
    address: Optional[str] = None; territory_id: Optional[str] = None
    tags: Optional[str] = None; cover_image_url: Optional[str] = None

class PlaceOut(BaseOut):
    id: str; name: str; slug: str; place_type: Optional[str]
    description: Optional[str]; lat: Optional[float]; lng: Optional[float]
    address: Optional[str]; tags: Optional[str]; cover_image_url: Optional[str]; is_published: bool

@router.get("/", response_model=List[PlaceOut])
def list_places(territory_id: Optional[str] = None, place_type: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Place).filter(Place.is_published == True)
    if territory_id: q = q.filter(Place.territory_id == uuid.UUID(territory_id))
    if place_type: q = q.filter(Place.place_type == place_type)
    return q.order_by(Place.name).all()

@router.get("/{slug}", response_model=PlaceOut)
def get_place(slug: str, db: Session = Depends(get_db)):
    p = db.query(Place).filter(Place.slug == slug, Place.is_published == True).first()
    if not p: raise HTTPException(status_code=404, detail="Place not found")
    return p

@router.post("/", response_model=PlaceOut)
def create_place(data: PlaceIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    slug = base = slugify(data.name)
    i = 1
    while db.query(Place).filter(Place.slug == slug).first():
        slug = f"{base}-{i}"; i += 1
    p = Place(**data.model_dump(exclude={"territory_id"}), slug=slug)
    if data.territory_id: p.territory_id = uuid.UUID(data.territory_id)
    db.add(p); db.commit(); db.refresh(p)
    return p
