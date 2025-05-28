// js/tests/utils.test.js
console.log("Running tests for js/modules/utils.js: calculateAreaSurcharge...");

function runTest(testName, actual, expected) {
    if (actual === expected) {
        console.log(`✅ PASS: ${testName}`);
    } else {
        console.error(`❌ FAIL: ${testName} - Expected ${expected}, but got ${actual}`);
    }
}

// Test cases for calculateAreaSurcharge
// Assuming UtilsModule is available globally when run via test_runner.html

// Test 1: Area less than standard
runTest(
    "calculateAreaSurcharge: Area less than standard",
    window.UtilsModule.calculateAreaSurcharge(10000, 15000, 0.1),
    0
);

// Test 2: Area equal to standard
runTest(
    "calculateAreaSurcharge: Area equal to standard",
    window.UtilsModule.calculateAreaSurcharge(15000, 15000, 0.1),
    0
);

// Test 3: Area greater than standard
runTest(
    "calculateAreaSurcharge: Area greater than standard, positive rate",
    window.UtilsModule.calculateAreaSurcharge(20000, 15000, 0.1), // (20000 - 15000) * 0.1 = 5000 * 0.1 = 500
    500
);

// Test 4: Area greater than standard, rounding
runTest(
    "calculateAreaSurcharge: Area greater than standard, needs rounding",
    window.UtilsModule.calculateAreaSurcharge(16000, 15000, 0.123), // (1000 * 0.123) = 123
    123
);

// Test 5: Zero rate
 runTest(
    "calculateAreaSurcharge: Area greater, zero rate",
    window.UtilsModule.calculateAreaSurcharge(20000, 15000, 0),
    0
);

console.log("Tests for calculateAreaSurcharge complete.");
