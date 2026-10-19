import { readFileSync, writeFileSync } from "node:fs";

// The fix: advance the index before reading, so the walk does not read
// the first pair twice and miss the last (topmost) one.
const files = [
  "node_modules/react-native-web/dist/modules/useResponderEvents/utils.js",
  "node_modules/react-native-web/dist/cjs/modules/useResponderEvents/utils.js",
];
const revert = process.argv.includes("--revert");
const [from, to] = revert
  ? [["pathA[++indexA]", "pathA[indexA++]"], ["pathB[++indexB]", "pathB[indexB++]"]]
  : [["pathA[indexA++]", "pathA[++indexA]"], ["pathB[indexB++]", "pathB[++indexB]"]];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  writeFileSync(file, source.replace(from[0], from[1]).replace(to[0], to[1]));
}
console.log(revert ? "reverted to react-native-web as published" : "applied the fix to node_modules");
