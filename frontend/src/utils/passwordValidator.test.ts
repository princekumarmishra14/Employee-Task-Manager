/**
 * Self-executing password validation test suite.
 * Run directly with: npx ts-node frontend/src/utils/passwordValidator.test.ts
 */

import { validatePassword } from "./passwordValidator";

interface TestCase {
  password: string;
  expected: boolean;
  desc: string;
}

const TEST_CASES: TestCase[] = [
  { password: "", expected: false, desc: "Empty password" },
  { password: "        ", expected: false, desc: "All spaces" },
  { password: "Password", expected: false, desc: "No number and no special character" },
  { password: "PASSWORD1", expected: false, desc: "No lowercase and no special character" },
  { password: "password1", expected: false, desc: "No uppercase and no special character" },
  { password: "Password1", expected: false, desc: "No special character" },
  { password: "Password@", expected: false, desc: "No number" },
  { password: "Password1@", expected: true, desc: "Exactly 8 valid characters (Passes)" },
  { password: "Pass word1@", expected: false, desc: "Valid but contains a space" },
  { password: "P@ssw0rd", expected: true, desc: "Exactly 8 characters with upper, lower, digit, special (Passes)" },
  { password: "P@ssw0rd123456789", expected: true, desc: "Long valid password (Passes)" },
  { password: "Short1@", expected: false, desc: "Valid conditions but only 7 characters long" },
];

function runTests() {
  console.log("==================================================");
  console.log("RUNNING PASSWORD VALIDATION UNIT TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  TEST_CASES.forEach((tc, idx) => {
    const res = validatePassword(tc.password);
    const resultStatus = res.isValid === tc.expected;

    if (resultStatus) {
      console.log(`[PASS] Test #${idx + 1}: "${tc.desc}" (Input: "${tc.password}")`);
      passed++;
    } else {
      console.error(`[FAIL] Test #${idx + 1}: "${tc.desc}" (Input: "${tc.password}")`);
      console.error(`Expected: ${tc.expected}, Got: ${res.isValid}`);
      failed++;
    }
  });

  console.log("--------------------------------------------------");
  console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

// Execute tests
runTests();
