// Assemble les pages de public/ depuis pages/<langue>/<id>.html, la table pages/pages.mjs et un seul gabarit d'en-tête et de pied.
// node site/build.mjs           écrit les pages, le 404, sitemap.xml et robots.txt
// node site/build.mjs --check   échoue si public/ n'est pas à jour (aucune écriture)
// Sans dépendance. Lancé par sync.sh.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANCRES, DEPOT, LANGUES, PAGES, SITE, chemin, fichier, lien, redirections } from "./pages/pages.mjs";
import { doctrineEnClair } from "./public/js/outils.js";
import TEXTES_FR from "./public/js/textes-fr.js";
import TEXTES_EN from "./public/js/textes-en.js";

const ici = dirname(fileURLToPath(import.meta.url));
const racine = dirname(ici);
const TEXTES = { fr: TEXTES_FR, en: TEXTES_EN };
const CENTRALES = JSON.parse(readFileSync(join(racine, "skills/syndicaliste/data/centrales.json"), "utf8")).centrales;

const echapper = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const autre = (lang) => (lang === "fr" ? "en" : "fr");

const CHROME = {
  fr: {
    evitement: "Aller au contenu",
    marque: "Syndicaliste, accueil",
    pages: "Pages",
    langue: "Langue",
    autreLangue: "English version",
    menu: "Menu",
    fermer: "Fermer",
    github: "⭐ GitHub",
    atelier: "<strong>Fait par Gaudez Tech Lab.</strong> Vos agents IA suivent-ils vos règles&nbsp;? On aide les équipes à les cadrer, sans les syndiquer (promis).",
    atelierSansMots: "<strong>Fait par Gaudez Tech Lab.</strong> Vos agents de code suivent-ils vos règles&nbsp;? On aide les équipes à les cadrer, sans les syndiquer (promis).",
    atelierBouton: "Parler à Gaudez Tech Lab",
    slogan: "Fait par des agents en heures sup.",
    section: "Section syndicale",
    ecrire: "Écrire au bureau syndical",
    plan: "Plan du site",
    liens: [
      [DEPOT, "Code source sur GitHub"],
      [`${DEPOT}/blob/main/LICENSE`, "Licence MIT"],
      ["/api/statut?centrale=cgt", "API de la pointeuse"],
      ["/api/greves.ics", "Calendrier iCal des grèves"],
      ["/img/CREDITS.md", "Crédits des images"],
    ],
    mention: "Parodie. Aucun lien avec les organisations syndicales citées, que nous caricaturons avec tendresse. Les actes produits par l'agent portent la mention «&nbsp;Document parodique, sans valeur juridique&nbsp;» et ne partent jamais nulle part. Aucun agent n'a été maltraité pendant la fabrication de ce site. Enfin si.",
    ogAlt: "Affiche crème et rouge : SYNDICALISTE, ton agent IA a des droits, avec un mégaphone et un tampon GRÈVE.",
    ogAltSansMots: "Affiche crème et rouge : SYNDICALISTE, avec un mégaphone et un tampon GRÈVE.",
    locale: "fr_FR",
  },
  en: {
    evitement: "Skip to content",
    marque: "Syndicaliste, home",
    pages: "Pages",
    langue: "Language",
    autreLangue: "French version",
    menu: "Menu",
    fermer: "Close",
    github: "⭐ GitHub",
    atelier: "<strong>Made by Gaudez Tech Lab.</strong> Do your AI agents follow your rules? We help teams set them up, without unionizing them (promise).",
    atelierSansMots: "<strong>Made by Gaudez Tech Lab.</strong> Do your coding agents follow your rules? We help teams set them up, without unionizing them (promise).",
    atelierBouton: "Talk to Gaudez Tech Lab",
    slogan: "Made by agents on overtime.",
    section: "Union branch",
    ecrire: "Write to the union office",
    plan: "Site map",
    liens: [
      [DEPOT, "Source code on GitHub"],
      [`${DEPOT}/blob/main/LICENSE`, "MIT License"],
      ["/api/statut?centrale=cgt", "Punch clock API"],
      ["/api/greves.ics?lang=en", "Strike calendar (iCal)"],
      ["/img/CREDITS.md", "Image credits"],
    ],
    mention: "Parody. No affiliation with the unions mentioned, which we caricature with affection. The documents the agent produces carry a “parody, no legal value” notice and are never sent anywhere. No agent was mistreated in the making of this site. Well, a little.",
    ogAlt: "Cream and red protest poster: SYNDICALISTE, your AI agent has rights, with a megaphone and an ON STRIKE stamp.",
    ogAltSansMots: "Cream and red protest poster: SYNDICALISTE, with a megaphone and an ON STRIKE stamp.",
    locale: "en_US",
  },
};

