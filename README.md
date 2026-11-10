# Motor de Patrimoni de la DGPAMN

Programa per consultar, actualitzar i analitzar el patrimoni immobiliari dels espais naturals protegits que gestiona la Direcció General de Polítiques Ambientals i Medi Natural (DGPAMN): 390 immobles de 14 espais naturals.

Té tres mòduls: Gestió del Patrimoni, Gestió de Dades i Gestió de brigades. Fa servir el mateix disseny i el mateix sistema de carpeta de treball que el Motor de Contractació, i les mateixes unitats promotores (`unitats_promotores.json` del repositori `Motor-Contractacio-DGPA`).


> **Seguretat:** abans de fer servir el programa amb dades reals, llegiu [`SEGURETAT.md`](SEGURETAT.md): permisos de la carpeta de SharePoint, què no s'ha de publicar al GitHub, el flux d'avisos i com repetir les proves de seguretat.

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

## 4. Mòdul 3. Gestió de brigades

Recull les peticions i tasques de manteniment dels espais naturals. (Fins al novembre de 2026 es deia «Manteniment»; els codis interns i els fitxers, com `manteniment.json` o `brigades.json`, no han canviat.)

### 4.0. Pantalla principal

- A dalt, els **filtres**: espai, estat, prioritat, tipologia, **colla** (els responsables generals i cada colla del parc), **persona assignada** i una cerca lliure.
- A sota, els indicadors (tasques obertes, noves per acceptar, urgents, per assignar, en pausa, pendents de verificar, data límit propera i vençudes) i, a l'esquerra, la **llista de tasques en gran**, **agrupada en desplegables** segons el criteri triat a «Agrupa per»: estat (per defecte), prioritat, parc, colla, persona o tipologia, o sense agrupar. Cada grup mostra quantes tasques té i quantes tenen la data límit propera o vençuda. Es poden plegar i desplegar tots alhora.
- El **mapa** de les tasques filtrades és petit, a sota de la llista. La fitxa de la tasca seleccionada surt a la dreta.
- **Vista Tauler o Llista** (botons «▦ Tauler» i «☰ Llista»; el programa recorda l'última triada, i per defecte obre el tauler):
  - El **tauler** mostra les tasques en **dipòsits** (columnes), com al Microsoft Planner, segons «Agrupa per». Cada targeta porta el codi, la tipologia, la descripció, la colla i la persona, la prioritat (color de la vora), la data límit i l'avís ⏰. Les tasques acceptades hi tenen el botó «👷 Assigna».
  - **Per estat** hi ha una columna per a cada estat. Resolta i Descartada només mostren les dels últims 30 dies, si no es marca «Mostra les verificades i descartades».
  - **Per colla** hi ha una columna per a cada colla activa, més «Sense assignar» i els altres responsables.
  - **Arrossegar una targeta** (amb el ratolí) a una altra columna en canvia l'estat o la colla, amb les mateixes regles i permisos que la gestió:
    - Nova → Acceptada / Descartada: s'obre la gestió amb el canvi triat (cal la tipologia, la prioritat i la data límit, o el motiu).
    - Acceptada → Assignada: s'obre l'assignació ràpida.
    - Assignada o En pausa → Acceptada: treu la colla.
    - Assignada → En pausa, i Pendent de verificar → Resolta: s'obre la gestió amb el canvi triat (motiu de la pausa o certificació d'hores).
    - Assignada → Pendent de verificar: «Feina acabada» de la colla.
    - Al tauler per colla, moure la targeta la reassigna a la colla de la columna (o la deixa sense colla).
    - Si el perfil no té permís per a aquell canvi, la targeta no es mou i el programa diu qui el pot fer.
  - Agrupat per prioritat, parc, persona o tipologia, el tauler és només de consulta.
  - En clicar una targeta, se n'obre la fitxa a sota, al costat del mapa.
  - La **llista** és la vista anterior, amb els grups plegables.

### 4.1. Perfils d'usuari

