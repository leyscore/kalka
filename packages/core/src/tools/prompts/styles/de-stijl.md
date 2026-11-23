# De Stijl

## 1. Essence

A page composed like a Neo-Plastic painting or a Rietveld interior: only horizontals and verticals, black bars dividing white planes, and a few rectangles of red, yellow and blue placed off-centre so the sheet balances without symmetry. Mondrian put it as balance replacing symmetry; van Doesburg asked for a balanced relation of unequal parts. The grid is visible because the bars are the layout. It suits galleries, furniture, architecture and design studios.

The difference from Bauhaus: no circles, no triangles, no diagonals (van Doesburg's diagonal Elementarism is a Creative-mode break). The difference from a cliché: the coloured planes are few, unequal and carry content; the page is mostly white. Van Doesburg called colour anti-decorative, an element of the structure, never ornament.

## 2. Grid

- Page 1440. Content 1320. 12 columns of 88 px, gutter 24, margins 60. Spans: 3 = 312, 4 = 424, 6 = 648, 8 = 872.
- The gutters become bars. Major bar 24 px, the width of the gutter, so planes stay on the grid; minor bar 16 px. In Mondrian's paintings the lines measure about 1.3–3% of the canvas width, and thin lines are about 0.7 of the thick ones; 24 and 16 at 1440 sit inside that range. One major and one minor width per page.
- Bars may stop short of the edge or run off it; at least one bar per screen runs to a viewport edge. Van Doesburg described the planes as bounded by each other yet thought of as extending into open space.
- Planes have unequal sizes: never a row of equal rectangles.
- Text measure 560–640 px at 18 px.
- Mobile (390): 4 columns, 16 px margins. Bars become horizontal (8 px), with one vertical bar allowed on the left edge. Coloured planes shrink to strips.

## 3. Type

Van Doesburg's 1919 alphabet was built on a square raster and is not on Google Fonts (its revival is commercial). Use a squared or neutral grotesque, heavy at display sizes; let the composition, not novelty letters, carry the style. The Kunstmuseum Den Haag, home of the largest Mondrian collection, sets its headings in a heavy grotesque at 900.

| Display                      | Text                      | Character                                                     |
| ---------------------------- | ------------------------- | ------------------------------------------------------------- |
| Archivo 800 at `wdth` 125    | Archivo 400 at `wdth` 100 | wide and blocky, the default                                  |
| Libre Franklin 700–800       | Libre Franklin 400        | the Franklin Gothic lineage of the Centraal Museum (Rietveld) |
| Chakra Petch 600             | Hanken Grotesk            | squared corners, nearest to the raster letters                |
| Archivo Black                | Instrument Sans           | heavy, galleries                                              |
| Michroma (short titles only) | Familjen Grotesk          | wide square display, furniture                                |

Fallback stack: `"Archivo", "Helvetica Neue", Arial, sans-serif`.

Space Grotesk is a reflex face; do not use it here. Pixel or bitmap fonts (Silkscreen) are a different idea; avoid.

Scale: 13 / 16 / 18 / 24 / 32 / 48 / 72 / 104 / 144.

| Role    | Size / line        | Tracking | Weight  |
| ------- | ------------------ | -------- | ------- |
| Label   | 13/16 uppercase    | +0.1 em  | 700     |
| Small   | 16/24              | 0        | 400     |
| Body    | 18/28              | 0        | 400     |
| H3      | 24/28 to 32/36     | -0.01 em | 700–800 |
| H2      | 48/52              | -0.02 em | 700–800 |
| Display | 104/100 to 144/144 | -0.02 em | 800–900 |

Rules:

- All text horizontal; never rotated except one vertical name along a bar.
- Flush left inside its plane, padded 24–32 px from the bars.
- Display in caps or mixed case; keep one case for the whole page. Labels and section heads in tracked uppercase, as the Dutch museums set them.
- Text on a coloured plane: ink on yellow, white on red and blue.

## 4. Spacing

- Scale: 8, 16, 24, 32, 48, 64, 96, 128.
- Padding inside planes 32 (48 for the hero plane). Sections are divided by a bar, not by empty space: they butt together with a 24 px bar between them, or 96–128 px of white when the section has no bar.
- Button padding 16 28.

## 5. Colour

Mondrian reduced colour to the three primaries, flat and closed in rectangles, completed by white, black and grey. Huszár balanced the coloured parts of a room against the uncoloured black, white and grey, and scaled each colour's strength by the size of its plane.

- **White:** a warm off-white for planes, not blue-white; a second, greyer white for alternate planes.
- **Black:** near-black #111111 for bars and text.
- **Primaries:** red, yellow, blue, flat. One is the UI accent (buttons, links, focus); the others appear only as planes.
- **Grey:** one grey plane is allowed per screen.
- **Area** (measured on three late Mondrians): white 75–85%, black bars 5–11%, primaries together 8–12%. The largest coloured plane stays well below the largest white plane. A page that looks like a quilt has too much colour.

Palettes (contrast truncated, WCAG 2):

| Name                  | Planes                           | Ink / muted                                              | Accent (UI)                                            | Planes only                                                       |
| --------------------- | -------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Neo-Plastic (default) | #f6f5f1 / #e6e4e2                | #111111 (17.30; 14.89 on #e6e4e2) / #545454 (6.94; 5.97) | red #b7242e (5.82; 5.01 on #e6e4e2; white on it 6.35)  | blue #184890 (white on it 8.86), yellow #f0bb25 (ink on it 10.64) |
| Blue lead             | #f6f5f1                          | #111111                                                  | blue #184890 (8.12; 6.99 on #e6e4e2; white on it 8.86) | red #b7242e, yellow #f0bb25                                       |
| Interior (Huszár)     | #f6f5f1 / #e6e4e2 / grey #b3b4b4 | #111111 (9.08 on grey)                                   | blue #184890 (not on grey: 4.26)                       | red, yellow only on the one main object                           |

The red, blue and yellow are those of the Mondriaanhuis in Amersfoort. Red on ink is 2.97: never. Yellow is never text or a button with white text.

## 6. Surfaces

- Radius 0, without exception. No shadows, no gradients, no borders other than the black bars.
- Bars are divs or `border` on plane edges, all on the grid. A bar never ends in mid-air without meeting another bar or an edge, except one deliberate open end per page.
- Planes are the cards: a coloured or white rectangle bounded by bars.
- A plane may hold a photo that fills it edge to edge (`object-fit: cover`), with no frame other than its bars.
- Joints: where bars cross, they cross at full width, as in Rietveld's furniture where battens overshoot each other.

## 7. Navigation

- 80 px white bar closed by a 24 px black bar below. Name left in display at 24 px. Links 13 px uppercase +0.1 em, weight 700, 32 px apart.
- One small coloured plane (an 80 × 80 red square) at the far left or right as the mark, if the brand has no logo.
- Button: solid accent plane with white text, radius 0, 48 px.
- Sticky without the plane on scroll.

## 8. Hero patterns

**A. Composition.** The first screen is one composition of planes and bars: a large white plane (columns 1–8, 640 px tall) holding the display at 128 px and a 20 px paragraph; a vertical 24 px bar in the gutter after column 8; columns 9–12 split by a 16 px bar into a red plane (top, 200 px) and a white plane with the button and opening dates; a blue strip (64 px) at the bottom of columns 1–3 meeting the left viewport edge; a yellow square of 88 × 88 in the lower right. Bars reach the viewport edge on at least two sides.

**B. Photo plane.** A real photo of the object (a chair, the gallery room, a building) fills a plane in columns 5–12 at 872 × 640. A 24 px bar separates it from columns 1–4, where the title sits on white at 104 px. A yellow plane of one column × 160 px sits in the lower left corner of the photo plane.

**C. Grid as index (no photo).** The hero is a plan: a 3 × 3 arrangement of unequal planes from bars, each a link to a real part of the site (current exhibition, collection, visit, shop). The current exhibition takes the largest plane with its title at 72 px; one plane is red, one blue, one yellow, the rest white.

## 9. Section patterns

- **Exhibition list.** Rows separated by 16 px bars: dates (tabular) in columns 1–2, title at 32 px in 3–8, location in 9–10, a plain link in 11–12. The current one has a small red plane beside its date.
- **Object detail.** For furniture: a photo plane, a specification table (dimensions in mm, materials, finish, lead time "6–8 weeks"), price in tabular figures, a button.
- **Plan of the building.** A floor plan of the gallery or showroom drawn with bars: rooms are planes, the current room is blue.
- **Statement plane.** One sentence at 48 px on a white plane bounded by bars, with one coloured plane beside it.
- **Visit.** Hours as a table, address, a small map as a plane composition (streets as bars), not a map embed.
- **Footer.** Black plane with white text (18.88), one red plane of 80 px.

## 10. Imagery and its no-photo fallback

- Photos: objects shot square-on against plain walls, interiors with strong verticals and horizontals, gallery rooms with artworks; daylight, little perspective distortion. Crops fit the planes (often 4:3, 1:1, 3:4). Placeholder: `<img data-photo="red-and-blue lath armchair in a white gallery room, straight-on, daylight, chair centred low in frame">`.
- **No photo:**
  1. Composition hero (A) or the grid index (C).
  2. A drawn elevation or plan in bars and planes.
  3. A specification as a large table set in its plane.
  4. Never a reproduction-style fake Mondrian painting used as decoration.

## 11. Product UI in this style

Collection management, a furniture configurator, a gallery's ticketing or a studio's project tracker:

- White work surface, black 2 px dividers (the bars scaled down for density), radius 0.
- Sidebar 224 px, separated by a 6 px black bar; rows 32 px, the active row marked by a 4 px plane in the accent on its left plus weight 600.
- Top bar 48 px with a 6 px black bar under it.
- Tables 40 px rows, 1 px #e6e4e2 row lines, 2 px black under the header. Tabular figures.
- States as small square planes (10 px) with a word: blue "On loan", yellow "In conservation" (with an ink border so it holds 3:1 on white), red "Missing condition report", none for "On view". The plane is never the only signal.
- Configurator: finish swatches as 40 px square planes with 2 px black borders; the selected one has a 4 px accent outline.
- Example moment: object record `OBJ-1924-0117`, "Lamp, nickel-plated brass", location "Store B, rack 4", condition report overdue by 12 days.

## 12. Signature moves

1. Black bars in the grid gutters as the layout itself.
2. Unequal planes, mostly white, three primaries in small areas.
3. At least one bar per screen running to the viewport edge.
4. Only horizontal and vertical lines.
5. Radius 0, no shadows, no borders but bars.
6. Planes as navigation (the grid index).
7. Bars crossing at full width like battens.
8. Specifications and hours as real tables.

## 13. Anti-patterns

1. A quilt: many coloured rectangles of similar size.
2. Circles, curves, diagonals (unless the person asks for something bolder).
3. A fake Mondrian painting as a hero image.
4. Rounded corners or shadows.
5. Bars that do not align to the grid or stop arbitrarily.
6. Pastel primaries.
7. Coloured text other than the accent.
8. Yellow as a text colour or as a button with white text.
9. Gradients anywhere.
10. Symmetric layouts or equal 6/6 splits.
11. Thin 1 px bars on the marketing page (they read as table lines).
12. Pixel or bitmap fonts.
13. Primaries on more than about 12% of the area.
14. A colour plane holding nothing on every screen.

## 14. Overrides of the global anti-slop

- **Drawn grid lines: allowed** because the bars are the composition, not a background pattern. A faint grid behind content stays banned.
- **Primary colours at full chroma: allowed** as planes, with one as the accent, per the three-colour rule.
- No other override.

## 15. Breakable rules (when the person asks for something bolder)

1. **Only horizontals and verticals.**
   - Protects: the Neo-Plastic order.
   - Breaking gives: the composition rotated 45° (van Doesburg's counter-composition, which he set against the vertical axis of gravity) feels dynamic and slightly rebellious.
   - Allowed when: the subject is about that split (a show on van Doesburg, a provocative studio) and the reading text stays horizontal.
2. **Small colour area.**
   - Protects: the calm of the white planes.
   - Breaking gives: one primary plane over about half the screen, as in Mondrian's 1930 composition with a large red plane, makes a poster for an opening.
   - Allowed when: it is one screen, with one word or one date on it.
3. **No open bar ends.**
   - Protects: closure and balance.
   - Breaking gives: several bars ending short of the edge evoke Mondrian's late, open compositions.
   - Allowed when: the page is a gallery or art subject.
4. **One case for display.**
   - Protects: consistency.
   - Breaking gives: letters built from planes (a word drawn as rectangles on a 5 × 5 raster in SVG) recall the 1919 alphabet.
   - Allowed when: it is the name, once, with a text alternative.

## 16. Self-check

1. Are all lines horizontal or vertical and on the grid?
2. Are bars one major (24) and one minor (16) width, crossing at full width?
3. Is white about 75–85% of the area and colour 8–12%?
4. Is only one primary used for UI, with the others as planes?
5. Does red text pass 4.5:1 on each plane it sits on?
6. Is there at least one bar running to a viewport edge per screen?
7. Are there no circles, gradients, shadows or rounded corners?
8. If the subject is an object or a room, is there a photo placeholder in a plane?
9. Do product UI states pair a plane with a word?
10. Does the page balance without symmetry?
