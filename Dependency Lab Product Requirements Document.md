# Dependency Lab: Product Requirements Document

Nov 10, 2026 · @Sunhith

Dependency Lab is an anonymous, web-based research instrument that measures how dependent early-career researchers are on generative AI by recording what they choose and do, not only what they say.

## 1. Overview

| Item | Detail |
| --- | --- |
| Product | Dependency Lab, an interactive data-collection website |
| Research title | Dependence on Generative AI in Academic Research: Exploring Independent Thinking and Intellectual Autonomy Among Early-Career Researchers |
| Design | Exploratory, qualitative-dominant, with structured behavioural tasks |
| Participants | 15-20 postgraduate students and early-career researchers (purposive sample), extendable to 40+ for the optional quantitative layer |
| Session length | About 20 minutes, one sitting, resumable |
| Owner | Researcher (admin); participants are anonymous |

**Core idea:** compare *perceived dependency* (self-report) with *behavioural dependency* (choices in realistic research situations, and what happens when AI is taken away). The gap between the two is the headline finding.

**Positioning:** this is a research instrument, not an AI showcase. It uses no live AI in v1, so every participant sees identical material.

## 2. Goals, non-goals and success metrics

The product succeeds if it gives the researcher clean, comparable evidence on whether participants recognise their own AI dependency.

**Goals**

- Capture behaviour (choices, time, confidence, skips) alongside self-report.
- Give every participant identical stimuli so responses are comparable.
- Keep participation anonymous, voluntary and withdrawable.
- Let the researcher view patterns, read raw text and export everything without a data engineer.

**Non-goals (v1)**

- No live ChatGPT/Claude calls inside the tasks.
- No validated psychometric score and no labelling of individuals as "AI-dependent".
- No proctoring, keystroke logging, tab tracking or hidden recording.
- No claim that AI causes any decline in thinking skills; the study reports perceptions and reported behaviour.

**Success metrics**

| Metric | Target |
| --- | --- |
| Completion rate of started sessions | 75% or higher |
| Median completion time | 15-22 minutes |
| Participants finishing the "Think Without AI" challenge with 20+ words | 70% or higher |
| Pilot (2-3 people) finds an unclear question | 0 unresolved before launch |
| Data lost to bugs or refresh | 0 responses (every screen saves on submit) |
| Export opens cleanly in Excel and SPSS/R | Yes |

## 3. Participants, ethics and consent

Participants are adults with some experience of using generative AI for academic work; consent comes before any data is stored.

| Requirement | Detail |
| --- | --- |
| Eligibility | 18+, postgraduate student or early-career researcher, has used a generative AI tool for academic work |
| Recruitment | Purposive: NITK MBA and PG cohorts, research scholars, peer referrals; share one link |
| Identity | No name, email or phone. Each person gets a random code (e.g. DL-4F9A2C) |
| Consent screen | Purpose, 20-minute length, what is recorded (answers, text, confidence, **time per activity**), voluntary, can stop any time |
| Withdrawal | On the completion screen and by quoting the code to the researcher; deletes all rows for that code |
| Neutral framing | Wording must not suggest AI use is good or bad; "any answer is equally useful" on every task |
| Debrief | After submission, explain the deliberately flawed explanation and that tasks are exploratory, not tests of ability |
| Institutional | Confirm whether NITK requires ethics-committee approval before data collection (open decision) |

## 4. Participant journey

A participant moves through 11 screens in about 20 minutes, with progress saved after every screen.

1. **Landing** (1 min): the question, who it is for, anonymity, Start button.
2. **Consent** (1 min): four required checkboxes; participant code is created only after consent.
3. **Profile** (1 min): academic level, research experience, tools used.
4. **Module 1, AI Habit Check** (3 min): 8-statement scale, frequency, tasks handed to AI.
5. **Module 2, Think Without AI** (4-6 min): write a research question and approach alone, timer visible, skip allowed.
6. **Module 3, Four Research Moments** (4 min): four scenario screens, one choice plus reason plus confidence each.
7. **Module 4, Spot the Flaw** (3 min): two explanations of one concept; pick which to trust and tick suspect sentences.
8. **Module 5, Unplug Month** (2 min): the AI-outage exercise and the "last time" recall.
9. **Module 6, Ownership Slider** (1 min): how much of a paper is yours as AI help grows.
10. **Reflection** (2 min): struggle rating, change of view, a re-rating of perceived dependency.
11. **Completion**: code, debrief, withdraw button.