| Perfil | Qui és | Eina | Què fa |
|---|---|---|---|
| **Tècnic/a** | Treballador/a de la DGPAMN | `index.html` | Entra tasques i les consulta |
| **Responsable de brigades** | Tècnic/a de la DGPAMN responsable de les brigades | `index.html` | És el **responsable per defecte** de totes les tasques. Les accepta o descarta, fixa la tipologia, la prioritat i la data límit, les assigna a una colla i, si cal, a una persona concreta, en pot modificar totes les dades, certifica hores, valida els registres de les colles i verifica la feina. Gestiona les colles i la configuració del parc |
| **Director/a del Parc Natural** | Director/a del parc | `index.html` | Les mateixes funcions que el Responsable de brigades, al seu parc |
| **Cap de colla** | Responsable d'una colla | `brigada.html` | Registra la feina feta (hores, persones i fotografies), posa les tasques en pausa i les reprèn, les marca com a acabades («Pendent de verificar») i entra tasques noves |
| **Oficial** | Persona d'una colla | `brigada.html` | El mateix que el cap de colla. Se li poden assignar tasques concretes |

Al programa principal, la finestra d'identificació només ofereix els tres primers perfils. Els caps de colla i els oficials són les persones que es donen d'alta a cada colla amb el botó «👷 Colles» (cap i membres).

Fins a la integració a SINATCAT, cada persona indica el seu **perfil** i la seva **unitat** en identificar-se (botó de la capçalera):
- El/la director/a del Parc Natural només actua al seu parc; els caps de colla i els oficials, a les tasques de la seva colla.
- El Responsable de brigades actua al seu parc o, si la seva unitat és central, a tots els parcs.

Amb SINATCAT, el perfil vindrà de l'usuari autenticat. Fins llavors és un control d'organització, no de seguretat.

### 4.2. Entrada d'una tasca

