/**
 * teamRoutes.js
 * Endpoints for student contest execution, timer sync, code runner,
 * mystery letter unlocks, and anti-cheat tracking.
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireStudent } = require('../auth');
const { runCustomCode, evaluateSubmission } = require('../compiler');

// Helper to broadcast socket events if io is attached to app
function emitEvent(req, eventName, data) {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, data);
  }
}

// Get current question and contest state
router.get('/current', requireStudent, (req, res) => {
  const team = db.getTeamById(req.user.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  // Check if team is disqualified
  if (team.status === 'disqualified') {
    return res.json({
      isDisqualified: true,
      reason: team.disqualifiedReason,
      violations: team.violations
    });
  }

  // Check if team is completed (8 letters)
  if (team.status === 'completed' || team.unlockedLetters.length >= 8) {
    return res.json({
      isCompleted: true,
      unlockedLetters: team.unlockedLetters,
      totalUnlocked: team.unlockedLetters.length
    });
  }

  const questions = db.getQuestions();
  const settings = db.getSettings();

  // If reached beyond last question but haven't collected 8 letters:
  // wrap around or finish
  let qIdx = team.currentQuestionIndex || 0;
  if (qIdx >= questions.length) {
    // If all questions exhausted, check if unlocked 8 or wrap
    qIdx = qIdx % questions.length;
    team.currentQuestionIndex = qIdx;
  }

  const currentQ = questions[qIdx];
  if (!currentQ) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const timeLimit = currentQ.timeLimit || settings.timeLimitPerQuestion || 600;

  // Initialize questionStartTime if not set
  const now = Date.now();
  if (!team.questionStartTime) {
    team.questionStartTime = now;
    db.saveTeam(team);
  }

  const elapsedSeconds = Math.floor((now - team.questionStartTime) / 1000);
  const timeRemaining = Math.max(0, timeLimit - elapsedSeconds);

  // Strip hidden test cases for security before sending to client
  const sanitizedQuestion = {
    id: currentQ.id,
    title: currentQ.title,
    category: currentQ.category,
    difficulty: currentQ.difficulty,
    type: currentQ.type || 'coding',
    timeLimit: timeLimit,
    description: currentQ.description,
    inputFormat: currentQ.inputFormat,
    outputFormat: currentQ.outputFormat,
    constraints: currentQ.constraints,
    sampleTestCases: currentQ.sampleTestCases || [],
    starterCode: currentQ.starterCode || {},
    options: currentQ.options || [] // for aptitude
  };

  // Build sequence of question statuses for left progress panel
  const progressSequence = questions.map((q, index) => {
    const isSolved = team.solvedQuestions.includes(q.id);
    const historyItem = team.questionHistory.find(h => String(h.questionId) === String(q.id));
    let status = 'locked';
    if (index === qIdx) {
      status = 'current';
    } else if (isSolved) {
      status = 'correct';
    } else if (historyItem) {
      status = historyItem.status; // wrong, timeout, skipped
    }

    return {
      index,
      id: q.id,
      title: q.title,
      status,
      unlockedLetter: isSolved ? q.unlockedLetter : null
    };
  });

  res.json({
    team: {
      id: team.id,
      name: team.name,
      violations: team.violations,
      unlockedLetters: team.unlockedLetters,
      totalUnlocked: team.unlockedLetters.length
    },
    question: sanitizedQuestion,
    questionIndex: qIdx,
    totalQuestions: questions.length,
    timeRemaining,
    timeLimit,
    progressSequence,
    maxLettersNeeded: settings.maxLettersNeeded || 8
  });
});

// Run Code with Custom / Sample Input
router.post('/run', requireStudent, async (req, res) => {
  const { code, language, customInput } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    const result = await runCustomCode(language, code, customInput || '');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Code execution error: ' + err.message });
  }
});

// Submit Solution
router.post('/submit', requireStudent, async (req, res) => {
  const team = db.getTeamById(req.user.teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  if (team.status === 'disqualified') {
    return res.status(403).json({ error: 'Team is disqualified', isDisqualified: true });
  }

  if (team.status === 'completed') {
    return res.status(403).json({ error: 'Contest completed', isCompleted: true });
  }

  const questions = db.getQuestions();
  const qIdx = team.currentQuestionIndex || 0;
  const currentQ = questions[qIdx];
  if (!currentQ) return res.status(404).json({ error: 'Question not found' });

  const { code, language, aptitudeAnswer } = req.body;

  let isCorrect = false;
  let evalDetails = null;

  // Aptitude Question Evaluation
  if (currentQ.type === 'aptitude') {
    if (aptitudeAnswer && String(aptitudeAnswer).trim().toUpperCase() === String(currentQ.correctOption).trim().toUpperCase()) {
      isCorrect = true;
    } else {
      isCorrect = false;
    }
  } else {
    // Coding Question Evaluation
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const allTestCases = [
      ...(currentQ.sampleTestCases || []),
      ...(currentQ.hiddenTestCases || [])
    ];

    evalDetails = await evaluateSubmission(language, code, allTestCases);
    isCorrect = evalDetails.allPassed;
  }

  // Record submission in DB audit trail
  db.addSubmission({
    id: `sub_${Date.now()}`,
    teamId: team.id,
    teamName: team.name,
    questionId: currentQ.id,
    questionTitle: currentQ.title,
    language: language || 'aptitude',
    code: code || '',
    isCorrect,
    timestamp: new Date().toISOString()
  });

  const assignedLetter = currentQ.unlockedLetter || '★';

  if (isCorrect) {
    // Unlocked letter logic
    let newlyUnlockedLetter = null;
    if (!team.unlockedLetters.includes(assignedLetter)) {
      team.unlockedLetters.push(assignedLetter);
      newlyUnlockedLetter = assignedLetter;
    }

    if (!team.solvedQuestions.includes(currentQ.id)) {
      team.solvedQuestions.push(currentQ.id);
    }

    team.questionHistory.push({
      questionId: currentQ.id,
      questionIndex: qIdx,
      status: 'correct',
      unlockedLetter: assignedLetter,
      timestamp: new Date().toISOString(),
      language
    });

    const totalLetters = team.unlockedLetters.length;
    const isAllUnlocked = totalLetters >= 8;

    if (isAllUnlocked) {
      team.status = 'completed';
      team.completedAt = new Date().toISOString();
      db.saveTeam(team);

      emitEvent(req, 'team_completed', {
        teamId: team.id,
        teamName: team.name,
        totalLetters,
        unlockedLetters: team.unlockedLetters,
        completedAt: team.completedAt
      });

      return res.json({
        success: true,
        correct: true,
        unlockedLetter: assignedLetter,
        newlyUnlocked: newlyUnlockedLetter,
        totalUnlocked: totalLetters,
        isAllUnlocked: true,
        message: 'Congratulations! You have unlocked all 8 characters and successfully finished!'
      });
    }

    // Move to next question
    team.currentQuestionIndex = (qIdx + 1) % questions.length;
    team.questionStartTime = Date.now();
    db.saveTeam(team);

    emitEvent(req, 'team_letter_unlocked', {
      teamId: team.id,
      teamName: team.name,
      unlockedLetter: assignedLetter,
      totalUnlocked: totalLetters
    });

    return res.json({
      success: true,
      correct: true,
      unlockedLetter: assignedLetter,
      newlyUnlocked: newlyUnlockedLetter,
      totalUnlocked: totalLetters,
      isAllUnlocked: false,
      nextIndex: team.currentQuestionIndex,
      evalDetails
    });
  } else {
    // Wrong solution
    team.questionHistory.push({
      questionId: currentQ.id,
      questionIndex: qIdx,
      status: 'wrong',
      timestamp: new Date().toISOString(),
      language
    });
    db.saveTeam(team);

    return res.json({
      success: false,
      correct: false,
      message: 'Some test cases did not pass. Check output and retry.',
      evalDetails
    });
  }
});

// Auto-advance or Skip on Timer Expiry
router.post('/timeout-advance', requireStudent, (req, res) => {
  const team = db.getTeamById(req.user.teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const questions = db.getQuestions();
  const qIdx = team.currentQuestionIndex || 0;
  const currentQ = questions[qIdx];

  team.questionHistory.push({
    questionId: currentQ?.id || qIdx,
    questionIndex: qIdx,
    status: req.body.reason === 'skip' ? 'skipped' : 'timeout',
    timestamp: new Date().toISOString()
  });

  // Advance to next question
  team.currentQuestionIndex = (qIdx + 1) % questions.length;
  team.questionStartTime = Date.now();
  db.saveTeam(team);

  res.json({
    success: true,
    nextIndex: team.currentQuestionIndex
  });
});

// Proctor Violation Tracker (Fullscreen exit / tab switch)
router.post('/violation', requireStudent, (req, res) => {
  const team = db.getTeamById(req.user.teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const { type } = req.body; // 'fullscreen_exit', 'tab_switch', 'blur'
  team.violations = (team.violations || 0) + 1;

  if (team.violations >= 2) {
    team.status = 'disqualified';
    team.disqualifiedReason = `Proctoring Violation: Repeated tab switch / full-screen exit detected (${type || 'violation'})`;
    db.saveTeam(team);

    emitEvent(req, 'team_disqualified', {
      teamId: team.id,
      teamName: team.name,
      violations: team.violations,
      reason: team.disqualifiedReason,
      timestamp: new Date().toISOString()
    });

    return res.json({
      disqualified: true,
      violations: team.violations,
      message: 'You have been disqualified for multiple proctoring violations.'
    });
  } else {
    db.saveTeam(team);

    emitEvent(req, 'team_warning', {
      teamId: team.id,
      teamName: team.name,
      violations: team.violations,
      type: type || 'violation',
      timestamp: new Date().toISOString()
    });

    return res.json({
      disqualified: false,
      violations: 1,
      message: 'Warning: Exiting full screen or switching tabs is strictly forbidden! Second attempt will result in immediate disqualification.'
    });
  }
});

module.exports = router;
