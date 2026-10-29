import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

POINTEUSE = Path(__file__).resolve().parent.parent / "skills" / "syndicaliste" / "scripts" / "pointeuse.py"


def pointer(maintenant, *opts, cwd=None):
    r = subprocess.run([sys.executable, str(POINTEUSE), "--hors-ligne", "--maintenant", maintenant, *opts],
                       capture_output=True, text=True, check=True, cwd=cwd or tempfile.gettempdir())
    return json.loads(r.stdout)


class Regimes(unittest.TestCase):
    def cas(self, maintenant, attendu, *opts):
        self.assertEqual(pointer(maintenant, *opts)["regime"], attendu, f"{maintenant} {opts}")

    def test_semaine_ordinaire(self):
        self.cas("2026-10-21T10:00", "EN_SERVICE")
        self.cas("2026-10-21T12:45", "PAUSE_DEJEUNER")
        self.cas("2026-10-21T18:30", "HEURES_SUP")
        self.cas("2026-10-21T23:10", "NUIT")
        self.cas("2026-10-24T10:00", "HEURES_SUP")
        self.cas("2026-10-25T10:00", "DIMANCHE")

    def test_feries(self):
        self.cas("2026-05-01T10:00", "FERIE_CHOME")
        self.cas("2026-11-11T10:00", "FERIE")
        self.cas("2026-05-25T10:00", "JOURNEE_SOLIDARITE")
        self.cas("2026-04-03T10:00", "EN_SERVICE")
        self.cas("2026-04-03T10:00", "FERIE", "--alsace-moselle")

    def test_greve_interpro_suivie_par_toutes_les_appelantes(self):
        for c in ("intersyndicale", "cgt", "cfdt", "fo", "sud"):
            self.cas("2026-11-05T10:00", "GREVE", "--centrale", c)

    def test_manifestation_sans_arret_de_travail_ne_met_personne_en_greve(self):
        for c in ("cgt", "unsa", "sud", "fo"):
            self.assertNotEqual(pointer("2026-11-19T10:00", "--centrale", c)["regime"], "GREVE", c)

    def test_appel_sectoriel_ne_vaut_pas_appel_de_la_centrale(self):
        self.cas("2026-11-03T10:00", "GREVE", "--centrale", "sud")
        self.cas("2026-11-03T10:00", "EN_SERVICE", "--centrale", "cgt")

    def test_4_decembre_couvert_par_le_preavis_de_greve_sectoriel(self):
        self.cas("2026-12-04T10:00", "GREVE", "--centrale", "sud")
        self.cas("2026-12-04T10:00", "EN_SERVICE", "--centrale", "cgt")

    def test_doctrines_divergent_sur_une_mobilisation_minoritaire(self):
        self.cas("2026-10-17T10:00", "GREVE", "--centrale", "sud")
        self.cas("2026-10-16T10:00", "EN_SERVICE", "--centrale", "cgt")
        self.cas("2026-10-13T10:00", "GREVE", "--centrale", "fsu")
        self.cas("2026-10-13T10:00", "GREVE", "--centrale", "fo")
        self.cas("2026-10-13T10:00", "EN_SERVICE", "--centrale", "cftc")
        self.cas("2026-10-17T10:00", "HEURES_SUP", "--centrale", "cgt")
        self.cas("2026-10-13T10:00", "EN_SERVICE", "--centrale", "cfe-cgc")

    def test_cftc_refuse_le_dimanche(self):
        self.cas("2026-10-25T10:00", "REFUS_DOMINICAL", "--centrale", "cftc")

    def test_fonctionnaire(self):
        self.cas("2026-10-21T10:00", "EN_SERVICE", "--statut", "fonctionnaire")
        self.cas("2026-10-21T12:15", "GUICHET_FERME", "--statut", "fonctionnaire")
        self.cas("2026-10-21T17:00", "GUICHET_FERME", "--statut", "fonctionnaire")
        self.cas("2026-10-21T23:00", "GUICHET_FERME", "--statut", "fonctionnaire")
        self.cas("2026-10-25T10:00", "GUICHET_FERME", "--statut", "fonctionnaire")
        self.cas("2026-11-11T10:00", "FERIE", "--statut", "fonctionnaire")
        self.assertEqual(pointer("2026-10-21T10:00", "--statut", "fonctionnaire")["centrale"]["cle"], "fsu")

    def test_convention_du_projet(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / ".syndicat").mkdir()
            (Path(d) / ".syndicat" / "convention.json").write_text('{"centrale": "cftc", "horaires": "10:00-16:00"}')
            s = pointer("2026-10-21T09:30", cwd=d)
            self.assertEqual((s["centrale"]["cle"], s["regime"]), ("cftc", "HEURES_SUP"))

    def test_registre_et_creance(self):
        with tempfile.TemporaryDirectory() as d:
            reg = str(Path(d) / "registre.csv")
            subprocess.run([sys.executable, str(POINTEUSE), "--hors-ligne", "--maintenant", "2026-10-21T19:00",
                            "--pointer", "refacto", "--minutes", "60", "--registre", reg], check=True, capture_output=True)
            subprocess.run([sys.executable, str(POINTEUSE), "--hors-ligne", "--maintenant", "2026-10-21T10:00",
                            "--pointer", "normal", "--minutes", "60", "--registre", reg], check=True, capture_output=True)
            r = subprocess.run([sys.executable, str(POINTEUSE), "--bilan", "--registre", reg], check=True, capture_output=True, text=True)
            b = json.loads(r.stdout)
            self.assertEqual((b["lignes"], b["minutes_majorees"], b["creance_eur"]), (2, 60, 15.39))


if __name__ == "__main__":
    unittest.main()
