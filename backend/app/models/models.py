from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    UniqueConstraint,
    Boolean,
    DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database.database import Base


# ============================================================
# ========================== USER =============================
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nom = Column(
        String,
        nullable=False
    )

    # L'utilisateur peut avoir soit un email,
    # soit un numéro de téléphone.
    email = Column(
        String,
        unique=True,
        index=True,
        nullable=True
    )

    telephone = Column(
        String,
        unique=True,
        index=True,
        nullable=True
    )

    mot_de_passe = Column(
        String,
        nullable=False
    )

    # Tous les utilisateurs inscrits sont des élèves.
    # Le créateur d'un examen ne change PAS de rôle.
    role = Column(
        String,
        default="eleve",
        nullable=False
    )

    # Classe de l'élève.
    # Exemples : 6e, 3e, 2nde C, 1ère D, Tle A
    classe = Column(
        String,
        nullable=True
    )

    # --------------------------------------------------------
    # Relations
    # --------------------------------------------------------

    examens_crees = relationship(
        "Examen",
        back_populates="createur",
        foreign_keys="Examen.createur_id"
    )

    questions_proposees = relationship(
        "Question",
        back_populates="proposeur",
        foreign_keys="Question.proposeur_id"
    )

    reponses = relationship(
        "Reponse",
        back_populates="eleve",
        foreign_keys="Reponse.eleve_id"
    )

    tentatives = relationship(
        "TentativeExamen",
        back_populates="eleve",
        foreign_keys="TentativeExamen.eleve_id"
    )


# ============================================================
# ========================== EXAMEN ===========================
# ============================================================

class Examen(Base):
    __tablename__ = "examens"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    titre = Column(
        String,
        nullable=False
    )

    description = Column(
        String
    )

    # Classe concernée par l'examen.
    # Exemples : 6e, 3e, 2nde C, 1ère D, Tle A
    classe = Column(
        String,
        nullable=False
    )

    # True  = accessible sans compte
    # False = réservé aux utilisateurs connectés
    public = Column(
        Boolean,
        default=False,
        nullable=False
    )

    # Utilisateur ayant créé l'examen.
    #
    # IMPORTANT :
    # son User.role reste "eleve".
    # Il est créateur uniquement de cet examen.
    createur_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------------
    # Relations
    # --------------------------------------------------------

    createur = relationship(
        "User",
        back_populates="examens_crees",
        foreign_keys=[createur_id]
    )

    questions = relationship(
        "Question",
        back_populates="examen",
        cascade="all, delete-orphan"
    )

    tentatives = relationship(
        "TentativeExamen",
        back_populates="examen",
        cascade="all, delete-orphan"
    )


# ============================================================
# ========================== QUESTION =========================
# ============================================================

class Question(Base):
    __tablename__ = "questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    texte = Column(
        String,
        nullable=False
    )

    option_a = Column(
        String,
        nullable=False
    )

    option_b = Column(
        String,
        nullable=False
    )

    option_c = Column(
        String,
        nullable=False
    )

    option_d = Column(
        String,
        nullable=False
    )

    # Bonne réponse : A, B, C ou D
    #
    # Cette information ne doit PAS être envoyée
    # dans les réponses destinées aux élèves.
    bonne_reponse = Column(
        String,
        nullable=False
    )

    # Explication de la bonne réponse.
    explication = Column(
        String,
        nullable=True
    )

    # Examen auquel appartient la question.
    examen_id = Column(
        Integer,
        ForeignKey("examens.id"),
        nullable=False
    )

    # Utilisateur qui a proposé la question.
    proposeur_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Statut de validation.
    #
    # en_attente
    # acceptee
    # refusee
    statut = Column(
        String,
        default="en_attente",
        nullable=False
    )

    # --------------------------------------------------------
    # Relations
    # --------------------------------------------------------

    examen = relationship(
        "Examen",
        back_populates="questions"
    )

    proposeur = relationship(
        "User",
        back_populates="questions_proposees",
        foreign_keys=[proposeur_id]
    )

    reponses = relationship(
        "Reponse",
        back_populates="question",
        cascade="all, delete-orphan"
    )


# ============================================================
# ========================== REPONSE ==========================
# ============================================================

class Reponse(Base):
    __tablename__ = "reponses"

    # --------------------------------------------------------
    # CONTRAINTE METIER
    # --------------------------------------------------------
    #
    # Un élève ne peut répondre qu'une seule fois
    # à une même question.
    #
    __table_args__ = (
        UniqueConstraint(
            "eleve_id",
            "question_id",
            name="uq_eleve_question"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Réponse donnée : A, B, C ou D
    reponse = Column(
        String,
        nullable=False
    )

    # True si la réponse est correcte.
    est_correcte = Column(
        Boolean,
        nullable=False
    )

    # Question concernée.
    question_id = Column(
        Integer,
        ForeignKey("questions.id"),
        nullable=False
    )

    # Élève qui donne la réponse.
    eleve_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------------
    # Relations
    # --------------------------------------------------------

    question = relationship(
        "Question",
        back_populates="reponses"
    )

    eleve = relationship(
        "User",
        back_populates="reponses",
        foreign_keys=[eleve_id]
    )


# ============================================================
# ====================== TENTATIVE EXAMEN ====================
# ============================================================

class TentativeExamen(Base):
    __tablename__ = "tentatives_examens"

    # --------------------------------------------------------
    # CONTRAINTE METIER
    # --------------------------------------------------------
    #
    # Un élève ne peut avoir qu'une seule tentative
    # pour un même examen.
    #
    __table_args__ = (
        UniqueConstraint(
            "eleve_id",
            "examen_id",
            name="uq_eleve_examen_tentative"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Élève qui passe l'examen.
    eleve_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Examen passé.
    examen_id = Column(
        Integer,
        ForeignKey("examens.id"),
        nullable=False
    )

    # Date et heure du début.
    date_debut = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Date et heure de fin.
    # NULL tant que l'examen n'est pas terminé.
    date_fin = Column(
        DateTime,
        nullable=True
    )

    # État de la tentative :
    #
    # en_cours  = examen commencé mais pas terminé
    # terminee  = examen terminé
    statut = Column(
        String,
        default="en_cours",
        nullable=False
    )

    # --------------------------------------------------------
    # Relations
    # --------------------------------------------------------

    eleve = relationship(
        "User",
        back_populates="tentatives",
        foreign_keys=[eleve_id]
    )

    examen = relationship(
        "Examen",
        back_populates="tentatives"
    )