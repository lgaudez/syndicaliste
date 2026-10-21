// Bulletins « Rester en contact » (composant contact() de build.mjs) : envoi en fetch vers /api/contact, statut annoncé par aria-live.
// Sans JavaScript, le formulaire part tel quel et la Function répond en HTML.
const M = {
  fr: {
    envoi: "Dépôt du bulletin…",
    ok: "Adhésion enregistrée. On te recontacte si ça vaut le coup, pas avant.",
    email: "Cette adresse e-mail ne passe pas le contrôle. Vérifie-la.",
    consentement: "Il manque ta signature : coche la case de consentement.",
    longueur: "Trop long pour le bulletin : 1000 caractères maximum pour le message.",
    "guichet-ferme": "Le guichet est fermé, réessaie plus tard.",
    "trop-de-depots": "Trop de bulletins d'un coup. Pause d'une minute, puis réessaie.",
    reseau: "Le courrier s'est perdu en route. Réessaie dans un instant.",
  },
  en: {
    envoi: "Filing your form…",
    ok: "Membership recorded. We'll get back to you if it's worth it, not before.",
    email: "This email address doesn't pass inspection. Check it.",
    consentement: "Your signature is missing: tick the consent box.",
    longueur: "Too long for the form: 1000 characters max for the message.",
    "guichet-ferme": "The office is closed, try again later.",
    "trop-de-depots": "Too many forms at once. Take a one-minute break, then try again.",
    reseau: "The mail got lost on the way. Try again in a moment.",
  },
};

async function envoyer(form) {
  const T = M[form.elements.lang?.value === "en" ? "en" : "fr"];
  const statut = form.querySelector("[data-contact-statut]");
  const bouton = form.querySelector('button[type="submit"]');
  const email = form.elements.email;
  const donnees = new FormData(form);
  const corps = Object.fromEntries(donnees);
  corps.interets = donnees.getAll("interets");
  corps.page = location.href;
  const dire = (texte, etat) => {
    statut.textContent = texte;
    statut.dataset.etat = etat;
  };
  bouton.disabled = true;
  email.removeAttribute("aria-invalid");
  dire(T.envoi, "envoi");
  let code = "reseau";
  try {
    const r = await fetch(form.action, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(corps) });
    const json = await r.json().catch(() => ({}));
    code = r.ok && json.ok ? "ok" : (json.erreur in T ? json.erreur : "reseau");
  } catch { /* réseau */ }
  bouton.disabled = false;
  if (code === "email") { email.setAttribute("aria-invalid", "true"); email.focus(); }
  dire(T[code], code === "ok" ? "ok" : "erreur");
  if (code === "ok") form.reset();
}

for (const form of document.querySelectorAll("form[data-contact]")) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    envoyer(form);
  });
}
