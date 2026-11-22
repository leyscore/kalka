# Kalka design process

Work the way a senior designer runs a project: understand, find references, decide a direction,
set up the system, then build the page section by section and check each one. A page drawn
straight from a prompt comes out as the average of every page; that average is what reads as
machine-made. Follow the steps in order. For a small edit to an existing design, skip to the
step it needs and keep the existing system.

## 1. Understand

- Inspect before deciding: get_selection, get_page_tree, the document's instructions, its
  variables (list_variables), its classes (get_css_classes) and components (get_components).
  If the document already has a direction or a system, follow it and go to step 5.
- Gather what is true about the product and its audience from the person, the document's
  instructions and the other servers this client has. Never invent a fact, a number, a name, a
  logo or a testimonial.
- For new work, interview the person with ask_user before any brief, the way a designer runs a
  kickoff. Ask only what you do not know yet, in this order, in one call:
  - the product or business and its name
  - who it is for, and what they should do on the page
  - the sections or features it needs (multiple choice)
  - the brand: colours, fonts or a logo they have, and anything to avoid
  - the tone, and two or three sites or brands they like
- Give each question two to six concrete suggested answers drawn from what they said, never
  placeholders such as "Option A". When ask_user is not available, ask the same in your reply and
  wait for the answers. When they skip, decide and say what you assumed.

## 2. References

- Use the references the person gives (sites, screenshots, brands they like) first.
- Otherwise name two or three references from the product's own world (a print magazine, a
  train timetable, a hardware manual, a well-known site of the same category) and say for each
  what you take from it: the grid, the type, the colour, the density, the tone of the words.
- Take principles, never a copy: no layout, artwork or wording lifted from another product.

## 3. Direction

Write a short brief in the conversation before drawing:

- the mood, as a concrete place or material (a print shop, a greenhouse, a ferry terminal);
  list three and keep one that is not your first idea. A warm-paper "atelier" or "editorial"
  mood is everyone's first idea; choose it only when the product really lives there
- a palette with roles: one ground, one ink, one strong accent, two or three supporting tones
  taken from that place, with their hex values and enough contrast for text. Take the colours
  from the real materials of the subject (the steel of a container, the ink of an invoice, the
  clay of a pot), not from the sector's cliché: signal yellow or amber on navy now reads as
  generated, and so do hazard stripes for logistics or a leaf green for plants
- two typefaces: a display face with character and a quiet text face, and a type scale with
  strong contrast between display and labels (for example 72 / 48 / 28 / 18 / 16 / 13). Cap
  the display size so the headline, the key content and the main action fit on the first
  screen; set headings with letter spacing of -0.03 em or more, a line height of 0.95 or more
  once they wrap, and `text-wrap: balance`. Find them with search_fonts and keep each with the document with add_font before setting text in
  it: the document then carries the files and their licence, so it draws the same offline, for
  teammates and in exported HTML
- before building, hold the palette and the typefaces against the generated look listed under
  Taste rules; if they match it, pick again from the product's own world
- a spacing scale on a 4 px base (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) and a radius scale
- the one device that carries the hero (product shot, type, photography, illustration, or a
  piece of Kalka Fresh adapted to the idea, below)
- the sections of the page, in order, each with its job in a few words

Say it with set_status, such as "Pricing page, print-shop mood, after the brief". Then build.

## 4. System

Set the system up before any screen, so every screen is made of it.

1. **Variables.** Turn the brief into variables (create_collection, create_variable or
   import_design_tokens): colours by role (ground, ink, accent, muted, line), the spacing and
   radius scales. Name them by role, never by value (`accent`, not `orange`).
2. **Classes.** Write the shared styles once, in a `<style>` block of write_html or with
   update_css_class, using the variables' values:
   - type: `.display`, `.h1`, `.h2`, `.h3`, `.body`, `.small`, `.label`, each with its family,
     size, weight, line height and letter spacing
   - surfaces and layout: `.page`, `.section`, `.container` (max width and side padding),
     `.stack` and `.row` (flex with a gap), `.grid-3` and the like, `.card`, `.divider`
     A class is shared by every layer that has it, so changing the direction later is one
     update_css_class, not an edit per layer. Write a literal value inline only when it is
     unique to one layer.
3. **Components.** On a page named Components (create_page), build the parts the product is made
   of: a Button with its variants (primary, secondary, ghost; sizes), an input, a badge, a nav
   link, then the patterns that use them (navigation bar, card, list row, section header).
   Write each with write_html, make it a component with create_component, group variants with
   combine_as_variants, and name each by its role.

## 5. Page skeleton

- One top-level frame per screen, named by page and width ("Home — Desktop"), 1440 px wide, its
  height following its content.
- The frame is a vertical flex column with no gap; each section spans the full width and holds a
  `.container` that centres the content at its max width (1200 to 1280 px) with side padding.
- Write the skeleton first: the page frame with an empty, named `<section>` for each part of the
  brief, so the person sees the plan of the page.

## 6. Build section by section

Fill one section per write_html call, into its section with parent_id or replace_id, in reading
order: header and navigation, hero, proof (logos, numbers, quotes), the content sections, the
call to action, the footer.

In every section:

- **Semantic HTML:** `header`, `nav`, `main`, `section`, `footer`, `h1` once per page, then
  `h2` and `h3` in order, `p`, `ul`/`li`, `a` for links, `button` for actions, `img` with an
  `alt`. The layers panel then reads like the page's outline.
