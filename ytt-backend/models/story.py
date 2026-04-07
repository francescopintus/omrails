from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid, enum as pyenum
from database import Base
from models.place import place_story
from models.operator import operator_story

class StoryStatus(str, pyenum.Enum):
    draft="draft"; submitted="submitted"; approved="approved"
    published="published"; rejected="rejected"

class Story(Base):
    __tablename__ = "stories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    excerpt = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    territory_id = Column(UUID(as_uuid=True), ForeignKey("territories.id"), nullable=True)
    tags = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    status = Column(Enum(StoryStatus), default=StoryStatus.draft)
    is_featured = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    author = relationship("User", back_populates="stories")
    territory = relationship("Territory", back_populates="stories")
    places = relationship("Place", secondary=place_story, back_populates="stories")
    operators = relationship("Operator", secondary=operator_story, back_populates="stories")
