// A08/A01: importació d'un fitxer de colla manipulat
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const pac = { format: 'motor-patrimoni.registres-brigada', versio: 2, unitat: 'PNAE', brigada: 'colla_x', prova: false,
    registres: [{ id: 'REG-X', tasca: 'MANT-2026-0003', data: '2026-11-05', hores: 'molt', persones: 2, resultat: 'acabada', fotos: ['data:text/html;base64,PHNjcmlwdD48L3NjcmlwdD4='], creat: '2026-11-05T10:00:00Z' }],
    peticions: [{ id: 'BRG-X', unitat: 'PNCC', descripcio: 'tasca en un altre parc', fotos: [] }] };
  const pac2 = { ...pac, registres: [], peticions: [{ id: 'BRG-Y', unitat: 'PNAE', descripcio: 'ok', fotos: ['data:image/svg+xml;base64,PHN2Zy8+'] }] };
  const pac3 = { ...pac, brigada: 'colla_altra', registres: [{ id: 'REG-Z', tasca: 'MANT-2026-0003', data: '2026-11-05', hores: 1, persones: 1, resultat: 'acabada', fotos: [], creat: '2026-11-05T10:00:00Z' }], peticions: [] };
  fs.writeFileSync('./p1.json', JSON.stringify(pac)); fs.writeFileSync('./p2.json', JSON.stringify(pac2)); fs.writeFileSync('./p3.json', JSON.stringify(pac3));
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('motor-patrimoni.usuari', JSON.stringify({ nom: 'Auditor', email: 'a@x.cat', perfil: 'cap_manteniment', unitat: 'DGPAMN' })));
  const p = await ctx.newPage(); p.on('dialog', d => d.dismiss());
  await p.goto(''+(process.env.BASE||'http://localhost:8776')+'/index.html?dades='+(process.env.BASE||'http://localhost:8776')+'/_xss/&unitats='+(process.env.BASE||'http://localhost:8776')+'/_xss/unitats_promotores.json'); await p.waitForTimeout(2500);
  const ara = p.locator('.finestra-fons button:has-text("Ara no")'); if (await ara.count()) await ara.click();
  await p.click('.nav-button[data-modul=manteniment]'); await p.waitForTimeout(500);
  const resultat = {};
  for (const f of ['p1', 'p2', 'p3']) {
    const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('#mant-importa')]); await fc.setFiles(`./${f}.json`); await p.waitForTimeout(1200);
    resultat[f] = (await p.locator('.finestra-fons').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 260);
    const fn = p.locator('.finestra-fons button'); if (await fn.count()) await fn.last().click(); await p.waitForTimeout(300);
  }
  resultat.estat_0003 = await p.evaluate(() => document.querySelector('[data-mant="MANT-2026-0003"]')?.closest('li, .mant-carta')?.innerText.slice(0, 120));
  console.log(JSON.stringify(resultat, null, 1)); await b.close();
})();
