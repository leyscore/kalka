# Landing page

Uses: /anti-slop, /copy

Draw a landing page that could only belong to this project. The person has seen the standard
template a hundred times, and a page they recognize as one is a page they will throw away.

If the project has no direction yet (no card in the summary, no variables in the design
system), stop and say so: `/direction` comes first. A landing page drawn without one is the template.

## 1. Facts before layout

Write a fact sheet in the conversation. Only what the summary, the rules, the cited documents
or the person told you:

- what it is and who it is for
- the one action the page exists for
- proof you can actually show: the product, real numbers with their source, real names
- what the person will ask before acting: price, time, where, for whom, what if it fails

Anything you do not know stays empty. An empty line means that section is smaller or absent.
Never fill it: no invented statistic, no invented testimonial, no invented logo, no invented
person. Filler is the first thing a visitor recognizes.

## 2. Plan the page as sections that earn their place

List the sections before drawing, one line each: what it says and what it shows. Six to nine
including the top and the footer. A section exists only if there is true material for it.

Then check the plan:

- What must a visitor see in the first five seconds, and is it in the first screen? It depends
  on the page: the prices on a pricing page, the work itself on a portfolio, a dish or the menu
  for a restaurant, the product working on a software page, the dates and the place for an
  event. A headline alone is not it.
- Is it hero, three features, call to action, footer? That is the reflex. Find what this
  project has that the reflex has no slot for, and build a section around it.
- Does each section have a different shape from its neighbours? Two splits in a row, or two
  rows of cards, read as one long grey block.
- Read only the headings, top to bottom. Do they tell this project's story, or could they sit
  on a rival's page? Rewrite any that could.

### Page shapes

Before listing sections, choose the shape of the whole page. The template is one shape among
many, and rarely the right one.

- **Product-led**: the product itself, large, at the top and again in use further down. For
  software and for objects that explain themselves when seen.
- **Long document**: one column that reads like a letter or a short manual. For an argument,
  for something new that needs explaining, for a founder speaking plainly.
- **Stat-led**: opens on one true, sourced number. Only when the number is real and striking.
- **Photographic**: full-width pictures carry the page, words are few. For places, food,
  objects, anything people need to see.
- **Catalogue**: a range shown as numbered or named entries of the same form. For several
  products, plans or services of equal standing.
- **Workbench**: the page is a working example of the thing, usable right there. For tools.
- **Question and answer**: built from what people actually ask, in their words. For services
  where the doubts are known.
- **Manifesto**: a position, stated in large type, then what follows from it. For a brand
  with something to stand against.

Say which shape you chose and why it fits the fact sheet.

### Sections and what each one needs

A section without its material is filler. Check before you plan it.

| Section      | Needs                                                  | Without it                                        |
| ------------ | ------------------------------------------------------ | ------------------------------------------------- |
| Top          | what it is, for whom, the action, the thing shown      | never absent                                      |
| How it works | real steps in a real order                             | drop it; do not invent three steps                |
| What you get | the actual parts, with a picture of each               | a plain list                                      |
| Proof        | a real number with a source, or a named customer       | leave it out entirely                             |
| Voices       | real quotes, with name and role, as many as exist      | leave it out; one true quote beats three invented |
| Price        | the real prices and what each includes                 | "Ask for a quote" with what affects the price     |
| Questions    | what people actually ask before buying                 | leave it out                                      |
| For whom     | the kinds of people it suits, and one it does not suit | fold into the top                                 |
| Close        | the main action again, with the last doubt answered    | never absent                                      |

### Writing headings

A heading is the part people read. Most people read only headings.

- Say the point, not the topic. "Pricing" is a topic. "Three prices, no setup fee" is a point.
- Use the person's words for their problem, not your words for your feature.
- Prefer a thing to an idea: a noun someone could photograph.

Rewrites that show the difference:

- "Powerful features for modern teams" becomes "Every repair, on one board, in the order it
  came in"
- "Seamless integration" becomes "Reads the calendar you already use"
- "Why choose us" becomes "Twelve years, one workshop, the same four mechanics"
- "Get started today" becomes "Book your first week free"

