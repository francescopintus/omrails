from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.operator import Operator
from models.interaction import Inquiry
from core.deps import get_current_user, get_current_user_optional
from schemas.base import BaseOut
import uuid, re

router = APIRouter(prefix="/operators", tags=["operators"])

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s]+', '-', text)
    return re.sub(r'[^\w-]', '', text)

class OperatorIn(BaseModel):
    name: str; operator_type: Optional[str] = None; description: Optional[str] = None
    lat: Optional[float] = None; lng: Optional[float] = None
    address: Optional[str] = None; territory_id: Optional[str] = None
    phone: Optional[str] = None; email: Optional[str] = None
    website: Optional[str] = None; tags: Optional[str] = None
    cover_image_url: Optional[str] = None

class OperatorUpdate(BaseModel):
    name: Optional[str] = None; operator_type: Optional[str] = None
    description: Optional[str] = None; lat: Optional[float] = None
    lng: Optional[float] = None; address: Optional[str] = None
    territory_id: Optional[str] = None; phone: Optional[str] = None
    email: Optional[str] = None; website: Optional[str] = None
    tags: Optional[str] = None; cover_image_url: Optional[str] = None
    is_published: Optional[bool] = None

class OperatorOut(BaseOut):
    id: str; name: str; slug: str; operator_type: Optional[str]
    description: Optional[str]; lat: Optional[float]; lng: Optional[float]
    address: Optional[str]; phone: Optional[str]; email: Optional[str]
    website: Optional[str]; tags: Optional[str]; cover_image_url: Optional[str]; is_published: bool

class InquiryIn(BaseModel):
    message: str; requester_email: Optional[str] = None; source_page: Optional[str] = None

@router.get("/", response_model=List[OperatorOut])
def list_operators(territory_id: Optional[str] = None, operator_type: Optional[str] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    q = db.query(Operator)
    if not current_user:
        q = q.filter(Operator.is_published == True)
    if territory_id: q = q.filter(Operator.territory_id == uuid.UUID(territory_id))
    if operator_type: q = q.filter(Operator.operator_type == operator_type)
    return q.order_by(Operator.name).all()

@router.get("/{slug}", response_model=OperatorOut)
def get_operator(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    op = db.query(Operator).filter(Operator.slug == slug).first()
    if not op or (not op.is_published and not current_user):
        raise HTTPException(status_code=404, detail="Operator not found")
    return op

@router.post("/", response_model=OperatorOut)
def create_operator(data: OperatorIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    slug = base = slugify(data.name)
    i = 1
    while db.query(Operator).filter(Operator.slug == slug).first():
        slug = f"{base}-{i}"; i += 1
    op = Operator(**data.model_dump(exclude={"territory_id"}), slug=slug)
    if data.territory_id: op.territory_id = uuid.UUID(data.territory_id)
    db.add(op); db.commit(); db.refresh(op)
    return op

@router.put("/{slug}", response_model=OperatorOut)
def update_operator(slug: str, data: OperatorUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    op = db.query(Operator).filter(Operator.slug == slug).first()
    if not op: raise HTTPException(status_code=404, detail="Not found")
    updates = data.model_dump(exclude_unset=True)
    if "territory_id" in updates:
        tid = updates.pop("territory_id")
        op.territory_id = uuid.UUID(tid) if tid else None
    for k, v in updates.items():
        setattr(op, k, v)
    db.commit(); db.refresh(op)
    return op

@router.delete("/{slug}", status_code=204)
def delete_operator(slug: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    op = db.query(Operator).filter(Operator.slug == slug).first()
    if not op: raise HTTPException(status_code=404, detail="Not found")
    db.delete(op); db.commit()

@router.post("/{slug}/inquire")
def send_inquiry(slug: str, data: InquiryIn, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    op = db.query(Operator).filter(Operator.slug == slug, Operator.is_published == True).first()
    if not op: raise HTTPException(status_code=404, detail="Operator not found")
    inquiry = Inquiry(target_operator_id=op.id, message=data.message, source_page=data.source_page,
        requester_id=current_user.id if current_user else None,
        requester_email=data.requester_email if not current_user else None)
    db.add(inquiry); db.commit()
    return {"status": "sent"}
