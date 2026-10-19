const {
  getLowestCommonAncestor,
} = require("react-native-web/dist/cjs/modules/useResponderEvents/utils.js");

// Responder id paths, deepest first. 0 is the root.
const cases = [
  { a: [1, 0], b: [2, 0], expected: 0 },
  { a: [1, 3, 0], b: [2, 3, 0], expected: 3 },
  { a: [1, 3, 0], b: [2, 0], expected: 0 },
  { a: [1, 0], b: [1, 0], expected: 1 },
  { a: [1, 3, 0], b: [3, 0], expected: 3 },
];

let failed = 0;
for (const { a, b, expected } of cases) {
  const actual = getLowestCommonAncestor(a, b);
  const ok = actual === expected;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "ok  " : "FAIL"} getLowestCommonAncestor(${JSON.stringify(a)}, ${JSON.stringify(b)}) = ${actual}, expected ${expected}`,
  );
}
process.exitCode = failed === 0 ? 0 : 1;
