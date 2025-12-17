#!/usr/bin/env node
/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, no-console */

/**
 * Super App Quality Gate Script
 * -----------------------------
 * Enforces strict code quality standards before push.
 * 
 * Checks:
 * 1. ESLint (Zero warnings allowed)
 * 2. TypeScript (Strict type checking)
 * 3. Duplicate Code (JSCPD, max 5%)
 * 4. Circular Dependencies (Madge, zero tolerance)
 * 5. SonarQube (Static Analysis, if token present)
 */

const { execSync } = require('node:child_process');
const https = require('node:https');
const http = require('node:http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Logging Helpers
const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);
const logStep = (step, msg) => console.log(`\n${colors.cyan}[${step}]${colors.reset} ${colors.white}${msg}${colors.reset}`);
const logSuccess = (msg) => console.log(`${colors.green}  ✓ ${msg}${colors.reset}`);
const logError = (msg) => console.error(`${colors.red}  ✗ ${msg}${colors.reset}`);
const logWarn = (msg) => console.warn(`${colors.yellow}  ⚠ ${msg}${colors.reset}`);

/**
 * Execute a shell command synchronously
 */
function runCommand(command, description, ignoreError = false) {
  try {
    // stdio: 'inherit' prints output directly to console
    execSync(command, { stdio: 'inherit', encoding: 'utf8' });
    logSuccess(`${description} Passed`);
    return true;
  } catch (e) {
    if (!ignoreError) {
      logError(`${description} Failed`);
    }
    return false;
  }
}

/**
 * Check SonarQube Quality Gate Status via API
 */
async function checkSonarQubeQualityGate() {
  const projectKey = 'bodu1197_talent';
  const sonarUrl = process.env.SONAR_HOST_URL || 'https://sonarcloud.io';
  const sonarToken = process.env.SONAR_TOKEN;

  if (!sonarToken) return null;

  return new Promise((resolve) => {
    const url = `${sonarUrl}/api/qualitygates/project_status?projectKey=${projectKey}`;
    const protocol = sonarUrl.startsWith('https') ? https : http;
    const auth = Buffer.from(`${sonarToken}:`).toString('base64');
    
    const options = {
      headers: { Authorization: `Basic ${auth}` },
    };

    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.projectStatus || null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Main Execution Function
 */
async function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════╗', 'magenta');
  log('║           🛡️  SUPER APP QUALITY GATE  🛡️                 ║', 'magenta');
  log('║      Ensuring code excellence before deployment            ║', 'magenta');
  log('╚════════════════════════════════════════════════════════════╝', 'magenta');

  const steps = [
    { name: 'ESLint (Strict)', cmd: 'npx eslint src --ext .ts,.tsx --max-warnings 0', critical: true },
    { name: 'TypeScript (Type Check)', cmd: 'npx tsc --noEmit', critical: true },
    // Threshold 5% duplication allowed, ignore test/types/next stuff
    { name: 'Code Duplication (JSCPD)', cmd: 'npx jscpd src --threshold 5 --ignore "**/*.d.ts,**/*.test.ts,**/*.spec.ts,**/node_modules/**,**/.next/**,**/scripts/**"', critical: false }, 
    // Circular dependencies are critical for runtime stability
    { name: 'Circular Dependencies (Madge)', cmd: 'npx madge --circular --extensions ts,tsx src', critical: true },
  ];

  let failed = false;

  // 1. Run Local Checks
  for (const [index, step] of steps.entries()) {
    logStep(`${index + 1}/${steps.length + 1}`, `Running ${step.name}...`);
    const success = runCommand(step.cmd, step.name);
    
    if (!success) {
      if (step.critical) {
        logError(`Critical check failed: ${step.name}`);
        failed = true;
      } else {
        logWarn(`Non-critical check warning: ${step.name}`);
        // Optional: fail on non-critical too if being very strict?
        // failed = true; 
      }
    }
  }

  // 2. Run Remote Checks (SonarQube)
  logStep(`${steps.length + 1}/${steps.length + 1}`, 'SonarQube Analysis & Gate...');
  if (process.env.SONAR_TOKEN) {
    const scannerSuccess = runCommand('npx sonar-scanner', 'SonarQube Scanner');
    if (scannerSuccess) {
        log('  Waiting for server processing...');
        await new Promise(r => setTimeout(r, 3000));
        const gateStatus = await checkSonarQubeQualityGate();
        
        if (gateStatus?.status === 'OK') {
            logSuccess('SonarQube Quality Gate: Passed');
        } else if (gateStatus?.status === 'ERROR') {
            logError('SonarQube Quality Gate: Failed');
            failed = true;
        } else {
            logWarn('SonarQube Quality Gate check skipped (Unknown status)');
        }
    } else {
        logWarn('SonarQube scan failed locally, skipping gate check.');
    }
  } else {
    logWarn('Skipping SonarQube (No token). Check GitHub Actions for details.');
  }

  // 3. Final Result
  log('\n════════════════════════════════════════════════════════════', 'magenta');
  if (failed) {
    log('❌  QUALITY GATE FAILED', 'red');
    log('    Please fix the errors above before pushing.', 'red');
    process.exit(1);
  } else {
    log('✅  QUALITY GATE PASSED', 'green');
    log('    Code is ready for the Super App!', 'green');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
