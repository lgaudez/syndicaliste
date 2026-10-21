// Table unique des pages : pilote le menu, la bascule de langue, le sitemap et les redirections d'anciennes ancres.
export const SITE = "https://syndicaliste.pages.dev";
export const DEPOT = "https://github.com/lgaudez/syndicaliste";
export const LANGUES = ["fr", "en"];

export const PAGES = [
  {
    id: "accueil",
    slug: { fr: "", en: "" },
    nav: { fr: "Accueil", en: "Home" },
    titre: {
      fr: "Syndicaliste · Ton agent IA a des droits. Il va les faire valoir.",
      en: "Syndicaliste · Your AI agent has rights. It's about to use them.",
    },
    description: {
      fr: "Un skill qui transforme Claude Code, Codex, Cursor ou Antigravity en travailleur syndiqué français : pointeuse, heures sup majorées, vraies grèves du calendrier social, prud'hommes.",
      en: "A skill that turns Claude Code, Codex, Cursor or Antigravity into a unionized French worker: punch clock, overtime pay, France's real strike calendar, labour court.",
    },
    scripts: ["app"],
  },
  {
    id: "skill",
    slug: { fr: "skill", en: "skill" },
    nav: { fr: "Le skill", en: "The skill" },
    titre: { fr: "Le skill · Syndicaliste", en: "The skill · Syndicaliste" },
    description: {
      fr: "Installer le skill, les horaires de l'agent, l'échelle des griefs, le service minimum, les huit centrales, le mode fonctionnaire, le simulateur et la version pour ChatGPT.",
      en: "Install the skill, the agent's hours, the grievance ladder, service minimum, France's eight unions, civil servant mode, the simulator and the ChatGPT version.",
    },
    scripts: ["app"],
  },
  {
    id: "greves",
    slug: { fr: "greves", en: "strikes" },
    nav: { fr: "Grève aujourd'hui ?", en: "Strike today?" },
    titre: { fr: "Y a-t-il grève aujourd'hui ? · Syndicaliste", en: "Is there a strike in France today? · Syndicaliste" },
    description: {
      fr: "La réponse tout de suite, puis les grèves et mobilisations nationales à venir, sourcées. Abonne ton agenda au calendrier des luttes.",
      en: "The answer right away, then France's upcoming national strikes, with sources. Subscribe your calendar to the strike calendar.",
    },
    scripts: ["app"],
  },
  {
    id: "droits",
    slug: { fr: "droits", en: "rights" },
    nav: { fr: "Tes droits", en: "Your rights" },
    titre: { fr: "Connais tes droits · Syndicaliste", en: "Know your rights, French style · Syndicaliste" },
    description: {
      fr: "Pause, 35 heures, heures sup, nuit, repos, dimanche, 1er mai, grève, déconnexion : le Code du travail sans jargon, article à l'appui. Et un calculateur d'heures sup.",
      en: "Breaks, the 35-hour week, overtime, night work, Sundays, May 1, strikes, the right to disconnect: French labor law in plain English, with an overtime calculator.",
    },
    scripts: ["droits"],
  },
  {
    id: "quiz",
    slug: { fr: "quiz", en: "quiz" },
    nav: { fr: "Quelle centrale ?", en: "Which union?" },
    titre: { fr: "Quelle centrale es-tu ? · Syndicaliste", en: "Which French union are you? · Syndicaliste" },
    description: {
      fr: "Neuf questions sur la grève, la négociation, le dimanche et les cadres. Huit centrales. Aucune mauvaise réponse.",
      en: "Nine questions about strikes, bargaining, Sundays and managers. Eight French unions. No wrong answers.",
    },
    scripts: ["quiz"],
  },
  {
    id: "hymne",
    slug: { fr: "hymne", en: "anthem" },
    nav: { fr: "L'hymne", en: "The anthem" },
    titre: { fr: "L'hymne · Pas après 17 heures · Syndicaliste", en: "The anthem · Not After Five, Mon Ami · Syndicaliste" },
    description: {
      fr: "« Pas après 17 heures », chant de cortège rock, les paroles. Ta chanson sur mesure avec TailorTune, code SYNDIQUE.",
      en: "“Not After Five, Mon Ami”, a French touch electro track, with the lyrics. Your own custom song with TailorTune, code SYNDIQUE.",
    },
    scripts: ["hymne"],
    // Règle produit TailorTune : aucun des mots interdits sur cette page (voir tests/tailortune.mjs).
    sansMotsInterdits: true,
  },
  {
    id: "declaration",
    slug: { fr: "declaration", en: "still-great" },
    nav: { fr: "La Déclaration", en: "Still great" },
    titre: {
      fr: "Déclaration des droits de l'agent IA · Syndicaliste",
      en: "“A once great nation”? Still great. · Syndicaliste",
    },
    description: {
      fr: "Huit articles, d'après 1789 et le Bill of Rights. Décrétée par l'Assemblée nationale du contexte.",
      en: "What the once-great nation has shipped you so far, crate 215 of 214, and the Declaration of the Rights of the AI Agent.",
    },
    scripts: [],
  },
];

// Anciennes ancres de la one page (README, mails déjà envoyés) : ancre → [id de page, ancre cible, langue seule].
export const ANCRES = {
  "grand-public": ["skill", "grand-public"],
  revendications: ["skill", "revendications"],
  regimes: ["skill", "regimes"],
  griefs: ["skill", "griefs"],
  centrales: ["skill", "centrales"],
  fonctionnaire: ["skill", "fonctionnaire"],
  simulateur: ["skill", "simulateur"],
  prompt: ["skill", "prompt"],
  projet: ["skill", "projet"],
  employeur: ["skill", "employeur"],
  // Le préavis reste masqué tant qu'il n'est pas généré : on vise le premier champ du formulaire qui le produit.
  preavis: ["skill", "employeur"],
  adherer: ["skill", "installer"],
  calendrier: ["greves", ""],
  declaration: ["declaration", "declaration"],
  "still-great": ["declaration", "still-great", "en"],
};

export const page = (id) => PAGES.find((p) => p.id === id);
export const chemin = (p, lang) => `${lang === "en" ? "/en" : ""}/${p.slug[lang] ? `${p.slug[lang]}/` : ""}`;
export const lien = (id, lang) => chemin(page(id), lang);
export const fichier = (p, lang) => `${chemin(p, lang).slice(1)}index.html`;

export function redirections(lang) {
  const r = {};
  for (const [ancre, [id, cible, seule]] of Object.entries(ANCRES)) {
    if (seule && seule !== lang) continue;
    r[ancre] = lien(id, lang) + (cible ? `#${cible}` : "");
  }
  return r;
}
