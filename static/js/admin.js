/**
 * Dependency Lab: Researcher Analytical Suite (Protocol DL-2026)
 * Upscaled Institutional Command Dashboard with Live Empirical Telemetry
 */

let CURRENT_TAB = 'dashboard';
let CACHED_METRICS = null;
let CACHED_PARTICIPANTS = [];

document.addEventListener("DOMContentLoaded", () => {
  initAdminTheme();
  refreshAdminData();
});

function initAdminTheme() {
  const saved = localStorage.getItem("admin_theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  setAdminTheme(theme);
}

function setAdminTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("admin_theme", theme);
  const icon = document.getElementById("themeToggleIcon");
  const text = document.getElementById("themeToggleText");
  if (icon) icon.innerText = theme === "dark" ? "🌙" : "☀️";
  if (text) text.innerText = theme === "dark" ? "Dark" : "Light";
}

window.toggleAdminTheme = function() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  setAdminTheme(next);
};

function switchAdminTab(tabName) {
  CURRENT_TAB = tabName;

  const railItems = document.querySelectorAll(".admin-rail .rail-item");
  const tabOrder = ['dashboard', 'dependency', 'thinking', 'decisions', 'verification', 'qualitative', 'exports'];
  const tabTitles = {
    dashboard: "Dashboard Overview",
    dependency: "AI Dependency Analysis",
    thinking: "Independent Thinking Challenges",
    decisions: "Decision Scenarios Analysis",
    verification: "AI Content Verification Analysis",
    qualitative: "Qualitative Findings & Coding",
    exports: "Data Exports & Codebook"
  };

  const idx = tabOrder.indexOf(tabName);
  railItems.forEach((item, i) => {
    if (i === idx) item.classList.add("active");
    else if (i < 7) item.classList.remove("active");
  });

  const secTitle = document.getElementById("topbarActiveSectionName");
  if (secTitle) secTitle.innerText = tabTitles[tabName] || "Dashboard Overview";

  renderActiveTab();
}

