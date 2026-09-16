from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import SessionLocal

from app.schemas.question import (
    QuestionCreate,
    QuestionResponse,
    QuestionExamenResponse,
    QuestionAdminResponse
)

from app.services.question_service import (
    create_question,
    get_questions_by_examen,
    get_question,
    accepter_question,
    refuser_question,
)

from app.utils.auth import (
    get_current_user,
    get_optional_user
)

from app.models.models import User, Examen


router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# PROPOSER UNE QUESTION
# =========================================================

@router.post(
    "/",
    response_model=QuestionResponse
)
def ajouter_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tout utilisateur connecté peut proposer une question.
    #
    # Tous les utilisateurs inscrits ont le rôle "eleve".
    #
    # Si l'utilisateur propose une question à son propre
    # examen, elle sera automatiquement acceptée par le service.
    #
    # Sinon, elle sera placée en attente.

    return create_question(
        db,
        question,
        current_user.id
    )


# =========================================================
# QUESTIONS D'UN EXAMEN
# =========================================================
#
# Accessible :
# - au visiteur si l'examen est public
# - à l'utilisateur connecté
#
# Seules les questions acceptées sont retournées.
# La bonne réponse n'est jamais envoyée.
# =========================================================

@router.get(
    "/examen/{examen_id}",
    response_model=list[QuestionExamenResponse]
)
def liste_questions_examen(
    examen_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user)
):
    # Vérifier que l'examen existe
    examen = (
        db.query(Examen)
        .filter(Examen.id == examen_id)
        .first()
    )

    if not examen:
        raise HTTPException(
            status_code=404,
            detail="Examen introuvable."
        )

    # -----------------------------------------------------
    # VISITEUR
    # -----------------------------------------------------

    if current_user is None:

        if not examen.public:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Cet examen est privé. "
                    "Vous devez avoir un compte."
                )
            )

    # -----------------------------------------------------
    # UTILISATEUR CONNECTÉ
    # -----------------------------------------------------

    return get_questions_by_examen(
        db,
        examen_id
    )


# =========================================================
# VOIR UNE QUESTION
# =========================================================
#
# Accessible au visiteur uniquement si la question
# appartient à un examen public.
# =========================================================

@router.get(
    "/{question_id}",
    response_model=QuestionExamenResponse
)
def detail_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user)
):
    question = get_question(
        db,
        question_id
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question introuvable."
        )

    # -----------------------------------------------------
    # VISITEUR
    # -----------------------------------------------------

    if current_user is None:

        if not question.examen.public:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Cette question appartient à un "
                    "examen privé. Vous devez avoir un compte."
                )
            )

    return question


# =========================================================
# ACCEPTER UNE QUESTION
# =========================================================

@router.put(
    "/{question_id}/accepter",
    response_model=QuestionAdminResponse
)
def accepter_question_route(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # -----------------------------------------------------
    # RÉCUPÉRER LA QUESTION
    # -----------------------------------------------------

    question = (
        db.query(Examen)
        .filter(
            Examen.id.in_(
                db.query(
                    __import__(
                        "app.models.models",
                        fromlist=["Question"]
                    ).Question.examen_id
                )
            )
        )
    )

    # Le contrôle réel de propriété est effectué
    # dans le service accepter_question().
    #
    # L'admin peut gérer toutes les questions.
    # Le créateur peut gérer les questions de son examen.

    resultat = accepter_question(
        db,
        question_id,
        current_user.id
    )

    if resultat is None:
        raise HTTPException(
            status_code=404,
            detail="Question introuvable"
        )

    if resultat is False:
        raise HTTPException(
            status_code=403,
            detail=(
                "Vous n'êtes pas autorisé à accepter "
                "cette question."
            )
        )

    return resultat


# =========================================================
# REFUSER UNE QUESTION
# =========================================================

@router.put(
    "/{question_id}/refuser",
    response_model=QuestionAdminResponse
)
def refuser_question_route(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Le contrôle du propriétaire de l'examen
    # ou du rôle admin est effectué dans le service.

    resultat = refuser_question(
        db,
        question_id,
        current_user.id
    )

    if resultat is None:
        raise HTTPException(
            status_code=404,
            detail="Question introuvable"
        )

    if resultat is False:
        raise HTTPException(
            status_code=403,
            detail=(
                "Vous n'êtes pas autorisé à refuser "
                "cette question."
            )
        )

    return resultat