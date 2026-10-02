/**
 * db.js
 * JSON-based persistent storage for Nebula 2026 Competition
 * Handles teams, questions, settings, and submissions with automatic seeding.
 */

const fs = require('fs');
const path = require('path');
const { defaultQuestions, generate80Teams } = require('./seedData');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return fallback;
}

function writeJSON(file, data) {
  try {
    const tmpFile = `${file}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpFile, file);
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// In-memory cache
let teamsCache = null;
let questionsCache = null;
let settingsCache = null;
let submissionsCache = null;

function initDB() {
  // Initialize Questions
  if (!fs.existsSync(QUESTIONS_FILE)) {
    writeJSON(QUESTIONS_FILE, defaultQuestions);
  }
  questionsCache = readJSON(QUESTIONS_FILE, defaultQuestions);

  // Initialize Teams
  if (!fs.existsSync(TEAMS_FILE)) {
    const seeded = generate80Teams();
    writeJSON(TEAMS_FILE, seeded);
  }
  teamsCache = readJSON(TEAMS_FILE, []);

  // Initialize Settings
  const defaultSettings = {
    eventName: "Nebula 2026 Coding Challenge",
    timeLimitPerQuestion: 600, // 10 minutes default
    maxLettersNeeded: 8,
    proctorStrictLevel: "strict", // strict = 2 strikes, lenient = 3 strikes
    autoAdvanceOnTimeout: true
  };
  if (!fs.existsSync(SETTINGS_FILE)) {
    writeJSON(SETTINGS_FILE, defaultSettings);
  }
  settingsCache = readJSON(SETTINGS_FILE, defaultSettings);

  // Initialize Submissions
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    writeJSON(SUBMISSIONS_FILE, []);
  }
  submissionsCache = readJSON(SUBMISSIONS_FILE, []);

  console.log(`[DB] Initialized: ${teamsCache.length} teams, ${questionsCache.length} questions.`);
}

// Team Methods
function getTeams() {
  if (!teamsCache) initDB();
  return teamsCache;
}

function getTeamById(id) {
  const teams = getTeams();
  return teams.find(t => t.id.toLowerCase() === id.toLowerCase());
}

function saveTeam(teamData) {
  const teams = getTeams();
  const idx = teams.findIndex(t => t.id.toLowerCase() === teamData.id.toLowerCase());
  if (idx !== -1) {
    teams[idx] = { ...teams[idx], ...teamData };
  } else {
    teams.push(teamData);
  }
  writeJSON(TEAMS_FILE, teams);
  return teamData;
}

function saveTeams(allTeams) {
  teamsCache = allTeams;
  writeJSON(TEAMS_FILE, allTeams);
  return teamsCache;
}

function deleteTeam(id) {
  let teams = getTeams();
  teams = teams.filter(t => t.id.toLowerCase() !== id.toLowerCase());
  teamsCache = teams;
  writeJSON(TEAMS_FILE, teams);
  return true;
}

function resetAllTeams() {
  const seeded = generate80Teams();
  teamsCache = seeded;
  writeJSON(TEAMS_FILE, seeded);
  return seeded;
}

// Question Methods
function getQuestions() {
  if (!questionsCache) initDB();
  return questionsCache;
}

function getQuestionById(id) {
  const qList = getQuestions();
  return qList.find(q => String(q.id) === String(id));
}

function saveQuestion(questionData) {
  const qList = getQuestions();
  const idx = qList.findIndex(q => String(q.id) === String(questionData.id));
  if (idx !== -1) {
    qList[idx] = { ...qList[idx], ...questionData };
  } else {
    // Generate new ID if not present
    if (!questionData.id) {
      const maxId = qList.reduce((max, q) => Math.max(max, Number(q.id) || 0), 0);
      questionData.id = maxId + 1;
    }
    qList.push(questionData);
  }
  writeJSON(QUESTIONS_FILE, qList);
  return questionData;
}

function deleteQuestion(id) {
  let qList = getQuestions();
  qList = qList.filter(q => String(q.id) !== String(id));
  questionsCache = qList;
  writeJSON(QUESTIONS_FILE, qList);
  return true;
}

// Settings Methods
function getSettings() {
  if (!settingsCache) initDB();
  return settingsCache;
}

function saveSettings(newSettings) {
  settingsCache = { ...getSettings(), ...newSettings };
  writeJSON(SETTINGS_FILE, settingsCache);
  return settingsCache;
}

// Submission Methods
function addSubmission(sub) {
  const subs = getSubmissions();
  subs.unshift(sub);
  if (subs.length > 5000) subs.length = 5000; // retain latest 5000
  submissionsCache = subs;
  writeJSON(SUBMISSIONS_FILE, subs);
  return sub;
}

function getSubmissions() {
  if (!submissionsCache) initDB();
  return submissionsCache;
}

// Initialize on load
initDB();

module.exports = {
  getTeams,
  getTeamById,
  saveTeam,
  saveTeams,
  deleteTeam,
  resetAllTeams,
  getQuestions,
  getQuestionById,
  saveQuestion,
  deleteQuestion,
  getSettings,
  saveSettings,
  addSubmission,
  getSubmissions
};
