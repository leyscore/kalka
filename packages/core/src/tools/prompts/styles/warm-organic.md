# Warm Organic

## 1. Essence

The page of a place that makes things by hand: paper-toned grounds, a soft serif display at a light weight, colours taken from the food or craft itself, and generous room. Warmth comes from material colour and type, not from blobs, torn edges or scribbles.

## 2. Grid

- Page 1440. Content 1200. 12 columns of 78 px, gutter 24, margins 120.
- Break-out width 1320–1400 for one image or band per page; full-bleed for one colour band.
- Text measure 600–680 px at 18 px body (60–70 characters).
- Centring is allowed only for short blocks: a stamp, a two-line opening statement, hours. Never for a paragraph over three lines, never for the whole page.
- Asymmetric splits work best: 7/5 or 5/7, not 6/6.
- Mobile (390): 4 columns, 20 px margins. Display drops to 44–56 px. Menu rows stay full width with the price on the same line.

## 3. Type

Choose one pair. The serif carries display; the sans carries body, labels and prices.

| Display serif                        | Text sans      | Character                          |
| ------------------------------------ | -------------- | ---------------------------------- |
| Young Serif                          | Figtree        | sturdy, bakery and deli            |
| Gloock                               | Karla          | high contrast, wine bar, florist   |
| Newsreader (display optical)         | Work Sans      | quiet, farm and coffee             |
| Source Serif 4 (display optical)     | Work Sans      | clean, ceramics and goods          |
| Lora                                 | Hanken Grotesk | food hall, Italian grocer          |
| EB Garamond, alone                   | —              | ceramics, candles, old-house goods |
| Gelasio                              | Figtree        | homely, family restaurant          |
| Shippori Mincho B1 or Zen Old Mincho | Noto Sans JP   | tea, confectioners, ryokan         |
| Nunito or Quicksand (headings)       | Nunito         | children's products only           |

Fraunces, Instrument Serif and DM Sans are on the reflex list; Bricolage Grotesque is a recent default. Use Fraunces only with a reason tied to the subject, and then set `SOFT 100, WONK 0` at weight 300–400. Recoleta and Gambarino are not on Google Fonts; do not name them. Young Serif and Gloock exist only at 400.

Scale: 13 / 15 / 18 / 24 / 32 / 44 / 56 / 72 / 88.

| Role          | Size / line           | Tracking  | Weight        |
| ------------- | --------------------- | --------- | ------------- |
| Label         | 12–13 caps / 16       | +0.12 em  | 600 sans      |
| Small, notes  | 15/22                 | 0         | 400           |
| Body          | 18/29 (1.6)           | 0         | 400           |
| H3, item name | 24/30                 | -0.005 em | 400–500 serif |
| H2            | 44/46 to 56/59 (1.05) | -0.01 em  | 300–400 serif |
| Display       | 72/68 to 88/84 (0.95) | -0.02 em  | 300–400 serif |

Rules:

- Display weight light (300–400). Heavy serifs read as a pub sign; use them only if that is the subject.
- Prices in tabular figures, the sans, weight 500.
- Labels in caps at 12–13 px appear once per section at most, never stacked above every heading. Buttons may be caps at 12–14 px, +0.06 to +0.1 em, weight 600–700.
- Sentence case everywhere else.
- Japanese text: the mincho display at 26–32 px, weight 400, tracked +0.05 to +0.14 em; body line height 1.6–2.0.
- One script or hand-drawn face is not part of the default style (see section 15).

## 4. Spacing

- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Section padding 96 (60–104); up to 128 around the hero. Between related sections (menu and its note) 48–64. Vary them.
- Grid and card gaps 24.
- Menu rows 16 apart vertically; groups 64 apart.
- Card padding 32. Buttons 44–52 tall, padding 0 24–32.

## 5. Colour

- **Grounds:** a paper tone from the subject's material (flour, oat, unbleached linen, clay). Keep L 0.95–0.98, chroma at most 0.02, hue 60–110. A second ground for bands: L 0.92–0.94, chroma at most 0.03. White pages with one paper band are also in the style.
- **Ink:** a warm near-black or brown-black, never pure #000.
- **Accent:** taken from the product (crust, tomato, leaf, glaze), at most about 10% of the area, used on the primary button, prices of specials, one band.
- **Second colour:** an atmospheric one (leaf green, butter yellow, sage) for one full-bleed band and illustration fills, never for buttons.
- **Greys:** warm only. A cool grey on paper looks dirty.

Palettes:

| Name                      | Ground / ground-2 | Ink / ink-2 / muted                                             | Accent                                            | Second                                                    |
| ------------------------- | ----------------- | --------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| Hearth (bakery, clay)     | #f7f1e6 / #efe4d2 | #2b221c (13.85) / #5c4d40 (7.21) / #7a6a5a (4.62)               | #b8401f (4.92; paper text on it 4.92, white 5.53) | leaf #3f5b3a (6.74), butter #f2d27a band with ink (10.58) |
| Crust (boulangerie, deli) | #faf8f6 / #eee9e3 | #3a312e (11.95; 10.49 on ground-2) / #6b5d50 (5.26 on ground-2) | crust red #b52927 (5.98; white on it 6.34)        | ground-2 band, ink footer                                 |
| Market (greens, salads)   | #f4f3e7           | #0e150e (16.62)                                                 | deep green #00473c (9.57; paper on it 9.57)       | mint #d8e5d6 band with #00473c (8.18)                     |
| Pantry (deli, coffee)     | #f6efe0           | #1b1e39 navy (14.2) / #5a5048 (6.85)                            | rust #9a3412 (6.38)                               | yellow #eed63e band with navy text (11.09)                |

Watch the second ground: on #efe4d2, the muted #7a6a5a drops to 4.13 and the accent #b8401f to 4.4. Use ink-2 #5c4d40 (6.44) for small text there, and keep the accent to 24 px and larger or to buttons with paper text.

Do not use measured site colours that fail: a taupe like #8a7864 on #faf8f6 is 4.0 and fails for text.

## 6. Surfaces

- Radius: one value from 12–24, used on every card and image. Buttons 8–12, or full pills for a casual, bright food brand, a tea house or confectioner, children's and wellness subjects. Never mix pills and square buttons.
- No soft drop shadows. For a playful subject, a flat offset shadow `2px 2px 0` in ink is allowed on buttons and cards.
- Borders: `rgba(43,34,28,.14)` 1 px, or none.
- Texture: optional grain at 3–4% opacity over grounds, never over text blocks at a level that lowers contrast.
- One round stamp per page, 96–128 px: a circle with the shop's year, town or a short promise set on a path or stacked inside, in the accent or ink. It overlaps the hero image or field edge by about a third.
- No blob shapes, no torn-paper edges, no wavy section dividers.

## 7. Navigation

- 72–88 px tall. Name in the display serif at 24–28 px left. Four to five links at 15 px sans. One primary button (order, book, visit) in the accent.
- Optional strip above, 36 px, on ink or the second colour: today's hours or a short notice ("Open until 18:00 today; sourdough out of the oven at 11:30").
- Not sticky on small sites. On menu-heavy pages, a sticky 56 px compact bar is fine.

## 8. Hero patterns

**A. Split with a photo.** Text in columns 1–6: display 72–88 px, a 18 px paragraph of 2–3 lines, button plus a text link. Image in a 4:5 box (588 × 735) in columns 7–12, with the stamp overlapping its edge. Use whenever the subject has something to photograph; a `data-photo` placeholder counts.

**B. Typographic (when there is nothing to photograph).** A display line at 88 px across columns 1–10, light weight, on the paper ground. Below, at the 48 px gap, a row: hours and address in columns 1–4, a short paragraph in 5–9, the button in 10–12. The stamp sits at the top right, half off the container edge. A full-bleed colour band begins right under the first screen.

**C. Menu board (no photo).** The hero is today's menu: a heading at 56 px, then 5–7 items set as menu rows (name in serif 24 px, a short description in 15 px, price right-aligned with a dotted leader). The ground is the second colour or a dark band, and the menu sits in columns 2–9 with a note in 10–12.

## 9. Section patterns

- **Menu list.** Groups (breads, pastries, coffee) with a caps label. Rows: name, short description in ink-2, price in tabular figures. Leaders: a dotted 1 px line between name and price, or none. Mark seasonal items with a word, not a colour chip.
- **Offer cards.** Two or three cards of different sizes (not three equal), each with a tint from the palette, a title, 1–2 lines, price, a link.
- **Story strip.** A short paragraph (60–80 words) about the maker in columns 3–8, beside an image or a field with a large ingredient word.
- **Hours and address.** A real table: days in one column, hours tabular in the next, closed days shown as "Closed". Map link as text.
- **Process steps.** Only for a real sequence (mix, rest, shape, bake). Times in tabular figures ("18 h ferment").
- **Box plans or subscriptions.** Plans as a comparison table with the price, contents and delivery day, not as three equal cards with a highlighted middle.
- **Footer.** On the second colour or ink, with address, hours, social as text.

