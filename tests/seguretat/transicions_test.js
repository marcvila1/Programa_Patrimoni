// Prova de control d'accés (OWASP A01) dels canvis d'estat: es manipula el desplegable de «Gestiona» per forçar
// «Assignada → Pendent de verificar». La direcció del parc ha de ser rebutjada; el Responsable de brigades, acceptat.
// Prepara les dades a _trans/ (a .gitignore) a partir de data/ i les esborra en acabar.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8776', ARREL = path.join(__dirname, '..', '..'), DIR = path.join(ARREL, '_trans');
fs.rmSync(DIR, { recursive: true, force: true }); fs.cpSync(path.join(ARREL, 'data'), DIR, { recursive: true });
const br = JSON.parse(fs.readFileSync(path.join(DIR, 'brigades.json'), 'utf8'));
br.per_parc.PNAE.brigades = [{ codi: 'C1', nom: 'Colla Nord', activa: true, cap: { nom: 'Cap Prova' }, membres: [] }];
fs.writeFileSync(path.join(DIR, 'brigades.json'), JSON.stringify(br));
fs.writeFileSync(path.join(DIR, 'manteniment.json'), JSON.stringify([{ id: 'MANT-2026-0001', versio: 1, creat: '2026-11-01T10:00:00Z', modificat: '2026-11-01T10:00:00Z',
  sollicitant: { nom: 'X' }, unitat: 'PNAE', utm: { x: null, y: null }, element: null, categoria: 'manteniment', tipologia: 'equipaments_installacions', titol: 'Prova', descripcio: 'Prova',
  hores_estimades: 7, fotografies: [], certificacions_hores: [], estat: 'assignada', model_estats: 2,
  gestio: { prioritat: 'moderada', data_limit: '2026-12-01', responsable: 'brigada_parc', brigada: 'C1', brigades: ['C1'], persona: null, persones: [] }, historial: [] }]));
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 1600, height: 1100 } }), R = {};
  for (const perfil of ['direccio', 'cap_manteniment']) {
    const p = await ctx.newPage(); p.on('dialog', d => d.dismiss());
    await p.addInitScript(pf => localStorage.setItem('motor-patrimoni.usuari', JSON.stringify({ nom: 'U', email: 'u@x.cat', perfil: pf, unitat: 'PNAE' })), perfil);
    await p.goto(`${BASE}/index.html?dades=${BASE}/_trans/`); await p.waitForTimeout(2500);
    const ara = p.locator('.finestra-fons button:has-text("Ara no")'); if (await ara.count()) await ara.click();
    await p.click('.nav-button[data-modul=manteniment]'); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelector('[data-mant="MANT-2026-0001"]').click()); await p.waitForTimeout(500);
    R[perfil + '.boto_feina_acabada'] = await p.locator('#mant-panell [data-m=acabada]').count();
    await p.click('#mant-panell [data-m=gestio]'); await p.waitForTimeout(500);
    await p.evaluate(() => { const s = document.querySelector('#mg-estat'); if (![...s.options].some(o => o.value === 'pendent_verificacio')) s.add(new Option('x', 'pendent_verificacio')); s.value = 'pendent_verificacio'; });
    await p.click('#mant-panell [data-m=desa]'); await p.waitForTimeout(800);
    R[perfil + '.resultat'] = (await p.locator('#mant-errors').count()) ? 'REBUTJAT: ' + (await p.textContent('#mant-errors')).trim() : 'DESAT';
    await p.close();
  }
  await b.close(); fs.rmSync(DIR, { recursive: true, force: true });
  R.correcte = R['direccio.boto_feina_acabada'] === 0 && R['direccio.resultat'].startsWith('REBUTJAT') && R['cap_manteniment.boto_feina_acabada'] === 1 && R['cap_manteniment.resultat'] === 'DESAT';
  console.log(JSON.stringify(R, null, 1));
})();
