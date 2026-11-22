<!-- Generated from packages/core/src/tools/prompts/anti-slop.md. Do not edit; run bun run generate:authoring-reference. -->

# Anti-slop

Find what makes a design look machine-made and remove it. Use this on a finished page, or
before drawing as a list of what to avoid. Other skills rely on this catalogue.

Why it happens: asked for "a landing page" with no direction, a model draws the average of
every page it has seen, made of framework defaults nobody changed. Banning the first wave of
defaults (purple gradients, Inter, glass) only moves it to the next one (cream, a serif in
italics, a terracotta accent, monospace labels). So the cure is not a longer list of bans; it is
a decision the template could not have made, taken from this project's own world.

None of these is forbidden by itself. Each is a default: something that appears when nobody
decided. One, chosen on purpose and supported by the direction, can stay. Three together mean
the page was not designed. People who judge pages say the same: a hero with text on the left and
a picture on the right is fine; with the usual gradient, the usual rounded cards and a "Get
started" button, it reads as generated.

## How to use it

1. Take an image of the frame (`get_screenshot`). Look at it small and blurred first: is there one clear focal
   point, are there two or three levels of importance, do sections differ from each other?
   A page that fails here is not saved by fixing details.
2. Go through the lists below and write down every sign you find, with the layer's name. Where
   a sign has a measure in brackets, check it with `get_computed_styles` or the layer's CSS
   rather than by eye. Run the `lint` tool on the frame too: it measures several of them.
3. For each: is it a decision the direction supports? If yes, leave it and say why. If no,
   replace it, do not just delete it. An empty slot gets filled by the next default.
4. Take a new image and compare.

If there is nothing to find, say so. Suggest two or three refinements at most; do not invent
problems.

## Type

- A display face everyone uses, chosen because it was there: Inter, Roboto, Arial, Open Sans,
  Lato or the system face alone on the page; or the faces that replaced them, such as Space
  Grotesk, Geist, Instrument Serif, Fraunces, Syne or Plus Jakarta Sans.
- Sizes too close together: nothing looks clearly bigger than anything else (less than 1.25
  times between two levels).
- A gradient inside the letters of a heading or a number.
- One word of a heading in another color, in italics or in a serif.
- A huge italic serif headline as the whole idea of the hero.
- A small label in spaced capitals above every heading (the `lint` tool reports it as
  tracked-caps-eyebrow).
- A monospace face on labels to look technical.
- The heaviest weight on every heading, or headlines squeezed tighter than -0.04em.
- Huge condensed capitals set tight as the hero: a narrow face in capitals with letter
  spacing below -0.03em, or a line height under 0.95 once the heading wraps (the `lint` tool
  reports both as heading-tracking).
- Every Word Of Every Heading In Capitals.
- A lot of small text: captions, hints and fine print under everything.
- Numbers that do not line up in a column.
- Straight quotes, three dots instead of an ellipsis.
- A font named in the styles that never loads.

## Color

- Purple to blue, purple to pink, or cyan on a dark page (gradient stops with hues between 250
  and 320 degrees).
- Indigo or violet buttons and links that no brand asked for.
- A dark page with a neon accent and a colored glow.
- Cream background, high-contrast serif and a terracotta accent: the newer default.
- Near black with one acid green or vermilion accent and monospace labels.
- An emerald or teal accent picked because purple was ruled out.
- Signal yellow or amber on navy: an accent between 35 and 60 degrees of hue on a dark blue
  ground (hue 210 to 240, lightness under 25%).
- The sector's cliché as the palette or the ornament: hazard stripes for logistics, a leaf
  green for plants, a shield and a padlock for security, a coffee brown for a café.
- The stock colors of a framework, unchanged.
- Pure black or pure grey beside a brand color.
- Grey text placed on a colored surface, or body text below 4.5:1 contrast.
- The accent on everything, or five tints so timid none reads; a primary and an accent less
  than 20 degrees of hue apart.
- Soft blurred color shapes behind the text: orbs, blobs, halos, a spotlight.
- A faint grid or dot pattern behind the hero as filler.
- A soft drop shadow under everything that has an edge.

## Layout

- Hero, three features, call to action, footer, in that order, with nothing else. Or the longer
  version: logos, features, testimonials, three prices with the middle one ringed, a FAQ, a
  footer in four columns.
- Everything centered from top to bottom (more than half the text blocks).
- A centered hero stack: a pill, a headline, a sentence, two buttons, all centered.
- Three equal cards, each an icon above a title above a sentence.
- A bento grid whose tile sizes mean nothing.
- The same gap and the same divider between every section; every section in the same width.
- A card inside a card.
- A band of large numbers nobody can verify, or a big number as the hero.
- Parallel features numbered 01, 02, 03 as if they were steps.
- A page that does everything: every feature the product has, each with its own block, and
  nothing chosen as the point.
- Clean but empty: a minimal page with nothing of its own. Minimal is not the opposite of
  generic.
- A section made of a heading and one paragraph in a wide empty space.
- Splits that alternate image left, image right, down the page.
- The closing call to action in a boxed dark card split into two columns, with a list of ticks
  on one side and a button on the other.
