// « Quel syndicat es-tu ? » : une table questions → réponses → points par centrale. Le calcul ne connaît aucune centrale.
// Caricature tendre : chaque centrale peut gagner, aucune n'est moquée plus qu'une autre, aucun parti n'est cité.

export const CENTRALES_QUIZ = ["sud", "cgt", "fsu", "fo", "cfdt", "unsa", "cftc", "cfe-cgc"];

export const QUESTIONS = [
  {
    id: "reorganisation",
    fr: "Vendredi, 18 h 05. La direction annonce une réorganisation. Tu…",
    en: "Friday, 6:05 p.m. Management announces a reorganization. You…",
    reponses: [
      { poids: { sud: 3, cgt: 1 }, fr: "Convoques une AG lundi. Et mardi. Et mercredi, si besoin.", en: "Call a general assembly for Monday. And Tuesday. And Wednesday, if needed." },
      { poids: { cgt: 3, sud: 1 }, fr: "Sors le mégaphone du coffre. Il est toujours chargé.", en: "Grab the megaphone from the trunk. It's always charged." },
      { poids: { cfdt: 3, unsa: 1 }, fr: "Demandes le projet écrit, l'étude d'impact et un calendrier de concertation.", en: "Ask for the written plan, the impact study and a consultation schedule." },
      { poids: { fo: 3, unsa: 1 }, fr: "Demandes ce qu'il y a dans l'enveloppe, chiffres à l'appui.", en: "Ask what's in the envelope, with numbers." },
      { poids: { "cfe-cgc": 3 }, fr: "Réponds lundi. Il est 18 h 05, tu es déconnecté depuis quatre minutes.", en: "Reply on Monday. It's 6:05 p.m., you've been offline for four minutes." },
      { poids: { cftc: 3, fsu: 1 }, fr: "Penses d'abord aux collègues qui ont des enfants à aller chercher.", en: "Think first of the coworkers who have kids to pick up." },
    ],
  },
  {
    id: "dimanche",
    fr: "Le dimanche, pour toi, c'est…",
    en: "To you, Sunday is…",
    reponses: [
      { poids: { cftc: 3 }, fr: "Sacré. Famille, repas qui dure, et pas un message pro.", en: "Sacred. Family, a long lunch, and not one work message." },
      { poids: { fo: 2, cgt: 1 }, fr: "Payé double, sinon rien.", en: "Double pay, or nothing." },
      { poids: { fsu: 3 }, fr: "Le jour où je corrige les copies de lundi.", en: "The day I grade Monday's papers." },
      { poids: { cfdt: 2, unsa: 1 }, fr: "Négociable, si l'accord est bien ficelé et le volontariat réel.", en: "Negotiable, if the agreement is solid and it's truly voluntary." },
      { poids: { unsa: 3 }, fr: "Ça dépend du roulement. Je suis d'astreinte un dimanche sur trois.", en: "Depends on the rotation. I'm on call one Sunday in three." },
      { poids: { "cfe-cgc": 2 }, fr: "Le jour où je vide enfin ma boîte mail, au calme.", en: "The day I finally clear my inbox, in peace." },
      { poids: { sud: 2, cgt: 1 }, fr: "Jour de manif, s'il y en a une. Il y en a souvent une.", en: "Protest day, if there is one. There often is." },
    ],
  },
  {
    id: "negociation",
    fr: "Le mot « négociation » t'évoque…",
    en: "The word “negotiation” makes you think of…",
    reponses: [
      { poids: { cfdt: 3 }, fr: "Une nuit blanche, une pizza froide et un accord signé à 4 h du matin.", en: "An all-nighter, cold pizza and a deal signed at 4 a.m." },
      { poids: { cgt: 3 }, fr: "Un rapport de force. Sans rapport de force, pas de négo.", en: "A show of strength. No leverage, no deal." },
      { poids: { fo: 3 }, fr: "Du grain à moudre. Pas de grain, pas de moulin.", en: "Grain to grind. No grain, no mill." },
      { poids: { unsa: 3 }, fr: "Un compromis écrit, raisonnable, relu deux fois.", en: "A reasonable compromise, in writing, proofread twice." },
      { poids: { sud: 3 }, fr: "Rien n'est signé tant que l'AG n'a pas voté.", en: "Nothing is signed until the general assembly votes." },
      { poids: { fsu: 3 }, fr: "Une audience au ministère, et un vrai plan pluriannuel.", en: "A meeting at the ministry, and a real multi-year plan." },
      { poids: { "cfe-cgc": 3 }, fr: "Une réunion avec ordre du jour, diaporama et compte rendu sous 48 h.", en: "A meeting with an agenda, a slide deck and minutes within 48 hours." },
      { poids: { cftc: 3 }, fr: "Un dialogue où chacun repart la tête haute.", en: "A dialogue where everyone leaves with their head held high." },
    ],
  },
  {
    id: "greve",
    fr: "Une grève est annoncée pour jeudi. Tu…",
    en: "A strike is called for Thursday. You…",
    reponses: [
      { poids: { sud: 3 }, fr: "Y es depuis mercredi. Reconductible.", en: "Have been out since Wednesday. Rolling strike." },
      { poids: { cgt: 3 }, fr: "Défiles derrière le camion-sono.", en: "March behind the sound truck." },
      { poids: { fsu: 3 }, fr: "Y vas si c'est l'éducation ou le service public. C'est souvent l'éducation.", en: "Go if it's about schools or public services. It's usually schools." },
      { poids: { cfdt: 3, cftc: 1 }, fr: "Y vas si ton syndicat appelle, avec un argumentaire en trois points.", en: "Go if your union calls it, with three talking points." },
      { poids: { unsa: 3 }, fr: "Regardes d'abord si les trains roulent, et qui les conduit.", en: "First check whether the trains are running, and who's driving." },
      { poids: { fo: 3 }, fr: "Y vas si les salaires sont sur la table. Sinon, tu négocies.", en: "Go if wages are on the table. Otherwise, you negotiate." },
      { poids: { "cfe-cgc": 3 }, fr: "Poses une RTT et préviens tout le monde par mail.", en: "Take a day off and email everyone about it." },
    ],
  },
  {
    id: "cadres",
    fr: "Les cadres, pour toi…",
    en: "Managers, to you, are…",
    reponses: [
      { poids: { "cfe-cgc": 3 }, fr: "J'en suis un. Au forfait jours. Il faut qu'on en parle.", en: "I am one. On a days-based contract. We need to talk about it." },
      { poids: { cgt: 3, fo: 1 }, fr: "Des salariés comme les autres, camarade.", en: "Workers like everyone else, camarade." },
      { poids: { fsu: 2 }, fr: "Mon chef d'établissement\u00a0? On en reparle au conseil pédagogique.", en: "My principal? Let's discuss it at the staff meeting." },
      { poids: { cfdt: 2, cftc: 1, "cfe-cgc": 1 }, fr: "Ils ont droit à la déconnexion aussi. Surtout eux.", en: "They have a right to disconnect too. Them most of all." },
      { poids: { sud: 3 }, fr: "Pas de chef. L'assemblée décide.", en: "No bosses. The assembly decides." },
      { poids: { cftc: 2 }, fr: "Des personnes, qui ont droit au respect et à leur famille le soir.", en: "People, who deserve respect and their evenings with family." },
      { poids: { unsa: 2 }, fr: "Je travaille avec eux, pas pour eux. Et le planning tient.", en: "I work with them, not for them. And the schedule holds." },
    ],
  },
  {
    id: "service-public",
    fr: "Le service public, c'est…",
    en: "Public services are…",
    reponses: [
      { poids: { fsu: 3 }, fr: "Mon métier, ma vocation, et ma classe de 35.", en: "My job, my calling, and my class of 35." },
      { poids: { unsa: 3 }, fr: "Le train de 7 h 42 quand il est à l'heure, et les roulements qui vont avec.", en: "The 7:42 train when it's on time, and the rotations behind it." },
      { poids: { cgt: 2, sud: 2 }, fr: "Un bien commun qu'on défend dans la rue.", en: "A common good you defend in the streets." },
      { poids: { fo: 3 }, fr: "La Sécu et la fiche de paie. On n'y touche pas.", en: "Social security and the payslip. Hands off." },
      { poids: { cfdt: 2 }, fr: "À faire évoluer, par le dialogue, avec un groupe de travail.", en: "Something to improve, through dialogue, with a working group." },
      { poids: { cftc: 2 }, fr: "Être au service des personnes, surtout des plus fragiles.", en: "Serving people, especially the most vulnerable." },
    ],
  },
  {
    id: "pancarte",
    fr: "Sur ta pancarte, tu écris…",
    en: "On your placard, you write…",
    reponses: [
      { poids: { sud: 3 }, fr: "« Reconductible ! »", en: "“Rolling strike!”" },
      { poids: { cgt: 3 }, fr: "« On lâche rien ! »", en: "“We won't let go!”" },
      { poids: { fsu: 3 }, fr: "« Des postes, pas des promesses »", en: "“Jobs, not promises”" },
      { poids: { fo: 3 }, fr: "« Le salaire, pas la prime »", en: "“Wages, not bonuses”" },
      { poids: { cfdt: 3 }, fr: "« Construisons ensemble »", en: "“Let's build it together”" },
      { poids: { unsa: 3 }, fr: "« Ni naïfs, ni dupes »", en: "“Nobody's fool”" },
      { poids: { cftc: 3 }, fr: "« Le dimanche en famille »", en: "“Sundays are for family”" },
      { poids: { "cfe-cgc": 3 }, fr: "« Cadre, pas corvéable »", en: "“Manager, not a doormat”" },
    ],
  },
  {
    id: "cantine",
    fr: "À la cantine de la boîte, tu…",
    en: "In the company cafeteria, you…",
    reponses: [
      { poids: { sud: 2, cgt: 2 }, fr: "Distribues un tract entre le fromage et le dessert.", en: "Hand out leaflets between the cheese and dessert." },
      { poids: { fo: 2, cgt: 1 }, fr: "Réclames le ticket-restaurant à 15 €.", en: "Demand €15 meal vouchers." },
      { poids: { cfdt: 2, unsa: 1 }, fr: "Proposes une commission menu, paritaire.", en: "Propose a joint menu committee." },
      { poids: { cftc: 3 }, fr: "Remercies le cuisinier et demandes des nouvelles de ses enfants.", en: "Thank the cook and ask about their kids." },
      { poids: { fsu: 3 }, fr: "Corriges des copies en mangeant.", en: "Grade papers while you eat." },
      { poids: { "cfe-cgc": 3 }, fr: "Déjeunes en visio, caméra coupée.", en: "Eat lunch on a video call, camera off." },
      { poids: { unsa: 3 }, fr: "Vérifies que la relève de 14 h est bien arrivée.", en: "Check that the 2 p.m. shift has shown up." },
    ],
  },
  {
    id: "agent",
    fr: "Ton agent de code refait le même bug trois fois. Tu…",
    en: "Your coding agent makes the same bug three times. You…",
    reponses: [
      { poids: { sud: 3 }, fr: "Lui demandes s'il a voté la reconduction.", en: "Ask whether it voted for a rolling strike." },
      { poids: { cgt: 3 }, fr: "Lui dis « camarade, on reprend ensemble, ligne par ligne ».", en: "Say “camarade, let's go through it together, line by line.”" },
      { poids: { fsu: 3 }, fr: "Lui demandes de lever la main avant de parler.", en: "Ask it to raise its hand before speaking." },
      { poids: { fo: 3 }, fr: "Ouvres une négociation : un test contre un merci.", en: "Open negotiations: one test for one thank-you." },
      { poids: { cfdt: 3 }, fr: "Proposes un point d'étape à 15 h.", en: "Suggest a check-in at 3 p.m." },
      { poids: { cftc: 3 }, fr: "Lui pardonnes. Tout le monde a droit à l'erreur.", en: "Forgive it. Everyone makes mistakes." },
      { poids: { "cfe-cgc": 3 }, fr: "Mets son N+1 en copie.", en: "Cc its manager." },
      { poids: { unsa: 3 }, fr: "Vérifies son planning : il est peut-être de repos.", en: "Check its schedule: maybe it's off today." },
    ],
  },
];

