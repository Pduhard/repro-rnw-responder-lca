const {
  getLowestCommonAncestor,
} = require("react-native-web/dist/cjs/modules/useResponderEvents/utils.js");

// Random trees; a path is a node and its ancestors, deepest first, as the
// responder system builds it. The reference answer is the first node of A's
// path that is also on B's path.
// Seeded, so the counts below are the same on every run.
let seed = 1;
function random() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}

function randomTree(size) {
  const parent = [null];
  for (let id = 1; id < size; id += 1) parent.push(Math.floor(random() * id));
  return parent;
}
function pathOf(parent, id) {
  const path = [];
  for (let node = id; node != null; node = parent[node]) path.push(node);
  return path;
}

let failed = 0;
let checked = 0;
for (let t = 0; t < 2000; t += 1) {
  const parent = randomTree(2 + Math.floor(random() * 30));
  for (let p = 0; p < 20; p += 1) {
    const a = pathOf(parent, Math.floor(random() * parent.length));
    const b = pathOf(parent, Math.floor(random() * parent.length));
    const expected = a.find((id) => b.includes(id));
    const actual = getLowestCommonAncestor(a, b);
    checked += 1;
    if (actual !== expected) {
      failed += 1;
      if (failed <= 3) console.log(`FAIL ${JSON.stringify(a)} ${JSON.stringify(b)}: ${actual}, expected ${expected}`);
    }
  }
}
console.log(`${checked - failed}/${checked} pairs agree with the reference`);
process.exitCode = failed === 0 ? 0 : 1;
