# Bento

## 1. Essence

One section of unequal tiles that shows several capabilities at a glance, with one lead tile clearly bigger than the rest and visuals bleeding off the tile edges. Like the compartments of a lunch box, each tile holds one idea and keeps it apart from the next. Bento is a section, not a page: the rest of the page is a calm product page in the same palette.

## 2. Grid

- Page 1440. Content 1200. 12 columns of 78 px, gap 24, margins 120. Rows: `grid-auto-rows: 88px`.
- Alternative tighter grid: content 1232, 12 columns of 88 px, gap 16.
- Units: a tile spans whole columns and whole rows. Every row of tiles sums to 12 columns.
- Minimum tile 3 columns × 3 rows. Two or three tile sizes per bento (two is most common). 3–8 tiles.
- The lead tile has at least twice the area of any other tile and comes first in the markup.
- Span patterns (columns × rows):
  1. Lead 8×4 + 4×4, then three 4×3 below.
  2. Lead 6×6 or 8×6 + two tiles stacked on the right (6×3 or 4×3).
  3. Lead full width 12×5, then two 6×5 below.
  4. Alternating 8/4 then 4/8 (then 8/4 again), each 4 rows tall.
  5. Tall anchor 4×7 on the left, beside an 8×3 over two 4×4.
  6. 3/6/3 with the centre 6×6 as lead and two 3×3 stacked on each side.
  7. Staggered pair: 6×4 over 6×3 on the left, 6×3 over 6×4 on the right. No lead: use when two to four capabilities are close in weight.
- Outside the bento, text sections use a 640 px measure and the same 12 columns.
- Mobile (390): one column, tiles full width, 16 px gap, heights by content; the lead tile stays first and tallest.

## 3. Type

| Family            | Note                    |
| ----------------- | ----------------------- |
| Manrope           | friendly, consumer apps |
| Onest             | clean, launch pages     |
| Figtree           | rounded, consumer       |
| Schibsted Grotesk | sharper, tools          |
| IBM Plex Sans     | hardware and pro tools  |

Inter, Geist, DM Sans and Plus Jakarta Sans are reflex faces; use one only with a reason.

| Role                           | Size / line   | Tracking          | Weight |
| ------------------------------ | ------------- | ----------------- | ------ |
| Caption                        | 13/18         | 0                 | 400    |
| Tile description               | 15–17/22–25   | -0.005 em         | 400    |
| Tile title or caption sentence | 19–21/1.2     | -0.01 em          | 600    |
| Lead tile title                | 32–40/1.1     | -0.02 em          | 600    |
| Big number in a tile           | 48–64/1.0–1.2 | -0.02 to -0.03 em | 600    |
| Section H2                     | 40–48/1.05    | -0.02 to -0.03 em | 600    |
| Page display                   | 56–72/1.0     | -0.03 em          | 600    |

Rules:

- Two weights (400, 600). Tabular figures for numbers.
- Tile descriptions at most two lines.
- Two-tone caption (optional): one sentence at tile-title size and weight 600, the first phrase in ink and the rest in the secondary colour. Use it on every tile or none.

## 4. Spacing

- Scale: 4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 128.
- Tile padding 24–40 (one value for all tiles; 32 is a good default).
- Section heading to bento 48–64.
- Bento section padding 128 above and below; other sections 96–128, varied.
- Inside a tile: title to description 8; text block to visual 24.

## 5. Colour

