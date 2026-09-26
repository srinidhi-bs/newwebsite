"""
make_share_image.py — draws the link-preview ("share") picture for
/trading/investing-from-zero.  (Session 51, 2026-09-26, task L1.)

WHAT IT IS FOR
  When someone pastes the page's link into WhatsApp (or LinkedIn, Slack...),
  the app shows a small card: picture + title + one line. The picture is the
  page's `og:image`. Without one, WhatsApp showed the React logo.

WHAT IT DRAWS  (1200 x 630 px — the standard link-preview shape, 1.91 : 1)
  A page from Srinidhi's notebook, matching the game's level map:
    - cream paper, faint blue ruled lines, a red margin line
    - a small mono kicker:          SRINIDHIBS.COM / TRADING
    - the title in handwriting:     Investing, from zero   (+ a wavy teal underline)
    - the one-line promise:         A short game about money. No jargon, no fund tips.
    - the 7 sittings as numbered hand-drawn badges joined by a dashed trail,
      inked like the map: teal for 1, 2 and 7; RED for the equity branch 3-6.

HOW IT DRAWS SMOOTHLY
  Pillow draws hard, jagged edges. So we draw everything at 2x size
  (2400 x 1260) and shrink it at the end — the shrink blends the edges
  (this is "supersampling").

FONTS
  Uses the same web fonts the site ships (npm @fontsource packages), so the
  handwriting matches the map exactly. Pillow reads .woff files directly.
  NOTE: these are the LATIN subsets — symbols like → are missing and draw as
  empty boxes. Stick to plain letters and basic punctuation.

RUN (from the project root):   python scripts/make_share_image.py
  -> writes public/images/investing/og-investing-from-zero.png
Needs Pillow (pip install pillow). Re-run it whenever the look or words change.
"""
import logging
import math
import os

from PIL import Image, ImageDraw, ImageFont

logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
log = logging.getLogger('share-image')

# ── Output ──────────────────────────────────────────────────────────────────
OUT = 'public/images/investing/og-investing-from-zero.png'
W, H = 1200, 630          # final size
S = 2                     # supersample factor: draw at 2x, shrink at the end

# ── Words (kept identical to src/content/investing/en/ui.js) ────────────────
KICKER = 'SRINIDHIBS.COM  /  TRADING'
TITLE = 'Investing, from zero'
PROMISE = 'A short game about money. No jargon, no fund tips.'

# ── Inks — the SAME hex values as the level map (LevelMap.js, light theme) ─
PAPER = '#FFFDF7'
RULE = '#DCE7F5'          # faint blue ruled lines
MARGIN = '#F4B4B4'        # the notebook's pinkish-red margin line
INK = '#1C1917'           # near-black pen
TEAL = '#0E7490'
RED = '#DC2626'
PENCIL = '#78716C'

# ── Fonts (from node_modules, as shipped on the site) ──────────────────────
FONT_DIR = 'node_modules/@fontsource'
CAVEAT = f'{FONT_DIR}/caveat/files/caveat-latin-600-normal.woff'
MONO = f'{FONT_DIR}/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'


def s(v):
    """Scale a final-size measurement up to the 2x drawing canvas."""
    return int(round(v * S))


def font(path, size):
    """Load a font at a final-size point size (scaled for the 2x canvas)."""
    if not os.path.exists(path):
        raise SystemExit(f'Font not found: {path} — run `npm install` first.')
    return ImageFont.truetype(path, s(size))


def wavy_line(draw, x1, x2, y, color, width, amp=4, wave=46):
    """A hand-drawn-looking underline: a gentle sine wave from x1 to x2."""
    pts = []
    for x in range(int(x1), int(x2) + 1, 4):
        pts.append((s(x), s(y + amp * math.sin((x - x1) / wave * 2 * math.pi))))
    draw.line(pts, fill=color, width=s(width), joint='curve')