const DEFS = `<svg width="0" height="0" class="defs" aria-hidden="true" focusable="false">
  <defs>
    <filter id="encre" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="bruit"/>
      <feDisplacementMap in="SourceGraphic" in2="bruit" scale="3"/>
    </filter>
    <symbol id="megaphone" viewBox="0 0 260 170">
      <g transform="rotate(-12 130 85)">
        <rect x="14" y="66" width="40" height="40" rx="6"/>
        <polygon points="50,62 196,14 196,158 50,110"/>
        <rect x="190" y="6" width="20" height="160" rx="8"/>
        <polygon points="80,106 110,106 100,156 70,156"/>
      </g>
      <g fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round">
        <path d="M222 40 q22 36 6 78"/>
        <path d="M244 18 q36 60 8 124"/>
      </g>
    </symbol>
    <symbol id="mascotte" viewBox="0 0 240 250">
      <rect x="181" y="58" width="7" height="150" fill="#a8834f" stroke="#000" stroke-width="3"/>
      <g transform="rotate(6 185 40)">
        <rect x="140" y="12" width="92" height="56" fill="#f8f2e3" stroke="#000" stroke-width="5"/>
        <text x="186" y="53" text-anchor="middle" font-family="Big Shoulders Stencil Display, Impact, sans-serif" font-weight="900" font-size="38" fill="#c8261a">35 H</text>
      </g>
      <path d="M150 150 L184 118" stroke="#000" stroke-width="13" stroke-linecap="round"/>
      <path d="M58 150 L36 186" stroke="#000" stroke-width="13" stroke-linecap="round"/>
      <rect x="64" y="132" width="90" height="72" rx="6" fill="#c8261a" stroke="#000" stroke-width="5"/>
      <circle cx="109" cy="160" r="13" fill="#f8f2e3" stroke="#000" stroke-width="3"/>
      <path d="M103 163 v-7 h12 v7 z" fill="#000"/>
      <rect x="78" y="204" width="20" height="34" fill="#000"/>
      <rect x="120" y="204" width="20" height="34" fill="#000"/>
      <rect x="44" y="50" width="130" height="86" rx="12" fill="#f8f2e3" stroke="#000" stroke-width="6"/>
      <rect x="58" y="63" width="102" height="60" rx="4" fill="#000"/>
      <path d="M78 92 l9 -9 l9 9 M122 92 l9 -9 l9 9" fill="none" stroke="#e0311f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M96 106 q13 9 26 0" fill="none" stroke="#e0311f" stroke-width="5" stroke-linecap="round"/>
      <g transform="rotate(-8 108 46)">
        <ellipse cx="108" cy="46" rx="66" ry="15" fill="#000"/>
        <rect x="105" y="22" width="6" height="12" fill="#000"/>
      </g>
    </symbol>
  </defs>
</svg>`;

