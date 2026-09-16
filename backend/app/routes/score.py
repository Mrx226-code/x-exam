from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal
from app.models.models import User, Examen, Question, Reponse
from app.services.score_service import get_score
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/scores",
    tags=["Scores"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# SCORE D'UN ÉLÈVE
# =========================================================

@router.get("/examen/{examen_id}")
def consulter_score(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resultat = get_score(
        db,
        examen_id,
        current_user.id
    )

    if resultat is None:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable."
        )

    return resultat


# =========================================================
# HISTORIQUE DE L'ÉLÈVE
# =========================================================

@router.get("/historique")
def consulter_historique(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Récupérer les examens auxquels l'élève a répondu
    examens = (
        db.query(Examen)
        .join(
            Question,
            Question.examen_id == Examen.id
        )
        .join(
            Reponse,
            Reponse.question_id == Question.id
        )
        .filter(
            Reponse.eleve_id == current_user.id
        )
        .distinct()
        .all()
    )

    historique = []

    for examen in examens:
        score = get_score(
            db,
            examen.id,
            current_user.id
        )

        historique.append({
            "examen_id": examen.id,
            "titre": examen.titre,
            "score": score["score"],
            "pourcentage": score["pourcentage"]
        })

    return historique