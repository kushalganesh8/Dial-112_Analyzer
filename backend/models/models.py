from sqlalchemy import Column, Integer, String, Text, ARRAY, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)

class CrimeReport(Base):
    __tablename__ = "latest_crime_reports"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True)
    phone_number = Column(String)
    caller_name = Column(String)
    summary = Column(Text)
    primary_location = Column(String)
    specific_landmark = Column(String)
    state_region = Column(String)
    combined_address = Column(String)
    address_variations = Column(ARRAY(String))
    additional_context = Column(Text)
    crime_type = Column(String)
    crime_subtype = Column(String)
    description = Column(Text)
    severity_rank = Column(Integer)
    audio_file = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="pending")
    officer_assigned = Column(String)
