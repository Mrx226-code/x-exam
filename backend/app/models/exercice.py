from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database.database import Base


class Exercice(Base):
    __tablename__ = "exercices"

    id = Column(Integer, primary_key=True, index=True)

    classe = Column(String, nullable=False)
    serie = Column(String, nullable=True)

    matiere = Column(String, nullable=False)
    chapitre = Column(String, nullable=False)

    texte = Column(Text, nullable=False)

    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)

    bonne_reponse = Column(String, nullable=False)

    explication = Column(Text, nullable=True)