#!/usr/bin/env python3
"""Kelukis demo: taskinis Europos zemelapis marsrutu sekcijai.

    python3 tools/map.py --atlas KELIAS/countries-50m.json     ->  assets/js/mapdata.js (window.KMAP)

Saltinis: npm paketas `world-atlas` (Natural Earth, viesas naudojimas), failas countries-50m.json.
Kontūrai suprojektuojami (lygiatarpe kugine projekcija), nupiesiami i kauke ir is jos paimamas
sesiakampis tasku tinklelis. Reiksmes: 0 jura, 1 sausuma, 2 Vokietija, 3 Lietuva, 4 Prancuzija, 5 Belgija.
Reikia Pillow.
"""
import argparse, json, math, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
LON0, LON1, LAT0, LAT1 = -10.8, 31.5, 35.9, 60.3
PHI0, LAM0 = math.radians(52), math.radians(10)
N = math.sin(PHI0); G = 1 / math.tan(PHI0) + PHI0; RHO0 = G - PHI0
W = 1000.0          # viewBox plotis
DX = 10.4           # tasku zingsnis viewBox vienetais
SS = 4              # kaukes didinimas
CLASS = {'276': 2, '440': 3, '250': 4, '056': 5}   # Vokietija, Lietuva, Prancuzija, Belgija (salys patvirtintos darbo skelbimais)
SKIP = {'504', '012', '788', '434', '818', '732'}   # Siaures Afrika: nerodome

CITIES = {  # pavadinimas: (ilguma, platuma)
    'Vilnius': (25.28, 54.69), 'Varšuva': (21.01, 52.23), 'Berlynas': (13.40, 52.52), 'Hamburgas': (9.99, 53.55),
    'Kelnas': (6.96, 50.94), 'Frankfurtas': (8.68, 50.11), 'Miunchenas': (11.58, 48.14), 'Briuselis': (4.35, 50.85),
    'Antverpenas': (4.40, 51.22), 'Paryžius': (2.35, 48.86), 'Lionas': (4.84, 45.76), 'Marselis': (5.37, 43.30),
    'Bordo': (-0.58, 44.84), 'Lilis': (3.06, 50.63), 'Strasbūras': (7.75, 48.57),
}
LABELS = {'Vokietija': (10.3, 51.2), 'Prancūzija': (2.3, 46.9), 'Belgija': (4.6, 50.55), 'Lietuva': (23.9, 55.35), 'Lenkija': (19.3, 52.1)}


def proj(lon, lat):
    rho = G - math.radians(lat); th = N * (math.radians(lon) - LAM0)
    return rho * math.sin(th), -(RHO0 - rho * math.cos(th))   # y i apacia


def main(atlas):
    from PIL import Image, ImageDraw
    topo = json.loads(pathlib.Path(atlas).read_text('utf-8'))
    sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
    arcs = []
    for a in topo['arcs']:
        x = y = 0; pts = []
        for dx, dy in a:
            x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(idx):
        out = []
        for i in idx:
            seg = arcs[i] if i >= 0 else arcs[~i][::-1]
            out.extend(seg if not out else seg[1:])
        return out

    # ribos
    edge = [proj(lo, la) for lo in (LON0, (LON0 + LON1) / 2, LON1) for la in (LAT0, LAT1)]
    edge += [proj(lo, la) for la in (LAT0, (LAT0 + LAT1) / 2, LAT1) for lo in (LON0, LON1)]
    xs = [p[0] for p in edge]; ys = [p[1] for p in edge]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    k = W / (x1 - x0); H = round((y1 - y0) * k)

    def to_px(lon, lat):
        x, y = proj(lon, lat)
        return (x - x0) * k, (y - y0) * k

    mask = Image.new('L', (int(W * SS), int(H * SS)), 0)
    d = ImageDraw.Draw(mask)
    geoms = topo['objects']['countries']['geometries']
    order = sorted(geoms, key=lambda g: str(g.get('id')) in CLASS)
    for g in order:
        cid = str(g.get('id'))
        if cid in SKIP or not g.get('arcs'):
            continue
        val = CLASS.get(cid, 1)
        polys = [g['arcs']] if g['type'] == 'Polygon' else g['arcs']
        for poly in polys:
            outer = ring(poly[0])
            lons = [p[0] for p in outer]; lats = [p[1] for p in outer]
            if max(lons) < LON0 - 6 or min(lons) > LON1 + 6 or max(lats) < LAT0 - 4 or min(lats) > LAT1 + 4:
                continue
            if max(lons) - min(lons) > 180:        # per datos linija einantys kontūrai
                continue
            d.polygon([tuple(c * SS for c in to_px(lo, la)) for lo, la in outer], fill=val)
            for hole in poly[1:]:
                d.polygon([tuple(c * SS for c in to_px(lo, la)) for lo, la in ring(hole)], fill=0)

    dy = DX * math.sqrt(3) / 2
    cols = int(W // DX); rows_n = int(H // dy)
    px = mask.load(); mw, mh = mask.size
    rows = []; counts = [0] * 6
    offs = [(0, 0), (-.28, -.28), (.28, -.28), (-.28, .28), (.28, .28)]
    for r in range(rows_n):
        line = []
        for c in range(cols):
            cx = DX / 2 + c * DX + (DX / 2 if r % 2 else 0); cy = dy / 2 + r * dy
            vals = []
            for ox, oy in offs:
                ix = int((cx + ox * DX) * SS); iy = int((cy + oy * DX) * SS)
                vals.append(px[ix, iy] if 0 <= ix < mw and 0 <= iy < mh else 0)
            land = sum(1 for v in vals if v) >= 3
            v = (vals[0] or max(set(vals) - {0}, key=vals.count)) if land else 0
            counts[v] += 1; line.append(str(v))
        rows.append(''.join(line))

    def pt(lon, lat):
        x, y = to_px(lon, lat); return [round(x, 1), round(y, 1)]

    data = {'w': int(W), 'h': H, 'dx': DX, 'dy': round(dy, 3), 'cols': cols, 'rows': rows,
            'cities': {n: pt(*ll) for n, ll in CITIES.items()}, 'labels': {n: pt(*ll) for n, ll in LABELS.items()}}
    out = ROOT / 'assets/js/mapdata.js'
    out.write_text('/* sugeneruota tools/map.py is Natural Earth (world-atlas countries-50m) */\nwindow.KMAP=' +
                   json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', 'utf-8')
    print(f'{out.name}: {W:.0f}x{H}, {cols}x{rows_n} tinklelis, jura/sausuma/DE/LT/FR/BE = {counts}, {out.stat().st_size / 1024:.1f} KB')
    # perziurai
    prev = Image.new('RGB', (int(W), H), (27, 24, 64))
    pd = ImageDraw.Draw(prev)
    col = {1: (86, 84, 140), 2: (190, 196, 255), 3: (228, 32, 36), 4: (150, 200, 255), 5: (255, 220, 150)}
    for r, line in enumerate(rows):
        for c, ch in enumerate(line):
            if ch != '0':
                cx = DX / 2 + c * DX + (DX / 2 if r % 2 else 0); cy = dy / 2 + r * dy
                pd.ellipse([cx - 2.6, cy - 2.6, cx + 2.6, cy + 2.6], fill=col[int(ch)])
    for n, (x, y) in data['cities'].items():
        pd.ellipse([x - 5, y - 5, x + 5, y + 5], outline=(255, 255, 255), width=2)
    return prev


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--atlas', required=True)
    ap.add_argument('--preview')
    a = ap.parse_args()
    im = main(a.atlas)
    if a.preview:
        im.save(a.preview); print('perziura', a.preview)
