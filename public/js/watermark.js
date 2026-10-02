/**
 * watermark.js
 * Renders high-security, dynamic repeating watermarks of Team Name & Nebula 2026
 * across the background and panels to prevent photography and screen leaks.
 */

function setupWatermark(teamName) {
  const existing = document.getElementById('nebula-watermark-overlay');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'nebula-watermark-overlay';
  container.className = 'watermark-container';

  // 1. Center Nebula Logo Watermark
  const logoMark = document.createElement('div');
  logoMark.className = 'watermark-logo-center';
  container.appendChild(logoMark);

  // 2. Tiled Diagonal Team Name Watermark
  const patternMark = document.createElement('div');
  patternMark.className = 'watermark-team-pattern';

  const label = teamName ? `${teamName.toUpperCase()} • NEBULA 2026` : 'NEBULA 2026 • CODING CHALLENGE';
  
  // Fill the grid
  const totalTiles = 120;
  for (let i = 0; i < totalTiles; i++) {
    const item = document.createElement('div');
    item.className = 'watermark-team-item';
    item.textContent = label;
    patternMark.appendChild(item);
  }

  container.appendChild(patternMark);
  document.body.prepend(container);
}

// Auto-run if team name in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedTeam = localStorage.getItem('nebula_team_name');
  if (savedTeam) {
    setupWatermark(savedTeam);
  } else {
    setupWatermark('NEBULA 2026');
  }
});