def dashed_line(draw, x1, x2, y, color, width, dash=12, gap=10):
    """Horizontal dashed line (the map's dotted trail between badges)."""
    x = x1
    while x < x2:
        draw.line([(s(x), s(y)), (s(min(x + dash, x2)), s(y))], fill=color, width=s(width))
        x += dash + gap


def badge(draw, cx, cy, number, color, num_font):
    """
    One numbered sitting badge, drawn like the map's: a paper-filled circle
    in the sitting's ink, plus a thin second ring slightly off-centre so it
    looks pen-drawn rather than perfect.
    """
    r = 30
    draw.ellipse([s(cx - r), s(cy - r), s(cx + r), s(cy + r)],
                 fill=PAPER, outline=color, width=s(3))
    r2 = r + 2.5
    draw.ellipse([s(cx + 2 - r2), s(cy - 1.5 - r2), s(cx + 2 + r2), s(cy - 1.5 + r2)],
                 outline=color, width=s(1.2))
    # anchor='mm' = the text's middle sits exactly on the badge centre
    draw.text((s(cx), s(cy + 1)), str(number), font=num_font, fill=color, anchor='mm')


def main():
    log.info('Drawing %dx%d share image (supersampled x%d)', W, H, S)
    img = Image.new('RGB', (s(W), s(H)), PAPER)
    d = ImageDraw.Draw(img)

    # 1. Notebook paper: ruled lines every 42px, then the margin line
    for y in range(84, H, 42):
        d.line([(0, s(y)), (s(W), s(y))], fill=RULE, width=s(1.5))
    d.line([(s(96), 0), (s(96), s(H))], fill=MARGIN, width=s(2))

    left = 140  # text starts a little right of the margin line

    # 2. Kicker (small mono caps, pencil grey)
    d.text((s(left), s(78)), KICKER, font=font(MONO, 22), fill=PENCIL, anchor='ls')

    # 3. Title in handwriting + wavy teal underline sized to the title's width
    title_font = font(CAVEAT, 132)
    d.text((s(left), s(220)), TITLE, font=title_font, fill=INK, anchor='ls')
    title_w = d.textlength(TITLE, font=title_font) / S
    log.info('Title width %.0fpx (canvas %dpx)', title_w, W)
    if left + title_w > W - 40:
        raise SystemExit('Title too wide for the card — reduce the font size.')
    wavy_line(d, left, left + title_w, 250, TEAL, 5, amp=3, wave=110)

    # 4. The one-line promise
    d.text((s(left), s(330)), PROMISE, font=font(CAVEAT, 52), fill=TEAL, anchor='ls')

    # 5. The seven sittings: dashed trail, then badges on top of it
    trail_y = 470
    first_x, step = left + 40, 150
    xs = [first_x + i * step for i in range(7)]
    dashed_line(d, xs[0], xs[-1], trail_y, PENCIL, 2.5)
    num_font = font(CAVEAT, 40)
    for i, x in enumerate(xs):
        ink = RED if 2 <= i <= 5 else TEAL   # same rule as LevelMap's inkFor()
        badge(d, x, trail_y, i + 1, ink, num_font)

    # 6. A short handwritten caption under the trail
    d.text((s(xs[0] - 30), s(560)), '7 short sittings  ·  money, markets, mutual funds',
           font=font(CAVEAT, 38), fill=PENCIL, anchor='ls')

    # 7. Shrink to final size (this smooths every edge) and save
    final = img.resize((W, H), Image.LANCZOS)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    final.save(OUT, optimize=True)
    kb = os.path.getsize(OUT) / 1024
    log.info('Wrote %s (%.0f KB)', OUT, kb)
    # WhatsApp is known to skip preview images that are too heavy; stay well under 300 KB
    if kb > 300:
        log.warning('Image is over 300 KB — WhatsApp may not show it. Consider JPEG.')


if __name__ == '__main__':
    main()
