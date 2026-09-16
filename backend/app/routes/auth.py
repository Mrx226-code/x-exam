from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import SessionLocal
from app.models.models import User

from app.utils.auth import get_current_user

from app.utils.security import (
    verify_refresh_token,
    create_access_token,
    create_refresh_token,
)

from app.schemas.user import (
    UserRegisterEmail,
    UserRegisterTelephone,
    UserResponse,
    UserLogin,
    TokenResponse,
)

from app.services.auth_service import (
    create_user_with_email,
    create_user_with_telephone,
    login_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentification"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# INSCRIPTION AVEC EMAIL
# =========================================================

@router.post(
    "/register/email",
    response_model=UserResponse
)
def register_email(
    user: UserRegisterEmail,
    db: Session = Depends(get_db)
):
    new_user = create_user_with_email(
        db,
        user.nom,
        user.email,
        user.mot_de_passe
    )

    if new_user is None:
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà utilisé."
        )

    return new_user


# =========================================================
# INSCRIPTION AVEC TÉLÉPHONE
# =========================================================

@router.post(
    "/register/telephone",
    response_model=UserResponse
)
def register_telephone(
    user: UserRegisterTelephone,
    db: Session = Depends(get_db)
):
    new_user = create_user_with_telephone(
        db,
        user.nom,
        user.telephone,
        user.mot_de_passe
    )

    if new_user is None:
        raise HTTPException(
            status_code=400,
            detail="Ce numéro de téléphone est déjà utilisé."
        )

    return new_user


# =========================================================
# CONNEXION
# =========================================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    result = login_user(
        db,
        user.identifiant,
        user.mot_de_passe
    )

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Identifiant ou mot de passe incorrect."
        )

    return result


# =========================================================
# REFRESH TOKEN
# =========================================================

class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
def refresh_access_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    # Vérifier le refresh token
    payload = verify_refresh_token(
        data.refresh_token
    )

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Refresh token invalide ou expiré."
        )

    # Récupérer l'identifiant contenu dans le token
    identifiant = payload.get("sub")

    if not identifiant:
        raise HTTPException(
            status_code=401,
            detail="Refresh token invalide."
        )

    # Rechercher l'utilisateur
    user = (
        db.query(User)
        .filter(
            (User.email == identifiant)
            | (User.telephone == identifiant)
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Utilisateur introuvable."
        )

    # Créer un nouvel access token
    new_access_token = create_access_token(
        data={
            "sub": identifiant,
            "role": user.role
        }
    )

    # Créer également un nouveau refresh token.
    # Cela permet de prolonger la session de l'utilisateur
    # lorsqu'il continue à utiliser X_Exam.
    new_refresh_token = create_refresh_token(
        data={
            "sub": identifiant,
            "role": user.role
        }
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


# =========================================================
# UTILISATEUR ACTUELLEMENT CONNECTÉ
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user