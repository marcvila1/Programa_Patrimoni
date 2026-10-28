# Motor Patrimoni — Esquema de dades JSON

Generat per `scripts/convert.py` a partir dels 14 fitxers `llistes_*.xlsx` del repositori `marcvila1/Programa_Patrimoni`.

## Fitxers

| Fitxer | Contingut | Registres |
|---|---|---|
| `unitats_promotores.json` | **Còpia sense modificar** del fitxer del repositori `Motor-Contractacio-DGPA` (font de veritat de codis, noms, NIF i seu de cada unitat) | 38 unitats |
| `espais.json` | Dades pròpies del Patrimoni per a cada unitat que és un espai natural, indexades per codi d'unitat (`tipus_espai`, `fitxer_origen`, `nom_excel`, `nombre_elements`) | 14 |
| `elements.json` | Elements patrimonials (una entrada per element) | 390 |
| `documents.json` | PDF referenciats (plànols, convenis, plans d'emergència) amb camp `url` pendent | 66 |
| `catalegs.json` | Catàlegs tancats (codi → etiqueta) i llistes obertes per a desplegables | — |
| `qualitat.json` | Informe de conversió: decisions preses, correccions, avisos (amb el seu estat), duplicats descartats | — |
| `metadata.json` | Informació del conjunt de dades: fonts i versions, **sistema de coordenades (ETRS89 / UTM fus 31N, EPSG:25831)**, recomptes i pendents globals | — |

## Regles de conversió aplicades

1. **Identificador:** `id = <codi_unitat>/<codi_element>` (p. ex. `PNAE/acampada_cortalet`), amb els codis d'unitat del Motor de Contractació. El codi d'element sol no és únic (`caseta_fusta` existeix a `PNAE` i a `PNMS` amb elements diferents). La correspondència entre fitxer Excel i unitat és a `scripts/mapa_unitats.json`. El nom oficial de cada espai s'obté sempre de `unitats_promotores.json`.
2. **Còpies Ports a Secans:** els 54 elements dels Ports que figuraven a `llistes_secans.xlsx` es descarten; es conserva la versió del fitxer dels Ports.
3. **Element compartit:** `casa_parcs_pirineus` és un sol element (`PNAP/casa_parcs_pirineus`) amb `unitats: ["PNAP", "PNCM"]`. S'ha conservat la versió d'Alt Pirineu (el camp *ús principal* difereix lleugerament a Cadí; detall a `qualitat.json`).
4. **Buits:** `null` = no consta / no aplica. Els valors «No consta», «Desconegut», «Sense dades», «Sense adreça» i «No es detecten …» no es guarden com a text.
5. **Sí/No** → booleà. Els camps amb més de dos valors són enumeracions amb codi (veure `catalegs.json`).
6. **Camps compostos descomposts:** CP i municipi, UTM (x, y), altitud (m), superfície (m²), polígon i parcel·la, nombre de plantes, any de construcció, reformes, volum anual de públic.
7. **Zones:** les 7 zones repetides de l'Excel són una llista `zones[]` amb només les zones declarades.
8. **Estat d'execució:** tots els immobles inventariats són `operatiu` o `requereix_revisio`. Requereixen revisió els que tenen el document jurídic caducat, en tràmit o amb la data de fi de vigència passada, o un contracte de paraula (acord verbal o compromís de mutu acord). `data_fi_vigencia` és `null` a la càrrega inicial; el programa avisa 6 mesos abans. El motiu queda a `motius_automatics`.
9. **Documents:** els noms de PDF queden com a `{fitxer, url: null}` per afegir-hi l'enllaç més endavant.

## Estructura d'un element

```
id, codi, unitat, unitats[]
identificacio   nom, titol, altres_noms[], tipus_element, destinacio_principal,
                tipus_propietat, titular, referencia_cadastral, referencia_cadastral_nota,
                finca_registral, tipus_finca, proteccio_patrimoni
localitzacio    adreca, cp, municipi, localitzacio_cadastre{text, poligon, parcela},
                tipus_acces, acces_adaptat, utm{x, y, text_original}, altitud_m
construccio     any_construccio{valor, text, precisio}, reformes{estat, anys[], descripcio},
                reformes_programades{programades, any, descripcio}, plantes, altell,
                superficie_m2, planols{fitxer, url}, materials{envolvent, coberta, estructura,
                paviments_interiors}, serveis{electricitat, aigua, sanejament, internet, alarma,
                vigilancia}, obert_public, interior_adaptat_discapacitats, estat_conservacio,
                deficiencies{detectades, descripcio, reparacions_i_cost, nombre_fotografies},
                riscos{detectats, descripcio}
us_i_regim      us_principal, propietari, usuari_explotador, regim_juridic,
                document_juridic{tipus, estat, data_fi_vigencia, fitxer, url}, zones_accessibles_public,
                presencia_personal_parc, presencia_personal_alie, tipus_presencia_personal,
                detall_presencia_personal, volum_anual_public{estat, valor},
                perfil_public{estat, text}, pla_autoproteccio{estat, fitxer}
estat_execucio  estat (planificacio | operatiu | requereix_revisio | suprimit),
                fase (f1_concepte … f5_obres, només si estat = planificacio),
                motius_automatics[{codi, text}] (contracte_no_vigent | contracte_en_tramit | contracte_paraula; calculats),
                motiu (text manual, només si estat = requereix_revisio)
zones[]         numero, nom, usos, usuaris, accessible_public, accessible_menors,
                adaptat_discapacitats, presencia_personal_parc, presencia_personal_alie,
                regim_personal_alie, tipus_presencia_personal, detall_presencia_personal,
                necessitat_permis_previ, inclos_pla_autoproteccio
fotografies     nombre, fitxers[]
notes           identificacio, localitzacio, construccio, fotografies, us
meta            origen{fitxer, columna}, creat, modificat, pendents[{camp, motiu}]
```

`meta.pendents` llista les dades que s'han de completar (p. ex. una coordenada truncada a l'Excel); el frontend les pot mostrar com a avís.

## Correccions manuals

Les decisions preses sobre els avisos de qualitat són a `scripts/correccions_manuals.json` i s'apliquen cada vegada que s'executa `convert.py`. A `qualitat.json`, cada avís té un `estat`: `confirmat`, `corregit_manual`, `pendent`, `informatiu` o `obert`.

## Pendents

Es llisten també a `metadata.json` (`pendents_globals`) i, per element, a `meta.pendents`.

- Coordenada UTM de `PNDE/magatzem_deltebre` (l'original és truncat).
- Enllaços (`url`) dels documents PDF referenciats.
- Revisar si l'Access conté camps o taules addicionals respecte dels Excel (l'esquema admet afegir-ne).
