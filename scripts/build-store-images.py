"""
Regenerate the responsive boutique-band photography.

Reads the masters from `assets/stores/` (NOT served — they are 1400px originals
at ~300-380 KB each and the band never needs more than one rung) and writes a
WebP + JPEG ladder into `public/stores/` as `<name>-<width>.<ext>`.

The rung list per photo must match `STORE_PHOTOS` in components/footer.tsx.
Widths above a photo's source width are skipped: upscaling only costs bytes.

    python scripts/build-store-images.py

Requires Pillow. This is a design-time step, not part of `npm run build` — the
storefront photography changes about as often as the storefronts do.
"""

import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "stores")
OUT = os.path.join(ROOT, "public", "stores")

# store-window-2.jpg is deliberately absent: it is a master we hold but the band
# only shows three photos, so generating rungs for it would ship dead bytes.
PHOTOS = ["store-exterior.jpg", "store-window-1.jpg", "store-window-3.jpg"]
WIDTHS = [480, 768, 1024, 1280, 1600]

# Heavy navy scrims sit over these photos, so mid-quality is visually lossless
# here and roughly halves the bytes against a "safe" q90.
JPEG_Q = 76
WEBP_Q = 74


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for name in PHOTOS:
        path = os.path.join(SRC, name)
        img = Image.open(path).convert("RGB")
        base = name[:-4]
        rungs = [w for w in WIDTHS if w <= img.width]
        if img.width not in rungs:
            rungs.append(img.width)
        for w in sorted(rungs):
            h = round(img.height * w / img.width)
            resized = img if w == img.width else img.resize((w, h), Image.LANCZOS)
            resized.save(
                os.path.join(OUT, f"{base}-{w}.jpg"),
                "JPEG", quality=JPEG_Q, optimize=True, progressive=True,
            )
            resized.save(os.path.join(OUT, f"{base}-{w}.webp"), "WEBP", quality=WEBP_Q, method=6)
        print(f"{name}: {img.width}x{img.height} -> rungs {sorted(rungs)}")


if __name__ == "__main__":
    main()