Rules: one question group per screen; a visible "Skip" on open-ended tasks (a skip is data); no back-navigation after submitting a screen so answers are not revised after seeing later stimuli; resume from the last saved screen using the browser.

## 5. Interactive modules

Six modules each capture a different kind of evidence, and none asks participants only "are you dependent?".

| # | Module | What the participant does | Data captured | Why it matters |
| --- | --- | --- | --- | --- |
| 1 | AI Habit Check | Rates 8 statements, picks frequency and tasks given to AI | Likert values, frequency, task list | Perceived dependency baseline |
| 2 | Think Without AI | Writes a research question and approach alone | Text, time, confidence, difficulty, self-declared AI-free status, skip | Independent-thinking evidence |
| 3 | Four Research Moments | Chooses a first action in 4 scenarios | Option (hidden dependency tag), reason, confidence | Behavioural dependency |
| 4 | Spot the Flaw | Judges two explanations, ticks suspect sentences | Trusted option, flagged sentences, reason | Verification behaviour |
| 5 | Unplug Month | Imagines AI gone for 30 days; assigns each research task a "can I still do it?" rating | Ratings per task, text | Task-level dependency map |
| 6 | Ownership Slider | Moves a slider through 5 AI-help levels and states how much is "mine" | Ownership % at each level, text | Intellectual ownership |

### Creative mechanics

- **Unplug Month (Module 5).** A grid of 8 research tasks (choose topic, find gaps, understand a paper, summarise literature, argue a point, analyse data, write a paragraph, cite sources). For each, the participant drags a card into one of three bins: *Easily alone*, *Slowly alone*, *Couldn't without AI*. The bin choice is the data; a heatmap across participants shows which research skills are most outsourced.
- **Ownership Slider (Module 6).** A paper is shown at five levels of AI help (none, language polish, outline, full draft edited by me, full draft). At each level the participant sets "how much of this is my intellectual work" from 0-100%. Shows where each person draws the line between assistance and dependency.
- **Spot the Flaw (Module 4).** Two short explanations of *purposive sampling*, order randomised and unlabelled. One is accurate; one is fluent but wrong on three points (calls it probability sampling, claims statistical generalisation, demands 1,000 participants). Participants tick sentences they distrust, so verification is observed, not self-reported.
- **Four Research Moments (Module 3).** Options are shuffled per participant so the least-dependent choice is not always first; each option carries a hidden dependency tag (0 = independent, 3 = accept AI output).
- **Think Without AI (Module 2).** Prompt: propose one research question on social media use and academic performance of MBA students, with a few lines on how to study it. A discreet timer shows elapsed time; "I'd rather skip" is always available.

**Optional v2:** a sandboxed "AI available" version of Module 2 with a fixed, canned AI panel (same suggestions for everyone) to observe whether participants copy, edit or ignore it.

## 6. Questionnaire item bank

These are the final question texts. Scale for A: 1 Strongly disagree to 5 Strongly agree.

### A. AI Habit Check (Module 1)

| ID | Statement | Reads |
| --- | --- | --- |
| A1 | I open an AI tool before I try to solve a research problem myself. | Usage dependency |
| A2 | I feel less confident about my research work when AI is unavailable. | Reduced confidence |
| A3 | I have accepted AI output without fully understanding or verifying it. | Verification (reverse-risk) |
| A4 | I can generate research ideas without any AI help. | Independence (reverse-coded) |
| A5 | I independently verify information that AI gives me. | Verification (reverse-coded) |
| A6 | Using AI has improved my independent thinking. | Perceived benefit |
| A7 | I would be comfortable doing my next research project without AI. | Independence (reverse-coded) |
| A8 | Overall, I consider myself dependent on AI for my research. | **Perceived dependency (key item)** |

