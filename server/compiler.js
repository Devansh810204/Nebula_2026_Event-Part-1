/**
 * compiler.js
 * Multi-language Code Execution & Evaluation Engine
 * Supports Python, C++, C, and Java with test case validation.
 * Uses Paiza sandbox API with local Python execution fallback.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Normalizes text for comparison (trims line whitespace, converts CRLF to LF)
 */
function normalizeOutput(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Executes code using Paiza.io Runner API
 */
async function executeWithPaiza(language, code, stdin = '') {
  let paizaLang = 'python';
  const l = (language || 'python').toLowerCase();
  if (l === 'python' || l === 'python3' || l === 'py') paizaLang = 'python';
  else if (l === 'cpp' || l === 'c++') paizaLang = 'cpp';
  else if (l === 'c') paizaLang = 'c';
  else if (l === 'java') paizaLang = 'java';

  let cleanCode = code;
  if (paizaLang === 'java') {
    // Paiza requires class Main
    cleanCode = cleanCode.replace(/public\s+class\s+Solution/g, 'public class Main');
    cleanCode = cleanCode.replace(/class\s+Solution/g, 'class Main');
  }

  const startTime = Date.now();

  try {
    const createRes = await fetch('https://api.paiza.io/runners/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: cleanCode,
        language: paizaLang,
        input: stdin || '',
        longpoll: true,
        api_key: 'guest'
      })
    });

    if (!createRes.ok) {
      throw new Error(`Paiza API returned HTTP ${createRes.status}`);
    }

    const createData = await createRes.json();
    const runnerId = createData.id;
    if (!runnerId) throw new Error('No runner ID returned');

    // Poll for completion (max 10 seconds)
    let details = null;
    const maxPolls = 25;
    for (let i = 0; i < maxPolls; i++) {
      const detRes = await fetch(`https://api.paiza.io/runners/get_details?id=${runnerId}&api_key=guest`);
      if (detRes.ok) {
        details = await detRes.json();
        if (details.status === 'completed') break;
      }
      await new Promise(r => setTimeout(r, 400));
    }

    const duration = Date.now() - startTime;

    if (!details || details.status !== 'completed') {
      return {
        success: false,
        isCompilationError: false,
        stdout: '',
        stderr: 'Execution timed out (exceeded 10 seconds)',
        executionTimeMs: duration
      };
    }

    // Check compilation errors
    if (details.build_result === 'failure' || details.build_stderr) {
      return {
        success: false,
        isCompilationError: true,
        stdout: '',
        stderr: details.build_stderr || 'Compilation error',
        executionTimeMs: duration
      };
    }

    const stdout = details.stdout || '';
    const stderr = details.stderr || '';
    const isSuccess = details.result === 'success';

    return {
      success: isSuccess,
      isCompilationError: false,
      stdout,
      stderr,
      executionTimeMs: duration
    };
  } catch (err) {
    console.warn(`[Compiler] Paiza execution warning (${err.message}). Trying local fallback...`);
    return executeLocalFallback(paizaLang, code, stdin);
  }
}

/**
 * Local Fallback Runner (for Python or local compilers)
 */
function executeLocalFallback(language, code, stdin = '') {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const uniqueId = `nebula_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    if (language === 'python') {
      const scriptPath = path.join(tmpDir, `${uniqueId}.py`);
      fs.writeFileSync(scriptPath, code, 'utf8');

      const proc = exec(`python "${scriptPath}"`, { timeout: 8000 }, (error, stdout, stderr) => {
        try { fs.unlinkSync(scriptPath); } catch (e) {}
        const duration = Date.now() - startTime;
        if (error && error.killed) {
          return resolve({
            success: false,
            isCompilationError: false,
            stdout: '',
            stderr: 'Time Limit Exceeded (8 seconds)',
            executionTimeMs: duration
          });
        }
        resolve({
          success: !error,
          isCompilationError: false,
          stdout: stdout || '',
          stderr: stderr || (error ? error.message : ''),
          executionTimeMs: duration
        });
      });

      if (stdin && proc.stdin) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }
    } else {
      resolve({
        success: false,
        isCompilationError: true,
        stdout: '',
        stderr: 'Code runner service is temporarily busy. Please retry.',
        executionTimeMs: Date.now() - startTime
      });
    }
  });
}

/**
 * Runs code against custom or sample input (for "Run Sample Test" button)
 */
async function runCustomCode(language, code, stdin) {
  // Use local execution for Python if fast, else Paiza
  if (language.toLowerCase() === 'python') {
    return await executeLocalFallback('python', code, stdin);
  }
  return await executeWithPaiza(language, code, stdin);
}

/**
 * Evaluates code against multiple test cases (for "Submit Solution" button)
 */
async function evaluateSubmission(language, code, testCases) {
  const results = [];
  let allPassed = true;
  let compilationError = null;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let execResult;

    if (language.toLowerCase() === 'python') {
      execResult = await executeLocalFallback('python', code, tc.input);
    } else {
      execResult = await executeWithPaiza(language, code, tc.input);
    }

    if (execResult.isCompilationError) {
      compilationError = execResult.stderr;
      allPassed = false;
      results.push({
        testCaseIndex: i + 1,
        status: 'COMPILATION_ERROR',
        input: tc.input,
        expected: tc.output,
        actual: '',
        error: execResult.stderr,
        executionTimeMs: execResult.executionTimeMs
      });
      break;
    }

    const normActual = normalizeOutput(execResult.stdout);
    const normExpected = normalizeOutput(tc.output);

    let status = 'PASSED';
    if (execResult.stderr && !execResult.success) {
      status = 'RUNTIME_ERROR';
      allPassed = false;
    } else if (normActual !== normExpected) {
      status = 'WRONG_ANSWER';
      allPassed = false;
    }

    results.push({
      testCaseIndex: i + 1,
      status,
      input: tc.input,
      expected: tc.output,
      actual: execResult.stdout,
      error: execResult.stderr || null,
      executionTimeMs: execResult.executionTimeMs
    });
  }

  const passedCount = results.filter(r => r.status === 'PASSED').length;

  return {
    allPassed,
    passedCount,
    totalCount: testCases.length,
    results,
    compilationError
  };
}

module.exports = {
  executeWithPaiza,
  runCustomCode,
  evaluateSubmission,
  normalizeOutput
};
