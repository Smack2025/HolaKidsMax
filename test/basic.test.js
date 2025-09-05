const test = require('node:test');
const assert = require('node:assert/strict');

test('adds 1 + 1 to equal 2', () => {
  assert.strictEqual(1 + 1, 2);
});
