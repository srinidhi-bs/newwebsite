"""
make_cooking_covers.py — builds the photo "covers" for the /cooking recipe cards.
(Session 49, 2026-09-23. Approved look: Srinidhi, before/after review.)

WHAT IT DOES
  For each recipe's chosen photo it writes an edited COPY to
  public/images/cooking/covers/<name>_cover.jpg — the originals (used on the
  recipe pages themselves) are never touched. Each copy is:
    1. cropped to the card's 4:3 shape   (cy = where the dish sits vertically, 0..1)
    2. shrunk to <= 800px wide           (never enlarged — enlarging only adds blur)
    3. gamma-lifted                      (<1 brightens mid-tones, leaves highlights alone)
    4. auto-contrasted on LUMINANCE only (preserve_tone: stretches light/dark
                                          without shifting the food's real colours)
    5. colour-boosted, a touch more contrast, gently sharpened
  It also writes a BEFORE | AFTER comparison sheet to your temp folder, so the
  edit can be eyeballed before it goes on the site.

ADDING A NEW RECIPE
  1. Add a line to PHOTOS below. Start from the numbers of the most similar
     photo: dark shot → gamma ~0.80; dull colours → colour ~1.35; already
     bright → gamma ~0.95, colour ~1.2.
  2. Run from the project root:   python scripts/make_cooking_covers.py
  3. Check the comparison sheet it prints, then point the recipe's `photo.src`
     in src/components/pages/Cooking.js at the new covers/ file.

Needs Pillow (pip install pillow).
"""
import logging
import os
import tempfile

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
log = logging.getLogger('covers')

SRC = 'public/images/cooking'
OUT = 'public/images/cooking/covers'
SHEET = os.path.join(tempfile.gettempdir(), 'cooking_covers_before_after.jpg')

# name: (cy, gamma, colour, contrast) — tuned per photo from its measured
# brightness / saturation (Session 49: kurma 85 & veg 88 = dark, pizza sat 60 = dull).
PHOTOS = {
    's5_30_final_plate':         (0.50, 0.95, 1.22, 1.06),  # paneer — already bright → gentle
    's3_26_kurma_reduced_thick': (0.45, 0.80, 1.20, 1.08),  # kurma — dark → biggest lift; pan sits a bit high
    's2_23_final_pizza':         (0.50, 0.90, 1.35, 1.08),  # pizza — dullest colour → biggest colour boost
    's1_15_final_with_khichdi':  (0.50, 0.82, 1.25, 1.08),  # veg + khichdi — dark → strong lift
}


def crop_43(im, cy):
    """Largest 4:3 window: centred horizontally, placed vertically at fraction cy."""
    w, h = im.size
    if w / h > 4 / 3:                      # too wide → trim the sides
        nw = round(h * 4 / 3)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w * 3 / 4)                  # too tall → pick a horizontal band
    y = min(max(round(h * cy - nh / 2), 0), h - nh)
    return im.crop((0, y, w, y + nh))


def enhance(im, gamma, colour, contrast):
    """The 'make it pop' chain — same steps for every photo, strength per photo."""
    lut = [round(255 * (i / 255) ** gamma) for i in range(256)]
    im = im.point(lut * 3)                                         # gamma lift (R, G, B alike)
    im = ImageOps.autocontrast(im, cutoff=(0.5, 0.5), preserve_tone=True)
    im = ImageEnhance.Color(im).enhance(colour)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=3))


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for name, (cy, gamma, colour, contrast) in PHOTOS.items():
        src_path = f'{SRC}/{name}.jpg'
        src = ImageOps.exif_transpose(Image.open(src_path)).convert('RGB')
        base = crop_43(src, cy)
        if base.width > 800:
            base = base.resize((800, round(800 * 3 / 4)), Image.LANCZOS)
        cover = enhance(base, gamma, colour, contrast)
        out_path = f'{OUT}/{name}_cover.jpg'
        cover.save(out_path, quality=84, optimize=True, progressive=True)
        log.info('%-28s %s  %4d KB -> %3d KB', name, cover.size,
                 os.path.getsize(src_path) // 1024, os.path.getsize(out_path) // 1024)
        rows.append((base, cover))

    # BEFORE | AFTER sheet — each row two 420x315 panels
    w, h, pad = 420, 315, 12
    sheet = Image.new('RGB', (2 * w + 3 * pad, len(rows) * (h + pad) + pad + 28), 'white')
    draw = ImageDraw.Draw(sheet)
    draw.text((pad, 8), 'BEFORE', fill='black')
    draw.text((2 * pad + w, 8), 'AFTER', fill='black')
    for i, (before, after) in enumerate(rows):
        y = 28 + pad + i * (h + pad)
        sheet.paste(before.resize((w, h)), (pad, y))
        sheet.paste(after.resize((w, h)), (2 * pad + w, y))
    sheet.save(SHEET, quality=88)
    log.info('comparison sheet: %s', SHEET)


if __name__ == '__main__':
    main()