- **Page ground** white or a light neutral; tiles on a slightly different neutral (#f5f5f7 on white, or white on #f5f5f7), so tiles read by tone, not by border.
- **Ink** near-black; secondary text at 4.5:1 or more on the tile tone.
- **Accent tile:** at most one tile in the brand colour, holding white or dark text at 4.5:1.
- **Dark tile:** at most one dark tile on a light page (or one light tile on a dark page) to anchor the composition. A fully dark bento on a dark page is fine when every tile is dark.
- **Visuals inside tiles** take the brand ramp: subtle fills (L 0.96), borders (L 0.88), the solid for one detail.

Palettes:

| Name       | Page / tile                                                         | Ink / secondary                                                   | Accent                                                                                                 |
| ---------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Studio     | #ffffff / #f5f5f7                                                   | #1d1d1f (15.45 on tile) / #6e6e73 (4.65 on tile, 5.07 on white)   | blue #0066cc (5.11 on tile; white on it 5.56)                                                          |
| Greenhouse | #f6f5f2 / #ebe8e1                                                   | #1b1a17 (14.22 on tile) / #5f5b53 (5.52)                          | green #2f6b4f (5.77 on page; white on it 6.29), mint tile #d9f0e3 with ink (14.52)                     |
| Night tile | #ffffff / #f5f5f7, one tile #1d1d1f                                 | on the dark tile #f5f5f7 (15.45) / #a1a1a6 (6.54)                 | orange #ff6b3d as a fill with #121212 text (6.62); white on a deeper #e8541e is only 3.67, so avoid it |
| All dark   | #000000 / #000000 tiles on a #1d1d1f band, or #1d1d1f tiles on #000 | #f5f5f7 (19.28 on #000) / #86868b (5.79 on #000; 4.64 on #1d1d1f) | none; the visuals carry colour                                                                         |

## 6. Surfaces

- Radius 1.0–1.4× the gap: with a 24 gap use 24–32 (28 is a good default); with a 16 gap use 16–22. One radius for all tiles.
- Nested elements inside a tile use a smaller radius: tile radius minus the inset (a 28 radius tile with 16 inset gives 12 on the inner element).
- No border when tiles differ from the page by tone; otherwise 1 px at about 6% ink. On dark, tiles at 2–4% white over the ground.
- Shadow: none, or one soft `8px 8px 16px #00000014` on all tiles. Never mix.
- `overflow: hidden` on tiles so visuals bleed cleanly off the edge.
- No glass, no gradients across tiles, no glowing borders.

## 7. Navigation

The page around the bento is a product page.

- 64 px bar. Logo left, 4–5 links at 15 px, a primary button right (radius matching the inner radius, 8–12).
- Sticky with a white or translucent ground (`#ffffffcc`, blur 20 px) and a hairline after scroll.

## 8. Hero patterns

**A. Statement and product.** Display 56–72 px left in columns 1–7, a 2-line lead, primary button and a text link. A device crop or app screen in 7–12, bleeding off the right or bottom edge by at least a third.

**B. Bento as hero (no photo).** A short H1 at 48 px over a compact bento of 3–5 tiles using span pattern 2 or 3. The lead tile shows the core product moment true size; the others show one number, one UI fragment, one key cap. Use this only when the product has no single hero moment.

**C. Number hero (no photo).** One large outcome number at 120 px (tabular, -0.03 em) with a source line, the claim at 40 px beside it, then the bento as the next section.

## 9. Section patterns

- **The bento.** One per page. Heading in columns 1–7 at 40–48 px, one-line intro, then the grid. Each tile: title, one or two lines, a visual taking 55–70% of the tile, bleeding off one or two edges. Use one caption placement for all tiles (top-left text, visual below, is the default; centred text over a centred visual also works if every tile uses it).
- **Recap bento.** For release notes and launch recaps only: the release name in a centred lead tile, every other tile a one-line label and one visual. See breakable rule 4.
- **Feature detail.** After the bento, one or two sections that open a single tile at full width with text 640 wide beside a larger UI crop.
- **Specs or comparison.** A table, not tiles.
- **Testimonial.** One quote with name, role and company in words, no avatar grid.
- **Pricing.** A two-column comparison or a table; no three equal cards with a highlighted middle.
- **Closing CTA.** Heading and button on the page ground; no boxed card.

Tile visual ideas (choose by capability, not decoration):

- a cropped list with real rows and one selected;
- a single large metric with a sparkline drawn from real-looking values;
- a key cap combination (`⌘ ⇧ K`) at 48 px;
- a device edge (phone corner, watch face) cropped by the tile;
- a toggle or setting in its on state at 2× (only this one element may be enlarged);
- an avatar stack with "+12" for collaboration;
- a map crop with two pins and a route;
- a short notification stack.

## 10. Imagery and its no-photo fallback

- Photos are rarely needed. Product crops and UI fragments are the imagery.
- **No photo:** every tile visual is HTML: UI fragments, numbers, small charts, key caps, device frames. Never an icon centred on an empty tile, never a grey box.
- If a tile would only hold an icon, merge it with another tile or remove it.

## 11. Product UI in this style

- UI fragments at true size: text 12–14 px, rows 32–40. The lead tile may hold a larger section of the app (a panel 600–700 wide).
- Fragments crop at the tile edge; at least half the tiles bleed their visual off one edge.
- Use realistic data: names, IDs, uneven numbers, one non-happy state across the bento (a failed sync, a pending invite).

## 12. Signature moves

1. One lead tile at least twice the area of any other, first in the markup.
2. Rows that sum to 12, 3–8 tiles, two or three sizes.
3. Visuals that bleed off the tile edge.
4. Nested radius smaller than the tile radius; tile radius a little larger than the gap.
5. Tiles defined by tone, not borders.
6. One accent tile and one contrasting tile at most.
7. Bento used once, with calm sections around it.

## 13. Anti-patterns

1. Bento as the whole page.
2. Equal tiles, or no lead (outside pattern 7).
3. More than three tile sizes, or more than eight tiles.
4. A tile holding only a centred icon and a title.
5. Visuals floating in the middle of a tile with padding all round.
6. Rows that don't sum to 12, leaving holes.
7. Different radii on different tiles.
8. Inner elements with the same radius as the tile.
9. Gradient borders, glowing tiles, glassmorphism.
10. Every tile in a different colour.
11. Descriptions longer than two lines.
12. UI fragments drawn at 1.5× size.
13. Text caption placed differently in each tile.
14. A lead tile that is not first in reading order.
15. A shadow on some tiles but not others.
16. A grey placeholder in a tile.
17. A radius smaller than the gap, or more than one and a half times it.

## 14. Overrides of the global anti-slop

None. Bento relies on the full anti-slop list. Note that "three equal cards" is banned and applies to tiles too: equal tiles are three equal cards with rounded corners.

## 15. Breakable rules (when the person asks for something bolder)

1. **Lead tile at least twice the area.**
   - Protects: a clear entry point.
   - Breaking gives: a perfectly even grid reads as a catalogue or a periodic table.
   - Allowed when: the subject is a set of equals (a kit of parts, a typeface's weights) and the tiles carry numbers or labels that make the set read as one system.
2. **Bento once per page.**
   - Protects: rhythm and avoiding a dashboard look.
   - Breaking gives: a release page can be one bento per release.
   - Allowed when: the page is a changelog or a launch week, with dated headings between bentos.
3. **Tiles defined by tone.**
   - Protects: softness.
   - Breaking gives: hard 1 px ink borders and radius 0 make a technical, Blueprint-leaning bento.
   - Allowed when: the rest of the page is Blueprint or Swiss, and the bento is its feature section.
4. **At most eight tiles.**
   - Protects: one glance reads the whole set.
   - Breaking gives: a recap of a whole release in one screen, up to 16 tiles.
   - Allowed when: it is a recap bento, every tile is one short label plus one visual, the lead tile is centred and names the release, the gap stays tight (under 1% of the width) and the radius is generous.

## 16. Self-check

1. Is the bento one section, not the whole page?
2. Is there one lead tile at least twice the area of any other, first in the markup?
3. Do all rows sum to 12 columns, with 3–8 tiles in two or three sizes?
4. Does every tile have a real visual, with most bleeding off an edge?
5. Is the tile radius 1.0–1.4× the gap, and the inner radius smaller than the tile radius?
6. Is there at most one accent tile and one contrasting tile?
7. Are descriptions two lines or fewer?
8. Is UI in the tiles true size, with realistic data?
9. Does all text pass 4.5:1 on its tile tone?
10. On mobile, does the lead tile stay first?
