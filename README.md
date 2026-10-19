# react-native-web: a parent is never asked to take a move onto a sibling of the responder

A press starts on `A` and `A` becomes the responder. The pointer then moves onto `B`, a sibling of `A`. The parent of `A` and `B` has `onMoveShouldSetResponder` (here through `PanResponder`), but it is never called, so it can never take the gesture.

## Run

```sh
npm install
npm run unit   # getLowestCommonAncestor on hand-made paths
node fuzz.cjs  # getLowestCommonAncestor against a reference, 40,000 random pairs
npm run e2e    # the gesture in Chrome (CHROME_PATH, default /usr/bin/google-chrome-stable)
npm run fix    # apply the fix to node_modules, then run the three again
npm run unfix  # back to react-native-web as published
```

## Expected

```
drag from A onto B: parent asked
  A granted
  parent asked, dx=40
  A terminated
  parent granted
  parent released, dx=120
```

## Actual (react-native-web 0.21.4)

```
drag from A onto B: parent NEVER asked
  A granted
```

```
FAIL getLowestCommonAncestor([1,0], [2,0]) = null, expected 0
FAIL getLowestCommonAncestor([1,3,0], [2,0]) = null, expected 0
```

```
24985/40000 pairs agree with the reference
```

## Why

On a move, `ResponderSystem` keeps the part of the event path from the lowest common ancestor of the current responder and the target. When `getLowestCommonAncestor` returns `null`, nobody is asked.

`getLowestCommonAncestor` in `src/modules/useResponderEvents/utils.js` walks both paths in lockstep:

```js
while (depth--) {
  if (itemA === itemB) {
    return itemA;
  }
  itemA = pathA[indexA++];
  itemB = pathB[indexB++];
}
```

`itemA` already holds `pathA[indexA]`, so the post-increment reads the same pair again on the first step. The loop runs `depth` times but checks only `depth - 1` pairs, and never the last one: the topmost node of the walk. When that node is the only common ancestor, as for two siblings under one parent, it returns `null`.

## Fix

```js
  itemA = pathA[++indexA];
  itemB = pathB[++indexB];
```

With it, `unit`, `fuzz.cjs` (40,000/40,000) and `e2e` pass.

## Versions

- react-native-web 0.21.4 (also on `master` and `0.22-dev`)
- react 19.2.3, Chrome
