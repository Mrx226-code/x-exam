from sqlalchemy.orm import Session

from app.models.models import Question, Examen
from app.schemas.question import QuestionCreate


# =========================================================
# CRÉER UNE QUESTION
# =========================================================

def create_question(
    db: Session,
    question: QuestionCreate,
    proposeur_id: int
):
    # Vérifier que l'examen existe
    examen = (
        db.query(Examen)
        .filter(Examen.id == question.examen_id)
        .first()
    )

    if not examen:
        return None

    # -----------------------------------------------------
    # STATUT DE LA QUESTION
    # -----------------------------------------------------
    #
    # Si le créateur de l'examen ajoute lui-même
    # la question, elle est automatiquement acceptée.
    #
    # Si quelqu'un d'autre la propose, elle reste
    # en attente de validation.
    #

    if examen.createur_id == proposeur_id:
        statut = "acceptee"
    else:
        statut = "en_attente"

    nouvelle_question = Question(
        texte=question.texte,
        option_a=question.option_a,
        option_b=question.option_b,
        option_c=question.option_c,
        option_d=question.option_d,
        bonne_reponse=question.bonne_reponse,
        explication=question.explication,
        examen_id=question.examen_id,
        proposeur_id=proposeur_id,
        statut=statut
    )

    db.add(nouvelle_question)
    db.commit()
    db.refresh(nouvelle_question)

    return nouvelle_question


# =========================================================
# RÉCUPÉRER LES QUESTIONS D'UN EXAMEN
# =========================================================

def get_questions_by_examen(
    db: Session,
    examen_id: int
):
    # Seules les questions acceptées sont retournées.
    #
    # Les questions :
    # - en_attente
    # - refusee
    #
    # ne sont jamais visibles dans cette fonction.

    return (
        db.query(Question)
        .filter(
            Question.examen_id == examen_id,
            Question.statut == "acceptee"
        )
        .all()
    )


# =========================================================
# RÉCUPÉRER UNE QUESTION
# =========================================================

def get_question(
    db: Session,
    question_id: int
):
    # Une question en attente ou refusée ne peut pas
    # être consultée par les routes normales.

    return (
        db.query(Question)
        .filter(
            Question.id == question_id,
            Question.statut == "acceptee"
        )
        .first()
    )


# =========================================================
# ACCEPTER UNE QUESTION
# =========================================================

def accepter_question(
    db: Session,
    question_id: int,
    utilisateur_id: int
):
    # Chercher la question
    question = (
        db.query(Question)
        .filter(Question.id == question_id)
        .first()
    )

    if not question:
        return None

    # Chercher l'examen auquel appartient la question
    examen = (
        db.query(Examen)
        .filter(Examen.id == question.examen_id)
        .first()
    )

    if not examen:
        return None

    # -----------------------------------------------------
    # IMPORTANT
    # -----------------------------------------------------
    #
    # La vérification du rôle est déjà faite dans la route.
    #
    # Le service vérifie ici que l'utilisateur est bien
    # le créateur de l'examen.
    #
    # L'admin est traité dans la route, mais pour que
    # l'admin puisse réellement agir, cette fonction doit
    # également pouvoir l'autoriser.
    #
    # Comme cette fonction ne reçoit actuellement que
    # l'ID utilisateur, on récupère son rôle ici.

    from app.models.models import User

    utilisateur = (
        db.query(User)
        .filter(User.id == utilisateur_id)
        .first()
    )

    if not utilisateur:
        return False

    # Le créateur de l'examen OU l'admin peut accepter.
    if (
        utilisateur.role != "admin"
        and examen.createur_id != utilisateur_id
    ):
        return False

    # Accepter la question
    question.statut = "acceptee"

    db.commit()
    db.refresh(question)

    return question


# =========================================================
# REFUSER UNE QUESTION
# =========================================================

def refuser_question(
    db: Session,
    question_id: int,
    utilisateur_id: int
):
    # Chercher la question
    question = (
        db.query(Question)
        .filter(Question.id == question_id)
        .first()
    )

    if not question:
        return None

    # Chercher l'examen
    examen = (
        db.query(Examen)
        .filter(Examen.id == question.examen_id)
        .first()
    )

    if not examen:
        return None

    # Récupérer l'utilisateur
    from app.models.models import User

    utilisateur = (
        db.query(User)
        .filter(User.id == utilisateur_id)
        .first()
    )

    if not utilisateur:
        return False

    # Le créateur de l'examen OU l'admin peut refuser.
    if (
        utilisateur.role != "admin"
        and examen.createur_id != utilisateur_id
    ):
        return False

    # Refuser la question
    question.statut = "refusee"

    db.commit()
    db.refresh(question)

    return question