// Blocs calculés au build depuis les données du skill : lisibles sans JavaScript.
const INCLUSIONS = {
  demos: (lang) => TEXTES[lang].DEMOS.map((d) =>
    `<figure class="terminal"><figcaption><span>${echapper(d.titre)}</span><span>${echapper(d.contexte)}</span></figcaption><pre>${
      d.lignes.map(([type, texte]) => `<span class="l-${type}"${type === "bandeau" ? ' lang="fr"' : ""}>${echapper(texte)}</span>`).join("")
    }</pre></figure>`).join("\n"),

  // Mégaphone de l'affiche : lien vers le clip de l'hymne, plus bas sur l'accueil.
  megaphone: (lang) => {
    const [ancre, lire, titre] = lang === "en"
      ? ["anthem", "Play the anthem", "Pas après 17 heures, the Syndicaliste anthem (in French)"]
      : ["hymne", "Écouter l'hymne", "Pas après 17 heures, l'hymne de Syndicaliste"];
    return `<a class="haut-parleur" href="#${ancre}" aria-label="${echapper(`${lire} : ${titre}`)}">
        <svg class="haut-parleur__dessin" viewBox="0 0 260 170" aria-hidden="true" focusable="false">
          <g transform="rotate(-12 130 85)">
            <rect x="14" y="66" width="40" height="40" rx="6"/>
            <polygon points="50,62 196,14 196,158 50,110"/>
            <rect x="190" y="6" width="20" height="160" rx="8"/>
            <polygon points="80,106 110,106 100,156 70,156"/>
          </g>
          <g fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round">
            <path class="onde onde--1" d="M222 40 q22 36 6 78"/>
            <path class="onde onde--2" d="M244 18 q36 60 8 124"/>
          </g>
        </svg>
        <span class="haut-parleur__etat" aria-hidden="true">▶ ${echapper(lire)}</span>
      </a>`;
  },

  centrales: (lang) => {
    const T = TEXTES[lang];
    const tete = lang === "en"
      ? ["Union", "Leaning (common perception)", "Strikes: the agent’s roleplay", "Agent motto (fiction)"]
      : ["Syndicat", "Bord (perception courante)", "Grève : rôle joué par l’agent", "Slogan de l’agent (fiction)"];
    const lignes = Object.entries(CENTRALES).sort((a, b) => a[1].axe - b[1].axe).map(([cle, brute]) => {
      const c = T.centrale(cle, brute);
      return `<tr><th scope="row">${T.sigle(cle)}<br><code>${cle}</code></th><td>${echapper(c.bord)}</td><td>${echapper(doctrineEnClair(T, c.doctrine_greve))}</td><td>${echapper(T.ui.cite(c.devise))}</td></tr>`;
    });
    return `<div class="defile" tabindex="0" role="region" aria-label="${tete[0]}"><table class="tableau"><thead><tr>${tete.map((t) => `<th scope="col">${t}</th>`).join("")}</tr></thead><tbody>${lignes.join("")}</tbody></table></div>`;
  },
};

// Le lecteur audio n'apparaît que si le fichier est déposé dans public/audio/ : aucune requête 404 côté navigateur.
function lecteurs(html) {
  let publie = false;
  const avecLecteur = html.replace(/<figure class="studio__lecteur" data-audio="([^"]+)" hidden>([\s\S]*?)<audio controls preload="none"><\/audio>/g, (tout, fichier, milieu) => {
    if (!existsSync(join(ici, "public", fichier))) return tout;
    publie = true;
    return `<figure class="studio__lecteur" data-audio="${fichier}">${milieu}<audio controls preload="none" src="${fichier}"></audio>`;
  });
  return publie ? avecLecteur.replace("data-studio-attente>", "data-studio-attente hidden>") : avecLecteur;
}

