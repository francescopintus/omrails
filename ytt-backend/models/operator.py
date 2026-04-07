from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Text, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

operator_story = Table("operator_story", Base.metadata,
    Column("operator_id", UUID(as_uuid=True), ForeignKey("operators.id"), primary_key=True),
    Column("story_id", UUID(as_uuid=True), ForeignKey("stories.id"), primary_key=True),
)
operator_tripbook = Table("operator_tripbook", Base.metadata,
    Column("operator_id", UUID(as_uuid=True), ForeignKey("operators.id"), primary_key=True),
    Column("trip_book_id", UUID(as_uuid=True), ForeignKey("trip_books.id"), primary_key=True),
)

class Operator(Base):
    __tablename__ = "operators"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    operator_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    territory_id = Column(UUID(as_uuid=True), ForeignKey("territories.id"), nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    territory = relationship("Territory", back_populates="operators")
    experiences = relationship("Experience", back_populates="operator")
    stories = relationship("Story", secondary=operator_story, back_populates="operators")
    trip_books = relationship("TripBook", secondary=operator_tripbook, back_populates="trip_books")
    inquiries = relationship("Inquiry", back_populates="target_operator")

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operator_id = Column(UUID(as_uuid=True), ForeignKey("operators.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    duration_hours = Column(Float, nullable=True)
    price = Column(Float, nullable=True)
    price_notes = Column(String, nullable=True)
    contact_mode = Column(String, default="inquiry")
    territory_id = Column(UUID(as_uuid=True), ForeignKey("territories.id"), nullable=True)
    tags = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    operator = relationship("Operator", back_populates="experiences")
    territory = relationship("Territory")