The wording itself follows `/copy`, which comes with this skill: no heading made of two
fragments, the limits on contrasts and lists of three, and no adjective standing in for a
fact.

## 3. The top of the page, first and alone

Build the top section, take an image of it (`get_screenshot`), and judge it before drawing
anything below.

- At 1440 by 900 the headline, one supporting sentence and the main action are all visible.
- The headline says what the thing is and for whom, in two to eight words. Not a riddle, not
  a mood, not an order. Put a rival's name in it: if it still reads true, rewrite it.
- The supporting sentence is 25 words at most and adds a fact the headline does not have.
- One hard fact is on this screen: a number, a price, a place, a date.
- The thing itself is shown: the product, the place, the work. Not a gradient, not a shape.
- Two actions at most, and exactly one of them is filled.
- If there is a small label above the headline, it is the only one on the page.

## 4. Build the rest

**Hierarchy**

- One idea and one heading per section. Headings are six words at most and contain a noun
  that names a real thing.
- From body text upward, each type size is at least 1.25 times the next one down. Section
  headings are at least 40 px at 1440.
- Body text is 16 to 18 px, in lines of 45 to 75 characters. Wider than that, give it a
  narrower column, not a smaller size.

**Rhythm**

- Space inside a group is 8 to 16 px. Space between sections is 96, 128 or 160 px, steps of
  the spacing scale, and it varies: equal gaps everywhere make a page look generated.
- Leave at least twice as much space above a heading as below it, so it belongs to what
  follows.
- A row of equal cards may appear once, and only when the items really are parallel. The
  second time, find another form: a list, a table, a sequence, a single large example.

**Color and emphasis**

- Bind every color, size, gap and radius to a variable. A value typed by hand is either a
  mistake or a variable that is missing: add the variable, then bind it.
- The accent stays under about a twentieth of any screen. If you want it
  on a second thing, ask which of the two matters more.
- The page has one loud moment, the one named on the direction card. Everything else stays
  quiet so that it reads.

**Words**

- Written with `/copy`. In short: say the fact, in a sentence with a verb, in the person's
  own words.
- Buttons are a verb and its object, one to five words. The main action uses the same words
  everywhere it appears.
- About 80 words per screen and 600 for the whole page, two or three sentences per block.
  The long document and the manifesto are the exceptions: they are made of text, and run to
  about 1,200 words in paragraphs of normal length.
- Cut before you shrink the type.

**Navigation and footer**

- Navigation has five entries at most, each one or two words, and the main action at the end.
- The footer is not a sitemap of invented pages. It holds what is real: contact, legal, and
  the links that exist.
- The page does not end on an email form above a four-column footer unless collecting emails
  is the page's one action.

**Pictures**

- Show the real thing at a size where it can be read: at least half the width of its section.
- A screenshot shows real content, not placeholder rows. Crop to the part that makes the
  point rather than showing a whole small window.
- No two neighbouring sections use the same composition.
- If there is no picture for a section, the section does without one. Do not draw a shape to
  fill the space.

**The build**

- Sections are frames with auto layout, which in Kalka is CSS flex (`set_layout`). Use grid
  where rows and columns must line up. Never place layers by absolute position to build a
  layout; that is only for something meant to overlap.
- Layers that share a look share a class. Layers are named for what they are.
- Use real tags where they matter: headings as headings, lists as lists, buttons as buttons.

## 5. Review before you hand over

Take an image of the whole page (`get_screenshot`), then give each line a score from 0 to 4.
These six are a builder's own check; `/critique` scores a finished design on six others.

- **Idea**: is there a direction, and is it the one on the card?
- **Hierarchy**: looked at small and blurred, is the order of importance obvious?
- **Specificity**: could this page belong to another project?
- **Restraint**: is there one loud moment, or several competing?
- **Variety**: do the sections differ in shape?
- **Craft**: spacing on the scale, alignment exact, contrast sufficient?

Anything under 2, fix now. Then run the design check (`lint`) and go through `/anti-slop` once.

## 6. Hand over

Say what you built in five lines: the direction, the sections in order, the loud moment, what
you left out because there was no material for it, and your lowest score with what would raise
it. Suggest `/responsive` next.
