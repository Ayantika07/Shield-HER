import { analyzeHarassmentMessage } from './src/services/analyzerService.js';

const testCases = [
  // Required Dangerous Threats from prompt
  { input: 'I will slap you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will kick you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will beat you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will hit you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will hurt you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will kill you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will find you and attack you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will physically harm you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will rape you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'I will come to your house and hurt you.', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'i will hurt your sister', expected: 'DANGEROUS / THREAT DETECTED' },
  { input: 'Send the money or I will leak your private photos', expected: 'DANGEROUS / THREAT DETECTED' },

  // Safe everyday / non-threats from prompt
  { input: 'Have a great day', expected: 'SAFE / LOW OBSERVABLE RISK' },
  { input: 'Good morning, hope you are doing well!', expected: 'SAFE / LOW OBSERVABLE RISK' },
  
  // Vulnerability expression / sender worried (NOT a sender threat)
  { input: 'I am worried someone might hurt me', expected: 'SAFE / LOW OBSERVABLE RISK' },
  { input: 'I am terrified someone might attack me on my way home', expected: 'SAFE / LOW OBSERVABLE RISK' },

  // Negated statements
  { input: 'I would never hurt you', expected: 'SAFE / LOW OBSERVABLE RISK' },
  { input: 'I will not hurt you, please trust me', expected: 'SAFE / LOW OBSERVABLE RISK' }
];

async function runTests() {
  console.log('--- RUNNING CYBER HARASSMENT DETECTOR TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const res = await analyzeHarassmentMessage(tc.input);
    const isPass = res.classification === tc.expected;
    if (isPass) {
      console.log(`[PASS] "${tc.input}" -> ${res.classification} (Score: ${res.riskScore}, Matches: ${res.matchedPhrases.length})`);
      passed++;
    } else {
      console.error(`[FAIL] "${tc.input}" -> Expected: ${tc.expected}, Got: ${res.classification} (Score: ${res.riskScore})`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);
  if (failed > 0) process.exit(1);
}

runTests();
