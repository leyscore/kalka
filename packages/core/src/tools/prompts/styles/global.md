# Global rules

These rules hold for every page. The style index below lists the styles Kalka knows; a style is a starting point, never an obligation. When one fits the subject, load its guide with `read_style` and follow it; when none fits, build your own direction from the subject with these rules and the colour and type direction. The anti-slop catalogue still applies; a style guide may override only the items it names in its section 14.

## Process

1. **Subject.** Write one line: who it is for, what they do on the page, and four physical materials from the subject's world. Take ground, ink and accent from those materials.
2. **Style.** Choose with the style index, or choose none when no style speaks the subject's world: a forced style is worse than a direction of your own. Record the choice in an HTML comment on the first line of the page: `<!-- style: Bento | reason: four product capabilities of equal weight | palette: #f6f5f2 / #1b1a17 / #2f6b4f -->`, or `<!-- style: own direction | reason: … | palette: … -->`.
3. **Palette.** Build it with the colour procedure below. Write the tokens as CSS variables before any section.
4. **Page type.** Note what this page type needs (pricing needs a comparable table; a restaurant needs hours and the menu above the fold of section 2; an app screen needs one real workflow moment).
5. **Build** section by section with the style's grid, scale and patterns. Never repeat a section skeleton twice in a row.
6. **Check** with a screenshot at 1440 and 390, the lint, and the style's self-check. Fix before you finish.
7. **Template check.** Swap the product name for a competitor's in the same category. If the headline, the hero visual and the section titles still fit, they are generic: rewrite them with this product's own nouns, data and workflow until the swap breaks them.

## Colour procedure

Work in OKLCH. Convert to hex only when writing the tokens.

**Neutrals.** Tint every grey toward the brand hue, within 20° of it. Chroma 0.002–0.008 at the light end, at most 0.02–0.045 in the mid greys. Above 0.05 a neutral reads as a pale brand colour; stop.

**Area.** Neutral 80–95% of the surface, brand 5–15%, accent and status 5% at most. Do not apply 60-30-10 to UI.