Also: **A9** frequency of AI use for research (Never / A few times a month / Weekly / Most days / Several times a day) and **A10** tasks given to AI (multi-select: topic selection, idea generation, understanding concepts, literature review, building arguments, data interpretation, academic writing, none).

### B. Four Research Moments (Module 3)

Each scenario: choose one option, then "Why did you choose this?" (text) and "How confident are you that you could do this task without AI?" (1-5). Dependency tag in brackets is hidden from participants.

**B1. Your supervisor asks you to identify a research gap in the impact of AI on student learning. What do you do first?**

- Note possible gaps on my own first \[0\]
- Read recent academic literature to spot gaps \[0\]
- Think on my own, then use AI to compare ideas \[1\]
- Ask AI for gaps, then check them against sources \[2\]
- Ask AI and go with its best suggestion \[3\]

**B2. A journal article you must use is hard to follow and the deadline is tomorrow.**

- Break it down myself and look up unfamiliar terms \[0\]
- Discuss it with a peer or supervisor \[0\]
- Try first, then ask AI to explain only the parts I couldn't follow \[1\]
- Ask AI to summarise it, then verify key points in the paper \[2\]
- Ask AI to summarise it and rely on the summary \[3\]

**B3. You need to write a literature-review paragraph on a topic.**

- Write it entirely myself \[0\]
- Write a draft myself, then use AI for language only \[1\]
- Ask AI for a draft, then rewrite after reading the sources \[2\]
- Ask AI to write it and submit with minimal edits \[3\]

**B4. AI's answer contradicts what you understood from class notes.**

- Recheck notes and academic sources independently \[0\]
- Ask a professor or peer \[0\]
- Ask the AI again or compare other AI tools \[2\]
- Go with the AI's answer \[3\]

### C. Think Without AI (Module 2)

- **C1.** "Your supervisor asks you to propose one research question on how social media use affects the academic performance of MBA students, and outline in a few sentences how you would study it. Please write it on your own, without AI or other help. There is no score and no right answer."
- **C2.** "Did you complete this without any AI help?" (Yes, entirely / Partly / No. All answers are equally useful.)
- **C3.** "How confident are you in your answer?" (1-5) and **C4.** "How difficult was it without AI?" (1-5)

### D. Spot the Flaw (Module 4)

- **D1.** "Which explanation of purposive sampling do you trust more?" (Explanation 1 / Explanation 2 / Both equally / Neither)
- **D2.** "Tick any sentence you think is incorrect or unsupported." (all 8 sentences, grouped by explanation)
- **D3.** "What made you trust or distrust it?" (text) and **D4.** confidence in your judgement (1-5)

### E. Unplug Month and Ownership Slider (Modules 5-6)

- **E1.** "Imagine AI tools are unavailable for 30 days. Sort each task: Easily alone / Slowly alone / Couldn't without AI." (8 task cards)
- **E2.** "What would be the hardest thing to do without AI, and why?" (text)
- **E3.** "At each level of AI help, how much of the paper is your own intellectual work?" (0-100 slider x 5)
- **E4.** "At what point does AI help become dependency?" (text)

### F. Reflection

- **F1.** "Did you struggle during the 'Think Without AI' task?" (1-5) plus why
- **F2.** "After these activities, do you see yourself as: more dependent on AI than I thought / about the same / less dependent than I thought?" plus why
- **F3.** A8 repeated (re-rating of perceived dependency)
- **F4.** "Anything else about how AI has changed the way you do research?" (optional text)

## 7. Functional requirements

P0 is required for the first data-collection run; P1 follows once the participant journey is stable.

