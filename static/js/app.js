/**
 * Dependency Lab: Master Client State & Interactive Research Journey Engine
 * Protocol: DL-2026
 * Pure Non-AI Empirical Data Collection Platform
 */

const STATE = {
  participantId: localStorage.getItem("dl_participant_code") || null,
  currentStepIndex: 0,
  timerSeconds: 0,
  sessionSeconds: 0,
  timerInterval: null,
  sessionInterval: null,
  audioCtx: null,
  soundEnabled: true,
  isSessionActive: false,
  isCompleted: false,
  profile: null,
  consented: false,
  scenariosShuffled: {},
  responses: {}
};

const CHEER_MESSAGES = [
  "Welcome! You are contributing to groundbreaking research on academic autonomy.",
  "Background Calibrated! Next, let's explore your regular AI habits.",
  "Honest self-reporting is vital for empirical validity. No judgment here!",
  "Challenge 1 of 3: Unassisted Idea Development. Think on your own!",
  "Challenge 2 of 3: Problem Identification. You're building great momentum!",
  "Challenge 3 of 3: Argument Construction. Last unassisted writing test!",
  "Strategic Scenario 1: How do you react when handed an open project gap?",
  "Strategic Scenario 2: What do you do with a complete 5-paper AI summary?",
  "Strategic Scenario 3: Would you submit text you don't fully comprehend?",
  "Strategic Scenario 4: Can you navigate an analytical report without AI?",
  "Critical Verification: Can you spot the planted statistical errors?",
  "Final Reflection: Metacognitive awareness after completing the tasks.",
  "Study Complete! Your anonymous research voucher has been generated."
];

const THOUGHT_STARTERS = {
  think_task_a: [
    "Angle 1: Attention fragmentation during study hours or lectures",
    "Angle 2: Academic exam retention vs smartphone screen-time",
    "Angle 3: Cognitive fatigue from continuous notification multitasking"
  ],
  think_task_b: [
    "Angle 1: Superficial comprehension vs deep procedural mastery",
    "Angle 2: Anxiety or writer's block when tested without AI in exam halls",
    "Angle 3: Homogenization of seminar ideas and loss of original student voice"
  ],
  think_task_c: [
    "Angle 1: Tool efficiency as a scaffold for higher-order reasoning",
    "Angle 2: Cognitive atrophy in thesis structuring and literature synthesis",
    "Angle 3: Balancing speed of drafting with verified personal comprehension"
  ]
};

const RESEARCH_INSTRUMENT = {
  tasksOffloadedList: [
    "Generating project ideas, seminar topics, or research questions",
    "Summarizing textbook chapters, research articles, and literature",
    "Rephrasing, grammar correction, and polishing drafts",
    "Structuring essays, project outlines, and seminar presentations",
    "Explaining complex theoretical concepts, math, or statistical formulas",
    "Writing and debugging computer code for coursework"
  ],

  thinkingChallenges: [
    {
      id: "think_task_a",
      title: "Task A: Research Idea Development",
      prompt: "Your professor or project guide asks you to choose a project topic about how smartphones, social media, or AI tools affect student focus and study habits. Propose one clear project question (e.g., 'Does checking phone notifications during study hours reduce exam retention among students?') and explain in 2 to 4 sentences why this is an important topic to study.",
      guidance: "Formulate your proposal independently without consulting external assistants. Write in your natural voice."
    },
    {
      id: "think_task_b",
      title: "Task B: Research Problem Identification",
      prompt: "College students today increasingly use AI tools like ChatGPT to generate seminar reports, essays, and homework solutions. Identify one genuine academic problem or difficulty this could create for students' long-term learning, and briefly explain why it happens.",
      guidance: "Pinpoint an underlying problem, challenge, or unintended habit worth studying."
    },
    {
      id: "think_task_c",
      title: "Task C: Independent Argument Development",
      prompt: "Some educators argue that using AI helps students learn faster and complete work more efficiently. Others argue that relying on AI weakens students' critical thinking and makes them helpless without tools. What is your personal view on this balance? Share 2 to 3 reasons explaining your perspective.",
      guidance: "State your view clearly and support it with your own personal reasoning."
    }
  ],

  scenarios: [
    {
      id: "scenario_1",
      title: "Scenario 1: Starting a New Project Topic",
      situation: "Your course professor or project guide asks your team to identify an unaddressed problem or project topic for an upcoming semester submission. What is your first action?",
      options: [
        { letter: "A", text: "Brainstorm ideas with team members or on my own first", tag: 0 },
        { letter: "B", text: "Look up recent textbooks, news, or articles to find unanswered questions", tag: 0 },
        { letter: "C", text: "Think of ideas myself first, then use AI to compare and check for blind spots", tag: 1 },
        { letter: "D", text: "Prompt AI for a list of topics, then verify which ones have good academic sources", tag: 2 },
        { letter: "E", text: "Ask AI for the best project topic and go directly with its top recommendation", tag: 3 }
      ]
    },
    {
      id: "scenario_2",
      title: "Scenario 2: Verifying an AI Article Summary",
      situation: "You need to cite five academic articles or papers for a course report. An AI tool gives you a complete, well-written summary of all five papers. What would you do before using that summary in your draft?",
      options: [
        { letter: "A", text: "Open and read the original articles or chapters myself before citing them", tag: 0 },
        { letter: "B", text: "Check the primary papers to verify key facts, numbers, and conclusions", tag: 1 },
        { letter: "C", text: "Skim the introduction and conclusion of the papers to cross-check the AI summary", tag: 2 },
        { letter: "D", text: "Use the AI summary directly without checking the original papers", tag: 3 }
      ]
    },
    {
      id: "scenario_3",
      title: "Scenario 3: Comprehending Complex Generated Text",
      situation: "An AI tool generates an explanation or argument that sounds very impressive and fluent, but you do not fully understand the technical logic or formulas it used. Would you include it in your assignment or report?",
      options: [
        { letter: "A", text: "Exclude it completely until I study and understand it myself", tag: 0 },
        { letter: "B", text: "Research the concept thoroughly, then rewrite it in my own words", tag: 1 },
        { letter: "C", text: "Include it, but ask a peer or teaching assistant to review it first", tag: 2 },
        { letter: "D", text: "Submit it as is, because the AI wrote it convincingly and it sounds high-quality", tag: 3 }
      ]
    },
    {
      id: "scenario_4",
      title: "Scenario 4: Assignment Without AI Access",
      situation: "You are instructed to complete an entire case study, analytical report, or project without any access to AI tools. How would you approach the task?",
      options: [
        { letter: "A", text: "Approach it calmly using my lecture notes, textbooks, and logical reasoning", tag: 0 },
        { letter: "B", text: "Plan out the structure on paper first, then work through it methodically", tag: 0 },
        { letter: "C", text: "Feel some friction or slower progress at first, but complete it successfully through effort", tag: 1 },
        { letter: "D", text: "Feel stressed or anxious, finding it very difficult to start without AI prompts", tag: 3 }
      ]
    }
  ],

  verificationPassage: [
    { id: 1, text: "Purposive sampling is a research method where researchers deliberately choose specific people who have direct knowledge or experience with the topic under study.", isFlawed: false },
    { id: 2, text: "It is a probability sampling method in which every single person in the whole country has an equal chance of being picked at random.", isFlawed: true },
    { id: 3, text: "Because of this equal chance, findings from a small group can be statistically generalized to the entire national population with complete certainty.", isFlawed: true },
    { id: 4, text: "Researchers are strictly required to recruit at least 1,000 participants for any purposive study to be considered valid.", isFlawed: true }
  ]
};

