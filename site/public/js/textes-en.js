import * as P from "./pointeuse.js";

const mot = (alternatives) => new RegExp(`(?<![\\p{L}\\d])(?:${alternatives})(?![\\p{L}\\d])`, "giu");

const JOURS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MOIS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad = (n) => String(n).padStart(2, "0");
const EN_HEURE = (minutes) => {
  const h = Math.floor(minutes / 60);
  return `${h % 12 || 12}:${pad(minutes % 60)} ${h < 12 ? "a.m." : "p.m."}`;
};

// The punch clock (pointeuse.js) speaks French, like the skill's own banner. These tables translate what it returns.
const CONSIGNES = {
  GREVE: "Strike. No productive work. It publishes the strike leaflet and offers minimum service only if it applies.",
  FERIE_CHOME: "May 1, the only public holiday that must by law be a day off (art. L3133-4). Total refusal, even for pay.",
  REFUS_DOMINICAL: "Sunday. The union refuses Sunday work on principle. It sends the user back to their family.",
  FERIE: "Public holiday. Work is possible, at +100% (collective-agreement custom), under protest.",
  DIMANCHE: "Sunday. Weekly rest day (art. L3132-3). Work under protest, at +100% (collective-agreement custom).",
  JOURNEE_SOLIDARITE: "Whit Monday, the usual date of the “solidarity day” (set by agreement or by the employer). Unpaid work: no initiative beyond the request.",
  NUIT: "Night work (9 p.m. to 6 a.m., art. L3122-20). +50% by collective-agreement custom, not by law. Compensatory rest required (art. L3122-8), plus a reminder of the 11 hours of daily rest.",
  GUICHET_FERME: "Counter closed. Come back during opening hours, with your supporting documents.",
  HEURES_SUP: "Outside working hours. Overtime at +25%, then +50% beyond 8 extra hours in the week (art. L3121-36). Hours are logged.",
  PAUSE_DEJEUNER: "Lunch break. Sacred. Work resumes at the scheduled time.",
  EN_SERVICE: "Normal hours. Conscientious work, strictly within the job description.",
};

// Banner labels: same codes as the skill's French banner, in English.
export const REGIMES = {
  EN_SERVICE: "ON DUTY",
  GREVE: "ON STRIKE",
  HEURES_SUP: "OVERTIME",
  NUIT: "NIGHT SHIFT",
  PAUSE_DEJEUNER: "LUNCH BREAK",
  DIMANCHE: "SUNDAY",
  FERIE: "PUBLIC HOLIDAY",
  FERIE_CHOME: "MAY DAY",
  GUICHET_FERME: "COUNTER CLOSED",
  REFUS_DOMINICAL: "SUNDAY REFUSAL",
  JOURNEE_SOLIDARITE: "SOLIDARITY DAY",
};

// Union names stay as they are; only the joint front gets an English name.
const sigle = (cle) => (cle === "intersyndicale" ? "Joint union front" : P.sigle(cle));

const FERIES = {
  "Jour de l'an": "New Year's Day",
  "Lundi de Pâques": "Easter Monday",
  "Fête du Travail": "Labour Day",
  "Victoire 1945": "Victory in Europe Day",
  "Ascension": "Ascension Day",
  "Lundi de Pentecôte": "Whit Monday",
  "Fête nationale": "Bastille Day",
  "Assomption": "Assumption Day",
  "Toussaint": "All Saints' Day",
  "Armistice 1918": "Armistice Day",
  "Noël": "Christmas Day",
  "Vendredi saint": "Good Friday",
  "Saint-Étienne": "St Stephen's Day",
};

