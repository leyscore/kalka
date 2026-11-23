# Cinematic

## 1. Essence

The page as a title sequence: huge type, full-width frames at real projection ratios, credits in tracked caps, long pauses between scenes. It must be strong with no photos: type, flat colour fields, cut-out shapes and lists carry the drama, as graphic title sequences did with paper and paint.

## 2. Grid

- Page 1440, margin 32, 12 columns of 100, gutter 16.
- Frames fill the viewport width. Heights at 1440: 900 (full screen), scope 2.39:1 = 603, flat 1.85:1 = 778, full container 1.90:1 = 758, 16:9 = 810.
- **Safe areas inside a frame:**
  - Titles, captions and corner labels stay inside the graphics-safe area: 5 % in from every edge, which is 72 px at the sides and 5 % of the frame height top and bottom (30 in scope, 40 in 16:9, 45 in a 900 frame).
  - Picture action and the viewfinder line sit on the action-safe edge, 3.5 % in: 50 px at the sides.
- Captions 280–400 wide, text 560 max.
- Text sits in frame corners (credit top-left, title bottom-left, timecode bottom-right); only the title card and credits centre.
- Mobile (390): 4 columns, 16 px margins. Frames become 4:5 or 9:16 (390 × 693), still with a 5 % safe inset (20 px). Title type 64–96 px, still set tight.

## 3. Type

| Display                           | Text         | Character                        |
| --------------------------------- | ------------ | -------------------------------- |
| Anton or Six Caps (condensed)     | Inter Tight  | thriller, music, festival        |
| Bodoni Moda (display optical)     | Work Sans    | fashion, hotel, opera            |
| Cormorant Garamond (300–500)      | Work Sans    | period drama, gallery, perfume   |
| Italiana, Bellefair or Tenor Sans | Spectral     | quiet luxury, hotels, theatre    |
| Bebas Neue                        | Spectral     | billing blocks, posters          |
| Inter Tight 600 at poster sizes   | Inter Tight  | contemporary studio, documentary |
| Shippori Mincho or Noto Serif JP  | Noto Sans JP | Japanese cinema and festivals    |

Instrument Serif only with a reason; never Cinzel. No mono: timecodes use the text face's tabular figures.

Scale: 11 / 13 / 16 / 21 / 24 / 36 / 64 / 96 / 120 / 160 / 200 / 240.

| Role                              | Size / line                    | Tracking          | Weight, case            |
| --------------------------------- | ------------------------------ | ----------------- | ----------------------- |
| Credits, billing connecting words | 11/16                          | +0.12 to +0.16 em | 500, caps or small caps |
| Caption                           | 13/20                          | +0.01 em          | 400                     |
| Body                              | 16/26 (1.6)                    | 0                 | 400                     |
| Lead                              | 21–24/32                       | -0.005 em         | 300–400                 |
| Billing names                     | 15 % of the title size or more | +0.04 em          | display, caps           |
| Section title                     | 64–96/0.95                     | -0.02 to -0.03 em | display                 |
| Title                             | 160–240/0.8–0.9                | -0.03 to -0.05 em | display                 |

Rules:

- One display face, one text face.
- The title is the largest thing, once at full size.
- **Credit sizes follow guild rules:**
  - In a billing block or any advertising-style hero, the director's name is at least 15 % of the title size: 24 at a 160 title, 30 at 200, 36 at 240.
  - No credit other than an actor's is larger than the director's.
  - On a screen-style credit card, the director's name stands alone on its card at half the title size or more. It is the last card before the story starts.
- Condensed display may be caps; serifs take title case.
- Japanese credits may run vertically (`writing-mode: vertical-rl`), reading right to left.

## 4. Spacing

- Scale: 4, 8, 16, 24, 32, 48, 64, 96, 160, 240.
- Scenes 160–240 apart; 96 between a frame and its captions, 240 before a new act.
- Credits lines 4–8 apart; groups 24.
- Frames may butt edge to edge (0 gap) in a sequence, or sit 16 apart in a strip.

## 5. Colour

All figures are WCAG 2, truncated.

- **Night (default):**
  - Ground #0d0c0b.
  - Text #f2efe9 (17.02), text-2 #a8a39b (7.79), text-3 #6f6b65 (3.69, large text and decoration only).
  - Rules at text colour .18 alpha.
  - Accent red #e03a3e (4.5, at the floor): one mark, a title word, or text 21 px and up.