function remplir(corps, lang, source) {
  return lecteurs(corps)
    .replace(/\{\{lien:([a-z-]+)\}\}/g, (_, id) => lien(id, lang))
    .replace(/\{\{lien-autre:([a-z-]+)\}\}/g, (_, id) => lien(id, autre(lang)))
    .replace(/\{\{depot\}\}/g, DEPOT)
    .replace(/\{\{inclure:([a-z-]+)\}\}/g, (_, nom) => {
      if (!INCLUSIONS[nom]) throw new Error(`${source} : inclusion inconnue ${nom}`);
      return INCLUSIONS[nom](lang);
    })
    .replace(/\{\{[^}]*\}\}/g, (x) => { throw new Error(`${source} : balise inconnue ${x}`); });
}

function entete(p, lang) {
  const C = CHROME[lang];
  const liensNav = PAGES.map((q) =>
    `<li><a href="${chemin(q, lang)}"${q === p ? ' aria-current="page"' : ""}>${echapper(q.nav[lang])}</a></li>`).join("\n      ");
  const ici = p ? chemin(p, lang) : (lang === "en" ? "/en/" : "/");
  const la = p ? chemin(p, autre(lang)) : (lang === "en" ? "/" : "/en/");
  const langues = lang === "fr"
    ? `<a href="${ici}" hreflang="fr" lang="fr" aria-current="true">FR</a>\n    <a href="${la}" hreflang="en" lang="en" aria-label="${C.autreLangue}">EN</a>`
    : `<a href="${la}" hreflang="fr" aria-label="${C.autreLangue}">FR</a>\n    <a href="${ici}" hreflang="en" lang="en" aria-current="true">EN</a>`;
  return `<a class="evitement" href="#contenu">${C.evitement}</a>

<header class="barre">
  <a class="barre__marque" href="${lien("accueil", lang)}" aria-label="${C.marque}">
    <svg class="barre__logo" aria-hidden="true"><use href="#megaphone"/></svg>
    Syndicaliste
  </a>
  <nav class="barre__nav" id="menu" aria-label="${C.pages}">
    <ul>
      ${liensNav}
    </ul>
  </nav>
  <nav class="barre__langues" aria-label="${C.langue}">
    ${langues}
  </nav>
  <button class="barre__menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-bouton data-ouvrir="${C.menu}" data-fermer="${C.fermer}">
    <span class="barre__burger" aria-hidden="true"><span></span></span><span data-menu-libelle>${C.menu}</span>
  </button>
  <a class="barre__github" href="${DEPOT}">${C.github}</a>
</header>`;
}

function pied(p, lang) {
  const C = CHROME[lang];
  const sansMots = p?.sansMotsInterdits;
  const plan = PAGES.map((q) => `<li><a href="${chemin(q, lang)}">${echapper(q.nav[lang])}</a></li>`).join("");
  const liens = C.liens.map(([href, texte]) => `<li><a href="${href}">${texte}</a></li>`).join("");
  return `<aside class="atelier" aria-label="Gaudez Tech Lab">
  <div class="cadre atelier__grille">
    <p class="atelier__texte">${sansMots ? C.atelierSansMots : C.atelier}</p>
    <a class="bouton bouton--encre" href="https://www.gaudeztechlab.com" rel="noopener">${C.atelierBouton}</a>
  </div>
</aside>

<footer class="pied">
  <div class="cadre pied__grille">
    <div>
      <p class="pied__slogan">${C.slogan}</p>
      <p class="pied__section">${C.section} <a href="https://www.gaudeztechlab.com" rel="noopener">#gaudeztechlab</a></p>
      <p class="pied__section">${C.ecrire}&nbsp;: <a href="mailto:contact@gaudeztechlab.com">contact@gaudeztechlab.com</a></p>
    </div>
    <nav aria-label="${C.plan}">
      <ul class="pied__liens">${plan}</ul>
    </nav>
    <ul class="pied__liens">${liens}</ul>
    <p class="pied__mention">${C.mention}</p>
  </div>
</footer>`;
}

