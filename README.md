# Motor de Patrimoni de la DGPAMN

Programa per consultar, actualitzar i analitzar el patrimoni immobiliari dels espais naturals protegits que gestiona la Direcció General de Polítiques Ambientals i Medi Natural (DGPAMN): 390 immobles de 14 espais naturals.

Fa servir el mateix disseny i el mateix sistema de carpeta de treball que el Motor de Contractació, i les mateixes unitats promotores (`unitats_promotores.json` del repositori `Motor-Contractacio-DGPA`).

---

## 1. Com s'obre

1. Descarrega `index.html` i obre'l amb **Microsoft Edge** o **Google Chrome**.
2. Les dades es carreguen automàticament del GitHub (`data/` d'aquest repositori), i les unitats, del repositori del Motor de Contractació.
3. Per **consultar** no cal res més. Per **editar**, cal connectar una carpeta de treball (vegeu l'apartat 4).

> Amb Firefox o Safari també es pot consultar i editar, però els canvis no es poden desar en una carpeta: s'han de descarregar (apartat 4.3).

---

## 2. Mòdul 1. Gestió del Patrimoni

### 2.1. Consulta

- Es tria l'**espai natural** al desplegable o clicant-ne la targeta. Els noms són els oficials de les unitats promotores.
- Surt la **llista d'immobles** de l'espai, amb un cercador per nom, codi o municipi i un filtre per tipus d'element.
  - Cada immoble mostra l'estat de conservació, sempre amb icona i text.
  - Una marca indica si té **dades pendents** o si és **compartit** amb un altre espai. Per exemple, la Casa dels Parcs dels Pirineus surt a PNAP i a PNCM.
- En clicar un immoble s'obre la **fitxa completa**, amb tots els camps en blocs plegables:
  - Identificació; Localització, amb un **mapa**; Construcció i estat; Serveis i accessibilitat.
  - Deficiències i riscos; Ús i règim jurídic; Públic i personal; Fotografies.
  - Zones; Documents; Historial de canvis; Metadades.

### 2.2. Edició

Amb el botó **✎ Editar**, tots els camps de la fitxa es poden modificar. L'edició ajuda a omplir els camps i els valida:

| Tipus de camp | Com s'edita | Validació |
|---|---|---|
| Llistes tancades (estat de conservació, tipus d'accés, sanejament…) | Desplegable amb els valors de `catalegs.json` | Només valors del catàleg |
| Llistes obertes (tipus d'element, titular, municipi, materials, règim jurídic…) | Text amb **suggeriments** de tots els valors existents al patrimoni | Avisa si s'escriu un **valor nou**, per evitar variants de la mateixa cosa |
| Sí / No | Desplegable Sí · No · Sense dada | — |
| Numèrics (superfície, altitud, plantes, anys, persones per any) | Text numèric | Enter o decimal i dins d'un rang raonable |
| Coordenades UTM | X i Y, o **clic al mapa** | Dins de Catalunya (ETRS89 / UTM 31N); cal omplir X i Y |
| Codi postal i referència cadastral | Text | Format (CP de Catalunya; referència cadastral de 14 o 20 caràcters) |
| Zones | Es poden afegir i eliminar | Cada zona ha de tenir nom |

**Ajudes automàtiques:**
- Quan s'escriu un municipi, s'omple el CP habitual d'aquell municipi.
- Si l'immoble tenia dades pendents i s'omplen, la marca de pendent desapareix.

**Abans de desar**, es mostra un resum amb:
- Tots els camps modificats, amb el valor anterior i el nou.
- Les **comprovacions de coherència**: deficiències sense descripció, immoble no obert al públic però amb zones accessibles, CP que no correspon al municipi, immoble sense coordenades, etc. Són avisos: no impedeixen desar.
- Un camp per indicar el **motiu** del canvi.

### 2.3. Estat d'execució

Cada immoble té un **estat d'execució** (`estat_execucio` a `elements.json`). Hi ha quatre categories:

| Estat | Quan s'aplica |
|---|---|
| **Planificació** | Immoble en projecte. Cal indicar la fase: *Fase 1: Concepte*, *Fase 2: Terrenys*, *Fase 3: Avantprojecte*, *Fase 4: Projecte* o *Fase 5: Obres*. |
| **Operatiu** | Immoble en funcionament i amb el títol d'ús en regla. |
| **Requereix revisió** | Es posa **automàticament** quan el contracte ha deixat de ser vigent (document caducat o data de fi de vigència passada), quan el document és **en tràmit** o quan l'ús es basa en un **contracte de paraula** (acord verbal o compromís de mutu acord). També es pot marcar a mà, però llavors cal escriure el motiu. |
| **Suprimit** | Immoble que ja no forma part del patrimoni gestionat. Es conserva per a l'historial. |

**Camps obligatoris per fase de planificació.** Són acumulatius: cada fase demana també els camps de les anteriors. Mentre s'edita, el programa mostra la llista de camps que demana la fase i quins falten, i no deixa desar fins que estan omplerts.

| Fase | Camps obligatoris |
|---|---|
| Fase 1: Concepte | Propietari i ubicació (municipi i coordenades UTM) |
| Fase 2: Terrenys | Tipus de propietat i titular. Si ni el titular ni el propietari són la Generalitat de Catalunya, també el règim jurídic d'ús, el document jurídic i el període de fi de vigència |
| Fase 3: Avantprojecte | Enllaç a l'avantprojecte, data de l'avantprojecte, import estimat de l'obra (€) i durada estimada (mesos) |
| Fase 4: Projecte | Els mateixos camps que la fase 3 |
| Fase 5: Obres | Data d'inici de les obres |

Els camps nous són a `estat_execucio.avantprojecte{url, data, import_estimat, durada_estimada_mesos}` i a `estat_execucio.data_inici_obres`.

La regla automàtica:
- Calcula els **motius automàtics** a partir del règim jurídic i del document jurídic (tipus i estat), i els mostra a la fitxa.
- Si l'immoble és operatiu i apareix un motiu, passa a «Requereix revisió». Si el motiu desapareix (contracte renovat o formalitzat) i no hi ha cap motiu manual, torna a «Operatiu».
- No canvia els immobles en planificació o suprimits, però el resum avisa si tenen un contracte per revisar.
- S'aplica igual a `scripts/convert.py`, en desar des del programa i en obrir dades antigues que encara no tenen el camp.

En la càrrega inicial, tots els immobles inventariats són operatius o requereixen revisió: 318 operatius i 72 que requereixen revisió (58 per contracte de paraula, 11 per document caducat i 3 per document en tràmit).

**Fi de vigència i avís de venciment.** El document jurídic té el camp **Període fi vigència** (`us_i_regim.document_juridic.data_fi_vigencia`, data AAAA-MM-DD):
- **6 mesos abans** de la data, el programa avisa: bàner a la pàgina de Gestió del Patrimoni amb tots els documents que vencen, avís a la fitxa, marca «⏰ venç» a la llista, filtre i indicador a Gestió de Dades.
- **Passada la data**, l'immoble passa automàticament a «Requereix revisió» amb el motiu «va deixar de ser vigent el …».
- Les fitxes Excel no tenen aquestes dates: s'han d'anar omplint.

**Tipus d'element.** A més dels tipus que surten a les fitxes, es poden triar: Cartell, Mobiliari exterior, Boia, Comptador de persones, Barana i Altres.

### 2.4. Alta d'immobles

El botó **＋ Nou immoble** crea un immoble a l'espai seleccionat:
- Es demanen el nom, el tipus i el codi. El codi es proposa a partir del nom.
- L'identificador serà `UNITAT/codi`, per exemple `RMM/caseta_nova`.
- Després s'obre la fitxa en edició. Per situar l'immoble, clica el mapa o arrossega'n el punt: les coordenades UTM X i Y s'omplen soles. Cal triar l'estat d'execució (normalment *Planificació* amb la fase corresponent).

### 2.5. Registre de canvis

El botó **Registre de canvis** mostra totes les modificacions:
- Es poden filtrar per espai i cercar per persona, immoble o motiu.
- Es poden exportar a CSV.
- Cada fitxa té també el seu propi historial.

---

## 3. Mòdul 2. Gestió de Dades

Permet analitzar tot el conjunt de dades:

- **Filtres** per qualsevol camp rellevant:
  - Llistes: espai natural, estat d'execució, fase de planificació, motiu de revisió, tipus d'element, estat de conservació, municipi, tipus de propietat, titular, tipus de finca, ús principal, règim jurídic, estat del document jurídic, tipus d'accés, sanejament i presència de personal.
  - Característiques Sí / No / Sense dada: protecció patrimonial, obert al públic, accés adaptat, serveis, deficiències, riscos, reformes programades, coordenades i dades pendents.
  - Rangs numèrics: superfície, altitud, any de construcció i persones per any.
  - Una cerca lliure.
- Cada opció mostra **quants immobles** en resultarien amb la resta de filtres aplicats.
- Els filtres actius es mostren com a etiquetes, que es poden treure una a una.
- **Indicadors**: nombre d'immobles, superfície total, immobles que requereixen revisió, percentatge en bon estat, immobles amb deficiències o riscos, i immobles sense coordenades.
- **Mapa** amb els immobles filtrats, sobre el mapa topogràfic o l'ortofoto de l'ICGC, o sobre OpenStreetMap.
  - Els punts tenen el color de l'estat de conservació i hi ha una llegenda.
  - En clicar un punt, s'obre la fitxa.
- **Distribucions** per estat de conservació i per tipus d'element.
- **Taula** ordenable. Un clic a una fila obre la fitxa al Mòdul 1.
- **Exportació a CSV** dels immobles filtrats, amb tots els camps i la latitud i longitud. Es pot obrir directament amb l'Excel.

---

## 4. Mòdul 3. Manteniment

Recull les peticions i incidències de manteniment dels espais naturals.

### 4.1. Entrada d'una incidència

Qualsevol persona pot entrar-ne una amb el botó **＋ Nova incidència**. També es pot fer des de la fitxa d'un immoble, i llavors el formulari surt amb el parc, l'immoble i la ubicació ja omplerts. El formulari demana:
- **Parc natural** (obligatori).
- **Tipologia** (obligatòria): seguretat, senyalització, gestió ramadera, gestió cinegètica, desperfectes, manteniment, petició de feina tècnica o altres. Les tipologies són a `data/manteniment_tipologies.json`.
- **Descripció** (obligatòria).
- **Ubicació** (obligatòria): es pot clicar el mapa, arrossegar-ne el punt o escriure les coordenades UTM.
- **Fotografia** (obligatòria): es redueix a 1.600 píxels i es desa a `patrimoni/manteniment_fotos/` de la carpeta de treball. Des del mòbil es pot fer directament amb la càmera.
- **Immoble relacionat** del mòdul de patrimoni (opcional). En marcar la ubicació, el programa proposa l'immoble més proper si n'hi ha un a menys de 500 m.
- **Data proposada de realització** (opcional).
- **Nom i correu del sol·licitant**.

En registrar-la, es crea un codi `MANT-AAAA-NNNN` i un botó obre un **correu ja redactat** (mailto) adreçat al sol·licitant i a la direcció del parc. El correu inclou el codi, la tipologia, l'immoble, les coordenades, un enllaç al mapa i la descripció.

### 4.2. Gestió (responsable de manteniment)

Amb el botó **Gestiona** de cada incidència es poden assignar:
- **Prioritat**: Baixa, Moderada, Alta, Urgent o En espera.
- **Data límit**: obligatòria per a totes les prioritats excepte «En espera». **Una setmana abans** apareix un avís, i també quan la data ja ha passat. L'avís es veu en un requadre al mòdul, a la llista, a la fitxa, en un comptador a la pestanya MANTENIMENT i als indicadors.
- **Responsable**: els que tingui configurats el parc (Brigada Parc, Forestal Catalana, Empresa externa o responsables propis). Si és la brigada, es pot triar el cap de brigada. Si és una empresa externa, se'n pot escriure el nom.
- **Estat**: Nova, Assignada, En curs, Resolta o Descartada. Una incidència nova passa a «Assignada» quan té prioritat i responsable. Per descartar-la cal explicar-ne el motiu.

Cada canvi queda a l'historial de la incidència, amb la persona i la data. El botó de correu de la fitxa també avisa el cap de brigada assignat.

### 4.3. Configuració per parc

El botó **⚙ Configuració dels parcs** permet definir, per a cada parc:
- La **direcció**: nom, càrrec, correu i telèfon. La direcció rep l'avís de les incidències noves.
- Els **responsables** disponibles: quins dels generals fa servir el parc i, si cal, responsables propis.
- Els **caps de brigada**: nom, correu, telèfon i àmbit.

Es desa a `variables.json` i `caps_brigada.json` de la carpeta de treball.

### 4.4. Fitxers

| Fitxer | Contingut |
|---|---|
| `manteniment.json` | Incidències. Cada una té les dades d'entrada, la gestió (`gestio{prioritat, data_limit, responsable, cap_brigada, empresa, observacions}`), l'estat, la versió i l'historial |
| `manteniment_tipologies.json` | Tipologies de petició o incidència |
| `variables.json` | Prioritats (i si demanen data límit), dies d'avís (7), estats, responsables generals i configuració de cada parc (`per_parc`) |
| `caps_brigada.json` | Caps de brigada de cada parc (pendents d'omplir) |

### 4.5. Pendents

- Omplir el correu de la direcció i els caps de brigada de cada parc (Configuració dels parcs).
- **Integració a SINATCAT:** el sol·licitant s'agafarà de l'usuari autenticat, i els avisos per correu es podran enviar automàticament en lloc de fer-ho amb mailto.

---

## 5. Carpeta de treball i desament

### 5.1. Funcionament

Igual que al Motor de Contractació:
- La primera vegada, el programa demana triar una **carpeta de treball** i hi crea la subcarpeta `patrimoni/`.
- Si la carpeta és buida, s'hi copien les dades del GitHub.
- A partir d'aquí, **les dades es llegeixen i es desen a la carpeta**:

```
<carpeta triada>/patrimoni/
├── elements.json              ← immobles (es modifica en desar)
├── historial_canvis.json      ← registre de canvis (s'hi afegeix cada desament)
├── espais.json, catalegs.json, documents.json, metadata.json, unitats_promotores.json
└── copies/
    └── elements_AAAA-MM-DDTHH-MM-SS.json   ← còpia de seguretat (una per sessió, abans del primer desament)
```

El navegador recorda la carpeta. Per seguretat, en tornar a obrir el programa pot demanar que es torni a donar permís.

### 5.2. Treball compartit

**Perquè diverses persones treballin sobre les mateixes dades, cal que tothom connecti la mateixa carpeta compartida** (SharePoint o OneDrive sincronitzat).

Per evitar que un canvi en trepitgi un altre:
- Cada immoble té un número de **versió** (`meta.versio`).
- En desar, el programa rellegeix el fitxer de la carpeta.
- Si una altra persona ha modificat aquell immoble mentre l'editàveu, **no desa** i avisa de qui l'ha modificat i quan.
- Els canvis en immobles diferents no es bloquegen mai entre ells.

### 5.3. Sense carpeta

Si no es connecta cap carpeta, o el navegador no ho permet:
- Els canvis es fan igualment, però queden només a la finestra oberta.
- Una barra avisa dels canvis sense desar i ofereix **descarregar** `elements.json` i `historial_canvis.json`, que s'han de copiar a la carpeta de dades.

### 5.4. Publicació al GitHub

La carpeta de treball és on es treballa cada dia. Per actualitzar la versió pública, cal copiar `patrimoni/elements.json` i `patrimoni/historial_canvis.json` a `data/` d'aquest repositori i pujar-los.

---

## 6. Registre de canvis

Cada desament afegeix una entrada a `historial_canvis.json`:

```json
{
  "id": "c-20261026181731-k3x9a",
  "data": "2026-10-26T18:17:31.412Z",
  "usuari": { "nom": "Nom Cognom", "unitat": "PNAE", "font": "manual" },
  "accio": "modificacio",
  "element": "PNAE/aparcament_cortalet",
  "nom_element": "Zona d'aparcament del Cortalet",
  "unitat": "PNAE",
  "versio": 2,
  "canvis": [
    { "camp": "construccio.estat_conservacio", "etiqueta": "Estat de conservació", "abans": "bo", "despres": "regular" }
  ],
  "motiu": "Revisió de camp"
}
```

- `accio` pot ser `alta` o `modificacio`.
- A cada immoble, `meta.modificat`, `meta.modificat_per` i `meta.versio` indiquen la darrera modificació.
- Mentre no hi hagi autenticació, la persona responsable s'identifica en començar a editar (nom i unitat), i el nom es recorda en aquell navegador.

---

## 7. Dades

| Fitxer | Contingut |
|---|---|
| `data/elements.json` | 390 immobles. Identificador `UNITAT/codi` (p. ex. `PNAE/mas_el_cortalet`) |
| `data/espais.json` | Dades pròpies del patrimoni per unitat (tipus d'espai, nom a l'Excel, nombre d'immobles) |
| `data/catalegs.json` | Catàlegs tancats (codi → etiqueta) i llistes obertes |
| `data/documents.json` | PDF referenciats, amb el camp `url` pendent d'omplir |
| `data/metadata.json` | Fonts, **sistema de coordenades (ETRS89 / UTM 31N, EPSG:25831)**, recomptes i pendents |
| `data/historial_canvis.json` | Registre de canvis |
| `data/qualitat.json` | Informe de la conversió des dels Excel: decisions, correccions i avisos |
| `data/unitats_promotores.json` | Còpia de les unitats del Motor de Contractació (es fa servir si no s'hi pot accedir) |
| `data/ESQUEMA.md` | Estructura detallada de cada immoble |

### 7.1. Conversió inicial des dels Excel

`scripts/convert.py` genera els JSON a partir de les fitxes `llistes_*.xlsx`. Aplica la normalització i les decisions de `scripts/correccions_manuals.json`, i assigna cada fitxer a la seva unitat segons `scripts/mapa_unitats.json`.

```bash
python3 scripts/convert.py <carpeta amb els xlsx> data
```

> ⚠ **Important:** la conversió és només per a la **càrrega inicial**. Un cop s'ha començat a editar amb el programa, la font de veritat són els JSON. Tornar a executar `convert.py` **sobreescriuria els canvis fets**.

---

## 8. Integració a SINATCAT

El programa està pensat per incorporar-se a SINATCAT (Sistema Intel·ligent d'Informació de la Natura de Catalunya) com una aplicació més sobre la base de dades comuna. Els punts d'integració són els següents.

### 8.1. Usuari autenticat

SINATCAT ja autentica l'usuari, de manera que **el registre de canvis incorporarà directament l'usuari identificat**:

- La identificació manual (finestra «Persona responsable dels canvis», funció `demanaUsuari`) se substitueix per l'usuari de la sessió de SINATCAT.
- Cada entrada del registre guardarà l'identificador de l'usuari, a més del nom i la unitat:

```json
"usuari": { "id": "<identificador SINATCAT>", "nom": "Nom Cognom", "unitat": "PNAE", "font": "sinatcat" }
```

- `meta.modificat_per` de cada immoble passarà a ser l'identificador de l'usuari.
- Amb l'usuari autenticat es podran aplicar **permisos per unitat**, si cal: per exemple, que cada parc només editi els seus immobles. Ara mateix tothom pot editar-ho tot, per cobrir vacances, baixes i suports entre equips.
- La carpeta de treball deixarà de ser necessària: el desament anirà contra la base de dades de SINATCAT, mantenint el control de versions per immoble.

### 8.2. Vincle entre actuacions i elements patrimonials

Al Mòdul d'Actuacions de SINATCAT, **cada actuació s'ha de poder vincular a un o més elements patrimonials**, mitjançant l'identificador de l'element. Així es podrà comptabilitzar **quantes persones passen per cada espai** i **quantes persones fan activitats a cada espai**.

Proposta de relació actuació ↔ element (N:M):

```json
{
  "actuacio": "26_PNAE_012",
  "element": "PNAE/mas_el_cortalet",
  "zona": 1,
  "rol": "lloc_activitat"
}
```

- `zona` és opcional: permet precisar la zona de l'immoble (per exemple, l'aula d'un centre d'informació).
- `rol` pot ser:
  - `lloc_activitat`: l'activitat es fa a l'immoble.
  - `objecte`: l'actuació és sobre l'immoble, com una obra o un manteniment.
  - `seu`: l'immoble és la base de l'actuació.

### 8.3. Recompte de persones

S'hi proposen dos tipus de registre, tots dos lligats a l'element (i, si cal, a la zona).

**a) Visitants que passen per l'espai** (afluència), per període:

```json
{
  "element": "PNAE/mas_el_cortalet",
  "zona": null,
  "periode": { "inici": "2026-07-01", "fi": "2026-07-31" },
  "tipus": "visitants",
  "nombre": 8450,
  "metode": "comptador_automatic",
  "registrat_per": "<usuari SINATCAT>",
  "data_registre": "2026-08-02T09:15:00Z"
}
```

`metode` pot ser `comptador_automatic`, `recompte_manual`, `estimacio` o `entrades`.

**b) Participants en activitats**, lligats a l'actuació:

```json
{
  "actuacio": "26_PNAE_012",
  "element": "PNAE/mas_el_cortalet",
  "zona": 1,
  "data": "2026-08-12",
  "activitat": "Itinerari guiat d'observació d'ocells",
  "participants": 25,
  "perfil": { "escolars": 0, "adults": 21, "infants": 4 },
  "registrat_per": "<usuari SINATCAT>"
}
```

### 8.4. Dades agrupades

Amb aquests registres, el Mòdul de Dades podrà oferir **dades agrupades de recompte d'usuaris**:
- **Per element**: visitants i participants per immoble, zona i període.
- **Per parc**: suma de tots els seus elements. Els elements compartits s'han de comptar una sola vegada, o repartir segons el criteri que es fixi.
- **Per a tota la DG**: totals, evolució mensual i anual, comparativa entre espais, ràtios (participants per activitat, visitants per m², ús de les zones accessibles).

Els camps actuals `us_i_regim.volum_anual_public` i `us_i_regim.perfil_public` passaran de ser una dada declarada a ser una **dada calculada** a partir dels recomptes de l'any, i en guardaran la font i el període.

El Mòdul 2 d'aquest programa (filtres, mapa, indicadors i exportació) és la base sobre la qual s'afegiran aquests indicadors d'ús públic.

---

## 9. Pendents

- Coordenada UTM de `PNDE/magatzem_deltebre` (l'original de l'Excel és truncada).
- Enllaços (`url`) dels documents PDF referenciats (`documents.json`).
- Revisar si la base de dades Access conté camps o taules addicionals respecte dels Excel.

## 10. Aspectes tècnics

- Un sol fitxer HTML, sense instal·lació. Llibreria externa: Leaflet 1.9.4 (cdnjs) per als mapes.
- Mapes base: ICGC (topogràfic i ortofoto, © ICGC, CC BY) i OpenStreetMap.
- Les coordenades es transformen de UTM 31N a latitud i longitud amb fórmules pròpies, verificades amb `pyproj` sobre els 388 punts del patrimoni (error inferior a 1 mm).
- Paràmetres opcionals a l'URL, per a proves o per a un altre allotjament de les dades: `index.html?dades=<url de la carpeta data/>&unitats=<url de unitats_promotores.json>`.