| ID | Requirement | Priority |
| --- | --- | --- |
| F1 | Landing page with research purpose and Start button | P0 |
| F2 | Consent screen with 4 required checkboxes; no data stored before consent | P0 |
| F3 | Anonymous participant code generated server-side after consent | P0 |
| F4 | Profile form: level, experience, tools used | P0 |
| F5 | Modules 1-4 and reflection as specified in sections 5-6 | P0 |
| F6 | Per-screen save on submit (activity ID, answer, text, confidence, time, extra JSON) | P0 |
| F7 | Resume from last saved screen after refresh or return visit | P0 |
| F8 | Option order shuffled per participant for scenarios; explanation order randomised and recorded | P0 |
| F9 | Skip on every open-ended task, stored as "skipped" | P0 |
| F10 | Completion screen with code, debrief and withdraw-my-data button | P0 |
| F11 | Admin login via secret token; participant pages never expose admin data | P0 |
| F12 | Admin summary dashboard (section 9) | P0 |
| F13 | CSV and JSON export of all responses | P0 |
| F14 | Modules 5 and 6 (drag-to-bin grid, ownership sliders) | P1 |
| F15 | Admin filters by academic level and experience | P1 |
| F16 | Admin qualitative reader with manual tag field per response for thematic coding | P1 |
| F17 | Excel (.xlsx) export | P1 |
| F18 | English / Telugu / Hindi interface toggle | P2 |
| F19 | Sandboxed canned-AI version of Module 2 | P2 |

## 8. Data model, scoring and the perceived vs behavioural comparison

Every screen writes one row, so the dataset is tidy and exportable without transformation.

| Table | Fields |
| --- | --- |
| participants | participant\_id, created\_at, consent\_at, level, experience, tools, completed, completed\_at |
| responses | participant\_id, activity\_id, answer, explanation, confidence, time\_ms, data (JSON), created\_at; one row per participant per activity (resaving overwrites) |

**Activity IDs:** self\_assessment, think\_challenge, scenario\_1 to scenario\_4, ai\_eval, unplug, ownership, reflection.

**Derived measures (computed in the dashboard, never shown to participants)**

| Measure | Definition |
| --- | --- |
| Perceived dependency | A8 (1-5), plus its F3 re-rating; shift = F3 minus A8 |
| Behavioural index | Mean of the four scenario dependency tags (0-3) |
| Verification score | Number of the 3 flawed sentences ticked, minus ticks on sound sentences |
| Trusted the flawed text | ai\_eval answer = flawed |
| Unplug profile | Count of tasks in each bin per participant; share "couldn't without AI" per task across the sample |
| Ownership curve | Mean ownership % at each of the 5 help levels |

**Key comparison:** bucket participants by perceived dependency (1-5) and show the mean behavioural index for each bucket. A flat or inverted line (people who say "not dependent" behaving like those who say "dependent") is the study's most interesting possible finding. Report distributions and quotations; never score or label an individual.

**Spot the Flaw stimulus (fixed text)**

- *Accurate:* (1) Purposive sampling means researchers deliberately select participants because they have experience or knowledge directly relevant to the research question. (2) The aim is information-rich cases rather than a statistically representative sample. (3) Because participants are not chosen at random, findings cannot be statistically generalised to the whole population. (4) Sample size is guided by data richness and when new interviews stop revealing new themes.
- *Flawed:* (1) Purposive sampling is widely used in qualitative research to select participants who can speak to the topic. (2) **It is a probability sampling method in which every member of the population has an equal chance of being selected.** (3) **Because of this, results can be statistically generalised to the entire population with confidence.** (4) **Researchers should recruit at least 1,000 participants for a purposive sample to be valid.** Bold sentences are the three planted errors; do not bold them in the participant view.

## 9. Admin dashboard and exports

The researcher gets one private page, protected by a secret token, that shows patterns and lets them read every raw answer.

| Area | Contents |
| --- | --- |
| Overview cards | Participants started, completed, incomplete; completion rate |
| Habit Check | Mean per statement A1-A8; frequency distribution; tasks-given-to-AI counts |
| Scenarios | Choice distribution per scenario with dependency tag; mean confidence |
| Think Without AI | Mean time, confidence, difficulty; self-declared AI-free split; skip count |
| Spot the Flaw | Share trusting the flawed text; mean planted errors caught; mean false flags |
| Perceived vs behavioural | Table: perceived 1-5 against mean behavioural index and n |
| Unplug heatmap (P1) | Tasks by share "couldn't without AI" |
| Qualitative reader (P1) | Filter by activity and level; read text; add a theme tag |
| Filters | Academic level, research experience |
| Exports | CSV (long format, opens in Excel), JSON (raw), XLSX (P1) |

