// Prova dinàmica XSS (OWASP A03) sobre index.html i brigada.html amb dades malicioses
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8776';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1000 } });
  await ctx.addInitScript(() => {
    window.__x = f => { (window.__hits = window.__hits || new Set()).add(String(f)); };
    localStorage.setItem('motor-patrimoni.usuari', JSON.stringify({ nom: 'Auditor', email: 'a@x.cat', perfil: 'cap_manteniment', unitat: 'DGPAMN' }));
  });
  const hits = new Set(), errs = [], jsLinks = new Set();
  const recull = async (p, on) => {
    const h = await p.evaluate(() => [...(window.__hits || [])]).catch(() => []);
    h.forEach(x => hits.add(on + ' ← ' + x));
    const l = await p.evaluate(() => [...document.querySelectorAll('a[href],img[src],iframe[src]')].map(a => a.getAttribute('href') || a.getAttribute('src')).filter(u => /^\s*javascript:/i.test(u))).catch(() => []);
    l.forEach(x => jsLinks.add(on + ' ← ' + x.slice(0, 60)));
  };
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('index: ' + e.message)); p.on('dialog', d => d.dismiss());
  const tanca = async () => { for (let i = 0; i < 3; i++) { const f = p.locator('.finestra-fons'); if (!(await f.count())) return; await f.locator('button').last().click().catch(() => {}); await p.waitForTimeout(250); } };
  const pas = async (nom, fn) => { try { await fn(); } catch (e) { errs.push(`${nom}: ${e.message.split('\n')[0]}`); } await p.waitForTimeout(300); await recull(p, nom); await tanca(); };
  const QS = `dades=${BASE}/_xss/&unitats=${BASE}/_xss/unitats_promotores.json`;
  await p.goto(`${BASE}/index.html?${QS}`); await p.waitForTimeout(2500);
  await pas('inici', async () => { const b = p.locator('.finestra-fons button:has-text("Ara no")'); if (await b.count()) await b.click(); });
  // Mòdul 1: patrimoni
  await pas('patrimoni.espais', async () => { await p.locator('#parcs-resum [data-parc], #parcs-resum button, #parcs-resum .parc').first().click(); });
  await pas('patrimoni.fitxa', async () => { await p.locator('#llista-immobles button[data-id]').first().click(); await p.waitForTimeout(500); await p.$$eval('details', d => d.forEach(x => x.open = true)); });
  await pas('patrimoni.edicio', async () => { await p.locator('button:has-text("Editar")').first().click(); });
  await pas('patrimoni.registre', async () => { await p.goto(`${BASE}/index.html?${QS}`); await p.waitForTimeout(2000); const b = p.locator('.finestra-fons button:has-text("Ara no")'); if (await b.count()) await b.click(); await p.click('#btn-registre'); });
  // Mòdul 2: dades
  await pas('dades', async () => { await p.click('.nav-button[data-modul=dades]'); await p.waitForTimeout(800); });
  // Mòdul 3: manteniment
  await pas('mant.llista', async () => { await p.click('.nav-button[data-modul=manteniment]'); await p.waitForTimeout(600); });
  for (const ag of ['estat', 'prioritat', 'parc', 'equip', 'persona', 'tipologia']) {
    await pas('mant.tauler.' + ag, async () => { await p.click('#mant-vista [data-vista="tauler"]').catch(() => {}); await p.selectOption('#mf-agrupa', ag); });
    await pas('mant.llista.' + ag, async () => { await p.click('#mant-vista [data-vista="llista"]').catch(() => {}); });
  }
  await pas('mant.mapa', async () => { await p.click('#mant-vista [data-vista="mapa"]').catch(() => {}); await p.waitForTimeout(500); await p.$$eval('.leaflet-marker-icon, path.leaflet-interactive', l => l.slice(0, 5).forEach(x => x.dispatchEvent(new MouseEvent('click', { bubbles: true })))); });
  await p.click('#mant-vista [data-vista="llista"]').catch(() => {});
  for (let i = 1; i <= 7; i++) {
    const id = `MANT-2026-${String(i).padStart(4, '0')}`;
    await pas('mant.fitxa.' + id, async () => { await p.evaluate(id => { const e = document.querySelector(`[data-mant="${id}"]`); e && e.click(); }, id); await p.waitForTimeout(400); await p.$$eval('details', d => d.forEach(x => x.open = true)); });
    await pas('mant.gestio.' + id, async () => { const g = p.locator('#mant-panell [data-m="gestio"]'); if (await g.count()) await g.click(); await p.waitForTimeout(300); const c = p.locator('#mant-panell [data-m="cancela"]'); if (await c.count()) await c.click(); });
  }
  await pas('mant.config', async () => { await p.click('#mant-config'); await p.waitForTimeout(400); });
  await pas('mant.colles', async () => { await p.click('#mant-brigades'); await p.waitForTimeout(400); });
  await pas('mant.ordre', async () => { await p.click('#mant-ordre'); await p.waitForTimeout(400); });
  await pas('mant.periodiques', async () => { await p.click('#mant-periodiques'); await p.waitForTimeout(400); await p.locator('#mant-panell [data-pf], #mant-panell li button').first().click().catch(() => {}); });
  await pas('mant.nova', async () => { await p.click('#mant-nova'); await p.waitForTimeout(400); });
  // CSV (A03 - injecció de fórmules)
  let csv = '';
  await pas('mant.csv', async () => { const [d] = await Promise.all([p.waitForEvent('download', { timeout: 4000 }), p.click('#mant-csv')]); csv = require('fs').readFileSync(await d.path(), 'utf8'); });
  // Pantalles noves (10/11/2026): formulari de tasca periòdica, nova tasca amb parc, colles i opció periòdica, «Feina acabada» del Responsable
  const descarta = async () => { const f = p.locator('.finestra-fons:has-text("sense desar") [data-accio=si]'); if (await f.count()) { await f.click(); await p.waitForTimeout(300); } };
  const obre = async sel => { await p.click(sel); await p.waitForTimeout(300); await descarta(); await p.waitForTimeout(300); };
  await pas('mant.periodica.form', async () => { await obre('#mant-periodiques'); await p.locator('#mant-panell [data-per]').first().click(); await p.waitForTimeout(400); });
  await pas('mant.nova.periodica', async () => { await obre('#mant-nova'); const o = await p.$$eval('#mn-parc option', x => x.map(i => i.value).filter(Boolean)); await p.selectOption('#mn-parc', o[0]); await p.waitForTimeout(300); await p.check('#mn-periodica').catch(() => {}); await p.waitForTimeout(300); });
  await pas('mant.acabada', async () => { await obre('#mant-periodiques'); let fet = false; for (const id of await p.$$eval('#mant-llista [data-mant]', x => [...new Set(x.map(e => e.dataset.mant))])) { await p.evaluate(id => document.querySelector(`#mant-llista [data-mant="${id}"]`)?.click(), id); await p.waitForTimeout(250); await descarta(); const b = p.locator('#mant-panell [data-m="acabada"]'); if (await b.count()) { await b.click(); await p.waitForTimeout(400); fet = true; break; } } if (!fet) throw new Error('cap tasca amb «Feina acabada»'); });
  // Pestanya «Dades manteniment» (11/11/2026): indicadors, barres i formatges per a totes les dimensions
  await pas('dadesmant', async () => { await obre('.nav-button[data-modul=dadesmant]'); await p.check('#mf-tancades').catch(() => {});
    for (const tipus of ['barres', 'formatge']) { await p.click(`#dm-tipus [data-tipus=${tipus}]`); for (const d of await p.$$eval('#dm-dim option', x => x.map(o => o.value))) { await p.selectOption('#dm-dim', d); await p.waitForTimeout(150); await p.hover('#dm-grafic [data-i]').catch(() => {}); } }
    await p.click('.dm-taula summary'); await p.waitForTimeout(150); });
  // Webapp de la colla
  const q = await ctx.newPage(); q.on('pageerror', e => errs.push('brigada: ' + e.message)); q.on('dialog', d => d.dismiss());
  await q.goto(`${BASE}/brigada.html?dades=${BASE}/_xss/`); await q.waitForTimeout(1500); await recull(q, 'brigada.acces');
  try {
    await q.selectOption('#acc-parc', 'PNAE').catch(() => {}); await q.selectOption('#acc-brigada', { index: 0 }).catch(() => {});
    await q.fill('#acc-nom', 'Auditor').catch(() => {}); await q.click('#acc-entra'); await q.waitForTimeout(1000); await recull(q, 'brigada.llista');
    const opcions = await q.locator('#f-tasca option').evaluateAll(o => o.map(x => x.value).filter(Boolean));
    for (const v of opcions) { await q.selectOption('#f-tasca', v); await q.waitForTimeout(300); await recull(q, 'brigada.fitxa.' + v); }
    await q.click('nav.baix [data-v=llista]').catch(() => {}); await q.waitForTimeout(300); await recull(q, 'brigada.registres');
    await q.click('nav.baix [data-v=nova]').catch(() => {}); await q.waitForTimeout(300); await recull(q, 'brigada.nova');
  } catch (e) { errs.push('brigada: ' + e.message.split('\n')[0]); }
  // Paràmetre ?dades= cap a un origen extern (A10/A05)
  const ext = await ctx.newPage(); const pet = [];
  ext.on('request', r => { if (/evil\.example/.test(r.url())) pet.push(r.url()); });
  await ext.goto(`${BASE}/index.html?dades=https://evil.example/data/&unitats=https://evil.example/u.json`); await ext.waitForTimeout(2000);
  const ext2 = await ctx.newPage(); ext2.on('request', r => { if (/evil\.example/.test(r.url())) pet.push(r.url()); });
  await ext2.goto(`${BASE}/brigada.html?dades=https://evil.example/data/`); await ext2.waitForTimeout(1500);
  // Informe
  const csvFormules = csv.split('\n').filter(l => /(^|;|,)"?[=+\-@]/.test(l)).length;
  console.log(JSON.stringify({ xss_executat: [...hits], enllacos_javascript: [...jsLinks], peticions_a_origen_extern: [...new Set(pet)].slice(0, 6), csv_cel_les_amb_formula: csvFormules, errors: errs.slice(0, 15) }, null, 1));
  await b.close();
})();
