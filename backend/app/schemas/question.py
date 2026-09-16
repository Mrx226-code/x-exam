from pydantic import BaseModel


class QuestionCreate(BaseModel):
    texte: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    bonne_reponse: str
    explication: str | None = None
    examen_id: int


# Réponse complète pour le créateur de l'examen
class QuestionResponse(BaseModel):
    id: int
    texte: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    bonne_reponse: str
    explication: str | None = None
    examen_id: int
    proposeur_id: int
    statut: str

    class Config:
        from_attributes = True


# Réponse complète pour l'administration
class QuestionAdminResponse(BaseModel):
    id: int
    texte: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    bonne_reponse: str
    explication: str | None = None
    examen_id: int
    proposeur_id: int
    statut: str

    class Config:
        from_attributes = True


# Réponse destinée à l'étudiant
# La bonne réponse n'est PAS envoyée
class QuestionExamenResponse(BaseModel):
    id: int
    texte: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    examen_id: int

    class Config:
        from_attributes = True