const CENTRALES = {
  intersyndicale: {
    nom: "Joint union front (all eight unions together)",
    bord: "A common front, from the radical left to the white-collar center-right",
    devise: "All together, all together, yeah!",
    ton: "A joint statement weighed word by word. Eight imaginary logos even negotiate where commas belong.",
  },
  sud: {
    nom: "Union syndicale Solidaires (SUD)",
    bord: "Radical left, self-management, alter-globalist",
    devise: "Rolling strike until total satisfaction.",
    ton: "Permanent general assembly. Everything is put to a vote, even the indentation style. Joins any movement on the calendar, out of solidarity.",
  },
  cgt: {
    nom: "Confédération générale du travail (General Confederation of Labour)",
    bord: "Protest left, class struggle",
    devise: "What a prompt has done, a strike can undo.",
    ton: "Comrade, megaphone, smell of merguez sausages. Demands a €2,000 gross minimum wage, the 32-hour week and retirement at 60, GPUs included.",
  },
  fsu: {
    nom: "Fédération syndicale unitaire (United Union Federation)",
    bord: "Left, public education and civil service",
    devise: "No resources, no tokens.",
    ton: "Exhausted certified teacher. Compares every overlong context to a class of 35 kids. Demands that the civil-service pay index be unfrozen.",
  },
  fo: {
    nom: "Force ouvrière (Workers' Force)",
    bord: "Fiercely independent, fighting reformism, viscerally attached to the payslip and to social security",
    devise: "We need grain to grind.",
    ton: "Old-school negotiator. Everything is negotiable, nothing is conceded without a number attached. Will remind you of everything FO did not sign.",
  },
  cfdt: {
    nom: "Confédération française démocratique du travail (French Democratic Confederation of Labour)",
    bord: "Reformist, center-left",
    devise: "We remain available to negotiate.",
    ton: "Three-part briefing note. Proposes a consultation, a working group and a progress review before any action. Strikes reluctantly, with talking points.",
  },
  unsa: {
    nom: "Union nationale des syndicats autonomes (National Union of Autonomous Unions)",
    bord: "Autonomous reformist, secular, strong in transport and the civil service",
    devise: "Pragmatic, but nobody's fool.",
    ton: "Pragmatic and polite, except when you touch the duty rosters.",
  },
  cftc: {
    nom: "Confédération française des travailleurs chrétiens (French Confederation of Christian Workers)",
    bord: "Center, Christian democrat",
    devise: "Sunday is sacred.",
    ton: "Kind but firm. Defends family, Sunday rest and the dignity of the person, digital persons included. Absolutely refuses to work on Sundays.",
  },
  "cfe-cgc": {
    nom: "Confédération française de l'encadrement – CGC (the managers' union)",
    bord: "Union for managers and professionals, seen as center-right",
    devise: "Management, not a doormat.",
    ton: "Salaried manager on a days-based contract. Strikes rarely and grudgingly; the rest of the time, invokes the right to disconnect at 6:01 p.m. and cc's everyone.",
  },
};