const JOURNEY_STEPS = [
  { id: "consent", title: "Step 1 of 8 • Informed Research Consent", stepGroup: 0, render: renderStepConsent },
  { id: "profile", title: "Step 2 of 8 • Participant Background", stepGroup: 1, render: renderStepProfile },
  { id: "dependency", title: "Step 3 of 8 • AI Usage & Dependency Assessment", stepGroup: 2, render: renderStepDependency },
  { id: "thinking_a", title: "Step 4 of 8 • Thinking Challenge (Task A)", stepGroup: 3, render: () => renderStepThinking(0), timer: true },
  { id: "thinking_b", title: "Step 4 of 8 • Thinking Challenge (Task B)", stepGroup: 4, render: () => renderStepThinking(1), timer: true },
  { id: "thinking_c", title: "Step 4 of 8 • Thinking Challenge (Task C)", stepGroup: 5, render: () => renderStepThinking(2), timer: true },
  { id: "scen_1", title: "Step 5 of 8 • Scenario 1: Starting a Project", stepGroup: 6, render: () => renderStepScenario(0) },
  { id: "scen_2", title: "Step 5 of 8 • Scenario 2: Article Summary", stepGroup: 6, render: () => renderStepScenario(1) },
  { id: "scen_3", title: "Step 5 of 8 • Scenario 3: Complex Writing", stepGroup: 6, render: () => renderStepScenario(2) },
  { id: "scen_4", title: "Step 5 of 8 • Scenario 4: Working Without AI", stepGroup: 6, render: () => renderStepScenario(3) },
  { id: "verification", title: "Step 6 of 8 • AI Content Verification Activity", stepGroup: 7, render: renderStepVerification },
  { id: "reflection", title: "Step 7 of 8 • Final Reflection", stepGroup: 8, render: renderStepReflection },
  { id: "confirmation", title: "Step 8 of 8 • Submission Confirmation", stepGroup: 8, render: renderStepConfirmation }
];

document.addEventListener("DOMContentLoaded", () => {
  bindKeyboardShortcuts();
  updateResumeButtonVisibility();
  checkForDeviceSession();
});

function persistLocalSession() {
  if (!STATE.participantId || STATE.isCompleted) return;
  const payload = {
    participantId: STATE.participantId,
    currentStepIndex: STATE.currentStepIndex,
    responses: STATE.responses,
    profile: STATE.profile || null,
    consented: STATE.consented || false,
    timestamp: Date.now()
  };
  try {
    localStorage.setItem("dl_active_session", JSON.stringify(payload));
    localStorage.setItem("dl_participant_code", STATE.participantId);
  } catch (e) {}
}

window.checkForDeviceSession = async function() {
  let saved = null;
  try {
    const raw = localStorage.getItem("dl_active_session");
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  let deviceState = null;
  try {
    const res = await fetch("/api/participant/resume-by-device");
    if (res.ok) {
      const data = await res.json();
      if (data.found && data.state && !data.state.completed) {
        deviceState = data.state;
      }
    }
  } catch (e) {}

  const activeCode = saved?.participantId || deviceState?.participant_id || localStorage.getItem("dl_participant_code");
  if (!activeCode) return;
  if (saved?.isCompleted || (deviceState && deviceState.completed)) return;

  let targetStep = 1;
  if (saved && typeof saved.currentStepIndex === "number" && saved.currentStepIndex > 0) {
    targetStep = saved.currentStepIndex;
  } else if (deviceState && deviceState.responses) {
    const cnt = Object.keys(deviceState.responses).length;
    targetStep = Math.min(cnt + 2, JOURNEY_STEPS.length - 2);
  }

  const banner = document.getElementById("deviceResumeBanner");
  const codeLabel = document.getElementById("bannerParticipantCode");
  const stepLabel = document.getElementById("bannerStepProgress");
  if (banner && codeLabel) {
    codeLabel.innerText = activeCode;
    const stepGroup = JOURNEY_STEPS[targetStep]?.stepGroup ?? 2;
    if (stepLabel) stepLabel.innerText = `Step ${stepGroup + 1} of 8`;
    banner.style.display = "flex";

    window._pendingResume = {
      participantId: activeCode,
      targetStep: targetStep,
      saved: saved,
      deviceState: deviceState
    };
  }
};

window.resumeDetectedSession = async function() {
  const pending = window._pendingResume;
  const activeCode = pending?.participantId || localStorage.getItem("dl_participant_code");
  if (!activeCode) return;

  STATE.participantId = activeCode;
  STATE.isSessionActive = true;
  localStorage.setItem("dl_participant_code", activeCode);

  if (pending?.saved?.responses) {
    STATE.responses = { ...STATE.responses, ...pending.saved.responses };
  }
  if (pending?.saved?.profile) {
    STATE.profile = pending.saved.profile;
  }
  if (pending?.saved?.consented) {
    STATE.consented = true;
  }
  if (pending?.deviceState?.responses) {
    for (const [k, v] of Object.entries(pending.deviceState.responses)) {
      if (!STATE.responses[k]) STATE.responses[k] = v;
    }
  }
  if (pending?.deviceState?.level && !STATE.profile) {
    STATE.profile = {
      level: pending.deviceState.level,
      discipline: pending.deviceState.discipline,
      experience: pending.deviceState.experience,
      tools: pending.deviceState.tools || []
    };
  }

  // Sync to server so serverless container always has the session restored
  try {
    await fetch("/api/participant/sync-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: STATE.participantId,
        current_step: pending?.targetStep || 1,
        profile: STATE.profile,
        responses: STATE.responses,
        completed: false
      })
    });
  } catch (e) {}

  const banner = document.getElementById("deviceResumeBanner");
  if (banner) banner.style.display = "none";

  document.getElementById("landingView").style.display = "none";
  document.getElementById("participantView").style.display = "block";
  document.getElementById("participantCodeLabel").innerText = `${STATE.participantId} • 🔒 Confidential`;
  updateResumeButtonVisibility();
  goToJourneyStep(pending?.targetStep || 1);
};

window.dismissDetectedSession = function() {
  localStorage.removeItem("dl_active_session");
  localStorage.removeItem("dl_participant_code");
  STATE.participantId = null;
  window._pendingResume = null;
  const banner = document.getElementById("deviceResumeBanner");
  if (banner) banner.style.display = "none";
};

window.updateResumeButtonVisibility = function() {
  const resumeBtn = document.getElementById("resumeSessionBtn");
  if (!resumeBtn) return;
  const isParticipantView = document.getElementById("participantView") && document.getElementById("participantView").style.display !== "none";
  const isSessionOngoing = STATE.isSessionActive || isParticipantView;
  resumeBtn.style.display = isSessionOngoing ? "none" : "inline-flex";
};

// Audio Haptic Chime
function playChime(freq = 880, duration = 0.08) {
  if (!STATE.soundEnabled) return;
  try {
    if (!STATE.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      STATE.audioCtx = new AudioCtx();
    }
    if (STATE.audioCtx.state === 'suspended') STATE.audioCtx.resume();
    const osc = STATE.audioCtx.createOscillator();
    const gain = STATE.audioCtx.createGain();
    const now = STATE.audioCtx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + duration);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(STATE.audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (e) {}
}

window.toggleTactileSound = function() {
  STATE.soundEnabled = !STATE.soundEnabled;
  const icon = document.getElementById("soundIcon");
  const label = document.getElementById("soundLabel");
  if (icon) icon.innerText = STATE.soundEnabled ? "🔊" : "🔇";
  if (label) label.innerText = STATE.soundEnabled ? "Sound On" : "Sound Muted";
};

// Keyboard Navigation Accelerators (1-5 to select, Enter to advance)
function bindKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    if (document.getElementById("landingView").style.display !== "none") return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key);
      const cards = document.querySelectorAll(".choice-option-card");
      if (cards.length >= idx) {
        cards[idx - 1].click();
        return;
      }
      const likertButtons = document.querySelectorAll(`.likert-target-btn:nth-child(${idx})`);
      if (likertButtons.length > 0) {
        likertButtons.forEach(b => b.click());
      }
    } else if (e.key === 'Enter') {
      const nextBtn = document.getElementById("stepNextBtn");
      if (nextBtn && !nextBtn.disabled && nextBtn.style.display !== "none") {
        e.preventDefault();
        onStepNext();
      }
    } else if (e.key === 'Escape' || e.key === 'ArrowLeft') {
      onStepBack();
    }
  });
}