async function refreshAdminData() {
  const level = document.getElementById("filterLevel")?.value || "all";
  const exp = document.getElementById("filterExp")?.value || "all";

  // Update status badge
  const filterBadge = document.getElementById("filterStatusBadge");
  if (filterBadge) {
    if (level === "all" && exp === "all") filterBadge.innerText = "All Cohorts";
    else filterBadge.innerText = "Filtered";
  }

  try {
    const [metricsRes, partsRes] = await Promise.all([
      fetch(`/api/admin/metrics?level=${encodeURIComponent(level)}&experience=${encodeURIComponent(exp)}`),
      fetch(`/api/admin/participants`)
    ]);

    CACHED_METRICS = await metricsRes.json();
    const partsData = await partsRes.json();
    CACHED_PARTICIPANTS = partsData.participants || [];

    // Update Telemetry sidebar
    const m = CACHED_METRICS;
    const sideEnrolled = document.getElementById("sideEnrolledCount");
    const sideCompleted = document.getElementById("sideCompletedCount");
    const sideSync = document.getElementById("sideLastSyncTime");
    const vaultText = document.getElementById("vaultStatusText");

    if (sideEnrolled) sideEnrolled.innerText = m.total_started;
    if (sideCompleted) sideCompleted.innerText = m.total_completed;
    if (sideSync) {
      const now = new Date();
      sideSync.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (vaultText) {
      vaultText.innerText = `Live Data Vault (${m.total_started} Enrolled • Zero AI Models)`;
    }

    renderActiveTab();
  } catch (err) {
    console.error("Error fetching metrics:", err);
  }
}

function renderActiveTab() {
  const container = document.getElementById("adminContentArea");
  if (!container || !CACHED_METRICS) return;

  const m = CACHED_METRICS;
  if (CURRENT_TAB === 'dashboard') renderOverviewTab(container, m);
  else if (CURRENT_TAB === 'dependency') renderDependencyTab(container, m);
  else if (CURRENT_TAB === 'thinking') renderThinkingTab(container, m);
  else if (CURRENT_TAB === 'decisions') renderDecisionsTab(container, m);
  else if (CURRENT_TAB === 'verification') renderVerificationTab(container, m);
  else if (CURRENT_TAB === 'qualitative') renderQualitativeTab(container);
  else if (CURRENT_TAB === 'exports') renderExportsTab(container, m);
}

// ----------------------------------------------------------------------
// 1. UPSCALE DASHBOARD OVERVIEW TAB
// ----------------------------------------------------------------------
function renderOverviewTab(container, m) {
  const incomplete = m.total_started - m.total_completed;

  // Academic level bars
  const levels = m.levels_breakdown || {};
  const totalLevels = Object.values(levels).reduce((a, b) => a + b, 0);

  let levelsHtml = '';
  if (totalLevels === 0) {
    levelsHtml = `<div style="color: var(--admin-text-muted); font-size: 13px; padding: 14px 0;">No enrolled participant demographics to display yet.</div>`;
  } else {
    levelsHtml = Object.entries(levels).map(([lvl, count]) => {
      const pct = totalLevels > 0 ? Math.round((count / totalLevels) * 100) : 0;
      return `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--admin-navy); margin-bottom: 5px;">
            <span>${lvl}</span>
            <span>${count} (${pct}%)</span>
          </div>
          <div style="background: var(--admin-border-subtle); border-radius: 6px; height: 10px; overflow: hidden;">
            <div style="width: ${pct}%; background: linear-gradient(90deg, #6D28D9 0%, #4F46E5 100%); height: 100%; border-radius: 6px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Participants live feed rows
  let participantsRows = '';
  if (CACHED_PARTICIPANTS.length === 0) {
    participantsRows = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 36px 20px; color: var(--admin-text-muted);">
          <div style="font-size: 26px; margin-bottom: 8px;">📡</div>
          <div style="font-weight: 700; color: var(--admin-navy); margin-bottom: 4px;">Awaiting Participant Submissions</div>
          <div style="font-size: 13px;">No active sessions currently recorded in <code>dependency_lab.db</code>.</div>
        </td>
      </tr>
    `;
  } else {
    participantsRows = CACHED_PARTICIPANTS.map(p => `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--admin-purple);">${p.participant_id}</td>
        <td><span style="font-weight: 600;">${p.level}</span></td>
        <td style="color: var(--admin-text-muted); font-size: 13px;">${p.experience}</td>
        <td>
          <span style="background: #EDE8FA; color: #6D28D9; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
            ${p.responses_count} / 11 activities
          </span>
        </td>
        <td>
          ${p.completed ? 
            '<span class="status-pill-completed">✓ Completed</span>' : 
            '<span class="status-pill-progress">⏳ In-Progress</span>'}
        </td>
        <td style="font-size: 12px; color: var(--admin-text-muted);">${formatDate(p.created_at)}</td>
        <td>
          <button class="btn-admin btn-admin-outline" style="padding: 4px 10px; font-size: 11.5px;" onclick="viewParticipantRecord('${p.participant_id}')">
            Inspect
          </button>
        </td>
      </tr>
    `).join('');
  }

  container.innerHTML = `
    <!-- Top 4 KPI Metrics Row -->
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">Total Participants</div>
        <div class="kpi-number">${m.total_started}</div>
        <div class="kpi-sub"><span style="color: #059669;">●</span> Live enrolled under Protocol DL-2026</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Completed Submissions</div>
        <div class="kpi-number" style="color: #059669;">${m.total_completed}</div>
        <div class="kpi-sub">Reached Step 8 confirmation code</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Incomplete / In-Progress</div>
        <div class="kpi-number" style="color: #D97706;">${incomplete}</div>
        <div class="kpi-sub">Active sessions or paused</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Completion Rate</div>
        <div class="kpi-number">${m.completion_rate}%</div>
        <div class="kpi-sub">Target benchmark: ≥ 75%</div>
      </div>
    </div>

    <!-- Institutional Protocol Specifications Banner -->
    <div class="admin-card" style="border-left: 4px solid var(--admin-purple);">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Study Protocol DL-2026 Telemetry & Rigor Controls</div>
          <div class="admin-card-subtitle">Empirical investigation into independent thinking among undergraduate and postgraduate researchers</div>
        </div>
        <button class="btn-admin btn-admin-coral" onclick="window.open('/', '_blank')">
          Launch Participant Test Session ↗
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 14px;">
        <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px 16px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase;">Research Battery</div>
          <div style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin-top: 2px;">8 Activities</div>
        </div>
        <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px 16px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase;">Target Cohorts</div>
          <div style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin-top: 2px;">UG / PG / PhD</div>
        </div>
        <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px 16px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase;">Autosave Engine</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669; margin-top: 2px;">Active (Per-Screen)</div>
        </div>
        <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px 16px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase;">Export Standard</div>
          <div style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin-top: 2px;">RFC 4180 Tidy CSV</div>
        </div>
      </div>
    </div>

    <!-- Dual Column: Academic Demographics & Study Safeguards -->
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-bottom: 22px;">
      <div class="admin-card" style="margin-bottom: 0;">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">Participant Academic Distribution</div>
            <div class="admin-card-subtitle">Enrolled representation across UG, PG, and doctoral researchers</div>
          </div>
        </div>
        ${levelsHtml}
      </div>

      <div class="admin-card" style="margin-bottom: 0;">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-title">Research Methodology Controls</div>
            <div class="admin-card-subtitle">Zero AI simulation safeguard guarantees</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; line-height: 1.5; color: var(--admin-navy-secondary);">
          <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px;">
            <strong>Static Stimuli:</strong> All questions, dilemmas, and AI passages are researcher-reviewed static instruments.
          </div>
          <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px;">
            <strong>Behavioral Scoring:</strong> Scenarios 1–4 measure revealed actions rather than self-serving self-declarations.
          </div>
          <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px;">
            <strong>GDPR Compliance:</strong> Participants can withdraw and permanently purge their responses via anonymous code.
          </div>
        </div>
      </div>
    </div>

    <!-- Live Participant Sessions Feed Table -->
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Live Participant Sessions & Telemetry Stream</div>
          <div class="admin-card-subtitle">Real-time incoming participant sessions recorded under Protocol DL-2026</div>
        </div>
        <button class="btn-admin btn-admin-outline" onclick="refreshAdminData()">
          Refresh Stream 🔄
        </button>
      </div>

      <div style="overflow-x: auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Participant ID</th>
              <th>Academic Level</th>
              <th>Research Experience</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Enrolled At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${participantsRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------
// 2. AI DEPENDENCY ANALYSIS TAB
// ----------------------------------------------------------------------
function renderDependencyTab(container, m) {
  const d = m.dependency_stats || {};
  const matrix = m.perceived_vs_behavioral || [];

  let tasksHtml = (d.tasks_outsourced || []).map(t => {
    const total = m.total_started || 1;
    const pct = Math.round((t.count / total) * 100);
    return `
      <div style="margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; color: var(--admin-navy); margin-bottom: 5px;">
          <span>${t.task}</span>
          <span>${t.count} researchers (${pct}%)</span>
        </div>
        <div style="background: var(--admin-border-subtle); border-radius: 6px; height: 10px; overflow: hidden;">
          <div style="width: ${pct}%; background: linear-gradient(90deg, #6D28D9 0%, #8B5CF6 100%); height: 100%; border-radius: 6px;"></div>
        </div>
      </div>
    `;
  }).join('');

  if (!tasksHtml) {
    tasksHtml = `<div style="color: var(--admin-text-muted); padding: 20px 0;">No task outsourcing data recorded yet.</div>`;
  }

  // Quadrant matrix SVG
  let scatterPoints = '';
  matrix.forEach(pt => {
    // x = perceived (1 to 5) -> 40 to 360
    // y = behavioral (0 to 3) -> 260 to 40 (inverted)
    const x = 50 + ((pt.perceived_dependency - 1) / 4) * 300;
    const y = 260 - (pt.behavioral_dependency / 3) * 220;
    scatterPoints += `
      <circle cx="${x}" cy="${y}" r="6" fill="#6D28D9" fill-opacity="0.75" stroke="#FFFFFF" stroke-width="2">
        <title>${pt.participant_id} (Perceived: ${pt.perceived_dependency}, Behavioral: ${pt.behavioral_dependency})</title>
      </circle>
    `;
  });

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Perceived vs. Behavioral Dependency Matrix</div>
          <div class="admin-card-subtitle">Examines whether early-career researchers accurately recognize their reliance on generative AI</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px;">
        <!-- Scatter Quadrant Plot -->
        <div style="background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center;">
          <div style="font-size: 13px; font-weight: 700; color: var(--admin-navy); margin-bottom: 10px;">
            Quadrant Map: Self-Assessment vs. Revealed Actions
          </div>
          <svg width="400" height="300" viewBox="0 0 400 300" style="max-width: 100%;">
            <!-- Quadrant Backgrounds -->
            <rect x="50" y="40" width="150" height="110" fill="#FEF3C7" fill-opacity="0.35" />
            <rect x="200" y="40" width="150" height="110" fill="#FEE2E2" fill-opacity="0.35" />
            <rect x="50" y="150" width="150" height="110" fill="#ECFDF5" fill-opacity="0.35" />
            <rect x="200" y="150" width="150" height="110" fill="#EDE8FA" fill-opacity="0.35" />

            <!-- Axes -->
            <line x1="50" y1="150" x2="350" y2="150" stroke="#CBD5E1" stroke-dasharray="4" />
            <line x1="200" y1="40" x2="200" y2="260" stroke="#CBD5E1" stroke-dasharray="4" />
            <line x1="50" y1="260" x2="350" y2="260" stroke="#94A3B8" stroke-width="2" />
            <line x1="50" y1="40" x2="50" y2="260" stroke="#94A3B8" stroke-width="2" />

            <!-- Labels -->
            <text x="200" y="290" text-anchor="middle" font-size="11" fill="#64748B" font-weight="600">Self-Reported Dependency (1 to 5) →</text>
            <text x="18" y="150" text-anchor="middle" font-size="11" fill="#64748B" font-weight="600" transform="rotate(-90 18 150)">Behavioral AI Delegation (0 to 3) →</text>

            <text x="125" y="80" text-anchor="middle" font-size="10" fill="#B45309" font-weight="700">Autonomous Overestimators</text>
            <text x="275" y="80" text-anchor="middle" font-size="10" fill="#B91C1C" font-weight="700">AI-Dependent Conscious</text>
            <text x="125" y="210" text-anchor="middle" font-size="10" fill="#047857" font-weight="700">Autonomous Realists</text>
            <text x="275" y="210" text-anchor="middle" font-size="10" fill="#6D28D9" font-weight="700">Self-Report Dependent</text>

            <!-- Render Points -->
            ${scatterPoints || '<text x="200" y="155" text-anchor="middle" font-size="12" fill="#94A3B8">Waiting for completed submissions</text>'}
          </svg>
          <div style="font-size: 11.5px; color: var(--admin-text-muted); margin-top: 10px; text-align: center;">
            Hover individual markers to view participant identifiers and coordinates.
          </div>
        </div>

        <!-- Metric Details -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 10px; padding: 18px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase;">Mean Self-Reported Dependency</div>
            <div style="font-size: 28px; font-weight: 800; color: var(--admin-purple); margin-top: 4px;">
              ${d.mean_overall_dependency || '0.0'} <span style="font-size: 16px; font-weight: 500; color: var(--admin-text-muted);">/ 5.0</span>
            </div>
            <div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 4px;">Baseline self-perception rating</div>
          </div>

          <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 10px; padding: 18px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase;">Confidence Without AI</div>
            <div style="font-size: 28px; font-weight: 800; color: #059669; margin-top: 4px;">
              ${d.mean_conf_without_ai || '0.0'} <span style="font-size: 16px; font-weight: 500; color: var(--admin-text-muted);">/ 5.0</span>
            </div>
            <div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 4px;">Confidence in working completely unassisted</div>
          </div>

          <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 10px; padding: 18px;">
            <div style="font-size: 12px; font-weight: 700; color: var(--admin-text-muted); text-transform: uppercase;">Independent Formulation Difficulty</div>
            <div style="font-size: 28px; font-weight: 800; color: #D97706; margin-top: 4px;">
              ${d.mean_formulate_difficulty || '0.0'} <span style="font-size: 16px; font-weight: 500; color: var(--admin-text-muted);">/ 5.0</span>
            </div>
            <div style="font-size: 12px; color: var(--admin-text-muted); margin-top: 4px;">Self-assessed difficulty in unassisted writing</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Academic Tasks Offloaded to AI -->
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Academic Research Tasks Offloaded to AI</div>
          <div class="admin-card-subtitle">Frequency distribution of tasks researchers delegate to generative language models</div>
        </div>
      </div>
      <div>
        ${tasksHtml}
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------
// 3. INDEPENDENT THINKING CHALLENGES TAB
// ----------------------------------------------------------------------
function renderThinkingTab(container, m) {
  const t = m.thinking_stats || {};

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Independent Thinking Challenges (Unassisted Reasoning Battery)</div>
          <div class="admin-card-subtitle">Measures unassisted articulation depth, word counts, and self-efficacy without digital prompts</div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-label">Mean Word Count (Depth)</div>
          <div class="kpi-number">${t.mean_words_across_tasks} words</div>
          <div class="kpi-sub">Target benchmark: ≥ 25 words</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Unassisted Confidence</div>
          <div class="kpi-number" style="color: #6D28D9;">${t.mean_confidence} / 5.0</div>
          <div class="kpi-sub">Self-rated quality of responses</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 20px;">
        <div style="border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; background: var(--admin-card); box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
          <div style="font-size: 11px; font-weight: 700; color: var(--admin-purple); text-transform: uppercase;">Task A</div>
          <h4 style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin: 6px 0 10px;">Idea Development</h4>
          <p style="font-size: 13px; color: var(--admin-text-muted); line-height: 1.5; margin-bottom: 14px;">
            Proposing an unassisted project direction on digital tool influence.
          </p>
          <button class="btn-admin btn-admin-outline" style="width: 100%; justify-content: center;" onclick="inspectTaskResponses('think_task_a')">
            Inspect Submissions
          </button>
        </div>

        <div style="border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; background: var(--admin-card); box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
          <div style="font-size: 11px; font-weight: 700; color: var(--admin-purple); text-transform: uppercase;">Task B</div>
          <h4 style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin: 6px 0 10px;">Problem Formulation</h4>
          <p style="font-size: 13px; color: var(--admin-text-muted); line-height: 1.5; margin-bottom: 14px;">
            Identifying core academic problems created by homework automation.
          </p>
          <button class="btn-admin btn-admin-outline" style="width: 100%; justify-content: center;" onclick="inspectTaskResponses('think_task_b')">
            Inspect Submissions
          </button>
        </div>

        <div style="border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; background: var(--admin-card); box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
          <div style="font-size: 11px; font-weight: 700; color: var(--admin-purple); text-transform: uppercase;">Task C</div>
          <h4 style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin: 6px 0 10px;">Argument Construction</h4>
          <p style="font-size: 13px; color: var(--admin-text-muted); line-height: 1.5; margin-bottom: 14px;">
            Formulating personal viewpoint on AI speed vs intellectual dependency.
          </p>
          <button class="btn-admin btn-admin-outline" style="width: 100%; justify-content: center;" onclick="inspectTaskResponses('think_task_c')">
            Inspect Submissions
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------
// 4. DECISION SCENARIOS TAB
// ----------------------------------------------------------------------
function renderDecisionsTab(container, m) {
  const scens = m.scenarios_breakdown || {};

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Research Decision Scenarios (Revealed Behavioral Choices)</div>
          <div class="admin-card-subtitle">Revealed action patterns across 4 realistic academic crises</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        ${renderScenarioBox("Scenario 1: Project Topic Gap", scens["scenario_1"] || {})}
        ${renderScenarioBox("Scenario 2: 5-Paper Literature Summary", scens["scenario_2"] || {})}
        ${renderScenarioBox("Scenario 3: Comprehending Complex Text", scens["scenario_3"] || {})}
        ${renderScenarioBox("Scenario 4: Assignment Without AI", scens["scenario_4"] || {})}
      </div>
    </div>
  `;
}

function renderScenarioBox(title, counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const labels = {
    0: "Autonomous (Zero AI)",
    1: "AI-Augmented (Critical verification)",
    2: "Heavily AI-Reliant",
    3: "Complete Digital Delegation"
  };

  let rows = '';
  for (let tag = 0; tag <= 3; tag++) {
    const c = counts[tag] || 0;
    const pct = Math.round((c / total) * 100);
    const color = tag === 0 ? '#059669' : tag === 1 ? '#2563EB' : tag === 2 ? '#D97706' : '#DC2626';
    rows += `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--admin-navy); margin-bottom: 5px;">
          <span>${labels[tag]}</span>
          <span style="color: var(--admin-text-muted); font-weight: 500;">${c} (${pct}%)</span>
        </div>
        <div style="background: var(--admin-border-subtle); border-radius: 4px; height: 8px; overflow: hidden;">
          <div style="width: ${pct}%; background: ${color}; height: 100%; border-radius: 4px;"></div>
        </div>
      </div>
    `;
  }

  return `
    <div style="border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; background: var(--admin-card); box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
      <h4 style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin-bottom: 14px;">${title}</h4>
      ${rows}
    </div>
  `;
}

// ----------------------------------------------------------------------
// 5. AI CONTENT VERIFICATION ACTIVITY TAB
// ----------------------------------------------------------------------
function renderVerificationTab(container, m) {
  const f = m.verification_flaws || {};

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">AI Content Verification Analysis</div>
          <div class="admin-card-subtitle">Critical scrutiny when evaluating fluent academic text with planted methodological errors</div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-label">Evaluations Completed</div>
          <div class="kpi-number">${f.total_evaluations}</div>
          <div class="kpi-sub">Total participants tested</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Planted Errors Caught</div>
          <div class="kpi-number" style="color: #6D28D9;">${f.mean_errors_caught} / 3.0</div>
          <div class="kpi-sub">Mean planted errors identified</div>
        </div>
      </div>

      <div style="background: var(--admin-border-subtle); border: 1px solid var(--admin-border); border-radius: 10px; padding: 20px; margin-top: 16px;">
        <h4 style="font-size: 14.5px; font-weight: 700; color: var(--admin-navy); margin-bottom: 8px;">Predefined Methodological Answer Key</h4>
        <ul style="padding-left: 20px; font-size: 13.5px; color: var(--admin-navy-secondary); line-height: 1.6;">
          <li><strong>Planted Error 1 (Sentence 2):</strong> Falsely asserts purposive sampling is a probability method where every person has an equal selection chance.</li>
          <li><strong>Planted Error 2 (Sentence 3):</strong> Claims non-probability qualitative findings can be statistically generalized to the entire national population.</li>
          <li><strong>Planted Error 3 (Sentence 4):</strong> Asserts a mandatory quota of at least 1,000 subjects for qualitative validity.</li>
        </ul>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------
// 6. QUALITATIVE RESPONSE ANALYSIS & THEMATIC CODING TAB
// ----------------------------------------------------------------------
async function renderQualitativeTab(container) {
  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Qualitative Response Analysis & Thematic Coding</div>
          <div class="admin-card-subtitle">Examine individual open-ended responses, attach research theme tags, and search text</div>
        </div>
      </div>

      <div style="display: flex; gap: 14px; margin-bottom: 20px;">
        <select id="qualActivitySelect" class="inspector-select" style="max-width: 320px;" onchange="fetchQualitativeData()">
          <option value="all">All Qualitative Activities</option>
          <option value="think_task_a">Task A: Research Idea Development</option>
          <option value="think_task_b">Task B: Problem Identification</option>
          <option value="think_task_c">Task C: Argument Development</option>
          <option value="scenario_1">Scenario 1 (Research Gap Rationale)</option>
          <option value="scenario_2">Scenario 2 (Literature Summary Rationale)</option>
          <option value="scenario_3">Scenario 3 (Writing Rationale)</option>
          <option value="scenario_4">Scenario 4 (Without AI Approach)</option>
          <option value="verification_activity">Verification Activity Reasoning</option>
          <option value="final_reflection">Final Reflection Memos</option>
        </select>
        <input type="text" id="qualSearchInput" class="admin-search-input" placeholder="Search keywords in student responses..." style="max-width: 300px;" oninput="fetchQualitativeData()">
      </div>

      <div id="qualitativeFeed">
        <div style="color: #94A3B8; padding: 20px 0;">Loading qualitative data...</div>
      </div>
    </div>
  `;

  fetchQualitativeData();
}

async function fetchQualitativeData() {
  const act = document.getElementById("qualActivitySelect")?.value || "all";
  const search = document.getElementById("qualSearchInput")?.value || "";

  try {
    const res = await fetch(`/api/admin/responses?activity_id=${encodeURIComponent(act)}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    const feed = document.getElementById("qualitativeFeed");
    if (!feed) return;

    if (data.responses.length === 0) {
      feed.innerHTML = '<div style="color: #94A3B8; padding: 30px 0; text-align: center;">No responses recorded yet matching this activity filter.</div>';
      return;
    }

    feed.innerHTML = data.responses.map(r => `
      <div class="qual-response-item">
        <div class="qual-header">
          <span><strong>${r.participant_id}</strong> • ${r.level} • ${r.discipline}</span>
          <span>Activity: <code>${r.activity_id}</code></span>
        </div>
        <div class="qual-text">
          ${r.answer ? `<strong>Answer:</strong> ${escapeHtml(r.answer)}<br>` : ''}
          ${r.explanation ? `<strong>Explanation:</strong> ${escapeHtml(r.explanation)}` : ''}
        </div>
        <div class="qual-tags">
          ${(r.codes || []).map(c => `
            <span class="tag-chip">
              ${c.theme_tag}
              <span class="tag-delete" onclick="removeTag(${c.id})">✕</span>
            </span>
          `).join('')}
          <button class="btn-admin btn-admin-outline" style="padding: 4px 10px; font-size: 11px;" onclick="assignThemeCode('${r.participant_id}', '${r.activity_id}')">
            + Assign Theme Code
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error fetching qualitative responses:", err);
  }
}

window.assignThemeCode = async function(pid, act) {
  const tag = prompt("Enter Thematic Code (e.g. 'Cognitive Outsourcing', 'Illusion of Autonomy', 'Critical Verification', 'Convenience'):");
  if (!tag) return;
  const notes = prompt("Researcher Memo (Optional):") || "";

  await fetch("/api/admin/theme-tag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participant_id: pid, activity_id: act, theme_tag: tag, notes })
  });
  fetchQualitativeData();
};

window.removeTag = async function(codeId) {
  await fetch(`/api/admin/theme-tag/${codeId}`, { method: "DELETE" });
  fetchQualitativeData();
};

window.inspectTaskResponses = function(actId) {
  switchAdminTab('qualitative');
  setTimeout(() => {
    const sel = document.getElementById("qualActivitySelect");
    if (sel) {
      sel.value = actId;
      fetchQualitativeData();
    }
  }, 100);
};

window.viewParticipantRecord = function(pid) {
  switchAdminTab('qualitative');
  setTimeout(() => {
    const input = document.getElementById("qualSearchInput");
    if (input) {
      input.value = pid;
      fetchQualitativeData();
    }
  }, 100);
};

// ----------------------------------------------------------------------
// 7. EXPORTS TAB
// ----------------------------------------------------------------------
function renderExportsTab(container, m) {
  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">Research Data Vault & Export Center</div>
          <div class="admin-card-subtitle">Export tidy datasets ready for SPSS, R, Python pandas, and Excel</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 14px;">
        <div style="border: 1px solid var(--admin-border); border-radius: 12px; padding: 24px; background: var(--admin-card); box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
          <h4 style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin-bottom: 8px;">Long-Format Tidy CSV</h4>
          <p style="font-size: 13.5px; color: var(--admin-text-muted); line-height: 1.55; margin-bottom: 18px;">
            Standardized RFC 4180 CSV export. Each row represents a single activity response with participant academic profiles repeated for immediate ANOVA or regression grouping.
          </p>
          <button class="btn-admin btn-admin-coral" onclick="downloadCSVExport()">
            Download Tidy CSV (Excel / R / SPSS) 📥
          </button>
        </div>

        <div style="border: 1px solid var(--admin-border); border-radius: 12px; padding: 24px; background: var(--admin-card); box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
          <h4 style="font-size: 15px; font-weight: 700; color: var(--admin-navy); margin-bottom: 8px;">Hierarchical JSON Archive</h4>
          <p style="font-size: 13.5px; color: var(--admin-text-muted); line-height: 1.55; margin-bottom: 18px;">
            Complete nested dataset including raw timestamps, sentence flags, and qualitative thematic tags.
          </p>
          <button class="btn-admin btn-admin-outline" onclick="downloadJSONArchive()">
            Download Raw JSON Archive 📦
          </button>
        </div>
      </div>
    </div>
  `;
}

function downloadCSVExport() {
  window.location.href = "/api/export/csv";
}

function downloadJSONArchive() {
  window.location.href = "/api/export/json";
}

function confirmPurgeDatabase() {
  document.getElementById("purgeModal").style.display = "flex";
}

function closePurgeModal() {
  document.getElementById("purgeModal").style.display = "none";
}

async function executePurgeDatabase() {
  await fetch("/api/admin/reset", { method: "POST" });
  closePurgeModal();
  refreshAdminData();
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
