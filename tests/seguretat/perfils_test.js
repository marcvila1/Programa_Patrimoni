const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript(() => { window.showDirectoryPicker = async () => navigator.storage.getDirectory(); FileSystemHandle.prototype.queryPermission = async () => 'granted'; FileSystemHandle.prototype.requestPermission = async () => 'granted'; });
  const csp = [];
  const p = await ctx.newPage(); p.on('dialog', d => d.accept()); p.on('console', m => { if (/Content Security Policy|Refused to/i.test(m.text())) csp.push(m.text().slice(0, 160)); });
  await p.addInitScript(() => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('motor-patrimoni.usuari', JSON.stringify({ nom: 'Resp Bo', email: 'resp@gencat.cat', perfil: 'cap_manteniment', unitat: 'DGPAMN' })); } });
  const U = 'http://localhost:8776/index.html?dades=http://localhost:8776/data/&unitats=http://localhost:8776/data/unitats_promotores.json';
  await p.goto(U); await p.click('.finestra-fons button:has-text("Tria la carpeta")'); await p.waitForTimeout(2500);
  const f = p.locator('.finestra-fons'); if (await f.count()) await f.locator('button').last().click();
  await p.click('.nav-button[data-modul=manteniment]'); await p.waitForTimeout(400);
  await p.click('#mant-config'); await p.waitForSelector('#cf-autoritzats');
  await p.fill('#cf-autoritzats', 'altre@gencat.cat; cap_manteniment; *'); await p.click('#mant-panell [data-m="desa"]'); await p.waitForTimeout(400);
  console.log('sense incloure’s:', (await p.locator('#mant-errors').innerText()).slice(0, 140));
  await p.fill('#cf-autoritzats', 'resp@gencat.cat; cap_manteniment; *\nmal format'); await p.click('#mant-panell [data-m="desa"]'); await p.waitForTimeout(400);
  console.log('línia dolenta:', (await p.locator('#mant-errors').innerText()).slice(0, 140));
  await p.fill('#cf-autoritzats', 'resp@gencat.cat; cap_manteniment; *\ndirectora@gencat.cat; direccio; PNAE'); await p.click('#mant-panell [data-m="desa"]'); await p.waitForTimeout(600);
  console.log('desat:', (await p.locator('#mant-errors').innerText()).trim() || 'OK');
  // Una altra persona que s'atribueix el perfil
  await p.evaluate(() => { S.usuari = { nom: 'Intrús', email: 'intrus@gencat.cat', perfil: 'cap_manteniment', unitat: 'DGPAMN' }; verificaPerfil(); });
  await p.waitForTimeout(500);
  console.log('intrús ara és:', await p.evaluate(() => JSON.parse(localStorage.getItem('motor-patrimoni.usuari')).perfil), '|', (await p.locator('#toasts').innerText().catch(() => '')).slice(0, 140));
  // Diàleg d'identificació: no deixa triar el perfil sense estar autoritzat
  await p.click('#btn-usuari').catch(() => {});
  await p.waitForTimeout(400);
  if (await p.locator('#u-perfil').count()) {
    await p.selectOption('#u-perfil', 'direccio'); await p.selectOption('#u-unitat', 'PNAE'); await p.locator('.finestra-fons button:has-text("Desa")').click(); await p.waitForTimeout(300);
    console.log('diàleg:', (await p.locator('#u-perfil').locator('xpath=..').locator('.camp-error').innerText()).slice(0, 120));
  } else console.log('diàleg: no trobat');
  // Webapp: botó Surt
  const q = await ctx.newPage(); q.on('dialog', d => d.accept()); q.on('console', m => { if (/Content Security Policy|Refused to/i.test(m.text())) csp.push('BR ' + m.text().slice(0, 160)); });
  await q.goto('http://localhost:8776/brigada.html?prova=1'); await q.waitForTimeout(1200);
  console.log('surt visible', await q.isVisible('#btn-surt')); await q.click('#btn-surt'); await q.waitForTimeout(500);
  console.log('després de sortir: accés', await q.isVisible('#vista-acces'), '| usuari', await q.evaluate(() => localStorage.getItem('motor-patrimoni.brigada.usuari')));
  console.log('CSP', csp.slice(0, 5)); await b.close();
})();
