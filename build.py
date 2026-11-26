#!/usr/bin/env python3
"""Kelukis demo: surinkimas.   Naudojimas: python3 build.py

src/pages/*.html + src/partials/*.html  ->  *.html projekto saknyje

Sablonu zymes:
  {{> dalis}}          src/partials/dalis.html (arba .svg)
  {{i:vardas}}         Phosphor ikona is src/partials/icons.svg ({{i:vardas klase}} su papildoma klase)
  {{logo}}             logotipas kreivemis (src/partials/logo.html), kiekvienas iterpimas gauna unikalu id
  {{gen:vardas}}       Python generuojamas blokas is src/data/site.json (zr. GEN)
  {{kintamasis}}       reiksme is puslapio <!--meta {...}--> bloko arba site.json "company"
  {{icons}}            ikonu rinkinys, i ji patenka tik puslapyje panaudotos ikonos
Tik standartine Python biblioteka.
"""
import hashlib, html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
SITE = json.loads((SRC / 'data/site.json').read_text('utf-8'))
E = html.escape
_logo_n = 0


def icon(name, cls=''):
    return f'<svg class="ic{" " + cls if cls else ""}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'


def partial(name):
    for ext in ('.html', '.svg'):
        p = SRC / 'partials' / f'{name}{ext}'
        if p.exists():
            return p.read_text('utf-8')
    raise SystemExit(f'nera dalies: {name}')


def logo(_m=None):
    global _logo_n
    _logo_n += 1
    return partial('logo').replace('__ID__', str(_logo_n))


# ---------------------------------------------------------------- generuojami blokai
def gen_mega():
    out = []
    for i, s in enumerate(SITE['services']):
        out.append(f'''<a class="mega__item" href="paslaugos.html#{s['slug']}" style="--i:{i}">
  <span class="mega__thumb"><img src="assets/video/{s['video']}.webp" alt="" loading="lazy" decoding="async"></span>
  <span class="mega__txt"><span class="mega__n">{s['n']}</span><span class="mega__name">{E(s['name'])}</span><span class="mega__lead">{E(s['mega'])}</span></span>
  <span class="mega__go">{icon('arrow-up-right')}</span>
</a>''')
    return '\n'.join(out)


def gen_service_links():
    return '\n'.join(f'<li><a href="paslaugos.html#{s["slug"]}">{E(s["name"])}</a></li>' for s in SITE['services'])


def gen_panels():
    out = []
    for i, s in enumerate(SITE['services']):
        chips = ''.join(f'<li>{E(c)}</li>' for c in s['chips'])
        out.append(f'''<article class="pan{' is-active' if i == 0 else ''}" data-pan tabindex="0" aria-label="{E(s['name'])}">
  <div class="pan__media">
    <img src="assets/video/{s['video']}.webp" alt="" loading="lazy" decoding="async">
    <video muted loop playsinline preload="none" data-src="assets/video/{s['video']}.mp4" aria-hidden="true"></video>
  </div>
  <div class="pan__shade"></div>
  <div class="pan__closed"><span class="pan__n">{s['n']}</span><span class="pan__vname">{E(s['short'])}</span>{icon(s['icon'])}</div>
  <div class="pan__open">
    <div class="pan__top"><span class="pan__n">{s['n']}</span><span class="pan__ic">{icon(s['icon'])}</span></div>
    <div class="pan__body">
      <h3 class="pan__title">{E(s['name'])}</h3>
      <p class="pan__lead">{E(s['lead'])}</p>
      <ul class="chips chips--glass">{chips}</ul>
      <a class="link link--light" href="paslaugos.html#{s['slug']}">Plačiau {icon('arrow-right')}</a>
    </div>
  </div>
</article>''')
    return '\n'.join(out)


def gen_kin():
    words = SITE['marquee']
    items = ''.join(f'<span class="kin__w{" kin__w--o" if i % 2 else ""}">{E(w)}</span><span class="kin__sep" aria-hidden="true"></span>' for i, w in enumerate(words))
    return f'<div class="kin__g">{items}</div><div class="kin__g" aria-hidden="true">{items}</div>'


def gen_bars():
    data = SITE['revenue']
    mx = max(v for _, v in data)
    out = []
    for i, (year, v) in enumerate(data):
        last = i == len(data) - 1
        val = f'{v:.1f}'.replace('.', ',')
        out.append(f'<li class="bars__b{" is-top" if last else ""}" style="--h:{v / mx:.3f};--i:{i}" tabindex="0">'
                   f'<span class="bars__v">{val}</span><span class="bars__col"></span><span class="bars__y">{str(year)[2:] if not last and i else year}</span></li>')
    return '\n'.join(out)


