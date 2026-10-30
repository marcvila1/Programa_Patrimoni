# Encàrrec: webapp mòbil del cap de brigada

Document de traspàs per construir, en una conversa nova, l'HTML independent per als caps de brigada del mòdul de Manteniment del Motor de Patrimoni. Estat a 30/10/2026.

## 1. Context

- **Repositori:** `marcvila1/Programa_Patrimoni` (branca `main`). Dades a `data/`, programa principal a `index.html`, documentació general a `README.md`.
- **Programa principal (`index.html`):** un sol fitxer HTML amb tres mòduls: Gestió del Patrimoni, Gestió de Dades i Manteniment.
  - Desa les dades en una **carpeta de treball** triada amb `showDirectoryPicker` (File System Access API), a la subcarpeta `patrimoni/`, normalment una carpeta de SharePoint sincronitzada amb OneDrive.
  - Sense carpeta, llegeix les dades del GitHub (`https://raw.githubusercontent.com/marcvila1/Programa_Patrimoni/main/data/`).
- **Usuaris del mòdul de Manteniment:**

| Perfil | Què fa |
|---|---|
| Tècnic/a | Entra peticions i incidències |
| Cap d'Infraestructures i Manteniment | Assigna prioritat, data límit, responsable i brigada; certifica hores; verifica o descarta; gestiona brigades i tasques periòdiques. Al seu parc o, si té una unitat central, a tots |
| Director/a de parc | Les mateixes funcions que el cap de manteniment, al seu parc |
| **Cap de brigada** | **Usuari d'aquesta webapp**: marca les feines com a «En curs» i «Resolta», hi puja fotografies de seguiment i pot crear peticions noves |

- Fins a la integració a SINATCAT, cada persona declara el seu perfil i la seva unitat (`localStorage` `motor-patrimoni.usuari` = `{nom, email, perfil, unitat}`). Amb SINATCAT vindran de l'usuari autenticat.

## 2. Què ha de fer la webapp

