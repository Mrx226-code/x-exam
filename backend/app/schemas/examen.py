from pydantic import BaseModel


class ExamenCreate(BaseModel):
    titre: str
    description: str | None = None
    classe: str

    # True = accessible sans compte
    # False = réservé aux utilisateurs connectés
    public: bool = False


class ExamenResponse(BaseModel):
    id: int
    titre: str
    description: str | None
    classe: str
    public: bool
    createur_id: int

    class Config:
        from_attributes = True