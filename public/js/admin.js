/**
 * admin.js
 * Comprehensive Administrator Command Center:
 * - Real-time Socket.IO Proctoring Alerts
 * - Live Leaderboard & Team Inspection
 * - 80+ Teams CRUD, Password Management, Re-qualification
 * - Question Management & Time Limit adjustments
 * - CSV Export
 */

let allTeams = [];
let allQuestions = [];
let socket = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Check admin authorization
  try {
    const authRes = await fetch('/api/auth/me');
    if (!authRes.ok) {
      window.location.href = '/';
      return;
    }
    const authData = await authRes.json();
    if (authData.role !== 'admin') {
      window.location.href = '/';
      return;
    }
  } catch (e) {
    window.location.href = '/';
    return;
  }

  // Setup Watermark for Admin
  if (typeof setupWatermark === 'function') {
    setupWatermark('NEBULA ADMIN COMMAND');
  }

  // Initialize Socket.IO
  initAdminSocket();

  // Navigation Tabs
  setupAdminTabs();

  // Load initial data
  await refreshDashboardStats();
  await loadLeaderboard();
  await loadTeamsTable();
  await loadQuestionsTable();

  // Search and Filter Listeners
  setupSearchAndFilters();

  // Action Modals & Buttons
  setupAdminButtons();

  // Periodic stats refresh
  setInterval(refreshDashboardStats, 10000);
});

// Socket.IO Real-time Connection
function initAdminSocket() {
  if (typeof io === 'undefined') return;
  socket = io();
  socket.emit('join_admin');

  socket.on('team_warning', (data) => {
    addAlertFeedItem('warning', `⚠️ Strike 1 Warning: <strong>${data.teamName}</strong> (${data.teamId}) exited fullscreen / tab.`);
    playBeep(440);
    refreshDashboardStats();
    loadLeaderboard();
    loadTeamsTable();
  });

  socket.on('team_disqualified', (data) => {
    addAlertFeedItem('disqualified', `🚨 DISQUALIFIED: <strong>${data.teamName}</strong> (${data.teamId}) disqualified for proctoring violations!`);
    playBeep(220);
    refreshDashboardStats();
    loadLeaderboard();
    loadTeamsTable();
  });

  socket.on('team_letter_unlocked', (data) => {
    addAlertFeedItem('unlocked', `🎉 Letter Unlocked: <strong>${data.teamName}</strong> unlocked character <strong>'${data.unlockedLetter}'</strong> (${data.totalUnlocked}/8)!`);
    loadLeaderboard();
    loadTeamsTable();
  });

  socket.on('team_completed', (data) => {
    addAlertFeedItem('completed', `🏆 CONTEST COMPLETED: <strong>${data.teamName}</strong> unlocked all 8 characters and finished!`);
    playBeep(880);
    refreshDashboardStats();
    loadLeaderboard();
    loadTeamsTable();
  });
}

function playBeep(freq = 440) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

function addAlertFeedItem(type, htmlContent) {
  const feed = document.getElementById('alerts-feed-list');
  if (!feed) return;

  const item = document.createElement('div');
  item.className = `alert-feed-item feed-${type}`;
  const timeStr = new Date().toLocaleTimeString();
  item.innerHTML = `
    <div>${htmlContent}</div>
    <div style="font-size: 0.78rem; color: #64748b; font-weight: 600;">${timeStr}</div>
  `;
  feed.prepend(item);
}

// Admin Tab Switching
function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = content.id === `tab-content-${target}` ? 'block' : 'none';
      });

      if (target === 'leaderboard') loadLeaderboard();
      if (target === 'teams') loadTeamsTable();
      if (target === 'questions') loadQuestionsTable();
    });
  });
}

// 1. Dashboard Overview Stats
async function refreshDashboardStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();

    document.getElementById('stat-total-teams').textContent = data.totalTeams || 0;
    document.getElementById('stat-active-teams').textContent = data.activeTeams || 0;
    document.getElementById('stat-completed-teams').textContent = data.completedTeams || 0;
    document.getElementById('stat-disqualified-teams').textContent = data.disqualifiedTeams || 0;
    document.getElementById('stat-total-questions').textContent = data.totalQuestions || 0;
  } catch (e) {
    console.error('Stats fetch error:', e);
  }
}

