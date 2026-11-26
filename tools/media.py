#!/usr/bin/env python3
"""Kelukis demo: medijos paruosimas is Pexels.

    python3 tools/media.py photos  --raw DIR              # DIR/<id>.jpg (jei nera, atsisiuncia) -> assets/img/photos/*.webp
    python3 tools/media.py videos  --raw DIR --ffmpeg F   # DIR/<id>.mp4 (jei nera, atsisiuncia) -> assets/video/*.mp4 + plakatai *.webp
    python3 tools/media.py posters --ffmpeg F             # tik plakatai is jau uzkoduotu assets/video/*.mp4
    python3 tools/media.py credits                        # docs/pexels-credits.md

Reikia: curl, Pillow; video daliai ffmpeg (pvz. is paketo imageio-ffmpeg).
Originalai laikomi kataloge --raw (ne projekte), i projekta rasomi tik konvertuoti rezultatai.
Sarasas: src/data/media.json (id, failo vardas, kur naudojama, autorius, apkarpymas).
"""
import argparse, json, pathlib, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = json.loads((ROOT / 'src/data/media.json').read_text('utf-8'))
PHOTOS = ROOT / 'assets/img/photos'
VIDEO = ROOT / 'assets/video'


def curl(url, dest):
    r = subprocess.run(['curl', '-sL', '--fail', '--max-time', '300', '-o', str(dest), url])
    return r.returncode == 0 and dest.exists() and dest.stat().st_size > 500


def photos(raw):
    from PIL import Image
    PHOTOS.mkdir(parents=True, exist_ok=True)
    for p in MEDIA['photos']:
        src = raw / f"{p['id']}.jpg"
        url = f"https://images.pexels.com/photos/{p['id']}/pexels-photo-{p['id']}.jpeg?auto=compress&cs=tinysrgb&w=2200"
        if not src.exists() and not curl(url, src):
            print('NEPAVYKO', p['id']); continue
        im = Image.open(src).convert('RGB')
        if p.get('crop'):
            x0, y0, x1, y1 = p['crop']; w, h = im.size
            im = im.crop((int(w * x0), int(h * y0), int(w * x1), int(h * y1)))
        big = im.copy(); big.thumbnail((1800, 1800))
        big.save(PHOTOS / f"{p['file']}.webp", 'WEBP', quality=76, method=6)
        sm = im.copy(); sm.thumbnail((820, 820))
        sm.save(PHOTOS / f"{p['file']}-sm.webp", 'WEBP', quality=72, method=6)
        kb = (PHOTOS / f"{p['file']}.webp").stat().st_size / 1024
        print(f"{p['file']:18s} {big.size[0]}x{big.size[1]} {kb:.0f} KB")


def ff(ffmpeg, *args):
    r = subprocess.run([ffmpeg, '-v', 'error', '-y', *args])
    if r.returncode:
        sys.exit(f'ffmpeg klaida: {args}')


def encode(ffmpeg, src, out, v):
    """Apkarpo, sumazina, pasirinktinai apvercia horizontaliai ir padaro besiule kilpa (pabaiga perlieja i pradzia)."""
    base = f"scale={v['w']}:-2:flags=lanczos,fps=25,format=yuv420p" + (',hflip' if v.get('hflip') else '')
    ss, t, lp = float(v['ss']), float(v['t']), float(v.get('loop') or 0)
    common = ['-c:v', 'libx264', '-preset', 'slow', '-crf', str(v['crf']), '-profile:v', 'high', '-an', '-movflags', '+faststart']
    if lp <= 0:
        ff(ffmpeg, '-ss', str(ss), '-t', str(t), '-i', str(src), '-vf', base, *common, str(out))
        return
    fc = (f"[0:v]trim=start={ss}:end={ss + t + lp},setpts=PTS-STARTPTS,{base},split=3[s0][s1][s2];"
          f"[s0]trim=start={lp}:end={t},setpts=PTS-STARTPTS[a];"
          f"[s1]trim=start={t}:end={t + lp},setpts=PTS-STARTPTS[b];"
          f"[s2]trim=start=0:end={lp},setpts=PTS-STARTPTS[c];"
          f"[b][c]xfade=transition=fade:duration={lp}:offset=0[x];"
          f"[a][x]concat=n=2:v=1:a=0[out]")
    ff(ffmpeg, '-i', str(src), '-filter_complex', fc, '-map', '[out]', *common, str(out))


