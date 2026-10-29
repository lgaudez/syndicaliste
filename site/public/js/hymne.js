// Page de l'hymne : la vidéo YouTube n'apparaît qu'une fois son identifiant renseigné.
// Le lecteur audio, lui, est activé au build dès que public/audio/pas-apres-17h.mp3 ou not-after-five.mp3 existe (voir build.mjs).
import { $, $$, el, langue as lang } from "./outils.js";

// Identifiants YouTube à remplir à la publication (la partie après « v= »). Vide : le bloc reste masqué.
export const YOUTUBE = { fr: "", en: "" }; // FR : clip intégré en dur dans pages/fr/hymne.html

// Clip vertical 9:16 actuel : mobile, et repli sur ordinateur tant que CLIP est vide.
export const VERTICAL = "x4egTa7_Y4I";
// Clip 16:9 pour ordinateur, à renseigner à la publication (la partie après « v= »). Vide : on garde le clip vertical.
// Un seul identifiant sert la page de l'hymne (façade chargée au clic) et le mégaphone de l'accueil.
export const CLIP = { fr: "CdScYBENWAo", en: "CdScYBENWAo" };

export const ECRAN_LARGE = "(min-width: 900px)";
export const clipLarge = () => (matchMedia(ECRAN_LARGE).matches ? CLIP[lang()] : "");

const embed = (id, { auto = false, api = false } = {}) => {
  const p = new URLSearchParams({ rel: "0", playsinline: "1" });
  if (auto) p.set("autoplay", "1");
  if (api) { p.set("enablejsapi", "1"); p.set("origin", location.origin); }
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${p}`;
};
export const urlYoutube = embed;

// Façade du clip 16:9 : aucune iframe (ni requête YouTube) avant le clic.
const clip = $("[data-clip]");
if (clip && CLIP[lang()]) {
  clip.closest(".studio")?.classList.add("studio--clip");
  clip.hidden = false;
  const facade = clip.querySelector("[data-clip-lire]");
  facade?.addEventListener("click", () => {
    const iframe = el("iframe", {
      src: embed(CLIP[lang()], { auto: true }),
      title: clip.dataset.titre,
      allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
      allowfullscreen: true,
    });
    facade.replaceWith(iframe);
    iframe.focus();
  });
}

// Clip vertical de la page : chargé seulement quand le clip 16:9 ne le remplace pas (pas de double chargement sur ordinateur).
const vertical = $(".studio__video--vertical iframe[data-src]");
if (vertical && !clipLarge()) vertical.src = vertical.dataset.src;

for (const bloc of $$("[data-youtube]")) {
  const id = YOUTUBE[bloc.dataset.youtube];
  if (!id) continue;
  bloc.append(el("iframe", {
    src: embed(id),
    title: document.querySelector("h1")?.textContent ?? "YouTube",
    loading: "lazy",
    allow: "encrypted-media; picture-in-picture",
    allowfullscreen: true,
  }));
  bloc.hidden = false;
  $("[data-studio-attente]")?.setAttribute("hidden", "");
}
