import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onRequest } from '../functions/api/_middleware.js';
import { onRequestGet as statut } from '../functions/api/statut.js';
import { onRequestGet as calendrier } from '../functions/api/greves.json.js';
const env = { ASSETS: { fetch: async (url) => new Response(readFileSync(new URL(`../public${url.pathname}`, import.meta.url))) } };
const appeler = (query = '', method = 'GET', handler = statut, assets = env) => {
  const request = new Request(`https://exemple.test/api/statut?${query}`, { method, headers: { Origin: 'https://autre.test' } });
  return onRequest({ request, next: () => handler({ request, env: assets }) });
};
for (const query of ['', 'centrale=fo&statut=prive', 'maintenant=2026-11-05T10:00', 'maintenant=2028-02-29T10:00Z', 'horaires=09:00-12:30,13:30-17:00']) {
  const r = await appeler(query);
  assert.equal(r.status, 200, query);
  assert.ok((await r.json()).bandeau);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
}
for (const query of ['centrale=constructor', 'statut=__proto__', 'centrale=toString', 'tz=invalid', 'centrale=inconnue', 'horaires=99:99-17:00', 'horaires=17:00-09:00', 'horaires=09:00-12:00,11:00-17:00', 'horaires=09:00-10:00-garbage', 'maintenant=2026-02-30', 'maintenant=2026-13-01', 'maintenant=2026-01-01T25:00', 'centrale=fo&centrale=cgt', 'alsace_moselle=oui', `tz=${'a'.repeat(300)}`]) {
  const r = await appeler(query);
  assert.equal(r.status, 400, query);
  assert.equal(typeof (await r.json()).erreur, 'string');
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), '*');
}
for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
  const r = await appeler('', method);
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('Allow'), 'GET, HEAD, OPTIONS');
}
for (const handler of [statut, calendrier]) {
  const r = await appeler('', 'HEAD', handler);
  assert.equal(r.status, 200);
  assert.equal(await r.text(), '');
}
const preflight = await appeler('', 'OPTIONS', () => { throw new Error('ne pas appeler'); });
assert.equal(preflight.status, 204);
assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'GET, HEAD, OPTIONS');
assert.equal(preflight.headers.get('Access-Control-Allow-Credentials'), null);
const error = await appeler('', 'GET', () => { throw new Error('secret-interne'); });
assert.equal(error.status, 500);
assert.equal(error.headers.get('Access-Control-Allow-Origin'), '*');
assert.equal(error.headers.get('X-Content-Type-Options'), 'nosniff');
assert.ok(error.headers.get('Content-Security-Policy').includes("default-src 'none'"));
assert.ok(!(await error.text()).includes('secret-interne'));
console.log('API : entrées, méthodes, CORS, HEAD et erreurs contrôlés');
