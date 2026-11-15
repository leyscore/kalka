# Polish

Uses: /anti-slop

The last pass before a design ships. The structure is decided; this pass makes it exact.

Polish is not a redesign in disguise. If something needs rethinking, say so and stop: fixing
the details of a wrong layout wastes the work. Polish only what is functionally complete.

## 1. Look, then sort

Take an image (`get_screenshot`). Write down everything that is off, then sort it in this order and work in this
order. The order is by damage, not by ease:

1. anything that stops a task: an action that cannot be found or reached
2. missing states
3. hierarchy and drift from the design system
4. spacing, alignment, type, color
5. names and cleanup

A mistake that repeats has one cause. Find it and fix it there: in the class, in the variable,
in the component. Fixing forty layers one by one leaves the cause in place.

## 2. Space

- Every gap and padding is a step of the scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160. Replace
  values such as 13, 18 or 22. Three exceptions at most on a page, each for an optical reason
  you can state.
- Space inside a group is smaller than space between groups. If they are equal, the grouping
  disappears.
- Above a heading there is at least twice the space there is below it.
- Text inside a filled box sits at least 12 px from its edges.
- The same relation has the same value everywhere: every card has the same padding, every
  section the same side margin.

## 3. Alignment

- Edges that should line up do, to the pixel. No positions or sizes like 13.5.
- Things that look centered are optically centered: a play triangle sits slightly right of
  the mathematical middle, a large heading starts slightly left of the body text below it.
- Icons and the text beside them share a middle line.

## 4. Shape

- Nested corners are concentric: the inner radius is the outer radius minus the padding
  between them, and never below 2 px. Equal radii on a nested box look swollen.
- A card has a border or a shadow, not both.
- One shadow recipe for the whole page.

## 5. Type

- Two families, three weights, six sizes. Remove the seventh; it is nearly always a mistake.
- Body line height 1.5 to 1.65. Display line height 1.0 to 1.15.
- Large headings are tightened slightly, never by more than 4 percent of their size. Small
  text is never tightened.
- Headings break in balanced lines: no single word alone on the last line.
- Figures that are compared line up: use tabular figures in tables and prices.
- Real punctuation: curly quotes, a true ellipsis, no double spaces. A number and its unit do
  not split across two lines.

## 6. Color

- Only variables. A color typed by hand is either a mistake or a variable that is missing.
- Body text has 4.5 to 1 contrast, aiming for 7 to 1. Large text, icons and the edges of
  fields have 3 to 1. Placeholder text has 4.5 to 1 as well.
- Grey text on a colored surface is replaced by a tint of that surface's color.
- Run the design check (`lint`) and clear everything it reports. `lint_fix` applies the
  fixes that are safe.

## 7. Consistency

- One pair of buttons, one card recipe, one link style, one field style. Find the variants
  that drifted and bring them back to a shared class.
- One icon set, one size, one line weight: thinner beside regular text, heavier beside bold.
- The same thing has the same name everywhere: not "Sign in" here and "Log in" there.
- One way of writing capitals in headings and buttons.

## 8. States

Every control has what it needs of these, and each looks different from the others:
default, hover, focus, pressed, disabled, loading, error, success.

- The focus ring is 2 px, sits 2 px outside the element, and has 3 to 1 contrast against what
  is behind it.
- An error says what happened and what to do, next to the field it concerns.
- Disabled is visibly disabled and still readable.

### Motion, if the page has any

- Feedback to a press or a hover takes 100 to 150 milliseconds. A change of state takes 200
  to 300. Nothing in the interface takes longer than 300.
- Things leave faster than they arrive: an exit is about three quarters of its entrance.
- Motion starts fast and settles. Nothing bounces, nothing overshoots.
- Only transform and opacity change: moving, scaling, fading. Animating a width, a height or
  a position in the layout makes the page stutter.
- A pressed button shrinks very slightly, to about 97 percent.
- A list that appears item by item staggers by 30 to 60 milliseconds and never takes more
  than half a second in all.
- Everything still works, and still makes sense, for someone who asked for reduced motion.

### Dark theme, if the page has one

- Check it as carefully as the light one. Most dark themes are the light one inverted, and it
  shows.
- Surfaces get lighter as they come forward. Shadows are removed; they do nothing on dark.
- Colors are slightly less vivid than in the light theme.
- Pictures and logos made for a light page are checked: a black logo disappears.
- Contrast is measured again. Passing in light says nothing about dark.

## 9. Real content

Try the page with content it was not drawn for:

- a title three times longer, and a title of one word
- a list with no items, with one, with a hundred
- a missing picture
- a name with accents, a price with five digits

Nothing overflows, overlaps or collapses. An empty list says so and offers the next step.

## 10. Names

- Layers are named for what they are: "Price card", not "Frame 12".
- Classes are named for a role: "card", "eyebrow", not "blue-box".
- Remove hidden layers, empty frames and leftovers.

## Never

- A new color, size or radius added to make one layer look right.
- A fix that moves one layer and breaks the rhythm around it.
- Decoration added at this stage. If it needs more, that is not polish.
- Changing the layout because you would have done it differently.

## Order of work, in short

When in doubt about what to do next, the order is: space, then color, then icons, then words,
then type, then layout details, then pictures, then motion. Words come before type because
the length of a headline decides its size.

## Check and report

Take a new image and compare it with the first. Then report:

- what you changed, grouped by the sections above, with counts: "spacing: 14 values moved to
  the scale"
- the causes you fixed at the source
- what you left because it needs a decision from the person

A report that helps:

> **Space**: 14 values moved to the scale, most of them 18 and 22 in the feature cards. Cause
> fixed in the "card" class.
> **Type**: removed a seventh size (15 px) used in three captions; they now use Small.
> **Color**: two greys typed by hand replaced by the neutral variables; one new variable added
> for the disabled state, which was missing.
> **States**: added focus rings to the four buttons and an error state to the email field.
> **Left for you**: the pricing table overflows at 1024 with the longest plan name. It needs
> either a shorter name or a different layout.