- In an app: three or four number cards as the first row, a rounded floating sidebar, a
  marketing headline above a table.

## Components

- A thick colored stripe down one side of a rounded card.
- An icon inside a tinted rounded square above each heading.
- Frosted glass cards with a highlight and a colored shadow.
- A colored glow under a button: a blue button floating on a blue shadow.
- Everything a pill. "New" and "Pro" badges on things that are neither. A pill above the hero
  headline that announces nothing.
- The same large radius and the same soft shadow on every surface.
- A thin border and a wide soft shadow on the same card.
- A fake dashboard built from rectangles, shown as the product; a window with three colored
  dots around a made-up panel.
- "Most popular" on the middle price. Exactly three glowing testimonials, each with five stars.
- A tick in a tinted circle at the start of every line.
- A pulsing dot or a "Live" badge on something that is not live.
- Effects copied from a component gallery: spotlights, beams, meteors, a shimmering border.
- Colored dots standing for categories or states where an icon or a word would say it.
- The browser's default blue focus ring, unstyled, on everything.
- A form with no real states: nothing for hover, focus, an error, or after sending.

## Words

- Seamless, effortless, unlock, elevate, supercharge, empower, streamline, unleash, powerful,
  robust, cutting-edge, next-gen, world-class.
- "It's not just X, it's Y." "No X. No Y. Just Z." A heading made of two short fragments.
  Three adjectives with periods: "Fast. Simple. Powerful."
- A headline that could sell anything: "Build the future", "Built for modern teams".
- A tagline that sounds deep and says nothing: "One click behind, one day away".
- A heading that is a category name: "Features", "Why us", "How it works".
- Middle dots strung between short phrases: "Fast · Private · Open". Also bullets, slashes and
  vertical bars used the same way, "WORD — fragment" labels and "LABEL // 2026".
- An arrow typed after every link and button: "Learn more →".
- Dashes in every other sentence.
- Round proof with no source: "10,000+ teams", "3x faster", "99.9%".
- Invented people and companies with the usual invented names: Jane Doe, Acme.
- "Learn more" or "Get started" on a button. "Scroll to explore". A greeting with an emoji as a
  headline.
- Hints nobody needs: "or press Enter", "Anonymous, takes two minutes", next to every action.
- The same fact told in four sections. A closing line that repeats the heading.

## Pictures and icons

- Emoji used as icons. A sparkle for anything involving AI.
- The same handful of line icons, one per card: a bolt, a rocket, a shield, a chart.
- Glossy blobs, glowing orbs, a robot, a brain, flat people with long limbs.
- An illustration assembled from circles and rectangles.
- An empty gradient box where a picture should be.
- A grey placeholder block, or an `img` with no source or a source that does not load (the
  `lint` tool reports it as broken-image).
- Stock photographs standing in for the real product; a random photo under a dark veil.
- A grey row of logos, "Trusted by", with no customer behind it.
- Icons from several sets, in several sizes and line weights.

## Motion

- The same fade upward on every section as it scrolls in.
- Bounce and elastic easing.
- Every card that lifts or tilts on hover, clickable or not.
- Something that pulses without being live. A headline typed letter by letter. A row of logos
  scrolling forever. Numbers counting up.
- Motion that ignores the person's reduced motion setting.

## What to do instead

Removing a default is half the work. Here is what replaces each family.

**Type**

- In place of the common face: one chosen for the world on the direction card. If the project
  has no card, say so; that is the real problem.
- In place of close sizes: a scale where each heading level is at least 1.25 times the next. Make the biggest one
  clearly bigger.
- In place of a gradient or a colored word: make the whole heading work by its wording and its
  size. If one word needs stressing, the sentence should be rewritten around it.
- In place of the label above every heading: nothing, or a sentence-case subtitle below the
  heading. Keep one label on the page, where it adds a fact the heading does not have.
- In place of condensed capitals set tight: a face with its own character in sentence case,
  letter spacing of -0.03em or more, a line height of 0.95 or more, `text-wrap: balance`, and
  a size that leaves the key content on the first screen.

**Color**

- In place of a stock gradient: one flat color, held with confidence across a real area.
- In place of a neon accent on dark: a dark theme built from lighter surfaces, with one
  accent used on one kind of thing.
- In place of pure grey: neutrals that carry a trace of the brand hue.
- In place of yellow on navy or the sector's cliché: the colours of the subject's real
  materials, sampled from a photograph of them: the steel of a container, the ink of an
  invoice, the clay of a pot.
- In place of blurred color shapes: the product, a photograph, or plain space.
- In place of a filler grid: plain ground, unless the dots or lines draw something of the
  project's world.

**Layout**

- In place of hero, three features, call to action: a plan built from this project's
  material. Ask what it has that the template has no slot for.
- In place of everything centered: a left edge that text and pictures share, with one thing
  allowed to break it.
- In place of three equal cards: if the three things are not equally important, show the
  important one large. If they are steps, show a sequence. If they are details, use a list.
- In place of a page that does everything: one job the page is for, shown well; the rest
  linked.
