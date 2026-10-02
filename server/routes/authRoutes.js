/**
 * authRoutes.js
 * Endpoints for Student & Admin authentication
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  ADMIN_USER,
  ADMIN_PASS,
  generateToken,
  requireAuth
} = require('../auth');

// Unified Login Endpoint (Student & Admin)
router.post('/login', (req, res) => {
  const { role, username, password, teamId } = req.body;

  if (role === 'admin') {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = generateToken({
        role: 'admin',
        username: ADMIN_USER
      });

      res.cookie('nebula_token', token, {
        httpOnly: true,
        maxAge: 12 * 60 * 60 * 1000,
        sameSite: 'lax'
      });

      return res.json({
        success: true,
        role: 'admin',
        token,
        user: { username: ADMIN_USER }
      });
    } else {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
  }

  // Student Login
  const targetId = teamId || username;
  if (!targetId || !password) {
    return res.status(400).json({ error: 'Team ID and Password are required' });
  }

  const team = db.getTeamById(targetId);
  if (!team) {
    return res.status(404).json({ error: 'Team ID not found. Please verify with administrators.' });
  }

  if (team.password !== password) {
    return res.status(401).json({ error: 'Incorrect password for this team.' });
  }

  // Check if completed
  if (team.status === 'completed') {
    return res.status(403).json({
      error: 'Your team has already unlocked all 8 characters and successfully completed the challenge! Further logins are disabled.',
      isCompleted: true
    });
  }

  // Check if disqualified
  if (team.status === 'disqualified') {
    return res.status(403).json({
      error: `Your team has been disqualified: ${team.disqualifiedReason || 'Security/Fullscreen violations'}. Please approach the admin desk to resolve this.`,
      isDisqualified: true
    });
  }

  // Update team status to in_progress if first login
  if (team.status === 'ready') {
    team.status = 'in_progress';
    team.startedAt = new Date().toISOString();
  }
  team.lastActive = new Date().toISOString();
  db.saveTeam(team);

  const token = generateToken({
    role: 'student',
    teamId: team.id,
    teamName: team.name
  });

  res.cookie('nebula_token', token, {
    httpOnly: true,
    maxAge: 12 * 60 * 60 * 1000,
    sameSite: 'lax'
  });

  return res.json({
    success: true,
    role: 'student',
    token,
    team: {
      id: team.id,
      name: team.name,
      status: team.status,
      unlockedLetters: team.unlockedLetters,
      currentQuestionIndex: team.currentQuestionIndex,
      violations: team.violations
    }
  });
});

// Check current user
router.get('/me', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({
      role: 'admin',
      user: { username: req.user.username }
    });
  }

  const team = db.getTeamById(req.user.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team record not found' });
  }

  res.json({
    role: 'student',
    team: {
      id: team.id,
      name: team.name,
      status: team.status,
      unlockedLetters: team.unlockedLetters,
      currentQuestionIndex: team.currentQuestionIndex,
      violations: team.violations,
      questionHistory: team.questionHistory,
      solvedQuestions: team.solvedQuestions
    }
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('nebula_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
