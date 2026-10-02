/**
 * login.js
 * Handles authentication for students (teams) and administrators.
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabStudent = document.getElementById('tab-student');
  const tabAdmin = document.getElementById('tab-admin');
  const studentForm = document.getElementById('student-form');
  const adminForm = document.getElementById('admin-form');
  const alertBox = document.getElementById('alert-box');

  let currentTab = 'student';

  function showAlert(message, isSuccess = false) {
    alertBox.textContent = message;
    alertBox.className = `alert-box ${isSuccess ? 'alert-success' : 'alert-danger'}`;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    alertBox.style.display = 'none';
  }

  // Tab switching
  tabStudent.addEventListener('click', () => {
    currentTab = 'student';
    tabStudent.classList.add('active');
    tabAdmin.classList.remove('active');
    studentForm.style.display = 'block';
    adminForm.style.display = 'none';
    hideAlert();
  });

  tabAdmin.addEventListener('click', () => {
    currentTab = 'admin';
    tabAdmin.classList.add('active');
    tabStudent.classList.remove('active');
    adminForm.style.display = 'block';
    studentForm.style.display = 'none';
    hideAlert();
  });

  // Student Login Submit
  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const teamId = document.getElementById('student-team-id').value.trim();
    const password = document.getElementById('student-password').value.trim();

    if (!teamId || !password) {
      showAlert('Please enter both Team ID and Password.');
      return;
    }

    const submitBtn = studentForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying Credentials...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'student', teamId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store team info
      localStorage.setItem('nebula_token', data.token);
      localStorage.setItem('nebula_team_id', data.team.id);
      localStorage.setItem('nebula_team_name', data.team.name);

      showAlert('Login successful! Entering contest arena...', true);

      setTimeout(() => {
        window.location.href = '/contest';
      }, 700);
    } catch (err) {
      showAlert(err.message);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Admin Login Submit
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!username || !password) {
      showAlert('Please enter admin username and password.');
      return;
    }

    const submitBtn = adminForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Authenticating Admin...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      localStorage.setItem('nebula_admin_token', data.token);
      showAlert('Admin authentication verified! Redirecting...', true);

      setTimeout(() => {
        window.location.href = '/admin';
      }, 700);
    } catch (err) {
      showAlert(err.message);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
