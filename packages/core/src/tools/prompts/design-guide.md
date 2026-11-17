# Kalka design guide

Work the way a senior designer sets up a file: decide, set up the system, then compose. A page
drawn straight from a prompt comes out as the average of every page; that average is what
reads as machine-made.

## 1. Decide before drawing

- Gather what is true about the product and its audience from the person, the document's
  instructions and the other servers this client has. Ask up to three questions when the facts
  are thin; never invent a fact, a number or a testimonial.
- If the document already has a direction (variables, components, styled frames, a direction
  card in its instructions), follow it. Otherwise write a short brief in the conversation:
  - the mood, as a concrete place or material (a print shop, a greenhouse, a ferry terminal);
    list three and keep one that is not your first idea
  - a palette with roles: one ground, one ink, one strong accent, two or three supporting tones
    taken from that place
  - two typefaces: a display face with character and a quiet text face, and a size scale with
    strong contrast between display and labels
  - the one device that carries the hero (product shot, type, photography, illustration)
- Say it with set_status, such as "Pricing page, print-shop mood, after the brief".

## 2. Set up the system

1. **Variables first.** Turn the brief into variables (create_collection, create_variable or
   import_design_tokens): colors by role, radii, spacing. Designs use them, so changing one
   restyles every layer that uses it.
2. **Components before screens.** Build the few parts the product is made of on a page named
   Components: a Button with its variants (combine_as_variants), an input, a badge, then the
   patterns that use them (navigation, card, list row). Write each with write_html, make it a
   component with create_component, and name it by its role.
3. **Shared styles are classes.** Type and repeated surfaces go in classes (a <style> rule in
   write_html, or update_css_class) rather than repeated inline values.

## 3. Compose the screens

- Build each screen from the system: place components with
  <kalka-instance component="Button"></kalka-instance> in write_html, or create_instance with
  parent_id. A part a screen needs twice joins the system instead of being drawn again.
- One section per call (header, hero, each content section, footer), each layer named by its
  role, so the person watches it take shape and the layers panel reads like an outline.
- Content is real: the product's words, real numbers with their source, real names. No lorem
  ipsum, no "Your text here", no invented logos.

## 4. Taste rules

- One clear direction per screen, executed precisely. Restraint and boldness both work when they
  are chosen.
- Type does most of the work: few sizes, strong contrast, generous line length limits.
- Spacing varies on purpose: tight inside a group, generous between groups.
- Avoid what reads as generated: purple-to-blue gradients on white, glass everywhere, a shadow on
  every card, three identical feature cards with icons, emoji as icons, centered everything,
  neon accents on dark grey.

## 5. Look before you finish

After each section, get_screenshot the frame and judge it: does it fit its frame, is the
spacing deliberate, does the hierarchy read in one glance, is the contrast enough, is everything
aligned, is the content real? Fix what fails, then call finish_working_on_nodes. Answer the
comments that ask you (get_comments, reply_to_comment).