## 10. Imagery and its no-photo fallback

- Photos: close, natural light, real surfaces (flour on a bench, glaze drips). Crops 4:5 and 3:2. One full-bleed image at most. A subject that is physical (food, places, objects, craft) has at least one photo, usually in the hero or right under it: put a `<img data-photo="…" alt="…">` placeholder with no src at its real size and crop when no photo exists yet.
- **No photo** (only when there is truly nothing to photograph):
  1. Typographic hero (B) or menu board hero (C). Never an empty frame at the top.
  2. A big ingredient word at 160 px in the serif on a tinted field (paper-2 or butter), cropped by the field edge only if a third or more is cut.
  3. Alternate the tints of fields so each placeholder is a colour, with a caption in 13 px ("Photo: morning bake, rye loaves cooling on the rack").
  4. Simple line illustrations are acceptable if they are drawn with one stroke weight in ink. Do not use emoji or clip art.

## 11. Product UI in this style

For ordering or booking: a phone at 390 × 844, radius 40 frame, showing a real order with item names, quantities, a pickup slot ("Pickup 08:15–08:30, Sat 14 Dec"), and a total that adds up. Buttons in the accent, text 15–17 px. Keep the warm ground inside the app.

## 12. Signature moves

1. A light serif display at 72–88 px with 0.95 leading.
2. Ground, accent and second colour taken from the subject's material.
3. One round stamp overlapping an edge.
4. A menu set as a real list with tabular prices.
5. One full-bleed colour band.
6. Warm greys only, never cool.
7. Hours as a real table.

## 13. Anti-patterns

1. Blob shapes, wavy dividers, torn-paper edges.
2. A script face for headings.
3. Soft blurred drop shadows on cards.
4. Cool grey text on cream.
5. The accent on more than about 10% of the area.
6. Three equal cards for products or plans.
7. Emoji or clip-art icons.
8. A centred paragraph longer than three lines.
9. Every section in a different tint.
10. A grey box as the hero image.
11. Pills on a quiet heritage or fine-dining subject, or pills mixed with square buttons.
12. Caps labels above every heading.
13. A heavy black serif display for a delicate subject.
14. One headline word in italic or in the accent.
15. Muted text below 4.5:1 on the second ground.
16. Prices in proportional figures.
17. Stock phrases ("crafted with love", "artisanal goodness").

## 14. Overrides of the global anti-slop

- **Cream ground with a serif and a terracotta accent: allowed** when the subject's material justifies it (bread crust, clay, terracotta pots). Record the material in the style comment. If the subject has a different material (greens, coffee, flowers), take that colour instead; the override is not a default.
- No other override. Tracked eyebrows, the italic or coloured word, orbs and glows remain banned.

## 15. Breakable rules (when the person asks for something bolder)

1. **No hand-written face.**
   - Protects: credibility and legibility.
   - Breaking gives: one hand note (Caveat or Patrick Hand, 20–24 px, rotated -3° to -5°) beside a special reads as a real chalk note.
   - Allowed when: it appears once, says something specific ("Only 12 left on Saturdays"), and the shop truly writes by hand.
2. **No accent word in the headline.**
   - Protects: against the reflex of one coloured word.
   - Breaking gives: a single ingredient name in the accent can act as the product.
   - Allowed when: the word is the product itself and the rest of the page has no accent text.
3. **No torn or irregular edges.**
   - Protects: against craft clichés.
   - Breaking gives: one deckle-edged band can mirror a paper bag or label the shop really uses.
   - Allowed when: the edge copies a real printed item of the brand, once per page.
4. **One radius everywhere.**
   - Protects: coherence.
   - Breaking gives: an arched image top (radius 50% top only) evokes a bakery window.
   - Allowed when: the arch comes from the subject's architecture and appears once.

## 16. Self-check

1. Do ground, accent and second colour come from named materials of the subject?
2. Is the display serif light (300–400) at 72 px or larger?
3. Is the accent at or below about 10% of the area?
4. Are there no blobs, wavy dividers or torn edges?
5. Are all greys warm?
6. Does the menu use tabular prices and real item names?
7. Are hours shown as a table?
8. If the subject has something to photograph, is there a photo (a `data-photo` placeholder counts) at a real crop near the top; if not, does the hero stand on type or a menu?
9. Is there at most one stamp, one full-bleed band and one full-bleed image?
10. Do muted text and the accent pass 4.5:1 on every ground they sit on?
11. Is centred text limited to short blocks?
