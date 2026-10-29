// Chargé par toutes les pages : menu hamburger et boutons « Copier » écrits en dur dans le HTML.
import { copier } from "./outils.js";

const barre = document.querySelector(".barre");

// La barre est collante : sa hauteur réelle décale les ancres et le focus clavier (scroll-padding-top dans site.css).
if (barre) {
  const mesurer = () => document.documentElement.style.setProperty("--hauteur-barre", `${barre.getBoundingClientRect().height}px`);
  mesurer();
  new ResizeObserver(mesurer).observe(barre);
}
const bouton = document.querySelector("[data-menu-bouton]");
const menu = bouton && document.getElementById(bouton.getAttribute("aria-controls"));
const libelle = bouton?.querySelector("[data-menu-libelle]");

function basculer(ouvert, { rendreFocus = false } = {}) {
  bouton.setAttribute("aria-expanded", String(ouvert));
  barre.classList.toggle("barre--ouverte", ouvert);
  libelle.textContent = ouvert ? bouton.dataset.fermer : bouton.dataset.ouvrir;
  if (ouvert) menu.querySelector("a")?.focus();
  else if (rendreFocus) bouton.focus();
}

if (bouton && menu) {
  const ouvert = () => bouton.getAttribute("aria-expanded") === "true";
  bouton.addEventListener("click", () => basculer(!ouvert()));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ouvert()) basculer(false, { rendreFocus: true });
  });
  document.addEventListener("click", (e) => {
    if (ouvert() && !barre.contains(e.target)) basculer(false);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a") && ouvert()) basculer(false);
  });
  // Le dernier lien du menu ouvert rend la main au reste de la page : on referme pour ne pas laisser un panneau orphelin.
  menu.addEventListener("focusout", (e) => {
    if (ouvert() && !barre.contains(e.relatedTarget)) basculer(false);
  });
  matchMedia("(min-width: 1180px)").addEventListener("change", (e) => e.matches && ouvert() && basculer(false));
}

for (const b of document.querySelectorAll("[data-copier]")) {
  b.addEventListener("click", () => copier(b.closest(".copie").querySelector("code").textContent, b));
}
