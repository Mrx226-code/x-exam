from pydantic import BaseModel


class ReponseCreate(BaseModel):
    question_id: int
    reponse: str


# =========================================================
# RÉPONSE D'UN ÉLÈVE CONNECTÉ
# =========================================================

class ReponseResponse(BaseModel):
    id: int
    question_id: int
    eleve_id: int
    reponse: str
    est_correcte: bool

    class Config:
        from_attributes = True


# =========================================================
# RÉPONSE D'UN VISITEUR
# =========================================================

class ReponseVisiteurResponse(BaseModel):
    question_id: int
    reponse: str
    est_correcte: bool