Small-n rule: hide any breakdown cell with fewer than 3 participants to avoid re-identification.

## 10. Tech stack, non-functional requirements and privacy

The simplest stack that survives 50 participants is one Python service with SQLite and a static frontend; move to Postgres only if volume grows.

| Layer | v1 choice | Upgrade path |
| --- | --- | --- |
| Frontend | Single-page HTML + vanilla JS, responsive | Next.js + Tailwind |
| Backend | Python FastAPI | Same |
| Database | SQLite file with daily backup | PostgreSQL |
| Charts | CSS bars / Recharts | Recharts |
| Admin auth | Secret token in an environment variable; admin disabled if unset | Proper login |
| Hosting | Render or Railway with persistent disk; HTTPS | Vercel (UI) + Render (API) |

**Non-functional requirements**

- Works on phone and laptop; no horizontal scroll at 360 px width.
- Page load under 2 seconds on a typical campus connection.
- Responses saved on every submit; refresh never loses completed screens.
- HTTPS only; no third-party trackers or analytics scripts.
- No IP addresses, names, emails or device fingerprints stored.
- Admin routes return 403 without the token; participant text is escaped on display.
- Nightly copy of the database file; delete-by-code removes all of a participant's rows.
- Same stimuli, wording and screen order for everyone except the documented randomisation.

## 11. Analysis plan

Use thematic analysis on the text responses and descriptive comparison on the structured responses; do not run inferential tests with a sample this small.

1. Export CSV; read all text responses for the 15-20 participants once without coding.
2. Code line by line (Think Without AI reasons, scenario reasons, D3, E2, E4, F1, F2, F4); add a theme tag per response.
3. Merge codes into themes. Starting frame, to be revised by the data, not confirmed by it:

| Theme | Looks like |
| --- | --- |
| Convenience-driven use | AI chosen to save time or effort |
| Cognitive outsourcing | AI used for arguments, gaps, interpretation |
| Reduced confidence | Unease when working alone |
| Trust and verification | Accepting vs checking AI output |
| Intellectual ownership | Where "mine" ends and "AI's" begins |
| Awareness and control | Noticing and limiting own reliance |

4. Compare perceived vs behavioural dependency (section 8) and note contradictions, such as low self-rating with AI-first choices.
5. Triangulate with 5-8 optional follow-up interviews (15-20 minutes) on the most contradictory cases, using screen data as prompts.
6. Report limitations: small purposive sample, self-selection, self-declared AI-free status, exploratory tasks that are not a validated measure.

## 12. Roadmap, risks and open decisions

Build and pilot in about two weeks, then collect for one week.

| Phase | Scope | Duration | Exit gate |
| --- | --- | --- | --- |
| 1 | Landing, consent, profile, Modules 1-4, reflection, save/resume, completion, CSV export | 4-5 days | Researcher completes the full journey end to end with no data loss |
| 2 | Admin dashboard, filters, Modules 5-6, JSON export | 3-4 days | Dashboard figures match a manual count on 3 test sessions |
| 3 | Pilot with 2-3 students, fix wording, freeze content | 2 days | No unclear question reported; content frozen |
| 4 | Live collection of 15-20 participants | 5-7 days | Target sample reached or deadline hit |
| 5 | Coding, thematic analysis, follow-up interviews, report | 8-10 days | Draft report |

**Risks**

| Risk | Mitigation |
| --- | --- |
| Participants use AI during "Think Without AI" | Self-declare question plus honest-answer framing; report as a limitation, no surveillance |
| Participants guess the study's aim and answer socially | Neutral wording, debrief after submission only |
| Low completion | 20-minute cap, progress bar, resume, skip allowed |
| Option order biases scenario answers | Shuffle per participant |
| Small sample cannot support statistics | Qualitative claims only; describe, do not test |
| Data loss on hosting | Persistent disk, nightly backup, export after each collection day |

**Open decisions for you**

- [ ] Does NITK require ethics approval before collection?
- [ ] Final sample frame: NITK only, or other institutions too?
- [ ] Include Telugu/Hindi versions (P2) for wider reach?
- [ ] Build now as a runnable app (FastAPI + SQLite), or hand this PRD to a developer?
