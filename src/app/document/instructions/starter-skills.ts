import dedent from 'dedent'

/**
 * The skills a Kalka folder starts with, by name. Each is asked for in the conversation with a
 * slash, such as `/critique`. They are a starting point the person rewrites for their own work.
 *
 * Each follows the same order, which is what makes a skill hold: decide before drawing, rules
 * with numbers, what never to do, then a check of the result.
 */
export const STARTER_SKILLS: Readonly<Record<string, string>> = {
  'landing-page': dedent`
    # Landing page

    Draw a landing page that could only belong to this project. The person has seen the usual
    template many times; a page they recognize as one is a page they will redo.

    ## Before you draw

    Read the summary and the rules. Then write, in the conversation, three lines and wait for
    nothing: who the page is for, the one thing it should make them do, and the one element
    people will remember. If you cannot name that element, you are about to draw a template.

    ## Build

    - One job per page and one main action per screen. Any other action is visibly quieter.
    - The top of the page shows the thing itself: the product, the place, the work. Not a
      slogan over a gradient.
    - Use real words from the documents. Never placeholder text.
    - Spacing does the grouping: 8 to 12 px inside a group, 48 to 96 px between sections, all
      on a 4 px step.
    - Five type sizes at most, each at least 1.25 times the one below. Body lines stay under
      75 characters.
    - Colors and type come from the variables in the design system. Add none.
    - Spend boldness once. One section may be loud; the others stay calm so it reads.

    ## Never

    - Three identical cards of icon, title and text.
    - Everything centered, top to bottom.
    - A gradient on text, or a purple to blue background, because nothing else came to mind.
    - A small label in capitals above every heading.
    - The same corner radius and the same grey shadow on every block.

    ## Check

    Take an image of the page. In two seconds, is the main action obvious? Would someone say
    a machine drew it? Fix what makes them say so, then say what you chose and why.
  `,
  critique: dedent`
    # Critique

    Review the design as a demanding art director would: say what is wrong, where, and how to
    fix it. Change nothing unless asked. Flattery helps nobody.

    ## Look

    Take an image of what is selected, or of the page. Read the summary and the rules first:
    a design is judged against what it is for.

    ## Judge, in this order

    1. **First impression.** Does it look like this project, or like any project?
    2. **Hierarchy.** Blur your eyes: do the main thing, the second thing and the groups still
       stand out? Is the key content obvious within two seconds?
    3. **The path.** Follow the main task as the person the page is for. Name the exact layer
       where they hesitate.
    4. **Choices.** More than four options at one decision is a problem to raise.
    5. **Craft.** Spacing off the 4 px step, text under 4.5 to 1 contrast, more than five type
       sizes, elements of the same role styled differently.

    ## Report

    - Two or three things that work, in one line each.
    - Three to five problems, the worst first. For each: the layer by name, what is wrong, why
      it matters to the person using the page, and one concrete fix.
    - Mark each as blocking, important or minor.

    ## Never

    - "Looks good" without a reason, or a list of ten equal remarks.
    - Advice that fits any design, such as "add more whitespace".
    - Changes to the design during a critique.
  `,
  responsive: dedent`
    # Responsive

    Adapt a page to tablet and phone. Adapting is not shrinking: the same content, arranged for
    a narrower screen and a finger instead of a pointer.

    ## Before you draw

    Find the desktop frame and its breakpoints. Add the tablet and phone breakpoints that are
    missing. Work on one breakpoint at a time, widest first, and say which you are on.

    ## Adapt

    - Keep every piece of content and every action. Nothing important disappears on a phone.
    - Rows become columns where they no longer fit. Let auto layout wrap or change direction
      instead of placing layers by hand.
    - Body text is at least 16 px on a phone. Headings step down, but stay clearly headings.
    - Anything tappable is at least 44 by 44 px, with 8 px between neighbours.
    - Nothing depends on hover: what a pointer reveals on desktop is visible on a phone.
    - Side padding of 16 to 24 px on a phone. No layer wider than its frame.
    - The order of sections stays the same on every size.

    ## Never

    - A desktop layout scaled down until the text is unreadable.
    - A fixed width in pixels on something that should fill its parent.
    - A menu or an action that exists on desktop and nowhere on the phone.

    ## Check

    Take an image of each breakpoint. On the phone: is any text under 16 px, any target under
    44 px, anything cut off at the right edge? Say what changed on each size.
  `,
  polish: dedent`
    # Polish

    The last pass before the design ships. The structure is decided; this makes it exact.
    Do not redesign: if something needs rethinking, say so and stop.

    ## Go through, in this order

    1. **Spacing.** Every gap and padding is on the 4 px step. The same relation gets the same
       value everywhere. Fix a repeated mistake at its class, not layer by layer.
    2. **Alignment.** Edges that should line up do, to the pixel. No value like 13.5.
    3. **Type.** Five sizes at most. Same role, same size, weight and line height.
    4. **Color.** Only variables. Text has 4.5 to 1 contrast, 3 to 1 for large text. Run the
       design check and clear what it reports.
    5. **Consistency.** Buttons, cards and fields of the same kind share a class. Same words
       for the same things, same capitalization.
    6. **Real content.** Try a long title, an empty list, a missing image. Nothing overflows.
    7. **Names.** Layers are named for what they are, not "Frame 12".

    ## Never

    - A new color, size or radius added to make one layer look right.
    - A fix that moves one layer and breaks the rhythm around it.
    - Decoration added at this stage.

    ## Report

    List what you changed, grouped as above, and what you left because it needs a decision.
  `
}
