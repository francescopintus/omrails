from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid, enum as pyenum
from database import Base
from models.place import place_tripbook
from models.operator import operator_tripbook

class TripBookVisibility(str, pyenum.Enum):
    private="private"; unlisted="unlisted"; public="public"

tripbook_experience = Table("tripbook_experience", Base.metadata,
    Column("trip_book_id", UUID(as_uuid=True), ForeignKey("trip_books.id"), primary_key=True),
    Column("experience_id", UUID(as_uuid=True), ForeignKey("experiences.id"), primary_key=True),
)
tripbook_collaborator = Table("tripbook_collaborator", Base.metadata,
    Column("trip_book_id", UUID(as_uuid=True), ForeignKey("trip_books.id"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
)

class TripBook(Base):
    __tablename__ = "trip_books"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    cover_image_url = Column(String, nullable=True)
    visibility = Column(Enum(TripBookVisibility), default=TripBookVisibility.private)
    tags = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner = relationship("User", back_populates="trip_books")
    places = relationship("Place", secondary=place_tripbook, back_populates="trip_books")
    operators = relationship("Operator", secondary=operator_tripbook, back_populates="trip_books")
    experiences = relationship("Experience", secondary=tripbook_experience)
    collaborators = relationship("User", secondary=tripbook_collaborator)
    blocks = relationship("TripBookBlock", back_populates="trip_book", order_by="TripBookBlock.position", cascade="all, delete-orphan")

class TripBookBlock(Base):
    __tablename__ = "trip_book_blocks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_book_id = Column(UUID(as_uuid=True), ForeignKey("trip_books.id"), nullable=False)
    block_type = Column(String, nullable=False)
    position = Column(String, nullable=False, default="0")
    content = Column(Text, nullable=True)
    linked_place_id = Column(UUID(as_uuid=True), ForeignKey("places.id"), nullable=True)
    linked_operator_id = Column(UUID(as_uuid=True), ForeignKey("operators.id"), nullable=True)
    media_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    trip_book = relationship("TripBook", back_populates="blocks")
    linked_place = relationship("Place")
    linked_operator = relationship("Operator")
