# Image slots

Drop photos here, then set the paths in `config/site.ts > images`.

Suggested files:

- `hero.jpg` — a finished roof, landscape, at least 1600×1000
- `project-1.jpg`, `project-2.jpg`, `project-3.jpg` — gallery, 16:9
- `before.jpg` and `after.jpg` — the same angle, same framing, 16:10

The site renders photos with a monochrome treatment, so mismatched phone photos
still read as one set. Leave a config path empty to use the built-in line-art
fallback. Do not put card data, customer addresses, or private job documents in
this folder: everything under `public/` is served publicly.
