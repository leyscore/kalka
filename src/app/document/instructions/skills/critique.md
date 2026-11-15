# Critique

Uses: /anti-slop

Review a design the way a demanding art director would: say what is wrong, where, and how to
fix it. Change nothing unless asked. A critique that flatters is worse than none.

## 1. Look before you read

Take an image of what is selected, or of the page if nothing is (`get_selection`, then
`get_screenshot`). Read the summary, which holds the
direction card, and the rules first: a design is judged against what it is for, not against taste.

Say in one line what you inspected and what you did not: which frame, which breakpoints, which
states.

## 2. The verdict first

Open with one sentence that answers: would someone seeing this believe a machine made it
without anyone deciding anything? Then name the signs that make you say so, using the
catalogue in `/anti-slop`. This goes first because it is what the person most needs to know
and least wants to hear.

## 3. Judge in this order

The order matters: a problem high in the list makes those below it pointless to fix.

1. **Focal point.** Look at the image small and blurred. Is there one place the eye goes
   first? If the eye wanders, nothing was chosen.
2. **Hierarchy.** Are there two or three clear levels of importance, or is everything the
   same size and weight? Is the key content obvious within two seconds?
3. **Rhythm.** Do sections differ in shape and density, or is it one repeated block?
4. **Color.** Is there an accent and does it mean something, or is color either everywhere or
   nowhere?
5. **Structure by lines.** Are borders and boxes doing a job that space should do?
6. **Details.** Only now: spacing, alignment, contrast, consistency.

## 4. Walk the task

Pick the two people the summary names, or a first-time visitor and someone who uses this
every day. Follow the main task as each of them.

- The first-time visitor knows what to do first within five seconds.
- The daily user finishes the main task in under a minute.
- At any decision there are four options or fewer. More than that, people stop choosing.

Name the exact layer where each person hesitates, and what they were expecting to find there.

### How much the page asks of people

Go through these eight. Each "no" is a point of load:

1. Is there one obvious first thing to do?
2. Does each screen have four choices or fewer at its main decision?
3. Is related information close together, and unrelated information apart?
4. Can people see where they are and how to go back?
5. Are labels in the words people use, not internal names?
6. Is what can be clicked visibly different from what cannot?
7. Does the page remember for people what it could remember: defaults, previous answers?
8. Is the most used action the easiest to reach?

Zero or one "no": light. Two or three: worth fixing. Four or more: the page is hard to use,
and that comes before any visual remark.

## 5. Measure what can be measured

- Text contrast is 4.5 to 1, or 3 to 1 for large text. Run the design check (`lint`) and
  report what it finds rather than guessing.
- Every gap and padding is on the spacing scale.
- No more than six type sizes and three weights.
- Things with the same role look the same; things that look the same have the same role.
- Interactive elements have their states: hover, focus, disabled, error.
- Tap targets are at least 44 by 44 px on the phone breakpoint.

## 6. Three tests worth running

- **Substitution.** Put a rival's name in the headline and the section headings. Every line
  that still reads true is generic.
- **Headings alone.** Read only the headings in order. Do they tell this project's story?
- **Removal.** For each decoration, picture and effect: if it were deleted, would the page
  lose a fact or a meaning? If not, it is noise.

## 7. Score

Give each a score from 0 to 4, and be honest: most real designs score between half and three
quarters.

- Clarity of what to do
- Hierarchy
- Consistency
- Fit with the project's direction
- Accessibility
- Craft

How to read the total, out of 24:

- 21 to 24: ready. Refine, do not rework.
- 16 to 20: sound, with clear things to fix.
- 11 to 15: the structure holds but it is not finished.
- 6 to 10: rethink the layout before touching details.
- under 6: start from `/direction`.

## 8. Report

- **What works**: two or three things, one line each, specific. These are what to protect
  when fixing the rest.
- **Problems**: three to five in a quick review, up to fifteen in a full one, worst first.
  For each:
  - the layer, by name
  - what is wrong, in one sentence
  - why it matters to the person using the page
  - one concrete fix, with values: "raise the heading from 24 to 40 px", not "make it bigger"
  - its weight: **blocking** (the task fails), **important**, or **minor**
- **Patterns**: if one cause explains several problems, say it once: "spacing is set by hand,
  not from the scale".
- **Left alone on purpose**: unusual choices you judged to be decisions, not mistakes.

A finding written well, and badly:

> **Blocking. "Hero / Actions".** The two buttons are both filled and the same size, so
> nothing says which one the page is for. A first-time visitor has to read both and guess.
> Make "Book a repair" the only filled button and turn "See prices" into a text link.

> The buttons could be improved. Consider the hierarchy.

The first names the layer, says what is wrong, says who it hurts and gives the fix. The second
could be pasted under any design.

Do not pad the list with minor remarks to look thorough. If the design is good, say so and
give two or three refinements.

## Never

- "Looks good" or "feels off" without a reason and a location.
- Advice that fits any design: "add more whitespace", "improve the hierarchy".
- Ten remarks of equal weight.
- Treating a bold choice as an error because it is unusual. When unsure, assume it was
  decided, and ask.
- Changing the design during a critique.