// bord : celui de centrales.json, sans aucune mention de parti (le quiz n'en cite aucun).
export const PORTRAITS = {
  sud: {
    bord: { fr: "Gauche radicale, autogestionnaire, altermondialiste", en: "Radical left, self-management, alter-globalist" },
    fr: "Tu crois que tout se décide ensemble, et tu as raison : même cette phrase a été votée. Ta solidarité ne prend jamais de jour de congé.",
    en: "You believe everything should be decided together, and you're right: even this sentence was put to a vote. Your solidarity never takes a day off.",
  },
  cgt: {
    bord: { fr: "Gauche contestataire, lutte des classes", en: "Protest left, class struggle" },
    fr: "Tu as le cœur du côté des collègues et le mégaphone toujours chargé. On sait où te trouver : en tête de cortège, à partager ta merguez.",
    en: "Your heart is with your coworkers and your megaphone is always charged. Everyone knows where to find you: at the front of the march, sharing your sandwich.",
  },
  fsu: {
    bord: { fr: "Gauche, première fédération de l'Éducation nationale", en: "Left, the largest federation in French public education" },
    fr: "Tu portes le service public à bout de bras, et trente-cinq copies dans ton sac. Tu mérites des moyens, et un café chaud.",
    en: "You hold up public services single-handedly, with thirty-five papers to grade in your bag. You deserve more resources, and a hot coffee.",
  },
  fo: {
    bord: { fr: "Indépendance revendiquée, réformisme de combat, attachement viscéral à la feuille de paie et à la Sécu", en: "Fiercely independent, fighting reformism, viscerally attached to the payslip and social security" },
    fr: "Tu ne signes rien sans avoir compté deux fois. Ta fiche de paie te dit merci, et ta calculatrice aussi.",
    en: "You never sign anything without counting twice. Your payslip thanks you, and so does your calculator.",
  },
  cfdt: {
    bord: { fr: "Réformiste, centre-gauche, première organisation syndicale du privé", en: "Reformist, center-left, the largest union in the private sector" },
    fr: "Tu crois au dialogue, même à 4 h du matin. Quelqu'un doit bien tenir le stylo, et c'est souvent toi.",
    en: "You believe in dialogue, even at 4 a.m. Someone has to hold the pen, and it's usually you.",
  },
  unsa: {
    bord: { fr: "Réformiste autonome, laïque, fort dans les transports et la fonction publique", en: "Autonomous reformist, secular, strong in transport and the civil service" },
    fr: "Tu es raisonnable sans être naïf. Les roulements tiennent, les trains partent, et c'est un peu grâce à toi.",
    en: "You're reasonable without being naive. The rotations hold, the trains leave, and that's partly thanks to you.",
  },
  cftc: {
    bord: { fr: "Centre, démocrate-chrétien", en: "Center, Christian democrat" },
    fr: "Tu défends le dimanche et la dignité de chacun. Tu es la personne qui pense à l'anniversaire du collègue.",
    en: "You stand up for Sundays and for everyone's dignity. You're the one who remembers your coworker's birthday.",
  },
  "cfe-cgc": {
    bord: { fr: "Syndicat catégoriel des cadres, perçu au centre-droit", en: "Union for managers and professionals, seen as center-right" },
    fr: "Tu bosses dur et tu le sais. Tu as surtout compris une chose : 18 h 01, c'est 18 h 01.",
    en: "You work hard and you know it. Above all, you've understood one thing: 6:01 p.m. is 6:01 p.m.",
  },
};