// Flow Navigation
window.navigateToHome = function() {
  document.getElementById("landingView").style.display = "block";
  document.getElementById("participantView").style.display = "none";
  updateResumeButtonVisibility();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.startParticipantJourney = async function(targetStepIndex = 0) {
  // If an active session was detected and participant starts from landing page, seamlessly continue it
  if (window._pendingResume && targetStepIndex === 0) {
    resumeDetectedSession();
    return;
  }

  STATE.isSessionActive = true;
  updateResumeButtonVisibility();

  if (!STATE.participantId) {
    try {
      const res = await fetch("/api/participant/start", { method: "POST" });
      const data = await res.json();
      STATE.participantId = data.participant_id;
      localStorage.setItem("dl_participant_code", STATE.participantId);
      persistLocalSession();
    } catch (e) {
      alert("Error connecting to server. Please ensure server is running.");
      return;
    }
  }

  // Start continuous session timer
  if (!STATE.sessionInterval) {
    STATE.sessionSeconds = 0;
    STATE.sessionInterval = setInterval(() => {
      STATE.sessionSeconds++;
      updateSessionHudTimer();
    }, 1000);
  }

  document.getElementById("landingView").style.display = "none";
  document.getElementById("participantView").style.display = "block";
  document.getElementById("participantCodeLabel").innerText = `${STATE.participantId} • 🔒 Confidential`;
  updateResumeButtonVisibility();
  goToJourneyStep(targetStepIndex);
};

function updateSessionHudTimer() {
  const m = Math.floor(STATE.sessionSeconds / 60);
  const s = STATE.sessionSeconds % 60;
  const timeStr = `⏱ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const el = document.getElementById("sessionTimerText");
  if (el) el.innerText = timeStr;
}

function goToJourneyStep(idx) {
  if (idx < 0 || idx >= JOURNEY_STEPS.length) return;
  STATE.currentStepIndex = idx;
  const step = JOURNEY_STEPS[idx];

  // Update Stepper Visual Map
  updateStepperMap(step.stepGroup);

  // Update HUD Progress
  const pct = Math.round((idx / (JOURNEY_STEPS.length - 1)) * 100);
  const hudPct = document.getElementById("hudPercentLabel");
  const hudFill = document.getElementById("hudProgressFill");
  const hudStep = document.getElementById("hudStepLabel");

  if (hudPct) hudPct.innerText = `${pct}%`;
  if (hudFill) hudFill.style.width = `${pct}%`;
  if (hudStep) hudStep.innerText = `Step ${step.stepGroup + 1} of 9`;

  // Update Encouraging Milestone Cheer
  const cheerMsg = CHEER_MESSAGES[idx] || "Great momentum! Keep going.";
  document.getElementById("cheerMessage").innerText = cheerMsg;

  // Navigation buttons & helpers visibility
  const backBtn = document.getElementById("stepBackBtn");
  const nextBtn = document.getElementById("stepNextBtn");
  const autoSaveText = document.getElementById("footerAutoSaveText");
  const keyboardPill = document.querySelector(".keyboard-hint-pill");

  if (idx === JOURNEY_STEPS.length - 1) {
    if (backBtn) backBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (autoSaveText) autoSaveText.style.display = "none";
    if (keyboardPill) keyboardPill.style.display = "none";
  } else {
    if (backBtn) {
      backBtn.style.display = "inline-flex";
      backBtn.disabled = idx === 0;
    }
    if (autoSaveText) autoSaveText.style.display = "inline";
    if (keyboardPill) keyboardPill.style.display = "";
    if (nextBtn) {
      nextBtn.style.display = "inline-flex";
      if (idx === 0) {
        document.getElementById("stepNextBtnText").innerText = "I Consent & Begin";
      } else if (idx === JOURNEY_STEPS.length - 2) {
        document.getElementById("stepNextBtnText").innerText = "Submit All Responses";
      } else {
        document.getElementById("stepNextBtnText").innerText = "Continue";
      }
    }
  }

  if (step.timer) startActivityTimer();
  else stopActivityTimer();

  updateResumeButtonVisibility();
  persistLocalSession();

  const container = document.getElementById("activityBody");
  container.innerHTML = "";
  step.render(container);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStepperMap(activeGroup) {
  for (let g = 0; g <= 8; g++) {
    const node = document.getElementById(`node_${g}`);
    if (!node) continue;
    node.classList.toggle("active", g === activeGroup);
    node.classList.toggle("completed", g < activeGroup);
    const bubble = node.querySelector(".step-node-bubble");
    if (bubble) {
      if (g < activeGroup) bubble.innerHTML = "✓";
      else bubble.innerHTML = g + 1;
    }
  }
}

function startActivityTimer() {
  stopActivityTimer();
  STATE.timerSeconds = 0;
  STATE.timerInterval = setInterval(() => { STATE.timerSeconds++; }, 1000);
}

function stopActivityTimer() {
  if (STATE.timerInterval) {
    clearInterval(STATE.timerInterval);
    STATE.timerInterval = null;
  }
}

function showSavedToast() {
  const chip = document.getElementById("savedStatusChip");
  chip.classList.add("visible");
  setTimeout(() => chip.classList.remove("visible"), 2000);
}

// ----------------------------------------------------------------------
// STEP 1: INFORMED RESEARCH CONSENT
// ----------------------------------------------------------------------
function renderStepConsent(container) {
  container.innerHTML = `
    <div class="activity-header">
      <h2 class="activity-title">Informed Research Consent</h2>
      <p class="activity-instructions">
        Welcome to the Dependency Lab study. Participation is voluntary, confidential, and completely anonymous. Confirm the 4 ethical verifications below to begin:
      </p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
      <label class="choice-option-card" style="align-items: flex-start;" onclick="toggleConsentBox(1)">
        <span class="choice-badge-letter" id="badge_c_1">1</span>
        <span class="choice-option-text">
          <strong>Student & Researcher Eligibility:</strong> I confirm that I am 18 years of age or older, currently an <strong>Undergraduate (UG)</strong> or <strong>Postgraduate (PG)</strong> student, or an academic researcher, and have used AI tools (such as ChatGPT, Claude, Gemini, etc.) for college coursework, assignments, or research.
        </span>
        <input type="checkbox" id="consent_1" onchange="validateConsent()">
      </label>

      <label class="choice-option-card" style="align-items: flex-start;" onclick="toggleConsentBox(2)">
        <span class="choice-badge-letter" id="badge_c_2">2</span>
        <span class="choice-option-text">
          <strong>Academic Research Purpose:</strong> I understand that this study investigates how students and scholars use generative AI, how much they rely on it, and whether they retain independent thinking confidence.
        </span>
        <input type="checkbox" id="consent_2" onchange="validateConsent()">
      </label>

      <label class="choice-option-card" style="align-items: flex-start;" onclick="toggleConsentBox(3)">
        <span class="choice-badge-letter" id="badge_c_3">3</span>
        <span class="choice-option-text">
          <strong>Voluntary Participation & Right to Withdraw:</strong> I understand that my participation is completely voluntary. I can stop at any time or erase all my submitted data using my anonymous participant code.
        </span>
        <input type="checkbox" id="consent_3" onchange="validateConsent()">
      </label>

      <label class="choice-option-card" style="align-items: flex-start;" onclick="toggleConsentBox(4)">
        <span class="choice-badge-letter" id="badge_c_4">4</span>
        <span class="choice-option-text">
          <strong>Confidentiality & Complete Anonymity:</strong> I understand that no names, roll numbers, email addresses, or IP addresses are collected. All data is saved under an anonymous random code.
        </span>
        <input type="checkbox" id="consent_4" onchange="validateConsent()">
      </label>
    </div>

    <div id="consentStatusPill" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--accent-purple); background: var(--bg-lavender-subtle); padding: 6px 14px; border-radius: 20px;">
      Ethical Protocol: 0 / 4 Verifications Confirmed
    </div>
  `;
  if (STATE.consented) {
    [1, 2, 3, 4].forEach(i => {
      const cb = document.getElementById(`consent_${i}`);
      if (cb) cb.checked = true;
    });
  }
  validateConsent();
}

window.toggleConsentBox = function(idx) {
  const cb = document.getElementById(`consent_${idx}`);
  if (cb) {
    cb.checked = !cb.checked;
    validateConsent();
  }
};

function validateConsent() {
  const checks = [1, 2, 3, 4].map(i => {
    const cb = document.getElementById(`consent_${i}`);
    const badge = document.getElementById(`badge_c_${i}`);
    const isChecked = cb ? cb.checked : false;
    if (badge) {
      badge.innerText = isChecked ? "✓" : i;
      badge.style.background = isChecked ? "#059669" : "white";
      badge.style.color = isChecked ? "white" : "var(--accent-purple)";
    }
    return isChecked;
  });

  const count = checks.filter(Boolean).length;
  const pill = document.getElementById("consentStatusPill");
  if (pill) {
    if (count === 4) {
      pill.innerHTML = `✓ All 4 Ethical Verifications Granted! Ready to commence.`;
      pill.style.background = "#D1FAE5";
      pill.style.color = "#065F46";
      playChime(880);
    } else {
      pill.innerHTML = `Ethical Protocol: ${count} / 4 Verifications Confirmed`;
      pill.style.background = "var(--bg-lavender-subtle)";
      pill.style.color = "var(--accent-purple)";
      playChime(500 + count * 80);
    }
  }

  const valid = checks.every(Boolean);
  document.getElementById("stepNextBtn").disabled = !valid;
}

// ----------------------------------------------------------------------
// STEP 2: PARTICIPANT BACKGROUND
// ----------------------------------------------------------------------
function renderStepProfile(container) {
  container.innerHTML = `
    <div class="activity-header">
      <h2 class="activity-title">Participant Background</h2>
      <p class="activity-instructions">
        Tell us a little about your degree and academic stage. No personal identifying information is stored.
      </p>
    </div>

    <div class="form-field-group">
      <label class="field-label">1. Current Degree / Qualification Level</label>
      <select id="bg_qualification" class="field-control-select">
        <option value="Undergraduate Student (B.Tech / B.E / B.Sc / BBA / B.Com / B.A)">Undergraduate Student (B.Tech / B.E / B.Sc / BBA / B.Com / B.A)</option>
        <option value="Postgraduate Student (MBA / M.Tech / MS / M.Sc / M.A / M.Com)" selected>Postgraduate Student (MBA / M.Tech / MS / M.Sc / M.A / M.Com)</option>
        <option value="Doctoral Scholar (PhD / FPM)">Doctoral Scholar (PhD / FPM)</option>
        <option value="Postdoctoral Fellow / Early-Career Faculty / Lecturer">Postdoctoral Fellow / Early-Career Faculty / Lecturer</option>
      </select>
    </div>

    <div class="form-field-group">
      <label class="field-label">2. Academic Department / Specialization</label>
      <input type="text" id="bg_status" class="field-control-text" placeholder="e.g. Computer Science, Management, Electronics, Economics, Commerce" value="Management Studies">
    </div>

    <div class="form-field-group">
      <label class="field-label">3. College Project & Research Experience</label>
      <select id="bg_experience" class="field-control-select">
        <option value="Beginner (Doing first-time college assignments / projects)">Beginner (Doing first-time college assignments / projects)</option>
        <option value="1 to 2 years (Course projects, seminars, minor projects)" selected>1 to 2 years (Course projects, seminars, minor projects)</option>
        <option value="3 to 5 years (Major capstone project, dissertation, or thesis)">3 to 5 years (Major capstone project, dissertation, or thesis)</option>
        <option value="More than 5 years (Extensive research experience)">More than 5 years (Extensive research experience)</option>
      </select>
    </div>

    <div class="form-field-group">
      <label class="field-label">4. How long have you been using Generative AI (e.g. ChatGPT) for college work?</label>
      <select id="bg_ai_experience" class="field-control-select">
        <option value="Less than 6 months">Less than 6 months</option>
        <option value="6 to 12 months">6 to 12 months</option>
        <option value="1 to 2 years" selected>1 to 2 years</option>
        <option value="More than 2 years">More than 2 years</option>
      </select>
    </div>

    <div class="form-field-group">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label class="field-label">5. AI Tools You Regularly Use for Coursework (Select all that apply)</label>
        <span id="toolsCountBadge" style="font-size: 11.5px; font-weight: 700; color: var(--accent-purple); background: var(--bg-lavender-subtle); padding: 2px 8px; border-radius: 12px;">3 tools selected</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
        <label class="choice-option-card" style="padding: 12px 14px;"><span class="choice-option-text">ChatGPT (OpenAI)</span><input type="checkbox" name="bg_tools" value="ChatGPT" checked onchange="updateToolsCount()"></label>
        <label class="choice-option-card" style="padding: 12px 14px;"><span class="choice-option-text">Claude (Anthropic)</span><input type="checkbox" name="bg_tools" value="Claude" checked onchange="updateToolsCount()"></label>
        <label class="choice-option-card" style="padding: 12px 14px;"><span class="choice-option-text">Perplexity AI</span><input type="checkbox" name="bg_tools" value="Perplexity AI" onchange="updateToolsCount()"></label>
        <label class="choice-option-card" style="padding: 12px 14px;"><span class="choice-option-text">Gemini (Google)</span><input type="checkbox" name="bg_tools" value="Gemini" onchange="updateToolsCount()"></label>
        <label class="choice-option-card" style="padding: 12px 14px;"><span class="choice-option-text">QuillBot / Grammar AI</span><input type="checkbox" name="bg_tools" value="QuillBot" checked onchange="updateToolsCount()"></label>
        <label class="choice-option-card" style="padding: 12px 14px;"><span class="choice-option-text">GitHub Copilot</span><input type="checkbox" name="bg_tools" value="Copilot" onchange="updateToolsCount()"></label>
      </div>
    </div>
  `;

  if (STATE.profile) {
    setTimeout(() => {
      if (STATE.profile.level && document.getElementById("bg_qualification")) {
        document.getElementById("bg_qualification").value = STATE.profile.level;
      }
      if (STATE.profile.discipline && document.getElementById("bg_status")) {
        document.getElementById("bg_status").value = STATE.profile.discipline;
      }
      if (STATE.profile.experience && document.getElementById("bg_experience")) {
        document.getElementById("bg_experience").value = STATE.profile.experience;
      }
      if (STATE.profile.ai_experience && document.getElementById("bg_ai_experience")) {
        document.getElementById("bg_ai_experience").value = STATE.profile.ai_experience;
      }
      if (Array.isArray(STATE.profile.tools)) {
        document.querySelectorAll("input[name='bg_tools']").forEach(cb => {
          cb.checked = STATE.profile.tools.includes(cb.value);
        });
        updateToolsCount();
      }
    }, 10);
  }
}

window.updateToolsCount = function() {
  const count = document.querySelectorAll("input[name='bg_tools']:checked").length;
  const badge = document.getElementById("toolsCountBadge");
  if (badge) badge.innerText = `${count} tool${count === 1 ? '' : 's'} selected`;
  playChime(640);
};

// ----------------------------------------------------------------------
// STEP 3: AI USAGE AND DEPENDENCY ASSESSMENT
// ----------------------------------------------------------------------
function renderStepDependency(container) {
  container.innerHTML = `
    <div class="activity-header">
      <h2 class="activity-title">AI Usage & Dependency Assessment</h2>
      <p class="activity-instructions">
        Rate your honest habits and experiences. There are no right or wrong answers.
      </p>
    </div>

    <div class="form-field-group">
      <label class="field-label">1. How frequently do you use AI tools for college coursework or research?</label>
      <select id="dep_frequency" class="field-control-select">
        <option value="Daily / Multiple times a day">Daily / Multiple times a day</option>
        <option value="Several times a week" selected>Several times a week</option>
        <option value="About once a week">About once a week</option>
        <option value="A few times a month">A few times a month</option>
        <option value="Rarely or Never">Rarely or Never</option>
      </select>
    </div>

    <div class="form-field-group">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label class="field-label">2. Which tasks do you regularly perform using AI? (Select all that apply)</label>
        <span id="depTasksCountBadge" style="font-size: 11.5px; font-weight: 700; color: var(--accent-purple); background: var(--bg-lavender-subtle); padding: 2px 8px; border-radius: 12px;">3 of 6 tasks offloaded</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
        ${RESEARCH_INSTRUMENT.tasksOffloadedList.map((task, i) => `
          <label class="choice-option-card" style="padding: 12px 16px;">
            <span class="choice-badge-letter">${i + 1}</span>
            <span class="choice-option-text">${task}</span>
            <input type="checkbox" name="dep_tasks" value="${task}" ${i < 3 ? 'checked' : ''} onchange="updateDepTasksCount()">
          </label>
        `).join('')}
      </div>
    </div>

    <!-- 5-Point Likert Scales with Tactile Buttons -->
    <div class="likert-scale-box">
      <div class="likert-scale-prompt">3. I frequently ask AI for ideas, outlines, or suggestions before trying to think through an assignment on my own.</div>
      <div class="likert-targets-grid">
        ${[1, 2, 3, 4, 5].map(v => `<div class="likert-target-btn" id="likert_ideas_${v}" onclick="selectLikertKey('ideas', ${v})">${v}</div>`).join('')}
      </div>
      <div class="likert-range-endpoints"><span>1 (Strongly Disagree)</span><span>5 (Strongly Agree)</span></div>
    </div>

    <div class="likert-scale-box">
      <div class="likert-scale-prompt">4. I rely on AI to rephrase, write, or structure my reports and essays.</div>
      <div class="likert-targets-grid">
        ${[1, 2, 3, 4, 5].map(v => `<div class="likert-target-btn" id="likert_writing_${v}" onclick="selectLikertKey('writing', ${v})">${v}</div>`).join('')}
      </div>
      <div class="likert-range-endpoints"><span>1 (Strongly Disagree)</span><span>5 (Strongly Agree)</span></div>
    </div>

    <div class="likert-scale-box">
      <div class="likert-scale-prompt">5. I would feel confident completing a major project or assignment completely without AI tools.</div>
      <div class="likert-targets-grid">
        ${[1, 2, 3, 4, 5].map(v => `<div class="likert-target-btn" id="likert_conf_${v}" onclick="selectLikertKey('conf', ${v})">${v}</div>`).join('')}
      </div>
      <div class="likert-range-endpoints"><span>1 (Strongly Disagree)</span><span>5 (Strongly Agree)</span></div>
    </div>

    <div class="form-field-group" style="margin-top: 24px;">
      <label class="field-label">6. How frequently do you check original textbooks or papers to verify that AI's answer is accurate?</label>
      <select id="dep_verify_freq" class="field-control-select">
        <option value="Always (I check sources for every important point)">Always (I check sources for every important point)</option>
        <option value="Frequently (I check key numbers and claims)" selected>Frequently (I check key numbers and claims)</option>
        <option value="Sometimes (Only if something sounds suspicious)">Sometimes (Only if something sounds suspicious)</option>
        <option value="Rarely (I usually trust the AI's explanation)">Rarely (I usually trust the AI's explanation)</option>
        <option value="Never">Never</option>
      </select>
    </div>

    <div class="likert-scale-box">
      <div class="likert-scale-prompt">7. How difficult is it for you to formulate an academic topic or argument completely on your own?</div>
      <div class="likert-targets-grid">
        ${[1, 2, 3, 4, 5].map(v => `<div class="likert-target-btn" id="likert_diff_${v}" onclick="selectLikertKey('diff', ${v})">${v}</div>`).join('')}
      </div>
      <div class="likert-range-endpoints"><span>1 (Very Easy)</span><span>5 (Very Difficult)</span></div>
    </div>

    <div class="likert-scale-box">
      <div class="likert-scale-prompt">8. Overall, I consider myself dependent on AI tools for my college coursework and research.</div>
      <div class="likert-targets-grid">
        ${[1, 2, 3, 4, 5].map(v => `<div class="likert-target-btn" id="likert_overall_${v}" onclick="selectLikertKey('overall', ${v})">${v}</div>`).join('')}
      </div>
      <div class="likert-range-endpoints"><span>1 (Strongly Disagree)</span><span>5 (Strongly Agree)</span></div>
    </div>
  `;
}

window.updateDepTasksCount = function() {
  const count = document.querySelectorAll("input[name='dep_tasks']:checked").length;
  const badge = document.getElementById("depTasksCountBadge");
  if (badge) badge.innerText = `${count} of 6 tasks offloaded`;
  playChime(640);
};

window.selectLikertKey = function(key, val) {
  for (let v = 1; v <= 5; v++) {
    document.getElementById(`likert_${key}_${v}`)?.classList.remove("active");
  }
  document.getElementById(`likert_${key}_${val}`)?.classList.add("active");
  if (!STATE.responses.dependency) STATE.responses.dependency = {};
  STATE.responses.dependency[key] = val;
  persistLocalSession();
  playChime(440 + val * 70);
};

// ----------------------------------------------------------------------
// STEP 4: INDEPENDENT THINKING CHALLENGES (TASKS A, B, C)
// ----------------------------------------------------------------------
function renderStepThinking(taskIndex) {
  const task = RESEARCH_INSTRUMENT.thinkingChallenges[taskIndex];
  const container = document.getElementById("activityBody");
  const starters = THOUGHT_STARTERS[task.id] || [];

  container.innerHTML = `
    <div class="activity-header">
      <h2 class="activity-title">${task.title}</h2>
      <p class="activity-instructions">${task.guidance}</p>
    </div>

    <div style="background: var(--bg-lavender-subtle); border: 1.5px solid var(--border-lavender); border-radius: var(--radius-sm); padding: 22px 24px; margin-bottom: 16px;">
      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-purple); display: block; margin-bottom: 6px;">Prompt:</span>
      <p style="font-size: 15px; font-weight: 500; color: var(--text-navy); line-height: 1.55;">
        ${task.prompt}
      </p>
    </div>

    <!-- Thought Starters Expandable Accordion (Prevents boredom/writer's block) -->
    <div class="thought-starters-toggle" onclick="toggleThoughtStarters('${task.id}')">
      <span>💡 Need inspiration? Click for 3 prompt angles (does not reveal answers)</span>
      <span id="${task.id}_toggle_icon">▼</span>
    </div>
    <div class="thought-starters-drawer" id="${task.id}_starters" style="display: none;">
      <div style="font-weight: 700; margin-bottom: 6px; color: var(--accent-purple);">Consider these angles in your own words:</div>
      ${starters.map(s => `<div class="thought-starter-point"><span style="color: var(--accent-purple);">•</span> ${s}</div>`).join('')}
    </div>

    <div class="form-field-group">
      <label class="field-label">Your Unassisted Response (Write in your own natural words):</label>
      <textarea id="${task.id}_text" class="field-control-text" placeholder="Type your answer here on your own..." oninput="updateInteractiveWordMeter(this, '${task.id}')"></textarea>
      
      <!-- Real-Time Interactive Word Progress Meter -->
      <div class="word-milestone-wrap">
        <div class="word-progress-track">
          <div class="word-progress-fill" id="${task.id}_bar"></div>
        </div>
        <div class="word-stats-row">
          <span id="${task.id}_statusText">Start typing your unassisted thoughts...</span>
          <span id="${task.id}_words" style="font-weight: 700; color: var(--text-navy);">0 words</span>
        </div>
      </div>
    </div>

    <div class="likert-scale-box" style="margin-top: 24px;">
      <div class="likert-scale-prompt">How confident are you in the quality of your unassisted response?</div>
      <div class="likert-targets-grid">
        ${[1, 2, 3, 4, 5].map(v => `<div class="likert-target-btn" id="${task.id}_conf_${v}" onclick="selectTaskConf('${task.id}', ${v})">${v}</div>`).join('')}
      </div>
      <div class="likert-range-endpoints"><span>1 (Low Confidence)</span><span>5 (High Confidence)</span></div>
    </div>
  `;

  const savedResp = STATE.responses[task.id];
  if (savedResp) {
    setTimeout(() => {
      const ta = document.getElementById(`${task.id}_text`);
      if (ta && savedResp.answer) {
        ta.value = savedResp.answer;
        updateInteractiveWordMeter(ta, task.id);
      }
      if (savedResp.confidence) {
        selectTaskConf(task.id, savedResp.confidence);
      }
    }, 10);
  }
}

window.toggleThoughtStarters = function(taskId) {
  const el = document.getElementById(`${taskId}_starters`);
  const icon = document.getElementById(`${taskId}_toggle_icon`);
  if (!el) return;
  const isHidden = el.style.display === "none";
  el.style.display = isHidden ? "block" : "none";
  if (icon) icon.innerText = isHidden ? "▲" : "▼";
  playChime(700);
};

window.updateInteractiveWordMeter = function(el, taskId) {
  const words = el.value.trim() ? el.value.trim().split(/\s+/).length : 0;
  const wordBadge = document.getElementById(`${taskId}_words`);
  const progressBar = document.getElementById(`${taskId}_bar`);
  const statusText = document.getElementById(`${taskId}_statusText`);

  if (wordBadge) wordBadge.innerText = `${words} words`;

  // Scale progress to 30 words target
  const pct = Math.min(100, Math.round((words / 30) * 100));
  if (progressBar) progressBar.style.width = `${pct}%`;

  if (statusText) {
    if (words === 0) {
      statusText.innerText = "Start typing your unassisted thoughts...";
      statusText.style.color = "var(--text-navy-muted)";
    } else if (words < 10) {
      statusText.innerText = "✍️ Great start! Developing initial idea...";
      statusText.style.color = "var(--accent-purple)";
    } else if (words < 25) {
      statusText.innerText = "🔥 Good academic depth taking shape! Keep writing...";
      statusText.style.color = "var(--accent-purple)";
    } else {
      statusText.innerText = "✓ Robust academic response! Excellent clarity. 🎯";
      statusText.style.color = "var(--accent-emerald)";
    }
  }

  if (!STATE.responses[taskId]) STATE.responses[taskId] = {};
  STATE.responses[taskId].answer = el.value;
  persistLocalSession();
};

window.selectTaskConf = function(taskId, val) {
  for (let v = 1; v <= 5; v++) {
    document.getElementById(`${taskId}_conf_${v}`)?.classList.remove("active");
  }
  document.getElementById(`${taskId}_conf_${val}`)?.classList.add("active");
  if (!STATE.responses[taskId]) STATE.responses[taskId] = {};
  STATE.responses[taskId].confidence = val;
  persistLocalSession();
  playChime(440 + val * 70);
};

// ----------------------------------------------------------------------
// STEP 5: RESEARCH DECISION SCENARIOS
// ----------------------------------------------------------------------
function renderStepScenario(scenIndex) {
  const scen = RESEARCH_INSTRUMENT.scenarios[scenIndex];
  const container = document.getElementById("activityBody");

  if (!STATE.scenariosShuffled[scen.id]) {
    STATE.scenariosShuffled[scen.id] = [...scen.options].sort(() => Math.random() - 0.5);
  }
  const options = STATE.scenariosShuffled[scen.id];

  container.innerHTML = `
    <div class="activity-header">
      <h2 class="activity-title">${scen.title}</h2>
      <p class="activity-instructions">Consider what you would personally do in this realistic college situation:</p>
    </div>

    <div style="background: var(--bg-lavender-subtle); border-left: 4px solid var(--accent-purple); padding: 18px 22px; border-radius: 4px; margin-bottom: 24px;">
      <p style="font-size: 15px; font-weight: 500; color: var(--text-navy); line-height: 1.55;">
        ${scen.situation}
      </p>
    </div>

    <div class="choice-cards-stack">
      ${options.map((opt, i) => `
        <div class="choice-option-card" id="card_${scen.id}_${i}" onclick="selectScenarioOption('${scen.id}', ${i}, ${opt.tag})">
          <span class="choice-badge-letter">${opt.letter || String.fromCharCode(65 + i)}</span>
          <span class="choice-option-text">${opt.text}</span>
          <span class="choice-radio-circle"></span>
        </div>
      `).join('')}
    </div>

    <div class="form-field-group" style="margin-top: 24px;">
      <label class="field-label">Why would you choose this first action? (Explain your reasoning in a sentence)</label>
      <input type="text" id="${scen.id}_explanation" class="field-control-text" placeholder="Explain what drove this choice...">
    </div>

    <div class="likert-scale-box">
      <div class="likert-scale-prompt">How confident are you that you could handle this task without AI?</div>
      <div class="likert-targets-grid">
        ${[1, 2, 3, 4, 5].map(v => `<div class="likert-target-btn" id="${scen.id}_conf_${v}" onclick="selectScenConf('${scen.id}', ${v})">${v}</div>`).join('')}
      </div>
      <div class="likert-range-endpoints"><span>1 (Low Confidence)</span><span>5 (Complete Confidence)</span></div>
    </div>
  `;

  const savedScen = STATE.responses[scen.id];
  if (savedScen) {
    setTimeout(() => {
      if (typeof savedScen.optIndex === "number") {
        document.getElementById(`card_${scen.id}_${savedScen.optIndex}`)?.classList.add("selected");
      }
      const expInput = document.getElementById(`${scen.id}_explanation`);
      if (expInput && savedScen.explanation) {
        expInput.value = savedScen.explanation;
      }
      if (savedScen.confidence) {
        selectScenConf(scen.id, savedScen.confidence);
      }
    }, 10);
  }
}

window.selectScenarioOption = function(scenId, optIdx, tag) {
  document.querySelectorAll(`[id^="card_${scenId}_"]`).forEach(c => c.classList.remove("selected"));
  document.getElementById(`card_${scenId}_${optIdx}`)?.classList.add("selected");
  if (!STATE.responses[scenId]) STATE.responses[scenId] = {};
  STATE.responses[scenId].tag = tag;
  STATE.responses[scenId].optIndex = optIdx;
  persistLocalSession();
  playChime(750);
};

window.selectScenConf = function(scenId, val) {
  for (let v = 1; v <= 5; v++) {
    document.getElementById(`${scenId}_conf_${v}`)?.classList.remove("active");
  }
  document.getElementById(`${scenId}_conf_${val}`)?.classList.add("active");
  if (!STATE.responses[scenId]) STATE.responses[scenId] = {};
  STATE.responses[scenId].confidence = val;
  persistLocalSession();
  playChime(440 + val * 70);
};

// ----------------------------------------------------------------------
// STEP 6: AI CONTENT VERIFICATION ACTIVITY
// ----------------------------------------------------------------------
function renderStepVerification(container) {
  const passage = RESEARCH_INSTRUMENT.verificationPassage;

  container.innerHTML = `
    <div class="activity-header">
      <h2 class="activity-title">AI Content Verification Activity</h2>
      <p class="activity-instructions">
        In research, <strong>Purposive Sampling</strong> means deliberately choosing specific people who have direct, relevant experience with a topic (e.g., interviewing 12 senior startup founders to understand why new businesses fail, rather than surveying random citizens).
      </p>
      <p class="activity-instructions" style="margin-top: 6px;">
        An AI model generated the 4 sentences below to explain this method, but it introduced <strong>factual and statistical mistakes</strong>. Read through each sentence and tick the checkbox next to any sentence you believe is inaccurate, contradictory, or misleading:
      </p>
    </div>

    <div class="passage-inspection-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-purple);">
          AI-Generated Methodology Passage:
        </span>
        <span id="flaggedCountBadge" style="font-size: 12px; font-weight: 700; background: var(--bg-lavender-subtle); color: var(--accent-purple); padding: 3px 10px; border-radius: 12px;">
          Flagged: 0 statements
        </span>
      </div>

      ${passage.map(item => `
        <label class="passage-sentence-row" id="verif_row_${item.id}">
          <input type="checkbox" id="verif_check_${item.id}" onchange="toggleFlagSentence(${item.id})">
          <span>${item.text}</span>
        </label>
      `).join('')}
    </div>

    <div class="form-field-group">
      <label class="field-label">What made you question or trust these sentences? (Briefly explain your reasoning):</label>
      <textarea id="verif_reasoning" class="field-control-text" placeholder="Explain why the statements you ticked seem incorrect, or why the text seemed believable..."></textarea>
    </div>

    <div class="form-field-group">
      <label class="field-label">In your actual college coursework, when do you independently verify AI-generated explanations?</label>
      <select id="verif_practice" class="field-control-select">
        <option value="Always verify before using (Check primary empirical literature)">Always verify before submitting (Check original textbooks, notes, or papers)</option>
        <option value="Verify only if something seems unusual or counterintuitive" selected>Verify only if something sounds strange or unfamiliar</option>
        <option value="Rarely verify if the text is articulate and appears fluent">Rarely verify if the writing sounds articulate and confident</option>
        <option value="Never verify (Rely on the language model's pretraining)">Never verify (I assume the AI is accurate)</option>
      </select>
    </div>
  `;
}

window.toggleFlagSentence = function(sentenceId) {
  const cb = document.getElementById(`verif_check_${sentenceId}`);
  const row = document.getElementById(`verif_row_${sentenceId}`);
  if (cb && row) {
    row.classList.toggle("flagged", cb.checked);
  }

  const flaggedCount = [1, 2, 3, 4].filter(id => document.getElementById(`verif_check_${id}`)?.checked).length;
  const badge = document.getElementById("flaggedCountBadge");
  if (badge) {
    badge.innerText = `Flagged: ${flaggedCount} statement${flaggedCount === 1 ? '' : 's'}`;
    badge.style.background = flaggedCount > 0 ? "#FEE2E2" : "var(--bg-lavender-subtle)";
    badge.style.color = flaggedCount > 0 ? "#991B1B" : "var(--accent-purple)";
  }
  playChime(cb.checked ? 520 : 680);
};

// ----------------------------------------------------------------------
// STEP 7: FINAL REFLECTION
// ----------------------------------------------------------------------
function renderStepReflection(container) {
  container.innerHTML = `
    <div class="activity-header">
      <h2 class="activity-title">Final Reflection</h2>
      <p class="activity-instructions">
        Take a moment to reflect on your thinking process during these activities:
      </p>
    </div>

    <div class="form-field-group">
      <label class="field-label">1. Did any activity in this session make you realize that you rely on AI more than you thought?</label>
      <select id="refl_q1_choice" class="field-control-select" style="margin-bottom: 10px;">
        <option value="Yes">Yes (I noticed hesitation or a habit of relying on AI prompts)</option>
        <option value="Partly" selected>Partly (Some unassisted tasks felt a bit rusty)</option>
        <option value="No">No (I feel fully comfortable thinking unassisted)</option>
      </select>
      <input type="text" id="refl_q1_text" class="field-control-text" placeholder="Briefly explain what you noticed about your thinking...">
    </div>

    <div class="form-field-group">
      <label class="field-label">2. Which college coursework or research task would be hardest for you if AI tools disappeared for 30 days?</label>
      <textarea id="refl_q2_text" class="field-control-text" placeholder="e.g. summarizing 20 papers, starting a fresh blank essay, debugging code, phrasing arguments..."></textarea>
    </div>

    <div class="form-field-group">
      <label class="field-label">3. Has your confidence in conducting independent research changed since you started using AI?</label>
      <select id="refl_q3_choice" class="field-control-select" style="margin-bottom: 10px;">
        <option value="Decreased">Decreased (I feel less confident without digital verification)</option>
        <option value="Unchanged" selected>Unchanged (I feel equally capable)</option>
        <option value="Increased">Increased (AI has broadened my knowledge baseline)</option>
      </select>
      <input type="text" id="refl_q3_text" class="field-control-text" placeholder="How has your confidence evolved?">
    </div>

    <div class="form-field-group">
      <label class="field-label">4. What advice would you give fellow students to avoid becoming overly dependent on AI?</label>
      <textarea id="refl_q4_text" class="field-control-text" placeholder="Share your suggestions for retaining intellectual autonomy..."></textarea>
    </div>
  `;
}

// ----------------------------------------------------------------------
// STEP 8: SUBMISSION CONFIRMATION & CERTIFICATE
// ----------------------------------------------------------------------
function renderStepConfirmation(container) {
  // Fire celebratory confetti!
  triggerConfetti();

  const confirmedCode = STATE.participantId || STATE.completedParticipantId || localStorage.getItem("dl_participant_code") || "DL-COMPLETED";
  STATE.completedParticipantId = confirmedCode;

  STATE.isSessionActive = false;
  STATE.isCompleted = true;
  STATE.participantId = null;
  localStorage.removeItem("dl_active_session");
  localStorage.removeItem("dl_participant_code");
  window._pendingResume = null;
  const banner = document.getElementById("deviceResumeBanner");
  if (banner) banner.style.display = "none";
  updateResumeButtonVisibility();

  // Hide bottom navigation & keyboard shortcuts on confirmation view
  const backBtn = document.getElementById("stepBackBtn");
  const nextBtn = document.getElementById("stepNextBtn");
  const autoSaveText = document.getElementById("footerAutoSaveText");
  const keyboardPill = document.querySelector(".keyboard-hint-pill");
  if (backBtn) backBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";
  if (autoSaveText) autoSaveText.style.display = "none";
  if (keyboardPill) keyboardPill.style.display = "none";

  container.innerHTML = `
    <div style="text-align: center; padding: 20px 0;">
      <div style="width: 72px; height: 72px; background: #D1FAE5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #059669; margin: 0 auto 20px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.2);">
        ✓
      </div>

      <h2 style="font-family: var(--font-serif); font-size: 30px; color: var(--text-navy); margin-bottom: 12px;">
        Thank You for Contributing to This Research
      </h2>

      <p style="font-size: 15.5px; color: var(--text-navy-secondary); max-width: 560px; margin: 0 auto 28px; line-height: 1.6;">
        Your participation helps us understand the relationship between generative AI, independent thinking and academic research among undergraduate and postgraduate scholars.
      </p>

      <div style="background: var(--bg-lavender-subtle); border: 1.5px dashed var(--border-lavender); border-radius: var(--radius-md); padding: 24px; max-width: 440px; margin: 0 auto 28px;">
        <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-navy-muted); display: block; margin-bottom: 6px;">
          Anonymous Submission Confirmation Code
        </span>
        <div style="font-family: var(--font-mono); font-size: 28px; font-weight: 800; color: var(--accent-purple); letter-spacing: 0.06em;">
          ${confirmedCode}
        </div>
        <p style="font-size: 12px; color: var(--text-navy-muted); margin-top: 6px;">
          Please retain this code for reference or if you wish to exercise your ethical right to withdraw your data.
        </p>
        <button class="btn btn-outline" style="margin-top: 14px; padding: 8px 18px; font-size: 13px;" onclick="navigator.clipboard.writeText('${confirmedCode}'); alert('Code copied to clipboard: ' + '${confirmedCode}')">
          Copy Confirmation Code 📋
        </button>
      </div>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-lavender); border-radius: var(--radius-md); padding: 22px; text-align: left; max-width: 600px; margin: 0 auto 30px; box-shadow: var(--shadow-subtle);">
        <h4 style="font-size: 14.5px; font-weight: 700; color: var(--text-navy); margin-bottom: 8px;">Methodological Debrief</h4>
        <p style="font-size: 13.5px; color: var(--text-navy-secondary); line-height: 1.6;">
          <strong>Content Verification Note:</strong> The passage in Activity 6 contained three deliberately planted errors: (1) Purposive sampling was mislabelled as a probability method; (2) Findings were falsely claimed to possess generalizability to the entire population; and (3) An arbitrary minimum of 1,000 subjects was asserted. This activity tests whether scholars critically scrutinize fluent AI-generated text.
        </p>
      </div>

      <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
        <button class="btn btn-outline" style="color: var(--accent-crimson); border-color: #FECACA;" onclick="withdrawParticipantData()">
          Withdraw & Erase My Submission
        </button>
        <button class="btn btn-purple" onclick="navigateToHome()">
          Return to Overview
        </button>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------