- In place of equal gaps: more space between sections than inside them, and a section that
  matters given more room than one that does not.
- In place of unverifiable numbers: one true fact, stated plainly, or no numbers at all.
- In place of a boxed call to action: open the ending into the page's world. One sentence and
  one button, centered at the scale of a section, with the page's own scenery around them.

**Components**

- In place of the side stripe: a heading, an icon or a different surface, one of them.
- In place of an icon in a tinted square: the icon alone, or no icon. Ask what it adds.
- In place of glass: a solid surface. Use blur only where content really passes behind, such
  as a header floating over the page.
- In place of a glowing button: a flat fill. If it must feel pressable, a darker edge along its
  bottom, like a key.
- In place of pills everywhere: the radius scale from the design system. A block that meets
  the edge of the window has square corners on that side.
- In place of a fake dashboard: the real product, or one real part of it shown large.
- In place of colored dots: the icon or the word that names the thing.
- In place of the default focus ring: a ring drawn for the design, in its accent, that follows
  the radius, shown on keyboard focus.

**Words**

- In place of an adjective: the fact behind it. "Powerful" becomes what it does and how fast.
- In place of a deep-sounding tagline: what the product does, for whom, in plain words.
- In place of small print everywhere: fewer words, at a size people read. Keep a hint only where
  someone would otherwise get stuck.
- In place of a category heading: a sentence that says the point. "Features" becomes "Edit
  the page your developer will ship".
- In place of separators: layout. Put the items in their own places with a gap, on separate
  lines, or each with its icon.
- In place of an invented quote: nothing, or a fact about use that is true.
- In place of "Learn more": the verb and the thing. "Read the pricing", "See a sample file".

**Pictures and icons**

- In place of emoji: icons from one set, or words.
- In place of a decorative illustration: the real thing, photographed or shown as it is.
- In place of a drawn look-alike of the product: real screens captured from it, sharp at
  twice the size, swapped or played where the page needs to show it working.
- In place of the sparkle: a mark that belongs to the page's world, drawn once and used
  everywhere it fits, at different sizes.
- In place of a placeholder box or a broken image: a real photo from `stock_photo`, a visual
  drawn in CSS from the product's own parts, or a layout that needs no picture. Otherwise
  remove the section until there is a picture for it.

**Motion**

- In place of the same reveal everywhere: no motion, and one moment that moves for a reason.
- In place of bounce: an ease that starts fast and settles, under 300 milliseconds.
- In place of a loop that runs forever: small details that live at their own pace, placed the
  same way on every visit, and still when the person asks for reduced motion.

## Make it yours

The opposite of a default is not a quirk; it is a world. A page reads as designed when it could
not be moved to another product without breaking. Kalka's own site is built this way:

- **A world, not a theme.** One place or material carried through every section. On
  kalka.design it is a sky drawn in pixel dots, with clouds made of the dot grid.
- **A sequence that changes the page.** Sections follow a path through that world, so they
  differ in color and density without inventing a new style each time: the site's chapters go
  from day to night, and the last one happens at night.
- **Decoration made of the system.** The ornament is the system's own primitive, not an added
  effect: cloud dots light up and fade, each at the size of the dot under it, from a seeded
  sequence so the sky is the same on every visit, and still with reduced motion.
- **One drawn motif.** A four-point star belongs to that night sky and replaces both the
  sparkle and generic bullets wherever a mark is needed.
- **The real product.** Every feature is shown with real screens of the app, never a drawn
  imitation.
- **Edges that mean something.** The hero runs from edge to edge with square top corners; the
  header floats over the sky as a white glass bar, the one place blur is earned because the
  page really passes behind it.
- **An open ending.** The final call is a sentence and a button centered in the night, not a
  card.

Find the equivalent for each project: its place, its path, its material, its mark.

## How heavy is it

Count the signs, then choose how far to go. Do not redesign what needs a touch.

- **Ten or more, across several families**: the page was never designed. Stop, say so, and go
  back to `/direction`. Fixing details will not help.
- **Four to nine**: fix them in this order: layout, color, type, words, components, pictures,
  motion. Layout first because it changes everything below it.
- **One to three**: replace them and leave the rest alone.
- **None**: say so.

## The floor

These are not taste; a page that misses them is unfinished, whatever its style.

- Body text at least 16 px on the web, lines no longer than about 75 characters, line height
  at least 1.4; no body text in capitals, no letter spacing above 0.05em on it.
- Contrast at least 4.5:1 for text and 3:1 for large text and controls.
- Hit targets at least 24 px, 44 px on a phone.
- A visible focus ring on everything that takes focus.
- Numbers that are compared use tabular figures.
- Curly quotes, a real ellipsis, a non-breaking space between a number and its unit.
- Animations only on transform and opacity, under 300 milliseconds for interface feedback,
  never from a scale of 0, and none for people who ask for reduced motion.
- Every state drawn: empty, loading, error, hover, focus, disabled.
- Spacing on the 4 px scale; a child's corner radius no larger than its parent's.

## Report

List what you found and what you did, grouped as above. Then list what you left on purpose,
with the reason. That second list is what shows the page was decided.
