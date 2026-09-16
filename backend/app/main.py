import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import engine, SessionLocal
from app.models import models
from app.models import exercice

from app.routes.auth import router as auth_router
from app.routes.examen import router as examen_router
from app.routes.question import router as question_router
from app.routes.reponse import router as reponse_router
from app.routes.score import router as score_router
from app.routes.tentative import router as tentative_router
from app.routes.exercice import router as exercice_router

from app.services.exercice_service import charger_exercices


# ============================================================
# ===================== CREATION DES TABLES ==================
# ============================================================

models.Base.metadata.create_all(bind=engine)


# ============================================================
# ================= CHARGEMENT DES EXERCICES =================
# ============================================================

def initialiser_exercices():
    db = SessionLocal()

    try:
        resultat = charger_exercices(db)

        print(
            "Chargement des exercices terminé : "
            f"{resultat['exercices_ajoutes']} ajoutés, "
            f"{resultat['exercices_deja_existants']} déjà présents."
        )

    except Exception as e:
        db.rollback()
        print(
            "Erreur lors du chargement des exercices :",
            e
        )

    finally:
        db.close()


initialiser_exercices()


# ============================================================
# ========================== API ==============================
# ============================================================

app = FastAPI(
    title="X_Exam API",
    version="1.0.0",
    description="Backend de la plateforme X_Exam",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1
    }
)


# ============================================================
# =========================== CORS =============================
# ============================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ========================== ROUTES ===========================
# ============================================================

app.include_router(auth_router)
app.include_router(examen_router)
app.include_router(question_router)
app.include_router(reponse_router)
app.include_router(score_router)
app.include_router(tentative_router)
app.include_router(exercice_router)


# ============================================================
# ========================== ACCUEIL ==========================
# ============================================================

def accueil():
    return {
        "message": "Bienvenue sur X_Exam !",
        "status": "API en fonctionnement"
    }