const assert = require('node:assert/strict');
const { windArrowAngleToDirection } = require('./windDirection');

const cases = [
  { angle: 0, expected: 'S' },
  { angle: 165, expected: 'NNW' },
  { angle: 180, expected: 'N' },
  { angle: 345, expected: 'SSE' },
  { angle: -15, expected: 'SSE' },
];

for (const { angle, expected } of cases) {
  assert.equal(
    windArrowAngleToDirection(angle),
    expected,
    `Expected arrow angle ${angle} to represent wind from ${expected}`
  );
}

console.log(`Wind direction conversion passed ${cases.length} regression cases.`);
