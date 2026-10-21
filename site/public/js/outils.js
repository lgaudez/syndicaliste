// Petits outils communs aux scripts des pages. Rien ne touche au DOM au chargement : le module s'importe aussi depuis node (build, tests).

export const langue = () => (document.documentElement.lang.startsWith("en") ? "en" : "fr");
export const textes = async (lang = langue()) => (await import(lang === "en" ? "./textes-en.js" : "./textes-fr.js")).default;

export const $ = (sel, racine = document) => racine.querySelector(sel);
export const $$ = (sel, racine = document) => [...racine.querySelectorAll(sel)];
export const el = (tag, attrs = {}, ...enfants) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const e of enfants.flat(Infinity)) if (e != null && e !== false) n.append(e);
  return n;
};

export async function chargerJson(urls) {
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { accept: "application/json" } });
      if (r.ok && (r.headers.get("content-type") || "").includes("json")) return await r.json();
    } catch { /* source suivante */ }
  }
  throw new Error(`Impossible de charger ${urls.join(" ou ")}`);
}

let notifMinuteur;
export function notifier(texte) {
  let n = $(".notif");
  if (!n) {
    n = el("div", { class: "notif", role: "status", "aria-live": "polite" });
    document.body.append(n);
  }
  n.textContent = texte;
  n.classList.add("visible");
  clearTimeout(notifMinuteur);
  notifMinuteur = setTimeout(() => n.classList.remove("visible"), 1800);
}

const COPIE = {
  fr: { copie: "Copié, camarade", bouton: "Copié" },
  en: { copie: "Copied, camarade", bouton: "Copied" },
};

export async function copier(texte, bouton) {
  try {
    await navigator.clipboard.writeText(texte);
  } catch {
    const t = el("textarea", { "aria-hidden": "true" });
    t.value = texte;
    t.style.cssText = "position:fixed;opacity:0";
    document.body.append(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  const C = COPIE[langue()];
  notifier(C.copie);
  if (bouton) {
    const avant = bouton.textContent;
    bouton.textContent = C.bouton;
    setTimeout(() => (bouton.textContent = avant), 1500);
  }
}

export const blocCopie = (code, libelle, classe = "") =>
  el("div", { class: `copie ${classe}`.trim() },
    el("pre", {}, el("code", { text: code })),
    el("button", { type: "button", "aria-label": `${libelle} : ${code.split("\n")[0].slice(0, 80)}`, onclick: (e) => copier(code, e.currentTarget) }, libelle));

export const hote = (url) => new URL(url).hostname.replace(/^www\./, "");

export function doctrineEnClair(T, d) {
  if (T.DOCTRINES[d]) return T.DOCTRINES[d];
  const secteurs = d.replace("secteur:", "").split(",").map((s) => T.SECTEURS[s]).filter(Boolean);
  return T.doctrineSecteurs(secteurs);
}
