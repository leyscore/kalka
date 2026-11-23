# Anti-slop research

What makes a generated page or screen read as "AI slop", why, how to detect each sign mechanically, and what a designed alternative looks like. Research date: 2026-11-20. This page is the sourced background; the guidance agents actually read is shorter.

## Where Kalka uses it

- `packages/core/src/tools/prompts/anti-slop.md` is the agent-facing catalogue and the only source of that prose. The app offers it as the built-in `/anti-slop` skill (`src/app/document/instructions/starter-skills.ts`), `get_design_guide` returns it with the design process and the style system (`prompts/styles/`: global rules, colour and type direction, the style index; `read_style` returns one style's full guide) to every agent, and `bun run generate:authoring-reference` copies it into the installable skill as `skills/kalka/references/anti-slop.md`.
- `packages/core/src/tools/prompts/design-guide.md` keeps a short taste summary and sends agents to the catalogue when they check each section.
- The [Catalogue](#catalogue) below gives every sign a stable ID and a detection rule. Those IDs are meant for a lint over rendered pages, for the labels of the Kalka Ley taste model, and for the Ley Index benchmark; see [Checks for Kalka Ley and a lint](#checks-for-kalka-ley-and-a-lint).

When a sign is added to the agent catalogue, add its row here with sources, and the other way round.

## Lessons from kalka.design

The landing page of kalka.design was iterated in November 2026 until it stopped reading as generated. What was rejected, and what replaced it:

| Rejected | Replaced by | Catalogue ID |
| --- | --- | --- |
| Middle dots between short phrases ("A 2-minute game · open benchmark", "1 · Start") | Separate elements laid out with a gap, a hairline, or an icon per item | `middot-separators` |
| "01 / 02 / 03" on items that are not a sequence | No number; real order only where there is one | `fake-numbering` |
| A blue drop shadow under the blue primary button, banners and forms | Flat buttons; a darker bottom edge where a button must feel like a key; shadows kept for floating panels | `colored-glow` |
| A from-scratch "interactive" landing with drawn mock screens | The existing page improved section by section, with real screens of the app captured at 2x | `fake-dashboard` |
| The founding-member call to action as a boxed dark card, split in two columns with checkmarks | The call opened into the night sky, centered at the scale of a chapter: one sentence, one button | `boxed-cta` |
| Sparkles and generic bullets | One drawn four-point star that belongs to the night sky, reused at several sizes | `sparkle-ai` |

What made the page distinctive, as moves another project can translate:

- **A world, not a theme.** A blue sky drawn in pixel dots, with clouds made of the same dot grid, runs under every page of the site.
- **Chapters that travel.** Sections go from day to night, so colour and density change along a path instead of each section inventing its own style; the final call happens at night.
- **Decoration made of the system.** Twinkles are dots of the cloud grid lighting up and fading at the size of the dot under them. Their positions come from a seeded generator (mulberry32), so the sky is the same on every visit and in every screenshot, and nothing moves under reduced motion.
- **Real product, real UI.** Features are shown with real Kalka UI cards and screens, not illustrations.
- **Edges with intent.** The hero is full bleed with square top corners; the header floats over the sky as a white glass bar that narrows on scroll, the one place blur is justified because content really passes under it.

Kalka-specific checks that the external sources do not name:

| ID | Tell | Detection | Alternative |
| --- | --- | --- | --- |
| `boxed-cta` | Closing call to action in a filled, rounded box with two columns, a list of three or more ticks and a button | A box with background and radius in the last two sections holding a heading, three or more check icons and a button in a two-column layout | Open the call into the page's world, centered at section scale |
| `random-decoration` | Decoration placed with `Math.random()` at load, so the page differs on each visit and screenshots never match | Script assigns position or delay from an unseeded random source | A seeded generator; decoration still under reduced motion |
| `rounded-full-bleed` | A full-bleed block with rounded corners against the window edge | Element as wide as the viewport with `border-radius` on the corners touching the edge | Square corners where a block meets the window |

### Heard from players and commenters

The Slop or not? game was posted on Reddit on 2026-11-18; commenters listed what makes them say "AI" (thread URL not recorded; comments relayed by the author). The same day the author reviewed the game's own mockups and rejected several signs in them. What both added beyond the published sources:

| ID | Tell | Who | Detection | Alternative |
| --- | --- | --- | --- | --- |
| `split-hero-combo` | Text left, picture right in the hero, read as generated only together with the stock gradient, rounded cards and a "Get started" button | Persil1 | Hero is a two-column split and at least two of `purple-gradient`, `uniform-surfaces`, `generic-cta` fire | Not a sign alone; it raises the weight of the others |
| `fake-deep-tagline` | A tagline that sounds profound and says nothing ("one click behind, one day away") | Reddit commenter | Short h1 or subtitle with no concrete noun from the product's domain, built as two parallel clauses | What the product does, for whom |
| `small-text-everywhere` | Lots of small text: captions, hints and fine print under everything | Reddit commenter | Share of visible text nodes under 13px above about 30% | Fewer words at a readable size |
| `pill-buttons` | Rounded (pill) buttons everywhere | Reddit commenter | See `pill-soup`; all buttons with radius ≥ half their height | The radius scale of the system |
| `does-everything` | Feature overload: the page shows everything the product does and chooses nothing | lllIsland1087 | More than about eight feature blocks or sections of equal weight | One job shown well, the rest linked |
| `generic-minimal` | Clean but empty: minimal pages can be generic too | lllIsland1087 | Few elements, `stock-font`, no image of the product, no colour beyond neutrals and one accent | A world of the project's own (see the lessons above) |
| `default-focus-ring` | The browser's default blue focus ring, unstyled, everywhere | rabiprojects | `:focus` styles equal to the user-agent default (`auto` outline, `-webkit-focus-ring-color`) on interactive elements | A ring drawn for the design, following the radius, on `:focus-visible` |
| `drop-shadow-everywhere` | Drop shadows on everything | rabiprojects | Share of boxed elements with a `box-shadow` above about 60% | Shadows for floating layers only |
| `colored-dots` | Coloured dots marking categories or states where an icon exists | Author | Small (≤ 10px) round filled elements before labels, with no text alternative | The icon or the word |
| `keyboard-hints` | Helper hints nobody needs: "or press Enter", "Anonymous, takes two minutes" | Author | Small muted text next to a primary action matching `/press (enter|return)|takes \d+ (min|sec)|anonymous/i` | Remove; keep a hint only where people get stuck |
| `landing-kit` | Glass cards, blurred halos and three explanatory cards on a screen that should be a tool or a game | Author | `glass-everywhere` plus `blur-orbs` plus `identical-cards` on one screen | The product's own interface style |

Rabiprojects also named colours and gradients and Inter everywhere, and Tersiv the 01 / 02 / 03 section numbers; those are `purple-gradient`, `stock-font` and `fake-numbering` above.

## Checks for Kalka Ley and a lint

Every ID in the catalogue is a check. How they should be combined:

- **Score stacks, not single signs.** Every serious detector does: Krebs calls 4 or more signs heavy, avoid-ai-design calls 6 or more a template stack, Koso maps a weighted sum to bands from clean to pure slop. Any one sign can be a choice; co-occurrence is the fingerprint. The agent catalogue uses the same idea (one to three: touch up; four to nine: fix by family; ten or more: redesign).
- **Weight by evidence.** Signs named by four or more independent sources (`purple-gradient`, `stock-font`, `identical-cards`, `centered-hero`, `hero-pill`, `colored-glow`, `glass-everywhere`, `emoji-icons`, `hero-metrics`, `buzzwords`, `gradient-text`, `fake-numbering`) weigh more than signs named by one (`theater-phrase`, `label-year`, `stripe-gradient`).
- **Count positive signals.** Koso subtracts points for characterful type, real product shots, specific copy and an own layout. Kalka Ley should learn the same from the [lessons above](#lessons-from-kalka-design): a world carried through the page, real screens, a drawn motif, seeded decoration.
- **Keep the conflicts configurable.** Sources disagree on Geist and Satoshi (recommended by Google's taste skill, flagged by Impeccable, avoid-ai-design and Krebs), on Title Case (required by Vercel for product UI, discouraged by Anthropic and avoid-ai-design) and on perpetual micro-motion (asked for by Google's taste skill, flagged by Impeccable and avoid-ai-design). Weight these low.
- **Separate slop from unfinished.** The [Craft floor](#craft-floor) rules (contrast, focus, hit targets, reduced motion) mark a page as poorly made or broken, not as generated. They match the "Poorly made" and "Visibly broken" reasons of the Slop or not? game, while catalogue signs match "Generic" and "AI look"; keep the two scores apart so the model judges quality, not origin.
- **Measure on the rendered page.** Detection rules read computed styles and the DOM after layout, as Kalka's canvas has them, rather than source text; a source scan (Tailwind class names, imports) is a fallback for code exports.


## Why generated pages look alike

1. **Training-distribution mode.** Sources: Anthropic's "distributional convergence", OpenAI ("vague prompts fall back to frequent patterns"), uxskill, CodeMySpec. A model asked for "a landing page" samples the mode of tutorials and starter templates.
2. **Framework defaults accepted unchanged.** Tailwind indigo-500 (Wathan), shadcn neutral tokens, the 0.5–0.75rem radius token, Lucide as the default icon set, Geist on Next.js, and Aceternity or Magic UI effect blocks.
3. **Absence of decision.** Centring, equal cards and uniform spacing are the choices that need no hierarchy decision (uxskill, Rottoways).
4. **Second-order convergence.** Banning wave 1 (purple, Inter, glass) creates wave 2: cream, terracotta, italic serif, mono caps labels, 01/02/03, near-black with acid accent. Anthropic's 2026-09 skill, avoid-ai-design SD1–SD9, CodeMySpec and the Medium piece "The Anti-Slop Look Is Now AI Slop" (https://medium.com/@anup.karanjkar08/the-anti-slop-look-is-now-ai-slop-11-claude-design-secrets-nobody-tells-you-0c11c2bb2359, not fetched) all describe it. **Implication: list-based bans always need a stacking or "template-likeness" score, not only individual rules.**
5. **Fabrication filling the gaps.** Without real data, models invent stats, logos, testimonials, five-star rows and "Trusted by 10,000+".

## Catalogue

Each row is one check; its ID is stable, for lint rules, Kalka Ley labels and the Ley Index. Columns: **ID**; **Tell**; **Who names it**; **Why it reads as AI**; **Mechanical detection** (DOM/CSS heuristic for a rendered page, or a source scan); **Creative alternative**.

Source abbreviations:

| Code | Source |
|---|---|
| ANT | Anthropic skill or blog |
| OAI | OpenAI GPT-5.4 guide |
| GOO | Google stitch `taste-design` |
| VER | Vercel |
| IMP | Impeccable |
| AAD | avoid-ai-design |
| KRB | Krebs |
| SL | sameness-lint |
| KOSO | Koso |
| UNC | Uncodixfy |
| TS | taste-skill |
| ART | the articles in A3 |

### Colour and effects

| ID | Tell | Who | Why AI | Detection | Alternative |
|---|---|---|---|---|---|
| `purple-gradient` | Purple/indigo/violet gradient (hero, CTA, glow), often 135deg indigo→blue | ANT, OAI, GOO, IMP ai-color-palette, AAD C1, KRB, SL, KOSO, ART (nearly all) | Tailwind indigo-500 in tutorials and Tailwind UI; training mode | Parse `background-image` gradients. Flag if ≥2 stops are chromatic (OKLCH C > ~0.08 or HSL s > 0.4) and all fall in hue 250–320° (IMP), or 200–300° (SL, wider, catches blue→violet). Source scan: `from-(indigo\|violet\|purple\|fuchsia)-\d+` … `to-(blue\|indigo\|cyan\|sky\|purple\|pink)` | Palette derived from the subject; one dominant colour plus one accent; tonal or no gradient |
| `indigo-primary` | Indigo/violet filled primary buttons and links | AAD C2, KRB "vibe purple", KOSO, v0 prompt (bans indigo/blue) | Same source as #1 | Computed `background-color` of `button, a[role=button], [class*=btn]` with hue 230–300° and C > 0.1. Also link `color` in that range | Brand-derived primary with real hover and active states |
| `gradient-text` | Gradient-filled headline text | IMP gradient-text, AAD C6, GOO, KOSO, KRB, ART (Rottoways, No-Code) | Decoration standing in for hierarchy | `background-clip: text` (or `-webkit-`) plus `color: transparent` and a gradient `background-image` on h1–h3 or large text. IMP flags purple at hue 260–310° | Solid ink; emphasis through scale, weight and line breaks |
| `colored-glow` | Coloured glow shadows (buttons and cards) | IMP dark-glow, AAD C5, KRB, KOSO, GOO, UNC, Kalka (user rule) | The default "cool" look | `box-shadow`/`text-shadow` layer whose colour is chromatic (C > ~0.05) and not within ~30° hue of its surface, or blur ≥ 16px with 0 offset. Tailwind scan: `shadow-(indigo\|violet\|purple\|cyan\|blue)-\d+(/\d+)?` | Neutral, layered elevation shadows (VER); atmosphere in the background, not on controls |
| `blur-orbs` | Blurred orbs, blobs, radial halos, spotlight glows | IMP radial-halo / radial-spotlight-glow, AAD C11, KOSO | Stock "depth" filler | Elements with `filter: blur(≥40px)` and `border-radius: 50%` behind content, or `radial-gradient(<chromatic>, transparent)` on a dark section. Class scan: `blur-3xl\|orb\|blob\|bokeh` | Real imagery, product UI or subject texture |
| `glass-everywhere` | Glassmorphism everywhere | KRB, SL, AAD K3, KOSO, UNC, Snoddy, Falia | Starter-template default | Count elements with `backdrop-filter: blur(...)` plus translucent white/black background. Flag if > 1–2, or if on cards rather than only nav or overlays | Solid surfaces; blur only where layering is real (nav over scroll) |
| `neon-dark` | Permanent dark mode with neon or purple/cyan accent and grey body text | KRB perma-dark, AAD C3/C7/SD2, OAI "dark-mode bias", KOSO, IMP ai-color-palette | "Premium" default; Linear imitation | Body background L < 15% with no `prefers-color-scheme: light` variant; single accent with C > 0.15; body text L 55–70% | Choose light or dark from brand and context; AA body text |
| `cream-terracotta` | Cream/beige ground + terracotta accent + serif ("the Claude look") | ANT 2026-09, IMP cream-palette, AAD SD1, KOSO, ShipThemes, Falia, is-it-vibecoded | Second-order convergence; matches Claude's own brand | `body` background in warm off-white (hue 30–60°, L 92–97%, low C) plus an accent near hue 25–40° (about #D97757) plus a serif display | Ground and accent from the subject; change hue family and display face |
| `acid-dark` | Near-black + single acid-green or vermilion accent, often mono | ANT, AAD SD2, Falia | Second-order "developer" default | Dark ground with exactly one accent with C > 0.2 at hue ~110–140° or ~20–35°, plus monospace labels | Go dark only when earned; choose the accent for meaning |
| `fallback-accent` | Emerald/teal fallback accent; slate, espresso or sand "named" palettes | AAD SD8/SD9 | Fallback when purple is banned | Single accent hue 150–180° on a neutral page; ground matching Tailwind slate/stone hex values | Accent tied to brand with a job |
| `timid-palette` | Timid, evenly spread palette, or one hue posing as two | ANT, AAD C4/C8/C10 | No dominant decision | Cluster computed colours by area. Flag if no colour covers more than about 50% of the non-neutral area, or primary and accent within 20° of hue | 60/30/10: one dominant, one secondary, one sharp accent |
| `stock-tokens` | Untouched shadcn tokens and radius; zinc-950 card with `white/10` border | AAD K1/K8/K9, KRB, Snoddy, CodeMySpec | Library defaults accepted unchanged | Compare `:root` CSS vars to shadcn defaults (`--radius: .5rem/.625rem`, neutral oklch values). Source: unchanged `components.json` base colour | Theme base colour, radius, fonts and shadows (shadcn's own advice) |
| `filler-grid` | Faint grid or dot "graph paper" background | AAD L10, IMP codex-grid-background, KOSO | Stock hero filler | `background-image` with repeating `linear-gradient` 1px lines at a fixed `background-size`, or a radial dot pattern. Classes `bg-grid`, `DotPattern`, `GridPattern` | Plain ground unless the product lives on a grid (canvas, map) |
| `stripe-gradient` | Repeating-stripe gradient decoration | IMP | Generated-UI signature | `repeating-linear-gradient` on non-progress surfaces | Deliberate texture or plain |
| `low-contrast` | Grey text on coloured background; muted text below AA | IMP gray-on-color/low-contrast, AAD C9, KRB, ShipThemes, No-Code, KOSO | Default "muted-foreground" on everything | Computed contrast (WCAG 2 or APCA per VER) below 4.5:1 for body and 3:1 for large text; grey (C < 0.02) on a chromatic background | A shade of the background hue or near-white |

### Typography

| ID | Tell | Who | Why AI | Detection | Alternative |
|---|---|---|---|---|---|
| `stock-font` | Inter (or a system stack, Roboto, Arial, Open Sans, Lato) as the only face | ANT, OAI, GOO, IMP overused-font, AAD T1, KRB, SL, KOSO, UNC, all ART | The most common UI font in training data; library default | Collect computed `font-family` of h1–h3, p, buttons. Flag if the first resolved family of all roles is in {Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Open Sans, Lato} | Display face chosen for the brief plus a body face; or one face with real contrast |
| `fashionable-font` | The "tasteful free font" cluster: Space Grotesk, Geist, Instrument Serif, Fraunces, Syne, Sora, Cal Sans, Plus Jakarta Sans, Satoshi(?) | ANT ("never converge on Space Grotesk"), IMP, AAD T2/T4, KRB, KOSO "fashionable font" | Wave 2 after Inter was banned. **Note: GOO and TS recommend Geist and Satoshi, so the sources conflict** | Same check against the second list. Weight it lower; flag in combination with other tells | Faces sourced from the domain (editorial, technical, cultural); pay attention to licensing |
| `accent-word` | One headline word accented (italic serif, colour, gradient, highlight) | ANT, AAD SD5/T3, KRB, KOSO, IMP italic-serif-display | Template "personality" move | Inside h1, a child `em`, `i` or `span` whose computed `font-family`, `font-style`, `color` or `background-image` differs from the h1's, covering < 40% of the characters | Let the whole headline carry the idea via scale and breaks |
| `italic-serif-hero` | Oversized italic serif hero (Fraunces, Recoleta, Playfair, Newsreader italic) | IMP, ShipThemes "2026 style" | Wave-2 "taste" hero | h1 `font-style: italic` plus a serif family, font-size ≥ 56px | Roman cut, or a face with a point of view |
| `eyebrow-labels` | Tiny ALL-CAPS tracked eyebrow or kicker above every heading | ANT, IMP kicker/hero-eyebrow-chip, AAD SD4/T5, KRB, KOSO, UNC, OAI, No-Code | Template chrome | An element immediately preceding h1–h3, font-size ≤ 14px, `text-transform: uppercase` (or caps text), `letter-spacing ≥ 0.05em`. Flag if it repeats in ≥ 2 sections or sits above the hero h1 | Drop it; if a label carries information, use sentence case inline |
| `mono-labels` | Monospace for small meta labels | ANT, AAD SD4, Falia | "Developer" chrome | Monospace `font-family` on elements ≤ 13px that are not code, kbd, numbers or data | Mono only for real code or data |
| `flat-scale` | Flat type scale (heading barely bigger than body; one or two weights) | ANT (wants 3x jumps, 100 vs 900), IMP flat-type-hierarchy (< 1.25x), AAD T6, No-Code | No hierarchy decision | Ratio of h1/h2/h3/body computed sizes; flag any adjacent dominant step < 1.25. Count distinct weights ≤ 2 | Intentional scale (Bringhurst per ANT), weight and width contrast |
| `oversized-headline` | Oversized full-sentence h1 / crushed tracking | IMP oversized-h1 / extreme-negative-tracking, KOSO (< −0.04em) | Display-size cargo cult | h1 ≥ ~64px with > ~8 words; `letter-spacing < −0.04em` | Short punchy display or smaller sentence |
| `unloaded-font` | Font declared but never loaded | AAD T7 | Generated CSS names a font with no `@font-face` or link | `document.fonts.check()` false / declared family not in `document.fonts` with status loaded | Ship the font |
| `title-case` | Title Case everywhere | AAD CP5, ANT (sentence case) — *note VER requires Title Case for product headings/buttons; conflict* | Template copy | Regex on headings/buttons: every word ≥ 4 letters capitalized | Sentence case (or a deliberate house style) |

### Layout and composition

| ID | Tell | Who | Why AI | Detection | Alternative |
|---|---|---|---|---|---|
| `centered-hero` | Centred hero stack (pill → h1 → sub → two CTAs, all centred) | AAD L1, KRB, SL, KOSO, GOO (variance > 4), Rottoways, Snoddy, Falia | Works at any size with no hierarchy decision | First section: h1 `text-align: center` (or a centred flex column) plus centred p plus ≥ 2 buttons centred. Page-wide: share of text blocks with centre alignment > ~50% | Left or asymmetric split; open with the subject's most characteristic element (ANT) |
| `hero-pill` | Pill badge above the hero h1 ("✨ New", "Now with AI") | KRB, AAD K5, IMP hero-eyebrow-chip, KOSO, No-Code, OAI (no chips on hero) | Template opener announcing nothing | Element preceding h1 with `border-radius ≥ height/2`, height ≤ 36px, short text (≤ 6 words), often containing ✨ or "New" | Remove, or real dated news linked to a changelog |
| `identical-cards` | Three identical feature cards with an icon on top | ANT (SaaS card kit), GOO, OAI, AAD L2, KRB, SL, KOSO, IMP icon-tile-stack, all ART | Safest way to say "we have features"; Tailwind tutorial grid | Find a parent with ≥ 3 children having the same tag structure signature (icon/svg → heading → p), equal widths (±2px), same background/radius/shadow. Grid `repeat(3, 1fr)` or `grid-cols-3` | One showcase feature plus secondary items; alternating rows; prose; show the product doing it |
| `icon-tile` | Icon in a tinted rounded square (Lucide in a `bg-primary/10` chip) | AAD K6/I1, IMP icon-tile-stack, KOSO, Kalka | Generator's universal feature-card shape | `svg` whose parent is a 32–56px square box with radius 8–16px and a translucent chromatic background matching the accent hue, placed above a heading | Icon inline with the heading, custom marks, or none |
| `hero-metrics` | Stat/metric row in the hero or a "by the numbers" band (big round numbers, small labels) | ANT, OAI (stat strips), GOO (fake metrics), AAD L4/L11, KRB, KOSO, UNC (KPI grid), No-Code ("10x faster") | Fabricated proof filling the gap | ≥ 3 siblings each with a short numeric text (`/^[\d.,]+[%xk+KMB]*\+?$/`) at font-size ≥ 2× its label sibling. Round numbers (`/\b(10|50|99(\.9+)?|100)[%x+kK]/`) raise the score | Real, sourced numbers inline, or cut |
| `count-up` | Count-up stat animation | AAD M5, KRB, Falia | Animated fabrication | Scripts or classes `CountUp`, `NumberTicker`; text content changing on scroll-in | Show the number |
| `trend-bento` | Bento grid used for trend, not hierarchy | AAD L3, KOSO, uxskill, No-Code | Apple-keynote meme | CSS grid with ≥ 4 children with ≥ 2 distinct `grid-column/row span` values, all rounded cards | Only when tile size encodes real importance |
| `nested-cards` | Cards inside cards | ShipThemes, IMP nested-cards, AAD K11, Falia, UNC | Uniform containment by default | Element with background/border/shadow plus radius whose ancestor within 3 levels also has one | One level of containment; use space and type |
| `uniform-surfaces` | Same radius and same soft shadow on every surface (`rounded-2xl` plus `shadow`) | ANT, AAD K2, uxskill, ShipThemes, 925, prg.sh, Snoddy, UNC (20–32px everywhere) | Uniform library default | Histogram of computed `border-radius` and `box-shadow` across boxed elements: one value covers > ~70%; radius ≥ 16px on most cards | 2–3 radii and elevation levels by role; nested radii (VER) |
| `border-wide-shadow` | Hairline border plus wide diffuse shadow on every card in a row | IMP gpt-thin-border-wide-shadow | Generated-UI signature | Sibling cards all with `border-width ≤ 1px` and shadow blur ≥ 24px | Reserve both for one floating panel |
| `side-stripe` | Coloured left/top stripe on rounded cards (side-tab accent) | KRB, AAD K4, IMP side-tab, KOSO | Template emphasis | `border-left/top-width ≥ 2px` chromatic while other sides are 0/neutral, on a box with radius ≥ 4px on the opposite corners (IMP) | Weight, scale, background or position |
| `fake-numbering` | Decorative 01/02/03 numbering, and the 1-2-3 "how it works" | ANT, AAD SD6/L5, IMP numbered-section-labels, KRB, KOSO, TS, Kalka (user rule) | Fake editorial structure | Text nodes matching `/^0?[1-9]$/` or `/^0[1-9]\b/` as their own small element, repeated across ≥ 3 siblings or sections that are not an `ol` with a real sequence | Number only real sequences |
| `template-order` | Stock section order (hero → logos → 3 features → testimonials → pricing (3 tiers, middle ringed) → FAQ accordion → 4-column footer) | AAD L7/L8/L9, CodeMySpec, KRB (FAQ), Rottoways, KOSO | Template silhouette | Classify sections by heuristics (logo row, card grid, quote blocks, price regex `\$\d+/mo`, `details`/accordion, footer columns). Flag when ≥ 5 occur in canonical order. "Most popular" text plus a scaled or ringed middle card | Order by audience decisions; cut template-only sections |
| `logo-wall` | Grey logo wall "Trusted by" | SL, AAD L4, KOSO, OAI (logo clouds), No-Code (fake logos) | Fabricated social proof | Text `/trusted by\|loved by\|used by teams at\|backed by/i` near a row of ≥ 4 imgs/svgs with `filter: grayscale` or `opacity ≤ .6` | Named, consenting customers or one case study |
| `uniform-rhythm` | Same section padding everywhere (monotonous rhythm) | ShipThemes, IMP monotonous-spacing, AAD S1/L6, SL same-rhythm | No rhythm decision | ≥ 75% of top-level sections share identical `padding-block` (SL); every section in the same `max-width` container (AAD L6) | Spacing scale varied by importance; full-bleed sections |
| `fake-window` | Fake window chrome (traffic-light dots) around a generic panel | AAD SD7 | Product-shot stand-in | Three 8–14px circles in red/yellow/green in a row at the top-left of a box | A real screenshot or product state |
| `fake-dashboard` | Floating dashboard or fake chart in the hero | OAI, UNC (fake charts, donuts) | Fake product evidence | Hero contains `svg` or `canvas` charts with no data source; donut with "%" labels | Real product UI |

### Components and icons

| ID | Tell | Who | Why AI | Detection | Alternative |
|---|---|---|---|---|---|
| `emoji-icons` | Emoji as icons or bullets (nav, list items, headings) | KRB emoji-nav, SL, AAD I2, GOO ("no emojis anywhere"), uxskill, No-Code, KOSO, Falia | Zero-effort icon substitute | Regex `\p{Extended_Pictographic}` as the first grapheme of `li`, `a`, `button`, h1–h6, or nav items | Real icon set or custom marks; plain bullets |
| `sparkle-ai` | Sparkle icon or ✨ to mean "AI" | AAD I3, KOSO, Wikipedia note | Industry cliché | `✨` (U+2728) in text; `lucide-sparkles` / `Sparkles` component; svg `<title>` sparkle | A concrete verb or label for what the feature does |
| `stock-glyphs` | Overused Lucide glyph set (Zap, Rocket, Shield, BarChart3, ArrowRight, Check, Star) one per card | AAD I1/I3, Snoddy, 925 | Default icon library | Class `lucide-(zap\|rocket\|shield\|bar-chart\|arrow-right\|check\|star\|sparkles)`; Lucide's signature `stroke-width="2"` 24×24 | Icons chosen for meaning, or none |
| `tick-circles` | Check marks in tinted circles on every list line | Rottoways, AAD K14 | Pricing-example default | `li > svg` inside a round tinted box, repeated ≥ 3 | Plain list or a real comparison table |
| `fake-live` | Pulsing status dot or "Live" badge with no live data | IMP pulsing-dot, AAD K13, TS, UNC, Falia | Simulated liveness | Small (≤ 12px) round element with `animation` scaling or opacity looping (`animate-ping`, `animate-pulse`) | Static, labelled state only where real |
| `pill-soup` | Status-chip or pill soup | OAI, AAD K12, UNC (tag badges on every row) | Decoration as information | Count of pill-shaped elements (radius ≥ h/2, height ≤ 28px) per card or row > 2, or present on > 80% of rows | Chips only for real, changing state |
| `effect-gallery` | Stock effect-library components (Spotlight, Background Beams, Meteors, Border Beam, Shimmer Button, 3D card) | AAD K10 | Copy-paste from Aceternity or Magic UI | Class or component names; `conic-gradient` animated borders | Effects tied to product data, or none |
| `missing-states` | Missing states: no hover, focus-visible, disabled or error states | AAD K7, ANT (quality floor), VER, No-Code | Only the happy path generated | Stylesheet scan: interactive selectors without matching `:focus-visible`; `outline: none` without a replacement | Full state set (VER, Vercel product-design) |

### Motion

| ID | Tell | Who | Why AI | Detection | Alternative |
|---|---|---|---|---|---|
| `same-reveal` | Same fade-and-slide-up on every section (scroll reveal everywhere) | ANT, AAD M1, Falia | Default AOS or Framer pattern | ≥ 3 sections with identical initial `opacity: 0` plus `translateY` and the same IntersectionObserver class (`data-aos`, `whileInView`). IMP content-hidden-at-rest catches the failure mode | One orchestrated entrance; motion responding to user actions |
| `hover-lift` | Hover lift on every card, clickable or not | ANT, AAD M8, Falia, UNC (translateX nav) | Scattered micro-interactions | `:hover` rules with `translateY(-…)` plus a shadow change on non-interactive elements (no `a` or `button` ancestor or descendant covering the card) | Hover only on activatable elements |
| `bounce` | Bounce or elastic easing | IMP, AAD M4 | Dated "playful" default | `cubic-bezier` with y1 or y2 outside [0,1] (overshoot), `animate-bounce`, `easeOutBack`, springs with bounce > 0.3 (Emil) | Exponential ease-out (Emil `cubic-bezier(.23,1,.32,1)`) |
| `typewriter` | Typewriter headline, blinking cursor | AAD M7, IMP blinking-cursor | Fake AI theatre | Text content mutating char by char; `@keyframes` blink on a `|` or `▍` element in the hero | Show real output in the product area |
| `marquee` | Auto-scrolling marquee (logos) | IMP marquee, AAD M9, KOSO | Attention without content | `animation` with `translateX` linear infinite on a duplicated logo row; `<marquee>` | Still row |
| `no-reduced-motion` | Motion ignoring `prefers-reduced-motion` | AAD M6, VER, Emil, ANT, No-Code | Missing quality floor | Animations present and no `@media (prefers-reduced-motion)` rule in any stylesheet | Gate non-essential motion |

### Copy and microcopy

| ID | Tell | Who | Why AI | Detection | Alternative |
|---|---|---|---|---|---|
| `buzzwords` | Marketing buzzwords (supercharge, seamless, unlock, streamline, empower, elevate, unleash, next-gen, cutting-edge, world-class, revolutionize, transform, effortless) | IMP marketing-buzzword, SL (17 phrases), GOO, AAD CP2, KOSO, 925, CodeMySpec | Average of marketing copy | Case-insensitive word-boundary regex over visible text; score per hit; ≥ 3 hits = tell (KOSO) | A specific verb and noun saying what it does for whom |
| `vague-headline` | Vague aspirational headline ("Build the future", "Elevate your workflow", "Built for modern teams") | AAD CP1, OAI, ShipThemes, No-Code, uxskill, KOSO | No product decision | h1 with no concrete noun from the page's own domain; heuristics: contains future, workflow, modern, next, all-in-one, platform with no object; fails a "does X for Y" check (LLM) | State what it does, for whom |
| `not-x-but-y` | "Not X, it's Y" / "Stop X. Start Y." / "X. No Y." cadence | AAD CP7, IMP aphoristic-cadence, KOSO, ShipThemes | AI rhetorical tic | Regex `/\b(not (just )?(a\|an )?\w+[,.—-]+\s*(it'?s\|but\|a)\b)\|(^\w[^.]{0,30}\. (no\|just) \w+\.)/i`; ≥ 3 occurrences | Plain positive claim |
| `tricolon` | Tricolon slogans ("Fast. Simple. Powerful.") and everything in threes | AAD CP4, KOSO, No-Code | Rule-of-three bias | Regex `/^(\w+\.\s*){3}$/` on headings; counts of 3-item lists or cards across the page | One concrete claim |
| `generic-cta` | Generic CTAs ("Get started", "Learn more", "Submit", "Click here") | AAD CP6, SL, ANT, GOO (no secondary "Learn more") | Default labels | Button and link text exact match against a list | Verb + object, consistent through the flow |
| `arrow-glyph` | Arrow glyph appended to links and buttons ("Learn more →") | ANT, AAD CP3/SD4 | Template chrome | Regex `/[→➜➔›»]\s*$/` on `a` or `button` text | Drop it, or a sized icon only where meaningful |
| `middot-separators` | Middle-dot or bullet separators between inline meta ("A · B · C") | ANT, AAD SD4, Kalka (user rule) | Template chrome | Regex `/\S\s*[·•∙⋅]\s*\S/` in text nodes of inline or meta rows; or ≥ 2 sibling `span`s separated by `·` | Layout (gap, columns) or icons; separate lines |
| `dash-labels` | "WORD — fragment" labels; em-dash saturation | ANT, AAD SD4, IMP em-dash-overuse (≥ 8 at about 1 per 500 words), KOSO, TS, Falia | LLM prose cadence | Regex `/^[A-Z]{2,}\s+—\s+/` on labels; em-dash count per 500 words | Plain labels; commas and periods |
| `label-year` | `LABEL // YEAR` formatting ("SYSTEM // 2025") | GOO taste-design | Fake technical chrome | Regex `/\b[A-Z]{3,}\s*\/\/\s*\d{4}\b/` | Remove |
| `filler-copy` | Filler UI copy ("Scroll to explore", bouncing chevron); decorative mini-notes explaining the UI | GOO, UNC, OAI (no design commentary in the UI) | Prompt leakage, filler | Regex `/scroll (down\|to explore)\|swipe down/i`; `animate-bounce` chevron svg in the hero | Remove |
| `unsourced-proof` | Unsourced social proof ("Trusted by 10,000+ teams", "10x faster") | AAD CP8, No-Code, GOO (fake numbers) | Fabrication | Regex `/\b\d{1,3}(,\d{3})*\+?\s*(teams\|users\|companies\|customers)\b/i`, `/\b\d+x (faster\|better)\b/i` with no link nearby | Named customers, linked case study |
| `placeholder-identity` | Placeholder identities: John or Jane Doe, Acme, Nexus, lorem ipsum, pravatar, randomuser, DiceBear, ui-avatars | SL stock-proof, GOO, Rottoways, AAD IM4, KOSO, No-Code | Generator fill | Regex on text and `img[src]` hosts (`pravatar.cc\|randomuser.me\|ui-avatars.com\|api.dicebear.com\|placehold`) | Real people or remove the section |
| `five-stars` | Five-star rows on every testimonial | Rottoways, AAD IM5, SL (★★★★★), KOSO | Fake rating | Five identical star svgs or `★` × 5 per testimonial, always 5/5 | Rating only with a linked source |
| `theater-phrase` | "Theater" framing ("security theater", "X is just theater") | IMP theater-slop-phrase | Generated-copy tic | Regex `/\btheat(er\|re)\b/i` in marketing copy | Say plainly what it does |

### Imagery and fingerprints

| ID | Tell | Who | Why AI | Detection | Alternative |
|---|---|---|---|---|---|
| `stock-photo` | Stock team at a laptop; dark scrim over a random hero photo | AAD IM1, uxskill | No reason for the image | Hero `img` or background with an overlay `linear-gradient(rgba(0,0,0,.4+))`; stock CDN hosts (`images.unsplash.com`) | Real product, place or people |
| `generated-art` | Glossy 3D blobs, Corporate Memphis, shape-assembled SVG clip art | AAD IM2/IM3, IMP shape-assembled-illustration, TS (hand-rolled SVG) | Generated art | Inline `svg` ≥ 300px wide made of many (> 30) primitive `circle`, `rect` or `path` elements | Commissioned art, photography or product UI |
| `generator-fingerprint` | Generator fingerprints | AAD F1/F2, Falia, is-it-vibecoded | Leftovers | `meta[name=generator]` (Lovable, v0, Bolt), `data-lov-*`, `data-component-*` taggers; ≥ 3 comments like `<!-- Hero Section -->` | Strip |
| `missing-meta` | Missing favicon or OG image; broken images | KOSO, IMP broken-image, GOO (broken Unsplash) | Unfinished | No `link[rel~=icon]` or `meta[property=og:image]`; `img` with `naturalWidth == 0` | Ship them |
| `page-drift` | Design drift across pages | AAD X1, CodeMySpec, IMP design-system-* | Per-page generation without a shared contract | Compare font, colour and radius sets across routes; diff against DESIGN.md tokens | One token contract (DESIGN.md) |

### Product and app UI specific (dashboards)

| ID | Tell | Who | Detection | Alternative |
|---|---|---|---|---|
| `kpi-row` | 3–4 KPI cards as the default first row | UNC, OAI (no dashboard card mosaics), Falia | First row of ≥ 3 equal cards with a big number plus a trend arrow coloured red/green | Lead with the primary workspace |
| `floating-sidebar` | Floating rounded sidebar shell (around 280px, brand block, CTA card inside) | UNC | Fixed nav with `border-radius` > 12px, margin from the viewport edge, width 260–300px | 240–260px, solid background, border-right |
| `app-marketing-copy` | Hero section or marketing copy inside a dashboard | UNC, OAI ("no aspirational lines on product UI") | Large h1 plus a sub-paragraph at the top of an app route | Utility copy: status, orientation, actions |
| `marketing-density` | Marketing density on app screens | uxskill | Padding ≥ 48px around data tables; row heights ≥ 64px | Dense where data lives |

### Scoring note

All the deterministic detectors (KRB, SL, KOSO, IMP, AAD) score **stacks**, not single tells:
- KRB: 4 or more = heavy.
- AAD: 6 or more = "template stack".
- KOSO: index bands from 0 to 100.

Any one tell can be a deliberate choice; the fingerprint is the co-occurrence. KOSO and Kalka-style taste models can add positive signals (−4 each in KOSO): a characterful typeface, a real product shot, specific copy, an own layout.

## Craft floor

Sources: VER = Vercel Web Interface Guidelines; RAU = Rauno's interfaces notes; EMIL; ANT; GOO = Google DESIGN.md lint and taste-design; OAI; IMP quality rules.

### Typography and text
- `font-variant-numeric: tabular-nums` on compared numbers: tables, timers, prices, stats (VER, RAU). Check: numeric table cells or stat elements without tabular-nums.
- Curly quotes (’ “ ”) rather than straight `'` and `"` in prose (VER). Regex for straight quotes in text nodes.
- A single `…` character rather than `...` (VER). Regex `/\.\.\./`. Options that open a follow-up and loading labels end in `…`.
- Non-breaking space between a number and its unit, in shortcuts and in brand names (VER). Regex `/\d (px\|ms\|MB\|GB\|kg\|%)/` with a normal space.
- `text-wrap: balance` on headings (VER, IMP unbalanced-heading); `text-wrap: pretty` on body to avoid stragglers (IMP).
- Line length at most about 80ch (ANT, IMP), or 65ch (GOO). Check `max-width` in `ch`, or rendered characters per line.
- Body line-height at least 1.3; ideally 1.5–1.7 (IMP tight-leading).
- Body text at least 12px (IMP tiny-text); UI text at least 11px (IMP).
- Mobile inputs at least 16px font-size (VER, RAU).
- No font weight below 400 for body (RAU); medium headings at 500–600 (RAU).
- No font-weight change on hover or selected state (RAU). Layout shift check.
- Body tracking at most 0.05em (IMP wide-tracking); display tracking no tighter than about −0.04em (KOSO, IMP).
- No justified text in narrow columns without `hyphens: auto` (IMP).
- No all-caps body passages (IMP).
- Type-scale step at least 1.25 between roles (IMP); ANT pushes for 3x jumps.
- No skipped heading levels; one h1 (IMP, VER, OAI).
- `-webkit-text-size-adjust: 100%`, `-webkit-font-smoothing: antialiased` (RAU).
- Brand names and code tokens marked `translate="no"` (VER).
- Format dates, numbers and currency with `Intl` (VER); consistent decimals for currency in one context (VER copywriting).

### Interaction and accessibility
- Visible `:focus-visible` rings; never `outline: none` without a replacement (VER, ANT, No-Code). RAU: a box-shadow ring respects the radius.
- Hit targets at least 24px, or 44px on mobile (VER, GOO 44px). Check bounding boxes of interactive elements.
- Icon-only buttons have an `aria-label` (VER, RAU, Vercel lint).
- Navigation uses `<a>` or `<Link>`, never `div onClick` (VER).
- Native semantics over ARIA; a "Skip to content" link; `scroll-margin-top` on anchored headings (VER).
- `<label>` associated with every input; inputs inside a `<form>`; correct `type`, `inputmode` and `autocomplete` (VER, RAU).
- Never block paste (VER).
- Disable `spellcheck` on email, code and username fields (VER, RAU).
- Hover styles gated by `@media (hover: hover)` (RAU), plus `(pointer: fine)` (EMIL).
- No `user-scalable=no` or `maximum-scale=1` in the viewport meta (VER).
- `touch-action: manipulation`; `overscroll-behavior: contain` in modals and drawers (VER).
- Decorative glows and gradients get `pointer-events: none` (RAU); decorative svg gets `aria-hidden` (VER).
- No tooltips on disabled buttons (RAU).
- Status never by colour alone (VER).
- Contrast: WCAG AA 4.5:1 / 3:1 (IMP, GOO lint `contrast-ratio`, ANT), or APCA (VER). Hover, active and focus states increase contrast (VER).
- `<title>` matches the context; `color-scheme: dark` on dark themes; `<meta name="theme-color">` matches the page background (VER).
- Explicit `background-color` and `color` on native `<select>` (VER).
- Images have explicit width and height (VER CLS); no broken images (IMP).
- Lists over 50 items virtualised (VER).
- Loading buttons keep their label and show a spinner (VER, Vercel product-design).
- Destructive buttons are named Verb + Noun, never "OK" or "Confirm" (Vercel lint, ANT).

### Motion
- `prefers-reduced-motion` rule present when any animation exists (VER, EMIL, ANT, AAD).
- No `transition: all` (VER, EMIL). Regex `/transition:\s*all\b/` and Tailwind `transition-all`.
- Animate only `transform` and `opacity`; never `top`, `left`, `width` or `height` (VER, EMIL, GOO).
- UI durations at most about 200–300ms (RAU 200ms, EMIL 300ms; modals and drawers excepted); UNC 100–200ms.
- Never ease-in for UI enter (EMIL); no overshoot easing (IMP).
- Never scale from 0; start at 0.8–0.95 (RAU, EMIL). Press scale 0.95–0.98 (EMIL) or about 0.96 (RAU).
- `transform-origin` set at the trigger for popovers (VER, EMIL).
- Autoplay over 5s needs pause controls (VER); pause off-screen loops (RAU).
- No transitions when switching themes (RAU).
- Hidden-at-rest content must become visible (IMP content-hidden-at-rest), so scroll reveals that never fire are an error.

### Surfaces and layout
- Nested radii: child radius ≤ parent radius, concentric (outer = inner + padding) (VER).
- Layered shadows, ambient plus direct (VER); no colored shadow on controls (UNC, IMP); shadow no stronger than `0 2px 8px rgba(0,0,0,.1)` (UNC, product UI).
- Borders, shadows and text tinted toward the background hue on non-neutral grounds (VER). The inverse check: no pure `#000` (GOO).
- Spacing on a 4px grid (Vercel lint, UNC); no arbitrary off-grid values.
- Full-height sections use `100dvh`, not `100vh` or `h-screen` (GOO).
- No horizontal overflow at 375px (GOO, No-Code, IMP text-overflow); body text not flush with the viewport edge (IMP, at least 16px).
- Safe areas via `env(safe-area-inset-*)` (VER).
- Flex children that truncate have `min-width: 0` (VER).
- Skeletons match the final layout (VER, GOO).
- Every reachable state designed: empty, sparse, dense, error, loading, permission (VER, Vercel product-design).
- DESIGN.md token compliance: font, colour, radius and font-size inside the declared tokens (Google DESIGN.md lint, IMP design-system-*).

## Sources

### Vendors and major players

#### Anthropic, "Improving frontend design through Skills" (fetched)
- URL: https://claude.com/resources/articles/improving-frontend-design-through-skills
- Date: 2025-11-12. Authors: Prithvi Rajasekaran, Justin Wei, Alexander Bricken (Applied AI), with Molly Vorwerck and Ryan Whitehead.
- **Distributional convergence.** Safe, universally acceptable design choices dominate web training data, so a model given no direction samples from that high-probability centre. The result is a recognisable generic look the article calls "AI slop". The fix is explicit guidance for each task, delivered as an on-demand skill instead of a permanent system prompt.
- **Tells it names:**
  - Fonts: Inter, Roboto, Arial, Open Sans, Lato, and system fonts. Space Grotesk recurs even when the prompt rules it out.
  - Colour: purple gradients on white, flat solid backgrounds, and timid, evenly distributed palettes.
  - Layout: predictable layouts and component patterns.
  - Motion: no animation at all, or scattered micro-interactions.
- **Alternatives:**
  - One distinctive font, used decisively. Weight contrasts as extreme as 100/200 against 800/900, and size jumps of 3x or more rather than 1.5x.
  - A dominant colour with sharp accents, defined as CSS variables. IDE themes and cultural aesthetics as sources.
  - Layered gradients or geometric patterns as backgrounds.
  - One orchestrated page load with staggered `animation-delay` reveals.
  - Vary between light and dark across generations.
- No direct quote recorded; the fetch returned a paraphrase only.

#### Anthropic, `frontend-design` skill (fetched; repo history checked with `gh api`)
- URL: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- History: added around 2025-12 (commits ef740771ac and 00756142ab), rewritten 2026-06-09 (#1293), and rewritten again 2026-09-03 as "avoid generic design defaults" (#1713).
- **2025 version.** NEVER use Inter, Roboto, Arial or system fonts, purple gradients on white, or predictable layouts. Never converge on Space Grotesk across generations. Vary light and dark themes.
- **Current version (2026-09) bans the "second-order" defaults** that replaced the first wave:
  - Colour and theme:
    - Cream ground near #F4F1EA with a high-contrast serif and a terracotta accent near #D97757.
    - Near-black with a single acid-green or vermilion accent.
    - Broadsheet styling: hairline rules, zero radius, dense columns.
  - Components:
    - The SaaS card kit: identical rounded cards, one radius, `rgba(0,0,0,.1)` shadow, gradient washes.
    - A hero built from a big number, a small label, supporting stats and a gradient accent.
  - Typography and labels:
    - 01/02/03 markers on content that is not a sequence.
    - One word in a headline accented with italic, bold or colour.
    - ALL-CAPS tracked eyebrows, and monospace for small data labels.
    - Decorative outlines, borders, eyebrows and dividers.
  - Copy chrome:
    - Meta strings joined with middle dots ("A · B · C").
    - "WORD — fragment" labels.
    - "→" appended to links and buttons.
  - Motion: fade-and-slide-up on every section, and hover transitions on every card.
- **Positive rules.**
  - Process: write a plan first (4–6 named hex colours, type roles, an ASCII wireframe), then review the plan for generic defaults.
  - Composition: open the hero with the most characteristic thing in the subject's world. Make one element the bold choice and keep the rest restrained.
  - Typography: one font family, or two clearly distinct ones. Lines under 80 characters. More leading for serif body text.
  - Quality floor: responsive layout, visible focus, reduced motion respected, accessible contrast.
  - Copy: sentence case, CTAs named as actions ("Save changes"), errors that say what to do without apologising.

#### Vercel, Web Interface Guidelines (fetched)
- URLs: https://vercel.com/design/guidelines and https://github.com/vercel-labs/web-interface-guidelines (`AGENTS.md`, `command.md`).
- Changelog announcing the agent command: https://vercel.com/changelog/web-interface-guidelines-now-available-as-an-agent-command. Search reported it as about 311 days old, which puts it around early 2026; the exact date was not verified.
- Credits: Vercel. The page thanks Paco, Adam, Jimmy and others. The guidelines grew out of Rauno Freiberg's and Paco Coursey's interface notes; that lineage is inferred from the content and credits.
- A craft and quality checklist rather than an anti-slop list. Full rule list in **Part D**. Highlights:
  - Hit targets of at least 24px (44px on mobile), and mobile inputs of at least 16px.
  - Never `transition: all`. Animate only `transform` and `opacity`. Honour `prefers-reduced-motion`.
  - `tabular-nums` for compared numbers, curly quotes, `…` rather than "...", `text-wrap: balance`, and non-breaking spaces in units.
  - Layered shadows, semi-transparent borders, nested radii, hue-tinted borders and shadows, APCA contrast, `color-scheme: dark`, and `theme-color`.
- Copywriting rules (Vercel-specific):
  - Active voice, second person, "&" over "and".
  - Numerals for counts, and a space or NBSP between a number and its unit.
  - Title Case for product headings and buttons, sentence case on marketing pages.
  - Positive language, and errors that tell the user how to fix the problem.
- Quote: these sections "reflect Vercel's brand & product choices".

#### Vercel, `agent-skills` repo (search-only, plus the skills.sh listing)
- URL: https://github.com/vercel-labs/agent-skills
- `web-design-guidelines`: fetches the live `command.md` before every review and reports findings as `file:line`.
- `react-best-practices`: 40–70 performance rules in 8 categories (sources disagree on the count).
- No dedicated anti-slop aesthetic skill was found in this repo.

#### Vercel, "Teaching agents product design at Vercel" (fetched)
- URL: https://vercel.com/blog/teaching-agents-product-design-at-vercel
- Date: 2026-06-25. Author: John Phamous.
- **Skills.** A `product-design` router with five modes (Shape, Implement, Review, Copy, Harden) and a `design-guidelines` skill that holds the Geist rules. The Geist skill's contents are not public in the post.
- **Principles:**
  - Evidence over taste.
  - Design every reachable state.
  - Never claim visual verification from code alone.
  - Use hierarchy, spacing and alignment before adding containers.
  - Avoid decorative novelty unless it clarifies structure or state.
- **Deterministic lint rules:**
  - No nested modals.
  - Radio buttons over a select for 2–3 static options.
  - Accessible names on icon buttons.
  - No custom focus rings that bypass the shared focus tokens.
  - No `className` overriding a design-system component's colour, radius or shadow.
  - No raw shadows.
  - No spacing off the 4px grid.
  - Destructive CTAs named Verb + Noun, never "Confirm" or "OK".

#### v0 system prompt (search-only; leaked or community copies, not official)
- URLs:
  - https://gist.github.com/jasonkneen/22289f24ce343b1a33e1b163f834ea6d
  - https://leaked-system-prompts.com/prompts/v0/v0_20250428
  - https://vercel.com/blog/how-to-prompt-v0 (official prompting guide, not fetched)
- The leaked copies tell the model to avoid indigo or blue unless the user asks for them.
- They also require semantic Tailwind variable colours (`bg-primary`), shadcn/ui, and lucide-react.
- The rules sometimes attributed to v0 ("3–5 colours", "max 2 font families") were **not verified** in any source found.

#### Google, DESIGN.md format (fetched)
- URL: https://github.com/google-labs-code/design.md (also hosted at stitch.withgoogle.com)
- Google Labs, Apache-2.0, version "alpha". Search reported publication on 2026-04-10; the repo page shows no date.
- **What it is:** YAML design tokens plus Markdown rationale, in canonical sections:
  1. Overview
  2. Colors
  3. Typography
  4. Layout
  5. Elevation & Depth
  6. Shapes
  7. Motion
  8. Voice & Content
  9. Components
  10. Do's and Don'ts
- **Linter rules (useful as mechanical checks):**
  - `broken-ref`
  - `missing-primary`
  - `contrast-ratio`: component background/text pairs below 4.5:1
  - `orphaned-tokens`
  - `missing-typography`
  - `section-order`
  - `unknown-key`
  - `token-like-ignored`
  - `missing-sections`, `token-summary`, `omitted-rules`
- Quote: "a persistent, structured understanding of a design system".

#### Google, `stitch-skills` repo (fetched via `gh api`)
- URL: https://github.com/google-labs-code/stitch-skills (last plugin commit 2026-08-13)
- Skills: `design-md`, `extract-design-md`, `enhance-prompt`, `taste-design`, `generate-design`, `shadcn-ui`, `react-components`, `stitch-loop`, and others.
- **`taste-design` SKILL.md** (plugins/stitch-utilities/skills/taste-design) is the most explicit anti-slop list from a big vendor. Its overview says it ports "battle-tested anti-slop frontend engineering directives"; content matches Leonxlnx/taste-skill.
- Colour:
  - At most one accent, below 80% saturation.
  - "AI Purple/Blue Neon" banned: no purple button glows, no neon gradients.
  - No pure #000000, and no warm/cool grey mixing.
- Type:
  - Inter banned in premium or creative contexts; Geist, Outfit, Cabinet Grotesk or Satoshi instead.
  - Generic serifs (Times, Georgia, Garamond, Palatino) banned. Serif banned in dashboards.
  - Body text at most 65ch.
- Layout:
  - Centred hero banned when variance is above 4.
  - "3 equal cards horizontally" banned.
  - `min-h-[100dvh]` rather than `h-screen`.
  - No overlapping elements.
  - 44px touch targets and no horizontal scroll on mobile.
- Hero:
  - No "Scroll to explore" text, scroll arrows or bouncing chevrons.
  - At most one primary CTA, with no secondary "Learn more".
- Banned list:
  - Emojis anywhere.
  - Neon or outer glows.
  - Excessive gradient text.
  - Custom cursors.
  - Generic names ("John Doe", "Acme", "Nexus").
  - Fake round numbers ("99.99%").
  - Fabricated metrics and "BY THE NUMBERS" sections.
  - `LABEL // YEAR` formatting.
  - Clichés: Elevate, Seamless, Unleash, Next-Gen.
  - Broken Unsplash links.
- **Contradiction worth noting:** the same skill asks for "perpetual micro-interactions" (pulse, typewriter, shimmer), which impeccable and avoid-ai-design flag as tells.

#### Google, Gemini or AI Studio design guidance (not found)
- No official Google page on Gemini frontend design or anti-slop guidance was found.
- Results were community Gemini CLI skills (for example https://github.com/evandrodemuth/frontend-design-gemini-skill) and third-party blogs (for example https://www.banani.co/blog/gemini-3.1-for-web-and-ui-design). Treat these as community, not Google.

#### OpenAI, "Designing delightful frontends with GPT-5.4" (fetched)
- URL: https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4
- Date: around March 2026; secondary sources say 2026-03-20, and the page text gives none.
- Comes with a Codex `frontend-skill`. Not one of the requested players, but it is the closest peer guideline from another major vendor.
- Cards:
  - Default to no cards, and never cards in the hero.
  - A card only when it contains a user interaction.
  - No dashboard card mosaics.
- Clutter (banned): stat strips, icon rows, pill clusters ("pill soup"), logo clouds, floating dashboards, and carousels that do not advance the story.
- Hero and page:
  - First viewport limited to brand, one headline, one sentence, one CTA group and one dominant image.
  - No badges or chips on hero media.
  - One H1, at most six sections.
  - Treat the first viewport as a poster.
- Typography: no Inter, Roboto, Arial or system stacks; at most two typefaces.
- Colour: one accent; no purple-on-white, purple bias or dark-mode bias; no decorative gradients behind product UI.
- Copy: product language, no aspirational hero lines, cut about 30% of the copy.
- Product UI: "Linear-style restraint".
- Quote: "Treat the first viewport as a poster, not a document."

#### shadcn/ui official skill (fetched)
- URL: https://github.com/shadcn-ui/ui/tree/main/skills/shadcn (`npx skills add shadcn/ui`)
- A component-usage policy, not a taste guide:
  - Semantic tokens (`bg-primary`) rather than raw palette colours (`bg-blue-500`), and no manual `dark:` overrides.
  - `gap-*` rather than `space-*`, and `size-*` for equal width and height.
  - No `className` overriding component colour or typography.
  - Use Alert, Empty, Skeleton and Badge rather than hand-rolled versions.
- For brand work: map brand tokens onto the shadcn variables, and pin radius, shadows and fonts. This is the official answer to "untouched shadcn defaults".
- No taste or "slop" notes on ui.shadcn.com were found.

#### Rauno Freiberg (fetched)
- "Invisible Details of Interaction Design", https://rauno.me/craft/interaction-design, July 2023:
  - Interruptible animations.
  - Lightweight actions fire mid-gesture; destructive actions wait for the gesture to end.
  - Frequent actions (command and context menus) skip entrance animation.
  - Popovers launch from their source.
  - Fitts's law: radial menus, screen corners as infinite targets.
  - Scroll must not be captured by windows the pointer passes over.
- "Interfaces" notes, https://github.com/raunofreiberg/interfaces (README), which overlap heavily with Vercel's list:
  - Animations at most 200ms. Dialogs scale from about 0.8 and buttons press to about 0.96, never from 0.
  - No transitions on theme switch.
  - `tabular-nums`, no font weights below 400, `clamp()` headings.
  - `@media (hover:hover)` for hover styles, inputs of at least 16px.
  - `pointer-events: none` on decorative glows and gradients.
  - Box-shadow focus rings, no tooltips on disabled buttons, no dead zones between list items.
  - Pause off-screen loops, unset the gradient on `::selection` for gradient text.
- Neither page addresses AI slop directly.

#### Emil Kowalski, `skills` repo (fetched `emil-design-eng/SKILL.md`)
- URL: https://github.com/emilkowalski/skills (also `review-animations/STANDARDS.md`); tips page https://emilkowal.ski/ui/7-practical-animation-tips
- Animate or not:
  - Nothing used 100+ times a day, and nothing keyboard-initiated.
- Easing:
  - Enter/exit uses ease-out; on-screen motion uses ease-in-out; hover and colour use ease; constant motion uses linear.
  - Never ease-in on UI.
  - Custom ease-out `cubic-bezier(0.23,1,0.32,1)`.
- Durations:
  - Under 300ms, except modals and drawers.
  - Press feedback 100–160ms, tooltips 125–200ms, dropdowns 150–250ms.
  - Exit faster than enter.
- Transforms:
  - `:active` scale 0.95–0.98.
  - Never animate from `scale(0)`.
  - Popover `transform-origin` at the trigger.
- Sequencing and tooltips:
  - Stagger 30–80ms, never blocking input.
  - Delay the first tooltip; open adjacent tooltips instantly.
- Performance and accessibility:
  - Only `transform` and `opacity`.
  - Hover animations behind `(hover:hover) and (pointer:fine)`.
  - Under reduced motion, drop movement and keep opacity changes.
- Springs: bounce 0.1–0.3, avoided in most UI.

#### Linear-style critique (search-only)
- LogRocket, "Linear design: the SaaS design trend that's boring and bettering UI", https://blog.logrocket.com/ux-design/linear-design/: dark mode, gradients and flat surfaces imitated until products look alike. It notes Linear's own site later dropped gradients and most colour.
- 925 Studios, https://www.925studios.co/blog/linear-design-breakdown-saas-ui-2026, and uiscanner, https://uiscanner.com/blog/linear-design-language-explained: copies miss the actual system (near-black surface stack, exactly one accent, one tightly tracked display face).
- avoid-ai-design names the copied "Linear glow" (M3): a dark hero with a blurred animated gradient behind the product shot.

### Anti-slop skills, linters and detectors

#### Impeccable, Paul Bakaus (fetched site; registry read from repo)
- URLs: https://impeccable.style, https://impeccable.style/docs/detector, https://github.com/pbakaus/impeccable
- No launch date found.
- **Tooling:**
  - `npx impeccable`, and `/impeccable hooks on` for a deterministic hook on agent edits (no model call).
  - A CLI for CI with exit codes, and a Chrome extension.
  - Drift checks against a local DESIGN.md.
- **Full registry of 62 rules** (`crates/live/assets/antipatterns.json`):
  - **slop:**
    - side-tab
    - border-accent-on-rounded
    - overused-font: Inter, Roboto, Fraunces, Geist, Plus Jakarta Sans, Space Grotesk
    - flat-type-hierarchy: heading/body steps below 1.25x
    - gradient-text: `background-clip:text` with a gradient
    - ai-color-palette: purple/violet gradients, cyan on dark
    - cream-palette
    - nested-cards
    - monotonous-spacing
    - bounce-easing
    - pulsing-dot
    - blinking-cursor
    - shape-assembled-illustration
    - dark-glow: zero-offset chromatic halo, or a coloured blurred shadow on dark
    - radial-halo
    - radial-spotlight-glow
    - marquee
    - icon-tile-stack: rounded-square icon above a heading
    - italic-serif-display: Fraunces, Recoleta, Playfair, Newsreader italic
    - hero-eyebrow-chip
    - kicker-above-heading
    - numbered-section-labels
    - em-dash-overuse: at least 8 em dashes at about 1 per 500 words, advisory
    - marketing-buzzword: streamline, empower, supercharge, world-class, enterprise-grade, next-generation, cutting-edge
    - aphoristic-cadence: "X. No Y." or "Not a feature. A platform." three or more times
    - oversized-h1: a full-sentence display headline
    - extreme-negative-tracking
    - gpt-thin-border-wide-shadow
    - repeating-stripes-gradient
    - codex-grid-background
    - theater-slop-phrase
  - **quality:**
    - organic-clip-path
    - buried-raster
    - hard-offset-shadow
    - broken-image
    - script-error
    - content-hidden-at-rest
    - edge-flush-cards
    - text-occlusion
    - first-viewport-column-overflow
    - gray-on-color
    - low-contrast
    - line-length (above about 80ch)
    - cramped-padding
    - body-text-viewport-edge (under 16px, or 12px at 480px and below)
    - tight-leading (under 1.3)
    - skipped-heading
    - heading-rhythm
    - justified-text
    - straggler
    - unbalanced-heading
    - tiny-text (under 12px)
    - undersized-ui-text (under 11px)
    - all-caps-body
    - wide-tracking (above 0.05em on body)
    - text-overflow
    - repeated-container-text
    - clipped-overflow-container
    - design-system-font, design-system-color, design-system-radius, design-system-font-size
- **Thresholds read from `crates/core/src/checks/rules.rs`:**
  - Purple test: hue 250–320°.
  - Gradient-text purple: hue 260–310° on h1–h3 or large saturated text.
  - Type hierarchy minimum step: 1.25.
  - Side accent counts only when the opposite corners have radius of at least 4px.
  - A shadow within a small hue distance of its surface counts as shade, not glow.

#### avoid-ai-design, funboy322 (fetched README and `references/ai-tells-catalog.md`)
- URL: https://github.com/funboy322/avoid-ai-design
- 81-entry catalog with IDs, plus `scripts/detect.mjs`: zero dependencies, P0–P2 severities, "template stack" at 6 or more tells, a Claude Code PostToolUse hook, exit code 2 on P0/P1.
- **Second-order defaults:**
  - SD1 cream + terracotta
  - SD2 near-black + neon accent
  - SD3 broadsheet cosplay
  - SD4 template chrome (tracked caps, middots, "WORD — fragment", arrows)
  - SD5 accented headline word
  - SD6 01/02/03
  - SD7 fake window traffic lights
  - SD8 emerald fallback accent
  - SD9 slate, espresso or sand palettes
- **Typography:**
  - T1 Inter or system stack only
  - T2 the "tasteful free font" cluster (Space Grotesk, Geist, Syne, Sora, Instrument Serif, Fraunces, Cal Sans)
  - T3 serif italic word
  - T4 untouched Geist on Next.js
  - T5 caps eyebrows
  - T6 flat scale
  - T7 font declared but not loaded
- **Colour:**
  - C1 135deg indigo-to-blue gradient
  - C2 indigo-600 or violet-500 CTAs
  - C3 purple dark theme
  - C4 timid even palette
  - C5 coloured glow shadows (`shadow-indigo-500/50`)
  - C6 gradient headline text
  - C7 unrequested dark mode
  - C8 primary and accent within 20° of hue
  - C9 muted text below AA
  - C10 one-note palette
  - C11 orbs and blobs (`blur-3xl`)
- **Layout:**
  - L1 centred hero with pill
  - L2 three icon cards
  - L3 trend bento
  - L4 stat or proof strip
  - L5 1-2-3 how-it-works
  - L6 every section in the same max-width
  - L7 "Most Popular" ring
  - L8 four-column footer
  - L9 stock section order (silhouette test)
  - L10 faint grid or dot background (`bg-grid`, `DotPattern`)
  - L11 big number as hero (56px or more)
- **Components:**
  - K1 untouched shadcn
  - K2 large radius and shadow everywhere
  - K3 reflexive glass
  - K4 coloured stripe on cards
  - K5 pill badge above title
  - K6 icon in tinted chip
  - K7 missing states
  - K8 default radius token
  - K9 zinc-950 card with white/10 border
  - K10 Aceternity or Magic UI effects (Spotlight, Beams, Meteors, Border Beam, Shimmer Button)
  - K11 cards in cards
  - K12 status-chip soup
  - K13 pulsing dot
  - K14 checks in tinted circles
- **Spacing:** S1 uniform padding.
- **Motion:**
  - M1 same fade-up everywhere
  - M2 scattered micro-interactions
  - M3 Linear glow
  - M4 bounce or elastic easing
  - M5 count-up stats
  - M6 no reduced-motion handling
  - M7 typewriter headline
  - M8 every card lifts on hover
  - M9 logo marquee
- **Icons:**
  - I1 untouched Lucide
  - I2 emoji icons
  - I3 the overused glyph set (Sparkles, ArrowRight, Zap, Rocket, Shield, BarChart3, Check, Star)
- **Copy:**
  - CP1 vague aspirational headline
  - CP2 superlatives (seamless, cutting-edge)
  - CP3 arrow glyphs
  - CP4 three-adjective slogans
  - CP5 Title Case everywhere
  - CP6 generic CTAs ("Get started", "Learn more")
  - CP7 "not X, Y" slogans
  - CP8 unsourced user counts
- **Imagery:**
  - IM1 stock team at a laptop
  - IM2 glossy 3D blobs
  - IM3 Corporate Memphis
  - IM4 placeholder avatars and faces
  - IM5 five-star rows
- **Fingerprints:**
  - F1 generator meta or tagger left in
  - F2 section-label comments
- **Cross-page:** X1 design drift across pages.

#### Adrian Krebs, "Scoring Show HN submissions for AI design patterns" (fetched)
- URLs: https://www.adriankrebs.ch/blog/design-slop/ and https://github.com/AdrianKrebs/ai-design-checker
- Date: 2026-04-20.
- **Method:** Playwright plus deterministic DOM/CSS checks, no LLM, on 1,590 Show HN landing pages.
- **Results:** 22% high (4 or more patterns), 32% medium (2–3), 46% low (0–1). About 5–10% false positives on manual QA.
- **HN discussion:** reportedly 333 points and 235 comments, per Developers Digest; not verified.
- **Patterns in the post:**
  - Inter everywhere.
  - Space Grotesk, Instrument Serif or Geist pairings.
  - Serif italic accent word.
  - "VibeCode Purple".
  - Permanent dark mode with grey body text and caps labels.
  - Low-contrast dark body text.
  - Gradients everywhere.
  - Large coloured glows.
  - Centred generic-sans hero.
  - Badge above the H1.
  - Coloured top or left card border.
  - Identical icon-topped cards.
  - 1-2-3 steps.
  - Stat banner.
  - Emoji nav icons.
  - All-caps headings.
  - shadcn/ui.
  - Glassmorphism.
- **Repo table (14 patterns):**
  1. Templated display fonts (Space Grotesk, Instrument Serif, Geist, Syne, Fraunces)
  2. Hero font mix
  3. Vibe purple
  4. Gradients
  5. Accent stripe
  6. Glassmorphism
  7. Coloured glow
  8. Emoji nav
  9. Centred + Inter
  10. Perma dark
  11. Numbered steps
  12. Stat banner
  13. Headline badge
  14. FAQ accordion with 3 or more items

#### `sameness-lint`, Polydraft (fetched)
- URL: https://dev.to/polydraft/every-vibe-coded-site-looks-the-same-i-wrote-a-linter-for-the-default-look-2g0p
- Author: Vincent, writing for Polydraft. Dated Nov 19, year not shown. Repo URL not given.
- About 140 lines of Python. Rule weights total 100. Exact heuristics:
  - **default-font (12):** every declared font is in {Inter, system-ui, Roboto, Helvetica, Arial, …}, or no font is declared.
  - **purple-gradient (14):** Tailwind `from-{violet|indigo|purple|fuchsia}` to `{blue|indigo|cyan|sky|purple|pink}`, or a CSS `linear-gradient` whose 2 or more hex colours all have hue 200–300° and saturation above 0.4.
  - **glass (8):** `backdrop-blur` or `backdrop-filter: blur` within 200 characters of `bg-white/N` or `rgba(255,255,255,…)`.
  - **card-grid-3 (10):** `grid-cols-3` followed within 1,500 characters by 3 or more `rounded-2xl` or `rounded-3xl`.
  - **icon-cards (8):** a lucide import, `data-lucide`, or an emoji (U+1F300–1FAFF, U+2600–27BF) right after an `h3`, `div` or `span` opening tag.
  - **logo-bar (8):** "trusted by", "loved by" or "backed by" near `grayscale` or `opacity-10`…`60`.
  - **centered-hero (10):** an `h1` with `text-center` nearby and 2 or more generic CTAs ("get started", "learn more", "book a demo").
  - **buzzwords (3 per hit, capped at 12):** 17 phrases including supercharge, seamless, unlock, streamline.
  - **same-rhythm (8):** at least 75% of 3 or more `<section>` elements share the same `py-*`.
  - **stock-proof (10):** pravatar.cc, randomuser.me, ui-avatars.com, John or Jane Doe, Acme, Lorem ipsum, and ★★★★★.

#### Koso "AI Slop Detector" (fetched)
- URL: https://koso.ai/agents/ai-slop-detector (Koso / Ideanab, © 2026)
- 34 weighted tells, with an LLM judgement worth 40% of the index:
  - **Colour and effects:**
    - Purple gradient (+3)
    - Gradient headline (+2)
    - Purple buttons (+2)
    - Glows and blobs (+2)
    - Frosted glass (+2)
    - Dark mode with neon (+2)
    - Graph-paper background (+1)
    - Cream background (+1)
    - Body text below AA (+2)
  - **Type:**
    - Default font (+2)
    - Fashionable font (+1)
    - Italic serif accent word (+1)
    - Headline tracking tighter than −0.04em (+1)
    - Tiny all-caps labels (+1)
  - **Layout:**
    - Badge above headline (+2)
    - Centred hero stack (+2)
    - Icon-on-top cards (+2)
    - Three identical cards (+1)
    - Bento grid (+2)
    - Coloured card stripe (+1)
    - Big-number row (+1)
    - 1-2-3 steps (+1)
    - Grey logo wall (+1)
    - Emoji icons (+1)
    - Sparkles for AI (+1)
    - Endless motion (+1)
  - **Copy:**
    - Em dashes (+1)
    - 3 or more buzzwords (+2)
    - Placeholder text (+3)
    - Headline does not state "does X for Y" (+2)
    - Slogans in threes (+1)
    - "Not just X, it's Y" (+1)
  - **Finish:** no OG image or favicon (+1).
- Subtractions (−4 each): characterful type, real product shots, specific copy, own layout.
- Bands: 0–19 clean, 20–39 a few tells, 40–59 templated, 60–79 heavy slop, 80–100 pure slop.

#### Uncodixfy, cyxzdev (fetched SKILL.md)
- URL: https://github.com/cyxzdev/Uncodixfy
- Targets the "Codex UI" look. Aims for "Keep It Normal" (Linear, Raycast, Stripe, GitHub).
- **Banned:**
  - Layout and chrome:
    - Radii of 20–32px everywhere, pills everywhere.
    - Floating glass shells.
    - A sidebar around 280px with a brand block on top.
    - Eyebrow labels.
  - Effects:
    - Soft corporate gradients.
    - Dramatic shadows.
    - Blue-black "premium dark" with cyan accents.
  - Data and status:
    - KPI 3-card grid as the default.
    - Donut charts with vague percentages.
    - `::before` coloured status dots.
    - Gradient-fill progress bars.
    - Tag badges on every table row.
    - "Live" nav badges.
  - Motion and copy:
    - Hover `translateX` on nav links.
    - Decorative mini-notes explaining the UI.
- **Positive caps:**
  - Buttons radius ≤ 10px, cards ≤ 12px, badges 6–8px.
  - Shadows no stronger than `0 2px 8px rgba(0,0,0,.1)`.
  - Transitions 100–200ms on opacity or colour only.
  - Spacing scale 4/8/12/16/24/32.
  - Sidebar 240–260px.

#### taste-skill, Leonxlnx (search-only; the Google `taste-design` skill above is a port)
- URL: https://github.com/Leonxlnx/taste-skill
- Review page: https://mer.vin/2026/07/taste-skill-explained-anti-slop-agent-skills-for-ai-frontend-design/
- Dials for DESIGN_VARIANCE, MOTION_INTENSITY and VISUAL_DENSITY.
- Bans:
  - AI purple and mesh gradients, dark glows.
  - Decorative status dots, hand-rolled SVG illustration.
  - Three equal cards, repeated left/right zig-zag.
  - Numbered eyebrows, fake version labels, scroll cues.
  - Em dashes.
- Discourages Inter.

#### Other detectors (fetched, light detail)
- **is-it-vibecoded**, https://is-it-vibecoded.vercel.app/: purple gradients, the cream/terracotta "Claude look", badge above headline, three-icon cards, em dashes, and builder fingerprints (Lovable, v0, Bolt).

### Articles and posts

Fetched unless noted.

- **925 Studios**, https://www.925studios.co/blog/ai-slop-design-tells (2026-11-11 or 2026-06-14):
  - Inter by default.
  - Indigo-to-purple gradients, traced to Tailwind's indigo-500.
  - Three rounded cards, traced to Tailwind tutorials.
  - Weightless copy ("Build faster. Ship smarter."), generic line icons, rounded corners with soft shadows.
- **Rottoways**, Kadir Calik, https://rottoways.com/blog/ai-generated-website-looks-generic (2026-11-06):
  - Purple-blue hero.
  - 3-card grid.
  - Inter 700 headlines.
  - Centred everything.
  - Gradient "Most popular" pill.
  - Lucide checks in tinted circles.
  - DiceBear avatars.
  - 5-star rows.
- **ShipThemes**, Vas, https://shipthemes.com/blog/avoid-ai-slop-on-ai-built-websites (2026-10-22):
  - Default fonts.
  - Blue-purple gradients, from Tailwind UI's indigo buttons.
  - Centred hero with badge and 3 icon cards.
  - Same radius and shadow everywhere, cards in cards.
  - Grey on colour.
  - Identical section spacing.
  - The "2026 style": cream, rust, italic serif, news tickers.
  - "Build the future" and "not just X but Y" copy.
  - Plastic AI illustration.
- **Joshua Snoddy**, https://www.joshuasnoddy.com/blog/why-ai-websites-look-the-same/ (2026-07-13):
  - Purple gradient, Inter, glass cards, centred everything.
  - Stock shadcn and `rounded-2xl` (neutral defaults accepted unchanged).
  - Emoji or rocket/bolt icons.
- **No-Code Supply**, Lauri Lännenmäki, https://no-code.supply/blog/is-your-website-ai-slop/ (2026-10-13):
  - Visual: glowing blob, pill badge, gradient key word, one sans in one weight, caps caption above every heading, 3 cards then bento then 3 cards.
  - Copy: vague headlines ("Elevate your workflow"), everything in threes, emoji bullets.
  - Fake claims: fake logo walls, AI headshots, "10x faster", "Trusted by 10,000+ teams".
  - Unchecked basics: grey on white, no focus, dead `#` links, lorem ipsum.
- **uxskill (Laith Aljunaidy)**, https://uxskill.laithjunaidy.com/what-is-ai-slop.html (© 2026):
  - Violet-indigo gradient.
  - Three equal cards ("symmetry without a hierarchy decision").
  - Inter only.
  - Emoji icons (ignore `currentColor`, render inconsistently).
  - Bento or uniform grid.
  - Uniform shadows and radii.
  - Marketing density on app screens.
  - Stock hero under a dark scrim.
  - "Built for modern teams" copy.
- **Developers Digest**, https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it (2026-04-22, updated 2026-10-06): the 16 Krebs patterns, plus shadcn defaults and glass as the CSS fingerprints.
- **CodeMySpec**, John Davenport, https://codemyspec.com/blog/vibe-coded-websites-look-the-same (2026-07-26):
  - Tells: stock section order (hero, features, social proof, pricing, FAQ, footer), two-noun feature names ("Seamless Integration").
  - Mechanism: shadcn ships a near-black primary, not purple; the model fills the blank with indigo from tutorials.
  - Mechanism: prompting away from slop moves output to the next cluster (cream, serif, terracotta).
- **Falia**, Geneviève Cyr, https://falia.co/en/insights/web-design/spot-ai-built-website/ (2026-10-22):
  - Claude-era tells: serif with terracotta ("the Claude look"), near-black with acid accent, newspaper layout, template chrome, 01/02/03, fade-in everywhere.
  - Codex-era tells: floating heavy-shadow panels, pills everywhere, frost and glow, stat-card grids, fake status dots, muted caps labels, hover lift.
- **prg.sh**, https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website (2025-10-26):
  - Tells: Inter or Roboto, purple accents, centred hero CTA, three icon boxes, white/grey backgrounds, rounded faint shadows, missing validation and error states.
  - Mechanism: Tailwind demos made "modern = purple".
- **Adam Wathan's indigo-500 "apology"** (search-only): about 2025-08-07 on X, a semi-joking apology for making Tailwind UI buttons indigo-500 five years earlier. Only secondary reports were found (https://news.aibase.com/news/20365, https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p). **The original post was not verified.**
- **yuwen lu**, "Signs of vibe coded UI", https://x.com/yuwen_lu_/status/2041187936738447565: X returned 402. Per a search snippet, it observes the cream/serif tell is skewed to Claude. **Content not verified.**
- **Sparkles as the AI icon** (search-only): https://en.wikipedia.org/wiki/Sparkles_emoji notes ✨ became an AI marker in the mid-2020s.
- **Reddit:** no specific thread found by search. **Not verified.**

## Gaps and unverified items

- **Google:** no official Gemini, AI Studio or Material "design with AI" anti-slop guidance found. Google's material is the DESIGN.md format plus the stitch-skills repo, whose `taste-design` is a port of a community skill.
- **v0:** current official system-prompt design rules not verified. Leaked 2024–2025 copies only ("avoid indigo or blue unless asked").
- **Vercel Geist `design-guidelines` skill:** contents not public.
- **Adam Wathan's indigo-500 post:** original not retrieved; secondary reports only.
- **Krebs HN thread:** points and comment counts not verified.
- **yuwen lu X thread:** not readable (402).
- **Reddit:** no specific threads found.
- **sameness-lint:** repository URL not given in the article.
- **Impeccable:** launch date unknown. The 62-rule list comes from the repo's `antipatterns.json` at the time of fetch.
- **Font advice conflicts across sources:** GOO and TS recommend Geist and Satoshi, which IMP, AAD and KRB flag as the new defaults. Title Case: VER requires it for product UI, while AAD and ANT prefer sentence case. Motion: GOO asks for perpetual micro-loops, while IMP and AAD flag pulsing and typewriter effects. A detector should weight these low or make them configurable.