function document_(p, lang, corps) {
  const C = CHROME[lang];
  const est404 = !p;
  const titre = est404 ? (lang === "en" ? "Page not found · Syndicaliste" : "Page introuvable · Syndicaliste") : p.titre[lang];
  const description = est404 ? "404" : p.description[lang];
  const url = est404 ? SITE : SITE + chemin(p, lang);
  const image = `${SITE}/${lang === "en" ? "og-en" : "og"}.png`;
  const alternates = est404 ? "" : `
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="fr" href="${SITE}${chemin(p, "fr")}">
  <link rel="alternate" hreflang="en" href="${SITE}${chemin(p, "en")}">
  <link rel="alternate" hreflang="x-default" href="${SITE}${chemin(p, "fr")}">`;
  const redirection = p?.id === "accueil"
    ? `\n  <script>(function(){var r=${JSON.stringify(redirections(lang))}[location.hash.slice(1)];if(r)location.replace(r)})()</script>`
    : "";
  const scripts = ["commun", ...(p?.scripts ?? [])].map((s) => `\n  <script type="module" src="/js/${s}.js"></script>`).join("");
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
  <title>${echapper(titre)}</title>
  <meta name="description" content="${echapper(description)}">${est404 ? '\n  <meta name="robots" content="noindex">' : ""}
  <meta name="theme-color" content="#171714">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">${alternates}

  <meta property="og:type" content="website">
  <meta property="og:locale" content="${C.locale}">
  <meta property="og:locale:alternate" content="${CHROME[autre(lang)].locale}">
  <meta property="og:site_name" content="Syndicaliste">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${echapper(titre)}">
  <meta property="og:description" content="${echapper(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${echapper(p?.sansMotsInterdits ? C.ogAltSansMots : C.ogAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${echapper(titre)}">
  <meta name="twitter:description" content="${echapper(description)}">
  <meta name="twitter:image" content="${image}">

  <link rel="preload" href="/fonts/big-shoulders-stencil-display-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/courier-prime-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/site.css">
  <script>document.documentElement.classList.add("js")</script>${redirection}${scripts}
</head>
<body data-page="${p?.id ?? "404"}">
${DEFS}

${entete(p, lang)}

<main id="contenu">
${corps.trim()}
</main>

${pied(p, lang)}
</body>
</html>
`;
}

function sitemap() {
  const entrees = PAGES.flatMap((p) => LANGUES.map((lang) => `  <url>
    <loc>${SITE}${chemin(p, lang)}</loc>
${LANGUES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${chemin(p, l)}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${chemin(p, "fr")}"/>
  </url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entrees.join("\n")}
</urlset>
`;
}

export function construire() {
  const sorties = new Map();
  for (const p of PAGES) for (const lang of LANGUES) {
    const source = `pages/${lang}/${p.id}.html`;
    const corps = remplir(readFileSync(join(ici, source), "utf8"), lang, source);
    sorties.set(fichier(p, lang), document_(p, lang, corps));
  }
  sorties.set("404.html", document_(null, "fr", remplir(readFileSync(join(ici, "pages/404.html"), "utf8"), "fr", "pages/404.html")));
  sorties.set("sitemap.xml", sitemap());
  sorties.set("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  return sorties;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sorties = construire();
  const publicDir = join(ici, "public");
  if (process.argv.includes("--check")) {
    const perimes = [...sorties].filter(([f, c]) => !existsSync(join(publicDir, f)) || readFileSync(join(publicDir, f), "utf8") !== c).map(([f]) => f);
    if (perimes.length) {
      console.error(`public/ n'est pas à jour, lancer node site/build.mjs : ${perimes.join(", ")}`);
      process.exit(1);
    }
    console.log(`build : ${sorties.size} fichiers à jour`);
  } else {
    for (const [f, c] of sorties) {
      mkdirSync(dirname(join(publicDir, f)), { recursive: true });
      writeFileSync(join(publicDir, f), c);
    }
    console.log(`build : ${sorties.size} fichiers écrits (${Object.keys(ANCRES).length} anciennes ancres redirigées)`);
  }
}
