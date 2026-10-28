// Contrôle hors réseau : aucun appel gh, aucune réécriture des pages.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../../', import.meta.url);
const lire = (path) => readFileSync(new URL(path, root));
for (const file of readdirSync(new URL('skills/syndicaliste/data/', root)).filter((f) => f.endsWith('.json'))) {
  assert.deepEqual(lire(`site/public/data/${file}`), lire(`skills/syndicaliste/data/${file}`), `copie périmée : ${file}`);
}
for (const file of readdirSync(new URL('grand-public/', root)).filter((f) => /^instructions-.*\.txt$/.test(f))) {
  assert.deepEqual(lire(`site/public/data/${file}`), lire(`grand-public/${file}`), `copie périmée : ${file}`);
}
assert.deepEqual(lire('site/public/install.sh'), lire('install.sh'), 'install.sh public périmé');
const headers = lire('site/public/_headers').toString();
const csp = headers.match(/^  Content-Security-Policy: (.+)$/m)?.[1];
assert.ok(csp);
assert.ok(csp.includes("object-src 'none'") && csp.includes("base-uri 'none'"));
assert.ok(!csp.match(/script-src[^;]*'unsafe-inline'/));
assert.ok(csp.includes('frame-src https://www.youtube-nocookie.com'));
for (const f of readdirSync(new URL('site/public/', root), { recursive: true }).filter((f) => f.endsWith('.html'))) {
  const html = lire(`site/public/${f}`).toString();
  for (const [, script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (!script) continue;
    const hash = createHash('sha256').update(script).digest('base64');
    assert.ok(csp.includes(`'sha256-${hash}'`), `CSP bloque un script dans ${f}`);
  }
  assert.ok(!/\son\w+\s*=/i.test(html), `gestionnaire inline interdit : ${f}`);
}
console.log('Public : données, instructions, installateur et CSP à jour');
