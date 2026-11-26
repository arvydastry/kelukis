#!/usr/bin/env python3
"""Kelukis demo: logotipas ir ikonu rinkinys.

    python3 tools/brand.py logo  --font KELIAS/Archivo-Italic.ttf    -> src/partials/logo.html, assets/img/brand/{logo,logo-white,mark}.svg
    python3 tools/brand.py icons --src  KELIAS/phosphor/assets/regular -> src/partials/icons.svg

Logotipas: zodinis zenklas surinktas Archivo Italic (wght 800, wdth 125) ir paverstas kreivemis,
su horizontaliais "greicio" pjuviais kaip originale; zenklas (raudonas smaigalys su tamsiai melynu keliu)
perpiestas pagal senojo kelukis.lt puslapio vaizda. Pries paleidima reikia originalaus vektorinio logotipo.
Ikonos: Phosphor (MIT), https://phosphoricons.com
Reikia fontTools.
"""
import argparse, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
RED, NAVY = '#E42024', '#2B2767'
ICONS = """list x arrow-right arrow-up-right arrow-left arrow-down arrow-up caret-down caret-right caret-up phone envelope-simple
map-pin play pause plus minus check globe-simple truck warehouse headset seal-check ruler package cube facebook-logo linkedin-logo
shield-check buildings handshake users-three users wrench clock copy calendar-blank calendar-check clipboard-text snowflake
shipping-container path steering-wheel leaf chart-line-up certificate coffee percent letter-circle-p gauge thermometer-cold
map-trifold compass road-horizon identification-card paper-plane-tilt gas-pump engine tire crane signpost navigation-arrow
arrows-left-right medal trend-up bank file-text chats-circle target lightning gear timer suitcase-rolling bed translate
upload-simple paperclip info download-simple eye""".split()


def icons(src):
    out = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">']
    for name in ICONS:
        f = src / f'{name}.svg'
        if not f.exists():
            print('NERA', name); continue
        body = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', f.read_text('utf-8'), flags=re.S)
        out.append(f'<symbol id="i-{name}" viewBox="0 0 256 256">{body}</symbol>')
    out.append('</svg>')
    (ROOT / 'src/partials/icons.svg').write_text('\n'.join(out), 'utf-8')
    print('icons.svg', len(out) - 2, 'ikonos')


def logo(font_path):
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen

    f = instantiateVariableFont(TTFont(str(font_path)), {'wght': 800, 'wdth': 125})
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f['hmtx']
    cap = getattr(f['OS/2'], 'sCapHeight', 0) or 686
    H = 48.0                      # viewBox aukstis
    CAPH = 27.0                   # didziuju raidziu aukstis
    k = CAPH / cap
    base = 37.5                   # bazine linija
    MARK_W = 45.0
    x = MARK_W + 9.0
    track = 18                    # tarpas tarp raidziu, srifto vienetais
    letters = []
    for ch in 'KELUKIS':
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x, base)))
        letters.append(pen.getCommands())
        x += (hmtx[g][0] + track) * k
    W = round(x - track * k + 2, 1)
    top = base - CAPH
    # matomos juostos (tarp ju lieka pjuviai): pjuviai apatineje raidziu puseje, storeja zemyn
    cuts = [(0.50, 0.045), (0.655, 0.06), (0.815, 0.075)]
    bands, y = [], top - 2
    for pos, th in cuts:
        cy = top + CAPH * pos
        bands.append((y, cy - y)); y = cy + CAPH * th
    bands.append((y, base + 3 - y))
    clip = ''.join(f'<rect x="{MARK_W + 4:.1f}" y="{by:.2f}" width="{W - MARK_W:.1f}" height="{bh:.2f}"/>' for by, bh in bands)
    # zenklas: raudonas smaigalys (pasvires kaip kursyvas) ir kelias perspektyvoje
    mark = (f'<path class="logo__peak" fill="{RED}" d="M2 44 25.5 3.5h7L44.5 44h-9.3L29 19.5 13.2 44z"/>'
            f'<path class="logo__road" fill="{{road}}" d="M18.5 44l8.9-14.2 3.9 14.2z"/>')
    word = ''.join(f'<path class="logo__l" d="{d}"/>' for d in letters)

    def svg(cls, fill, road, cid, extra=''):
        return (f'<svg class="{cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H:.0f}" role="img" aria-label="Kelukis"{extra}>'
                f'<defs><clipPath id="{cid}">{clip}</clipPath></defs>'
                f'<g class="logo__mark">{mark.format(road=road)}</g>'
                f'<g class="logo__word" fill="{fill}" clip-path="url(#{cid})">{word}</g></svg>')

    (ROOT / 'src/partials/logo.html').write_text(svg('logo', 'currentColor', 'currentColor', 'lg__ID__'), 'utf-8')
    brand = ROOT / 'assets/img/brand'; brand.mkdir(parents=True, exist_ok=True)
    (brand / 'logo.svg').write_text(svg('logo', NAVY, NAVY, 'lg', f' width="{W * 4:.0f}" height="{H * 4:.0f}"'), 'utf-8')
    (brand / 'logo-white.svg').write_text(svg('logo', '#fff', '#fff', 'lg', f' width="{W * 4:.0f}" height="{H * 4:.0f}"'), 'utf-8')
    (brand / 'mark.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="{NAVY}"/>'
        f'<g transform="translate(4.6 4.4) scale(.82)"><path fill="{RED}" d="M2 44 25.5 3.5h7L44.5 44h-9.3L29 19.5 13.2 44z"/>'
        f'<path fill="#fff" d="M18.5 44l8.9-14.2 3.9 14.2z"/></g></svg>', 'utf-8')
    print(f'logo: {W} x {H:.0f}, raides {len(letters)}, cap {cap}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('what', choices=['logo', 'icons'])
    ap.add_argument('--font', type=pathlib.Path)
    ap.add_argument('--src', type=pathlib.Path)
    a = ap.parse_args()
    logo(a.font) if a.what == 'logo' else icons(a.src)
