from sqlalchemy.orm import Session

from app.models.models import Question, Reponse, Examen


def get_score(
    db: Session,
    examen_id: int,
    eleve_id: int
):
    # Vérifier que l'examen existe
    examen = db.query(Examen).filter(
        Examen.id == examen_id
    ).first()

    if not examen:
        return None

    # Nombre total de questions
    total_questions = db.query(Question).filter(
        Question.examen_id == examen_id
    ).count()

    # Récupérer les réponses de l'élève
    reponses = (
        db.query(Reponse)
        .join(
            Question,
            Reponse.question_id == Question.id
        )
        .filter(
            Question.examen_id == examen_id,
            Reponse.eleve_id == eleve_id
        )
        .all()
    )

    # Nombre de bonnes réponses
    bonnes_reponses = sum(
        1
        for reponse in reponses
        if reponse.est_correcte
    )

    # Calcul du pourcentage
    pourcentage = 0

    if total_questions > 0:
        pourcentage = round(
            (bonnes_reponses / total_questions) * 100,
            2
        )

    return {
        "examen_id": examen_id,
        "eleve_id": eleve_id,
        "total_questions": total_questions,
        "questions_repondues": len(reponses),
        "bonnes_reponses": bonnes_reponses,
        "mauvaises_reponses": (
            len(reponses) - bonnes_reponses
        ),
        "score": f"{bonnes_reponses}/{total_questions}",
        "pourcentage": pourcentage
    }