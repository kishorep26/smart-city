import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/postgres"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

class IncidentDB(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    lat = Column(Float)
    lon = Column(Float)
    description = Column(String)
    status = Column(String, default="active")
    timestamp = Column(DateTime, default=datetime.now, index=True)

class AgentDB(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    icon = Column(String)
    status = Column(String, default="Available")
    current_incident = Column(String, nullable=True)
    decision = Column(String, nullable=True)
    response_time = Column(Float, default=0.0)
    efficiency = Column(Float, default=90.0)
    total_responses = Column(Integer, default=0)
    successful_responses = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class ResponseMetricDB(Base):
    __tablename__ = "response_metrics"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, index=True)
    incident_id = Column(Integer, index=True)
    response_time = Column(Float)
    was_successful = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.now, index=True)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