- **Hotel:** ground #15110d. Text #f2efe9 (16.36), text-2 #a8a39b (7.49). Brass #c9a46a (8.05) for rules, the monogram and one link style.
- **Day:** ground #ede9e2. Text #121110 (15.58), text-2 #6a655e (4.77). Accent oxblood #9d2b2f (6.15).
- **Colour fields** for frames:
  - Oxblood #4a1518, bottle #14281f, ink #121a2b.
  - Text on them #f2efe9 (12.96, 13.52, 15.14).
  - Secondary #a8a39b (5.93, 6.19, 6.93).
  - Brass #c9a46a on oxblood 6.37, on bottle 6.65.
- One accent only: a saturated red or a muted gold, as festival sites do.

Measured greys that fail for small text: #82847f on cream #f3eee7 (3.27), #6f6d6a on #0e0e0d (3.74). Light text on the red is 3.77, so red never fills a small-text button.

| Name        | Ground  | Text / 2          | Accent                 | Fields                   |
| ----------- | ------- | ----------------- | ---------------------- | ------------------------ |
| Night       | #0d0c0b | #f2efe9 / #a8a39b | #e03a3e (4.5)          | oxblood, ink             |
| Grand hotel | #15110d | #f2efe9 / #a8a39b | brass #c9a46a (8.05)   | bottle, oxblood          |
| Matinée     | #ede9e2 | #121110 / #6a655e | oxblood #9d2b2f (6.15) | ink #121a2b with #f2efe9 |

## 6. Surfaces

- Radius small: 4–6 on buttons and inputs, 0 on full-height frames and full-bleed images. No cards, no shadows.
- **Scrim over images:** a linear gradient from #000 at 0–60 % alpha toward the edge that holds text, never a flat grey veil.
- **Viewfinder line:** one 1 px frame on the action-safe edge (3.5 % in), text colour at .18, once per page.
- **Cut-out shapes:** flat hard-edged SVG in one palette colour, no gradient or shadow; one shape that stands for the subject, rearranged across scenes.
- **Grain:** 3–5 % noise over real images only. A scope frame may sit between black letterbox bars.

## 7. Navigation

- 64 px overlay on the first frame.
- The name in display at 20–24 px; 3–5 links in 11 px caps at +0.14 em.
- The call to action is an underlined text link (Tickets, Book, Watch the trailer), not a filled button.
- Transparent over the frame, ground colour after it. Mobile: the word "Menu", not a hamburger.

## 8. Hero patterns

**A. Title card with billing block (when there is no photo).** A full 900 px frame on the ground or a colour field.

- The title at 160–240 px, set tight, 70–90 % of the safe width.
- Above it, a credit line: "A FILM BY" in 11 px caps, the name at the 15 % size.
- Below it, the billing block: a condensed paragraph 560–760 px wide, centred, in caps, leading 1.1. Names at 15 % of the title size or more; connecting words ("DIRECTED BY", "MUSIC BY") at 11 px.
- A date line, the text-link call to action, and corner marks inside the safe area (runtime, year).

**B. Letterbox (photo or colour field).** A scope frame (1440 × 603) between black bars, holding a still or a colour field. The title at 120 px sits bottom-left inside the safe area, or just below the frame. A caption in 13 px bottom-right.

**C. Split title and colour field (no photo).** Columns 1–6: the title at 120–160 px, a 21 px lead, credits. Columns 7–12 and on to the edge: a full-height colour field (oxblood, bottle or ink) holding one cut-out shape, a single line or a timecode at 64 px, like a frame between scenes.

## 9. Section patterns

Ranked toolbox when there are no photos; use at least the first two.

1. **Title type as the image.** Scene titles at 64–96 px, each opening a section, alone on the ground.
2. **Colour-field frames.** Full-width fields at a real ratio, each with a scene number and a line of text in a safe-area corner. Three fields in different colours read as a sequence of shots.
3. **Cut-out frames.** A colour field with one flat SVG shape that carries the idea, as paper cut-outs did in graphic title sequences. The shape changes from frame to frame.
4. **Index list.** Rows 72–96 px tall, separated by 1 px rules at .18. Each row: a number (if a real sequence), the title at 36 px, year or date, a short detail, and a right-aligned runtime or venue. Hover reveals a colour field. For films, rooms, programmes, tracklists.
5. **Contact sheet.** A grid of 6 frames, 216 × 144 each (the 3:2 still frame), 16 apart, under a heading. Without photos, each frame is a colour field with a scene caption in 11 px caps and a frame number.
6. **Film strip.** A band 220 px tall, scaled from 35 mm film (1 mm ≈ 6.3 px):
   - Sprocket holes 12 × 18 px (along × across), corner radius 3, at a 30 px pitch, 13 px from each edge.
   - Frames 226 × 151 px, one every 8 holes (239 px).
   - With no photos, the frames are colour fields.

Other sections:

