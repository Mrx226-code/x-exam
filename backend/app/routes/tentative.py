from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session

from database.database import SessionLocal

from app.models.models import User

from app.services.tentative_service import (
    get_tentative,
    demarrer_tentative,
    terminer_tentative
)

from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/tentatives",
    tags=["Tentatives"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# CONSULTER SA TENTATIVE
# =========================================================

@router.get("/examen/{examen_id}")
def consulter_tentative(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tentative = get_tentative(
        db,
        examen_id,
        current_user.id
    )

    if not tentative:
        raise HTTPException(
            status_code=404,
            detail="Aucune tentative trouvée pour cet examen."
        )

    return tentative


# =========================================================
# DÉMARRER UN EXAMEN
# =========================================================

@router.post("/examen/{examen_id}/demarrer")
def commencer_examen(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tentative, statut = demarrer_tentative(
        db,
        examen_id,
        current_user.id
    )

    # -----------------------------------------------------
    # EXAMEN INTROUVABLE
    # -----------------------------------------------------

    if statut == "EXAMEN_INTRouvable":
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable."
        )

    # -----------------------------------------------------
    # TENTATIVE DÉJÀ EXISTANTE
    # -----------------------------------------------------

    if statut == "DEJA_EXISTANTE":

        if tentative.statut == "en_cours":
            raise HTTPException(
                status_code=409,
                detail="Vous avez déjà commencé cet examen."
            )

        if tentative.statut == "terminee":
            raise HTTPException(
                status_code=409,
                detail="Vous avez déjà passé cet examen."
            )

    # -----------------------------------------------------
    # TENTATIVE CRÉÉE
    # -----------------------------------------------------

    return {
        "message": "Examen démarré avec succès.",
        "tentative_id": tentative.id,
        "examen_id": tentative.examen_id,
        "eleve_id": tentative.eleve_id,
        "date_debut": tentative.date_debut,
        "statut": tentative.statut
    }


# =========================================================
# TERMINER UN EXAMEN
# =========================================================

@router.post("/examen/{examen_id}/terminer")
def terminer_examen(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tentative, statut = terminer_tentative(
        db,
        examen_id,
        current_user.id
    )

    # -----------------------------------------------------
    # AUCUNE TENTATIVE
    # -----------------------------------------------------

    if statut == "INEXISTANTE":
        raise HTTPException(
            status_code=404,
            detail="Vous n'avez pas commencé cet examen."
        )

    # -----------------------------------------------------
    # TENTATIVE DÉJÀ TERMINÉE
    # -----------------------------------------------------

    if statut == "DEJA_TERMINEE":
        raise HTTPException(
            status_code=409,
            detail="Vous avez déjà terminé cet examen."
        )

    # -----------------------------------------------------
    # EXAMEN TERMINÉ
    # -----------------------------------------------------

    return {
        "message": "Examen terminé avec succès.",
        "tentative_id": tentative.id,
        "examen_id": tentative.examen_id,
        "eleve_id": tentative.eleve_id,
        "date_debut": tentative.date_debut,
        "date_fin": tentative.date_fin,
        "statut": tentative.statut
    }