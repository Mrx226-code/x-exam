from pydantic import BaseModel
from typing import Optional


# ============================================================
# ===================== CRÉATION =============================
# ============================================================

class ExerciceCreate(BaseModel):
    classe: str
    serie: Optional[str] = None
    matiere: str
    chapitre: str
    texte: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    bonne_reponse: str


# ============================================================
# ===================== AFFICHAGE ============================
# ============================================================

class ExerciceResponse(BaseModel):
    id: int
    classe: str
    serie: Optional[str] = None
    matiere: str
    chapitre: str
    texte: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    class Config:
        from_attributes = True


# ============================================================
# ==================== RÉPONSE ÉLÈVE =========================
# ============================================================

class ReponseExercice(BaseModel):
    exercice_id: int
    reponse: str


# ============================================================
# ===================== CORRECTION ===========================
# ============================================================

class CorrectionExercice(BaseModel):
    exercice_id: int
    texte: str

    reponse_donnee: Optional[str] = None
    bonne_reponse: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    explication: Optional[str] = None
    correct: bool


# ============================================================
# ======================= RÉSULTAT ===========================
# ============================================================

class ResultatExercices(BaseModel):
    total_questions: int
    questions_repondues: int
    bonnes_reponses: int
    mauvaises_reponses: int
    score: str
    pourcentage: float

    corrections: list[CorrectionExercice]