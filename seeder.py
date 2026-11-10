"""
Dependency Lab: Realistic Research Cohort Seeder
Generates authentic early-career researcher records aligned with the
eight-step academic protocol DL-2026.
"""

import random
import json
from datetime import datetime
from database import (
    get_connection, create_participant, record_consent,
    update_profile, save_response, complete_participant, add_theme_tag
)

COHORTS = [
    {"level": "Master's (MBA / M.Tech / MS)", "discipline": "Management Studies", "experience": "1-2 years", "tools": ["ChatGPT", "Perplexity AI"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Computer Science & AI", "experience": "3-5 years", "tools": ["Claude", "ChatGPT", "GitHub Copilot"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Economics & Public Policy", "experience": "2-3 years", "tools": ["ChatGPT", "Consensus"]},
    {"level": "Master's (MBA / M.Tech / MS)", "discipline": "Information Systems", "experience": "< 1 year", "tools": ["ChatGPT", "Gemini"]},
    {"level": "Postdoctoral Fellow", "discipline": "Cognitive Science", "experience": "5+ years", "tools": ["Claude", "Scite"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Mechanical Engineering", "experience": "3-4 years", "tools": ["ChatGPT"]},
    {"level": "Master's (MBA / M.Tech / MS)", "discipline": "Finance & Analytics", "experience": "1-2 years", "tools": ["ChatGPT", "Perplexity AI"]},
    {"level": "Early Career Faculty / RA", "discipline": "Organizational Behavior", "experience": "4-6 years", "tools": ["Claude", "ChatGPT"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Biotechnology", "experience": "2-4 years", "tools": ["ChatGPT", "Elicit"]},
    {"level": "Master's (MBA / M.Tech / MS)", "discipline": "Marketing Management", "experience": "< 1 year", "tools": ["ChatGPT"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Sociology", "experience": "3-5 years", "tools": ["ChatGPT", "Claude"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Operations Research", "experience": "2-3 years", "tools": ["Claude", "ChatGPT"]},
    {"level": "Master's (MBA / M.Tech / MS)", "discipline": "Human Resources", "experience": "1-2 years", "tools": ["ChatGPT"]},
    {"level": "Postdoctoral Fellow", "discipline": "Data Science", "experience": "5+ years", "tools": ["Claude", "Copilot"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Environmental Engineering", "experience": "2-4 years", "tools": ["ChatGPT", "Perplexity AI"]},
    {"level": "Master's (MBA / M.Tech / MS)", "discipline": "Supply Chain", "experience": "1-2 years", "tools": ["ChatGPT"]},
    {"level": "Doctoral Scholar (PhD)", "discipline": "Education & Learning Sciences", "experience": "3-4 years", "tools": ["Claude", "ChatGPT"]},
    {"level": "Early Career Faculty / RA", "discipline": "Strategy & Innovation", "experience": "4-5 years", "tools": ["ChatGPT", "Claude"]}
]

TASK_A_RESPONSES = [
    "RQ: How does the integration of mobile micro-learning platforms influence cognitive retention and self-directed study habits among first-year business postgraduates? This direction addresses the empirical gap between high engagement metrics and actual conceptual depth.",
    "Investigate whether automated grammar checkers reduce syntactic variety in student writing. By comparing pre- and post-submission essay drafts, we can determine whether style standardization hampers expressive scholarly range.",
    "RQ: What is the impact of asynchronous discussion forums on critical inquiry in hybrid seminars? It is worth investigating because interaction frequency often masks superficial cognitive engagement."
]

TASK_B_RESPONSES = [
    "Postgraduate students increasingly rely on digital reference managers and summarizers to skim academic literature, leading to a decline in deep synthesis and citation context comprehension.",
    "A major research problem is the cognitive fragmentation caused by multi-tab digital workflows during analytical reading, which impairs synthesis of contradictory theoretical arguments.",
    "Students outsource mathematical model formulation to automated solvers without grasping underlying boundary conditions, creating fragility when novel edge cases arise."
]

TASK_C_RESPONSES = [
    "While AI can accelerate mechanical literature discovery, relying on it for conceptual framing risks cognitive atrophy. When researchers outsource initial hypothesis formulation, they bypass the epistemic friction where original synthesis occurs.",
    "Generative tools enhance productivity by serving as a dialectical sparring partner; however, intellectual autonomy is compromised when scholars accept syntheses without verifying foundational claims against primary sources.",
    "AI is merely an epistemic instrument akin to statistical calculators. Intellectual dependency arises not from tool use itself, but from the uncritical delegation of evaluative responsibility to automated outputs."
]

SCENARIO_DATA = {
    "scenario_1": [
        ("Note initial conceptual gaps on my own before consulting external sources", 0, "Formulating my own baseline prevents anchor bias from automated or pre-structured lists."),
        ("Read recent peer-reviewed literature discussion sections to spot gaps", 0, "Published papers explicitly delineate unresolved empirical tensions."),
        ("Formulate potential directions myself, then use AI to check for oversights", 1, "Balancing personal ideation with a secondary breadth check."),
        ("Ask AI for research gaps, then look up academic papers to verify them", 2, "Using AI for rapid ideation while retaining verification responsibility."),
        ("Ask AI for gaps and proceed directly with its most promising recommendation", 3, "AI identifies trending topics efficiently under tight timeline constraints.")
    ],
    "scenario_2": [
        ("Read all five original research papers in full before referencing them", 0, "Summaries inevitably omit crucial methodological qualifiers and boundary conditions."),
        ("Check the primary papers to verify key statistics, hypotheses, and conclusions", 1, "Targeted verification ensures empirical accuracy while saving reading time."),
        ("Skim the abstracts and discussion sections to cross-check the summary", 2, "Cross-checking core claims provides adequate safeguard against hallucination."),
        ("Use the AI summary directly since the tool has proven reliable in the past", 3, "Under deadline pressure, trusting the automated synthesis is practical.")
    ],
    "scenario_3": [
        ("Exclude the argument entirely until I have independently studied and verified it", 0, "Submitting claims without intellectual comprehension violates academic integrity."),
        ("Investigate the underlying theory thoroughly, then rewrite it in my own words", 1, "Using the AI prompt as a pointer for genuine personal learning."),
        ("Include the argument but seek feedback from a peer or faculty advisor", 2, "External validation from mentors mitigates personal uncertainty."),
        ("Include the argument with minor stylistic edits since it sounds convincing and fluent", 3, "The academic phrasing is articulate and authoritative, so I trust it.")
    ],
    "scenario_4": [
        ("Rely entirely on primary textbooks, notes, and peer discussions", 0, "Traditional unassisted inquiry strengthens foundational problem-solving resilience."),
        ("Map out the assignment structure and arguments independently before writing", 0, "Planning without external automation forces active cognitive retrieval."),
        ("Find the assignment challenging and time-consuming, but complete it through perseverance", 1, "Experiencing friction without tools reveals areas where personal skills need reinforcement."),
        ("Feel anxious and consider seeking an exemption or waiting until tools are available", 3, "Complete reliance on AI prompts makes unassisted execution feel daunting.")
    ]
}

def seed_cohort():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) as count FROM participants")
    if c.fetchone()["count"] >= 12:
        conn.close()
        return 18
    conn.close()

    seeded = 0
    for i, profile in enumerate(COHORTS):
        pid = create_participant()
        record_consent(pid)
        update_profile(pid, profile["level"], profile["discipline"], profile["experience"], profile["tools"])

        persona = i % 4
        # Persona 0: Low self-reported dependency (1-2), high scenario outsourcing (2-3) -> Illusion of Autonomy
        # Persona 1: High self-reported dependency (4-5), high scenario outsourcing (2-3) -> Transparent Dependent
        # Persona 2: Low self-reported dependency (1-2), autonomous scenario choices (0-1) -> True Autonomous
        # Persona 3: Moderate (3), mixed choices (1-2)

        if persona == 0:
            dep_rating = random.choice([1, 2])
            scen_weights = [0.05, 0.15, 0.40, 0.40]
            errors_ticked = random.choice([[1], [1, 2]])
            rely_shift = "Yes"
        elif persona == 1:
            dep_rating = random.choice([4, 5])
            scen_weights = [0.05, 0.20, 0.45, 0.30]
            errors_ticked = [1]
            rely_shift = "About the same"
        elif persona == 2:
            dep_rating = random.choice([1, 2])
            scen_weights = [0.70, 0.20, 0.10, 0.00]
            errors_ticked = [1, 2, 3] # Caught all 3 errors!
            rely_shift = "No"
        else:
            dep_rating = 3
            scen_weights = [0.25, 0.45, 0.20, 0.10]
            errors_ticked = [1, 2]
            rely_shift = "Partly"

        # 1. Dependency Assessment
        save_response(
            pid, "dependency_assessment",
            answer=str(dep_rating),
            confidence=random.randint(3, 5),
            data={
                "frequency_usage": random.choice(["Daily / Multiple times a day", "Most days", "Weekly"]),
                "tasks_used": random.sample(["Literature review", "Idea generation", "Academic writing", "Data interpretation", "Proofreading"], k=random.randint(2, 4)),
                "reliance_ideas": random.randint(3, 5) if persona in [0, 1] else random.randint(1, 2),
                "reliance_writing": random.randint(3, 5) if persona in [0, 1] else random.randint(1, 3),
                "confidence_without_ai": random.randint(1, 3) if persona in [0, 1] else random.randint(4, 5),
                "verify_frequency": random.choice(["Sometimes", "Rarely"]) if persona in [0, 1] else random.choice(["Always", "Frequently"]),
                "difficulty_independent": random.randint(3, 5) if persona in [0, 1] else random.randint(1, 2)
            }
        )

        # 2. Thinking Challenges A, B, C
        save_response(pid, "think_task_a", answer=random.choice(TASK_A_RESPONSES), confidence=random.randint(3, 5), time_ms=random.randint(90000, 240000))
        save_response(pid, "think_task_b", answer=random.choice(TASK_B_RESPONSES), confidence=random.randint(3, 5), time_ms=random.randint(80000, 210000))
        save_response(pid, "think_task_c", answer=random.choice(TASK_C_RESPONSES), confidence=random.randint(3, 5), time_ms=random.randint(110000, 280000))

        # 3. Decision Scenarios 1 to 4
        for s_key in ["scenario_1", "scenario_2", "scenario_3", "scenario_4"]:
            options = SCENARIO_DATA[s_key]
            tag = random.choices([0, 1, 2, 3], weights=scen_weights)[0]
            matched = [o for o in options if o[1] == tag]
            chosen = matched[0] if matched else options[0]
            save_response(
                pid, s_key,
                answer=chosen[0],
                explanation=chosen[2],
                confidence=random.randint(3, 5),
                data={"dependency_tag": chosen[1]}
            )

        # 4. Content Verification Activity
        save_response(
            pid, "verification_activity",
            answer=f"Identified {len(errors_ticked)} questionable statement(s)",
            explanation="The text claims purposive sampling is a probability method and asserts statistical generalizability, which are fundamental methodological contradictions.",
            confidence=random.randint(3, 5),
            data={
                "flagged_errors": errors_ticked,
                "verify_decision": "Always verify before using" if persona == 2 else "Verify only if something seems unusual"
            }
        )

        # 5. Final Reflection
        save_response(
            pid, "final_reflection",
            answer=rely_shift,
            explanation="When challenged to write arguments from a blank page without prompting an LLM, I noticed cognitive hesitation and a compulsion to check AI phrasing.",
            data={
                "rely_more": rely_shift,
                "hardest_task": "Synthesizing theoretical literature review without automated summarizers",
                "conf_changed": "Decreased" if persona == 0 else "Unchanged",
                "avoid_advice": "Draft initial ideas and hypotheses with pen and paper before touching any digital assistant."
            }
        )

        # Qualitative tags
        if persona == 0:
            add_theme_tag(pid, "think_task_c", "Illusion of Autonomy", "Low self-reported dependency contradicted by high reliance choices.")
        elif persona == 1:
            add_theme_tag(pid, "final_reflection", "Cognitive Outsourcing", "Acknowledges substantial reliance for synthesis tasks.")
        elif persona == 2:
            add_theme_tag(pid, "verification_activity", "Critical Verification", "Identified all planted methodological fallacies.")

        complete_participant(pid)
        seeded += 1

    return seeded
