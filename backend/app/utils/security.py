import os
from datetime import datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext


# =========================================================
# CONFIGURATION
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "x_exam_secret_key_2026"
)

ALGORITHM = "HS256"


# Durée de validité de l'access token
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# =========================================================
# MOT DE PASSE
# =========================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# =========================================================
# ACCESS TOKEN
# =========================================================

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================================================
# REFRESH TOKEN
# =========================================================

def create_refresh_token(data: dict):
    to_encode = data.copy()

    # Le refresh token n'a PAS de date d'expiration.
    # Il reste valide jusqu'à la déconnexion ou
    # la révocation de la session.
    to_encode.update({
        "type": "refresh"
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================================================
# VÉRIFICATION ACCESS TOKEN
# =========================================================

def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "access":
            return None

        return payload

    except JWTError:
        return None


# =========================================================
# VÉRIFICATION REFRESH TOKEN
# =========================================================

def verify_refresh_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "refresh":
            return None

        return payload

    except JWTError:
        return None