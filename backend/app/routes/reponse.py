from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal

from app.schemas.reponse import (
    ReponseCreate,
    ReponseResponse,
    ReponseVisiteurResponse
)

from app.services.reponse_service import (
    create_reponse,
    create_reponse_visiteur
)

from app.utils.auth import get_current_user

from app.models.models import User


router = APIRouter(
    prefix="/reponses",
    tags=["Réponses"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# ÉLÈVE CONNECTÉ
# =========================================================

@router.post(
    "/",
    response_model=ReponseResponse
)
def repondre_question(
    reponse: ReponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Seul un élève connecté peut utiliser
    # cette route.
    if current_user.role != "eleve":
        raise HTTPException(
            status_code=403,
            detail="Seul un élève peut répondre à une question."
        )

    try:
        nouvelle_reponse = create_reponse(
            db=db,
            question_id=reponse.question_id,
            eleve_id=current_user.id,
            reponse=reponse.reponse
        )

        if nouvelle_reponse is None:
            raise HTTPException(
                status_code=404,
                detail="Question introuvable"
            )

        return nouvelle_reponse

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================================
# VISITEUR SANS COMPTE
# =========================================================

@router.post(
    "/visiteur",
    response_model=ReponseVisiteurResponse
)
def repondre_question_visiteur(
    reponse: ReponseCreate,
    db: Session = Depends(get_db)
):
    try:
        resultat = create_reponse_visiteur(
            db=db,
            question_id=reponse.question_id,
            reponse=reponse.reponse
        )

        if resultat is None:
            raise HTTPException(
                status_code=404,
                detail="Question introuvable"
            )

        return resultat

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e)
        )