from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Text, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

place_story = Table("place_story", Base.metadata,
    Column("place_id", UUID(as_uuid=True), ForeignKey("places.id"), primary_key=True),
    Column("story_id", UUID(as_uuid=True), ForeignKey("stories.id"), primary_key=True),
)
place_tripbook = Table("place_tripbook", Base.metadata,
    Column("place_id", UUID(as_uuid=True), ForeignKey("places.id"), primary_key=True),
    Column("trip_book_id", UUID(as_uuid=True), ForeignKey("trip_books.id"), primary_key=True),
)

class Place(Base):
    __tablename__ = "places"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    place_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    territory_id = Column(UUID(as_uuid=True), ForeignKey("territories.id"), nullable=True)
    tags = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    territory = relationship("Territory", back_populates="places")
    stories = relationship("Story", secondary=place_story, back_populates="places")
    trip_books = relationship("TripBook", secondary=place_tripbook, back_populates="places")
