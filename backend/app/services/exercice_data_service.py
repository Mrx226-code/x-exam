from sqlalchemy.orm import Session

from app.data.exercices import EXERCICES
from app.models.examen import Examen
from app.models.question import Question


def charger_exercices(db: Session):
    """
    Charge les exercices prédéfinis dans la base de données.

    - Évite les doublons.
    - Crée automatiquement les examens nécessaires.
    - Associe chaque question à son examen.
    """

    exercices_ajoutes = 0
    exercices_existants = 0
    examens_crees = 0

    for exercice in EXERCICES:

        classe = exercice["classe"]
        serie = exercice["serie"]
        matiere = exercice["matiere"]

        # Recherche d'un examen correspondant
        titre_examen = f"Exercices {matiere} - {classe} - {serie}"

        examen = (
            db.query(Examen)
            .filter(
                Examen.titre == titre_examen,
                Examen.classe == classe,
                Examen.createur_id.is_(None)
            )
            .first()
        )

        # Création de l'examen s'il n'existe pas
        if not examen:
            examen = Examen(
                titre=titre_examen,
                description=f"Exercices de {matiere} pour la classe {classe}.",
                classe=classe,
                public=True,
                createur_id=None
            )

            db.add(examen)
            db.flush()

            examens_crees += 1

        # Vérification d'un éventuel doublon
        question_existante = (
            db.query(Question)
            .filter(
                Question.examen_id == examen.id,
                Question.texte == exercice["texte"]
            )
            .first()
        )

        if question_existante:
            exercices_existants += 1
            continue

        # Création de la question
        question = Question(
            texte=exercice["texte"],
            option_a=exercice["option_a"],
            option_b=exercice["option_b"],
            option_c=exercice["option_c"],
            option_d=exercice["option_d"],
            bonne_reponse=exercice["bonne_reponse"],
            examen_id=examen.id,
            proposeur_id=None,
            statut="acceptee"
        )

        db.add(question)
        exercices_ajoutes += 1

    db.commit()

    return {
        "examens_crees": examens_crees,
        "exercices_ajoutes": exercices_ajoutes,
        "exercices_deja_existants": exercices_existants,
        "total_exercices": len(EXERCICES),
    }