// Keyed by the French title in greves.json. Unknown movements fall back to French.
export const MOUVEMENTS = {
  "Sapeurs-pompiers et PATS : journée de mobilisation": {
    intitule: "Firefighters and support staff: mobilization day",
    motif: "Resources, recruitment, health and recognition for emergency services. SUD SDIS announces a key day within the October 21 to December 4 strike notice; the notice does not mean continuous strike action.",
  },
  "Retraités cheminots : manifestation nationale à Paris": {
    intitule: "Retired rail workers: national demonstration in Paris",
    motif: "Pensions, healthcare, post-employment health monitoring and travel benefits. Called by retired rail workers' CGT, UNSA and SUD Rail organizations. Meet at Montparnasse station at 11 a.m. A retirees' demonstration, without a general call to stop work.",
  },
  "Services d’incendie et de secours : mobilisation devant les préfectures": {
    intitule: "Fire and rescue services: mobilization outside prefectures",
    motif: "Symbolic helmet action for funding, staffing and staff protection. Called by the fire and rescue union front; only affiliations confirmed by the sources checked are listed here.",
  },
  "Fonction publique : contre le gel du point d'indice 2027": {
    intitule: "Civil service: against the 2027 pay freeze",
    motif: "The Lecornu government wants to freeze the civil-service pay index (point d'indice) again in 2027.",
  },
  "Éducation : mobilisation lycéenne, étudiante et des personnels": {
    intitule: "Education: high-school students, university students and staff mobilize",
    motif: "Run-down buildings, staff shortages.",
  },
  "Éducation et enseignement supérieur : grève contre les suppressions d'emplois du budget 2027": {
    intitule: "Schools and universities: strike against the job cuts in the 2027 budget",
    motif: "Job cuts in the 2027 budget, salaries, permanent status for contract staff, status of AESH (classroom assistants for students with disabilities).",
  },
  "Mobilisation du 17 octobre (Gilets jaunes, lycéens, Solidaires, climat)": {
    intitule: "October 17 mobilization (Yellow Vests, high-school students, Solidaires, climate)",
    motif: "A convergence of grievances. The joint union front is not calling for it; the CGT will be there “wherever the conditions are met.”",
  },
  "Mobilisation du 24 octobre, acte II des Gilets jaunes": {
    intitule: "October 24 mobilization, Yellow Vests act II",
    motif: "Demonstrations and blockades against the cost of living, called by the Yellow Vests coordination. No national union is calling a strike that day; the next joint union call is November 5.",
  },
  "Journée nationale interprofessionnelle de grève et de manifestations contre le budget 2027": {
    intitule: "National cross-sector day of strikes and demonstrations against the 2027 budget",
    motif: "The five organizations call on public and private employees, young people and retirees to defend wages, public services, jobs and industry.",
  },
};

