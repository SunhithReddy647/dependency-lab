# Dependency Lab: Behavioral Research Platform

> **Research Title:** *Dependence on Generative AI in Academic Research: Exploring Independent Thinking and Intellectual Autonomy Among Early-Career Researchers*

Dependency Lab is an anonymous, web-based behavioral research platform designed to measure how dependent early-career scholars and postgraduates are on generative AI by recording **what they choose and do**, rather than solely **what they self-report**.

---

## 🌟 The Core Scientific Insight: The Illusion of Autonomy

In self-report surveys, researchers often underreport their cognitive reliance on generative AI due to social desirability or an *illusion of competence*. 

Dependency Lab solves this by triangulating **perceived dependency** against **revealed behavioral choices**:
1. **Self-Report Baseline (A1–A8):** Standardized Likert psychometric battery.
2. **Cognitive Sandbox ("Think Without AI"):** Solo unassisted formulation of a research inquiry with latency tracking, word milestones, and difficulty ratings.
3. **Micro-Decision Scenarios (Moments 1–4):** High-stakes academic crises with dynamically randomized option ordering and hidden dependency indices (`[0]` Autonomous to `[3]` Direct AI Reliance).
4. **Critical Peer Review ("Spot the Flaw"):** Two competing explanations of purposive sampling where one contains three planted statistical and methodological fallacies.
5. **Cognitive Outage ("Unplug Month"):** Drag-and-drop vulnerability mapping across 8 core research tasks.
6. **Intellectual Ownership Spectrum:** 5-tier slider mapping personal authorship decay as AI involvement escalates.
7. **Metacognitive Confrontation:** Measuring perception shift after behavioral friction.

---

## 🎨 Visual & Experience Design Architecture

Inspired by three design references:
1. **Editorial Zen (Landing Page):** Display serif Fraunces typography, custom cosmic consciousness vector art, Web Audio API procedural focus soundscape, and pronunciation definition cards.
2. **Mobile Aptitude Rigor (Participant Flow):** Focused card container, violet progress indicator, informational elapsed timer chip, and bottom-pinned action pill.
3. **SaaS Survey & Analytics Command (Researcher Admin):** Dual-navigation rail, stratified cohort filtering, SVG scatter/decay plots, small-n privacy masking ($n < 3$), and an interactive qualitative thematic coder.

---

## 🚀 Running the Application

The application is completely self-contained with Python FastAPI, SQLite, and vanilla CSS3/ES6 JavaScript.

### 1. Launch the Server
```bash
python server.py
```

### 2. Access the Applications
- **Participant Research Instrument:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Researcher Command & Analytics Portal:** [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)

### 3. Run Automated Tests
```bash
python test_app.py
```

---

## 📊 Researcher Admin Features (`/admin`)

- **The Landmark Comparison Matrix:** Scatter & bar chart comparing self-assessed dependency ($A8$) with the observed Scenario Behavioral Index.
- **Spot the Flaw Detection:** Tracks the percentage of scholars who accept fluent but flawed academic methodology.
- **Unplug Task Vulnerability Heatmap:** Ranks tasks from most outsourced to least outsourced.
- **Thematic Qualitative Reader:** Filter open responses, assign qualitative codes (`Cognitive Outsourcing`, `Illusion of Autonomy`, `Verification Fatigue`, `Convenience`), and view discipline breakdowns.
- **One-Click Cohort Seeding:** Instantly populate 18+ realistic simulated scholar profiles across STEM, Business, and Humanities for pilot demonstrations.
- **Data Vault:** One-click instant download of tidy, RFC-4180 compliant CSVs ready for SPSS, R, Python pandas, and Excel.

---

## 🛡️ Ethics, Privacy & Anonymity

- **Zero PII:** No names, emails, student IDs, or IP addresses are stored.
- **Anonymous Tokens:** Each participant receives a unique code (e.g. `DL-8F4A19`).
- **Complete Erasure:** Participants can click **"Withdraw My Data"** at any time to instantly delete all associated rows from the database.
- **Small-$n$ Masking:** Demographic cells with fewer than 3 participants are automatically masked to prevent deductive re-identification.

