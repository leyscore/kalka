# Corporate Trust

## 1. Essence

The page of a service people hand their money or health to. White ground, one saturated brand colour, plain sans at a comfortable size, numbers with sources, and forms and tables built the way public-service design teams build them. Calm, specific and never alarming.

Use for money and health: banks, payments, insurance, pensions, tax, payroll, clinics, health providers, public services. Friendly money products use the consumer variant: bigger, heavier display, rounder shapes.

## 2. Grid

- Page 1440. Content 1200. 12 columns of 78 px, gutter 24, margins 120.
- Service and task pages: a 960 container (1020 with its 30 px margins) and a two-thirds column of 640 for the form or content (about 610 of text), with the last third for help.
- Reading measure 610–680 px, about 68 characters.
- Forms: one column, fields as wide as the two-thirds column or sized to the expected input (postcode 8 characters wide, sort code 3 × 2 digits, amount 12 characters). Text inputs no wider than 480.
- Mobile (390): 4 columns, 16 px margins. Body stays 18–19 px. Tables become stacked label-value rows.

## 3. Type

| Family                                                              | Note                                        |
| ------------------------------------------------------------------- | ------------------------------------------- |
| Source Sans 3                                                       | neutral, excellent figures                  |
| Fira Sans                                                           | public services                             |
| Noto Sans                                                           | multilingual services                       |
| IBM Plex Sans                                                       | institutional, insurance and pensions       |
| Atkinson Hyperlegible Next                                          | health and public services, high legibility |
| Libre Franklin                                                      | banks with history                          |
| Figtree                                                             | friendlier fintech, consumer variant        |
| Serif for one display level, optional: Source Serif 4 or Newsreader | private banking, wealth                     |

Inter and Public Sans are reflex or recent defaults; use them only with a reason (for example the institution already uses them).

Scale (marketing / service):

| Role           | Size / line                                 | Tracking | Weight                                                         |
| -------------- | ------------------------------------------- | -------- | -------------------------------------------------------------- |
| Small, legal   | 14/24                                       | 0        | 400                                                            |
| Caption, hint  | 16/24                                       | 0        | 400                                                            |
| Body           | 18/28 (marketing), 19/25 to 19/28 (service) | 0        | 400                                                            |
| Lead paragraph | 24/30                                       | 0        | 400                                                            |
| H3             | 24/30                                       | 0        | 600–700                                                        |
| H2             | 32/40 to 36/40                              | -0.01 em | 600–700                                                        |
| Display        | 40/48 to 48/50                              | -0.01 em | 600–700, or 300 at 56/58 with -0.02 em for a calm, light voice |

Consumer variant: display 64–104 px at 0.85–1.0, weight 700–800, -0.02 to -0.05 em; H2 40–56; body 18–22.

Rules:

- Two weights: 400 and 600 (or 700).
- Sentence case everywhere. No caps labels.
- Tabular lining figures for all money, rates and dates.
- Currency and dates in one locale: `£1,240.50`, `€1.240,50` or `$1,240.50`, never mixed.
- Body never under 18 px on marketing pages, 19 on service pages.

## 4. Spacing

- 8 px base: 8, 16, 24, 32, 48, 64, 96.
- Section padding 64 on marketing pages, 96 before a new topic; 40–48 at the top of a service page. Vary: 48 between a claim and its proof.
- Form groups 24–32 apart (default 32); label to input 8; hint between label and input, 8–10 below the label; error message above the input, 16 gap, at body size in bold, with a 4–5 px error-coloured bar on the left of the whole group.
- Inputs 40–48 tall, 8–16 px inner padding. Buttons 40–48 tall; 48–56 in the consumer variant.
- Table cells 10–14 px vertical, 16–20 horizontal: rows of 46–48 px. Fee tables 48.

## 5. Colour

- **Ground:** white #ffffff. One tint for bands (#f4f8fb blue-tinted, #f8fafd, or a warm #faf8f5).
- **Ink:** near-black with a whisper of the brand hue: #0b0c0c, #061b31, #091723 or #1b1b1b.
- **Secondary text:** #484949 (9.03), #50617a (6.3) or #5b5850 (6.7 on #faf8f5). Lighter greys like #7d8ba4 (3.4) are for non-text only.
- **Brand:** one saturated colour, used on the primary button, links and selected states, about 5–10% of the area.
- **Status:** error, warning, success and info each with icon and word, tint, border, text and solid. Focus ring 3 px, in a colour that contrasts with both ground and brand (yellow #ffdd00 with a #0b0c0c bar is the public-service standard; #0b0c0c on it is 14.54). A 2–4 px blue outline with a 2 px offset also works where yellow clashes.

**The brand must never read as an alert.**

- Keep the brand hue at least 60° from error (25–30) and at least 40° from warning (70–95) in OKLCH. Blues (240–265), indigos (265–285), teals (175–200) and forest greens (130–150, low L) are safe.
- If the brand is red, orange or amber: do not use it on buttons, banners or badges. Make the primary button near-black or deep navy and keep the brand for the logo and one illustration band.
- If the brand is green: success uses an icon and a word, and a different green (deeper, L ≤ 0.5) or teal.
- Never use the brand colour for a banner, a badge count, a price change, or an outlined box around important text. Those are status jobs.
- Do not colour numbers red or green to mean down or up without an arrow and a sign.

Palettes:

| Name           | Ground                                   | Ink / secondary                                                       | Brand                                                                                                     | Status                                                                  |
| -------------- | ---------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Public service | #ffffff, tint #f4f8fb                    | #0b0c0c (19.58) / #484949 (9.03)                                      | #1d70b8 (white on it 5.16), links #1a65a6 (6.07)                                                          | error #ca3535 (5.15), success #0f7a52 (white on it 5.34), focus #ffdd00 |
| Payments       | #ffffff, surface #f8fafd, border #e5edf5 | #061b31 (17.37) / #50617a (6.3); #64748d (4.74) for hints             | indigo #533afd (white on it 6.19)                                                                         | error #ce0500 (5.75), success #18753c (5.75)                            |
| Private bank   | #faf8f5, band #ede7e0                    | #1b1b1b (16.24) / #5b5850 (6.7; 5.78 on the band)                     | deep teal #003b39 (11.75; white on it 12.46)                                                              | error #ce0500 with icon, success #18753c with icon                      |
| Lime fintech   | #ffffff                                  | forest #163300 (13.92) / #454745 (9.37)                               | lime #9fe870 as a fill with #163300 text (9.45); never lime text                                          | error #cf2929 (5.24); warning #8a5300 on #fff8e6 (5.97)                 |
| Young money    | #ffffff, tint #f2f8f3                    | navy #091723 (18.12; 16.83 on the tint) / navy at 60% (#6b747b, 4.76) | navy buttons with white text (18.12); coral #ff4f40 only for illustration and the logo (3.25, never text) | as Public service                                                       |

## 6. Surfaces

- Radius: 6–8 on inputs and buttons (default 8), 4 on checkboxes, 12–16 on cards. Consumer variant: cards 16–32 and full pill buttons. Pills otherwise only for tags and search fields.
- Shadow, one level only: `0 2px 2px #0000000a, 0 8px 16px -4px #0000000a`. Most surfaces have none. Public-service buttons may take a solid `0 2px 0` edge in a darker shade.
- Borders: 1 px at about #e5edf5 for cards. Input borders at 3:1 or more: 1 px #565c65 (6.74) or 2 px #0b0c0c. #cecece only for dividers and table rules.
- No gradients on buttons. No glass. No texture.

## 7. Navigation

- 64–80 px main bar: logo left, 4–6 links at 16 px, "Log in" text link, primary button (open an account, book an appointment).
- Optional 36 px utility bar above: personal / business switch, help, language.
- Skip link first in the tab order.
- Sticky only on long marketing pages, 64 px, white with a 1 px border.

## 8. Hero patterns

**A. Claim, proof, phone.** Claim at 48–56 px in columns 1–6 (8–12 words, specific: "Send money to 70 countries at the real exchange rate"). Proof line below: one sourced number ("4.6 out of 5 from 210,000 reviews, Trustpilot, Nov 2026"). Primary button and a text link. A phone at 390 × 844 in columns 8–12 showing a real task screen, cropped at the bottom by the fold. Consumer variant: claim at 80–104 px.

**B. Task-first (no photo).** The hero is the task itself: a short heading at 48 px and the first step of the form or a lookup (enter postcode, choose a service, check eligibility) in the two-thirds column, with help in the third column. Fits public services and clinics.

**C. Calculator (no photo).** Heading in columns 1–5. In 6–12, a calculator card: inputs for amount and term, a live result in large tabular figures, the fee breakdown as a small table, and the rate source with a date. The result line is the visual.

## 9. Section patterns

- **Trust bar.** Regulators and protections as text: "Authorised by the Financial Conduct Authority, FRN 900507. Deposits protected up to £85,000." No fake seals.
- **Sourced numbers.** Three or four uneven figures, each with a source line in 14 px.
- **Explainer.** A heading and 3–5 short steps for a real process (how a transfer works, what happens at an appointment), each with the time it takes.
- **Fee table.** 48 px rows, 1 px rules, a bold header row, columns for item, fee and when charged; zero shown as "Free", not "£0.00".
- **Compliance badges as text.** Standards named in words (ISO 27001, SOC 2 Type II, HIPAA), with what they mean.
- **Notice.** A box with a 5 px brand-colour border and a heading.
- **Help.** Phone with hours, chat, and a link to the help centre; consistent placement on every page.
- **Legal footer.** 14 px, registration numbers, address, risk warnings.

## 10. Imagery and its no-photo fallback

- Photos: real customers or staff in real settings, not handshakes or glowing padlocks. Optional.
- **No photo:**
  1. A phone or card drawn in HTML: a payment card 340 × 214 radius 16, number shown as `•••• 4821`, name, expiry.
  2. A calculator hero or a task-first hero.
  3. A fee table or a sourced numbers strip as the first visual after the hero.
  4. Never a shield icon, a lock illustration, or a grey frame.

## 11. Product UI in this style

- Phone 390 × 844. Status bar, a header with the account name, a balance in 32–40 px tabular figures, then a transactions list.
- Transactions: merchant name, a messy raw descriptor under it in 13 px (`CARD PAYMENT TO TESCO STORES 2041`), category, pending state for one or two, amounts uneven and signed (`−£23.47`, `+£1,850.00`), relative dates (Today, Yesterday, Mon 9 Dec).
- Payment flow: states such as requires_payment_method, requires_action (with a 3-D Secure step), processing, succeeded, canceled, each with icon and plain words.
- Health: appointment states proposed, booked, arrived, checked-in, fulfilled, cancelled, noshow, waitlist; a clinician's full name and role; a time slot with a duration ("10:40, 20 min").
- Never a real-looking card number, IBAN or patient identifier.

## 12. Signature moves

1. A specific claim with a sourced proof line.
2. One brand colour, kept away from status hues.
3. A task or calculator as the hero.
4. A fee table with 48 px rows and "Free" in words.
5. Regulators and protections stated in text.
6. 18–19 px body, sentence case, two weights.
7. Forms with labels above inputs, hints, and errors above the field with a red bar on the group.

## 13. Anti-patterns

1. The brand colour used for banners, badges or warnings.
2. A red, orange or amber brand on the primary button.
3. Status shown by colour alone.
4. Shield, padlock or handshake illustrations.
5. Fake certification seals.
6. Vague claims ("bank-grade security", "trusted by millions") without a number and source.
7. Body under 18 px.
8. Light grey text (#7d8ba4 and lighter) for anything readable.
9. Input borders under 3:1.
10. Placeholder text used as the label.
11. A "most popular" middle plan with three equal cards.
12. Gradients and glassmorphism.
13. Real-looking account or card numbers.
14. Mixed currencies or date formats.
15. Red and green alone for down and up.
16. Inline validation that fires before the user finishes typing.
17. A dark theme for a consumer bank.
18. Institutional and consumer shapes mixed on one page.

## 14. Overrides of the global anti-slop

None. This style relies on the full anti-slop list and the floor. Its stricter additions are the brand-versus-status rules in section 5 and the form rules in sections 4 and 9.

## 15. Breakable rules (when the person asks for something bolder)

1. **White ground.**
   - Protects: clarity and the sense of a document.
   - Breaking gives: a deep navy or forest hero band gives a private bank or wealth product gravity; a warm off-white (#faf8f5) or cream ground softens a consumer bank.
   - Allowed when: the band holds only the hero, text passes 7:1, and the service pages stay white.
2. **One sans family.**
   - Protects: plainness.
   - Breaking gives: a serif display level adds heritage for a long-established institution.
   - Allowed when: the institution is more than about 50 years old or sells advice, and the serif appears only at 36 px and up.
3. **No illustration.**
   - Protects: seriousness.
   - Breaking gives: one flat illustration band in the second brand colour can make a consumer fintech friendlier.
   - Allowed when: it appears once, contains no security clichés, and never sits next to a form.

## 16. Self-check

1. Is the brand hue at least 60° away from error and 40° from warning, or kept off buttons if it is red, orange or amber?
2. Does every status use icon plus word?
3. Is body text 18–19 px with secondary text at 4.5:1 or more?
4. Is the hero claim specific, with a sourced number?
5. Are money, rates and dates in tabular figures and one locale?
6. Do inputs have visible labels, hints, 3:1 borders and a height of 40–48?
7. Is the focus ring 3 px (or a 2–4 px outline with offset) and visible on every control?
8. Are there no shields, padlocks, fake seals or handshake images?
9. Are card and account numbers visibly fake?
10. Is the fee or plan information a table, not three equal cards?
11. Is help placed the same way on every page?
12. Is the page wholly institutional or wholly consumer in its shapes?
