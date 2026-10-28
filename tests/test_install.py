"""Installations réelles en HOME/projet jetables, curl simulé sans réseau."""
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent


class TestInstall(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.home = self.base / 'home'
        self.project = self.base / 'projet avec espaces'
        self.bin = self.base / 'bin'
        for p in (self.home, self.project, self.bin):
            p.mkdir()
        curl = self.bin / 'curl'
        curl.write_text('#!/bin/bash\n[ "${FAIL_CURL:-0}" = 0 ] || exit 22\nwhile [ "$#" -gt 0 ]; do\nif [ "$1" = -o ]; then cp "$ARCHIVE" "$2"; exit; fi\nshift\ndone\nexit 2\n')
        curl.chmod(0o755)
        self.env = {**os.environ, 'HOME': str(self.home), 'PATH': f'{self.bin}:{os.environ["PATH"]}', 'TMPDIR': str(self.base)}
        self.archive = self.base / 'archive.tgz'
        self.env['ARCHIVE'] = str(self.archive)
        self.make_archive()

    def make_archive(self, name='syndicaliste-main/skills/syndicaliste/SKILL.md', link=False):
        with tarfile.open(self.archive, 'w:gz') as tf:
            info = tarfile.TarInfo(name)
            data = b'# Skill de test\n'
            if link:
                info.type = tarfile.SYMTYPE
                info.linkname = str(self.home)
            else:
                info.size = len(data)
            tf.addfile(info, None if link else io.BytesIO(data))

    def run_install(self, *args, local=False):
        # Le script sur stdin reproduit curl | bash ; aucun fichier "$0" à relire.
        return subprocess.run(['bash', str(ROOT / 'install.sh'), *args] if local else ['bash', '-s', '--', *args],
                              input=None if local else (ROOT / 'install.sh').read_text(),
                              text=True, cwd=self.project, env=self.env, capture_output=True)

    def test_help_stdin(self):
        r = self.run_install('--help')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn('--global', r.stdout)

    def test_install_reinstall_uninstall_scoped(self):
        instructions = self.project / 'AGENTS.md'
        instructions.write_text('Instructions existantes\n')
        global_skill = self.home / '.agents/skills/syndicaliste'
        global_skill.mkdir(parents=True)
        (global_skill / 'intact').write_text('oui')
        for _ in range(2):
            r = self.run_install()
            self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(instructions.read_text().count('<!-- syndicaliste:debut -->'), 1)
        self.assertTrue((self.project / '.agents/skills/syndicaliste/SKILL.md').is_file())
        r = self.run_install('--desinstaller')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(instructions.read_text().strip(), 'Instructions existantes')
        self.assertTrue((global_skill / 'intact').is_file())
        self.assertFalse((self.project / '.agents/skills/syndicaliste').exists())
        self.assertFalse(list(self.base.glob('tmp.*')))

    def test_download_fail_preserves_old_skill(self):
        skill = self.project / '.agents/skills/syndicaliste'
        skill.mkdir(parents=True)
        (skill / 'ancien').write_text('intact')
        self.env['FAIL_CURL'] = '1'
        self.assertNotEqual(self.run_install().returncode, 0)
        self.assertEqual((skill / 'ancien').read_text(), 'intact')

    def test_unsafe_archives(self):
        for name, link in [('syndicaliste-main/../../sortie', False), ('/tmp/sortie', False), ('syndicaliste-main/skills/lien', True), ('autre/skill', False), ('syndicaliste-main/README.md', False)]:
            with self.subTest(name=name):
                self.make_archive(name, link)
                self.assertNotEqual(self.run_install().returncode, 0)
                self.assertFalse((self.project / '.agents').exists())
        self.archive.write_bytes(b'incomplete gzip')
        self.assertNotEqual(self.run_install().returncode, 0)

    def test_symlink_destination_and_instructions(self):
        outside = self.base / 'outside'
        outside.mkdir()
        (self.project / '.agents').symlink_to(outside, target_is_directory=True)
        self.assertNotEqual(self.run_install().returncode, 0)
        self.assertEqual(list(outside.iterdir()), [])
        (self.project / '.agents').unlink()
        text = outside / 'instructions'
        text.write_text('intact')
        (self.project / 'AGENTS.md').symlink_to(text)
        self.assertNotEqual(self.run_install().returncode, 0)
        self.assertEqual(text.read_text(), 'intact')

    def test_malformed_block_preserves_text(self):
        instructions = self.project / 'AGENTS.md'
        text = 'avant\n<!-- syndicaliste:debut -->\napres\n'
        instructions.write_text(text)
        self.assertNotEqual(self.run_install('--desinstaller').returncode, 0)
        self.assertEqual(instructions.read_text(), text)

    def test_local_global_and_no_adhesion(self):
        (self.home / '.codex').mkdir()
        r = self.run_install('--global', '--sans-adhesion', local=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual((self.home / '.agents/skills/syndicaliste/SKILL.md').read_bytes(), (ROOT / 'skills/syndicaliste/SKILL.md').read_bytes())
        self.assertFalse((self.home / '.codex/AGENTS.md').exists())
        r = self.run_install('--desinstaller', '--global')
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertFalse((self.home / '.agents/skills/syndicaliste').exists())
