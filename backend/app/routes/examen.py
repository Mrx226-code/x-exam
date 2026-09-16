from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session

from database.database import SessionLocal

from app.schemas.examen import (
    ExamenCreate,
    ExamenResponse
)

from app.services.examen_service import (
    create_examen,
    get_examens,
    get_examens_publics,
    get_examen,
    get_examen_public,
    update_examen,
    delete_examen
)

from app.utils.auth import (
    get_current_user,
    get_optional_user
)

from app.models.models import User


router = APIRouter(
    prefix="/examens",
    tags=["Examens"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# CRÉER UN EXAMEN
# =========================================================

@router.post(
    "/",
    response_model=ExamenResponse
)
def ajouter_examen(
    examen: ExamenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tout utilisateur connecté peut créer un examen.
    #
    # Un utilisateur inscrit est toujours "eleve".
    # Lorsqu'il crée un examen, son ID devient
    # le createur_id de cet examen.
    #
    # L'administrateur peut également créer un examen.

    return create_examen(
        db,
        examen,
        current_user.id
    )


# =========================================================
# LISTE DES EXAMENS
# =========================================================

@router.get(
    "/",
    response_model=list[ExamenResponse]
)
def liste_examens(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user)
):
    # -----------------------------------------------------
    # VISITEUR
    # -----------------------------------------------------
    #
    # Un visiteur ne voit que les examens publics.

    if current_user is None:
        return get_examens_publics(db)

    # -----------------------------------------------------
    # UTILISATEUR CONNECTÉ
    # -----------------------------------------------------
    #
    # Un utilisateur connecté peut voir tous les examens
    # selon les règles actuelles.

    return get_examens(db)


# =========================================================
# DÉTAIL D'UN EXAMEN
# =========================================================

@router.get(
    "/{examen_id}",
    response_model=ExamenResponse
)
def detail_examen(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user)
):
    # -----------------------------------------------------
    # VISITEUR
    # -----------------------------------------------------
    #
    # Un visiteur ne peut consulter qu'un examen public.

    if current_user is None:

        examen = get_examen_public(
            db,
            examen_id
        )

        if not examen:
            raise HTTPException(
                status_code=404,
                detail="Examen public introuvable."
            )

        return examen

    # -----------------------------------------------------
    # UTILISATEUR CONNECTÉ
    # -----------------------------------------------------

    examen = get_examen(
        db,
        examen_id
    )

    if not examen:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable."
        )

    return examen


# =========================================================
# MODIFIER UN EXAMEN
# =========================================================

@router.put(
    "/{examen_id}",
    response_model=ExamenResponse
)
def modifier_examen(
    examen_id: int,
    examen_data: ExamenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    examen = get_examen(
        db,
        examen_id
    )

    if not examen:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable."
        )

    # -----------------------------------------------------
    # ADMIN
    # -----------------------------------------------------
    #
    # L'admin peut modifier n'importe quel examen.

    if current_user.role == "admin":
        pass

    # -----------------------------------------------------
    # CRÉATEUR DE L'EXAMEN
    # -----------------------------------------------------
    #
    # Peu importe que son rôle global soit "eleve".
    # Ce qui compte est createur_id.

    elif examen.createur_id == current_user.id:
        pass

    # -----------------------------------------------------
    # AUTRES UTILISATEURS
    # -----------------------------------------------------

    else:
        raise HTTPException(
            status_code=403,
            detail=(
                "Vous n'êtes pas autorisé "
                "à modifier cet examen."
            )
        )

    return update_examen(
        db,
        examen_id,
        examen_data
    )


# =========================================================
# SUPPRIMER UN EXAMEN
# =========================================================

@router.delete(
    "/{examen_id}"
)
def supprimer_examen(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    examen = get_examen(
        db,
        examen_id
    )

    if not examen:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable."
        )

    # -----------------------------------------------------
    # ADMIN
    # -----------------------------------------------------
    #
    # L'admin peut supprimer n'importe quel examen.

    if current_user.role == "admin":
        pass

    # -----------------------------------------------------
    # CRÉATEUR DE L'EXAMEN
    # -----------------------------------------------------
    #
    # Un élève peut supprimer son propre examen.

    elif examen.createur_id == current_user.id:
        pass

    # -----------------------------------------------------
    # AUTRES UTILISATEURS
    # -----------------------------------------------------

    else:
        raise HTTPException(
            status_code=403,
            detail=(
                "Vous n'êtes pas autorisé "
                "à supprimer cet examen."
            )
        )

    delete_examen(
        db,
        examen_id
    )

    return {
        "message": "Examen supprimé avec succès."
    }