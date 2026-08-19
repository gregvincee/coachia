from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "assets" / "images" / "icon.png"
destination = root / "public"
destination.mkdir(parents=True, exist_ok=True)

with Image.open(source) as icon:
    rgb_icon = icon.convert("RGB")
    for filename, size in (("icon-192.png", 192), ("icon-512.png", 512), ("icon-maskable-512.png", 512)):
        resized = rgb_icon.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(destination / filename, "PNG", optimize=True)
