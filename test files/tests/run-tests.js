#!/usr/bin/env node
/**
 * Test Runner CLI
 * 
 * Simple command-line interface for running integration tests.
 * This provides a more user-friendly way to run tests without remembering exact commands.
 */

const { spawn } = require('child_process');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printBanner() {
  console.log('\n' + COLORS.cyan + COLORS.bright + '╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║     PM AUTOMATION PLATFORM - INTEGRATION TEST RUNNER                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝' + COLORS.reset + '\n');
}

function printMenu() {
  console.log(COLORS.bright + 'Available Test Commands:' + COLORS.reset + '\n');
  
  console.log(COLORS.green + '  1.' + COLORS.reset + ' Run All Tests');
  console.log(COLORS.blue + '     pnpm test:integration' + COLORS.reset);
  
  console.log(COLORS.green + '\n  2.' + COLORS.reset + ' Run All Tests (Keep Confluence Pages)');
  console.log(COLORS.blue + '     pnpm test:integration:skip-cleanup' + COLORS.reset);
  
  console.log(COLORS.green + '\n  3.' + COLORS.reset + ' Health Check');
  console.log(COLORS.blue + '     pnpm test:health' + COLORS.reset);
  
  console.log(COLORS.green + '\n  4.' + COLORS.reset + ' Email Tests');
  console.log(COLORS.blue + '     pnpm test:email' + COLORS.reset);
  
  console.log(COLORS.green + '\n  5.' + COLORS.reset + ' Slack Tests');
  console.log(COLORS.blue + '     pnpm test:slack' + COLORS.reset);
  
  console.log(COLORS.green + '\n  6.' + COLORS.reset + ' Confluence Tests');
  console.log(COLORS.blue + '     pnpm test:confluence' + COLORS.reset);
  
  console.log(COLORS.green + '\n  7.' + COLORS.reset + ' Run Specific Test');
  console.log(COLORS.blue + '     npx tsx tests/integration-tests.ts --test=<testName>' + COLORS.reset);
  
  console.log('\n' + COLORS.yellow + 'Available Test Names:' + COLORS.reset);
  console.log('  Email: testHealthCheck, testStakeholderEmail, testSprintSummaryEmail');
  console.log('  Slack: testTaskCompletedNotification, testAnalysisReadyNotification');
  console.log('  Confluence GTM: testCreateGTMPage, testMinimalGTMPage');
  console.log('  Confluence Meetings: testSprintPlanningNotes, testStakeholderReviewNotes');
  
  console.log('\n' + COLORS.bright + 'Prerequisites:' + COLORS.reset);
  console.log('  ✓ Development server running on localhost:3000');
  console.log('  ✓ .env.local configured with all credentials');
  console.log('  ✓ All integrations healthy (run health check first)');
  
  console.log('\n');
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..'),
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  printBanner();

  const args = process.argv.slice(2);

  // If no arguments, show menu
  if (args.length === 0) {
    printMenu();
    console.log(COLORS.yellow + 'Tip: Run "node tests/run-tests.js --help" for more options' + COLORS.reset + '\n');
    return;
  }

  // Parse arguments
  const command = args[0];

  try {
    switch (command) {
      case '--help':
      case '-h':
        printMenu();
        break;

      case 'all':
        console.log(COLORS.bright + '🧪 Running all integration tests...\n' + COLORS.reset);
        await runCommand('pnpm', ['test:integration']);
        break;

      case 'all-keep':
        console.log(COLORS.bright + '🧪 Running all tests (keeping Confluence pages)...\n' + COLORS.reset);
        await runCommand('pnpm', ['test:integration:skip-cleanup']);
        break;

      case 'health':
        console.log(COLORS.bright + '🏥 Running health check...\n' + COLORS.reset);
        await runCommand('pnpm', ['test:health']);
        break;

      case 'email':
        console.log(COLORS.bright + '📧 Running email tests...\n' + COLORS.reset);
        await runCommand('pnpm', ['test:email']);
        break;

      case 'slack':
        console.log(COLORS.bright + '💬 Running Slack tests...\n' + COLORS.reset);
        await runCommand('pnpm', ['test:slack']);
        break;

      case 'confluence':
        console.log(COLORS.bright + '📄 Running Confluence tests...\n' + COLORS.reset);
        await runCommand('pnpm', ['test:confluence']);
        break;

      case 'specific':
        if (args.length < 2) {
          console.error(COLORS.yellow + '❌ Please specify a test name: node tests/run-tests.js specific <testName>' + COLORS.reset);
          process.exit(1);
        }
        console.log(COLORS.bright + `🎯 Running test: ${args[1]}...\n` + COLORS.reset);
        await runCommand('npx', ['tsx', 'tests/integration-tests.ts', `--test=${args[1]}`]);
        break;

      default:
        console.error(COLORS.yellow + `❌ Unknown command: ${command}` + COLORS.reset + '\n');
        printMenu();
        process.exit(1);
    }

    console.log('\n' + COLORS.green + COLORS.bright + '✅ Test run completed!' + COLORS.reset + '\n');
  } catch (error) {
    console.error('\n' + COLORS.yellow + COLORS.bright + '❌ Test run failed!' + COLORS.reset);
    console.error(error.message + '\n');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runCommand };
