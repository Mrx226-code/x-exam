from datetime import datetime

from sqlalchemy.orm import Session

from app.models.models import (
    TentativeExamen,
    Examen,
    User
)


# =========================================================
# VÉRIFIER UNE TENTATIVE EXISTANTE
# =========================================================

def get_tentative(
    db: Session,
    examen_id: int,
    eleve_id: int
):
    return db.query(TentativeExamen).filter(
        TentativeExamen.examen_id == examen_id,
        TentativeExamen.eleve_id == eleve_id
    ).first()


# =========================================================
# DÉMARRER UN EXAMEN
# =========================================================

def demarrer_tentative(
    db: Session,
    examen_id: int,
    eleve_id: int
):
    # Vérifier que l'examen existe
    examen = db.query(Examen).filter(
        Examen.id == examen_id
    ).first()

    if not examen:
        return None, "EXAMEN_INTRouvable"

    # Vérifier si l'élève a déjà une tentative
    tentative_existante = get_tentative(
        db,
        examen_id,
        eleve_id
    )

    if tentative_existante:
        return tentative_existante, "DEJA_EXISTANTE"

    # Créer la tentative
    tentative = TentativeExamen(
        eleve_id=eleve_id,
        examen_id=examen_id,
        date_debut=datetime.utcnow(),
        statut="en_cours"
    )

    db.add(tentative)
    db.commit()
    db.refresh(tentative)

    return tentative, "CREEE"


# =========================================================
# TERMINER UN EXAMEN
# =========================================================

def terminer_tentative(
    db: Session,
    examen_id: int,
    eleve_id: int
):
    tentative = get_tentative(
        db,
        examen_id,
        eleve_id
    )

    # Aucune tentative
    if not tentative:
        return None, "INEXISTANTE"

    # Tentative déjà terminée
    if tentative.statut == "terminee":
        return tentative, "DEJA_TERMINEE"

    # Terminer la tentative
    tentative.date_fin = datetime.utcnow()
    tentative.statut = "terminee"

    db.commit()
    db.refresh(tentative)

    return tentative, "TERMINEE"