HTML independent, **molt senzill i pensat per al mòbil**, amb el mateix estil que `index.html` (vegeu l'apartat 6).

1. **Identificació:** nom, correu, perfil «Cap de brigada», parc (unitat) i **brigada** (de `brigades.json`). Es recorda al dispositiu.
2. **Les meves feines:** llista de les incidències del parc assignades a la seva brigada (`gestio.responsable = "brigada_parc"` i `gestio.brigada = <codi>`) en estat `assignada` o `en_curs`. Han d'anar ordenades per data límit i mostrar la prioritat, l'avís de data límit (7 dies abans, i vençuda) i la marca 🔁 si ve d'una tasca periòdica.
3. **Fitxa d'una feina:**
   - Descripció, tipologia i immoble relacionat (nom).
   - Ubicació en un mapa, amb un botó «Com arribar-hi» que obri l'aplicació de mapes del mòbil amb lat/lon.
   - Fotografies de la petició i de seguiment, i data límit.
   - Observacions del cap de manteniment.
4. **Accions:**
   - «Comença la feina» (`assignada` → `en_curs`).
   - «Feina acabada» (`en_curs` → `resolta`).
   - «Afegeix fotografies» des de la càmera, amb una nota opcional.
   - El cap de brigada **no** certifica hores ni canvia prioritat, data límit o responsable.
5. **Nova petició:** el mateix formulari que el programa principal, simplificat.
   - Camps: parc, tipologia, descripció, ubicació (GPS del mòbil o clic al mapa), fotografies, hores estimades, immoble relacionat (opcional) i data proposada (opcional).
   - Crea una incidència en estat `nova`.
6. **Feines recents:** les darreres resoltes per la brigada, només per consultar.

## 3. Decisió pendent: on es desen les dades

Els navegadors dels mòbils (Android i iOS) **no admeten** `showDirectoryPicker`, de manera que la webapp no pot escriure a la carpeta de treball com fa el programa principal. Cal triar una opció abans de construir-la:

| Opció | Com funciona | Avantatges | Inconvenients |
|---|---|---|---|
| A. SharePoint / OneDrive amb Microsoft Graph | La webapp s'autentica amb el compte gencat (MSAL.js) i llegeix i escriu els JSON de la carpeta de SharePoint | Dades úniques, en temps real | Cal registrar una aplicació a l'Azure AD de la Generalitat (permisos de TIC) |
| B. Esperar SINATCAT | La webapp parla amb l'API de SINATCAT | Solució definitiva, usuaris únics | Depèn del calendari de SINATCAT |
| C. Provisional, per fitxer | La webapp llegeix les dades publicades (GitHub o un enllaç de SharePoint) i guarda les accions al mòbil. El cap de brigada envia un fitxer de canvis (correu o compartir), i el programa principal té un botó «Importa canvis de brigada» | Funciona ja, sense permisos | No és en temps real; cal un pas manual d'importació |

Recomanació inicial: **C** per començar de seguida, dissenyant les accions de manera que després es puguin enviar per l'opció A o B sense canviar la interfície.

## 4. Dades

Fitxers a `data/` (i a `patrimoni/` de la carpeta de treball, que són els vigents):

- **`manteniment.json`:** llista d'incidències. Camps principals:
  - `id` (`MANT-AAAA-NNNN`), `versio`, `creat`, `modificat`, `modificat_per`.
  - `sollicitant{nom, email, unitat, font}`, `unitat` (codi del parc), `utm{x, y}` (ETRS89 / UTM 31N, EPSG:25831), `element` (id de l'immoble o `null`).
  - `tipologia`, `descripcio`, `data_proposada`, `hores_estimades`.
  - `fotografies[{fitxer, dades, fase: "peticio"|"seguiment", data, per{nom, email}, nota}]`. A la carpeta, `fitxer` = `manteniment_fotos/<id>_NN.jpg`. Sense carpeta, la imatge va a `dades` en dataURL JPEG.
  - `estat`: `nova` | `assignada` | `en_curs` | `resolta` | `verificada` | `descartada`.
  - `gestio{prioritat, data_limit, responsable, brigada, empresa, observacions, assignat_per, data_assignacio}`.
  - `inici_feina{data, per}`, `data_resolucio`, `resolta_per`, `verificacio{data, per}`, `certificacions_hores[{hores, tipus, data, per}]`.
  - `periodica{id, data, execucio}` si l'ha generada una tasca periòdica.
  - `historial[{data, usuari{nom, email, unitat, rols, font}, accio: "alta"|"gestio"|"seguiment", canvis[{camp, etiqueta, abans, despres}], nota}]`.
- **`brigades.json`:** `per_parc.<UNITAT>.brigades[{codi, nom, cap{nom, email, telefon}, ambit, membres[{nom, funcio}], activa}]`.
- **`variables.json`:**
  - Prioritats, `dies_avis_data_limit` (7), estats i `estats_sense_avis`.
  - Transicions per rol: la brigada pot fer `assignada→en_curs` i `en_curs→resolta`.
  - Perfils, periodicitats, i `per_parc` (direcció, cap de manteniment, responsables).
- **`manteniment_tipologies.json`:** tipologies (`codi`, `nom`, `descripcio`, `activa`).
- **`elements.json`:** immobles. Calen `id`, `unitat`/`unitats`, `identificacio.nom` i `localitzacio.utm`.
- **`unitats_promotores.json`:** noms dels parcs. La font principal és el Motor de Contractació: `https://raw.githubusercontent.com/marcvila1/Motor-Contractacio-DGPA/main/unitats_promotores.json`.

**Regles que s'han de respectar en desar** (les mateixes del programa principal):

- **Control de versió:** abans d'escriure, cal rellegir el fitxer i comprovar que `versio` no ha canviat. En desar, cal augmentar `versio` i posar `modificat` i `modificat_per`.
- **Historial:** cada acció afegeix una entrada a `historial`.
- **Feina començada:** `inici_feina = {data, per}`.
- **Feina acabada:** `data_resolucio` (AAAA-MM-DD) i `resolta_per`.
- **Fotografies:** es redueixen a un màxim de 1.600 px de costat, en JPEG de qualitat 0,82.
- **Identificadors nous:** `MANT-<any>-<NNNN>`, el màxim existent de l'any més 1.

## 5. Coordenades

ETRS89 / UTM fus 31N. El programa principal ja té la conversió UTM ⇄ lat/lon (objecte `UTM` a `index.html`, fórmules de Snyder, verificades amb pyproj). Es pot copiar a la webapp. El GPS del mòbil dona lat/lon i cal convertir-ho a UTM per desar-ho.

## 6. Estil

El mateix que el Motor de Contractació i `index.html`:
- **Colors:** `--color-primary-teal: #088074`, `--color-primary-teal-dark: #00756a`, `--color-accent-mint: #9fd5cc`, `--color-bg-page: #f8f7f6` i `--color-border: #e0e0e0`.
- **Text:** `--color-text-primary: #242424` i `--color-text-secondary: #605e5c`.
- **Avisos:** `--color-danger: #d32f2f` i `--color-warning: #e3b341`.
- **Tipografia i formes:** lletra Segoe UI, cantonades rectes (`border-radius: 0`) i capçalera de color teal.
- **Prioritats:** les mateixes etiquetes de color que el programa principal (urgent vermell, alta taronja, moderada groc, baixa teal, en espera gris).
- **Pensada per al mòbil:** botons grans, una columna i sense desplaçament horitzontal.
- **Mapes:** Leaflet 1.9.4 (cdnjs) amb el topogràfic de l'ICGC: `https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wmts/topografic/MON3857NW/{z}/{x}/{y}.png`.
- **Idioma:** tot en català.

## 7. Proves

El programa principal es prova amb Playwright (Chromium), simulant la carpeta amb l'Origin Private File System. La webapp s'hauria de provar igual, amb una amplada de 390 px.
