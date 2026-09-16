from sqlalchemy.orm import Session

from app.models.exercice import Exercice
from app.schemas.exercice import (
    ExerciceCreate,
    ReponseExercice,
    CorrectionExercice,
    ResultatExercices,
)
from data.exercices_data import EXERCICES


def creer_exercice(
    db: Session,
    exercice: ExerciceCreate
):
    nouvel_exercice = Exercice(
        classe=exercice.classe,
        serie=exercice.serie,
        matiere=exercice.matiere,
        chapitre=exercice.chapitre,
        texte=exercice.texte,
        option_a=exercice.option_a,
        option_b=exercice.option_b,
        option_c=exercice.option_c,
        option_d=exercice.option_d,
        bonne_reponse=exercice.bonne_reponse,
        explication=getattr(exercice, "explication", None)
    )

    db.add(nouvel_exercice)
    db.commit()
    db.refresh(nouvel_exercice)

    return nouvel_exercice


def charger_exercices(db: Session):
    exercices_ajoutes = 0
    exercices_deja_existants = 0

    for exercice_data in EXERCICES:

        exercice_existant = (
            db.query(Exercice)
            .filter(
                Exercice.classe == exercice_data["classe"],
                Exercice.serie == exercice_data["serie"],
                Exercice.matiere == exercice_data["matiere"],
                Exercice.chapitre == exercice_data["chapitre"],
                Exercice.texte == exercice_data["texte"]
            )
            .first()
        )

        if exercice_existant:
            exercices_deja_existants += 1
            continue

        nouvel_exercice = Exercice(
            classe=exercice_data["classe"],
            serie=exercice_data["serie"],
            matiere=exercice_data["matiere"],
            chapitre=exercice_data["chapitre"],
            texte=exercice_data["texte"],
            option_a=exercice_data["option_a"],
            option_b=exercice_data["option_b"],
            option_c=exercice_data["option_c"],
            option_d=exercice_data["option_d"],
            bonne_reponse=exercice_data["bonne_reponse"],
            explication=exercice_data.get("explication")
        )

        db.add(nouvel_exercice)
        exercices_ajoutes += 1

    db.commit()

    return {
        "exercices_ajoutes": exercices_ajoutes,
        "exercices_deja_existants": exercices_deja_existants
    }


def obtenir_exercices(
    db: Session
):
    return db.query(Exercice).all()


def obtenir_exercice_par_id(
    db: Session,
    exercice_id: int
):
    return (
        db.query(Exercice)
        .filter(Exercice.id == exercice_id)
        .first()
    )


def obtenir_exercices_par_classe(
    db: Session,
    classe: str,
    serie: str | None = None
):
    query = db.query(Exercice).filter(
        Exercice.classe == classe
    )

    if serie:
        query = query.filter(
            Exercice.serie == serie
        )

    return query.all()


def supprimer_exercice(
    db: Session,
    exercice_id: int
):
    exercice = (
        db.query(Exercice)
        .filter(Exercice.id == exercice_id)
        .first()
    )

    if exercice is None:
        return None

    db.delete(exercice)
    db.commit()

    return exercice


def corriger_exercices(
    db: Session,
    reponses: list[ReponseExercice]
):
    total_questions = len(reponses)
    questions_repondues = 0
    bonnes_reponses = 0

    corrections = []

    for reponse in reponses:

        exercice = (
            db.query(Exercice)
            .filter(
                Exercice.id == reponse.exercice_id
            )
            .first()
        )

        if exercice is None:
            continue

        reponse_donnee = (
            str(reponse.reponse)
            .strip()
            .upper()
        )

        bonne_reponse = (
            str(exercice.bonne_reponse)
            .strip()
            .upper()
        )

        correct = (
            reponse_donnee != ""
            and reponse_donnee == bonne_reponse
        )

        if reponse_donnee != "":
            questions_repondues += 1

        if correct:
            bonnes_reponses += 1

        corrections.append(
            CorrectionExercice(
                exercice_id=exercice.id,
                texte=exercice.texte,
                reponse_donnee=(
                    reponse_donnee
                    if reponse_donnee != ""
                    else None
                ),
                bonne_reponse=bonne_reponse,
                option_a=exercice.option_a,
                option_b=exercice.option_b,
                option_c=exercice.option_c,
                option_d=exercice.option_d,
                explication=exercice.explication,
                correct=correct
            )
        )

    mauvaises_reponses = (
        questions_repondues - bonnes_reponses
    )

    if total_questions > 0:
        pourcentage = round(
            (bonnes_reponses / total_questions) * 100,
            2
        )
    else:
        pourcentage = 0.0

    score = (
        f"{bonnes_reponses}/{total_questions}"
    )

    return ResultatExercices(
        total_questions=total_questions,
        questions_repondues=questions_repondues,
        bonnes_reponses=bonnes_reponses,
        mauvaises_reponses=mauvaises_reponses,
        score=score,
        pourcentage=pourcentage,
        corrections=corrections
    )