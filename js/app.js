/* ==========================================================================
   Linear x Interfere - Core Application Logic
   ========================================================================== */

class LinearApp {
  constructor() {
    this.state = {
      issues: [...INITIAL_DATA.issues],
      selectedIssueId: INITIAL_DATA.selectedIssueId,
      soundEnabled: true,
      activeFilter: 'all',
      theme: localStorage.getItem('linear_theme') || 'dark'
    };

    this.audioCtx = null;
    this.commandMenu = null;

    this.init();
  }

  init() {
    // Set theme
    document.documentElement.setAttribute('data-theme', this.state.theme);

    // Initialize command menu
    this.commandMenu = new CommandMenu(this);

    // Render initial board and inspector
    this.renderBoard();
    this.renderInspector();

    // Setup event listeners
    this.setupListeners();
    this.setupCardShineEffect();
  }

  // Audio synthesizer for snappy tactile feedback
  playSound(type = 'click') {
    if (!this.state.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'blip') {
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // AudioContext not allowed before user gesture
    }
  }

  setupListeners() {
    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts if typing inside an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
          this.closeIssueModal();
          this.commandMenu.close();
        }
        return;
      }

      // Cmd+K or Ctrl+K -> Command menu
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.commandMenu.toggle();
        return;
      }

      // 'c' or 'C' -> New Issue Modal
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        this.openIssueModal();
        return;
      }

      // '?' -> Open Shortcuts in Command Menu
      if (e.key === '?') {
        e.preventDefault();
        this.commandMenu.open();
        return;
      }

      // Escape key closes modals
      if (e.key === 'Escape') {
        this.closeIssueModal();
        this.commandMenu.close();
      }
    });

    // Search button in nav
    document.getElementById('navSearchBtn')?.addEventListener('click', () => {
      this.commandMenu.open();
    });

    // Hero demo action button
    document.getElementById('heroCmdBtn')?.addEventListener('click', () => {
      this.commandMenu.open();
    });

    // Sidebar new issue button
    document.getElementById('sidebarNewIssueBtn')?.addEventListener('click', () => {
      this.openIssueModal();
    });

    // Issue Modal controls
    const issueModalBackdrop = document.getElementById('issueModalBackdrop');
    const cancelIssueBtn = document.getElementById('cancelIssueBtn');
    const submitIssueBtn = document.getElementById('submitIssueBtn');

    cancelIssueBtn?.addEventListener('click', () => this.closeIssueModal());
    issueModalBackdrop?.addEventListener('click', (e) => {
      if (e.target === issueModalBackdrop) this.closeIssueModal();
    });

    submitIssueBtn?.addEventListener('click', () => {
      this.createIssueFromModal();
    });

    // Interactive Slack Intake Pill
    const slackCreateBtn = document.getElementById('slackCreatePill');
    slackCreateBtn?.addEventListener('click', () => {
      this.runSlackTriageDemo();
    });

    // Theme toggle button in footer/header
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleTheme());
    });
  }

  // Interfere Card Glass Cursor Shine
  setupCardShineEffect() {
    document.addEventListener('mousemove', (e) => {
      document.querySelectorAll('.card-glass').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // Render the columns and issue cards
  renderBoard() {
    const colTodo = document.getElementById('colTodoCards');
    const colInProgress = document.getElementById('colInProgressCards');
    const colDone = document.getElementById('colDoneCards');

    if (!colTodo || !colInProgress || !colDone) return;

    colTodo.innerHTML = '';
    colInProgress.innerHTML = '';
    colDone.innerHTML = '';

    let todoCount = 0;
    let inProgressCount = 0;
    let doneCount = 0;

    this.state.issues.forEach(issue => {
      const card = this.createIssueCardElement(issue);

      if (issue.status === 'todo') {
        colTodo.appendChild(card);
        todoCount++;
      } else if (issue.status === 'in-progress') {
        colInProgress.appendChild(card);
        inProgressCount++;
      } else if (issue.status === 'done') {
        colDone.appendChild(card);
        doneCount++;
      }
    });

    // Update counters
    document.getElementById('countTodo') && (document.getElementById('countTodo').innerText = todoCount);
    document.getElementById('countInProgress') && (document.getElementById('countInProgress').innerText = inProgressCount);
    document.getElementById('countDone') && (document.getElementById('countDone').innerText = doneCount);
  }

  createIssueCardElement(issue) {
    const card = document.createElement('div');
    card.className = `issue-card ${issue.id === this.state.selectedIssueId ? 'selected' : ''}`;
    card.dataset.id = issue.id;

    // Status icon SVG
    let statusIconSvg = '';
    if (issue.status === 'todo') {
      statusIconSvg = `<svg class="column-status-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#e5a842" stroke-width="1.75" stroke-dasharray="2 2"/></svg>`;
    } else if (issue.status === 'in-progress') {
      statusIconSvg = `<svg class="column-status-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#f2994a" stroke-width="1.75"/><path d="M8 2 A6 6 0 0 1 14 8 L8 8 Z" fill="#f2994a"/></svg>`;
    } else {
      statusIconSvg = `<svg class="column-status-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#5e6ad2"/><path d="M5 8.2L7 10.2L11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }

    // Priority icon
    let prioritySvg = '';
    if (issue.priority === 'urgent') {
      prioritySvg = `<span title="Urgent Priority" style="color: var(--priority-urgent); font-weight: bold; font-size: 0.75rem;">!</span>`;
    } else if (issue.priority === 'high') {
      prioritySvg = `<span title="High Priority" style="color: var(--priority-high); font-size: 0.6875rem;">📶</span>`;
    } else {
      prioritySvg = `<span title="Medium Priority" style="color: var(--priority-medium); font-size: 0.6875rem;">◽</span>`;
    }

    const labelsHtml = issue.labels.map(l => `<span class="label-pill">${l}</span>`).join('');

    card.innerHTML = `
      <div class="issue-card-top">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="status-toggle-click" title="Click to cycle status" style="cursor: pointer; display: flex;">
            ${statusIconSvg}
          </span>
          <span class="issue-id">${issue.id}</span>
        </div>
        ${prioritySvg}
      </div>
      <div class="issue-card-title">${issue.title}</div>
      <div class="issue-card-footer">
        <div class="issue-labels">${labelsHtml}</div>
        <div class="issue-assignee-avatar" title="Assignee: ${issue.assignee}">${issue.assigneeAvatar}</div>
      </div>
    `;

    // Click card to select & inspect
    card.addEventListener('click', (e) => {
      // If clicking status icon directly, cycle status
      if (e.target.closest('.status-toggle-click')) {
        this.cycleIssueStatus(issue.id);
        return;
      }
      this.selectIssue(issue.id);
    });

    return card;
  }

  selectIssue(issueId) {
    this.state.selectedIssueId = issueId;
    this.renderBoard();
    this.renderInspector();
    this.playSound('click');
  }

  cycleIssueStatus(issueId) {
    const issue = this.state.issues.find(i => i.id === issueId);
    if (!issue) return;

    if (issue.status === 'todo') issue.status = 'in-progress';
    else if (issue.status === 'in-progress') issue.status = 'done';
    else issue.status = 'todo';

    this.renderBoard();
    this.renderInspector();
    this.playSound('blip');
    this.showToast(`Updated ${issue.id} to ${issue.status.toUpperCase()}`);
  }

  // Render Right Inspector Drawer
  renderInspector() {
    const inspector = document.getElementById('appInspectorPanel');
    if (!inspector) return;

    const issue = this.state.issues.find(i => i.id === this.state.selectedIssueId) || this.state.issues[0];
    if (!issue) return;

    let prHtml = '';
    if (issue.pr) {
      prHtml = `
        <div class="inspector-pr-box">
          <div class="pr-header">
            <span>⑂ GitHub PR ${issue.pr.number}</span>
          </div>
          <div style="font-size: 0.8125rem; font-weight: 500; color: var(--text-primary);">${issue.pr.title}</div>
          <div class="pr-files-stat">${issue.pr.status} · ${issue.pr.filesChanged} files changed</div>
        </div>
      `;
    }

    let activityHtml = '';
    if (issue.agentActivity && issue.agentActivity.length > 0) {
      activityHtml = issue.agentActivity.map(act => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-author">${act.author} <span style="font-weight: normal; color: var(--text-tertiary); font-size: 0.6875rem;">· ${act.time}</span></div>
            <div class="timeline-text">${act.text}</div>
          </div>
        </div>
      `).join('');
    } else {
      activityHtml = `
        <div style="font-size: 0.75rem; color: var(--text-tertiary);">
          No automated agent interventions yet.
        </div>
      `;
    }

    inspector.innerHTML = `
      <div class="inspector-header">
        <div class="inspector-id-status">
          <span class="text-mono" style="font-size: 0.8125rem; color: var(--text-secondary); font-weight: 600;">${issue.id}</span>
          <span class="badge ${issue.status === 'done' ? 'badge-brand' : ''}">${issue.status.toUpperCase()}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-tertiary);">${issue.cycle}</div>
      </div>

      <div style="font-size: 0.9375rem; font-weight: 600; line-height: 1.35; color: var(--text-primary);">
        ${issue.title}
      </div>

      <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; border-bottom: 1px solid var(--border-default); padding-bottom: 14px;">
        ${issue.description}
      </div>

      <div class="inspector-props-list">
        <div class="prop-row">
          <span class="prop-name">Status</span>
          <span class="prop-val">${issue.status}</span>
        </div>
        <div class="prop-row">
          <span class="prop-name">Priority</span>
          <span class="prop-val">${issue.priority.toUpperCase()}</span>
        </div>
        <div class="prop-row">
          <span class="prop-name">Assignee</span>
          <span class="prop-val">${issue.assignee}</span>
        </div>
        <div class="prop-row">
          <span class="prop-name">Team</span>
          <span class="prop-val">${issue.team}</span>
        </div>
        <div class="prop-row">
          <span class="prop-name">Labels</span>
          <span class="prop-val">${issue.labels.join(', ')}</span>
        </div>
      </div>

      ${prHtml}

      <div style="margin-top: 10px;">
        <div style="font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; margin-bottom: 10px;">
          Linear Agent Activity
        </div>
        <div class="inspector-timeline">
          ${activityHtml}
        </div>
      </div>
    `;
  }

  // Issue Creator Modal
  openIssueModal() {
    const modal = document.getElementById('issueModalBackdrop');
    if (!modal) return;
    modal.classList.add('open');
    document.getElementById('newIssueTitleInput')?.focus();
    this.playSound('click');
  }

  closeIssueModal() {
    const modal = document.getElementById('issueModalBackdrop');
    if (!modal) return;
    modal.classList.remove('open');
    this.playSound('click');
  }

  createIssueFromModal() {
    const titleInput = document.getElementById('newIssueTitleInput');
    const descInput = document.getElementById('newIssueDescInput');
    const prioritySelect = document.getElementById('newIssuePrioritySelect');
    const teamSelect = document.getElementById('newIssueTeamSelect');

    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }

    const newId = `ENG-${Math.floor(2300 + Math.random() * 200)}`;
    const newIssue = {
      id: newId,
      title: title,
      description: descInput.value.trim() || 'Created via Linear instant issue composer.',
      status: 'todo',
      priority: prioritySelect.value || 'medium',
      assignee: 'Brian',
      assigneeAvatar: 'B',
      team: teamSelect.value || 'Engineering',
      cycle: 'Cycle 144',
      labels: ['New', 'Triage'],
      pr: null,
      agentActivity: [
        { author: 'Linear Agent', text: 'Issue created and routed to Cycle 144 backlog.', time: 'Just now' }
      ]
    };

    this.state.issues.unshift(newIssue);
    this.state.selectedIssueId = newId;

    titleInput.value = '';
    descInput.value = '';

    this.closeIssueModal();
    this.renderBoard();
    this.renderInspector();
    this.playSound('success');
    this.showToast(`Issue ${newId} created successfully!`);
  }

  // Interactive Slack Triage Simulation
  runSlackTriageDemo() {
    const pill = document.getElementById('slackCreatePill');
    if (!pill) return;

    pill.innerHTML = `
      <span class="ld-orbit">
        <span class="ld-orbit-track ld-orbit-spin"></span>
      </span>
      <span>Linear Agent routing issue...</span>
    `;
    this.playSound('blip');

    setTimeout(() => {
      const newIssue = {
        id: 'ENG-2298',
        title: 'Decouple initial render from vehicle_state telemetry sync',
        description: 'Reported in Slack #product by Didier & Andreas. Reduce cold launch latency to under 300ms.',
        status: 'todo',
        priority: 'urgent',
        assignee: 'Andreas',
        assigneeAvatar: 'A',
        team: 'Mobile Core',
        cycle: 'Cycle 144',
        labels: ['Customer Request', 'iOS'],
        pr: null,
        agentActivity: [
          { author: 'Linear Asks Bot', text: 'Captured from Slack thread #product. Priority assigned: Urgent.', time: 'Just now' }
        ]
      };

      this.state.issues.unshift(newIssue);
      this.state.selectedIssueId = 'ENG-2298';
      this.renderBoard();
      this.renderInspector();

      pill.innerHTML = `✓ Created ENG-2298 & Assigned to Andreas`;
      pill.style.background = 'rgba(39, 201, 63, 0.2)';
      pill.style.color = '#27c93f';
      this.playSound('success');
      this.showToast('Created issue ENG-2298 from Slack thread!');

      // Scroll to hero board to see it!
      setTimeout(() => {
        document.getElementById('boardSection')?.scrollIntoView({ behavior: 'smooth' });
      }, 600);
    }, 900);
  }

  // Interactive AI Agent Console Prompts
  runAgentPrompt(type) {
    const output = document.getElementById('agentTerminalOutput');
    if (!output) return;

    this.playSound('blip');
    output.innerHTML = `<span style="color: #6f7cfb;">[Linear Agent 2.0] Executing autonomous reasoning workflow...</span>\nAnalyzing codebase and project telemetry...`;

    setTimeout(() => {
      if (type === 'access-control') {
        output.innerHTML = `
<span style="color: #27c93f;">✓ Found 3 high-impact customer requests:</span>
1. <span style="color: #fff;">ENG-2298</span> - Add granular team project permissions (Rank #1)
2. <span style="color: #fff;">ENG-2647</span> - Let external guests access multiple workspaces
3. <span style="color: #fff;">ENG-2352</span> - Custom role builder with scoped API access
<span style="color: #8590ea;">› Linked all 3 issues to Roadmap: "Access Controls Q1"</span>
        `.trim();
      } else if (type === 'pr-triage') {
        output.innerHTML = `
<span style="color: #27c93f;">✓ Evaluated 18 pending PRs and customer triage tickets:</span>
• Grouped 7 duplicate reports under <span style="color: #fff;">DRV-8852</span> (iOS Launch Latency)
• Generated automated reproduction script <span style="color: #8590ea;">tests/autonomy_flicker_spec.rb</span>
• Triggered draft PR review on GitHub branch: <span style="color: #8590ea;">karri/drv-8852-faster-app-launch</span>
        `.trim();
      } else if (type === 'spec-draft') {
        output.innerHTML = `
<span style="color: #27c93f;">✓ Generated complete Product Requirements Document (PRD):</span>
• Project: <span style="color: #fff;">Offline-First Local Storage Engine</span>
• Created 4 sub-issues: SQLite migration, optimistic mutations, conflict resolver, telemetry sync.
• Acceptance criteria validated against Linear System Guidelines.
        `.trim();
      }
      this.playSound('success');
    }, 700);
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.state.theme = nextTheme;
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('linear_theme', nextTheme);
    this.playSound('click');
    this.showToast(`Switched to ${nextTheme.toUpperCase()} mode`);
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.showToast(`Sound effects ${this.state.soundEnabled ? 'ENABLED' : 'DISABLED'}`);
  }

  showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="color: var(--brand-primary-hover);">›</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease-in';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }
}

// Global instance initiation
let appInstance = null;
window.addEventListener('DOMContentLoaded', () => {
  appInstance = new LinearApp();
});
