from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.story import Story, StoryStatus
from core.deps import get_current_user, get_current_user_optional
from schemas.base import BaseOut
import uuid, re
from datetime import datetime

router = APIRouter(prefix="/stories", tags=["stories"])

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s]+', '-', text)
    return re.sub(r'[^\w-]', '', text)

class StoryIn(BaseModel):
    title: str; excerpt: Optional[str] = None; body: Optional[str] = None
    territory_id: Optional[str] = None; tags: Optional[str] = None
    cover_image_url: Optional[str] = None

class StoryUpdate(BaseModel):
    title: Optional[str] = None; excerpt: Optional[str] = None
    body: Optional[str] = None; territory_id: Optional[str] = None
    tags: Optional[str] = None; cover_image_url: Optional[str] = None
    is_featured: Optional[bool] = None; status: Optional[str] = None

class StoryOut(BaseOut):
    id: str; title: str; slug: str; excerpt: Optional[str]; body: Optional[str]
    tags: Optional[str]; cover_image_url: Optional[str]; status: str
    is_featured: bool; published_at: Optional[datetime]; created_at: datetime

@router.get("/", response_model=List[StoryOut])
def list_stories(territory_id: Optional[str] = None, featured: bool = False, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    q = db.query(Story)
    if not current_user: q = q.filter(Story.status == StoryStatus.published)
    if territory_id: q = q.filter(Story.territory_id == uuid.UUID(territory_id))
    if featured: q = q.filter(Story.is_featured == True)
    return q.order_by(Story.created_at.desc()).all()

@router.get("/{slug}", response_model=StoryOut)
def get_story(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    s = db.query(Story).filter(Story.slug == slug).first()
    if not s or (s.status != StoryStatus.published and not current_user):
        raise HTTPException(status_code=404, detail="Story not found")
    return s

@router.post("/", response_model=StoryOut)
def create_story(data: StoryIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    slug = base = slugify(data.title)
    i = 1
    while db.query(Story).filter(Story.slug == slug).first():
        slug = f"{base}-{i}"; i += 1
    s = Story(**data.model_dump(exclude={"territory_id"}), slug=slug, author_id=current_user.id)
    if data.territory_id: s.territory_id = uuid.UUID(data.territory_id)
    db.add(s); db.commit(); db.refresh(s)
    return s

@router.put("/{slug}", response_model=StoryOut)
def update_story(slug: str, data: StoryUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(Story).filter(Story.slug == slug).first()
    if not s: raise HTTPException(status_code=404, detail="Not found")
    updates = data.model_dump(exclude_unset=True)
    if "territory_id" in updates:
        tid = updates.pop("territory_id")
        s.territory_id = uuid.UUID(tid) if tid else None
    if "status" in updates:
        new_status = StoryStatus(updates.pop("status"))
        if new_status == StoryStatus.published and s.status != StoryStatus.published:
            s.published_at = datetime.utcnow()
        s.status = new_status
    for k, v in updates.items():
        setattr(s, k, v)
    db.commit(); db.refresh(s)
    return s

@router.delete("/{slug}", status_code=204)
def delete_story(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(Story).filter(Story.slug == slug).first()
    if not s: raise HTTPException(status_code=404, detail="Not found")
    db.delete(s); db.commit()

@router.patch("/{slug}/publish")
def publish_story(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(Story).filter(Story.slug == slug).first()
    if not s: raise HTTPException(status_code=404, detail="Not found")
    s.status = StoryStatus.published
    s.published_at = datetime.utcnow()
    db.commit()
    return {"status": "published"}
