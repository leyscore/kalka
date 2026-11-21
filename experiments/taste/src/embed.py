"""Embeds screenshots with CLIP ViT-B/32 (window-averaged, as UIClip does) for the singularity score.

Usage: python embed.py list.txt out.json   (one image path per line; existing entries are kept)
The weights are the openly licensed openai/clip-vit-base-patch32; nothing is trained here.
"""
import json
import sys
from pathlib import Path

import torch
from PIL import Image
from transformers import AutoModel, AutoProcessor

paths = [line.strip() for line in Path(sys.argv[1]).read_text().splitlines() if line.strip()]
out = Path(sys.argv[2])
done = json.loads(out.read_text()) if out.exists() else {}
todo = [p for p in paths if p not in done]
if todo:
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = AutoModel.from_pretrained("openai/clip-vit-base-patch32").eval().to(device)
    proc = AutoProcessor.from_pretrained("openai/clip-vit-base-patch32")

    def windows(img):
        w, h = img.size
        side = min(w, h)
        n = max(1, round(max(w, h) / side))
        if w >= h:
            xs = [0] if n == 1 else [round(i * (w - side) / (n - 1)) for i in range(n)]
            return [img.crop((x, 0, x + side, side)) for x in xs]
        ys = [0] if n == 1 else [round(i * (h - side) / (n - 1)) for i in range(n)]
        return [img.crop((0, y, side, y + side)) for y in ys]

    with torch.no_grad():
        for p in todo:
            crops = windows(Image.open(p).convert("RGB"))
            px = proc(images=crops, return_tensors="pt")["pixel_values"].to(device)
            f = model.get_image_features(pixel_values=px)
            f = f if isinstance(f, torch.Tensor) else f.pooler_output
            v = f.float().mean(0)
            v = v / v.norm()
            done[p] = [round(x, 5) for x in v.cpu().tolist()]
    out.write_text(json.dumps(done))
print(f"embedded {len(todo)} new, {len(done)} total")
