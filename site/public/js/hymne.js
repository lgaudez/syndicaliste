// Page de l'hymne : la vidéo YouTube n'apparaît qu'une fois son identifiant renseigné.
// Le lecteur audio, lui, est activé au build dès que public/audio/pas-apres-17h.mp3 ou not-after-five.mp3 existe (voir build.mjs).
import { $, $$, el } from "./outils.js";

// Identifiants YouTube à remplir à la publication (la partie après « v= »). Vide : le bloc reste masqué.
export const YOUTUBE = { fr: "", en: "" };

for (const bloc of $$("[data-youtube]")) {
  const id = YOUTUBE[bloc.dataset.youtube];
  if (!id) continue;
  bloc.append(el("iframe", {
    src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
    title: document.querySelector("h1")?.textContent ?? "YouTube",
    loading: "lazy",
    allow: "encrypted-media; picture-in-picture",
    allowfullscreen: true,
  }));
  bloc.hidden = false;
  $("[data-studio-attente]")?.setAttribute("hidden", "");
}
