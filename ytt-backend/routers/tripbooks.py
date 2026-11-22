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

class TripBookUpdate(BaseModel):
    title: Optional[str] = None; description: Optional[str] = None
    cover_image_url: Optional[str] = None; visibility: Optional[str] = None
    tags: Optional[str] = None; is_featured: Optional[bool] = None

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

@router.get("/all", response_model=List[TripBookOut])
def list_all_tripbooks(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(TripBook).order_by(TripBook.created_at.desc()).all()

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

@router.put("/{slug}", response_model=TripBookOut)
def update_tripbook(slug: str, data: TripBookUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tb = db.query(TripBook).filter(TripBook.slug == slug).first()
    if not tb: raise HTTPException(status_code=404, detail="Not found")
    updates = data.model_dump(exclude_unset=True)
    if "visibility" in updates:
        new_vis = TripBookVisibility(updates.pop("visibility"))
        if new_vis == TripBookVisibility.public and tb.visibility != TripBookVisibility.public:
            tb.published_at = datetime.utcnow()
        tb.visibility = new_vis
    for k, v in updates.items():
        setattr(tb, k, v)
    db.commit(); db.refresh(tb)
    return tb

@router.delete("/{slug}", status_code=204)
def delete_tripbook(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tb = db.query(TripBook).filter(TripBook.slug == slug).first()
    if not tb: raise HTTPException(status_code=404, detail="Not found")
    db.delete(tb); db.commit()

@router.get("/{slug}/blocks")
def get_blocks(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    tb = db.query(TripBook).filter(TripBook.slug == slug).first()
    if not tb: raise HTTPException(status_code=404, detail="Not found")
    if tb.visibility == TripBookVisibility.private:
        if not current_user or str(current_user.id) != str(tb.owner_id):
            raise HTTPException(status_code=403, detail="Private TripBook")
    result = []
    for b in tb.blocks:
        block = {"id": str(b.id), "block_type": b.block_type, "position": b.position,
                 "content": b.content, "media_url": b.media_url}
        if b.linked_place:
            block["linked_place"] = {"id": str(b.linked_place.id), "name": b.linked_place.name,
                                     "slug": b.linked_place.slug, "place_type": b.linked_place.place_type}
        if b.linked_operator:
            block["linked_operator"] = {"id": str(b.linked_operator.id), "name": b.linked_operator.name,
                                        "slug": b.linked_operator.slug, "operator_type": b.linked_operator.operator_type}
        result.append(block)
    return result

@router.post("/{slug}/blocks", response_model=BlockOut)
def add_block(slug: str, data: BlockIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tb = db.query(TripBook).filter(TripBook.slug == slug, TripBook.owner_id == current_user.id).first()
    if not tb: raise HTTPException(status_code=404, detail="Not found")
    block = TripBookBlock(trip_book_id=tb.id, **data.model_dump(exclude={"linked_place_id","linked_operator_id"}))
    if data.linked_place_id: block.linked_place_id = uuid.UUID(data.linked_place_id)
    if data.linked_operator_id: block.linked_operator_id = uuid.UUID(data.linked_operator_id)
    db.add(block); db.commit(); db.refresh(block)
    return block

@router.delete("/{slug}/blocks/{block_id}", status_code=204)
def delete_block(slug: str, block_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tb = db.query(TripBook).filter(TripBook.slug == slug, TripBook.owner_id == current_user.id).first()
    if not tb: raise HTTPException(status_code=404, detail="Not found")
    block = db.query(TripBookBlock).filter(TripBookBlock.id == uuid.UUID(block_id), TripBookBlock.trip_book_id == tb.id).first()
    if not block: raise HTTPException(status_code=404, detail="Block not found")
    db.delete(block); db.commit()

@router.patch("/{slug}/publish")
def publish_tripbook(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tb = db.query(TripBook).filter(TripBook.slug == slug, TripBook.owner_id == current_user.id).first()
    if not tb: raise HTTPException(status_code=404, detail="Not found")
    tb.visibility = TripBookVisibility.public
    tb.published_at = datetime.utcnow()
    db.commit()
    return {"status": "published"}
