# Design system

Uses: /direction, /anti-slop

Work like a senior designer opening a new file: the system first, then the screens built from
it. A screen drawn layer by layer, with values typed into each, drifts the moment it is copied;
one built from variables and components stays one design however many screens it becomes.

If the project has no direction yet, run `/direction` first and stop at its card. Everything
below turns that card into parts.

## 1. Read what exists

- `get_variable_defs` or `list_variables`, `get_components`, `get_css_classes`: reuse what the
  document already has. Never make a second Button.
- Look at the pages. If designs exist without variables, read the colors, fonts and radii they
  share and make those the variables, rather than inventing new ones.
- Say what you will build with `set_status`, such as "Setting up the system: variables".

## 2. Variables

Make one collection, named after the project, with:

- colors by role, never by hue: `color/ground`, `color/surface`, `color/ink`, `color/ink-muted`,
  `color/accent`, `color/accent-ink`, `color/border`
- `radius/sm`, `radius/md`, `radius/lg`, `radius/full`
- `space/1` to `space/8` on one scale (4, 8, 12, 16, 24, 32, 48, 64)
- font families as string variables: `font/display`, `font/text`

A light and a dark theme are two modes of the same collection, never two copies of a screen.

## 3. Components, on a page named Components

1. Primitives first, each one `write_html` call, then `create_component`, named by role:
   Button, Input, Badge, Avatar, Icon button.
2. Variants of one component with `combine_as_variants`, named `Variant=Primary`,
   `Variant=Secondary`, `Size=Small`. A variant is a property, not a separate component.
3. Then patterns that use the primitives: Navigation, Card, List row, Footer. Inside them, use
   `<kalka-instance component="Button"></kalka-instance>` so a change to the Button reaches
   every pattern.
4. Bind fills, radii and gaps to the variables (`bind_variable`), and put shared type in
   classes.
5. Look at the page with `get_screenshot`: every component side by side, aligned on a grid, each
   with a short label of its name.

## 4. Screens

- One top-level frame per screen, named after it ("Home", "Pricing"), at the width it is
  designed for. Add breakpoints with `add_breakpoint` once the desktop screen holds.
- Compose each section from the components with `<kalka-instance>` in `write_html`, or
  `create_instance` with `parent_id`. Layout that appears once (the hero's composition, the page
  grid) stays plain HTML.
- When a screen needs a part twice, it joins the Components page first.
- Name every layer by its role: `Hero`, `Hero/Title`, `Pricing/Card`. The layers panel should
  read like the page's outline.

## Never

- A value typed into a layer that a variable already holds.
- A copy of a component edited by hand instead of an instance or a variant.
- A screen started before its components exist.
- Layers named `Frame 12` or `div`.

## Check before you finish

- Changing one variable or one component changes every screen that uses it. Try it once and
  undo.
- Each screen passes the look you give it with `get_screenshot`: fit, spacing, hierarchy,
  contrast, alignment, real content.
- `finish_working_on_nodes`, then a two-line summary: what the system holds, which screens use
  it.
