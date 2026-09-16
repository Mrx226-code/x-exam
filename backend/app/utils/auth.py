from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)
from sqlalchemy.orm import Session

from database.database import SessionLocal
from app.models.models import User
from app.utils.security import verify_access_token


security = HTTPBearer()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# UTILISATEUR OBLIGATOIREMENT CONNECTÉ
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token invalide ou expiré."
        )

    # Le token peut contenir un email ou un téléphone
    identifiant = payload.get("sub")

    if not identifiant:
        raise HTTPException(
            status_code=401,
            detail="Token invalide."
        )

    # Rechercher l'utilisateur par email OU téléphone
    user = db.query(User).filter(
        (User.email == identifiant)
        | (User.telephone == identifiant)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Utilisateur introuvable."
        )

    return user


# =========================================================
# UTILISATEUR FACULTATIF
# =========================================================

def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        HTTPBearer(auto_error=False)
    ),
    db: Session = Depends(get_db)
):
    """
    Retourne l'utilisateur connecté si un token valide est fourni.

    Si aucun token n'est fourni :
        → retourne None
        → l'utilisateur est considéré comme visiteur.

    Si un token est fourni mais invalide :
        → retourne une erreur 401.
    """

    # Aucun token = visiteur
    if credentials is None:
        return None

    token = credentials.credentials

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token invalide ou expiré."
        )

    identifiant = payload.get("sub")

    if not identifiant:
        raise HTTPException(
            status_code=401,
            detail="Token invalide."
        )

    user = db.query(User).filter(
        (User.email == identifiant)
        | (User.telephone == identifiant)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Utilisateur introuvable."
        )

    return user