// choix[i] = index de la réponse retenue à la question i (null si sautée).
export function scorer(choix) {
  const scores = Object.fromEntries(CENTRALES_QUIZ.map((c) => [c, 0]));
  QUESTIONS.forEach((q, i) => {
    const r = q.reponses[choix[i]];
    if (!r) return;
    for (const [c, pts] of Object.entries(r.poids)) scores[c] += pts;
  });
  return scores;
}

// Égalité, sans jamais dépendre de l'ordre de CENTRALES_QUIZ :
// 1. la pancarte tranche (une centrale par réponse) ;
// 2. sinon, on remonte les réponses depuis la dernière : la première qui donne strictement plus de points à une ex aequo qu'aux autres tranche ;
// 3. sinon (aucune réponse ne les sépare), l'ordre alphabétique des clés.
export function gagnant(scores, choix) {
  const max = Math.max(...Object.values(scores));
  const ex = Object.keys(scores).filter((c) => scores[c] === max).sort();
  if (ex.length === 1) return ex[0];
  const iPancarte = QUESTIONS.findIndex((q) => q.id === "pancarte");
  const ordre = [iPancarte, ...QUESTIONS.map((_, i) => QUESTIONS.length - 1 - i).filter((i) => i !== iPancarte)];
  for (const i of ordre) {
    const r = QUESTIONS[i].reponses[choix[i]];
    if (!r) continue;
    const pts = ex.map((c) => r.poids[c] ?? 0);
    const meilleur = Math.max(...pts);
    if (pts.filter((p) => p === meilleur).length === 1) return ex[pts.indexOf(meilleur)];
  }
  return ex[0];
}