**Brand ramp (light theme).** Solid at L 0.50–0.62, C 0.12–0.27. Steps: page tint L 0.985 (C 5–10% of the solid's), subtle fill 0.96 (10–15%), hover fill 0.93 (20%), border 0.88 (30%), strong border 0.80 (50%), solid, solid hover = solid L − 0.05, text 0.45–0.50 (80%), strong text 0.25–0.30 (40%).

**One brand colour.** Full ramp, tinted neutrals, separate status hues. This is the default.

**Two brand colours.** Give them unequal jobs: one is action (buttons, links, selection), the other is atmosphere (bands, illustration, large fields). Make them differ in L by at least 0.25 so they never fight at the same weight.

**Three or more.** One becomes the UI accent. The rest go to illustration, charts and full-width bands only, never to buttons. Lower their chroma or area relative to the lead.

**Harmony, as OKLCH hue offsets from the lead:** monochromatic 0°; analogous ±30°; complementary 180°; split-complementary 150° and 210°; triadic 120° and 240°; tetradic 60/180/240 or 90° steps. One hue dominates by area. Hues placed side by side share the same L. Hue anchors: red 25–30, yellow 100–110, green 145–155, blue 250–265.

**Status hues.** Error 25–30, warning 70–95 with dark text, success 145–160, info 240–260 (reuse the brand if it is blue). Every status pairs colour with an icon or a word, and gets tint, border, text and solid steps.

**Brand vs status.**

- Red brand (hue 0–45 or 340–360): never use the brand solid on destructive actions. Make error darker (L ≤ 0.55) and always iconed. Consider near-black primary buttons, keeping the brand for logo and highlights.
- Orange or amber brand (45–90): move warning to yellow (95–105) with dark text, or rely on icon plus text.
- Green brand (135–165): success gets an icon and label, or shifts to teal (about 175) or a deeper green at L ≤ 0.5.

**Contrast (WCAG 2.2).** Text 4.5:1. Large text (24 px, or 18.66 px bold) 3:1. Non-text UI and focus 3:1; 2.999 fails, never round. Targets at least 24×24, 44–48 on touch. Focus indicator at least 2 px and never hidden under sticky bars. APCA is a second opinion only: Lc 75 body minimum, Lc 60 other text, Lc 45 large. Compute every text-on-fill pair, not just text on ground: the label on the accent button, text on a tinted card, the white chip in a dark mock. Mid-tone accents (coral, orange, mid green, sky) often fail with both dark and white text; then the accent stays a fill without text (a dot, a bar, a highlighted slot) and the primary button takes the ink colour, or the accent drops to L ≤ 0.5 for that button.

**Dark ladder.** Base L 0.13–0.19, never #000 unless the style says so. Each elevation +0.02–0.04 L. Borders white at 6–15% alpha. Text at L ≈ 0.97 / 0.75–0.80 / ≈ 0.55 (the last one for meta only, check 4.5:1). Accent lifts to L 0.62–0.80 with chroma cut 10–25%. Reference ladder: #08090a, #0f1011, #141516, #191a1b with text #f7f8f8, #d0d6e0, #8a8f98.

## Realistic product UI

Draw product screens in HTML at true size, not as illustrations.

- **Density.** Text 12–14 px. Nav rows 28–32, table rows 36–40, touch rows 44–48. Sidebar 220–260, top bar 40–52, tab bar about 32. Icons 14–16 with a 6–8 gap. Key caps 18–20 tall, 11–12 px, radius 4. Avatars 16–20 in rows, 24–28 in headers, overlap 25–35%, then "+N".
- **Frame.** Radius 8–12, 1 px hairline, at most one soft shadow. Crop it on at least one edge, or overlap a floating panel (menu, toast, popover) across its edge. Show one moment of one workflow.
- **Data.** Structured IDs (`DRV-8852`, `req_7Hc2kQ`, `pi_3QkT…`, `1Z 999 AA1 0123 4567 84`). Uneven numbers with real ties, and totals that add up. Relative recent times (4 min, 2 h, Tue). Full, varied names. Mixed states with at least one non-happy row. Truncate with an ellipsis. One locale throughout. Tabular figures. Secrets visibly fake: `sk_test_…`, `example.com`, `•••• 4242`.
- **Vocabulary.** Use the domain's own states. Shipping: pre_transit, in_transit, out_for_delivery, delivered, return_to_sender. Clinic: booked, arrived, fulfilled, noshow, waitlist. Payments: requires_action, processing, succeeded, canceled. Logs: method, path, status, latency (84 ms, 212 ms, 1.4 s), `payment_intent.succeeded`.
- **Tells of a fake mock, never do these:** round evenly spaced numbers; John Doe or Acme; every row green; sums that don't add up; proportional digits in tables; UI drawn at 1.5× size; a smooth generic curve chart; no chrome; everything centred and visible; rainbow tags; emoji as icons; invented logos; every time "Just now"; real-looking keys; a fake browser URL bar.

## Breaking the container

An element may leave the container only when the overflow is obvious: at least a third of it out of frame, or full-bleed to the viewport edge. Never overflow by a few dozen px; it reads as accidental cropping. At most two breaks per page.

## Images

A photo that does not exist yet is not a reason to leave it out. Photos are filled in later, so decide by the subject, not by what you have now: if a real photo would make the page better (the product, the food, the place, the people, the work), put one there as a placeholder, `<img data-photo="what it shows, concretely" alt="…">` with no src, at its real size and crop (4:5, 3:2, 16:9 or full-bleed). It may be the hero and the largest element on the first screen. Write the description as a photographer's brief: subject, light, framing ("leeks and Chioggia beetroot in a wooden crate, morning light, top-down").

In each style file, "with a real photo" means "where a photo makes sense", and a placeholder counts. The no-photo fallbacks of section 10 are for subjects with nothing to photograph (dev tools, APIs, data) or for styles that say "No photos"; they are not the safe choice when a photo would fit. A page whose subject is physical (food, places, objects, people, craft) has at least one photo, usually in the hero or right under it.

Kalka draws the placeholder itself (a dashed frame with a person or a landscape and your description), so never draw your own grey box with an icon, never leave an empty frame, never write an image URL.

## Overrides of the anti-slop list

Each style may lift only these items, only in the way its section 14 states. A direction of your own lifts none.

| Style           | May override                                                                              |
| --------------- | ----------------------------------------------------------------------------------------- |
| Editorial       | tracked small caps (true small caps, kickers); index numbers for a real sequence          |
| Swiss Grid      | index numbers for a real sequence                                                         |
| Warm Organic    | cream ground with a serif and a terracotta accent                                         |
| Dark Precision  | one soft glow behind the product frame; mono for code and keys                            |
| Corporate Trust | none                                                                                      |
| Bento           | none                                                                                      |
| Blueprint       | mono labels; drawn grid lines when they are the drawing                                   |
| Cinematic       | tracked small caps for credits and billing; index numbers for a real sequence             |
| Bauhaus         | flat geometric shapes on the grid, at most three; yellow on ink as a field                |
| De Stijl        | drawn grid lines as the bars of the composition; primary colours at full chroma as planes |

Every other anti-slop item applies to every style.