def gen_spark():
    data = SITE['team']
    mx = max(v for _, v in data); n = len(data)
    pts = [(round(6 + i * (288 / (n - 1)), 1), round(84 - (v / mx) * 70, 1)) for i, (_, v) in enumerate(data)]
    line = 'M' + ' L'.join(f'{x} {y}' for x, y in pts)
    area = line + f' L{pts[-1][0]} 92 L{pts[0][0]} 92Z'
    return (f'<svg class="spark" viewBox="0 0 300 96" preserveAspectRatio="none" aria-hidden="true">'
            f'<path class="spark__a" d="{area}"/><path class="spark__l" d="{line}" pathLength="1"/>'
            f'<circle class="spark__d" cx="{pts[-1][0]}" cy="{pts[-1][1]}" r="4.5"/></svg>')


def gen_brands():
    items = ''.join(f'<span class="brands__w">{E(b)}</span><span class="brands__dot" aria-hidden="true"></span>' for b in SITE['brands'])
    return f'<div class="brands__g">{items}</div><div class="brands__g" aria-hidden="true">{items}</div>'


GEN = {'mega': gen_mega, 'service_links': gen_service_links, 'panels': gen_panels, 'kin': gen_kin,
       'bars': gen_bars, 'spark': gen_spark, 'brands': gen_brands}


# ---------------------------------------------------------------- surinkimas
def render(text, meta, depth=0):
    if depth > 6:
        raise RuntimeError('per gilus iterpimas')
    text = re.sub(r'\{\{>\s*([\w-]+)\s*\}\}', lambda m: render(partial(m.group(1)), meta, depth + 1), text)
    text = re.sub(r'\{\{i:([\w-]+)(?:\s+([\w -]+))?\}\}', lambda m: icon(m.group(1), m.group(2) or ''), text)
    text = re.sub(r'\{\{gen:([\w_]+)\}\}', lambda m: GEN[m.group(1)](), text)
    text = re.sub(r'\{\{logo\}\}', logo, text)
    text = re.sub(r'\{\{(\w+)\}\}', lambda m: str(meta[m.group(1)]) if m.group(1) in meta else m.group(0), text)
    return text


def sprite(page_html):
    used = set(re.findall(r'#i-([\w-]+)', page_html))
    src = partial('icons')
    syms = {m.group(1): m.group(0) for m in re.finditer(r'<symbol id="i-([\w-]+)".*?</symbol>', src, re.S)}
    missing = used - set(syms)
    if missing:
        raise SystemExit(f'nera ikonu: {sorted(missing)}')
    return ('<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
            + ''.join(syms[n] for n in sorted(used)) + '</svg>')


def versioned(page_html):
    """Prie CSS ir JS nuorodu prideda ?v=<turinio santrauka>, kad po atnaujinimo narsykle neimtu senu failu is podelio
    (GitHub Pages failus leidzia laikyti 10 min., todel be to naujas HTML galetu gauti sena JS ar CSS)."""
    def add(m):
        f = ROOT / m.group(2)
        if not f.exists():
            return m.group(0)
        return f'{m.group(1)}="{m.group(2)}?v={hashlib.md5(f.read_bytes()).hexdigest()[:8]}"'
    return re.sub(r'(href|src)="(assets/(?:css|js)/[^"?#]+\.(?:css|js))"', add, page_html)


def build():
    for p in sorted((SRC / 'pages').glob('*.html')):
        raw = p.read_text('utf-8')
        m = re.match(r'\s*<!--meta\s*(\{.*?\})\s*-->', raw, re.S)
        meta = dict(SITE['company'])
        meta.update(json.loads(m.group(1)) if m else {})
        body = raw[m.end():] if m else raw
        meta.setdefault('page', p.stem)
        for k in ('bodyclass', 'scripts', 'nav_pasl', 'nav_karj', 'nav_kont', 'nav_home'):
            meta.setdefault(k, '')
        out = render(partial('layout').replace('{{content}}', body), meta)
        out = out.replace('{{icons}}', sprite(out))
        out = versioned(out)
        left = re.findall(r'\{\{[^}]+\}\}', out)
        if left:
            raise SystemExit(f'{p.name}: neisspresta {sorted(set(left))[:6]}')
        (ROOT / p.name).write_text(out, 'utf-8')
        print(f'{p.name:16s} {len(out) / 1024:.0f} KB')


if __name__ == '__main__':
    build()