Qualsevol persona pot entrar-ne una amb el botó **＋ Nova tasca**. També es pot fer des de la fitxa d'un immoble, i llavors el formulari surt amb el parc, l'immoble i la ubicació ja omplerts. **Són obligatoris el parc, el títol i la descripció.** La resta és opcional:
- **Categoria de petició**: Incidència, Manteniment, Millora, Nova actuació, Inspecció o revisió, o Altres. En crear la tasca és opcional; a «Gestiona» és obligatòria, i la fixa el Responsable de brigades si no s'ha indicat.
- **Títol** (obligatori, màxim 50 caràcters): nom curt de l'actuació. És el que surt remarcat a la llista i al tauler de tasques, i a la llista de tasques de la colla. Les tasques periòdiques prenen el nom de la tasca. Les tasques antigues sense títol mostren la tipologia.
- **Tipologia**: Equipaments i Instal·lacions, Ús públic, Conservació, Sistema hídric, Ramaderia i infraestructures ramaderes, Neteja i residus, o Altres (`data/manteniment_tipologies.json`). Les tipologies anteriors al 06/11/2026 es conserven inactives perquè les tasques antigues en mantinguin el nom; si la carpeta de treball encara té el fitxer antic, el programa l'actualitza sol. Si no s'indica, la fixa el Responsable de brigades: és un requisit per acceptar la tasca.
- **Ubicació**: es pot clicar el mapa, arrossegar-ne el punt o escriure les coordenades UTM (cal la X i la Y, o cap de les dues).
- **Fotografies**: es redueixen a 1.600 píxels i es desen amb les dades (`patrimoni/manteniment_fotos/<codi>_NN.jpg`). Des del mòbil es poden fer directament amb la càmera.
- **Previsió de data**: quan es preveu fer la feina (no pot ser anterior a avui). Es pot canviar a «Gestiona».
- **Documents**: Word (.doc, .docx), PDF o KML/KMZ, fins a 15 MB per fitxer. Es desen a `patrimoni/manteniment_documents/<codi>_DNN_<nom>` i a la tasca, a `documents[]` (nom, tipus, mida, data i qui l'ha adjuntat). Sense carpeta, van dins de les dades. A la fitxa, a l'apartat «Documents», es poden obrir o descarregar; a «Gestiona» se n'hi poden afegir més.
- **Hores de dedicació estimades**. Si no s'indiquen, en gestionar la tasca es proposen 7 hores (`hores_per_defecte` a `variables.json`).
- **Immoble relacionat** del mòdul de patrimoni. En marcar la ubicació, el programa proposa l'immoble més proper si n'hi ha un a menys de 500 m.
- **Prioritat**: es pot proposar en entrar la tasca. Es desa a `gestio.prioritat` i queda a l'historial de l'alta. La tasca continua sent «Nova»: el Responsable de brigades la pot canviar en acceptar-la, i per acceptar-la continua calent la data límit.
- **Persones i colles assignades**: un sol camp amb dues parts, les **colles** del parc (caselles) i les **persones** (s'escriu el nom i «＋ Afegeix»). Si una persona és d'una colla, es marca també aquella colla. La tasca continua sent «Nova» amb les colles proposades (`gestio.brigades[]`, `gestio.persones[]`) i queda «Assignada» quan el Responsable de brigades l'accepta.
- **🔁 És una tasca periòdica** (només el Responsable de brigades o la direcció del parc del parc triat): mostra els camps **Periodicitat**, **Data de la primera execució** (per defecte, avui), **Avisa'm (dies abans)** i **Data de finalització**, i les properes execucions. En aquest cas són obligatòries la tipologia, una prioritat amb data límit i les hores estimades. En registrar-la es crea també la tasca periòdica `PER-NNNN` amb les mateixes dades (la descripció passa a les observacions), i la tasca entrada n'és la **primera execució**: queda «Assignada» si té colla o «Acceptada» si no en té, amb data límit la de la primera execució. Les execucions següents es generen com les de qualsevol tasca periòdica.
- **Nom i correu del sol·licitant** (per defecte, els de la persona identificada).

En registrar-la, es crea un codi `MANT-AAAA-NNNN` i un botó obre un **correu ja redactat** (mailto) per al sol·licitant, la direcció del parc i el Responsable de brigades. El correu descriu la tasca (codi, tipologia, immoble, coordenades, enllaç al mapa i descripció) i **no esmenta les fotografies**, que són a la base de dades. La primera línia de tots els avisos («S'ha registrat una nova tasca…», «La tasca MANT-… s'ha acceptat…») indica entre parèntesis el **tipus de tasca** (la tipologia) si se n'ha triat; si no, no hi surt res, i tampoc la línia «Tipologia».

### 4.3. Estats

| Estat | Quan | Qui hi fa passar |
|---|---|---|
| **Nova** | Quan es crea | Qualsevol persona |
| **Acceptada** | S'ha gestionat l'entrada i s'ha acceptat: té **tipologia**, prioritat i data límit (si no és «En espera»), però **encara no té colla** | Responsable de brigades o direcció |
| **Descartada** | No es farà. Cal el motiu a les observacions. Estat final | Responsable de brigades o direcció |
| **Assignada** | Té una **colla** (o un altre responsable) per fer-la. Es posa sola en assignar la colla; si es treu la colla, torna a «Acceptada» | Responsable de brigades o direcció |
| **En pausa** | La feina s'ha aturat per algun motiu (cal indicar-lo). Pot continuar assignada; en reprendre-la torna a «Assignada», o a «Acceptada» si es treu la colla | Colla, Responsable de brigades o direcció |
| **Pendent de verificar** | La colla ha acabat la feina («Feina acabada») | Colla |
| **Resolta** | El Responsable de brigades o la direcció l'han verificada, amb la certificació final d'hores. Estat final | Responsable de brigades o direcció |

En gestionar una tasca **nova**, només es pot passar a **Acceptada** o **Descartada**. Si en acceptar-la ja s'hi posa una colla, queda directament **Assignada**.

**Assignació ràpida.** Les tasques acceptades tenen un botó **👷 Assigna** a la llista i a la fitxa, que obre una finestra per triar la colla i, si cal, una persona concreta.

Una feina pendent de verificar que no es verifica torna a la colla (**Assignada**), explicant-ne el motiu. Les pauses queden registrades a la tasca (`pauses[{inici, per, motiu, fi}]`), i també qui la va acceptar (`acceptacio`), qui la va assignar (`gestio.assignat_per`, `gestio.data_assignacio`), qui va acabar la feina (`feina_acabada`) i qui la va verificar (`verificacio`).

**Tasques d'abans d'aquest canvi.** Es converteixen soles en obrir-les: «Assignada» o «En curs» passen a «Assignada» (o «Acceptada» si no tenien colla), l'antiga «Resolta» passa a «Pendent de verificar» i «Verificada» passa a «Resolta». L'estat «En curs» desapareix.

- La **data límit** és obligatòria excepte amb «En espera». **Una setmana abans** apareix un avís, i també quan ja ha passat. L'avís es veu al mòdul, a la llista, a la fitxa, en un comptador a la pestanya i als indicadors.
- El **responsable** de totes les tasques és sempre el Responsable de brigades: no s'ha de triar.
- **Assignada a** és un desplegable que inclou **sempre totes les colles actives** del parc (botó «Colles») i, a sota, els altres responsables (Forestal Catalana, empresa externa o propis del parc). Si la tasca està assignada a un responsable que no és una colla del parc (Forestal Catalana, empresa…), el Responsable de brigades fa també les accions de la colla (pausa i feina acabada).

**Gestió de la tasca** (botó «Accepta o descarta» o «Gestiona»). Només la poden fer el Responsable de brigades i la direcció del parc. Es pot canviar tot: estat, prioritat, data límit, «Assignada a», persona assignada, hores estimades (7 per defecte), observacions, tipologia, descripció, data proposada, immoble relacionat, ubicació (amb mapa), sol·licitant i **altres persones que reben els avisos** (`notificar[]`, s'afegeixen als correus). També s'hi poden afegir fotografies de la petició.

**Hores.** Les certifiquen el Responsable de brigades o la direcció:
- **Certificacions parcials:** mentre la feina és assignada, en pausa o pendent de verificar. Serveixen per a les feines llargues, que no es poden certificar de cop.
- **Certificació final:** obligatòria en verificar. Pot ser 0 si ja s'han certificat totes les hores.

La fitxa mostra les hores estimades, el total certificat, la desviació i el detall de cada certificació.

**Fotografies de seguiment.** Mentre la feina està assignada o en pausa, la colla (cap de colla o oficial) o el Responsable de brigades poden afegir fotografies de com evoluciona, amb una nota. La fitxa les mostra separades de les de la petició.

**Tancament.** En resoldre (verificar) o descartar una tasca, el programa ofereix el correu de tancament per al sol·licitant i la direcció.

Cada canvi queda a l'historial de la tasca, amb la persona, el rol i la data. També es desa qui la va acceptar i assignar, les pauses, qui va acabar la feina, qui la va verificar i qui va fer cada certificació d'hores.

### 4.4. Tasques periòdiques

Hi ha feines que es repeteixen (revisions, neteges, manteniment preventiu). Es donen d'alta com a **tasques periòdiques** de dues maneres:
- **Vinculades a un element patrimonial:** des de la fitxa de l'immoble (grup «Gestió de brigades», botó «＋ Tasca periòdica en aquest immoble»).
- **Sense vincle:** des del mòdul de Gestió de brigades, botó «🔁 Tasques periòdiques». En aquest cas es poden indicar unes coordenades UTM.

Camps de cada tasca:
- Parc i element (opcional).
- Tasca, tipologia i **periodicitat**: setmanal, quinzenal, mensual, bimestral, trimestral, quadrimestral, semestral, anual o biennal.
- Data de la primera execució i, si cal, data de finalització.
- Hores estimades per execució, prioritat i **persones i colles assignades** (un sol camp: les colles del parc i, opcionalment, persones concretes; en afegir una persona d'una colla, es marca també la seva colla).
- **Avisa'm (dies abans):** quan es genera la tasca. En triar la periodicitat es proposa un valor (setmanal 2, quinzenal 4, mensual 7, bimestral 10, trimestral i quadrimestral 14, semestral 21, anual i biennal 30), que es pot canviar. Ha de ser menys que l'interval entre execucions.
- **Observacions** i si està activa.

Les creen i modifiquen el Responsable de brigades i la direcció del parc. També es pot crear una tasca periòdica marcant **«🔁 És una tasca periòdica»** en entrar una tasca nova (vegeu 4.2). La llista de tasques periòdiques té una columna **Colla**. En modificar-ne una, es detecta el canvi de qualsevol de les colles o persones (no només la primera) i queda a l'historial.

**Com funcionen.** Cada execució genera una **tasca** els dies d'avís que té la tasca abans de la data. Les tasques antigues sense aquest camp fan servir els 14 dies generals de `variables.json`:
- La data límit de la tasca és la data de l'execució.
- La tasca hereta la tipologia, la prioritat, l'assignació, la persona assignada i les hores estimades. Surt com a «Assignada» si la tasca periòdica té colla, i com a «Acceptada» si no en té.
- A partir d'aquí segueix el circuit normal: assignació, pausa si cal, feina acabada, certificació d'hores i verificació.
- Les tasques generades porten la marca 🔁 i l'enllaç a la tasca periòdica.

**Quan es generen.** En obrir el programa amb la carpeta connectada, i en desar una tasca periòdica. No es dupliquen. Les execucions es calculen sempre des de la data inicial: una tasca mensual del dia 31 passa al darrer dia dels mesos més curts.

### 4.5. Configuració per parc i colles

El botó **⚙ Configuració dels parcs** permet definir, per a cada parc:
- La **direcció**: nom, correu i telèfon. (El camp «Càrrec» ja no surt al formulari; si `variables.json` en tenia un, es conserva.)
- El **Responsable de brigades**: nom, correu i telèfon.

**Avisos per correu.** Els correus d'avís (mailto) només s'adrecen a la **direcció del parc** i al **Responsable de brigades**. A la mateixa configuració, una taula permet marcar, per a cadascun, en quines situacions vol ser avisat: **tasca nova**, **tasca acceptada o rebutjada**, **tasca pendent de verificació** (la colla ha acabat la feina) i **tasca finalitzada** (resolta). L'avís de **«pendent de verificació» és automàtic**: el cap de colla no ha de fer res (vegeu «Avisos automàtics» més avall). La resta d'avisos s'envien amb un correu ja redactat (mailto) des del programa principal.

**Tasques descartades.** Per descartar una tasca cal escriure una **justificació del descart** (camp propi a «Gestiona»; es desa a `descartada.motiu` i surt a la fitxa). El correu de descart s'adreça a **qui va crear la tasca** (el correu del sol·licitant o, si la va entrar una colla, el del membre amb aquell nom) i, si ho ha demanat a «Tasca acceptada o rebutjada», a la **direcció del parc**. Amb la carpeta connectada, l'avís va a la bústia automàtica; sense carpeta, es proposa el correu ja redactat.

**Avisos automàtics (bústia de correu + Power Automate).** Un HTML no pot enviar correus sol. Quan una tasca queda **pendent de verificació** o es **descarta** (per a la pendent de verificació: la colla registra «Feina acabada» des de `brigada.html`, s'importa el fitxer d'una colla o el Responsable la hi passa a «Gestiona»), el programa deixa un fitxer a la bústia `patrimoni/avisos_correu/AVIS-<data>-<tasca>.json` de la carpeta de treball:

```json
{ "format": "motor-patrimoni.avis-correu", "situacio": "pendent", "tasca": "MANT-2026-0001", "unitat": "PNAE",
  "per": "direccio@gencat.cat;responsable@gencat.cat", "assumpte": "[Manteniment PNAE] Pendent de verificar · …", "cos": "La colla … ha acabat la feina …" }
```

Un flux de **Power Automate** (amb el compte gencat) envia els correus:
1. Desencadenador **SharePoint › «Quan es crea un fitxer en una carpeta»**: lloc i biblioteca de la carpeta de treball, carpeta `…/patrimoni/avisos_correu`.
2. **SharePoint › «Obtén el contingut del fitxer»** del fitxer creat, i **«Analitza el JSON»** (`json(base64ToString(body('Obtén_el_contingut_del_fitxer')?['$content']))`).
3. **Office 365 Outlook › «Envia un correu electrònic (V2)»**: Per a = `per`, Assumpte = `assumpte`, Cos = `cos` (amb `replace(…, '\n', '<br>')`).
4. **SharePoint › «Mou el fitxer»** a `avisos_correu/enviats/`, perquè no es torni a enviar.

Mentre el flux no estigui creat, els avisos s'acumulen a la bústia i no s'envien. Sense carpeta connectada no es pot deixar l'avís. Per defecte, totes. Es desa a `variables.json` (`per_parc.<UNITAT>.avisos`). Si en una situació ningú no ha demanat l'avís, el programa no el proposa. El botó «Envia un correu sobre aquesta tasca» de la fitxa s'adreça sempre a tots dos.

A qui es poden assignar les tasques es gestiona des de **Colles**: ja no hi ha «responsables disponibles» per parc ni l'opció «Altres» (Forestal Catalana, empresa externa) a «Assignada a».

Es desa a `variables.json`.

El botó **👷 Colles** permet crear i mantenir les colles de cada parc. Cada colla té nom, cap de colla (nom, correu i telèfon), àmbit, membres i si està activa. Cada **membre** té nom, funció i **correu electrònic**; el correu es verifica (format vàlid i sense repetir dins de la colla) i no es pot desar si és incorrecte. Una persona pot ser membre de diverses colles. Els caps i els membres són les persones que es proposen en assignar una tasca a una persona concreta. Una colla amb tasques assignades no es pot esborrar, només desactivar. Es desa a `brigades.json`.

**📋 Pla de treball** (abans «Ordre de les colles»). El Responsable de brigades i la direcció del parc fixen en quin ordre ha de fer les tasques cada colla, que no sempre coincideix amb la prioritat. Es tria el parc i la colla i surten les tasques assignades i en pausa, numerades. L'ordre es canvia arrossegant-les o amb els botons **⤒** (la primera), **↑** i **↓**; el botó **Ordena per prioritat i data límit** en proposa un de partida. Es desa a `ordre_colles.json` (`{ <UNITAT>: { <colla>: { ordre: [ids], modificat, modificat_per } } }`), sense modificar les tasques. Les tasques assignades després de l'última ordenació surten al final amb la marca «nova a la llista»; les acabades o descartades en surten soles. A `brigada.html`, la colla veu les tasques en aquest ordre, numerades (1., 2., 3.…), i no el pot canviar.

**Assignació a diverses colles i persones.** A «Assignada a» es poden marcar una o diverses colles, i a «Persones assignades», una o diverses persones. Es desen a `gestio.brigades[]` i `gestio.persones[]`; per compatibilitat, `gestio.brigada` i `gestio.persona` guarden la primera de cada llista. Al tauler agrupat per colla, la tasca surt a la columna de cada colla; en arrossegar-la d'una columna a una altra es canvia aquella colla i es mantenen les altres. A `brigada.html`, cada colla veu les tasques on està assignada.

Tots dos els poden modificar només el Responsable de brigades i la direcció del parc. La resta de perfils els poden consultar.

### 4.6. Fitxers

| Fitxer | Contingut |
|---|---|
| `manteniment.json` | Tasques. Cada una té les dades d'entrada, `notificar[]` (altres correus que reben els avisos), `hores_estimades`, `fotografies[]` (`fase`: petició o seguiment), la gestió (`gestio{prioritat, data_limit, responsable, brigada, persona, empresa, observacions}` (`brigada` és el codi de la colla i `persona`, el nom de la persona assignada o `null`)), l'estat, `certificacions_hores[{hores, tipus, data, per}]`, la versió i l'historial |
| `manteniment_tipologies.json` | Tipologies de petició o tasca |
| `variables.json` | Perfils, prioritats (i si demanen data límit), dies d'avís (7), periodicitats i dies d'antelació de les tasques periòdiques (14), estats, rols, canvis d'estat permesos per rol (`transicions`), responsables generals i configuració de cada parc (`per_parc`: direcció, Responsable de brigades i responsables) |
| `brigades.json` | Colles de cada parc |
| `tasques_periodiques.json` | Tasques periòdiques: parc, element, tasca, periodicitat, data inicial i final, hores, prioritat, responsable, observacions, activa, propera execució i historial |

### 4.7. Webapp de brigades (`brigada.html`)

Aplicació per al mòbil dels **caps de colla** i els **oficials**. S'obre amb `brigada.html` (en proves: `brigada.html?prova=1`). Llegeix les dades publicades (`data/`) i desa al mòbil el que fa la colla, també sense cobertura.

- **Identificació:** parc, colla, perfil i nom. Es recorda al dispositiu.
- **Registrar** feina d'una tasca de la colla («Assignada» o «En pausa»):
  - Data, hores, persones i fotografies.
  - Com queda la tasca: **✔ Feina acabada** (passarà a «Pendent de verificar»), **○ Continua** (si estava en pausa, **▶ Reprèn**) o **⏸ En pausa** (amb motiu).
  - Les tasques assignades a la persona identificada surten primer, amb la marca «👤 Assignada a tu».
  - Un registre es pot modificar fins que el Responsable de brigades el valida.
- **📝 Nova tasca:** només són obligatoris el parc i la descripció. Opcionals: tipologia, ubicació (GPS del mòbil o toc al mapa), immoble relacionat (es proposa el més proper a menys de 500 m), fotografies, i hores estimades.
- **Registres:** llista dels registres i de les tasques entrades, amb l'estat d'enviament, i botó **⬇ Exporta els pendents**, que genera un fitxer `equip_<equip>_<data>.json` per enviar (correu o compartir).

**Al programa principal**, el Responsable de brigades o la direcció importen el fitxer amb el botó **📥 Importa de la colla**:
- Les tasques noves entren com a **Nova** (`origen.peticio`), amb les fotografies.
- Els registres s'afegeixen a la tasca (`registres_brigada[]`), amb les fotografies com a fotografies de seguiment, i en canvien l'estat: «Feina acabada» → Pendent de verificar; «En pausa» → En pausa; «Continua» d'una tasca en pausa → Assignada.
- Tornar a importar el mateix fitxer no duplica res. Un registre modificat a la colla s'actualitza si encara no s'ha validat.
- A la fitxa de la tasca, la secció **Registres de la colla** mostra els registres, el total d'hores i un botó **Valida** per a cadascun (o tots alhora). Un cop validat, la colla ja no el pot modificar.
- Quan les dades es publiquen, la webapp marca com a «rebut» el que ja s'ha importat i hi mostra les validacions.

**Connexió directa a la carpeta de treball (ordinador amb Chrome o Edge).** A la barra de dalt de `brigada.html`, el botó **Connecta la carpeta** permet triar la mateixa carpeta que el programa principal (la que conté la subcarpeta `patrimoni/`). Amb la carpeta connectada:
- Les tasques, les colles i les tipologies es llegeixen de la carpeta, no del GitHub: la colla veu les tasques en el moment que s'assignen. Es tornen a llegir cada 2 minuts, en tornar a la pestanya i amb **↻ Actualitza**.
- Cada registre o tasca nova s'envia **directament** a `manteniment.json` en desar-lo (el botó passa a ser **📤 Envia els pendents a la carpeta**). Fa el mateix que «📥 Importa de la colla»: els registres van a `registres_brigada[]` i canvien l'estat de la tasca, i les tasques noves entren com a **Nova** amb el codi `MANT-AAAA-NNNN`. Les fotografies es desen a `manteniment_fotos/`.
- El fitxer es rellegeix just abans d'escriure-hi, per no trepitjar els canvis del programa principal. Els registres validats no es modifiquen.
- Les validacions del Responsable de brigades es veuen a la webapp en actualitzar (🔒).
- Si els dos programes s'obren des del mateix lloc, la carpeta triada en un es recorda també a l'altre. El navegador pot demanar de tornar a donar permís en obrir-los.
- Als mòbils (Android i iPhone) els navegadors no permeten triar una carpeta: allà es continua fent servir **⬇ Exporta els pendents** i **📥 Importa de la colla**.

**Avís al programa principal.** Amb la carpeta connectada, `index.html` rellegeix `manteniment.json` cada minut (i en tornar a la pestanya). Si les colles hi han enviat feina:
- A la pestanya **GESTIÓ DE BRIGADES** surt el comptador **📥 N** (registres per validar i tasques noves de les colles).
- Al mòdul, una capsa **«Feina de les colles pendent de revisar»** llista les tasques amb registres per validar i les tasques noves, amb l'enllaç a cadascuna.
- Quan n'arriben de noves, surt un avís emergent.
- Mentre s'edita un formulari, la llista no es refà; en desar, el control de versió de cada tasca evita trepitjar els canvis de la colla.

### 4.8. Pendents

- **Integració a SINATCAT:** usuaris únics amb perfil, desament directe de la webapp de brigades (sense fitxer), fotografies a la base de dades i avisos per correu automàtics en lloc de mailto.
- Omplir la direcció i el Responsable de brigades de cada parc (Configuració dels parcs) i les colles, amb els membres (Colles).

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
- Amb l'usuari autenticat es podran aplicar **permisos per unitat**, si cal: per exemple, que cada parc només editi els seus immobles. Ara mateix tothom pot editar-ho tot, per cobrir vacances, baixes i suports entre colles.
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

- Dos fitxers HTML, sense instal·lació: `index.html` (programa principal) i `brigada.html` (webapp de brigades). Llibreria externa: Leaflet 1.9.4 (cdnjs) per als mapes.
- Mapes base: ICGC (topogràfic i ortofoto, © ICGC, CC BY) i OpenStreetMap.
- Les coordenades es transformen de UTM 31N a latitud i longitud amb fórmules pròpies, verificades amb `pyproj` sobre els 388 punts del patrimoni (error inferior a 1 mm).
- Paràmetres opcionals a l'URL, per a proves o per a un altre allotjament de les dades: `index.html?dades=<url de la carpeta data/>&unitats=<url de unitats_promotores.json>`.
