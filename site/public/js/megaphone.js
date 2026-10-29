// Mégaphone de l'affiche d'accueil : un clic lance l'hymne.
// Audio déposé dans public/audio/ (attribut data-audio posé au build) ; sinon clip YouTube (nocookie) dans un petit lecteur,
// chargé au clic seulement. Le clip 16:9 sert sur ordinateur dès que CLIP est renseigné dans hymne.js, sinon le clip vertical.
import { $, el } from "./outils.js";
import { VERTICAL, clipLarge, urlYoutube } from "./hymne.js";

const bouton = $("[data-megaphone]");
if (bouton) {
  const T = JSON.parse(bouton.dataset.textes);
  const etat = $("[data-megaphone-etat]", bouton);
  const statut = $("[data-megaphone-statut]");
  const ORIGINE = "https://www.youtube-nocookie.com";
  let audio = null;
  let lecteur = null; // { boite, iframe }
  let lit = false;

  const afficher = (nouvelEtat) => {
    lit = nouvelEtat === "lecture";
    const ouvert = nouvelEtat !== "ferme";
    bouton.setAttribute("aria-pressed", String(lit));
    bouton.classList.toggle("haut-parleur--joue", lit);
    etat.textContent = lit ? `❚❚ ${T.pause}` : `▶ ${ouvert ? T.reprendre : T.lire}`;
    statut.textContent = { lecture: T.enLecture, pause: T.enPause, ferme: T.ferme }[nouvelEtat];
  };

  const commande = (func) => lecteur?.iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: "" }), ORIGINE);

  function fermer() {
    lecteur?.boite.remove();
    lecteur = null;
    afficher("ferme");
    bouton.focus();
  }

  function ouvrirYoutube() {
    const large = clipLarge();
    const iframe = el("iframe", {
      src: urlYoutube(large || VERTICAL, { auto: true, api: true }),
      title: T.titre,
      allow: "autoplay; encrypted-media; picture-in-picture",
    });
    const boite = el("div", { class: `mini-lecteur ${large ? "mini-lecteur--large" : "mini-lecteur--vertical"}`, role: "region", "aria-label": T.lecteur },
      el("div", { class: "mini-lecteur__barre" },
        el("span", { class: "mini-lecteur__titre", text: T.titre }),
        el("button", { class: "mini-lecteur__fermer", type: "button", "aria-label": T.fermer, text: "✕", onclick: fermer })),
      el("div", { class: "mini-lecteur__video" }, iframe));
    boite.addEventListener("keydown", (e) => e.key === "Escape" && fermer());
    // Écoute des états du lecteur : 1 lecture, 2 pause, 0 fin.
    iframe.addEventListener("load", () => iframe.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), ORIGINE));
    lecteur = { boite, iframe };
    document.body.append(boite);
    afficher("lecture");
  }

  window.addEventListener("message", (e) => {
    if (e.origin !== ORIGINE || !lecteur || e.source !== lecteur.iframe.contentWindow) return;
    let m;
    try { m = JSON.parse(e.data); } catch { return; }
    const code = m.event === "onStateChange" ? m.info : m.info?.playerState;
    if (code === 1) afficher("lecture");
    else if (code === 2 || code === 0) afficher("pause");
  });

  bouton.addEventListener("click", () => {
    if (bouton.dataset.audio) {
      if (!audio) {
        audio = new Audio(bouton.dataset.audio);
        audio.addEventListener("ended", () => afficher("pause"));
      }
      if (audio.paused) { audio.play().then(() => afficher("lecture"), () => afficher("pause")); }
      else { audio.pause(); afficher("pause"); }
      return;
    }
    if (!lecteur) ouvrirYoutube();
    else if (lit) { commande("pauseVideo"); afficher("pause"); }
    else { commande("playVideo"); afficher("lecture"); }
  });
}