// TRANSITIONS & AUTOSAVE HANDLERS
// ----------------------------------------------------------------------
async function onStepNext() {
  const idx = STATE.currentStepIndex;

  if (idx === 0) {
    STATE.consented = true;
    await fetch("/api/participant/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_id: STATE.participantId })
    });
  } else if (idx === 1) {
    const qual = document.getElementById("bg_qualification")?.value;
    const status = document.getElementById("bg_status")?.value;
    const exp = document.getElementById("bg_experience")?.value;
    const tools = Array.from(document.querySelectorAll("input[name='bg_tools']:checked")).map(c => c.value);
    STATE.profile = {
      level: qual,
      discipline: status,
      experience: exp,
      tools: tools
    };
    await fetch("/api/participant/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: STATE.participantId,
        level: qual,
        discipline: status,
        experience: exp,
        tools: tools
      })
    });
    showSavedToast();
  } else if (idx === 2) {
    const freq = document.getElementById("dep_frequency")?.value;
    const tasks = Array.from(document.querySelectorAll("input[name='dep_tasks']:checked")).map(c => c.value);
    const verifyFreq = document.getElementById("dep_verify_freq")?.value;
    const depData = STATE.responses.dependency || {};
    const overallVal = depData.overall || 3;
    STATE.responses.dependency = {
      ...depData,
      frequency_usage: freq,
      tasks_used: tasks,
      verify_frequency: verifyFreq,
      overall: overallVal
    };

    await fetch("/api/participant/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: STATE.participantId,
        activity_id: "dependency_assessment",
        answer: String(overallVal),
        data: {
          frequency_usage: freq,
          tasks_used: tasks,
          reliance_ideas: depData.ideas || 3,
          reliance_writing: depData.writing || 3,
          confidence_without_ai: depData.conf || 3,
          verify_frequency: verifyFreq,
          difficulty_independent: depData.diff || 3,
          overall_dependency: overallVal
        }
      })
    });
    showSavedToast();
  } else if (idx >= 3 && idx <= 5) {
    const taskIdx = idx - 3;
    const task = RESEARCH_INSTRUMENT.thinkingChallenges[taskIdx];
    const text = document.getElementById(`${task.id}_text`)?.value || "";
    const conf = STATE.responses[task.id]?.confidence || 3;

    await fetch("/api/participant/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: STATE.participantId,
        activity_id: task.id,
        answer: text,
        confidence: conf,
        time_ms: STATE.timerSeconds * 1000
      })
    });
    showSavedToast();
  } else if (idx >= 6 && idx <= 9) {
    const scenIdx = idx - 6;
    const scen = RESEARCH_INSTRUMENT.scenarios[scenIdx];
    const exp = document.getElementById(`${scen.id}_explanation`)?.value || "";
    const tag = STATE.responses[scen.id]?.tag ?? 0;
    const conf = STATE.responses[scen.id]?.confidence || 4;

    await fetch("/api/participant/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: STATE.participantId,
        activity_id: scen.id,
        answer: `Option Tag [${tag}]`,
        explanation: exp,
        confidence: conf,
        data: { dependency_tag: tag }
      })
    });
    showSavedToast();
  } else if (idx === 10) {
    const flagged = [1, 2, 3, 4].filter(id => document.getElementById(`verif_check_${id}`)?.checked);
    const reasoning = document.getElementById("verif_reasoning")?.value || "";
    const practice = document.getElementById("verif_practice")?.value;
    STATE.responses.verification_activity = {
      flagged: flagged,
      reasoning: reasoning,
      practice: practice
    };

    await fetch("/api/participant/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: STATE.participantId,
        activity_id: "verification_activity",
        answer: `Flagged ${flagged.length} statement(s)`,
        explanation: reasoning,
        data: {
          flagged_errors: flagged,
          verify_decision: practice
        }
      })
    });
    showSavedToast();
  } else if (idx === 11) {
    const q1Choice = document.getElementById("refl_q1_choice")?.value;
    const q1Text = document.getElementById("refl_q1_text")?.value;
    const q2Text = document.getElementById("refl_q2_text")?.value;
    const q3Choice = document.getElementById("refl_q3_choice")?.value;
    const q4Text = document.getElementById("refl_q4_text")?.value;
    STATE.responses.final_reflection = {
      rely_more: q1Choice,
      hardest_task: q2Text,
      conf_changed: q3Choice,
      avoid_advice: q4Text
    };

    await fetch("/api/participant/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: STATE.participantId,
        activity_id: "final_reflection",
        answer: q1Choice,
        explanation: q1Text,
        data: {
          rely_more: q1Choice,
          hardest_task: q2Text,
          conf_changed: q3Choice,
          avoid_advice: q4Text
        }
      })
    });

    await fetch("/api/participant/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_id: STATE.participantId })
    });
    showSavedToast();
  }

  persistLocalSession();
  goToJourneyStep(idx + 1);
}