// 2. Live Leaderboard
async function loadLeaderboard() {
  const tbody = document.getElementById('leaderboard-tbody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/leaderboard');
    const ranked = await res.json();
    tbody.innerHTML = '';

    ranked.forEach((team, index) => {
      const tr = document.createElement('tr');
      const rankBadge = index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`;
      
      const lettersHtml = team.unlockedLetters && team.unlockedLetters.length > 0 
        ? team.unlockedLetters.map(l => `<span style="display:inline-block; padding:2px 7px; background:#0b4ea2; color:#fff; border-radius:4px; font-weight:700; margin-right:3px;">${l}</span>`).join('')
        : '<span style="color:#94a3b8;">None</span>';

      tr.innerHTML = `
        <td style="font-weight: 800; font-size: 1rem; color: #0b4ea2;">${rankBadge}</td>
        <td><strong>${team.name}</strong> <span style="font-size:0.8rem; color:#64748b;">(${team.id})</span></td>
        <td><span class="status-pill status-${team.status}">${team.status.toUpperCase()}</span></td>
        <td>${lettersHtml} <strong style="color:#a21caf;">(${team.lettersCount}/8)</strong></td>
        <td><strong>${team.solvedCount}</strong> solved</td>
        <td>${team.violations > 0 ? `<span style="color:#ef4444; font-weight:700;">⚠️ ${team.violations} Strike${team.violations > 1 ? 's' : ''}</span>` : '0'}</td>
        <td style="font-size: 0.85rem; color: #64748b;">${team.completedAt ? new Date(team.completedAt).toLocaleTimeString() : 'In Progress'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('Leaderboard error:', e);
  }
}

// 3. Teams Table Management
async function loadTeamsTable() {
  const tbody = document.getElementById('teams-tbody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/teams');
    allTeams = await res.json();
    renderFilteredTeams();
  } catch (e) {
    console.error('Teams fetch error:', e);
  }
}

function renderFilteredTeams() {
  const tbody = document.getElementById('teams-tbody');
  const search = (document.getElementById('teams-search-input')?.value || '').toLowerCase();
  const filter = document.getElementById('teams-status-filter')?.value || 'all';

  tbody.innerHTML = '';

  const filtered = allTeams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search) || t.id.toLowerCase().includes(search);
    const matchesStatus = filter === 'all' || t.status === filter;
    return matchesSearch && matchesStatus;
  });

  document.getElementById('teams-count-display').textContent = `Showing ${filtered.length} of ${allTeams.length} teams`;

  filtered.forEach(team => {
    const tr = document.createElement('tr');
    const letters = team.unlockedLetters ? team.unlockedLetters.join(', ') : '';

    tr.innerHTML = `
      <td><code>${team.id}</code></td>
      <td><strong>${team.name}</strong></td>
      <td><span style="font-family:monospace; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${team.password}</span></td>
      <td><span class="status-pill status-${team.status}">${team.status.toUpperCase()}</span></td>
      <td><strong>${team.unlockedLetters?.length || 0}/8</strong> [${letters}]</td>
      <td>${team.violations > 0 ? `<span style="color:#ef4444; font-weight:700;">⚠️ ${team.violations}</span>` : '0'}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          ${team.status === 'disqualified' || team.violations > 0 ? `
            <button class="btn-table-action btn-requalify" onclick="requalifyTeam('${team.id}')">✓ Re-Qualify</button>
          ` : ''}
          <button class="btn-table-action btn-edit" onclick="openEditTeamModal('${team.id}')">Edit</button>
          <button class="btn-table-action" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca;" onclick="deleteTeamConfirm('${team.id}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Re-Qualify Action
window.requalifyTeam = async function(teamId) {
  if (!confirm(`Re-qualify team ${teamId}? This will clear proctoring strikes and allow them to log in again.`)) return;

  try {
    const res = await fetch(`/api/admin/teams/${teamId}/requalify`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      alert(`Team ${teamId} re-qualified successfully!`);
      loadTeamsTable();
      loadLeaderboard();
      refreshDashboardStats();
    } else {
      alert(data.error || 'Failed to re-qualify');
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
};

// Edit Team Modal
window.openEditTeamModal = function(teamId) {
  const team = allTeams.find(t => t.id === teamId);
  if (!team) return;

  document.getElementById('edit-team-id').value = team.id;
  document.getElementById('edit-team-name').value = team.name;
  document.getElementById('edit-team-password').value = team.password;
  document.getElementById('edit-team-status').value = team.status;

  document.getElementById('edit-team-modal').style.display = 'flex';
};

window.deleteTeamConfirm = async function(teamId) {
  if (!confirm(`Are you sure you want to permanently delete team ${teamId}?`)) return;

  try {
    const res = await fetch(`/api/admin/teams/${teamId}`, { method: 'DELETE' });
    if (res.ok) {
      loadTeamsTable();
      refreshDashboardStats();
    }
  } catch (e) {
    alert('Failed to delete team: ' + e.message);
  }
};

// 4. Questions Management
async function loadQuestionsTable() {
  const tbody = document.getElementById('questions-tbody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/questions');
    allQuestions = await res.json();
    tbody.innerHTML = '';

    allQuestions.forEach(q => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${q.id}</strong></td>
        <td><strong>${q.title}</strong></td>
        <td><span class="badge-tag badge-category">${q.category}</span></td>
        <td><span class="badge-tag badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
        <td><strong>${Math.floor(q.timeLimit / 60)} min</strong> (${q.timeLimit}s)</td>
        <td><span style="font-size:1.1rem; font-weight:900; color:#0b4ea2; background:#e8f0fe; padding:2px 10px; border-radius:4px;">${q.unlockedLetter || '★'}</span></td>
        <td>
          <button class="btn-table-action btn-edit" onclick="openEditQuestionModal(${q.id})">Edit</button>
          <button class="btn-table-action" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca;" onclick="deleteQuestionConfirm(${q.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error('Questions fetch error:', e);
  }
}

window.openEditQuestionModal = function(qId) {
  const q = allQuestions.find(item => item.id === qId);
  if (!q) return;

  document.getElementById('form-q-id').value = q.id;
  document.getElementById('form-q-title').value = q.title;
  document.getElementById('form-q-category').value = q.category;
  document.getElementById('form-q-difficulty').value = q.difficulty;
  document.getElementById('form-q-timelimit').value = Math.floor(q.timeLimit / 60);
  document.getElementById('form-q-letter').value = q.unlockedLetter || 'N';
  document.getElementById('form-q-description').value = q.description;
  document.getElementById('form-q-inputformat').value = q.inputFormat || '';
  document.getElementById('form-q-outputformat').value = q.outputFormat || '';

  document.getElementById('question-modal-title').textContent = `Edit Question #${q.id}`;
  document.getElementById('question-modal').style.display = 'flex';
};

window.deleteQuestionConfirm = async function(qId) {
  if (!confirm(`Delete question #${qId}?`)) return;
  try {
    await fetch(`/api/admin/questions/${qId}`, { method: 'DELETE' });
    loadQuestionsTable();
    refreshDashboardStats();
  } catch (e) {
    alert('Delete error: ' + e.message);
  }
};

// Search & Filter listeners
function setupSearchAndFilters() {
  const searchInput = document.getElementById('teams-search-input');
  const statusFilter = document.getElementById('teams-status-filter');

  if (searchInput) searchInput.addEventListener('input', renderFilteredTeams);
  if (statusFilter) statusFilter.addEventListener('change', renderFilteredTeams);
}

// Admin Action Buttons
function setupAdminButtons() {
  // Export CSV
  const exportBtn = document.getElementById('btn-export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      window.location.href = '/api/admin/export-csv';
    });
  }

  // Reset 80 Teams
  const resetBtn = document.getElementById('btn-reset-teams');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('WARNING: Reset all teams to default 80 seeded teams? Current team progress will be reset.')) {
        await fetch('/api/admin/teams/reset-all', { method: 'POST' });
        loadTeamsTable();
        loadLeaderboard();
        refreshDashboardStats();
      }
    });
  }

  // Add Team Modal
  const addTeamBtn = document.getElementById('btn-add-team');
  const addTeamModal = document.getElementById('add-team-modal');
  if (addTeamBtn && addTeamModal) {
    addTeamBtn.addEventListener('click', () => addTeamModal.style.display = 'flex');
  }

  const addTeamForm = document.getElementById('form-add-team');
  if (addTeamForm) {
    addTeamForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('new-team-id').value.trim();
      const name = document.getElementById('new-team-name').value.trim();
      const password = document.getElementById('new-team-password').value.trim();

      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, password })
      });
      if (res.ok) {
        addTeamModal.style.display = 'none';
        addTeamForm.reset();
        loadTeamsTable();
        refreshDashboardStats();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add team');
      }
    });
  }

  // Edit Team Form Submit
  const editTeamForm = document.getElementById('form-edit-team');
  if (editTeamForm) {
    editTeamForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-team-id').value;
      const name = document.getElementById('edit-team-name').value;
      const password = document.getElementById('edit-team-password').value;
      const status = document.getElementById('edit-team-status').value;

      const res = await fetch(`/api/admin/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, status })
      });
      if (res.ok) {
        document.getElementById('edit-team-modal').style.display = 'none';
        loadTeamsTable();
        loadLeaderboard();
      }
    });
  }

  // Add/Edit Question Form Submit
  const qForm = document.getElementById('form-question');
  if (qForm) {
    qForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('form-q-id').value;
      const title = document.getElementById('form-q-title').value;
      const category = document.getElementById('form-q-category').value;
      const difficulty = document.getElementById('form-q-difficulty').value;
      const timeLimitMins = parseInt(document.getElementById('form-q-timelimit').value) || 10;
      const unlockedLetter = document.getElementById('form-q-letter').value.toUpperCase();
      const description = document.getElementById('form-q-description').value;
      const inputFormat = document.getElementById('form-q-inputformat').value;
      const outputFormat = document.getElementById('form-q-outputformat').value;

      const payload = {
        title,
        category,
        difficulty,
        timeLimit: timeLimitMins * 60,
        unlockedLetter,
        description,
        inputFormat,
        outputFormat
      };

      let res;
      if (id) {
        res = await fetch(`/api/admin/questions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        document.getElementById('question-modal').style.display = 'none';
        loadQuestionsTable();
      } else {
        alert('Failed to save question');
      }
    });
  }

  // Close Modals on cancel / backdrop
  document.querySelectorAll('.btn-modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.clear();
      window.location.href = '/';
    });
  }
}
