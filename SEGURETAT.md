# Seguretat del Motor de Patrimoni i de la webapp de les colles

Aquest document recull l'auditoria de seguretat feta seguint l'**OWASP Top 10 (2021)** sobre `index.html` (Motor de Patrimoni) i `brigada.html` (webapp de les colles), les correccions aplicades, la valoració del nivell de seguretat i les condicions que cal complir per fer-los servir amb garanties.

Data de l'auditoria: 07/11/2026. Versió auditada: la de la branca `main` amb els canvis de títol, categoria, documents, avisos, ordre de les colles i connexió de `brigada.html` a la carpeta de treball.

Revisió del 10/11/2026 (branca `canvis-gestio-brigades`): «Ordre de les colles» passa a dir-se «Pla de treball» (el fitxer continua sent `ordre_colles.json`), la nova tasca admet prioritat, colles i persones i es pot marcar com a periòdica, i la direcció del parc ja no té el camp «Càrrec». No canvia cap control ni el format d'importació de `brigada.html`. La creació d'una tasca periòdica des de «Nova tasca» té la mateixa restricció que el botó «Tasques periòdiques»: només el Responsable de brigades o la direcció del parc (es comprova en mostrar l'opció i, de nou, en desar). Tots els textos nous es mostren escapats. S'han tornat a passar `xss_test.js`, `import_test.js` i `perfils_test.js` amb els resultats esperats (0 càrregues executades, 0 enllaços `javascript:`, fitxers de colla manipulats rebutjats, perfils i CSP correctes).

En la mateixa branca: el **Responsable de brigades** pot passar una tasca assignada a «Pendent de verificar» (s'amplia el rol a la regla de `transicions`; la direcció del parc continua sense poder-ho fer, i la permissió es comprova igual que la resta de canvis d'estat), i es corregeix que la confirmació de treure la colla en arrossegar una targeta a «Sense assignar» no s'aplicava. Les proves de seguretat s'han tornat a passar amb els mateixos resultats.

**Resultats de la bateria completa del 10/11/2026** (commit d'aquesta branca, Chromium amb Playwright, Leaflet 1.9.4 servit des del paquet oficial de npm amb el mateix SRI):

| Prova | OWASP | Resultat |
|---|---|---|
| `xss_test.js`: càrregues XSS a tots els camps i totes les pantalles, incloses les noves (Pla de treball, nova tasca periòdica, formulari de periòdica, «Feina acabada») | A03 | 0 executades · 0 enllaços `javascript:` · 0 errors de recorregut |
| `xss_test.js`: fonts de dades externes (`?dades=https://evil.example/…`) | A05, A10 | 0 peticions a `evil.example` |
| `xss_test.js`: CSV amb fórmules | A03 | 0 cel·les amb fórmula |
| `import_test.js`: fitxers de colla manipulats | A01, A08 | 3 de 3 rebutjats |
| `perfils_test.js`: perfils no autoritzats, «Surt», CSP | A01, A02, A05, A07 | Correcte · 0 errors de CSP |
| `transicions_test.js`: canvi d'estat forçat | A01, A04 | Direcció rebutjada · Responsable acceptat |
| SRI de Leaflet comparat amb el paquet de npm | A06, A08 | Coincideix (`leaflet.js` i `leaflet.css`) |
| Revisió de codi del canvi (llista de control, apartat 9) | — | Tot el text nou a `innerHTML` passa per `esc()`; cap `href`/`src` nou; cap domini nou a la CSP |

Correcció afegida arran de la revisió: en desar «Gestiona», el programa comprova que el canvi d'estat estigui permès al perfil (abans només ho limitaven les opcions del desplegable). Els riscos residuals de l'apartat 6 no canvien: sense autenticació real ni servidor (A04, A07), el control efectiu continua sent els permisos de la carpeta de SharePoint.

Revisió de l'11/11/2026: nova pestanya **«Dades brigades»** amb els indicadors i un gràfic de barres o de formatges. Els noms de les categories (colles, persones, tipologies, parcs) es mostren sempre escapats a les barres, a la llegenda, a la taula i al tooltip; el gràfic es dibuixa amb SVG i HTML propis, sense cap llibreria ni domini nou a la CSP; l'única dada que es desa al navegador és el tipus de gràfic triat (`motor-patrimoni.dm-tipus`, amb `try/catch`). `xss_test.js` recorre ara aquesta pestanya amb totes les dimensions en barres i en formatges: 0 càrregues executades, i la resta de proves amb els mateixos resultats.

Ampliació del mateix dia: **filtre per data** (entrada, límit o tancament; camps `type="date"`, comparats com a text AAAA-MM-DD, sense cap valor inserit a l'HTML) i dos botons de **descàrrega en CSV** a «Dades brigades». Tots dos fitxers passen per `aCSV()`, que neutralitza les fórmules (A03); el resum inclou el text dels filtres i el nom de l'usuari, que ja són a la pantalla. `xss_test.js` descarrega també el CSV de resum amb les dades malicioses: **0 cel·les amb fórmula**.

Ampliació del mateix dia: **municipi** de les tasques (calculat a partir de l'immoble o, sense immoble, camp de text opcional `municipi` de màxim 80 caràcters) i **filtre per municipi**. El valor es mostra sempre escapat (fitxa, llista, filtre, llista desplegable `datalist`, gràfic, taula i tooltip) i passa per `aCSV()` a les exportacions. `genera_malicios.py` posa càrregues XSS al municipi de les tasques i de les tasques periòdiques: 0 executades; la resta de proves, amb els mateixos resultats. El format d'importació de `brigada.html` no canvia.

---

## 1. Resum

| | Abans | Després |
|---|---|---|
| Injecció de codi (XSS) en mostrar dades | No n'hi havia: tot el text es mostra escapat | Igual |
| Enllaços `javascript:` executables des de les dades | **20 trobats** | **0** |
| Fonts de dades alienes per l'adreça (`?dades=`) | **S'acceptaven** | Es rebutgen |
| Fitxers de colla manipulats (altre parc, altra colla, fotos no vàlides) | **S'importaven** | Es rebutgen |
| Fórmules a l'exportació CSV | **2 cel·les executables a l'Excel** | 0 |
| Política de seguretat de continguts (CSP) i integritat de la llibreria de mapes (SRI) | No | Sí |
| Limitació dels perfils amb permisos de gestió | No | Sí (llista de persones autoritzades) |
| Esborrat de les dades d'un dispositiu compartit | No | Sí (botó «Surt») |

**Valoració global:** el nivell passa de **baix-mitjà (4/10)** a **mitjà (6,5/10)**. És **adequat per a les proves i per a un pilot intern** si es compleixen les condicions de l'apartat 6. **No és adequat** per a dades personals sensibles, ni per fer-lo servir sense permisos de SharePoint ben definits. El límit el posa l'arquitectura: un programa que s'executa sencer al navegador, sense servidor ni autenticació, no pot garantir per si sol qui fa què. La solució definitiva és SINATCAT (apartat 7).

---

## 2. Arquitectura i model d'amenaces

### 2.1. Com funcionen els programes

- **Dos fitxers HTML** independents, sense instal·lació ni servidor. Tot el codi s'executa al navegador de qui els obre.
- **Dades en fitxers JSON:**
  - **Carpeta de treball** (SharePoint sincronitzat amb OneDrive), subcarpeta `patrimoni/`. És on es treballa cada dia, i on llegeixen i escriuen `index.html` i `brigada.html` (aquest, a l'ordinador).
  - **GitHub** (`marcvila1/Programa_Patrimoni`, repositori **públic**), carpeta `data/`. Còpia de consulta, que es publica a mà.
- **Identificació:** la persona escriu el seu nom, correu i perfil. No hi ha contrasenya ni validació contra el directori de la Generalitat.
- **Correus:** enllaços `mailto:` (els obre la persona) i una bústia de fitxers (`patrimoni/avisos_correu/`) que ha d'enviar un flux de Power Automate.
- **Dependència externa:** Leaflet 1.9.4 (mapes), carregada d'unpkg.com, i els mapes base de l'ICGC i d'OpenStreetMap.

### 2.2. Què cal protegir

| Actiu | Per què |
|---|---|
| Integritat de les dades (immobles, tasques, hores, estats) | Decisions de gestió, hores certificades, historial |
| Dades personals (noms, correus i telèfons del personal, membres de les colles) | RGPD |
| Disponibilitat de la carpeta de treball | Sense carpeta no es pot treballar |
| Reputació i correu institucional | Els avisos surten amb comptes de gencat |

### 2.3. Amenaces considerades

1. Algú amb accés a la carpeta que **es fa passar per un altre perfil** (per exemple, un tècnic que es declara Responsable de brigades).
2. Un **enllaç maliciós** que fa obrir el programa amb dades falses (`?dades=https://…`).
3. Dades malicioses (introduïdes per qualsevol persona amb accés d'escriptura, o un fitxer de colla manipulat) que intenten **executar codi** al navegador d'una altra persona.
4. Un fitxer de colla que intenta **modificar tasques d'un altre parc o d'una altra colla**.
5. **Exfiltració** de dades a servidors externs si s'arribés a executar codi.
6. **Fuites de dades personals** per la publicació al GitHub públic o per dispositius compartits.
7. **Manipulació d'una llibreria externa** (Leaflet) servida per un CDN compromès.
8. Ús del flux d'avisos per **enviar correus no desitjats** en nom de la DGPAMN.

---

## 3. Metodologia de les proves

Les proves són automàtiques (Playwright, Chromium) i es poden repetir (apartat 8):

1. **Injecció (XSS):** es genera un conjunt de dades on **cada camp de text** (més de 4.500, de tots els fitxers JSON: immobles, tasques, colles, configuració, tipologies, ordre, periòdiques) porta una càrrega que crida una funció trampa si s'executa: `"'><img src=x onerror=…><svg onload=…>`. Els camps d'adreça porten `javascript:…`. Es recorren totes les pantalles dels dos programes: llista i fitxa d'immobles, edició, registre de canvis, Gestió de dades, tauler i llista de tasques en totes les agrupacions, mapa, fitxa i gestió de cada estat de tasca, Dades brigades (indicadors i gràfics), Configuració dels parcs, Colles, Pla de treball (abans «Ordre de les colles»), Tasques periòdiques, Nova tasca (també marcada com a periòdica) i la webapp de la colla. Es comprova si s'executa alguna càrrega i si queda algun enllaç o imatge amb `javascript:`.
2. **Fonts de dades:** s'obren tots dos programes amb `?dades=https://evil.example/…` i es comprova si fan peticions a aquell servidor.
3. **Importació manipulada:** tres fitxers de colla falsos: un registre amb hores no numèriques, una foto `data:text/html` i una tasca nova en un altre parc; una foto SVG; i un registre en una tasca d'una altra colla.
4. **CSV:** s'exporta una tasca amb el títol `=HYPERLINK(…)` i la descripció `+cmd|…`, i es compta quantes cel·les comencen per un caràcter de fórmula.
5. **Camins de fitxer:** fotografies i documents amb camins `../../variables.json` i documents `data:text/html`.
6. **Perfils:** algú no autoritzat que es declara Responsable de brigades o Director/a.
7. **CSP:** es recorren els fluxos principals i es comprova que la política no bloqueja res legítim.
8. **Canvis d'estat manipulats** (`transicions_test.js`, des del 10/11/2026): es força al desplegable de «Gestiona» el pas «Assignada → Pendent de verificar». Amb el perfil de direcció del parc s'ha de rebutjar; amb el de Responsable de brigades, s'ha d'acceptar.
9. **Regressió funcional:** es tornen a passar les proves de funcionament de les darreres setmanes. Cobreixen el circuit complet entre `index.html` i `brigada.html` amb la carpeta, la validació, els documents adjunts, el descart amb justificació, els avisos i l'ordre de les colles.

---

## 4. Resultats per categoria OWASP Top 10 (2021)

Gravetat: 🔴 alta · 🟠 mitjana · 🟡 baixa · 🟢 correcte.

| OWASP | Què s'ha trobat | Abans | Correcció | Després |
|---|---|---|---|---|
| **A01 Control d'accés** | Qualsevol persona pot declarar-se Responsable de brigades o Director/a i gestionar-ho tot. Un fitxer de colla podia crear tasques en un altre parc i registrar feina en tasques d'una altra colla. Camins de fitxer amb `..` | 🔴 | Llista de **perfils autoritzats** (per correu i parc). Validació del parc i de la colla en importar i en l'escriptura directa de `brigada.html`. Camins limitats a `manteniment_fotos/` i `manteniment_documents/` | 🟠 (residual: no hi ha autenticació real) |
| **A02 Fallades criptogràfiques / dades sensibles** | Dades en clar en fitxers JSON i al dispositiu (IndexedDB i localStorage). Repositori GitHub **públic**: si s'hi publiquen `manteniment.json`, `brigades.json` o `variables.json`, s'exposen noms, correus i telèfons | 🟠 | Botó **«Surt»** a `brigada.html`, que esborra les dades del dispositiu. Capçalera `no-referrer`. Instruccions de publicació (apartat 6.2) | 🟠 (depèn de com es publiqui) |
| **A03 Injecció** | Escapament correcte de tot el text: **cap XSS** amb més de 4.500 camps contaminats. Però 20 enllaços `javascript:` (camps d'URL dels immobles, fotos i documents) i injecció de fórmules al CSV | 🔴 | Funció `urlSegura`: només http(s), camins relatius i imatges o documents incrustats d'un tipus permès. Cel·les CSV que comencen per `= + - @` precedides d'un apòstrof | 🟢 |
| **A04 Disseny insegur** | Sense servidor, totes les regles (rols, transicions, validacions) s'apliquen al navegador i es poden saltar editant els JSON | 🟠 | Validacions afegides a les importacions. Documentat que el control real són els permisos de SharePoint | 🟠 (inherent a l'arquitectura) |
| **A05 Configuració** | Sense CSP. Paràmetre `?dades=` obert a qualsevol servidor | 🔴 | **CSP** restrictiva: scripts i estils només del mateix lloc i d'unpkg; connexions només al GitHub de la DGPAMN; imatges només dels servidors de mapes; sense `object`, `frame` ni `base`. **Llista blanca de fonts de dades** | 🟢 (residual: cal `'unsafe-inline'`) |
| **A06 Components vulnerables** | Leaflet 1.9.4 és la darrera versió estable i no té vulnerabilitats conegudes | 🟢 | — | 🟢 |
| **A07 Identificació i autenticació** | No n'hi ha: nom i correu declarats per la persona | 🔴 | Llista de perfils autoritzats (control d'organització) | 🟠 (cal SINATCAT o Entra ID) |
| **A08 Integritat de programari i dades** | Leaflet carregat sense verificació. Fitxers de colla importats sense validar (tipus, mides, fotos) | 🟠 | **SRI** (sha256) a Leaflet, comprovat amb el paquet oficial de npm. Validació completa dels fitxers de colla: format, parc, colla, tipus, mides, nombre d'elements i fotos només JPEG/PNG/WebP | 🟢 |
| **A09 Registre i monitoratge** | Hi ha historial per tasca i registre de canvis, però són als mateixos fitxers que es poden editar | 🟡 | Recomanat activar l'historial de versions i l'auditoria de SharePoint/M365 (apartat 6.1) | 🟡 |
| **A10 Falsificació de peticions (SSRF i fonts externes)** | Amb `?dades=` i `?unitats=` es podien fer carregar dades de qualsevol servidor | 🔴 | Només s'accepten el mateix lloc i `raw.githubusercontent.com/marcvila1/`. La resta s'ignora i s'avisa | 🟢 |

### 4.1. Proves repetides després de les correccions

| Prova | Abans | Després |
|---|---|---|
| Càrregues XSS executades (més de 4.500 camps, totes les pantalles) | 0 | 0 |
| Enllaços o imatges `javascript:` al DOM | 20 | **0** |
| Peticions a `evil.example` amb `?dades=` (index i webapp) | 6 o més | **0** |
| Fitxer de colla amb hores no numèriques i foto `data:text/html` | Importat | **Rebutjat**: «el registre REG-X té dades no vàlides» |
| Tasca nova d'un altre parc dins el fitxer d'una colla | **Creada** (MANT-2026-0008 al PNCC) | **Rebutjada** |
| Foto SVG en una tasca nova | Importada | **Rebutjada** |
| Registre en una tasca d'una altra colla | **Importat** | **Rebutjat**: «és d'una tasca que no és d'aquesta colla» |
| Cel·les CSV amb fórmula executable | 2 | **0** |
| Persona no autoritzada que es declara Responsable de brigades | Accepta | Passa a **Tècnic/a** i rep un avís |
| Diàleg d'identificació amb un perfil no autoritzat | Accepta | No deixa desar |
| Errors de CSP en els fluxos normals | — | 0 |
| Proves funcionals (circuit colla ↔ Responsable, documents, descart, avisos, ordre) | Correctes | **Correctes** |
| Canvi d'estat forçat manipulant el formulari (direcció → «Pendent de verificar») | — | **Rebutjat** (10/11/2026) |

### 4.2. Valoració per àmbits (de 0 a 10)

| Àmbit | Abans | Després |
|---|---|---|
| Injecció i tractament de les dades | 6 | 9 |
| Configuració i dependències | 3 | 8 |
| Integritat de les importacions | 3 | 8 |
| Control d'accés | 2 | 4 |
| Autenticació | 1 | 3 |
| Protecció de dades personals | 4 | 6 |
| Traçabilitat | 5 | 6 |
| **Global** | **4** | **6,5** |

El control d'accés i l'autenticació no poden pujar més sense un servidor. La resta d'àmbits estan al nivell que permet l'arquitectura actual.

---

## 5. Controls implementats

### 5.1. Als dos programes

- **Política de seguretat de continguts (CSP)**, a la capçalera de cada HTML:
  - `script-src` i `style-src`: el mateix lloc i `unpkg.com` (Leaflet).
  - `connect-src`: el mateix lloc, `raw.githubusercontent.com`, `data:` i `blob:`.
  - `img-src`: el mateix lloc, `data:`, `blob:`, ICGC, OpenStreetMap i GitHub.
  - `object-src`, `frame-src`, `worker-src`, `base-uri` i `form-action`: cap.
  - Si mai s'injectés codi, no podria carregar scripts d'altres llocs ni enviar dades a servidors externs.
- **Integritat de Leaflet (SRI):** `leaflet.js` (`sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=`) i `leaflet.css` (`sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=`), verificats amb el paquet oficial `leaflet@1.9.4` de npm. Si el CDN servís una versió alterada, el navegador no la carregaria.
- **`referrer: no-referrer`:** l'adreça del programa (amb els paràmetres) no s'envia als servidors de mapes.
- **Fonts de dades:** `?dades=` i `?unitats=` només admeten el mateix lloc, fitxers locals si el programa s'obre en local, i `https://raw.githubusercontent.com/marcvila1/`. La resta s'ignora i surt un avís.
- **Escapament de tot el text** que es mostra (`esc`). Ja hi era i la prova l'ha confirmat en totes les pantalles.

### 5.2. A `index.html`

- **`urlSegura()`** a tots els enllaços i imatges que vénen de les dades: camps URL dels immobles, documents del patrimoni, fotografies i documents de les tasques.
- **Camins de fitxer:** només `manteniment_fotos/<nom>` i `manteniment_documents/<nom>`, sense `..` ni subcarpetes. Els documents es descarreguen com a `application/octet-stream`, amb el nom netejat.
- **CSV:** les cel·les que comencen per `=`, `+`, `-`, `@` o un tabulador porten un apòstrof al davant.
- **Importació de fitxers de colla (`validaPaquet`):**
  - mida màxima de 60 MB, 2.000 registres i 500 tasques noves;
  - el parc ha d'existir, i les tasques noves han de ser del mateix parc que el fitxer;
  - cada registre ha de ser d'una tasca del parc assignada a la colla del fitxer;
  - hores entre 0 i 24, persones entre 0 i 99, data en format AAAA-MM-DD i resultat d'un valor permès;
  - textos de 2.000 caràcters com a màxim;
  - fotografies JPEG, PNG o WebP de 4 MB com a màxim (30 per element);
  - una tipologia desconeguda es descarta.
- **Perfils autoritzats** (Configuració dels parcs › «Perfils autoritzats»):
  - Línies `correu; perfil; parc`. Si la llista no és buida, només hi poden entrar com a Responsable de brigades o Director/a les persones que hi consten.
  - En obrir el programa, un perfil no autoritzat passa a Tècnic/a.
  - No es pot desar una llista que deixi fora qui la desa.
  - Mentre la llista és buida no hi ha restricció, per no bloquejar la posada en marxa.

### 5.3. A `brigada.html`

- Imatges només `data:image/(jpeg|png|webp|gif)`, `blob:`, `https:` o camins `manteniment_fotos/…`.
- En l'escriptura directa a la carpeta, només s'apliquen registres a tasques **del parc i de la colla** de qui els envia.
- Botó **«Surt»**: esborra del dispositiu la identificació i els registres i les tasques ja enviats. Els pendents d'enviar es conserven, i s'avisa.

---

## 6. Condicions d'ús (riscos residuals i què cal fer)

### 6.1. Permisos de la carpeta de SharePoint: és el control d'accés real 🔴

Mentre no hi hagi SINATCAT, **qui pot escriure a la carpeta pot modificar qualsevol dada**: amb el programa o editant els JSON directament. Per tant:

- La carpeta `patrimoni/` ha de ser en un **lloc de SharePoint restringit**, amb un grup d'edició limitat:
  - Responsables de brigades i direccions dels parcs;
  - caps de colla, si fan servir `brigada.html` amb la carpeta;
  - els tècnics que hagin d'entrar tasques.
- Tota la resta, **només lectura** o cap accés.
- Cal mantenir activat l'**historial de versions** de SharePoint. Permet veure qui ha modificat cada fitxer i recuperar-ne una versió anterior, encara que algú hagi manipulat l'historial del programa.
- Si cal traçabilitat formal, es pot activar l'**auditoria de Microsoft 365** (Purview) per al lloc.
- La carpeta no es pot compartir amb enllaços d'«Qualsevol persona».

### 6.2. Publicació al GitHub (repositori públic) 🔴

El repositori `marcvila1/Programa_Patrimoni` és **públic**: tot el que s'hi puja ho pot veure qualsevol persona.

- **No s'hi han de publicar** dades personals ni de funcionament intern:
  - `manteniment.json` (noms i correus de sol·licitants, persones assignades, fotos);
  - `brigades.json` (membres, correus i telèfons);
  - `variables.json` amb `per_parc` omplert (direccions i responsables) i `perfils_autoritzats`;
  - `ordre_colles.json` i `avisos_correu/`.
- Ara mateix aquests fitxers són buits al repositori. Si s'han de compartir, cal fer el repositori **privat**, o publicar-ne versions sense dades personals.
- `elements.json` i la resta de dades del patrimoni es poden publicar si no contenen dades personals. Cal revisar `observacions` i els contactes abans de cada publicació.

### 6.3. Flux de Power Automate dels avisos 🟠

Qui pugui escriure a `patrimoni/avisos_correu/` pot fer que el flux enviï correus. En crear el flux:

- Afegiu una **condició**: tots els destinataris de `per` han d'acabar en `@gencat.cat`. Si no, el fitxer es mou a `avisos_correu/rebutjats/` sense enviar.
- Comproveu que `format` sigui `motor-patrimoni.avis-correu`.
- Limiteu la mida d'`assumpte` (200 caràcters) i de `cos` (5.000 caràcters).
- Envieu des d'una **bústia compartida** de la DGPAMN, no des d'un compte personal.
- Envieu el cos com a **text pla**, o escapeu-lo si es converteix a HTML.

### 6.4. Com s'obren els programes 🟡

- Preferiblement des d'un **lloc HTTPS de confiança**, per exemple GitHub Pages del repositori o un lloc web corporatiu. Si s'allotgen en un servidor, cal afegir les capçaleres HTTP `Content-Security-Policy` (amb `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff` i `Strict-Transport-Security`, que una etiqueta `<meta>` no pot donar.
- No obriu mai el programa des d'un enllaç rebut per correu amb paràmetres `?dades=` estranys. El programa els ignora, però és una bona pràctica.
- Feu servir **Edge o Chrome actualitzats**.

### 6.5. Dispositius compartits 🟡

- A `brigada.html`, en acabar, premeu **«Surt»**.
- A `index.html`, la identificació queda al navegador (localStorage). En un ordinador compartit, canvieu la identificació o esborreu les dades del lloc al navegador.
- La carpeta de treball queda recordada pel navegador. Cal tancar la sessió de Windows o d'OneDrive en ordinadors compartits.

### 6.6. Riscos acceptats

- **`'unsafe-inline'` a la CSP:** els programes són fitxers únics amb el codi incrustat. El risc queda mitigat perquè tot el text s'escapa i perquè la CSP impedeix carregar codi extern i enviar dades fora.
- **Regles al navegador:** les transicions d'estat, els rols i les validacions es poden saltar editant els JSON a mà. Ho limiten els permisos de SharePoint i l'historial de versions.
- **Dades en clar:** els JSON no van xifrats. La protecció la donen SharePoint (xifrat en repòs i en trànsit de Microsoft 365) i el dispositiu.

---

## 7. Integració a SINATCAT: què resoldrà

| Risc actual | Amb SINATCAT |
|---|---|
| Identificació declarada (A07) | Usuari autenticat amb el compte de gencat (Entra ID / VÀLid) i MFA |
| Rols al navegador (A01, A04) | Permisos comprovats al **servidor**, per rol i per parc |
| Validacions al navegador | Validació al servidor de cada operació (estats, hores, colla, parc) |
| Historial editable (A09) | Registre d'auditoria al servidor, no modificable pels usuaris |
| Correus amb mailto o Power Automate | Enviament des del servidor, amb plantilles i destinataris controlats |
| Fitxers JSON compartits | Base de dades amb control de concurrència i còpies de seguretat |

**Requisits per a l'API de SINATCAT:**
- autenticació OAuth 2.0 / OIDC amb Entra ID;
- autorització per rol i unitat a cada crida;
- validació de l'esquema de dades;
- límit de peticions;
- CORS restringit als orígens dels programes;
- registre d'auditoria;
- tractament de fotos i documents en un emmagatzematge separat, amb comprovació del tipus real del fitxer.

---

## 8. Com repetir les proves

Les proves són a `tests/seguretat/`. Cal Python 3, Node.js i Playwright (`npm i -g playwright && npx playwright install chromium`).

```bash
# 1. Servir el repositori
python3 -m http.server 8776

# 2. Generar les dades malicioses (a _xss/, que és a .gitignore)
python3 tests/seguretat/genera_malicios.py data _xss

# 3. Proves
node tests/seguretat/xss_test.js        # XSS, enllaços javascript:, fonts externes, CSV
cd tests/seguretat && node import_test.js && cd ../..   # fitxers de colla manipulats
node tests/seguretat/perfils_test.js    # perfils autoritzats, «Surt» i CSP
node tests/seguretat/transicions_test.js # canvis d'estat forçats (A01); ha de donar "correcte": true
```

Resultat esperat de `xss_test.js`: `xss_executat: []`, `enllacos_javascript: []` i `csv_cel_les_amb_formula: 0`. A `peticions_a_origen_extern` només hi poden sortir les adreces de les mateixes pàgines de prova.

Esborreu `_xss/` en acabar.

---

## 9. Llista de control abans de cada versió

- [ ] Tot el text que es posa a `innerHTML` passa per `esc()`.
- [ ] Tot `href` o `src` que ve de les dades passa per `urlSegura()` (a `index.html`) o `imatgeSegura()` (a `brigada.html`).
- [ ] Cap camí de fitxer que ve de les dades s'obre sense `camiSegur()`.
- [ ] Les importacions noves es validen com a `validaPaquet()`: format, unitat, colla, tipus i mides.
- [ ] Les dependències externes noves porten `integrity` (SRI) i el seu domini a la CSP.
- [ ] Cap domini nou a `connect-src` sense revisar-ho.
- [ ] No es publiquen dades personals al GitHub (apartat 6.2).
- [ ] Tot canvi d'estat nou es comprova també en desar amb `estatsPermesos()`, no només amb les opcions del desplegable.
- [ ] S'han passat les proves de l'apartat 8.
- [ ] Leaflet i el navegador de referència estan actualitzats.

---

## 10. Contacte i incidents

Si es detecta un ús indegut (dades modificades sense motiu, correus estranys, accessos no autoritzats):
1. Recupereu la versió correcta dels fitxers amb l'historial de versions de SharePoint.
2. Reviseu qui els ha modificat (historial de versions i auditoria de M365).
3. Retireu els permisos d'escriptura a la carpeta a qui no els hagi de tenir.
4. Comuniqueu-ho a la DGPAMN i, si hi ha dades personals afectades, al delegat o delegada de protecció de dades del Departament.
