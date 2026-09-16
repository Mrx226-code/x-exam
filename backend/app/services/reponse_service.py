from sqlalchemy.orm import Session

from app.models.models import Reponse, Question


def create_reponse(
    db: Session,
    question_id: int,
    eleve_id: int,
    reponse: str
):
    # Vérifier que la réponse est A, B, C ou D
    reponse = reponse.upper()

    if reponse not in ["A", "B", "C", "D"]:
        raise ValueError(
            "La réponse doit être A, B, C ou D"
        )

    # Récupérer la question
    question = db.query(Question).filter(
        Question.id == question_id
    ).first()

    if not question:
        return None

    # Vérifier si l'élève a déjà répondu
    reponse_existante = db.query(Reponse).filter(
        Reponse.question_id == question_id,
        Reponse.eleve_id == eleve_id
    ).first()

    if reponse_existante:
        raise ValueError(
            "Vous avez déjà répondu à cette question."
        )

    # Vérifier si la réponse est correcte
    est_correcte = (
        reponse == question.bonne_reponse.upper()
    )

    # Enregistrer la réponse de l'élève
    nouvelle_reponse = Reponse(
        question_id=question_id,
        eleve_id=eleve_id,
        reponse=reponse,
        est_correcte=est_correcte
    )

    db.add(nouvelle_reponse)
    db.commit()
    db.refresh(nouvelle_reponse)

    return nouvelle_reponse


def create_reponse_visiteur(
    db: Session,
    question_id: int,
    reponse: str
):
    # Vérifier que la réponse est A, B, C ou D
    reponse = reponse.upper()

    if reponse not in ["A", "B", "C", "D"]:
        raise ValueError(
            "La réponse doit être A, B, C ou D"
        )

    # Récupérer la question
    question = db.query(Question).filter(
        Question.id == question_id
    ).first()

    if not question:
        return None

    # Vérifier que l'examen est public
    if not question.examen.public:
        raise PermissionError(
            "Cette question nécessite un compte."
        )

    # Calculer immédiatement le résultat
    est_correcte = (
        reponse == question.bonne_reponse.upper()
    )

    # IMPORTANT :
    # aucune ligne n'est enregistrée dans Reponse.
    # Le visiteur n'a pas de compte.
    return {
        "question_id": question_id,
        "reponse": reponse,
        "est_correcte": est_correcte
    }