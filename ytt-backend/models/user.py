from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid, enum as pyenum
from database import Base

class RoleType(str, pyenum.Enum):
    visitor="visitor"; reader="reader"; contributor="contributor"; pro_user="pro_user"
    operator="operator"; event_organizer="event_organizer"; custodian="custodian"
    fixer="fixer"; territory_partner="territory_partner"; advertiser="advertiser"
    editor="editor"; admin="admin"

class ProfileType(str, pyenum.Enum):
    personal="personal"; contributor="contributor"; operator="operator"
    custodian="custodian"; sponsor="sponsor"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    locale = Column(String, default="it")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    roles = relationship("UserRole", foreign_keys="[UserRole.user_id]", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    stories = relationship("Story", back_populates="author")
    trip_books = relationship("TripBook", back_populates="owner")
    inquiries_sent = relationship("Inquiry", foreign_keys="Inquiry.requester_id", back_populates="requester")
    saves = relationship("SavedItem", back_populates="user", cascade="all, delete-orphan")
    follows = relationship("Follow", back_populates="user", cascade="all, delete-orphan")

class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(Enum(RoleType), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    user = relationship("User", foreign_keys="[UserRole.user_id]", back_populates="roles")

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    profile_type = Column(Enum(ProfileType), default=ProfileType.personal)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    social_links = Column(String, nullable=True)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="profile")
