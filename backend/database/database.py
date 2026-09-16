import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# ============================================================
# CONFIGURATION DE LA BASE DE DONNÉES
# ============================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./x_exam.db"
)


# ============================================================
# CONNEXION À LA BASE
# ============================================================

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
    if DATABASE_URL.startswith("sqlite")
    else {}
)


# ============================================================
# SESSION
# ============================================================

SessionLocal = sessionmaker(
    autoflush=False,
    bind=engine
)


# ============================================================
# BASE SQLALCHEMY
# ============================================================

Base = declarative_base()