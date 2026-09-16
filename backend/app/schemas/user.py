from pydantic import BaseModel, EmailStr


# =========================================================
# INSCRIPTION AVEC EMAIL
# =========================================================

class UserRegisterEmail(BaseModel):
    nom: str
    email: EmailStr
    mot_de_passe: str


# =========================================================
# INSCRIPTION AVEC TÉLÉPHONE
# =========================================================

class UserRegisterTelephone(BaseModel):
    nom: str
    telephone: str
    mot_de_passe: str


# =========================================================
# CONNEXION AVEC EMAIL OU TÉLÉPHONE
# =========================================================

class UserLogin(BaseModel):
    identifiant: str
    mot_de_passe: str


# =========================================================
# RÉPONSE UTILISATEUR
# =========================================================

class UserResponse(BaseModel):
    id: int
    nom: str
    email: EmailStr | None = None
    telephone: str | None = None
    role: str
    classe: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# RÉPONSE DE CONNEXION
# =========================================================

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse