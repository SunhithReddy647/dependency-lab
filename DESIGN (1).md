# DESIGN.md: Dependency Lab

Design system for the Dependency Lab research site. Built from three references: a warm, calm mental-health landing page (display serif, black/white, soft illustration), a mobile aptitude-test flow (one question per screen, rounded option cards, violet progress), and a survey-builder dashboard (left rail, settings panel, clear tables).

## 1. Design principles

1. **Calm, not clinical.** Participants should feel curious, not tested. Soft colour, generous space, friendly serif headings.
2. **Neutral by construction.** No colour, icon, order or wording may hint that an answer is "good" or "bad". No green/red on choices. No scores shown.
3. **One thing per screen.** One question group, one primary action, always visible progress.
4. **Mobile first.** Most participants will open the link on a phone. Everything works at 360 px.
5. **Honest and safe.** Always show "Skip", "Pause and resume later", and "Withdraw my data". Never hide the timer logic: say what is recorded.
6. **Admin is a tool.** The dashboard is dense and quiet; the participant side is spacious and warm.

## 2. Design tokens

### Colour

| Token | Hex | Use |
| --- | --- | --- |
| `--ink` | #141414 | Headings, primary buttons, body text |
| `--paper` | #FFFFFF | Cards, surfaces |
| `--mist` | #C9D6E2 | Page frame / backdrop (light) |
| `--violet` | #7A1FD1 | Progress bar, selected state, links, focus |
| `--violet-tint` | #EFE9FF | Selected option fill, soft highlights |
| `--lavender` | #B9A8F5 | Illustration accent, sparkle badge |
| `--navy` | #0B2147 | Hero illustration, admin text, dark panels |
| `--sun` | #F7C95C | Sparkle accent, highlights |
| `--coral` | #F2713B | Secondary accent, illustration, admin primary action |
| `--cream` | #F3E9D8 | Illustration rays, soft section background |
| `--line` | #E4E3EA | Borders, dividers |
| `--muted` | #6B6B76 | Secondary text (4.5:1 on white) |
| `--error` | #C62E2E | Validation errors only |
| `--ok` | #1FA971 | "Saved" confirmation only |

Page background gradient (participant flow): `linear-gradient(160deg, #C9D6E2 0%, #E9E1FA 45%, #FBE7DC 100%)`. Landing page uses flat white with the mist frame.

Dark mode: ink and paper swap, violet lightens to #A56BFF, navy becomes #101A33.

### Typography

| Role | Font | Size / line height | Weight |
| --- | --- | --- | --- |
| Display (landing H1) | Fraunces (soft, wonky, optical size 144) | clamp(44px, 9vw, 96px) / 0.95 | 700 |
| Heading (H2) | Fraunces | 32px / 1.15 | 600 |
| Question text | Poppins | 22px mobile, 26px desktop / 1.35 | 500 |
| Body | Poppins | 16px / 1.6 | 400 |
| Label / eyebrow | Poppins | 13px, letter-spacing 0.04em | 500 |
| Admin tables | Inter | 14px / 1.45 | 400 |

Emphasis inside a sentence is **bold ink**, as in "You *don't* have to struggle in silence" (see reference 1). Use bold, not colour, for emphasis.

### Spacing, shape, depth

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72 px.
- Radii: option cards 14 px, buttons 999 px (pill), cards 24 px, phone-width container 28 px.
- Borders: 1 px `--line`; selected 1.5 px `--ink`.
- Shadows: `0 8px 30px rgba(20,20,20,0.08)` for floating cards only; nothing heavier.
- Max content width: 640 px (flow), 1200 px (landing), full width (admin).

## 3. Components

### Buttons

- **Primary:** black pill, white text, arrow icon on the right ("Next →"). Full width on mobile, pinned to the bottom of the screen. Disabled: 40% opacity, never hidden.
- **Secondary / outline:** 1.5 px ink border, transparent, pill ("Get started").
- **Text link:** underlined, small caps label ("LEARN MORE"), used for Skip and About.
- **Skip:** always visible text link under the primary button on open-ended tasks: "I'd rather skip this".

### Progress and header

- Top bar: back-chevron tile (disabled after submit, with tooltip "Answers are saved"), screen title, elapsed timer chip with clock icon.
- Progress bar: 3 px violet fill on a 25 % violet track, "Question 2 of 4" in violet label above the question.
- Timer chip appears only on the Think Without AI task and is explained on the consent screen. It is informational, never a countdown that pressures.

### Option card (radio)

- White card, 1 px `--line`, 14 px radius, 56 px minimum height, text left, circle radio right.
- Selected: `--violet-tint` fill, 1.5 px ink border, violet circle with white check.
- Hover/focus: border darkens; visible 2 px violet focus ring.
- Options are shuffled per participant; never numbered or lettered on screen.

### Likert row

- Five equal round targets (44 px touch size) labelled only at the ends ("Strongly disagree", "Strongly agree"). No colour ramp, no smileys.

### Slider (confidence, ownership)

- Violet track, ink thumb, current value shown as a number bubble. Ends labelled with words.

### Text area

- White, 14 px radius, 120 px min height, live word count in muted text (no minimum shown as an error; a gentle hint at 20 words).

### Drag-to-bin (Unplug Month)

- Task cards (pill-shaped, white) dragged into three equal bins: *Easily alone*, *Slowly alone*, *Couldn't without AI*. Bins use neutral cream/mist/lavender fills, **not** green/amber/red. Tap-to-assign fallback on mobile.

### Spot the Flaw

- Two side-by-side cards on desktop, stacked on mobile, titled "Explanation 1/2". Each sentence is a tappable row with a checkbox on the left. Ticked rows get violet-tint fill. No source labels.

### Sparkle badges and illustration

- Four-point sparkle in sun yellow, lavender and coral, used sparingly as accents near headings and on the circular "We got you" style badge.
- Hero illustration: a navy head silhouette filled with stars and planets, a person seated in calm posture. For Dependency Lab, swap the person for a person at a desk with a thought-cloud of tools. Original artwork only; do not reuse the reference illustration.
- Keep illustration decorative (`alt=""`) except the hero.

### Toasts and feedback

- "Saved" confirmation: small check and text bottom-left for 2 seconds. Errors inline under the field in `--error`.

## 4. Screens

### Landing

- Layout: logo left, nav (About, Privacy, Contact), outline "Get started" button right. Centred display headline: "Are you using AI, or is AI doing your thinking?" with a sun-yellow sparkle after it.
- Left-bottom: short promise ("20 minutes. Anonymous. No right answers.") with a text link. Right-bottom: one-line definition card (a term, pronunciation-style, and one sentence) such as **Dependence** */dɪˈpɛndəns/*.
- Primary CTA: "Start the study" (black pill).

### Consent

- Single card, four checkboxes, "Continue" disabled until all are ticked. Plain-language list of what is recorded, including time per activity.

### Question screens (all modules)

- Mobile layout from reference 2: back tile, title, timer (only where used), progress bar, question label, question, stacked option cards, pinned black "Next →".
- Background: soft blue-lavender-peach gradient behind a white sheet with 28 px top radius.
- Scenario screens add two fields under the options: "Why did you choose this?" and a confidence slider.

### Completion

- Calm illustration, participant code in a large copy-able pill, short debrief, "Withdraw my data" outline button, "Done" link.

### Admin dashboard

- Layout from reference 3: left icon rail (Overview, Responses, Export, Settings), top tab bar (Summary, Scenarios, Spot the Flaw, Perceived vs Behaviour, Qualitative), right-hand filter panel (level, experience).
- Background `--paper`; page frame `--mist`; accents navy and coral. Cards with 1 px borders, no heavy shadows.
- Bars and tables are monochrome navy with one coral highlight. Hide any cell with n < 3.
- Qualitative reader: left list of responses, centre text, right panel for theme tags.

## 5. Motion

- Screen change: 200 ms fade and 8 px upward slide. Progress bar fills with 300 ms ease-out.
- Option select: 120 ms scale 0.99 then settle; check mark draws in 150 ms.
- Sparkle: a slow 6 s rotate on the landing page only.
- Respect `prefers-reduced-motion`: disable all of the above except the progress fill.

## 6. Accessibility

- WCAG AA contrast for all text; violet on white 6.9:1; muted text on white 4.8:1.
- Minimum touch target 44 px; full keyboard operation including drag-to-bin alternatives.
- Visible focus ring 2 px violet with 2 px offset.
- Labels on every field; radio groups use `fieldset/legend`; progress exposed as `aria-valuenow`.
- Screen-reader text for timer: "Elapsed time, informational only".
- Language: plain English, reading level about grade 9; no jargon in participant copy.

## 7. Copy and tone

- Warm, direct, second person. Short sentences.
- Reassure without leading: "There are no right or wrong answers" appears on every task screen in muted text.
- Never say "dependent", "addicted" or "score" in participant-facing text before the debrief.
- Buttons: "Start the study", "Next", "Skip this", "Finish", "Withdraw my data".

## 8. Do and don't

| Do | Don't |
| --- | --- |
| Use black pills for the main action | Use green for "Next" or red for "Skip" |
| Shuffle option order | Order options from least to most dependent |
| Show saved state quietly | Show scores, streaks or badges for answers |
| Keep one illustration per screen | Add stock photos of robots or glowing brains |
| Use bold for emphasis | Colour-code answers |
| Explain the timer on consent | Track tabs, paste events or keystrokes |

## 9. Implementation notes

- CSS variables for all tokens above; one stylesheet for participant flow, one for admin.
- Fonts: Fraunces and Poppins from Google Fonts with `font-display: swap`; Inter for admin.
- Breakpoints: 360 (base), 768 (two-column Spot the Flaw), 1100 (landing hero layout, admin three-pane).
- Component names for build: `Button`, `OptionCard`, `LikertRow`, `Slider`, `TextArea`, `ProgressHeader`, `BinBoard`, `FlawCard`, `SparkleBadge`, `Toast`, `AdminCard`, `ResponseReader`.
- Asset list: logo mark, hero illustration (original), sparkle SVG set, 4 section illustrations, favicon.
