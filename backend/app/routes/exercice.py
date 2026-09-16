from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal

from app.schemas.exercice import (
    ExerciceCreate,
    ExerciceResponse,
    ReponseExercice,
    ResultatExercices,
)

from app.services.exercice_service import (
    creer_exercice,
    obtenir_exercices,
    obtenir_exercice_par_id,
    obtenir_exercices_par_classe,
    supprimer_exercice,
    corriger_exercices,
)


router = APIRouter(
    prefix="/exercices",
    tags=["Exercices"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=ExerciceResponse
)
def ajouter_exercice(
    exercice: ExerciceCreate,
    db: Session = Depends(get_db)
):
    return creer_exercice(
        db,
        exercice
    )


@router.get(
    "/",
    response_model=list[ExerciceResponse]
)
def lister_exercices(
    db: Session = Depends(get_db)
):
    return obtenir_exercices(db)


@router.get(
    "/classe/{classe}",
    response_model=list[ExerciceResponse]
)
def exercices_par_classe(
    classe: str,
    serie: str | None = None,
    db: Session = Depends(get_db)
):
    return obtenir_exercices_par_classe(
        db,
        classe,
        serie
    )


@router.post(
    "/corriger",
    response_model=ResultatExercices
)
def corriger_exercices_endpoint(
    reponses: list[ReponseExercice],
    db: Session = Depends(get_db)
):
    return corriger_exercices(
        db,
        reponses
    )


@router.get(
    "/{exercice_id}",
    response_model=ExerciceResponse
)
def lire_exercice(
    exercice_id: int,
    db: Session = Depends(get_db)
):
    exercice = obtenir_exercice_par_id(
        db,
        exercice_id
    )

    if exercice is None:
        raise HTTPException(
            status_code=404,
            detail="Exercice introuvable."
        )

    return exercice


@router.delete(
    "/{exercice_id}"
)
def supprimer_un_exercice(
    exercice_id: int,
    db: Session = Depends(get_db)
):
    exercice = supprimer_exercice(
        db,
        exercice_id
    )

    if exercice is None:
        raise HTTPException(
            status_code=404,
            detail="Exercice introuvable."
        )

    return {
        "message": "Exercice supprimé avec succès."
    }