def poster(ffmpeg, mp4, out_webp):
    """Plakatas yra tiksliai pirmasis video kadras: kitaip, prasidejus grojimui, vaizdas pastebimai soktelėtu."""
    from PIL import Image
    png = out_webp.with_suffix('.png')
    ff(ffmpeg, '-i', str(mp4), '-frames:v', '1', str(png))
    Image.open(png).convert('RGB').save(out_webp, 'WEBP', quality=78, method=6)
    png.unlink()


def posters(ffmpeg):
    """Perdaro tik plakatus is jau uzkoduotu assets/video/*.mp4 (video neperkoduojami)."""
    for v in MEDIA['videos']:
        mp4 = VIDEO / f"{v['out']}.mp4"
        if mp4.exists():
            poster(ffmpeg, mp4, VIDEO / f"{v['out']}.webp")
            print(f"{v['out']}.webp {(VIDEO / (v['out'] + '.webp')).stat().st_size / 1024:.0f} KB")


def videos(raw, ffmpeg, only=None):
    VIDEO.mkdir(parents=True, exist_ok=True)
    total = 0
    for v in MEDIA['videos']:
        if only and v['out'] not in only:
            continue
        src = raw / f"{v['id']}.mp4"
        if not src.exists() and not curl(f"https://www.pexels.com/download/video/{v['id']}/", src):
            print('NEPAVYKO', v['id']); continue
        out = VIDEO / f"{v['out']}.mp4"
        encode(ffmpeg, src, out, v)
        poster(ffmpeg, out, VIDEO / f"{v['out']}.webp")
        total += out.stat().st_size
        print(f"{out.name:20s} {out.stat().st_size / 1e6:.2f} MB")
    print(f'is viso {total / 1e6:.1f} MB')


def credits():
    L = ['# Pexels medija', '',
         'Visos nuotraukos ir video yra iš [Pexels](https://www.pexels.com) (Pexels licencija: nemokamas naudojimas, autoriaus nurodyti nebūtina, bet pageidautina). '
         'Nuotraukos konvertuotos į WebP (pilnas dydis iki 1800 px ir `-sm` 820 px). Video apkarpyti, be garso, H.264, 25 kadrai/s, `faststart`, '
         'pabaiga perlieta į pradžią, kad kilpa būtų be šuolio. Plakatai `*.webp` yra pirmasis kadras. Pradžios video apverstas horizontaliai (dešiniapusis eismas).', '',
         '## Video', '', '| Failas | Kur naudojama | Pexels ID | Autorius |', '|---|---|---|---|']
    for v in MEDIA['videos']:
        L.append(f"| `assets/video/{v['out']}.mp4` | {v['use']} | [{v['id']}](https://www.pexels.com/video/{v['id']}/) | {v['author']} |")
    L += ['', '## Nuotraukos', '', '| Failas | Kur naudojama | Pexels ID | Autorius |', '|---|---|---|---|']
    for p in MEDIA['photos']:
        L.append(f"| `assets/img/photos/{p['file']}.webp` | {p['use']} | [{p['id']}](https://www.pexels.com/photo/{p['id']}/) | {p['author']} |")
    L += ['', 'Logotipas perpieštas pagal senojo kelukis.lt puslapio vaizdą; žemėlapio kontūrai sugeneruoti iš „Natural Earth“ duomenų (viešo naudojimo).', '']
    (ROOT / 'docs').mkdir(exist_ok=True)
    (ROOT / 'docs/pexels-credits.md').write_text('\n'.join(L), 'utf-8')
    print('docs/pexels-credits.md')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('what', choices=['photos', 'videos', 'posters', 'credits'])
    ap.add_argument('--raw', type=pathlib.Path)
    ap.add_argument('--ffmpeg', default='ffmpeg')
    ap.add_argument('--only', nargs='*')
    a = ap.parse_args()
    raw = a.raw or pathlib.Path(tempfile.mkdtemp(prefix='kelukis-media-'))
    raw.mkdir(parents=True, exist_ok=True)
    if a.what == 'photos': photos(raw)
    elif a.what == 'videos': videos(raw, a.ffmpeg, a.only)
    elif a.what == 'posters': posters(a.ffmpeg)
    else: credits()