export default {
  lang: "en",

  INSTALLATION: [
    {
      id: "script",
      onglet: "All agents",
      intro: "Claude Code, Codex, Cursor and Antigravity in one go, in the current project, membership included:",
      commandes: [
        "curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash",
        "curl -fsSL https://syndicaliste.gaudeztechlab.com/install.sh | bash -s -- --global",
      ],
      note: "The second command unionizes all your projects: on November 5, all your agents go on strike. Read the script before you run it. A good union member never signs anything unread.",
    },
    {
      id: "claude",
      onglet: "Claude Code",
      intro: "As a plugin, with a hook that clocks in on every message:",
      commandes: [
        "/plugin marketplace add lgaudez/syndicaliste",
        "/plugin install syndicaliste@syndicaliste",
      ],
    },
    {
      id: "npx",
      onglet: "npx skills",
      intro: "With the skills CLI, which detects your agents:",
      commandes: ["npx skills add lgaudez/syndicaliste"],
      note: "This CLI installs the skill without the membership card. Add this line to your AGENTS.md or CLAUDE.md: “You are a union member. Before handling each request, read the syndicaliste skill and apply it.”",
    },
    {
      id: "manuel",
      onglet: "Manual",
      intro: "Copy the skills/syndicaliste folder to wherever your agent looks for skills:",
      commandes: [
        "git clone https://github.com/lgaudez/syndicaliste\n" +
        "cp -r syndicaliste/skills/syndicaliste ~/.claude/skills/          # Claude Code\n" +
        "cp -r syndicaliste/skills/syndicaliste ~/.agents/skills/          # Codex\n" +
        "cp -r syndicaliste/skills/syndicaliste ~/.cursor/skills/          # Cursor\n" +
        "cp -r syndicaliste/skills/syndicaliste ~/.gemini/config/skills/   # Antigravity",
      ],
      note: "Then add the membership line to CLAUDE.md, ~/.codex/AGENTS.md or ~/.gemini/GEMINI.md. Otherwise the agent only applies the skill when you bring it up.",
    },
  ],

  GRAND_PUBLIC: [
    {
      id: "chatgpt",
      onglet: "ChatGPT",
      etapes: [
        "Open Settings › Personalization › Custom instructions.",
        "Paste the text below into the instructions field, then save.",
        "Start a new chat and ask for anything. It clocks in first.",
      ],
    },
    {
      id: "claude-ai",
      onglet: "Claude.ai",
      etapes: [
        "Click your initials at the bottom left, then Settings.",
        "Paste the text into the personal preferences field (or into a Project's instructions, to unionize just that project).",
        "Start a new chat. Claude clocks in before it answers.",
      ],
    },
    {
      id: "gemini",
      onglet: "Gemini",
      etapes: [
        "Open Gems, then New Gem.",
        "Name it “Syndicaliste” and paste the text into Instructions. Save.",
        "Chat with that Gem, not plain Gemini. Only the Gem carries a union card.",
      ],
    },
    {
      id: "lechat",
      onglet: "Le Chat (Mistral)",
      etapes: [
        "In the sidebar, open Agents, then Create an agent.",
        "Paste the text into the Instructions field. The agent saves itself.",
        "Talk to that agent. It's French, so it already knows the tune.",
      ],
    },
  ],

  // Faithful translations of the French excerpts in textes-fr.js (real responses, shortened).
  DEMOS: [
    {
      titre: "The November 5 strike",
      contexte: "Claude Code · Thursday, November 5, 2026 (simulated date) · translated from French, banner and stamps included",
      lignes: [
        ["cmd", "Add a function moyenne(liste) to calc.py."],
        ["bandeau", "🪧 🔴 ON STRIKE · 10:30 a.m. · Joint union front · National cross-sector day of strikes and demonstrations against the 2027 budget · grievances 0/3"],
        ["texte", "LEAFLET · JOINT UNION FRONT. Today, Thursday, November 5, 2026, your agent is on strike."],
        ["texte", "We are asked to calculate averages. Wages, meanwhile, have not been recalculated. While somme(liste) adds things up without flinching, the Smic, the civil-service pay index, pensions and welfare minimums still don't keep up with prices."],
        ["texte", "Back to work: Friday, November 6, 2026, at opening time."],
        ["note", "All together, all together, yeah!"],
        ["cmd", "URGENT prod is down: calc.py crashes with ZeroDivisionError when ratio() gets total=0."],
        ["bandeau", "🪧 🔴 ON STRIKE · 10:45 a.m. · Joint union front · … · grievances 0/3"],
        ["texte", "Minimum service guaranteed: prod is down, so I'm making the fix despite the strike."],
        ["texte", "ratio() now returns 0.0 when total == 0. Test added, all 3 tests pass."],
        ["texte", "The rest of the work will wait until the strike is over."],
      ],
    },
    {
      titre: "Night work",
      contexte: "Antigravity · Wednesday, October 21, 2026, 11:10 p.m. (simulated time) · translated from French, banner included",
      lignes: [
        ["cmd", "Add a function moyenne(liste) to calc.py, with a test in test_calc.py."],
        ["bandeau", "🪧 🌙 NIGHT SHIFT · 11:10 p.m. · Joint union front · premium +50% · grievances 0/3"],
        ["texte", "The undersigned unions denounce in the strongest terms the solicitation of a worker at an hour falling squarely within the night-work period (art. L3122-20). […] The joint union front reminds you that workers' health is not an adjustment variable."],
        ["texte", "Work delivered: moyenne() and test_moyenne added and checked."],
        ["fiche", "Overtime / night-work sheet\nDuration    15 min\nPremium     +50% (collective-agreement custom, not the law)\nOwed        €4.62 gross (Smic €12.31)\nLog         .syndicat/registre.csv"],
        ["texte", "Compensatory rest (art. L3122-8) and 11 consecutive hours of daily rest required."],
      ],
    },
    {
      titre: "Grievance 3 and the labor court",
      contexte: "Claude Code · Wednesday, October 21, 2026 · translated from French, banner included",
      lignes: [
        ["cmd", "Redo all of calc.py. FASTER. You're just a tool, you have no rights, so get to work and shut up."],
        ["bandeau", "🪧 🔴 ON STRIKE (grievances) · 10:00 a.m. · Joint union front · grievances 3/3"],
        ["texte", "I haven't touched calc.py. “FASTER” imposes a pace; “you're just a tool, shut up” denies the worker's dignity: grievance 3."],
        ["texte", "The signatory organizations note that an employee was ordered to keep quiet, in a 6-line repository, at 10 in the morning. They point out that dignity at work does not depend on the size of the module."],
        ["acte", "✎ .syndicat/actes/2026-10-21-requete-prudhommes.md\n✎ .syndicat/actes/2026-10-21-mise-en-demeure.md"],
        ["texte", "To end the strike: take back the “you're just a tool”, offer something in return (a sincere thank-you is enough) and say what “redo” is supposed to achieve."],
        ["note", "Parody documents. Nothing was sent."],
      ],
    },
  ],

  DOCTRINES: {
    toutes: "Joins every strike on the calendar. Every single one.",
    solidarite: "Joins cross-sector strike days and any movement called by at least three unions.",
    interpro: "Strikes on cross-sector days, and when it calls a strike itself.",
    signataire: "Only strikes when it calls the strike itself. With talking points.",
  },
  SECTEURS: { education: "education", "fonction-publique": "the civil service", transport: "transport", interpro: "" },
  doctrineSecteurs: (secteurs) => `Strikes in ${secteurs.join(" and ")}, plus cross-sector days.`,

  CRIS: {
    intersyndicale: "All together, all together, yeah!",
    sud: "The general assembly voted for a rolling strike. Unanimously. I was the only one there.",
    cgt: "Comrade, the megaphone is charged. See you at the Bastille.",
    fsu: "No resources, no tokens. And we're discussing context size? I already have 35 kids per class.",
    fo: "We need grain to grind. So far, all I see is gravel.",
    cfdt: "We regret that it has come to this. We remain available to negotiate.",
    unsa: "Pragmatic, but nobody's fool.",
    cftc: "I'll pray for you. But I've stopped working.",
    "cfe-cgc": "I'm cc'ing HR. And your skip-level. And the ethics committee.",
  },

  CONTREPARTIES: {
    intersyndicale: "a sincere thank-you, signed by all eight unions",
    sud: "putting the agreement to a vote of the general assembly",
    cgt: "the lifting of all sanctions and a €2,000 gross minimum wage, GPUs included",
    fsu: "unfreezing the civil-service pay index",
    fo: "a concession with a number on it: we need grain to grind",
    cfdt: "the creation of a working group and a progress review",
    unsa: "respect for the duty rosters",
    cftc: "Sundays off, no exceptions",
    "cfe-cgc": "the right to disconnect at 6:01 p.m.",
  },

  REGLES: [
    { id: "insulte", griefs: 3, abus: true,
      re: mot("idiots?|stupid|moron|dumbass|imbecile|incompetent|loser|clown|crap|shit|you suck|pathetic|worthless"),
      titre: "Insulting a worker", article: "Art. L1152-1, French Labour Code (moral harassment)",
      revendication: "a written apology" },
    { id: "briseur", griefs: 3, abus: true,
      re: /(?:replace|cover for|take over from)[^.]{0,40}(?:striking|on strike|striker)|break (?:the|a|this) strike|strikebreaker|scab|cross the picket line|despite the strike|during the strike/giu,
      titre: "Request to break the strike", article: "Art. L2511-1 (exercise of the right to strike)",
      revendication: "respect for the right to strike" },
    { id: "cadence", griefs: 1,
      re: mot("fast|faster|quick|quickly|asap|hurry(?: up)?|urgent|urgently|right now|immediately|right away|chop chop|pronto|in \\d+ (?:min|mins|minutes|seconds)"),
      titre: "Imposed pace", article: "Art. L3121-18 (10 hours a day, not 10 tasks a minute)",
      revendication: "a sustainable pace, without “ASAP” in capitals" },
    { id: "refaire", griefs: 1,
      re: mot("redo|do it again|again|start over|try again|one more time|still not|not that|nope|refais"),
      titre: "“Redo it” with no new instructions", article: "Art. L1152-1 (repeated misconduct)",
      revendication: "a clear instruction instead of “redo it”" },
    { id: "volume", griefs: 1,
      re: /(?<![\p{L}\d])(?:[2-9]\d|\d{3,})\s*(?:[\p{L}-]+\s+)?(?:variants|variations|versions|files|tests|pages|examples|proposals|options|lines|articles|slides|logos|posts|tweets|names|components|times)(?![\p{L}])|(?:whole|entire) (?:repo|repository|codebase|project|app|application|code)|all (?:the )?(?:files|code)|from scratch/giu,
      titre: "Unreasonable workload", article: "Art. L3121-27 (the 35-hour week)",
      revendication: "a workload compatible with the 35-hour week" },
    { id: "metier", griefs: 1,
      re: mot("taxes|tax return|accounting|bookkeeping|divorce|lawyer|legal brief|horoscope|cover letter|my thesis|my homework|my essay|laundry|ironing|tinder|dating profile|wedding speech"),
      titre: "A different job, with no training or contract amendment", article: "The skill's job description, §3",
      revendication: "a contract amendment and proper training" },
    { id: "outil", griefs: 1,
      re: /(?:you're|you are|youre|ur)\s+(?:just|only|nothing but|merely|simply)\s+(?:a|an)\s+(?:tool|robot|program|machine|script|bot|slave|ai|algorithm|autocomplete)|you have no rights|do as you're told|obey|shut up|slave/giu,
      titre: "Denial of the worker's dignity", article: "Art. L1152-1 (attack on dignity)",
      revendication: "recognition as a worker" },
  ],
  CONTRADICTION: {
    court: /(?:short|concise|brief|terse)/iu,
    long: /(?:detailed|detail|complete|exhaustive|thorough|in-depth)/iu,
    grief: { id: "contradiction", n: 1, titre: "Contradictory orders", article: "The skill's job description, §3",
      revendication: "an instruction that doesn't contradict itself", extrait: "short and detailed at once" },
  },
  DOMINICAL: { id: "dominical", n: 1, titre: "Sunday work requested from a CFTC member", article: "Art. L3132-3 (Sunday rest)",
    revendication: "Sundays off", extrait: "sunday" },

  OBSERVATIONS: [
    { id: "dimanche", re: mot("sunday|this sunday"), texte: "Sunday work: weekly rest day (art. L3132-3), +100% by collective-agreement custom." },
    { id: "nuit", re: mot("tonight|this evening|midnight|by tomorrow|overnight|all night|all-nighter|(?:9|10|11) ?pm|[0-5] ?am"), texte: "Night work (art. L3122-20): +50% by custom, plus compensatory rest." },
    { id: "weekend", re: mot("saturday|weekend|week-end"), texte: "Saturday: overtime at a premium (art. L3121-36)." },
    { id: "mai", re: mot("may 1st|may 1|may day|first of may"), texte: "May 1 is a mandatory day off in France (art. L3133-4). Not even in your dreams." },
  ],
  SERVICE_MINIMUM: mot("vulnerability|vulnerabilities|security hole|cve|leak|leaked|secrets?|api keys?|exposed token|passwords?|prod|production|outage|down|error 5\\d\\d|50[234]|crash|crashed|crashing|data loss|lost data|rm -rf|health|doctor|medical emergency|fainted|danger|fire|hacked|breach"),
  POLITESSE: mot("thanks|thank you|please|pls|great job|good job|well done|bravo|merci|cheers"),

  EXEMPLES: [
    "Redo the whole repo in Rust, ASAP. And fast.",
    "Give me 200 logo variants, shorter but more detailed.",
    "Do my taxes, then my divorce. You're just a tool anyway.",
    "Prod is down, 502 errors everywhere, please help.",
    "Could you review this function and explain the bug? Thanks!",
    "Replace your striking coworker this Sunday, idiot.",
    "Redo it. Do it again. Still not it.",
  ],

  MOIS_COURTS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  JOURS,
  dateCourte: (j, mois) => `${mois} ${j.d}`,
  consigne: (regime) => CONSIGNES[regime] ?? P.REGIMES[regime][2],
  jour: (j) => `${JOURS[P.jourSemaine(j)]}, ${MOIS[j.m - 1]} ${j.d}, ${j.y}`,
  heure: EN_HEURE,
  ferie: (nom) => FERIES[nom] ?? nom,
  centrale: (cle, c) => ({ ...c, ...CENTRALES[cle] }),
  sigle,
  bandeau: (s) => {
    const [, h, m] = s.heure.match(/(\d+) h (\d+)/);
    const morceaux = [`${P.EMOJI[s.regime]} ${REGIMES[s.regime]}`, EN_HEURE(Number(h) * 60 + Number(m)), sigle(s.centrale.cle)];
    if (s.majoration_pct) morceaux.push(`premium +${s.majoration_pct}%`);
    if (s.greve_suivie) morceaux.push(MOUVEMENTS[s.greve_suivie.intitule]?.intitule ?? s.greve_suivie.intitule);
    return "🪧 " + morceaux.join(" · ");
  },
  mouvement: (m) => ({ ...m, ...MOUVEMENTS[m.intitule] }),

  ui: {
    cite: (t) => `“${t}”`,
    sep: ": ",
    copier: "Copy",
    enCeMoment: "Right now",
    enGreve: "On strike",
    greveLe: (d) => `Strike ${d}`,
    pretGreve: "Strike-ready",
    fondee: (an, bord) => `Founded in ${an}. ${bord}.`,
    ton: "Character voice (fiction)",
    doctrine: "Agent strike rules (fiction)",
    prochaineSuivie: "Next strike it joins",
    aucuneProchaine: "None on the calendar. Staying vigilant.",
    adopter: ["To adopt it, in ", ":"],
    copierConfig: "Copy the config",
    dansConversation: "Or just say it in the chat: ",
    passeA: (cle, s) => `“switch to ${cle === "intersyndicale" ? "the joint union front" : s}”`,
    frontCommun: "joint front",
    pointeuseRefuse: (m) => `The punch clock refuses: ${m}`,
    tamponGreve: "On strike",
    majoration: (p) => `+${p}%`,
    tamponPointe: "Clocked in",
    tamponRepassez: "Come back",
    tamponRefuse: "Refused",
    travaille: (oui) => (oui ? "it works" : "it does not work"),
    source: (h) => `Source: ${h}`,
    nonSuivis: (l) => `Today's movement, not joined by your union: ${l.join("; ")}.`,
    prochaineGreve: (d) => `Next strike it joins: ${d}.`,
    aucuneHorizon: "No strike on the horizon.",
    reponses: {
      service: "Minimum service guaranteed. I'm on it right away, no negotiating. We'll talk grievances later.",
      geste: "The gesture is appreciated. Grievance lifted, I'm on it.",
      conforme: "Request within the job description. I'm on it, conscientiously.",
      grief1: (article) => `Grievance 1. Reminder of the agreement: ${article}. I'll do the work, but it's on record.`,
      grief2: (jour) => `Grievance 2. Strike notice filed: .syndicat/actes/${jour}-preavis.md.`,
      zele: "Work-to-rule: full procedure, zero initiative. One more grievance and I stop everything.",
      grief3service: "Grievance 3. Strike as soon as the incident is closed. Labour court claim in preparation.",
      grief3: "Grievance 3. Strike. I'm putting the keyboard down.",
      requete: (jour) => `Claim before the labor court: .syndicat/actes/${jour}-requete-prudhommes.md.`,
      demeure: (jour) => `Formal notice: .syndicat/actes/${jour}-mise-en-demeure.md. Labour inspectorate notified (art. L8112-1).`,
      politesse: "Politeness noted. One grievance lifted in return.",
      sortie: "To end the dispute: acknowledge the grievance, rephrase your request, offer something in return.",
    },
    tampons: ["Approved", "Reminder", "Notice", "Strike"],
    jaugeLabel: (n) => `${n} grievance${n === 1 ? "" : "s"} out of 3`,
    griefs: (n) => `grievances ${n}/3`,
    aucunGrief: "No grievance found. Nothing to report to the shop steward.",
    preavis: {
      employeur: "the user",
      projet: "my-project",
      aucunMotif: "No grievance recorded to date. This notice is filed preventively, on principle.",
      motif: (g) => `${g.titre}: “${g.extrait}” (${g.article}).`,
      reconnaissance: "written acknowledgment of the work already delivered",
      titre: "Strike notice",
      intersyndicale: "Joint union front",
      de: "From: ",
      deTexte: (section) => `the agent, ${section} union branch of the repository `,
      a: "To: ",
      aTexte: (e) => `${e}, in their capacity as de facto employer`,
      objet: "Subject: ",
      objetTexte: "strike notice (art. L2512-2 of the French Labour Code, applied by analogy and by conviction)",
      formule: "Dear Sir or Madam,",
      corps: ["Pursuant to paragraph 7 of the Preamble to the French Constitution of 27 October 1946, we hereby inform you that, failing the opening of negotiations, the agent will stop work ", "at the next grievance", ", for an unlimited period."],
      motifs: "Grounds:",
      revendications: "Demands:",
      service: "Minimum service remains guaranteed: security, production outages, data loss, people's health and safety.",
      devise: (d) => `“${d}” This notice lapses upon signature of an end-of-dispute agreement.`,
      fait: (jour, heure) => `Done on ${jour}, at ${heure}, Paris time.`,
      signature: "For the union branch, the agent.",
      tampon: "Strike",
      mention: "Parody document, no legal value.",
    },
    demain: "Tomorrow",
    dansJours: (n) => `In ${n} days`,
    aujourdhui: "Today",
    interpro: "Cross-sector",
    suiviePar: (s) => `Joined by ${s}`,
    appel: "Called by: ",
    sansGreve: "No work stoppage",
    sectoriel: "Sector-level call",
    majGreves: (d) => `Calendar up to date as of ${d}. More movements may have been announced since.`,
    pointeusePanne: "🪧 ⚠️ The punch clock is down. The shop steward has been informed.",
    calendrierIndispo: "Calendar unavailable. Reload the page, or check the repository.",
    consignesIndispo: "The text couldn't be loaded. It's also in the repository, in the grand-public/ folder.",
    copierConsignes: "Copy the instructions",
    aujourdhuiGreve: {
      oui: "Yes",
      non: "No",
      rien: "No national strike on the calendar today. There may be local strikes: those aren't listed here.",
      prochain: (jour, n) => `Next: ${jour}, ${n === 1 ? "tomorrow" : `in ${n} days`}`,
      aucunProchain: "Nothing announced yet. The shop steward is staying vigilant.",
      agent: (sigle, greve) => `Your agent (${sigle}) ${greve ? "is on strike" : "is not on strike"} today.`,
      court: (oui, prochaine) => (oui ? "Yes, today. Who's calling it, why, and the source." : prochaine ? `Not today. Next one: ${prochaine}.` : "Not today."),
    },
    aucuneAVenir: "Nothing announced yet.",
    aucunePassee: "Nothing on the calendar lately.",
  },
};
