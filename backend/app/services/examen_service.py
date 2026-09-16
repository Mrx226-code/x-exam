from sqlalchemy.orm import Session

from app.models.models import Examen
from app.schemas.examen import ExamenCreate


# =========================================================
# CRÉER UN EXAMEN
# =========================================================

def create_examen(
    db: Session,
    examen: ExamenCreate,
    createur_id: int
):
    new_examen = Examen(
        titre=examen.titre,
        description=examen.description,
        classe=examen.classe,
        public=examen.public,
        createur_id=createur_id
    )

    db.add(new_examen)
    db.commit()
    db.refresh(new_examen)

    return new_examen


# =========================================================
# TOUS LES EXAMENS
# =========================================================

def get_examens(db: Session):
    return db.query(Examen).all()


# =========================================================
# EXAMENS PUBLICS
# =========================================================

def get_examens_publics(db: Session):
    return db.query(Examen).filter(
        Examen.public.is_(True)
    ).all()


# =========================================================
# UN EXAMEN
# =========================================================

def get_examen(
    db: Session,
    examen_id: int
):
    return db.query(Examen).filter(
        Examen.id == examen_id
    ).first()


# =========================================================
# UN EXAMEN PUBLIC
# =========================================================

def get_examen_public(
    db: Session,
    examen_id: int
):
    return db.query(Examen).filter(
        Examen.id == examen_id,
        Examen.public.is_(True)
    ).first()


# =========================================================
# MODIFIER UN EXAMEN
# =========================================================

def update_examen(
    db: Session,
    examen_id: int,
    examen_data: ExamenCreate
):
    examen = db.query(Examen).filter(
        Examen.id == examen_id
    ).first()

    if not examen:
        return None

    examen.titre = examen_data.titre
    examen.description = examen_data.description
    examen.classe = examen_data.classe
    examen.public = examen_data.public

    db.commit()
    db.refresh(examen)

    return examen


# =========================================================
# SUPPRIMER UN EXAMEN
# =========================================================

def delete_examen(
    db: Session,
    examen_id: int
):
    examen = db.query(Examen).filter(
        Examen.id == examen_id
    ).first()

    if not examen:
        return None

    db.delete(examen)
    db.commit()

    return True