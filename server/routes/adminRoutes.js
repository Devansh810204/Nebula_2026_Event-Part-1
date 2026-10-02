/**
 * adminRoutes.js
 * Comprehensive Admin Control API:
 * - Manage 80+ teams (add, edit, reset passwords, qualify/disqualify, delete)
 * - Manage questions (CRUD, time limit, test cases, mystery letters)
 * - Live leaderboard & real-time team progress inspection
 * - Credentials CSV export
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../auth');

// All routes require admin privilege
router.use(requireAdmin);

// Helper to broadcast socket events
function emitEvent(req, eventName, data) {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, data);
  }
}

// 1. Dashboard Overview Stats
router.get('/stats', (req, res) => {
  const teams = db.getTeams();
  const questions = db.getQuestions();
  const submissions = db.getSubmissions();

  const totalTeams = teams.length;
  const activeTeams = teams.filter(t => t.status === 'in_progress').length;
  const completedTeams = teams.filter(t => t.status === 'completed' || t.unlockedLetters.length >= 8).length;
  const disqualifiedTeams = teams.filter(t => t.status === 'disqualified').length;
  const readyTeams = teams.filter(t => t.status === 'ready').length;

  res.json({
    totalTeams,
    activeTeams,
    completedTeams,
    disqualifiedTeams,
    readyTeams,
    totalQuestions: questions.length,
    totalSubmissions: submissions.length,
    recentSubmissions: submissions.slice(0, 10)
  });
});

// 2. Live Leaderboard
router.get('/leaderboard', (req, res) => {
  const teams = db.getTeams();

  const ranked = teams.map(t => {
    return {
      id: t.id,
      name: t.name,
      status: t.status,
      unlockedLetters: t.unlockedLetters,
      lettersCount: t.unlockedLetters.length,
      solvedCount: t.solvedQuestions.length,
      currentQuestionIndex: t.currentQuestionIndex,
      violations: t.violations,
      startedAt: t.startedAt,
      completedAt: t.completedAt
    };
  }).sort((a, b) => {
    // 1. First by letters unlocked (desc)
    if (b.lettersCount !== a.lettersCount) {
      return b.lettersCount - a.lettersCount;
    }
    // 2. Next by solved count (desc)
    if (b.solvedCount !== a.solvedCount) {
      return b.solvedCount - a.solvedCount;
    }
    // 3. Completed teams rank higher
    if (a.completedAt && !b.completedAt) return -1;
    if (!a.completedAt && b.completedAt) return 1;
    if (a.completedAt && b.completedAt) {
      return new Date(a.completedAt) - new Date(b.completedAt);
    }
    return 0;
  });

  res.json(ranked);
});

// 3. Get All Teams
router.get('/teams', (req, res) => {
  const teams = db.getTeams();
  res.json(teams);
});

// 4. Add Team
router.post('/teams', (req, res) => {
  const { id, name, password } = req.body;
  if (!id || !name || !password) {
    return res.status(400).json({ error: 'Team ID, Name, and Password are required' });
  }

  const existing = db.getTeamById(id);
  if (existing) {
    return res.status(400).json({ error: 'A team with this ID already exists' });
  }

  const newTeam = {
    id: id.trim().toLowerCase(),
    name: name.trim(),
    password: password.trim(),
    status: 'ready',
    currentQuestionIndex: 0,
    questionStartTime: null,
    unlockedLetters: [],
    solvedQuestions: [],
    questionHistory: [],
    violations: 0,
    disqualifiedReason: null,
    startedAt: null,
    completedAt: null,
    lastActive: null
  };

  db.saveTeam(newTeam);
  emitEvent(req, 'admin_team_updated', newTeam);
  res.status(201).json(newTeam);
});

// 5. Update Team (Name, Password, Status)
router.put('/teams/:id', (req, res) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const { name, password, status } = req.body;
  if (name) team.name = name.trim();
  if (password) team.password = password.trim();
  if (status) team.status = status;

  db.saveTeam(team);
  emitEvent(req, 'admin_team_updated', team);
  res.json(team);
});

// 6. Re-Qualify Disqualified Team
router.post('/teams/:id/requalify', (req, res) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  team.status = team.startedAt ? 'in_progress' : 'ready';
  team.violations = 0;
  team.disqualifiedReason = null;
  db.saveTeam(team);

  emitEvent(req, 'admin_team_requalified', {
    teamId: team.id,
    teamName: team.name
  });

  res.json({
    success: true,
    message: `Team ${team.name} has been re-qualified!`,
    team
  });
});

// 7. Delete Team
router.delete('/teams/:id', (req, res) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  db.deleteTeam(req.params.id);
  emitEvent(req, 'admin_team_deleted', { teamId: req.params.id });
  res.json({ success: true, message: 'Team deleted' });
});

// 8. Re-seed all 80 Teams
router.post('/teams/reset-all', (req, res) => {
  const freshTeams = db.resetAllTeams();
  emitEvent(req, 'admin_teams_reset', { count: freshTeams.length });
  res.json({ success: true, message: 'All teams reset to default 80 teams', teams: freshTeams });
});

// 9. Export Teams to CSV
router.get('/export-csv', (req, res) => {
  const teams = db.getTeams();
  let csv = 'Team ID,Team Name,Password,Status,Letters Unlocked,Solved Count,Violations\n';
  teams.forEach(t => {
    const letters = t.unlockedLetters.join('');
    csv += `"${t.id}","${t.name}","${t.password}","${t.status}","${letters}",${t.solvedQuestions.length},${t.violations}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="nebula_teams_credentials.csv"');
  res.send(csv);
});

// 10. Questions Management
router.get('/questions', (req, res) => {
  const questions = db.getQuestions();
  res.json(questions);
});

router.post('/questions', (req, res) => {
  const qData = req.body;
  if (!qData.title || !qData.description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const saved = db.saveQuestion(qData);
  emitEvent(req, 'admin_question_updated', saved);
  res.status(201).json(saved);
});

router.put('/questions/:id', (req, res) => {
  const existing = db.getQuestionById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Question not found' });

  const updated = db.saveQuestion({ ...existing, ...req.body, id: Number(req.params.id) });
  emitEvent(req, 'admin_question_updated', updated);
  res.json(updated);
});

router.delete('/questions/:id', (req, res) => {
  db.deleteQuestion(req.params.id);
  emitEvent(req, 'admin_question_deleted', { id: req.params.id });
  res.json({ success: true, message: 'Question deleted' });
});

// 11. Settings
router.get('/settings', (req, res) => {
  res.json(db.getSettings());
});

router.put('/settings', (req, res) => {
  const updated = db.saveSettings(req.body);
  emitEvent(req, 'admin_settings_updated', updated);
  res.json(updated);
});

module.exports = router;
