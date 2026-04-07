from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

class Territory(Base):
    __tablename__ = "territories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    lat_center = Column(Float, nullable=True)
    lng_center = Column(Float, nullable=True)
    zoom_level = Column(Integer, default=10)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("territories.id"), nullable=True)
    level = Column(Integer, default=1)
    tags = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    parent = relationship("Territory", remote_side="Territory.id", back_populates="children")
    children = relationship("Territory", back_populates="parent")
    places = relationship("Place", back_populates="territory")
    operators = relationship("Operator", back_populates="territory")
    stories = relationship("Story", back_populates="territory")
    events = relationship("Event", back_populates="territory")
