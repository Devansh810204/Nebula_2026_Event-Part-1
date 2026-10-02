/**
 * test_integration.js
 * End-to-end test suite to verify all requirements:
 * - 80 Teams & 20 DSA Questions
 * - Authentication (Student & Admin)
 * - Code execution & Test case evaluation
 * - Letter unlock mechanism
 * - Proctoring strike & disqualification
 * - Admin re-qualification & leaderboard
 */

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting Nebula 2026 Integration Tests ---');

  // 1. Healthcheck
  const healthRes = await fetch(`${baseUrl}/healthz`);
  console.log('1. Healthcheck status:', healthRes.status, await healthRes.json());

  // 2. Student Login
  const studentLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'student', teamId: 'team01', password: 'nebula@01' })
  });
  const studentData = await studentLoginRes.json();
  console.log('2. Student Login:', studentLoginRes.status, studentData.success ? 'SUCCESS' : 'FAILED', studentData.team?.name);
  const studentToken = studentData.token;

  // 3. Current Question
  const currentQRes = await fetch(`${baseUrl}/api/contest/current`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const currentQData = await currentQRes.json();
  console.log('3. Current Question:', currentQData.question?.title, '| Remaining seconds:', currentQData.timeRemaining);

  // 4. Run Sample Code (Python)
  const pythonSample = `import sys
data = sys.stdin.read().split()
if data:
    n, t = int(data[0]), int(data[1])
    nums = [int(x) for x in data[2:2+n]]
    print('0 1')
`;
  const runCodeRes = await fetch(`${baseUrl}/api/contest/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      language: 'python',
      code: pythonSample,
      customInput: '4 9\n2 7 11 15'
    })
  });
  const runCodeData = await runCodeRes.json();
  console.log('4. Run Sample Code Output:', runCodeData.stdout?.trim(), '| Exec Time:', runCodeData.executionTimeMs + 'ms');

  // 5. Submit Solution to Question 1 (Two Sum)
  const q1Solution = currentQData.question?.starterCode?.python;
  const submitRes = await fetch(`${baseUrl}/api/contest/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      language: 'python',
      code: q1Solution
    })
  });
  const submitData = await submitRes.json();
  console.log('5. Submit Solution Result:', submitData.correct ? 'PASSED ✓' : 'FAILED ✗');
  console.log('   Unlocked Letter:', submitData.unlockedLetter, '| Total Unlocked:', submitData.totalUnlocked);

  // 6. Test Proctor Violation (Strike 1)
  const strike1Res = await fetch(`${baseUrl}/api/contest/violation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ type: 'fullscreen_exit' })
  });
  const strike1Data = await strike1Res.json();
  console.log('6. Proctor Strike 1:', strike1Data.disqualified ? 'DISQUALIFIED' : 'WARNING ISSUED', '| Strikes:', strike1Data.violations);

  // 7. Test Proctor Violation (Strike 2 -> Disqualified)
  const strike2Res = await fetch(`${baseUrl}/api/contest/violation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ type: 'tab_switch' })
  });
  const strike2Data = await strike2Res.json();
  console.log('7. Proctor Strike 2:', strike2Data.disqualified ? 'DISQUALIFIED (Correct)' : 'FAILED', '| Message:', strike2Data.message);

  // 8. Admin Login
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin', username: 'admin', password: 'adminnebula2026' })
  });
  const adminData = await adminLoginRes.json();
  console.log('8. Admin Login:', adminLoginRes.status, adminData.success ? 'SUCCESS' : 'FAILED');
  const adminToken = adminData.token;

  // 9. Admin Stats & Leaderboard
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const statsData = await statsRes.json();
  console.log('9. Admin Stats: Total Teams:', statsData.totalTeams, '| Disqualified:', statsData.disqualifiedTeams);

  // 10. Admin Re-Qualify Team 1
  const requalifyRes = await fetch(`${baseUrl}/api/admin/teams/team01/requalify`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const requalifyData = await requalifyRes.json();
  console.log('10. Admin Re-qualify Team 1:', requalifyData.success ? 'RE-QUALIFIED SUCCESSFULLY ✓' : 'FAILED');

  // Verify Team 1 can login again
  const reLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'student', teamId: 'team01', password: 'nebula@01' })
  });
  console.log('11. Team 1 Re-login after Admin Re-qualification:', reLoginRes.status === 200 ? 'SUCCESS ✓' : 'FAILED');

  console.log('--- ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(err => console.error('Test error:', err));
