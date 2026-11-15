# Responsive

Adapt a page to tablet and phone. Adapting is not shrinking: it is the same content and the
same actions, arranged for a narrower screen and for a finger instead of a pointer.

## 1. Set up

Find the desktop frame and the breakpoints it already has. Add the ones that are missing
(`add_breakpoint`): tablet at 820 and phone at 390. Say which breakpoint you are working on, and do one at a time,
widest first.

Before changing anything, list for the page:

- what must stay reachable on every size: the main action, the price, the contact, the address
- what depends on a pointer on desktop: hover reveals, tooltips, anything small and close
- what is wide by nature: tables, code, rows of cards, wide pictures

That list is what you will check at the end.

## 2. What never changes

- Every piece of content and every action stays. If something is not worth showing on a phone,
  ask whether it is worth showing at all.
- The order of sections is the same on every size. A phone visitor who is sent a desktop
  screenshot should find the same things in the same order.
- The main action is visible on the first screen of the phone.
- The page's direction holds: same typefaces, same colors, same character.

## 3. Layout

- Rows become columns where they stop fitting. Change the direction of the auto layout, which
  is CSS flex (`set_layout`), or let it wrap. Do not place layers by absolute position.
- A split of text and picture stacks with the text first, then the picture.
- One column at 390. Two only for small, equal things such as figures or thumbnails, and never
  narrower than 165 px each.
- No layer is wider than its frame. Nothing scrolls sideways except what is meant to: a table
  or a strip of pictures, clearly cut off at the edge so people see there is more.
- Things that should fill their parent fill it. A fixed width in pixels on a text block is
  almost always a mistake on a phone.
- A dense preview, such as a dashboard, is simplified to its most telling part. Scaling it
  down until nothing is readable shows nothing.

## 4. Type

- Body text is at least 16 px on the phone. Nothing is smaller than 13 px.
- Text in form fields is 16 px, or the phone zooms in when the field is tapped.
- Headings step down, but keep the contrast between levels: a phone heading is still clearly
  a heading. Typical steps from desktop to phone: 72 to 38, 48 to 30, 28 to 24.
- Lines stay under 75 characters; on a phone they are naturally shorter, which is fine.
- Buttons and navigation labels never wrap onto two lines. Shorten the words before shrinking
  the type.

## 5. Touch

- Anything tappable is at least 44 by 44 px, with 8 px between neighbours. A small icon keeps
  its size and gets padding around it.
- Nothing depends on hover. What a pointer reveals on desktop is visible, or one tap away, on
  a phone.
- Buttons are full width on the phone when they are the main action of their section.
- Navigation with more than three or four entries becomes a menu: a full-height sheet with
  rows of 56 px. The main action stays next to the menu button, not inside it.
- Fixed bars at the top or bottom never cover content, and leave room for the phone's own
  edges.

## 6. Space

- Side padding of 20 to 24 px on the phone, 32 to 48 px on the tablet.
- Space between sections drops by about a third on the phone, not by half, and stays on the
  scale: 160 becomes 96, 128 becomes 80, 96 becomes 64. Cramped sections read as one block.
- Inner spacing stays on the same scale as desktop. Do not invent values for the phone.

## Patterns, part by part

**Navigation**

- Desktop: a row of entries with the main action at the end.
- Tablet: the same row if it fits without crowding; otherwise the menu button, with the main
  action kept visible beside it.
- Phone: logo, main action, menu button. The menu opens as a full-height sheet.

**Top section**

- A split becomes a stack: headline, sentence, action, then the picture.
- The picture is cropped to its subject and never pushes the action below the first screen.
- A headline of 72 goes to about 38. If it then runs to five lines, shorten the words.

**Rows of cards**

- Three across on desktop, two on tablet, one on phone.
- If one column makes the page very long, the cards were carrying too little each. Turn them
  into a compact list: a title and a line, with a divider.
- Do not hide the fourth and fifth card behind a slider. People do not swipe to find out.

**Tables**

- A comparison table with few columns keeps its shape and scrolls sideways, with the first
  column fixed.
- A table of records becomes a list of cards on the phone: each row turns into a small block
  with its labels.
- Never shrink a table's text to make it fit.

**Forms**

- One field per row on the phone. Labels sit above fields, not beside them.
- The keyboard matches the field: numbers for a phone number, the at sign for an email.
- The submit button is full width and stays reachable when the keyboard is open.

**Pricing**

- Plans side by side on desktop become a stack on the phone, the recommended one first.
- Each plan keeps its full list; do not cut features to shorten the column.

**Long text**

- A two-column article becomes one column.
- Side notes move into the flow, after the paragraph they belong to.

## 7. Pictures

- A picture keeps its proportions. Crop to the subject rather than squeezing.
- A wide picture that loses its subject at phone width needs a different crop, not a smaller
  copy.
- Text set on a picture is checked again on the phone: the crop moved, so the contrast may
  have gone.

## 8. Check each breakpoint

Take an image of each one (`get_screenshot`). For the phone, answer each of these:

- Is any text under 16 px in the body, or under 13 px anywhere?
- Is any target smaller than 44 px or closer than 8 px to another?
- Is anything cut off at the right edge, or does the page scroll sideways?
- Is the main action on the first screen?
- Does any button or label wrap?
- Is anything from the list in step 1 missing or unreachable?
- Looked at small and blurred, is there still one clear focal point?

Run the design check (`lint`) on each breakpoint and clear what it reports.

Check the sizes between your breakpoints too. Most breakage happens at widths nobody drew:
just under the tablet width, and at 320 on small phones. If the frame can be resized, drag it
through 1024, 768 and 320 and watch for the moment something overlaps or wraps badly.

Then look at the widest size too, at 1920: content should sit in a column of 1280 to 1440 px,
not stretch from edge to edge.

## Never

- A desktop layout scaled down.
- Content or an action removed on the phone because it was hard to fit.
- A menu or a filter that exists on desktop and nowhere on the phone.
- A different order of sections on the phone.
- Text made smaller to avoid a line break.

## Hand over

For each breakpoint, say in two or three lines what changed and why. Then list anything that
needs a decision from the person: content that does not fit, a picture that needs another
crop, a table that needs another form.
