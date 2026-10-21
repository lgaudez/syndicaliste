"""Les instructions grand public tiennent dans un champ d'instructions personnalisées de ChatGPT (1 500 caractères)."""
import unittest
from pathlib import Path

LIMITE = 1500


class TestGrandPublic(unittest.TestCase):
    def test_taille(self):
        for f in sorted((Path(__file__).resolve().parent.parent / "grand-public").glob("instructions-*.txt")):
            with self.subTest(fichier=f.name):
                self.assertLessEqual(len(f.read_text(encoding="utf-8")), LIMITE)


if __name__ == "__main__":
    unittest.main()