- **Credits.** Opening credits name only the key people; end credits name everyone, as small light text on the dark ground read top to bottom. Roles in 11 px caps in text-2, names in 21 px, centred, with real roles (Director, Editor, Original Score). The cast may close on an honoured last name ("and … as …").
- **Footer.** Credits-style: small caps lines, a monogram, legal.

## 10. Imagery and its no-photo fallback

- Photos: graded stills (warm shadows, crushed blacks) at real ratios. No stock smiles.
- **Placeholders:** when a still would make the page better (the film, the room, the performer), place it as `<img data-photo="…" alt="…">` with no src, at its real ratio, with a photographer's brief: "lead actor in profile at a rain-streaked tram window, night, sodium light, 2.39:1". The page around it must still work without it.
- **No photo, in this order:**
  1. The title card with billing block as the hero.
  2. Colour-field frames as each scene's visual.
  3. Cut-out frames: one flat shape per frame.
  4. An index list as the main content section.
  5. A contact sheet or film strip of captioned colour-field frames.
- Mood without photos comes from scale (200 px title against 11 px credits), ratio, pacing and one accent.
- Never a grey box, an empty frame with a play button, or a fake scratch filter: the hand-scratched titles of the 1990s were made on film, and a CSS imitation reads as a template.

## 11. Product UI in this style

For a booking step: a seat map or room list in the night palette, text 14 px, rows 44, prices in tabular figures, the selected seat in the accent with a label. Here the call to action is a solid button in #f2efe9 with a ground-coloured label (17.02), never white on red.

## 12. Signature moves

1. A title at 160–240 px, set tight, once.
2. A billing block in condensed caps, with names at 15 % of the title size or more.
3. Full-width frames at projection ratios (2.39, 1.85, 16:9) with a 5 % safe inset.
4. Credits in 11 px caps at +0.12 to +0.16 em.
5. Colour fields and flat cut-out shapes as frames between scenes.
6. An index list with 72–96 px rows.
7. Scenes 160–240 px apart.
8. A text-link call to action in the nav.

## 13. Anti-patterns

1. A desktop title under 120 px.
2. Centred text everywhere.
3. Cards with rounded corners or shadows.
4. A flat grey veil over images.
5. Gold gradients or metallic text.
6. Cinzel or a Trajan look.
7. Tracked caps used for headings or buttons.
8. Mono labels.
9. Small text in #6f6b65 or any grey under 4.5:1.
10. Play buttons on empty boxes; grey placeholder frames.
11. More than one viewfinder frame.
12. Parallax and scroll-jacking.
13. Scene gaps under 96.
14. Index numbers on items that are not a sequence.
15. Lens flares, light leaks, film-burn or scratch overlays.
16. A filled pill button as the hero call to action.
17. Billing names smaller than 15 % of the title, or a crew credit larger than the director's.
18. Frame text outside the 5 % safe area.
19. Frame ratios of no projection format (2:1, 3:1).

## 14. Overrides of the global anti-slop

- **Tracked small caps: allowed** for credits, billing, nav and frame corner labels (11 px, +0.12 to +0.16 em); never headings, eyebrows or buttons.
- **Index numbers: allowed** for real sequences (scenes, episodes, tracklists).
- Mono labels, glows and orbs stay banned.

## 15. Breakable rules (when the person asks for something bolder)

1. **One display face** protects the unity of a sequence. Break it for a festival programme where each film gets its own face, shown only in its frame.
2. **Title once at full size** protects the one big moment. Break it to repeat the title as a closing end card with credits under it.
3. **Text-link call to action** protects restraint. Break it when selling dated tickets: a rectangular button, radius 4–6, in the text colour with ground-coloured text.
4. **Dark ground** protects the cinema mood. Break it with the Matinée palette when the subject lives in daylight (gallery, fashion house, day festival), keeping colour fields for rhythm.

## 16. Self-check

1. With all photos removed, is the first screen still strong (a title card, or a split with a colour field)?
2. Is the title 160–240 px, set tight, and used once?
3. Are billing names at least 15 % of the title size, with nobody but actors above the director?
4. Are frames full width at projection ratios, with text inside the 5 % safe area?
5. Do scenes sit 160–240 px apart?
6. Are at least two no-photo tools used (title type, colour fields, cut-outs, index list, contact sheet, film strip)?
7. Where a still would help, is there a `data-photo` placeholder at its real ratio with a brief?
8. Does all small text pass 4.5:1, with text-3 kept for large type or decoration?
9. No grey boxes, empty play-button frames, metallic gradients or fake film textures?
10. Is tracked caps limited to credits, billing, nav and corner labels, and is the nav call to action a text link (unless selling tickets)?
