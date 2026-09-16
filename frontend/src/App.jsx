import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const HISTORIQUE_KEY = "x_exam_historique";
const ACCESS_TOKEN_KEY = "x_exam_access_token";
const REFRESH_TOKEN_KEY = "x_exam_refresh_token";

function App() {
  const [page, setPage] = useState("accueil");

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(ACCESS_TOKEN_KEY) || ""
  );

  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem(REFRESH_TOKEN_KEY) || ""
  );

  const [utilisateur, setUtilisateur] = useState(null);

  const [identifiantConnexion, setIdentifiantConnexion] = useState("");
  const [motDePasseConnexion, setMotDePasseConnexion] = useState("");

  const [connexionEnCours, setConnexionEnCours] = useState(false);
  const [erreurConnexion, setErreurConnexion] = useState("");

  const [typeInscription, setTypeInscription] = useState("email");
  const [nomInscription, setNomInscription] = useState("");
  const [emailInscription, setEmailInscription] = useState("");
  const [telephoneInscription, setTelephoneInscription] = useState("");
  const [motDePasseInscription, setMotDePasseInscription] = useState("");
  const [confirmationMotDePasseInscription, setConfirmationMotDePasseInscription] = useState("");
  const [inscriptionEnCours, setInscriptionEnCours] = useState(false);
  const [erreurInscription, setErreurInscription] = useState("");
  const [succesInscription, setSuccesInscription] = useState("");

  const [classe, setClasse] = useState("");
  const [serie, setSerie] = useState("");
  const [matiere, setMatiere] = useState("");

  const [exercices, setExercices] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  const [exerciceActuel, setExerciceActuel] = useState(0);
  const [reponses, setReponses] = useState({});

  const [resultat, setResultat] = useState(null);
  const [correctionEnCours, setCorrectionEnCours] = useState(false);

  const [examens, setExamens] = useState([]);
  const [chargementExamens, setChargementExamens] = useState(false);
  const [erreurExamens, setErreurExamens] = useState("");

  const [rechercheExamen, setRechercheExamen] = useState("");
  const [filtreClasseExamen, setFiltreClasseExamen] = useState("");

  const [examenSelectionne, setExamenSelectionne] = useState(null);
  const [questionsExamen, setQuestionsExamen] = useState([]);
  const [questionExamenActuelle, setQuestionExamenActuelle] = useState(0);
  const [reponsesExamen, setReponsesExamen] = useState({});
  const [chargementQuestionsExamen, setChargementQuestionsExamen] = useState(false);
  const [erreurQuestionsExamen, setErreurQuestionsExamen] = useState("");
  const [correctionExamenEnCours, setCorrectionExamenEnCours] = useState(false);
  const [resultatExamen, setResultatExamen] = useState(null);

  const [historique, setHistorique] = useState([]);

  const [titreExamen, setTitreExamen] = useState("");
  const [descriptionExamen, setDescriptionExamen] = useState("");
  const [classeExamen, setClasseExamen] = useState("");
  const [publicExamen, setPublicExamen] = useState(true);
  const [creationExamenEnCours, setCreationExamenEnCours] = useState(false);
  const [erreurCreationExamen, setErreurCreationExamen] = useState("");
  const [examenCree, setExamenCree] = useState(null);

  const [texteQuestion, setTexteQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [bonneReponse, setBonneReponse] = useState("");
  const [explicationQuestion, setExplicationQuestion] = useState("");
  const [ajoutQuestionEnCours, setAjoutQuestionEnCours] = useState(false);
  const [erreurAjoutQuestion, setErreurAjoutQuestion] = useState("");

  useEffect(() => {
    try {
      const historiqueSauvegarde = localStorage.getItem(HISTORIQUE_KEY);
      if (historiqueSauvegarde) {
        const donnees = JSON.parse(historiqueSauvegarde);
        if (Array.isArray(donnees)) {
          setHistorique(donnees);
        }
      }
    } catch (error) {
      console.error("Impossible de charger l'historique local :", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORIQUE_KEY, JSON.stringify(historique));
    } catch (error) {
      console.error("Impossible de sauvegarder l'historique local :", error);
    }
  }, [historique]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    chargerUtilisateurConnecte();
  }, []);

  function sauvegarderTokens(nouveauAccessToken, nouveauRefreshToken) {
    if (nouveauAccessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, nouveauAccessToken);
      setAccessToken(nouveauAccessToken);
    }
    if (nouveauRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, nouveauRefreshToken);
      setRefreshToken(nouveauRefreshToken);
    }
  }

  function supprimerTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken("");
    setRefreshToken("");
    setUtilisateur(null);
  }

  function reinitialiserInscription() {
    setNomInscription("");
    setEmailInscription("");
    setTelephoneInscription("");
    setMotDePasseInscription("");
    setConfirmationMotDePasseInscription("");
    setErreurInscription("");
    setSuccesInscription("");
  }

  async function sinscrire() {
    setErreurInscription("");
    setSuccesInscription("");

    if (!nomInscription.trim()) {
      setErreurInscription("Veuillez saisir votre nom.");
      return;
    }

    if (typeInscription === "email") {
      if (!emailInscription.trim()) {
        setErreurInscription("Veuillez saisir votre adresse email.");
        return;
      }
    }

    if (typeInscription === "telephone") {
      if (!telephoneInscription.trim()) {
        setErreurInscription("Veuillez saisir votre numéro de téléphone.");
        return;
      }
    }

    if (!motDePasseInscription) {
      setErreurInscription("Veuillez saisir un mot de passe.");
      return;
    }

    if (motDePasseInscription !== confirmationMotDePasseInscription) {
      setErreurInscription("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setInscriptionEnCours(true);

    try {
      const endpoint =
        typeInscription === "email"
          ? "/auth/register/email"
          : "/auth/register/telephone";

      const corps =
        typeInscription === "email"
          ? {
              nom: nomInscription.trim(),
              email: emailInscription.trim(),
              mot_de_passe: motDePasseInscription,
            }
          : {
              nom: nomInscription.trim(),
              telephone: telephoneInscription.trim(),
              mot_de_passe: motDePasseInscription,
            };

      const response = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });

      const data = await response.json();

      if (!response.ok) {
        let message = "Impossible de créer le compte.";
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((element) => (element.msg ? element.msg : "Donnée invalide."))
            .join(" ");
        }
        throw new Error(message);
      }

      setSuccesInscription("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setMotDePasseInscription("");
      setConfirmationMotDePasseInscription("");

      setTimeout(() => {
        setIdentifiantConnexion(
          typeInscription === "email"
            ? emailInscription.trim()
            : telephoneInscription.trim()
        );
        reinitialiserInscription();
        setPage("connexion");
      }, 1200);
    } catch (error) {
      console.error(error);
      setErreurInscription(error.message || "Impossible de créer le compte.");
    } finally {
      setInscriptionEnCours(false);
    }
  }

  async function seConnecter() {
    if (!identifiantConnexion.trim()) {
      setErreurConnexion("Veuillez saisir votre email ou votre numéro de téléphone.");
      return;
    }

    if (!motDePasseConnexion) {
      setErreurConnexion("Veuillez saisir votre mot de passe.");
      return;
    }

    setConnexionEnCours(true);
    setErreurConnexion("");

    try {
      const response = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifiant: identifiantConnexion.trim(),
          mot_de_passe: motDePasseConnexion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Identifiant ou mot de passe incorrect.");
      }

      sauvegarderTokens(data.access_token, data.refresh_token);
      setMotDePasseConnexion("");
      setErreurConnexion("");

      await chargerUtilisateurConnecte(data.access_token);
      setPage("accueil");
    } catch (error) {
      console.error(error);
      setErreurConnexion(error.message || "Impossible de se connecter.");
    } finally {
      setConnexionEnCours(false);
    }
  }

  async function chargerUtilisateurConnecte(tokenAUtiliser = accessToken) {
    if (!tokenAUtiliser) {
      return;
    }

    try {
      const response = await fetch(API_URL + "/auth/me", {
        headers: { Authorization: "Bearer " + tokenAUtiliser },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setUtilisateur(data);
    } catch (error) {
      console.error("Impossible de récupérer l'utilisateur connecté :", error);
    }
  }

  async function rafraichirAccessToken() {
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(API_URL + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        supprimerTokens();
        return null;
      }

      sauvegarderTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } catch (error) {
      console.error("Impossible de renouveler le token :", error);
      return null;
    }
  }

  async function fetchAuthentifiee(url, options = {}) {
    let token = accessToken;

    if (!token) {
      throw new Error("Vous devez être connecté pour effectuer cette action.");
    }

    const optionsAvecToken = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: "Bearer " + token,
      },
    };

    let response = await fetch(url, optionsAvecToken);

    if (response.status === 401) {
      const nouveauToken = await rafraichirAccessToken();

      if (!nouveauToken) {
        throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
      }

      token = nouveauToken;

      response = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: "Bearer " + token,
        },
      });
    }

    return response;
  }

  function seDeconnecter() {
    supprimerTokens();
    setPage("accueil");
    setErreurConnexion("");
    setIdentifiantConnexion("");
    setMotDePasseConnexion("");
  }

  function ajouterHistorique(resultatHistorique) {
    const nouvelleEntree = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...resultatHistorique,
    };

    setHistorique((ancienHistorique) => [nouvelleEntree, ...ancienHistorique]);
  }

  function effacerHistorique() {
    const confirmation = window.confirm("Voulez-vous vraiment effacer tout votre historique ?");
    if (!confirmation) {
      return;
    }
    setHistorique([]);
  }

  const classesCollege = ["6e", "5e", "4e", "3e"];
  const classesLycee = ["2nde", "1ère", "Terminale"];
  const toutesLesClasses = [...classesCollege, ...classesLycee];

  const matieresCollege = {
    "6e": ["Maths", "SVT", "Histoire-Géographie"],
    "5e": ["Maths", "SVT", "Histoire-Géographie"],
    "4e": ["Maths", "Physique-Chimie", "SVT", "Histoire-Géographie"],
    "3e": ["Maths", "Physique-Chimie", "SVT", "Histoire-Géographie"],
  };

  const matieresScientifique = [
    "Histoire-Géographie",
    "SVT",
    "Maths",
    "Physique-Chimie",
    "Philosophie",
    "Français",
  ];

  const matieresLitteraire = [
    "Français",
    "Maths",
    "Anglais",
    "Allemand",
    "Histoire-Géographie",
    "Philosophie",
  ];

  useEffect(() => {
    if (!classe || !matiere) {
      return;
    }
    chargerExercices();
  }, [classe, serie, matiere]);

  useEffect(() => {
    if (page === "examens") {
      chargerExamens();
    }
  }, [page]);

  async function chargerExercices() {
    setChargement(true);
    setErreur("");
    setExercices([]);
    setExerciceActuel(0);
    setReponses({});
    setResultat(null);

    try {
      let url = API_URL + "/exercices/classe/" + encodeURIComponent(classe);

      if (serie) {
        url += "?serie=" + encodeURIComponent(serie);
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des exercices.");
      }

      const data = await response.json();
      const exercicesFiltres = data.filter((exercice) => exercice.matiere === matiere);

      setExercices(exercicesFiltres);

      if (exercicesFiltres.length === 0) {
        setErreur("Aucun exercice disponible pour cette matière.");
      }
    } catch (error) {
      console.error(error);
      setErreur("Impossible de charger les exercices. Vérifie que le serveur FastAPI est bien lancé.");
    } finally {
      setChargement(false);
    }
  }

  async function chargerExamens() {
    setChargementExamens(true);
    setErreurExamens("");

    try {
      const response = await fetch(API_URL + "/examens/");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des examens.");
      }

      const data = await response.json();
      setExamens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErreurExamens("Impossible de charger les examens. Vérifie que le serveur FastAPI est bien lancé.");
    } finally {
      setChargementExamens(false);
    }
  }

  async function ouvrirExamen(examen) {
    setExamenSelectionne(examen);
    setQuestionsExamen([]);
    setQuestionExamenActuelle(0);
    setReponsesExamen({});
    setResultatExamen(null);
    setErreurQuestionsExamen("");
    setChargementQuestionsExamen(true);
    setPage("examen_questions");

    try {
      const response = await fetch(
        API_URL + "/questions/examen/" + encodeURIComponent(examen.id)
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des questions.");
      }

      const data = await response.json();
      setQuestionsExamen(Array.isArray(data) ? data : []);

      if (data.length === 0) {
        setErreurQuestionsExamen("Cet examen ne contient aucune question.");
      }
    } catch (error) {
      console.error(error);
      setErreurQuestionsExamen("Impossible de charger les questions de cet examen.");
    } finally {
      setChargementQuestionsExamen(false);
    }
  }

  function choisirReponseExamen(questionId, reponse) {
    setReponsesExamen((anciennesReponses) => {
      if (anciennesReponses[questionId]) {
        return anciennesReponses;
      }
      return { ...anciennesReponses, [questionId]: reponse };
    });
  }

  function questionExamenSuivante() {
    if (questionExamenActuelle < questionsExamen.length - 1) {
      setQuestionExamenActuelle(questionExamenActuelle + 1);
    }
  }

  function questionExamenPrecedente() {
    if (questionExamenActuelle > 0) {
      setQuestionExamenActuelle(questionExamenActuelle - 1);
    }
  }

  async function terminerExamen() {
    if (questionsExamen.length === 0) {
      return;
    }

    const toutesLesReponses = questionsExamen.every(
      (question) => reponsesExamen[question.id]
    );

    if (!toutesLesReponses) {
      alert("Veuillez répondre à toutes les questions avant de terminer l'examen.");
      return;
    }

    setCorrectionExamenEnCours(true);
    setErreurQuestionsExamen("");

    try {
      const resultats = [];

      for (const question of questionsExamen) {
        const response = await fetch(API_URL + "/reponses/visiteur", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: question.id,
            reponse: reponsesExamen[question.id],
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'envoi d'une réponse.");
        }

        const data = await response.json();

        resultats.push({
          question: question,
          reponseDonnee: reponsesExamen[question.id],
          estCorrecte: data.est_correcte,
          bonneReponse: data.bonne_reponse || null,
          explication: data.explication || null,
        });
      }

      const bonnesReponses = resultats.filter(
        (resultatQuestion) => resultatQuestion.estCorrecte
      ).length;

      const mauvaisesReponses = resultats.length - bonnesReponses;

      const pourcentage =
        resultats.length > 0
          ? Math.round((bonnesReponses / resultats.length) * 10000) / 100
          : 0;

      const nouveauResultatExamen = {
        score: bonnesReponses + "/" + resultats.length,
        pourcentage: pourcentage,
        totalQuestions: resultats.length,
        bonnesReponses: bonnesReponses,
        mauvaisesReponses: mauvaisesReponses,
        corrections: resultats,
      };

      setResultatExamen(nouveauResultatExamen);

      ajouterHistorique({
        type: "Examen",
        titre: examenSelectionne?.titre || "Examen sans titre",
        classe: examenSelectionne?.classe || "",
        score: nouveauResultatExamen.score,
        pourcentage: nouveauResultatExamen.pourcentage,
      });

      setPage("resultat_examen");
    } catch (error) {
      console.error(error);
      setErreurQuestionsExamen("Impossible de corriger l'examen. Vérifie que le serveur FastAPI est bien lancé.");
    } finally {
      setCorrectionExamenEnCours(false);
    }
  }

  function retourAuxExamens() {
    setPage("examens");
    setExamenSelectionne(null);
    setQuestionsExamen([]);
    setQuestionExamenActuelle(0);
    setReponsesExamen({});
    setResultatExamen(null);
    setErreurQuestionsExamen("");
  }

  function allerAccueil() {
    setPage("accueil");
    setClasse("");
    setSerie("");
    setMatiere("");
    setExercices([]);
    setReponses({});
    setExerciceActuel(0);
    setResultat(null);
    setExamenSelectionne(null);
    setQuestionsExamen([]);
    setQuestionExamenActuelle(0);
    setReponsesExamen({});
    setResultatExamen(null);
  }

  function allerExercices() {
    setPage("classes");
    setClasse("");
    setSerie("");
    setMatiere("");
    setExercices([]);
    setReponses({});
    setExerciceActuel(0);
    setResultat(null);
  }

  function choisirClasse(nomClasse) {
    setClasse(nomClasse);
    setSerie("");
    setMatiere("");
    setExercices([]);
    setReponses({});
    setExerciceActuel(0);
    setResultat(null);

    if (classesCollege.includes(nomClasse)) {
      setPage("matieres");
    } else {
      setPage("series");
    }
  }

  function choisirSerie(nomSerie) {
    setSerie(nomSerie);
    setMatiere("");
    setExercices([]);
    setReponses({});
    setExerciceActuel(0);
    setResultat(null);
    setPage("matieres");
  }

  function choisirMatiere(nomMatiere) {
    setMatiere(nomMatiere);
    setExercices([]);
    setReponses({});
    setExerciceActuel(0);
    setResultat(null);
    setPage("questions");
  }

  function choisirReponse(exerciceId, reponse) {
    setReponses((anciennesReponses) => {
      if (anciennesReponses[exerciceId]) {
        return anciennesReponses;
      }
      return { ...anciennesReponses, [exerciceId]: reponse };
    });
  }

  function exerciceSuivant() {
    if (exerciceActuel < exercices.length - 1) {
      setExerciceActuel(exerciceActuel + 1);
    }
  }

  function exercicePrecedent() {
    if (exerciceActuel > 0) {
      setExerciceActuel(exerciceActuel - 1);
    }
  }

  async function corrigerExercices() {
    if (exercices.length === 0) {
      return;
    }

    const toutesLesReponses = exercices.every((exercice) => reponses[exercice.id]);

    if (!toutesLesReponses) {
      alert("Veuillez répondre à toutes les questions avant de terminer.");
      return;
    }

    setCorrectionEnCours(true);
    setErreur("");

    const reponsesEnvoyees = exercices.map((exercice) => ({
      exercice_id: exercice.id,
      reponse: reponses[exercice.id] || null,
    }));

    try {
      const response = await fetch(API_URL + "/exercices/corriger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reponsesEnvoyees),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la correction des exercices.");
      }

      const data = await response.json();
      setResultat(data);

      ajouterHistorique({
        type: "Exercices",
        titre: "Entraînement d'exercices",
        classe: classe,
        serie: serie,
        matiere: matiere,
        score: data.score,
        pourcentage: data.pourcentage,
      });

      setPage("resultat");
    } catch (error) {
      console.error(error);
      setErreur("Impossible de corriger les exercices. Vérifie que le serveur FastAPI est bien lancé.");
    } finally {
      setCorrectionEnCours(false);
    }
  }

  function retourAuxMatieres() {
    setPage("matieres");
    setExercices([]);
    setReponses({});
    setExerciceActuel(0);
    setResultat(null);
  }

  function getMatieres() {
    if (classesCollege.includes(classe)) {
      return matieresCollege[classe] || [];
    }
    if (serie === "scientifique") {
      return matieresScientifique;
    }
    if (serie === "littéraire") {
      return matieresLitteraire;
    }
    return [];
  }

  function calculerStatistiques() {
    const totalTentatives = historique.length;

    if (totalTentatives === 0) {
      return { totalTentatives: 0, meilleurScore: 0, moyenne: 0 };
    }

    const pourcentages = historique
      .map((element) => Number(element.pourcentage))
      .filter((valeur) => Number.isFinite(valeur));

    const meilleurScore = pourcentages.length > 0 ? Math.max(...pourcentages) : 0;

    const moyenne =
      pourcentages.length > 0
        ? Math.round(
            (pourcentages.reduce((total, valeur) => total + valeur, 0) / pourcentages.length) * 100
          ) / 100
        : 0;

    return { totalTentatives, meilleurScore, moyenne };
  }

  async function creerExamen() {
    if (!accessToken) {
      setErreurCreationExamen("Vous devez être connecté pour créer un examen.");
      setPage("connexion");
      return;
    }

    if (!titreExamen.trim()) {
      alert("Veuillez saisir le titre de l'examen.");
      return;
    }

    if (!classeExamen) {
      alert("Veuillez sélectionner une classe.");
      return;
    }

    setCreationExamenEnCours(true);
    setErreurCreationExamen("");
    setExamenCree(null);

    try {
      const response = await fetchAuthentifiee(API_URL + "/examens/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: titreExamen.trim(),
          description: descriptionExamen.trim() || null,
          classe: classeExamen,
          public: publicExamen,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Impossible de créer l'examen.");
      }

      setExamenCree(data);
      setTitreExamen("");
      setDescriptionExamen("");
      setClasseExamen("");
      setPublicExamen(true);

      await chargerExamens();
    } catch (error) {
      console.error(error);
      setErreurCreationExamen(error.message || "Impossible de créer l'examen.");
    } finally {
      setCreationExamenEnCours(false);
    }
  }

  function reinitialiserFormulaireQuestion() {
    setTexteQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setBonneReponse("");
    setExplicationQuestion("");
  }

  async function ajouterQuestion() {
    if (!accessToken) {
      setErreurAjoutQuestion("Vous devez être connecté pour ajouter une question.");
      setPage("connexion");
      return;
    }

    if (!examenCree) {
      return;
    }

    if (!texteQuestion.trim()) {
      alert("Veuillez saisir la question.");
      return;
    }

    if (!optionA.trim()) {
      alert("Veuillez saisir l'option A.");
      return;
    }

    if (!optionB.trim()) {
      alert("Veuillez saisir l'option B.");
      return;
    }

    if (!optionC.trim()) {
      alert("Veuillez saisir l'option C.");
      return;
    }

    if (!optionD.trim()) {
      alert("Veuillez saisir l'option D.");
      return;
    }

    if (!bonneReponse) {
      alert("Veuillez sélectionner la bonne réponse.");
      return;
    }

    setAjoutQuestionEnCours(true);
    setErreurAjoutQuestion("");

    try {
      const response = await fetchAuthentifiee(API_URL + "/questions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texte: texteQuestion.trim(),
          option_a: optionA.trim(),
          option_b: optionB.trim(),
          option_c: optionC.trim(),
          option_d: optionD.trim(),
          bonne_reponse: bonneReponse,
          explication: explicationQuestion.trim() || null,
          examen_id: examenCree.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Impossible d'ajouter la question.");
      }

      reinitialiserFormulaireQuestion();
      alert("Question ajoutée avec succès.");
    } catch (error) {
      console.error(error);
      setErreurAjoutQuestion(error.message || "Impossible d'ajouter la question.");
    } finally {
      setAjoutQuestionEnCours(false);
    }
  }

  const statistiques = calculerStatistiques();

  const examensFiltres = examens.filter((examen) => {
    const recherche = rechercheExamen.trim().toLowerCase();

    const correspondRecherche =
      !recherche ||
      (examen.titre || "").toLowerCase().includes(recherche) ||
      (examen.description || "").toLowerCase().includes(recherche);

    const correspondClasse = !filtreClasseExamen || examen.classe === filtreClasseExamen;

    return correspondRecherche && correspondClasse;
  });

  const exercice = exercices.length > 0 ? exercices[exerciceActuel] : null;
  const questionExamen =
    questionsExamen.length > 0 ? questionsExamen[questionExamenActuelle] : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff7ed",
        color: "#222",
      }}
    >
      <header style={{ backgroundColor: "#1f2937", color: "white", padding: "20px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, cursor: "pointer" }} onClick={allerAccueil}>
            X_Exam
          </h1>

          <nav style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="button" onClick={allerAccueil} style={buttonStyle}>
              Accueil
            </button>

            <button type="button" onClick={allerExercices} style={buttonStyle}>
              Exercices
            </button>

            <button type="button" onClick={() => setPage("examens")} style={buttonStyle}>
              Examens
            </button>

            <button type="button" onClick={() => setPage("creer_examen")} style={buttonStyle}>
              Créer un examen
            </button>

            <button type="button" onClick={() => setPage("historique")} style={buttonStyle}>
              Historique
            </button>

            {utilisateur ? (
              <>
                <span
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#374151",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  👤 {utilisateur.nom || utilisateur.email || utilisateur.telephone || "Connecté"}
                </span>

                <button type="button" onClick={seDeconnecter} style={buttonStyle}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setErreurInscription("");
                    setSuccesInscription("");
                    setPage("inscription");
                  }}
                  style={buttonStyle}
                >
                  Inscription
                </button>

                <button type="button" onClick={() => setPage("connexion")} style={primaryButtonStyle}>
                  Connexion
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" }}>
        {page === "accueil" && (
          <section>
            <div style={{ ...cardStyle, textAlign: "center", padding: "45px 25px" }}>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "10px",
                  color: "#ea580c",
                }}
              >
                Plateforme éducative
              </p>

              <h2 style={{ fontSize: "36px", margin: "10px 0" }}>Bienvenue sur X_Exam</h2>

              <p style={{ maxWidth: "700px", margin: "0 auto 25px", fontSize: "18px", lineHeight: "1.6" }}>
                Avec X_Exam, entraînez-vous, passez des examens et suivez vos résultats pour mieux
                préparer votre réussite scolaire.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                <button type="button" onClick={allerExercices} style={primaryButtonStyle}>
                  📚 Commencer les exercices
                </button>

                <button type="button" onClick={() => setPage("examens")} style={secondaryButtonStyle}>
                  📝 Voir les examens
                </button>

                <button type="button" onClick={() => setPage("historique")} style={secondaryButtonStyle}>
                  📊 Voir mon historique
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "25px",
              }}
            >
              <div style={statCardStyle}>
                <div style={statIconStyle}>📚</div>
                <div style={statNumberStyle}>{statistiques.totalTentatives}</div>
                <div style={statLabelStyle}>Tentatives réalisées</div>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>🏆</div>
                <div style={statNumberStyle}>{statistiques.meilleurScore}%</div>
                <div style={statLabelStyle}>Meilleur score</div>
              </div>

              <div style={statCardStyle}>
                <div style={statIconStyle}>📈</div>
                <div style={statNumberStyle}>{statistiques.moyenne}%</div>
                <div style={statLabelStyle}>Moyenne des résultats</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <div style={cardStyle}>
                <h3>📚 Entraînement</h3>
                <p style={{ lineHeight: "1.6" }}>
                  Choisissez votre classe, votre série et votre matière, puis entraînez-vous avec des
                  exercices adaptés à votre niveau.
                </p>
                <button type="button" onClick={allerExercices} style={primaryButtonStyle}>
                  S'entraîner
                </button>
              </div>

              <div style={cardStyle}>
                <h3>📝 Examens</h3>
                <p style={{ lineHeight: "1.6" }}>
                  Consultez les examens publics disponibles, répondez aux questions et obtenez votre
                  résultat automatiquement.
                </p>
                <button type="button" onClick={() => setPage("examens")} style={primaryButtonStyle}>
                  Passer un examen
                </button>
              </div>

              <div style={cardStyle}>
                <h3>➕ Création</h3>
                <p style={{ lineHeight: "1.6" }}>Créez votre propre examen et ajoutez-y vos questions.</p>
                <button type="button" onClick={() => setPage("creer_examen")} style={primaryButtonStyle}>
                  Créer un examen
                </button>
              </div>

              <div style={cardStyle}>
                <h3>📊 Progression</h3>
                <p style={{ lineHeight: "1.6" }}>
                  Retrouvez vos résultats précédents dans votre historique et suivez votre progression.
                </p>
                <button type="button" onClick={() => setPage("historique")} style={secondaryButtonStyle}>
                  Consulter l'historique
                </button>
              </div>
            </div>

            <div style={{ ...cardStyle, marginTop: "20px", textAlign: "center" }}>
              <h3>🎓 Du collège au lycée</h3>
              <p style={{ lineHeight: "1.6" }}>X_Exam accompagne les élèves de la 6e à la Terminale.</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "15px",
                }}
              >
                {toutesLesClasses.map((nomClasse) => (
                  <span key={nomClasse} style={classBadgeStyle}>
                    {nomClasse}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === "connexion" && (
          <section>
            <button type="button" onClick={allerAccueil} style={backButtonStyle}>
              ← Retour à l'accueil
            </button>

            <div style={{ ...cardStyle, maxWidth: "550px", margin: "0 auto 20px" }}>
              <h2>🔐 Connexion à X_Exam</h2>

              <p style={{ lineHeight: "1.6" }}>
                Connectez-vous pour créer un examen et ajouter vos questions.
              </p>

              <label style={labelStyle}>Email ou téléphone</label>
              <input
                type="text"
                value={identifiantConnexion}
                onChange={(event) => setIdentifiantConnexion(event.target.value)}
                placeholder="Votre email ou numéro de téléphone"
                style={inputStyle}
              />

              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                value={motDePasseConnexion}
                onChange={(event) => setMotDePasseConnexion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    seConnecter();
                  }
                }}
                placeholder="Votre mot de passe"
                style={inputStyle}
              />

              {erreurConnexion && (
                <div style={{ ...errorBoxStyle, marginTop: "20px" }}>{erreurConnexion}</div>
              )}

              <button
                type="button"
                onClick={seConnecter}
                disabled={connexionEnCours}
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                  marginTop: "20px",
                  opacity: connexionEnCours ? 0.7 : 1,
                }}
              >
                {connexionEnCours ? "Connexion..." : "Se connecter"}
              </button>

              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <p>Vous n'avez pas encore de compte ?</p>

                <button
                  type="button"
                  onClick={() => {
                    reinitialiserInscription();
                    setPage("inscription");
                  }}
                  style={secondaryButtonStyle}
                >
                  Créer un compte
                </button>
              </div>
            </div>
          </section>
        )}

        {page === "inscription" && (
          <section>
            <button type="button" onClick={allerAccueil} style={backButtonStyle}>
              ← Retour à l'accueil
            </button>

            <div style={{ ...cardStyle, maxWidth: "600px", margin: "0 auto 20px" }}>
              <h2>📝 Créer un compte X_Exam</h2>

              <p style={{ lineHeight: "1.6", color: "#4b5563" }}>
                Choisissez votre méthode d'inscription.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  margin: "20px 0 25px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setTypeInscription("email");
                    setErreurInscription("");
                    setSuccesInscription("");
                  }}
                  style={{
                    ...choiceButtonStyle,
                    padding: "18px 12px",
                    backgroundColor: typeInscription === "email" ? "#ffedd5" : "white",
                    border: typeInscription === "email" ? "2px solid #f97316" : "1px solid #fed7aa",
                  }}
                >
                  📧
                  <br />
                  Inscription par email
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTypeInscription("telephone");
                    setErreurInscription("");
                    setSuccesInscription("");
                  }}
                  style={{
                    ...choiceButtonStyle,
                    padding: "18px 12px",
                    backgroundColor: typeInscription === "telephone" ? "#ffedd5" : "white",
                    border:
                      typeInscription === "telephone" ? "2px solid #f97316" : "1px solid #fed7aa",
                  }}
                >
                  📱
                  <br />
                  Inscription par téléphone
                </button>
              </div>

              <label style={labelStyle}>Nom</label>
              <input
                type="text"
                value={nomInscription}
                onChange={(event) => setNomInscription(event.target.value)}
                placeholder="Votre nom"
                style={inputStyle}
              />

              {typeInscription === "email" && (
                <>
                  <label style={labelStyle}>Adresse email</label>
                  <input
                    type="email"
                    value={emailInscription}
                    onChange={(event) => setEmailInscription(event.target.value)}
                    placeholder="exemple@email.com"
                    style={inputStyle}
                  />
                </>
              )}

              {typeInscription === "telephone" && (
                <>
                  <label style={labelStyle}>Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={telephoneInscription}
                    onChange={(event) => setTelephoneInscription(event.target.value)}
                    placeholder="Votre numéro de téléphone"
                    style={inputStyle}
                  />
                </>
              )}

              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                value={motDePasseInscription}
                onChange={(event) => setMotDePasseInscription(event.target.value)}
                placeholder="Choisissez un mot de passe"
                style={inputStyle}
              />

              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmationMotDePasseInscription}
                onChange={(event) => setConfirmationMotDePasseInscription(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sinscrire();
                  }
                }}
                placeholder="Répétez votre mot de passe"
                style={inputStyle}
              />

              {erreurInscription && (
                <div style={{ ...errorBoxStyle, marginTop: "20px" }}>{erreurInscription}</div>
              )}

              {succesInscription && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    border: "1px solid #86efac",
                    marginTop: "20px",
                  }}
                >
                  {succesInscription}
                </div>
              )}

              <button
                type="button"
                onClick={sinscrire}
                disabled={inscriptionEnCours}
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                  marginTop: "20px",
                  opacity: inscriptionEnCours ? 0.7 : 1,
                }}
              >
                {inscriptionEnCours ? "Création du compte..." : "Créer mon compte"}
              </button>

              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <p>Vous avez déjà un compte ?</p>

                <button
                  type="button"
                  onClick={() => {
                    setErreurConnexion("");
                    setPage("connexion");
                  }}
                  style={secondaryButtonStyle}
                >
                  Se connecter
                </button>
              </div>
            </div>
          </section>
        )}

        {page === "classes" && (
          <section>
            <h2>Choisissez votre classe</h2>
            <div style={gridStyle}>
              {toutesLesClasses.map((nomClasse) => (
                <button
                  type="button"
                  key={nomClasse}
                  onClick={() => choisirClasse(nomClasse)}
                  style={choiceButtonStyle}
                >
                  {nomClasse}
                </button>
              ))}
            </div>
          </section>
        )}

        {page === "series" && (
          <section>
            <button type="button" onClick={allerExercices} style={backButtonStyle}>
              ← Retour aux classes
            </button>

            <h2>Choisissez votre série</h2>

            <div style={gridStyle}>
              <button type="button" onClick={() => choisirSerie("scientifique")} style={choiceButtonStyle}>
                Série scientifique
              </button>

              <button type="button" onClick={() => choisirSerie("littéraire")} style={choiceButtonStyle}>
                Série littéraire
              </button>
            </div>
          </section>
        )}

        {page === "matieres" && (
          <section>
            <button
              type="button"
              onClick={() => (classesCollege.includes(classe) ? allerExercices() : setPage("series"))}
              style={backButtonStyle}
            >
              ← Retour
            </button>

            <h2>
              {classe}
              {serie ? " - " + serie : ""}
            </h2>

            <p>Choisissez une matière :</p>

            <div style={gridStyle}>
              {getMatieres().map((nomMatiere) => (
                <button
                  type="button"
                  key={nomMatiere}
                  onClick={() => choisirMatiere(nomMatiere)}
                  style={choiceButtonStyle}
                >
                  {nomMatiere}
                </button>
              ))}
            </div>
          </section>
        )}

        {page === "questions" && (
          <section>
            <button type="button" onClick={retourAuxMatieres} style={backButtonStyle}>
              ← Retour aux matières
            </button>

            <h2>
              {matiere} - {classe}
              {serie ? " - " + serie : ""}
            </h2>

            {chargement && (
              <div style={cardStyle}>
                <p>Chargement des exercices...</p>
              </div>
            )}

            {erreur && (
              <div style={{ ...cardStyle, border: "1px solid #dc2626" }}>
                <p>{erreur}</p>
              </div>
            )}

            {!chargement && !erreur && exercices.length === 0 && (
              <div style={cardStyle}>
                <p>Aucun exercice disponible.</p>
              </div>
            )}

            {!chargement && exercice && (
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>
                    Question {exerciceActuel + 1} / {exercices.length}
                  </strong>
                  <span>{exercice.chapitre}</span>
                </div>

                <h3 style={{ lineHeight: "1.5" }}>{exercice.texte}</h3>

                <div style={{ display: "grid", gap: "12px", marginTop: "25px" }}>
                  {[
                    ["A", exercice.option_a],
                    ["B", exercice.option_b],
                    ["C", exercice.option_c],
                    ["D", exercice.option_d],
                  ].map(([lettre, option]) => {
                    const selectionnee = reponses[exercice.id] === lettre;
                    const dejaRepondu = Boolean(reponses[exercice.id]);

                    return (
                      <button
                        type="button"
                        key={lettre}
                        onClick={() => choisirReponse(exercice.id, lettre)}
                        disabled={dejaRepondu}
                        style={{
                          ...optionButtonStyle,
                          backgroundColor: selectionnee ? "#ffedd5" : "white",
                          borderColor: selectionnee ? "#f97316" : "#d1d5db",
                          cursor: dejaRepondu ? "not-allowed" : "pointer",
                          opacity: dejaRepondu && !selectionnee ? 0.65 : 1,
                        }}
                      >
                        <strong>{lettre}.</strong> {option}
                      </button>
                    );
                  })}
                </div>

                {reponses[exercice.id] && (
                  <p style={{ marginTop: "15px", fontWeight: "bold", color: "#ea580c" }}>
                    Réponse enregistrée : {reponses[exercice.id]}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "30px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={exercicePrecedent}
                    disabled={exerciceActuel === 0}
                    style={secondaryButtonStyle}
                  >
                    ← Précédent
                  </button>

                  {exerciceActuel < exercices.length - 1 ? (
                    <button
                      type="button"
                      onClick={exerciceSuivant}
                      disabled={!reponses[exercice.id]}
                      style={primaryButtonStyle}
                    >
                      Suivant →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={corrigerExercices}
                      disabled={correctionEnCours || !reponses[exercice.id]}
                      style={primaryButtonStyle}
                    >
                      {correctionEnCours ? "Correction..." : "Terminer et corriger"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {page === "resultat" && resultat && (
          <section>
            <div style={cardStyle}>
              <h2>Résultat</h2>

              <div style={{ fontSize: "30px", fontWeight: "bold", margin: "20px 0", color: "#ea580c" }}>
                {resultat.score}
              </div>

              <p>
                Pourcentage : <strong>{resultat.pourcentage}%</strong>
              </p>

              <p>
                Questions :{" "}
                <strong>
                  {resultat.questions_repondues} / {resultat.total_questions}
                </strong>
              </p>

              <p>
                Bonnes réponses : <strong>{resultat.bonnes_reponses}</strong>
              </p>

              <p>
                Mauvaises réponses : <strong>{resultat.mauvaises_reponses}</strong>
              </p>
            </div>

            {resultat.corrections && resultat.corrections.length > 0 && (
              <section>
                <h2>Corrections</h2>

                {resultat.corrections.map((correction, index) => (
                  <div key={index} style={cardStyle}>
                    <h3>Question {index + 1}</h3>
                    <p>
                      <strong>Question :</strong> {correction.question}
                    </p>
                    <p>
                      <strong>Votre réponse :</strong> {correction.reponse_donnee}
                    </p>
                    <p>
                      <strong>Bonne réponse :</strong> {correction.bonne_reponse}
                    </p>
                    <p>
                      <strong>Explication :</strong> {correction.explication}
                    </p>
                  </div>
                ))}
              </section>
            )}

            <button type="button" onClick={retourAuxMatieres} style={primaryButtonStyle}>
              ← Retour aux matières
            </button>
          </section>
        )}

        {page === "examens" && (
          <section>
            <h2>Examens publics</h2>

            <div style={{ ...cardStyle, marginBottom: "25px" }}>
              <h3 style={{ marginTop: 0 }}>🔎 Rechercher un examen</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "15px",
                }}
              >
                <input
                  type="text"
                  value={rechercheExamen}
                  onChange={(event) => setRechercheExamen(event.target.value)}
                  placeholder="Titre ou description..."
                  style={inputStyle}
                />

                <select
                  value={filtreClasseExamen}
                  onChange={(event) => setFiltreClasseExamen(event.target.value)}
                  style={inputStyle}
                >
                  <option value="">Toutes les classes</option>
                  {toutesLesClasses.map((nomClasse) => (
                    <option key={nomClasse} value={nomClasse}>
                      {nomClasse}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginTop: "18px",
                }}
              >
                <p style={{ margin: 0, color: "#6b7280" }}>
                  <strong>{examensFiltres.length}</strong> examen{examensFiltres.length !== 1 ? "s" : ""}{" "}
                  trouvé{examensFiltres.length !== 1 ? "s" : ""}
                </p>

                {(rechercheExamen || filtreClasseExamen) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRechercheExamen("");
                      setFiltreClasseExamen("");
                    }}
                    style={secondaryButtonStyle}
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>

            {chargementExamens && (
              <div style={cardStyle}>
                <p>Chargement des examens...</p>
              </div>
            )}

            {erreurExamens && (
              <div style={{ ...cardStyle, border: "1px solid #dc2626" }}>
                <p>{erreurExamens}</p>
              </div>
            )}

            {!chargementExamens && !erreurExamens && examens.length === 0 && (
              <div style={cardStyle}>
                <p>Aucun examen public disponible pour le moment.</p>
              </div>
            )}

            {!chargementExamens && !erreurExamens && examens.length > 0 && examensFiltres.length === 0 && (
              <div style={cardStyle}>
                <h3>Aucun examen trouvé</h3>
                <p>Aucun examen ne correspond à votre recherche ou à votre filtre.</p>
                <button
                  type="button"
                  onClick={() => {
                    setRechercheExamen("");
                    setFiltreClasseExamen("");
                  }}
                  style={primaryButtonStyle}
                >
                  Afficher tous les examens
                </button>
              </div>
            )}

            {!chargementExamens && !erreurExamens && examensFiltres.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {examensFiltres.map((examen) => (
                  <div key={examen.id} style={cardStyle}>
                    <h3>{examen.titre}</h3>
                    {examen.description && <p>{examen.description}</p>}
                    <p>
                      Classe : <strong>{examen.classe}</strong>
                    </p>
                    <p>
                      Statut : <strong>{examen.public ? "Public" : "Privé"}</strong>
                    </p>
                    <button type="button" onClick={() => ouvrirExamen(examen)} style={primaryButtonStyle}>
                      Ouvrir l'examen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "creer_examen" && (
          <section>
            <button type="button" onClick={allerAccueil} style={backButtonStyle}>
              ← Retour à l'accueil
            </button>

            <h2>Créer un examen</h2>

            {!utilisateur && (
              <div style={{ ...cardStyle, border: "1px solid #f59e0b", backgroundColor: "#fffbeb" }}>
                <h3>🔐 Connexion requise</h3>
                <p style={{ lineHeight: "1.6" }}>
                  Pour créer un examen,
                  vous devez être connecté.
                </p>
                <button type="button" onClick={() => setPage("connexion")} style={primaryButtonStyle}>
                  Se connecter
                </button>
              </div>
            )}

            {utilisateur && (
              <>
                <div style={cardStyle}>
                  <p style={{ lineHeight: "1.6" }}>
                    Vous êtes connecté en tant que{" "}
                    <strong>
                      {utilisateur.nom || utilisateur.email || utilisateur.telephone || "utilisateur"}
                    </strong>
                    .
                  </p>

                  <p style={{ lineHeight: "1.6" }}>
                    Créez votre examen puis
                    ajoutez vos questions. Le
                    backend déterminera
                    automatiquement
                    l'utilisateur de l'examen.
                  </p>

                  <label style={labelStyle}>Titre de l'examen</label>
                  <input
                    type="text"
                    value={titreExamen}
                    onChange={(event) => setTitreExamen(event.target.value)}
                    placeholder="Exemple : Examen de mathématiques - 3e"
                    style={inputStyle}
                  />

                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={descriptionExamen}
                    onChange={(event) => setDescriptionExamen(event.target.value)}
                    placeholder="Description de l'examen..."
                    style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  />

                  <label style={labelStyle}>Classe</label>
                  <select
                    value={classeExamen}
                    onChange={(event) => setClasseExamen(event.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Sélectionner une classe</option>
                    {toutesLesClasses.map((nomClasse) => (
                      <option key={nomClasse} value={nomClasse}>
                        {nomClasse}
                      </option>
                    ))}
                  </select>

                  <label
                    style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={publicExamen}
                      onChange={(event) => setPublicExamen(event.target.checked)}
                    />
                    Rendre cet examen public
                  </label>

                  {erreurCreationExamen && (
                    <div style={{ ...errorBoxStyle, marginTop: "20px" }}>{erreurCreationExamen}</div>
                  )}

                  <button
                    type="button"
                    onClick={creerExamen}
                    disabled={creationExamenEnCours}
                    style={{
                      ...primaryButtonStyle,
                      marginTop: "20px",
                      opacity: creationExamenEnCours ? 0.7 : 1,
                    }}
                  >
                    {creationExamenEnCours ? "Création..." : "Créer l'examen"}
                  </button>
                </div>

                {examenCree && (
                  <div style={{ ...cardStyle, border: "2px solid #16a34a" }}>
                    <h3 style={{ color: "#15803d" }}>✅ Examen créé avec succès</h3>
                    <p>
                      <strong>ID :</strong> {examenCree.id}
                    </p>
                    <p>
                      <strong>Titre :</strong> {examenCree.titre}
                    </p>
                    <p>
                      <strong>Classe :</strong> {examenCree.classe}
                    </p>
                    <p>
                      <strong>Public :</strong> {examenCree.public ? "Oui" : "Non"}
                    </p>
                    <p>L'examen est maintenant prêt à recevoir des questions.</p>
                  </div>
                )}

                {examenCree && (
                  <div style={cardStyle}>
                    <h2>➕ Ajouter une question</h2>

                    <label style={labelStyle}>Question</label>
                    <textarea
                      value={texteQuestion}
                      onChange={(event) => setTexteQuestion(event.target.value)}
                      placeholder="Écrivez la question..."
                      style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                    />

                    <label style={labelStyle}>Option A</label>
                    <input
                      type="text"
                      value={optionA}
                      onChange={(event) => setOptionA(event.target.value)}
                      style={inputStyle}
                    />

                    <label style={labelStyle}>Option B</label>
                    <input
                      type="text"
                      value={optionB}
                      onChange={(event) => setOptionB(event.target.value)}
                      style={inputStyle}
                    />

                    <label style={labelStyle}>Option C</label>
                    <input
                      type="text"
                      value={optionC}
                      onChange={(event) => setOptionC(event.target.value)}
                      style={inputStyle}
                    />

                    <label style={labelStyle}>Option D</label>
                    <input
                      type="text"
                      value={optionD}
                      onChange={(event) => setOptionD(event.target.value)}
                      style={inputStyle}
                    />

                    <label style={labelStyle}>Bonne réponse</label>
                    <select
                      value={bonneReponse}
                      onChange={(event) => setBonneReponse(event.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Sélectionner la bonne réponse</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>

                    <label style={labelStyle}>Explication (facultatif)</label>
                    <textarea
                      value={explicationQuestion}
                      onChange={(event) => setExplicationQuestion(event.target.value)}
                      placeholder="Explication de la réponse..."
                      style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                    />

                    {erreurAjoutQuestion && (
                      <div style={{ ...errorBoxStyle, marginTop: "20px" }}>{erreurAjoutQuestion}</div>
                    )}

                    <button
                      type="button"
                      onClick={ajouterQuestion}
                      disabled={ajoutQuestionEnCours}
                      style={{
                        ...primaryButtonStyle,
                        marginTop: "20px",
                        opacity: ajoutQuestionEnCours ? 0.7 : 1,
                      }}
                    >
                      {ajoutQuestionEnCours ? "Ajout..." : "Ajouter la question"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {page === "examen_questions" && (
          <section>
            <button type="button" onClick={retourAuxExamens} style={backButtonStyle}>
              ← Retour aux examens
            </button>

            {examenSelectionne && (
              <div style={cardStyle}>
                <h2>{examenSelectionne.titre}</h2>
                {examenSelectionne.description && <p>{examenSelectionne.description}</p>}
                <p>
                  Classe : <strong>{examenSelectionne.classe}</strong>
                </p>
              </div>
            )}

            {chargementQuestionsExamen && (
              <div style={cardStyle}>
                <p>Chargement des questions...</p>
              </div>
            )}

            {erreurQuestionsExamen && (
              <div style={{ ...cardStyle, border: "1px solid #dc2626" }}>
                <p>{erreurQuestionsExamen}</p>
              </div>
            )}

            {!chargementQuestionsExamen && !erreurQuestionsExamen && questionExamen && (
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>
                    Question {questionExamenActuelle + 1} / {questionsExamen.length}
                  </strong>
                  <span>Examen public</span>
                </div>

                <h3 style={{ lineHeight: "1.6" }}>{questionExamen.texte}</h3>

                <div style={{ display: "grid", gap: "12px", marginTop: "25px" }}>
                  {[
                    ["A", questionExamen.option_a],
                    ["B", questionExamen.option_b],
                    ["C", questionExamen.option_c],
                    ["D", questionExamen.option_d],
                  ].map(([lettre, option]) => {
                    const selectionnee = reponsesExamen[questionExamen.id] === lettre;
                    const dejaRepondu = Boolean(reponsesExamen[questionExamen.id]);

                    return (
                      <button
                        type="button"
                        key={lettre}
                        onClick={() => choisirReponseExamen(questionExamen.id, lettre)}
                        disabled={dejaRepondu}
                        style={{
                          ...optionButtonStyle,
                          backgroundColor: selectionnee ? "#ffedd5" : "white",
                          borderColor: selectionnee ? "#f97316" : "#d1d5db",
                          cursor: dejaRepondu ? "not-allowed" : "pointer",
                          opacity: dejaRepondu && !selectionnee ? 0.65 : 1,
                        }}
                      >
                        <strong>{lettre}.</strong> {option}
                      </button>
                    );
                  })}
                </div>

                {reponsesExamen[questionExamen.id] && (
                  <p style={{ marginTop: "15px", fontWeight: "bold", color: "#ea580c" }}>
                    Réponse enregistrée : {reponsesExamen[questionExamen.id]}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "30px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={questionExamenPrecedente}
                    disabled={questionExamenActuelle === 0}
                    style={secondaryButtonStyle}
                  >
                    ← Précédente
                  </button>

                  {questionExamenActuelle < questionsExamen.length - 1 ? (
                    <button
                      type="button"
                      onClick={questionExamenSuivante}
                      disabled={!reponsesExamen[questionExamen.id]}
                      style={primaryButtonStyle}
                    >
                      Suivante →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={terminerExamen}
                      disabled={correctionExamenEnCours || !reponsesExamen[questionExamen.id]}
                      style={primaryButtonStyle}
                    >
                      {correctionExamenEnCours ? "Correction..." : "Terminer l'examen"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {page === "resultat_examen" && resultatExamen && (
          <section>
            <div style={cardStyle}>
              <h2>Résultat de l'examen</h2>

              <h3 style={{ fontSize: "32px", margin: "20px 0", color: "#ea580c" }}>
                {resultatExamen.score}
              </h3>

              <p>
                Pourcentage : <strong>{resultatExamen.pourcentage}%</strong>
              </p>

              <p>
                Nombre de questions : <strong>{resultatExamen.totalQuestions}</strong>
              </p>

              <p>
                Bonnes réponses : <strong>{resultatExamen.bonnesReponses}</strong>
              </p>

              <p>
                Mauvaises réponses : <strong>{resultatExamen.mauvaisesReponses}</strong>
              </p>
            </div>

            <h2>Correction de l'examen</h2>

            {resultatExamen.corrections.map((correction, index) => (
              <div key={correction.question.id} style={cardStyle}>
                <h3>Question {index + 1}</h3>
                <p>
                  <strong>{correction.question.texte}</strong>
                </p>
                <p>
                  Votre réponse : <strong>{correction.reponseDonnee}</strong>
                </p>
                <p>
                  Résultat : <strong>{correction.estCorrecte ? "Correcte" : "Incorrecte"}</strong>
                </p>
                {correction.bonneReponse && (
                  <p>
                    Bonne réponse : <strong>{correction.bonneReponse}</strong>
                  </p>
                )}
                {correction.explication && <p>Explication : {correction.explication}</p>}
              </div>
            ))}

            <button type="button" onClick={retourAuxExamens} style={primaryButtonStyle}>
              ← Retour aux examens
            </button>
          </section>
        )}

        {page === "historique" && (
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ marginBottom: "5px" }}>Historique des résultats</h2>
                <p style={{ marginTop: 0 }}>Vos résultats sont enregistrés uniquement sur cet appareil.</p>
              </div>

              {historique.length > 0 && (
                <button type="button" onClick={effacerHistorique} style={dangerButtonStyle}>
                  Effacer l'historique
                </button>
              )}
            </div>

            {historique.length === 0 ? (
              <div style={cardStyle}>
                <h3>Aucun résultat enregistré</h3>
                <p>Lorsque vous terminerez un exercice ou un examen, votre résultat apparaîtra ici.</p>
                <button type="button" onClick={allerExercices} style={primaryButtonStyle}>
                  Commencer les exercices
                </button>
              </div>
            ) : (
              <div>
                {historique.map((element) => {
                  const dateFormatee = new Date(element.date).toLocaleString("fr-FR");

                  return (
                    <div key={element.id} style={cardStyle}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "15px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 10px",
                              borderRadius: "20px",
                              backgroundColor: "#ffedd5",
                              color: "#c2410c",
                              fontSize: "13px",
                              fontWeight: "bold",
                              marginBottom: "10px",
                            }}
                          >
                            {element.type}
                          </span>

                          <h3 style={{ margin: "5px 0" }}>{element.titre}</h3>

                          {element.classe && (
                            <p>
                              Classe : <strong>{element.classe}</strong>
                            </p>
                          )}

                          {element.serie && (
                            <p>
                              Série : <strong>{element.serie}</strong>
                            </p>
                          )}

                          {element.matiere && (
                            <p>
                              Matière : <strong>{element.matiere}</strong>
                            </p>
                          )}

                          <p style={{ color: "#6b7280", fontSize: "14px" }}>{dateFormatee}</p>
                        </div>

                        <div style={{ textAlign: "center", minWidth: "130px" }}>
                          <div style={{ fontSize: "28px", fontWeight: "bold" }}>{element.score}</div>
                          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "5px", color: "#ea580c" }}>
                            {element.pourcentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button type="button" onClick={allerAccueil} style={secondaryButtonStyle}>
              ← Retour à l'accueil
            </button>
          </section>
        )}
      </main>

      <footer
        style={{
          marginTop: "40px",
          padding: "25px",
          textAlign: "center",
          backgroundColor: "#1f2937",
          color: "white",
        }}
      >
        <p style={{ margin: 0 }}>X_Exam — Avec X_Exam, réussir votre examen.</p>
      </footer>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "white",
  color: "#1f2937",
};

const primaryButtonStyle = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "#f97316",
  color: "white",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  border: "1px solid #fdba74",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "white",
  color: "#c2410c",
};

const dangerButtonStyle = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "#dc2626",
  color: "white",
  fontWeight: "bold",
};

const backButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #fdba74",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "white",
  color: "#c2410c",
  marginBottom: "20px",
};

const choiceButtonStyle = {
  padding: "25px 20px",
  border: "1px solid #fed7aa",
  borderRadius: "12px",
  cursor: "pointer",
  backgroundColor: "white",
  color: "#9a3412",
  fontSize: "18px",
  fontWeight: "bold",
};

const optionButtonStyle = {
  padding: "16px",
  border: "2px solid #d1d5db",
  borderRadius: "10px",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "16px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #fdba74",
  borderRadius: "8px",
  fontSize: "16px",
  backgroundColor: "white",
  outline: "none",
  marginBottom: "15px",
};

const labelStyle = {
  display: "block",
  fontWeight: "bold",
  marginBottom: "8px",
  marginTop: "15px",
};

const errorBoxStyle = {
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  border: "1px solid #fca5a5",
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "25px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "15px",
  marginTop: "20px",
};

const statCardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "22px",
  textAlign: "center",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
};

const statIconStyle = {
  fontSize: "28px",
  marginBottom: "8px",
};

const statNumberStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "5px",
  color: "#281d18",
};

const statLabelStyle = {
  color: "#6b7280",
  fontSize: "14px",
};

const classBadgeStyle = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "20px",
  backgroundColor: "#ffedd5",
  color: "#c2410c",
  fontWeight: "bold",
  fontSize: "14px",
};

export default App;