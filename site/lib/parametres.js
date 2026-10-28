// Validation à la frontière HTTP ; la pointeuse reste partagée avec le simulateur.
export function validerParametres(params) {
  for (const [cle, valeur] of Object.entries(params)) {
    if (valeur.length > 256) throw new Error(`paramètre trop long : ${cle}`);
  }
  for (const cle of ["centrale", "statut"]) {
    if (params[cle] && !/^[a-z][a-z-]*$/.test(params[cle])) throw new Error(`paramètre invalide : ${cle}`);
    if (params[cle] && Object.hasOwn(Object.prototype, params[cle])) throw new Error(`paramètre invalide : ${cle}`);
  }
  if (params.horaires) {
    let finPrecedente = -1;
    for (const plage of params.horaires.split(",")) {
      const m = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(plage.trim());
      if (!m) throw new Error("horaires invalides");
      const [, h, mi, hf, mf] = m.map(Number);
      const debut = h * 60 + mi, fin = hf * 60 + mf;
      if (h > 23 || hf > 23 || mi > 59 || mf > 59 || debut >= fin || debut < finPrecedente) throw new Error("horaires invalides");
      finPrecedente = fin;
    }
  }
  if (params.alsace_moselle && !["0", "1", "true", "false"].includes(params.alsace_moselle)) throw new Error("alsace_moselle invalide");
  if (params.maintenant) {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ]([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d+)?)?)?(Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?$/.exec(params.maintenant);
    if (!m) throw new Error("date invalide");
    const [, y, mo, d] = m;
    const date = new Date(`${y}-${mo}-${d}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== `${y}-${mo}-${d}`) throw new Error("date invalide");
  }
}
