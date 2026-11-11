"""Genera data/municipis.json a partir de la capa de municipis 1:50.000 de l'ICGC (Divisions administratives, CC BY 4.0).
Ús: python3 -I construeix.py <divisions.gpkg> <elements.json> <sortida.json> [tolerància_m] [marge_m]"""
import json, sys, collections, pyogrio, shapely
from shapely.geometry import Point, MultiPoint, mapping
F, ELS, OUT = sys.argv[1:4]; TOL = float(sys.argv[4]) if len(sys.argv) > 4 else 10; MARGE = float(sys.argv[5]) if len(sys.argv) > 5 else 5000
df = pyogrio.read_dataframe(F, layer='_62_municipis-50000', columns=['CODIMUNI', 'NOMMUNI', 'NOMCOMAR'])
els = json.load(open(ELS, encoding='utf-8')); els = els if isinstance(els, list) else els['elements']
# Zona de cada parc: envolupant convexa dels seus immobles amb un marge
pts = collections.defaultdict(list)
for e in els:
    u = (e.get('localitzacio') or {}).get('utm') or {}
    if u.get('x') and u.get('y'):
        for un in (e.get('unitats') or [e.get('unitat')]):
            pts[un].append((u['x'], u['y']))
zones = {un: MultiPoint(p).convex_hull.buffer(MARGE) for un, p in pts.items()}
zona = shapely.union_all(list(zones.values()))
sel = df[df.intersects(zona)].copy()
sel['geometry'] = sel.geometry.simplify(TOL, preserve_topology=True).apply(lambda g: shapely.set_precision(g, 1))
feats = [{'codi': r.CODIMUNI, 'nom': r.NOMMUNI, 'comarca': r.NOMCOMAR, 'bbox': [int(v) for v in r.geometry.bounds],
          'poligons': mapping(r.geometry)['coordinates'] if r.geometry.geom_type == 'MultiPolygon' else [mapping(r.geometry)['coordinates']]}
         for r in sel.itertuples()]
out = {'font': "Institut Cartogràfic i Geològic de Catalunya (ICGC). Divisions administratives v2r2 (20/01/2026), municipis 1:50.000. Llicència CC BY 4.0.",
       'crs': 'EPSG:25831', 'simplificacio_m': TOL, 'marge_parcs_m': MARGE, 'municipis': feats}
s = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
open(OUT, 'w', encoding='utf-8').write(s)
print(f'{len(feats)} municipis · {len(s.encode())/1e3:.0f} kB')
# Validació: municipi de cada immoble segons la UTM vs el de la fitxa
idx = [(f['nom'], shapely.MultiPolygon([shapely.Polygon(p[0], p[1:]) for p in f['poligons']])) for f in feats]
norm = lambda s: (s or '').strip().lower().replace('’', "'")
ok = dif = fora = 0; difs = []
for e in els:
    u = (e.get('localitzacio') or {}).get('utm') or {}; m = (e.get('localitzacio') or {}).get('municipi')
    if not (u.get('x') and u.get('y')): continue
    p = Point(u['x'], u['y']); trobat = next((n for n, g in idx if g.contains(p)), None)
    if trobat is None: fora += 1; difs.append((e['id'], m, '— cap —')); continue
    if norm(trobat) == norm(m): ok += 1
    else: dif += 1; difs.append((e['id'], m, trobat))
print(f'immobles amb UTM: coincideix {ok} · diferent {dif} · fora de cap polígon {fora}')
for d in difs: print('  ', *d, sep=' | ')
