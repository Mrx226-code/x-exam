from sqlalchemy.orm import Session

from app.models.models import User
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)


def create_user_with_email(
    db: Session,
    nom: str,
    email: str,
    mot_de_passe: str
):
    # Vérifier si l'email existe déjà
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        return None

    new_user = User(
        nom=nom,
        email=email,
        telephone=None,
        mot_de_passe=hash_password(mot_de_passe),
        role="eleve"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def create_user_with_telephone(
    db: Session,
    nom: str,
    telephone: str,
    mot_de_passe: str
):
    # Vérifier si le numéro existe déjà
    existing_user = (
        db.query(User)
        .filter(User.telephone == telephone)
        .first()
    )

    if existing_user:
        return None

    new_user = User(
        nom=nom,
        email=None,
        telephone=telephone,
        mot_de_passe=hash_password(mot_de_passe),
        role="eleve"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(
    db: Session,
    identifiant: str,
    mot_de_passe: str
):
    # Recherche par email OU par téléphone
    user = (
        db.query(User)
        .filter(
            (User.email == identifiant)
            | (User.telephone == identifiant)
        )
        .first()
    )

    if not user:
        return None

    if not verify_password(
        mot_de_passe,
        user.mot_de_passe
    ):
        return None

    return user


def login_user(
    db: Session,
    identifiant: str,
    mot_de_passe: str
):
    user = authenticate_user(
        db,
        identifiant,
        mot_de_passe
    )

    if not user:
        return None

    # Le "sub" peut être l'email ou le téléphone
    # selon le moyen utilisé pour le compte.
    identifiant_token = user.email or user.telephone

    # Création de l'access token
    access_token = create_access_token(
        data={
            "sub": identifiant_token,
            "role": user.role
        }
    )

    # Création du refresh token
    refresh_token = create_refresh_token(
        data={
            "sub": identifiant_token,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nom": user.nom,
            "email": user.email,
            "telephone": user.telephone,
            "role": user.role,
            "classe": user.classe
        }
    }