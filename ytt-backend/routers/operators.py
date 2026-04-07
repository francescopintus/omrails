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

class OperatorOut(BaseOut):
    id: str; name: str; slug: str; operator_type: Optional[str]
    description: Optional[str]; lat: Optional[float]; lng: Optional[float]
    address: Optional[str]; phone: Optional[str]; email: Optional[str]
    website: Optional[str]; tags: Optional[str]; cover_image_url: Optional[str]; is_published: bool

class InquiryIn(BaseModel):
    message: str; requester_email: Optional[str] = None; source_page: Optional[str] = None

@router.get("/", response_model=List[OperatorOut])
def list_operators(territory_id: Optional[str] = None, operator_type: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Operator).filter(Operator.is_published == True)
    if territory_id: q = q.filter(Operator.territory_id == uuid.UUID(territory_id))
    if operator_type: q = q.filter(Operator.operator_type == operator_type)
    return q.order_by(Operator.name).all()

@router.get("/{slug}", response_model=OperatorOut)
def get_operator(slug: str, db: Session = Depends(get_db)):
    op = db.query(Operator).filter(Operator.slug == slug, Operator.is_published == True).first()
    if not op: raise HTTPException(status_code=404, detail="Operator not found")
    return op

@router.post("/{slug}/inquire")
def send_inquiry(slug: str, data: InquiryIn, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    op = db.query(Operator).filter(Operator.slug == slug, Operator.is_published == True).first()
    if not op: raise HTTPException(status_code=404, detail="Operator not found")
    inquiry = Inquiry(target_operator_id=op.id, message=data.message, source_page=data.source_page,
        requester_id=current_user.id if current_user else None,
        requester_email=data.requester_email if not current_user else None)
    db.add(inquiry); db.commit()
    return {"status": "sent"}