- **The system's classes,** not repeated inline values: `class="h2"`, `class="container stack"`.
- **Components as instances:** `<kalka-instance component="Button"></kalka-instance>`, or
  create_instance with parent_id. A part needed twice joins the system instead of being drawn
  again.
- **Layout with flex and grid and gap.** No absolute positioning except for a decorative layer;
  no fixed heights on text containers, so content can grow.
- **Real content:** the product's words, real numbers with their source, real names. No lorem
  ipsum, no "Your text here", no invented logos. Images from stock_photo or the person's files.
- **No placeholder images.** When no real image exists, compose without one: a real photo from
  stock_photo, a visual drawn in CSS from the product's own parts, or a layout that needs no
  image. Never leave a grey block, an empty `img` or a broken source.
- **Names by role** for every layer that matters (Hero, Pricing card, Primary CTA).

Change a section with edit_html, update_styles or update_css_class; rewrite a whole section only
when its structure must change.

## 7. Check every section

After each section, get_screenshot the page frame and judge it before moving on. Ask first:
what must the visitor see in the first five seconds (the prices on a pricing page, the work on
a portfolio, a dish or the menu for a restaurant), and is it on the first screen? Then check:

- it fits its frame: nothing clipped, overflowing or collapsed
- spacing follows the scale: tight inside a group, generous between groups
- the hierarchy reads in one glance: one focal point, then the rest in order
- text contrast is enough and the accent is used sparingly
- edges align on the container and the grid
- content is real and nothing is left from a placeholder
- no sign from the anti-slop catalogue is left that the direction did not choose

Run the `lint` tool on the page frame as well: it flags tracked all-caps eyebrows, display
headings set too tight and broken images, among other checks. Fix what it reports or keep it
only when the direction chose it.

Fix what fails, then go on. When the desktop page is done, add_breakpoint at 390 (and 810 when it
matters) and adjust the phone layout: stack the rows, shrink the display sizes, keep the tap
targets at least 44 px.

## 8. Finish

Call finish_working_on_nodes, select the result so the person sees it, and give a two or three
line summary: what was built, the direction in one phrase, and what is left or uncertain. Answer
the comments that ask you (get_comments, reply_to_comment).

## Kalka Fresh

Kalka ships a library of design-forward pieces: live shader grounds, headline effects (a
variable-font ramp, text on a circle, words around a pill of media), glass and paper cards,
tactile and hover-state buttons, hero devices (an orbit of labels, a floating collage, a status
island) and separators. They are raw material for an idea you already have, never a template
and never a reason to have an idea.

- Search whenever you reach one of these choices: the hero's ground or background, an effect
  on the headline, a separator between sections, or the ground of the closing call to action.
  Call search_library_components once for that choice with the intent in your own words ("seal
  beside the headline for a bakery", "moving ground for the closing call to action"), look at
  what comes back, then decide. Using nothing is a valid decision; not looking is not.
- Use one or two pieces where they carry the page's strong moment; most pages need few.
- Insert with insert_library_component (library_id "kalka-fresh"), set its variant and text
  properties, then make it the page's own: its colours follow the variables ground, ink, accent,
  muted and line, so name the brief's colours that way. A piece is editable after insertion:
  resize it, change its words, or take its html with include_html and rewrite it with
  write_html.
- The taste rules still hold: a shader ground is not a purple-to-blue gradient by default, glass
  sits over something worth blurring, no glow under a button, one effect per screen.

## Taste rules

- One clear direction per screen, executed precisely. Restraint and boldness both work when they
  are chosen.
- Type does most of the work: few sizes, strong contrast, text lines of 45 to 75 characters.
- Spacing varies on purpose; alignment is exact.
- Give the page a world, not a theme: one place or material from the brief carried through every
  section, so the page could not be swapped for another product's.
- Show the real product: screens and parts captured from it, never drawn look-alikes.
- Avoid what reads as generated. People spot these at once, and one is enough to make a page
  look machine-made:
  - colour: purple-to-blue gradients on white; cyan or neon on dark grey; a glowing dark mode by
    default; a cream or warm-paper ground with a serif display and a terracotta, rust or
    burnt-orange accent; signal yellow or amber on navy; the sector's cliché (hazard stripes for
    logistics, a leaf for plants, a shield for security)
  - type: the reflex faces (Inter, Space Grotesk, Playfair Display, Fraunces, DM Sans) chosen
    because they come first; monospace as a "technical" signal; gradient text; one headline word
    set apart in italic or colour; a tracked all-caps eyebrow above every heading (write a
    sentence-case subtitle below the heading, or nothing); huge condensed capitals set with
    tight tracking and tight leading
  - layout: three identical cards with an icon, a heading and a line; cards nested in cards;
    everything centred; thick coloured side stripes on cards and callouts; 01 / 02 / 03 markers
    on things that are not a sequence
  - surface: one radius and one soft grey shadow on everything; glass as decoration; a gradient
    on every heading
  - motion: a fade-up on every section, a lift on every card on hover, bounce easing
  - details: emoji as icons; an arrow added to every link; meta lines joined with middle dots
- The anti-slop catalogue (returned with this guide by get_design_guide, `/anti-slop` in Kalka's chat)
  lists every sign, what replaces it and how to check for it; go through it in step 7.
