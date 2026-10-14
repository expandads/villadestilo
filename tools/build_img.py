# Gera as fotos WebP do quiz a partir dos originais.
# Uso: py -3 -I tools/build_img.py <pasta-trabalho> assets/img
# <pasta-trabalho>/src/A..E.png = originais em alta (A=Facetune 19-06-43, B=19-19-47, C=19-26-21, D=IMG_4881, E=IMG_4883)
# <pasta-trabalho>/orig/asset4.png e asset5-7.webp = e-book e relatos extraidos do HTML antigo (commit fa5baf5)
# Foto nova: adicionar a fonte em src e uma linha em CROPS (fonte, centro x, topo y, altura, normalizados).
import sys, os
from PIL import Image, ImageDraw

S = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
src = {k: Image.open(f'{S}/src/{k}.png') for k in 'ABCDE'}
RATIO = 0.5625  # 9:16 portrait, leaves lateral slack for phone cover
WIDTHS = [640, 960, 1440]

# name: (source, center x, top y, height) all normalized to source
CROPS = {
    'intro':     ('A', .62, .12, .85),
    'q1-armario':('E', .45, .06, .90),
    'q2-pecas':  ('D', .55, .08, .80),
    'q3-tempo':  ('B', .28, .10, .75),
    'q4-compra': ('E', .65, .10, .55),
    'q5-espelho':('A', .70, .25, .50),
    'q6-detalhes':('C', .25, .15, .55),
    'q7-confianca':('C', .72, .30, .60),
    'q8-comecar':('B', .50, .10, .90),
    'diagnostico':('C', .46, .04, .96),
}

def crop(k, cx, top, h):
    im = src[k]; W, H = im.size
    ch = h * H; cw = ch * RATIO
    x0 = min(max(cx * W - cw / 2, 0), W - cw)
    return im.crop((round(x0), round(top * H), round(x0 + cw), round(top * H + ch)))

sim = []
for name, (k, cx, top, h) in CROPS.items():
    c = crop(k, cx, top, h)
    for w in WIDTHS:
        r = c.resize((w, round(w / RATIO)), Image.LANCZOS)
        r.save(f'{OUT}/{name}-{w}.webp', 'WEBP', quality=68, method=6)
    # simulate a 390x844 phone with object-fit cover + quiz gradient
    ph = c.resize((round(844 * RATIO), 844), Image.LANCZOS)
    off = (ph.width - 390) // 2
    ph = ph.crop((off, 0, off + 390, 844)).convert('RGBA')
    g = Image.new('RGBA', ph.size); d = ImageDraw.Draw(g)
    stops = [(0, 0x55), (.15, 0x0a), (.38, 0xbb), (.70, 0xf0), (1, 0xff)]
    for y in range(844):
        t = y / 843
        for (a, va), (b, vb) in zip(stops, stops[1:]):
            if a <= t <= b:
                v = va + (vb - va) * (t - a) / (b - a); break
        d.line([(0, y), (390, y)], fill=(16, 16, 15, int(v)))
    ph = Image.alpha_composite(ph, g).convert('RGB')
    ImageDraw.Draw(ph).text((8, 820), name, fill='yellow')
    sim.append(ph)

sheet = Image.new('RGB', (395 * 5, 849 * 2), 'white')
for i, p in enumerate(sim):
    sheet.paste(p, ((i % 5) * 395, (i // 5) * 849))
sheet.thumbnail((1600, 1600))
sheet.save(f'{S}/sim.jpg', quality=82)

# avatar: square on the right-hand face of A
A = src['A']; W, H = A.size; s = .30 * W
av = A.crop((round(.58 * W), round(.30 * H), round(.58 * W + s), round(.30 * H + s)))
av.resize((99, 99), Image.LANCZOS).save(f'{OUT}/avatar.webp', 'WEBP', quality=80, method=6)

# product mockup keeps alpha
p = Image.open(f'{S}/orig/asset4.png')
p.resize((640, round(640 * p.height / p.width)), Image.LANCZOS).save(f'{OUT}/ebook-looks-inteligentes.webp', 'WEBP', quality=82, method=6)

# proof screenshots: same 941x1672 dimensions (crop offsets in JS depend on it)
for i, n in [(6, 1), (7, 2), (5, 3)]:
    Image.open(f'{S}/orig/asset{i}.webp').save(f'{OUT}/relato-{n}.webp', 'WEBP', quality=80, method=6)