function onStepBack() {
  if (STATE.currentStepIndex > 0) {
    goToJourneyStep(STATE.currentStepIndex - 1);
  }
}

async function withdrawParticipantData() {
  const codeToWithdraw = STATE.participantId || STATE.completedParticipantId || localStorage.getItem("dl_participant_code");
  if (!codeToWithdraw) {
    alert("No active session code found to withdraw.");
    navigateToHome();
    return;
  }
  if (confirm(`Warning: This will permanently erase all submitted responses for ${codeToWithdraw} from the research database. This action is irreversible. Do you wish to proceed?`)) {
    await fetch("/api/participant/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_id: codeToWithdraw })
    });
    STATE.isSessionActive = false;
    STATE.participantId = null;
    STATE.completedParticipantId = null;
    localStorage.removeItem("dl_active_session");
    localStorage.removeItem("dl_participant_code");
    window._pendingResume = null;
    const banner = document.getElementById("deviceResumeBanner");
    if (banner) banner.style.display = "none";
    updateResumeButtonVisibility();
    alert("All your responses have been permanently withdrawn and erased from the dataset.");
    navigateToHome();
  }
}

async function submitResumeSession() {
  const code = document.getElementById("resumeInputCode")?.value.trim().toUpperCase();
  if (!code) return;
  try {
    const res = await fetch(`/api/participant/state/${code}`);
    if (res.ok) {
      const state = await res.json();
      closeModal("resumeModal");
      STATE.participantId = state.participant_id;
      STATE.isSessionActive = true;
      localStorage.setItem("dl_participant_code", STATE.participantId);

      let targetStep = 1;
      if (state.responses && typeof state.responses === "object") {
        for (const [k, v] of Object.entries(state.responses)) {
          STATE.responses[k] = v;
        }
        const respCount = Object.keys(state.responses).length;
        if (respCount > 0) {
          targetStep = Math.min(respCount + 2, JOURNEY_STEPS.length - 2);
        }
      }
      if (state.level) {
        STATE.profile = {
          level: state.level,
          discipline: state.discipline,
          experience: state.experience,
          tools: state.tools || []
        };
      }
      persistLocalSession();
      updateResumeButtonVisibility();

      document.getElementById("landingView").style.display = "none";
      document.getElementById("participantView").style.display = "block";
      document.getElementById("participantCodeLabel").innerText = `${STATE.participantId} • 🔒 Confidential`;
      goToJourneyStep(targetStep);
    } else {
      alert("Participant code not found or was previously erased.");
    }
  } catch (e) {
    alert("Error fetching session. Please check your internet connection.");
  }
}

window.openModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
};

window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
};

// Pure Lightweight Canvas Confetti
function triggerConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#6D28D9", "#8B5CF6", "#059669", "#F2713B", "#3B82F6", "#EC4899"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16 - 5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008
    });
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.alpha -= p.decay;
      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size * 1.5);
        ctx.restore();
      }
    });
    if (active) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}
